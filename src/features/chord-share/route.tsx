import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "@iconify/react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import PlaybackBar from "../../components/PlaybackBar";
import VolumeControl from "../../components/VolumeControl";
import { useMetronome } from "../../contexts/MetronomeContext";
import { useWakeLock } from "../../hooks/useWakeLock";
import { ChordSelectModal } from "./ChordSelectModal";
import { SortableChord } from "./SortableChord";
import {
  MetronomeSettingsModal,
  NOTE_VALUE_OPTIONS,
  type NoteValue,
} from "./MetronomeSettingsModal";
import { PianoRoll } from "./PianoRoll";
import { SheetMusic } from "./SheetMusic";
import { ChordShareProvider, useChordShare } from "./ChordShareContext";
import ChordShareToolbar from "./ChordShareToolbar";
import {
  INITIAL_CHORDS,
  buildChordVoicing,
  convertChordToAccidental,
  isValidChordNotes,
  isValidNote,
  parseChord,
  transposeChord,
  type VoicingType,
} from "./constants";

// Web Audio look-ahead スケジューラの定数
// SCHEDULE_AHEAD_SEC: 現在時刻からこの秒数先までのノートを先回りでスケジュールする
// SCHEDULER_LOOKAHEAD_MS: スケジューラ tick を回す間隔（ミリ秒）
const SCHEDULE_AHEAD_SEC = 0.1;
const SCHEDULER_LOOKAHEAD_MS = 25;

