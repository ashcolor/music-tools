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
  const chordNotesRef = useRef<string[][]>([]);
  const beatSecRef = useRef(60 / 120);
  const measureSecRef = useRef(4 * (60 / 120));
  const pausedElapsedRef = useRef(0);
  const playStartWallRef = useRef(0);
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

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const scheduleFrom = useCallback(
    (fromElapsed: number) => {
      const noteSec = beatSecRef.current;
      const measureSec = measureSecRef.current;
      const repeatCount = Math.max(1, Math.round(measureSec / noteSec));
      const notesList = chordNotesRef.current;

      notesList.forEach((_, index) => {
        const groupStart = index * measureSec;
        const groupEnd = groupStart + measureSec;
        if (groupEnd <= fromElapsed) return;

        const groupOffset = Math.max(0, groupStart - fromElapsed);
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setActiveChordIndex(index);
          }, groupOffset * 1000),
        );

        for (let r = 0; r < repeatCount; r++) {
          const noteStart = groupStart + r * noteSec;
          const noteEnd = noteStart + noteSec;
          if (noteEnd <= fromElapsed) continue;

          const startOffset = Math.max(0, noteStart - fromElapsed);
          // 発音タイミングで chordNotesRef を読むことで、再生中の移調を反映
          timeoutsRef.current.push(
            window.setTimeout(() => {
              const liveNotes = chordNotesRef.current[index] ?? [];
              liveNotes.forEach((note) => {
                sampler.triggerAttackRelease(note, noteSec, 0);
              });
            }, startOffset * 1000),
          );
        }
      });

      const totalSec = notesList.length * measureSec;
      const remainingMs = Math.max(0, (totalSec - fromElapsed) * 1000);
      timeoutsRef.current.push(
        window.setTimeout(() => {
          if (isLoopRef.current) {
            sampler.stopAll();
            void sampler.resume();
            pausedElapsedRef.current = 0;
            playStartWallRef.current = performance.now();
            setActiveChordIndex(-1);
            scheduleFrom(0);
          } else {
            setActiveChordIndex(-1);
            setIsPlaying(false);
            setIsPaused(false);
            pausedElapsedRef.current = 0;
          }
        }, remainingMs),
      );
    },
    [sampler, setActiveChordIndex, isLoopRef],
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
      playStartWallRef.current = performance.now();
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
    playStartWallRef.current = performance.now();
    setIsPlaying(true);
    setIsPaused(false);
    scheduleFrom(0);
  }, [clearTimers, isPaused, metronomeState.bpm, noteValue, sampler, scheduleFrom]);

  const handlePause = useCallback(async () => {
    const totalSec = chordNotesRef.current.length * measureSecRef.current;
    const segment = (performance.now() - playStartWallRef.current) / 1000;
    pausedElapsedRef.current = Math.min(totalSec, pausedElapsedRef.current + segment);
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
          playStartWallRef.current = performance.now();
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
