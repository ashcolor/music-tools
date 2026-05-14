import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "@iconify/react";
import { Chord, Note } from "tonal";
import PlaybackBar from "../../components/PlaybackBar";
import VolumeControl from "../../components/VolumeControl";
import { useMetronome } from "../../contexts/MetronomeContext";
import { ChordDisplay } from "./ChordDisplay";
import { ChordSelectModal } from "./ChordSelectModal";
import { PianoRoll } from "./PianoRoll";
import { ChordShareProvider, useChordShare } from "./ChordShareContext";
import {
  INITIAL_CHORDS,
  convertChordToAccidental,
  isValidChordNotes,
  isValidNote,
  parseChord,
} from "./constants";

const BEAT_SEC = 1;

function computeChordNotes(chords: string[]) {
  return chords.map((chord) => {
    const { root, type } = parseChord(chord || "");
    if (!root) return [];
    const baseRoot = `${root}3`;
    const intervals = Chord.get(`${root}${type}`).intervals;
    return intervals
      .map((iv) => Note.transpose(baseRoot, iv))
      .filter((n): n is string => Boolean(n));
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
  } = useChordShare();
  const initial = useMemo(() => {
    const chordParam = searchParams.get("chord");
    return chordParam ? chordParam.split(",") : INITIAL_CHORDS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [chords, setChords] = useState<string[]>(initial);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // URL ?accidental= があれば初回マウント時にローカル設定へ反映
  useEffect(() => {
    const param = searchParams.get("accidental");
    if (param === "sharp" || param === "flat") {
      setAccidentalDisplay(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 表示設定変化に合わせて既存コード列も異名変換
  useEffect(() => {
    setChords((prev) => prev.map((c) => convertChordToAccidental(c, accidentalDisplay)));
  }, [accidentalDisplay]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const chordNotesRef = useRef<string[][]>([]);
  const pausedElapsedRef = useRef(0);
  const playStartWallRef = useRef(0);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("chord", chords.join(","));
        next.set("accidental", accidentalDisplay);
        return next;
      },
      { replace: true },
    );
  }, [chords, accidentalDisplay, setSearchParams]);

  const chordNotes = useMemo(() => computeChordNotes(chords), [chords]);
  const hasInvalidChord = useMemo(
    () =>
      chords.some((chord) => {
        const { root, type, bass } = parseChord(chord);
        return (
          !isValidNote(root) || !isValidNote(bass) || !isValidChordNotes(root, type)
        );
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

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const scheduleFrom = useCallback(
    (fromElapsed: number) => {
      const notesList = chordNotesRef.current;
      notesList.forEach((notes, index) => {
        const chordStart = index * BEAT_SEC;
        const chordEnd = chordStart + BEAT_SEC;
        if (chordEnd <= fromElapsed) return;

        const startOffset = Math.max(0, chordStart - fromElapsed);
        const delayMs = startOffset * 1000;
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setActiveChordIndex(index);
          }, delayMs),
        );

        const remaining = chordEnd - Math.max(chordStart, fromElapsed);
        notes.forEach((note) => {
          sampler.triggerAttackRelease(note, remaining, startOffset);
        });
      });

      const totalSec = notesList.length * BEAT_SEC;
      const remainingMs = Math.max(0, (totalSec - fromElapsed) * 1000);
      timeoutsRef.current.push(
        window.setTimeout(() => {
          setActiveChordIndex(-1);
          setIsPlaying(false);
          setIsPaused(false);
          pausedElapsedRef.current = 0;
        }, remainingMs),
      );
    },
    [sampler, setActiveChordIndex],
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

  const handlePlay = useCallback(async () => {
    if (isPaused) {
      await sampler.resume();
      const nextBoundary =
        Math.ceil(pausedElapsedRef.current / BEAT_SEC - 1e-6) * BEAT_SEC;
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
    pausedElapsedRef.current = 0;
    playStartWallRef.current = performance.now();
    setIsPlaying(true);
    setIsPaused(false);
    scheduleFrom(0);
  }, [clearTimers, isPaused, sampler, scheduleFrom]);

  const handlePause = useCallback(async () => {
    const totalSec = chordNotesRef.current.length * BEAT_SEC;
    const segment = (performance.now() - playStartWallRef.current) / 1000;
    pausedElapsedRef.current = Math.min(totalSec, pausedElapsedRef.current + segment);
    clearTimers();
    sampler.stopAll();
    await sampler.suspend();
    setIsPaused(true);
  }, [clearTimers, sampler]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-xl mx-auto">
      <MasterVolumeBridge />
      <div className="flex-1 min-h-0 flex flex-col place-content-center place-items-center gap-6 overflow-y-auto p-4">
        <div className="flex flex-row flex-wrap place-content-center place-items-center gap-2">
          {chords.map((chord, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <Icon
                  icon="material-symbols:chevron-right-rounded"
                  className="size-4 opacity-50"
                  aria-hidden
                />
              )}
              <div className="flex flex-col place-content-center place-items-center gap-2">
                <ChordDisplay
                  value={chord}
                  onClick={() => setEditingIndex(index)}
                  isActive={index === activeChordIndex}
                />
              </div>
            </Fragment>
          ))}
        </div>
        <div className="w-full">
          <PianoRoll startNote="C2" endNote="C5" activeNotes={activeNotes} />
        </div>
      </div>

      <PlaybackBar
        isPlaying={isPlaying}
        isPaused={isPaused}
        onPlay={() => void handlePlay()}
        onPause={() => void handlePause()}
        onStop={handleStop}
        leftSlot={<VolumeControl showSoundType={false} />}
        rightSlot={
          <div className="join">
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
        }
        disabled={hasInvalidChord}
      />

      <ChordSelectModal
        chords={chords}
        editingIndex={editingIndex}
        onUpdate={updateChord}
        onChangeIndex={setEditingIndex}
        onClose={() => setEditingIndex(null)}
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