function makeChordId(): string {
  return `chord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeChordNotes(chords: string[], voicingType: VoicingType) {
  return chords.map((chord) => {
    const { root, type, bass } = parseChord(chord || "");
    if (!root) return [];
    return buildChordVoicing(root, type, bass, voicingType);
  });
}

function MasterVolumeBridge() {
  const { state } = useMetronome();
  const { sampler } = useChordShare();
  useEffect(() => {
    sampler.setMasterVolume(state.volume);
  }, [state.volume, sampler]);
  return null;
}

function ChordShareInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    sampler,
    activeChordIndex,
    setActiveChordIndex,
    accidentalDisplay,
    setAccidentalDisplay,
    voicingType,
  } = useChordShare();
  const initial = useMemo(() => {
    const textParam = searchParams.get("text");
    return textParam ? textParam.split(/[,→→>|\s]+/).filter(Boolean) : INITIAL_CHORDS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [chords, setChords] = useState<string[]>(initial);
  const [chordIds, setChordIds] = useState<string[]>(() => initial.map(() => makeChordId()));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [wakeLock, setWakeLock] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const isLoopRef = useRef(false);
  const [noteValue, setNoteValue] = useState<NoteValue>(1);
  const [metronomeModalOpen, setMetronomeModalOpen] = useState(false);
  const noteValueOption = NOTE_VALUE_OPTIONS.find((option) => option.value === noteValue);
  const noteValueLabel = noteValueOption?.label ?? `${noteValue}分音符`;

  // URL ?accidental= があれば初回マウント時にローカル設定へ反映
  useEffect(() => {
    const param = searchParams.get("accidental");
    if (param === "sharp" || param === "flat" || param === "auto") {
      setAccidentalDisplay(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 表示設定変化に合わせて既存コード列も異名変換
  useEffect(() => {
    setChords((prev) => prev.map((c) => convertChordToAccidental(c, accidentalDisplay)));
  }, [accidentalDisplay]);
  const { state: metronomeState, actions: metronomeActions } = useMetronome();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const schedulerIdRef = useRef<number | null>(null);
  const chordNotesRef = useRef<string[][]>([]);
  const beatSecRef = useRef(60 / 120);
  const measureSecRef = useRef(4 * (60 / 120));
  const pausedElapsedRef = useRef(0);
  // オーディオクロック基準の再生開始基点（経過秒 elapsed = sampler.getCurrentTime() - playStartAudioRef）
  const playStartAudioRef = useRef(0);
  // 次にスケジュールすべきノートのグローバル連番
  const nextNoteIdxRef = useRef(0);
  const endHandledRef = useRef(false);
  const lastNonZeroVolumeRef = useRef(metronomeState.volume > 0 ? metronomeState.volume : 0.3);

  useEffect(() => {
    if (metronomeState.volume > 0) {
      lastNonZeroVolumeRef.current = metronomeState.volume;
    }
  }, [metronomeState.volume]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("text", chords.join(","));
        next.delete("chord");
        next.set("accidental", accidentalDisplay);
        return next;
      },
      { replace: true },
    );
  }, [chords, accidentalDisplay, setSearchParams]);

  const chordNotes = useMemo(() => computeChordNotes(chords, voicingType), [chords, voicingType]);
  const hasInvalidChord = useMemo(
    () =>
      chords.some((chord) => {
        const { root, type, bass } = parseChord(chord);
        return !isValidNote(root) || !isValidNote(bass) || !isValidChordNotes(root, type);
      }),
    [chords],
  );
  useEffect(() => {
    chordNotesRef.current = chordNotes;
  }, [chordNotes]);
  const activeNotes = activeChordIndex >= 0 ? (chordNotes[activeChordIndex] ?? []) : [];

  const updateChord = useCallback((index: number, next: string) => {
    setChords((prev) => prev.map((c, i) => (i === index ? next : c)));
  }, []);

  const deleteChord = useCallback((index: number) => {
    setChords((prev) => prev.filter((_, i) => i !== index));
    setChordIds((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
  }, []);

  const addChord = useCallback(() => {
    setChords((prev) => [...prev, prev[prev.length - 1] ?? "C"]);
    setChordIds((prev) => [...prev, makeChordId()]);
  }, []);

  const removeLastChord = useCallback(() => {
    setChords((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    setChordIds((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const handleApplyChordsText = useCallback((text: string) => {
    const parsed = text
      .split(/[,→→>|\s]+/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (parsed.length === 0) return;
    setChords(parsed);
    setChordIds(parsed.map(() => makeChordId()));
  }, []);

  const stopScheduler = useCallback(() => {
    if (schedulerIdRef.current !== null) {
      window.clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    stopScheduler();
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, [stopScheduler]);

  const scheduleFrom = useCallback(
    (fromElapsed: number) => {
      const noteSec = beatSecRef.current;
      const measureSec = measureSecRef.current;
      const repeatCount = Math.max(1, Math.round(measureSec / noteSec));
      // ノート数・全体長は再生開始時点で固定（中身は発音時に chordNotesRef を読み直して移調反映）
      const chordCount = chordNotesRef.current.length;
      const totalNotes = chordCount * repeatCount;
      const totalSec = chordCount * measureSec;

      // コードが無い場合は何も鳴らさず終了（ループ時の scheduleFrom(0) 無限再帰を防ぐ）
      if (totalNotes === 0) {
        stopScheduler();
        setActiveChordIndex(-1);
        setIsPlaying(false);
        setIsPaused(false);
        pausedElapsedRef.current = 0;
        return;
      }

      // 経過秒をオーディオクロックに揃える（elapsed = sampler.getCurrentTime() - playStartAudioRef）
      playStartAudioRef.current = sampler.getCurrentTime() - fromElapsed;
      endHandledRef.current = false;

      // fromElapsed 以降にまだ鳴り終わっていない最初のノートを探す
      let startIdx = totalNotes;
      for (let g = 0; g < totalNotes; g++) {
        const groupIndex = Math.floor(g / repeatCount);
        const r = g % repeatCount;
        const noteEnd = groupIndex * measureSec + r * noteSec + noteSec;
        if (noteEnd > fromElapsed) {
          startIdx = g;
          break;
        }
      }
      nextNoteIdxRef.current = startIdx;

      // 途中シーク時は現在のコードを即ハイライト
      if (startIdx < totalNotes) {
        setActiveChordIndex(Math.floor(startIdx / repeatCount));
      }

      const tick = () => {
        const now = sampler.getCurrentTime();
        const horizon = now - playStartAudioRef.current + SCHEDULE_AHEAD_SEC;

        while (nextNoteIdxRef.current < totalNotes) {
          const g = nextNoteIdxRef.current;
          const groupIndex = Math.floor(g / repeatCount);
          const r = g % repeatCount;
          const noteStart = groupIndex * measureSec + r * noteSec;
          if (noteStart >= horizon) break;

          // オーディオクロックに対する正確な発音時刻（when は currentTime からの相対秒）
          const when = Math.max(0, playStartAudioRef.current + noteStart - sampler.getCurrentTime());

          // 小節（コード）の頭でハイライトを更新（視覚は setTimeout で近似）
          if (r === 0) {
            timeoutsRef.current.push(
              window.setTimeout(() => setActiveChordIndex(groupIndex), when * 1000),
            );
          }

          // 発音タイミングで chordNotesRef を読むことで、再生中の移調を反映
          const liveNotes = chordNotesRef.current[groupIndex] ?? [];
          liveNotes.forEach((note) => {
            sampler.triggerAttackRelease(note, noteSec, when);
          });
          nextNoteIdxRef.current++;
        }

        if (nextNoteIdxRef.current >= totalNotes && !endHandledRef.current) {
          const elapsed = sampler.getCurrentTime() - playStartAudioRef.current;
          if (elapsed >= totalSec) {
            endHandledRef.current = true;
            stopScheduler();
            if (isLoopRef.current) {
              sampler.stopAll();
              void sampler.resume();
              pausedElapsedRef.current = 0;
              setActiveChordIndex(-1);
              scheduleFrom(0);
            } else {
              setActiveChordIndex(-1);
              setIsPlaying(false);
              setIsPaused(false);
              pausedElapsedRef.current = 0;
            }
          }
        }
      };

      // interval を先に登録してから初回 tick を回す。
      // tick が完了分岐で stopScheduler() を呼んでも、登録済みの ID を確実にクリアでき orphan 化しない。
      stopScheduler();
      schedulerIdRef.current = window.setInterval(tick, SCHEDULER_LOOKAHEAD_MS);
      tick(); // 最初のウィンドウを即スケジュール
    },
    [sampler, setActiveChordIndex, isLoopRef, stopScheduler],
  );

  const handleStop = useCallback(() => {
    clearTimers();
    sampler.stopAll();
    void sampler.resume();
    setActiveChordIndex(-1);
    setIsPlaying(false);
    setIsPaused(false);
    pausedElapsedRef.current = 0;
  }, [clearTimers, sampler, setActiveChordIndex]);

  const handleReset = useCallback(() => {
    handleStop();
    setChords(INITIAL_CHORDS);
    setChordIds(INITIAL_CHORDS.map(() => makeChordId()));
  }, [handleStop]);

  const handleTranspose = useCallback(
    (semitones: number) => {
      setChords((prev) => {
        const next = prev.map((c) => transposeChord(c, semitones, accidentalDisplay));
        // 再生中も次のコードから即反映されるよう、chordNotesRef を先回りで更新
        if (isPlaying && !isPaused) {
          chordNotesRef.current = computeChordNotes(next, voicingType);
        }
        return next;
      });
    },
    [accidentalDisplay, isPlaying, isPaused, voicingType],
  );

  const chordSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleChordsDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setChordIds((prevIds) => {
      const oldIdx = prevIds.findIndex((id) => id === active.id);
      const newIdx = prevIds.findIndex((id) => id === over.id);
      if (oldIdx === -1 || newIdx === -1) return prevIds;
      setChords((prevChords) => arrayMove(prevChords, oldIdx, newIdx));
      return arrayMove(prevIds, oldIdx, newIdx);
    });
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPaused) {
      await sampler.resume();
      const mSec = measureSecRef.current;
      const nextBoundary = Math.ceil(pausedElapsedRef.current / mSec - 1e-6) * mSec;
      pausedElapsedRef.current = nextBoundary;
      setIsPaused(false);
      setIsPlaying(true);
      scheduleFrom(nextBoundary);
      return;
    }
    clearTimers();
    sampler.stopAll();
    await sampler.resume();
    beatSecRef.current = noteValue * (60 / metronomeState.bpm);
    measureSecRef.current = metronomeState.beatsPerMeasure * (60 / metronomeState.bpm);
    pausedElapsedRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);
    scheduleFrom(0);
  }, [clearTimers, isPaused, metronomeState.bpm, noteValue, sampler, scheduleFrom]);

  const handlePause = useCallback(async () => {
    const totalSec = chordNotesRef.current.length * measureSecRef.current;
    const elapsed = sampler.getCurrentTime() - playStartAudioRef.current;
    pausedElapsedRef.current = Math.min(totalSec, Math.max(0, elapsed));
    clearTimers();
    sampler.stopAll();
    await sampler.suspend();
    setIsPaused(true);
  }, [clearTimers, sampler]);

  useEffect(() => {
    isLoopRef.current = isLoop;
  }, [isLoop]);

  useEffect(() => {
    return () => {
      if (schedulerIdRef.current !== null) {
        window.clearInterval(schedulerIdRef.current);
      }
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useWakeLock(wakeLock && isPlaying);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      const inDialog = e.target instanceof HTMLElement && !!e.target.closest("[role='dialog']");
      if (e.code === "Space") {
        if (inDialog) return;
        e.preventDefault();
        if (isPlaying && !isPaused) {
          void handlePause();
        } else {
          void handlePlay();
        }
      } else if (e.code === "KeyS") {
        if (inDialog) return;
        handleStop();
      } else if (e.code === "KeyM") {
        if (inDialog) return;
        e.preventDefault();
        if (metronomeState.volume > 0) {
          metronomeActions.setVolume(0);
        } else {
          metronomeActions.setVolume(lastNonZeroVolumeRef.current);
        }
      } else if (e.code === "Enter") {
        if (inDialog) return;
        if (activeChordIndex < 0) return;
        e.preventDefault();
        setEditingIndex(activeChordIndex);
      } else if (e.code === "ArrowUp") {
        if (editingIndex !== null) return;
        e.preventDefault();
        handleTranspose(1);
      } else if (e.code === "ArrowDown") {
        if (editingIndex !== null) return;
        e.preventDefault();
        handleTranspose(-1);
      } else if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        if (editingIndex !== null) return;
        if (chords.length === 0) return;
        e.preventDefault();
        const dir = e.code === "ArrowRight" ? 1 : -1;
        const cur = activeChordIndex < 0 ? (dir > 0 ? -1 : 0) : activeChordIndex;
        const nextIdx = Math.max(0, Math.min(chords.length - 1, cur + dir));
        if (isPlaying && !isPaused) {
          // 再生中: 移動先からスケジューラを再構築
          clearTimers();
          sampler.stopAll();
          void sampler.resume();
          const newElapsed = nextIdx * measureSecRef.current;
          pausedElapsedRef.current = newElapsed;
          setActiveChordIndex(nextIdx);
          scheduleFrom(newElapsed);
        } else {
          // 停止中・一時停止中: 試聴のみ
          setActiveChordIndex(nextIdx);
          const notes = chordNotesRef.current[nextIdx] ?? [];
          void sampler.resume();
          notes.forEach((note) => {
            sampler.triggerAttackRelease(note, beatSecRef.current, 0);
          });
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isPlaying,
    isPaused,
    handlePlay,
    handlePause,
    handleStop,
    handleTranspose,
    editingIndex,
    chords.length,
    activeChordIndex,
    setActiveChordIndex,
    sampler,
    clearTimers,
    scheduleFrom,
    metronomeState.volume,
    metronomeActions,
  ]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <MasterVolumeBridge />
      <ChordShareToolbar
        wakeLock={wakeLock}
        onWakeLockChange={setWakeLock}
        onReset={handleReset}
        chords={chords}
        onApplyChords={handleApplyChordsText}
      />
      <div className="px-4 pb-2 text-center">
        <button
          type="button"
          className="inline-flex max-w-full items-center justify-center text-sm opacity-70 transition-opacity hover:opacity-100"
          onClick={() => setMetronomeModalOpen(true)}
          aria-label="テンポ・拍子・音符・ループ設定"
          title="テンポ・拍子・音符・ループ設定"
        >
          <span className="inline-flex max-w-full items-center gap-4 truncate">
            <span>{metronomeState.bpm} BPM</span>
            <span>{metronomeState.beatsPerMeasure}拍子</span>
            <span className="inline-flex items-center gap-1">
              {noteValueOption ? <Icon icon={noteValueOption.icon} className="size-4" /> : null}
              <span>{noteValueLabel}</span>
            </span>
            {isLoop ? (
              <Icon icon="mdi:repeat" className="size-4" aria-label="ループ再生オン" />
            ) : null}
          </span>
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col w-full max-w-xl mx-auto relative">
        <div className="flex-1 min-h-0 flex flex-col items-center gap-6 overflow-y-auto p-4">
          <div className="rounded-xl p-3 w-full flex flex-col items-center gap-3 border border-base-300">
            <div className="w-40">
              <SheetMusic notes={activeNotes} accidentalDisplay={accidentalDisplay} />
            </div>
            <div className="w-full pb-8">
              <PianoRoll startNote="C2" endNote="C6" activeNotes={activeNotes} />
            </div>
          </div>
          <div className="flex flex-row flex-wrap place-content-center place-items-center gap-3 w-full">
            <div className="flex flex-row place-items-center gap-2">
              <span className="text-sm opacity-70">臨時記号</span>
              <div className="join">
                <button
                  type="button"
                  className={`btn join-item h-auto ${accidentalDisplay === "auto" ? "btn-primary" : ""}`}
                  onClick={() => setAccidentalDisplay("auto")}
                  aria-label="自動表記（入力のまま）"
                >
                  自動
                </button>
                <div className="join join-vertical">
                  <button
                    type="button"
                    className={`btn btn-sm join-item ${accidentalDisplay === "sharp" ? "btn-primary" : ""}`}
                    onClick={() => setAccidentalDisplay("sharp")}
                    aria-label="シャープ表記"
                  >
                    ♯
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm join-item ${accidentalDisplay === "flat" ? "btn-primary" : ""}`}
                    onClick={() => setAccidentalDisplay("flat")}
                    aria-label="フラット表記"
                  >
                    ♭
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-row place-items-center gap-2">
              <span className="text-sm opacity-70">移調</span>
              <div className="join join-vertical">
                <button
                  type="button"
                  className="btn btn-sm join-item"
                  onClick={() => handleTranspose(1)}
                  aria-label="半音上げる"
                  title="半音上げる"
                >
                  <Icon icon="mdi:plus" className="size-4" />1
                </button>
                <button
                  type="button"
                  className="btn btn-sm join-item"
                  onClick={() => handleTranspose(-1)}
                  aria-label="半音下げる"
                  title="半音下げる"
                >
                  <Icon icon="mdi:minus" className="size-4" />1
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-row flex-wrap content-center justify-center items-center gap-2 w-full">
            <DndContext
              sensors={chordSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleChordsDragEnd}
            >
              <SortableContext items={chordIds} strategy={rectSortingStrategy}>
                {chords.map((chord, index) => (
                  <Fragment key={chordIds[index]}>
                    {index > 0 && (
                      <Icon
                        icon="material-symbols:chevron-right-rounded"
                        className="size-5 sm:size-6 md:size-8 opacity-50"
                        aria-hidden
                      />
                    )}
                    <SortableChord
                      id={chordIds[index]}
                      value={chord}
                      isActive={index === activeChordIndex}
                      onClick={() => setEditingIndex(index)}
                    />
                  </Fragment>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-circle btn-error btn-soft shadow-lg absolute right-4 bottom-44 z-20"
          onClick={removeLastChord}
          disabled={chords.length === 0}
          aria-label="末尾のコードを削除"
          title="末尾のコードを削除"
        >
          <span className="inline-flex items-center -space-x-1">
            <Icon icon="lucide:chevron-right" className="size-5" />
            <Icon icon="lucide:circle-dashed" className="size-4" />
          </span>
        </button>
        <button
          type="button"
          className="btn btn-circle btn-primary btn-soft shadow-lg absolute right-4 bottom-32 z-20"
          onClick={addChord}
          aria-label="末尾にコードを追加"
          title="末尾にコードを追加"
        >
          <span className="inline-flex items-center -space-x-1">
            <Icon icon="lucide:chevron-right" className="size-5" />
            <Icon icon="lucide:plus" className="size-4" />
          </span>
        </button>

        <PlaybackBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={() => void handlePlay()}
          onPause={() => void handlePause()}
          onStop={handleStop}
          leftSlot={
            <div className="flex items-center gap-1">
              <VolumeControl showSoundType={false} />
            </div>
          }
          rightSlot={
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setMetronomeModalOpen(true)}
              aria-label="メトロノーム設定"
              title="メトロノーム設定"
            >
              <Icon icon="lucide:metronome" className="size-5" />
            </button>
          }
          disabled={hasInvalidChord}
        />
      </div>

      <ChordSelectModal
        chords={chords}
        editingIndex={editingIndex}
        onUpdate={updateChord}
        onDelete={deleteChord}
        onChangeIndex={setEditingIndex}
        onClose={() => setEditingIndex(null)}
      />
      <MetronomeSettingsModal
        open={metronomeModalOpen}
        onClose={() => setMetronomeModalOpen(false)}
        noteValue={noteValue}
        onNoteValueChange={setNoteValue}
        isLoop={isLoop}
        onLoopChange={setIsLoop}
      />
    </div>
  );
}

export function ChordShare() {
  return (
    <ChordShareProvider>
      <ChordShareInner />
    </ChordShareProvider>
  );
}
