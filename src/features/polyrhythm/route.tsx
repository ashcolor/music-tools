import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import BpmDisplay from "../../components/BpmDisplay";
import BpmEditor from "../../components/BpmEditor";
import PlaybackBar from "../../components/PlaybackBar";
import { useWakeLock } from "../../hooks/useWakeLock";
import RhythmSettingsCard, {
  type Pitch,
  type RhythmSettings,
} from "./RhythmSettings";
import PolyrhythmToolbar from "./PolyrhythmToolbar";
import { usePolyrhythmAudio } from "./usePolyrhythmAudio";
import { usePolyrhythmUrlSync } from "./usePolyrhythmUrlSync";

const STORAGE_KEY = "music-tools:polyrhythm-settings";
const DEFAULT_BPM = 60;
const DEFAULT_RHYTHMS: RhythmSettings[] = [
  { pitch: "low", beats: 3, volume: 0.5, pan: -1 },
  { pitch: "mid", beats: 4, volume: 0.5, pan: 1 },
];
const DEFAULT_WAKE_LOCK = true;

const NEW_RHYTHM: RhythmSettings = { pitch: "mid", beats: 2, volume: 0.5, pan: 0 };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function isPitch(v: unknown): v is Pitch {
  return v === "low" || v === "mid" || v === "high";
}

function sanitizeRhythm(v: unknown): RhythmSettings | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Record<string, unknown>;
  if (!isPitch(c.pitch)) return null;
  if (typeof c.beats !== "number" || !Number.isFinite(c.beats)) return null;
  if (typeof c.volume !== "number" || !Number.isFinite(c.volume)) return null;
  if (typeof c.pan !== "number" || !Number.isFinite(c.pan)) return null;
  return {
    pitch: c.pitch,
    beats: clamp(Math.round(c.beats), 1, 12),
    volume: clamp(c.volume, 0, 1),
    pan: clamp(c.pan, -1, 1),
  };
}

type Persisted = { bpm: number; rhythms: RhythmSettings[]; wakeLock: boolean };

function loadPersisted(): Persisted {
  const fallback: Persisted = {
    bpm: DEFAULT_BPM,
    rhythms: DEFAULT_RHYTHMS,
    wakeLock: DEFAULT_WAKE_LOCK,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    const c = parsed as Record<string, unknown>;
    const bpm =
      typeof c.bpm === "number" && Number.isFinite(c.bpm)
        ? clamp(Math.round(c.bpm), 10, 999)
        : fallback.bpm;
    const rhythms = Array.isArray(c.rhythms)
      ? c.rhythms.map(sanitizeRhythm).filter((r): r is RhythmSettings => r !== null)
      : fallback.rhythms;
    const wakeLock =
      typeof c.wakeLock === "boolean" ? c.wakeLock : fallback.wakeLock;
    return { bpm, rhythms, wakeLock };
  } catch {
    return fallback;
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function Polyrhythm() {
  const [persisted] = useState(loadPersisted);
  const [bpm, setBpm] = useState(persisted.bpm);
  const [rhythms, setRhythms] = useState<RhythmSettings[]>(persisted.rhythms);
  const [wakeLock, setWakeLock] = useState(persisted.wakeLock);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const bpmModalRef = useRef<HTMLDialogElement>(null);

  const audio = usePolyrhythmAudio({ bpm, rhythms });

  const setBpmClamped = useCallback((n: number) => {
    setBpm(clamp(Math.round(n), 10, 999));
  }, []);

  usePolyrhythmUrlSync({ bpm, rhythms, setBpm: setBpmClamped, setRhythms });

  useWakeLock(wakeLock && isPlaying);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ bpm, rhythms, wakeLock }),
      );
    } catch {
      // noop
    }
  }, [bpm, rhythms, wakeLock]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    void audio.start();
  }, [audio]);
  const handlePause = useCallback(() => {
    setIsPaused(true);
    audio.pause();
  }, [audio]);
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    audio.stop();
  }, [audio]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isEditableTarget(event.target)) return;

      if (event.code === "Space") {
        event.preventDefault();
        if (isPlaying && !isPaused) {
          handlePause();
        } else {
          handlePlay();
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "r") {
        event.preventDefault();
        handleStop();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setBpmClamped(bpm + 1);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setBpmClamped(bpm - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bpm, isPaused, isPlaying, handlePlay, handlePause, handleStop, setBpmClamped]);

  const updateRhythm = (index: number, next: RhythmSettings) => {
    setRhythms((prev) => prev.map((r, i) => (i === index ? next : r)));
  };
  const removeRhythm = (index: number) => {
    setRhythms((prev) => prev.filter((_, i) => i !== index));
  };
  const addRhythm = () => {
    setRhythms((prev) => [...prev, { ...NEW_RHYTHM }]);
  };

  const handleReset = () => {
    handleStop();
    setBpm(DEFAULT_BPM);
    setRhythms(DEFAULT_RHYTHMS);
    setWakeLock(DEFAULT_WAKE_LOCK);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto">
      <PolyrhythmToolbar
        wakeLock={wakeLock}
        onWakeLockChange={setWakeLock}
        onReset={handleReset}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 md:p-8">
        <BpmDisplay bpm={bpm} onClick={() => bpmModalRef.current?.showModal()} />

        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            {rhythms.map((rhythm, i) => (
              <RhythmSettingsCard
                key={i}
                value={rhythm}
                onChange={(next) => updateRhythm(i, next)}
                onRemove={() => removeRhythm(i)}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="btn btn-circle btn-primary btn-soft"
              onClick={addRhythm}
              aria-label="リズムを追加"
            >
              <Icon icon="material-symbols:add-rounded" className="size-6" />
            </button>
          </div>
        </div>
      </div>

      <PlaybackBar
        isPlaying={isPlaying}
        isPaused={isPaused}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
      />

      <dialog ref={bpmModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">テンポ</h3>
          <BpmEditor value={bpm} onChange={setBpm} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
