import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "@iconify/react";
import { Chord } from "tonal";
import PlaybackBar from "../../components/PlaybackBar";
import VolumeControl from "../../components/VolumeControl";
import { useMetronome } from "../../contexts/MetronomeContext";
import { ChordDisplay } from "./ChordDisplay";
import { PianoRoll } from "./PianoRoll";
import { ChordShareProvider, useChordShare } from "./ChordShareContext";
import { INITIAL_CHORDS } from "./constants";

const BEAT_SEC = 1;

function computeChordNotes(chords: string[]) {
  return chords.map((chord) => {
    const [tonic, type] = Chord.tokenize(chord || "");
    if (!tonic) return [];
    return Chord.notes(type, `${tonic}3`);
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
  const initial = useMemo(() => {
    const chordParam = searchParams.get("chord");
    return chordParam ? chordParam.split(",") : INITIAL_CHORDS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [chords, setChords] = useState<string[]>(initial);
  const { sampler, activeChordIndex, setActiveChordIndex } = useChordShare();
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
        return next;
      },
      { replace: true },
    );
  }, [chords, setSearchParams]);

  const chordNotes = useMemo(() => computeChordNotes(chords), [chords]);
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
                  onChange={(next) => updateChord(index, next)}
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
