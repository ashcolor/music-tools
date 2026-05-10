import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import BpmDisplay from "../../components/BpmDisplay";
import BpmEditor from "../../components/BpmEditor";
import PlaybackBar from "../../components/PlaybackBar";
import PolyrhythmSideSettings, {
  type Pitch,
  type SideSettings,
} from "./PolyrhythmSideSettings";
import { usePolyrhythmAudio } from "./usePolyrhythmAudio";

const STORAGE_KEY = "music-tools:polyrhythm-settings";
const DEFAULT_BPM = 60;
const DEFAULT_SIDES: SideSettings[] = [
  { pitch: "low", beats: 3, volume: 0.5, pan: -1 },
  { pitch: "mid", beats: 4, volume: 0.5, pan: 1 },
];

const NEW_SIDE: SideSettings = { pitch: "mid", beats: 2, volume: 0.5, pan: 0 };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function isPitch(v: unknown): v is Pitch {
  return v === "low" || v === "mid" || v === "high";
}

function sanitizeSide(v: unknown): SideSettings | null {
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

function loadPersisted(): { bpm: number; sides: SideSettings[] } {
  const fallback = { bpm: DEFAULT_BPM, sides: DEFAULT_SIDES };
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
    const sides = Array.isArray(c.sides)
      ? c.sides.map(sanitizeSide).filter((s): s is SideSettings => s !== null)
      : fallback.sides;
    return { bpm, sides };
  } catch {
    return fallback;
  }
}

export function Polyrhythm() {
  const [persisted] = useState(loadPersisted);
  const [bpm, setBpm] = useState(persisted.bpm);
  const [sides, setSides] = useState<SideSettings[]>(persisted.sides);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const bpmModalRef = useRef<HTMLDialogElement>(null);

  const audio = usePolyrhythmAudio({ bpm, sides });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ bpm, sides }));
    } catch {
      // noop
    }
  }, [bpm, sides]);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
    void audio.start();
  };
  const handlePause = () => {
    setIsPaused(true);
    audio.pause();
  };
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    audio.stop();
  };

  const updateSide = (index: number, next: SideSettings) => {
    setSides((prev) => prev.map((s, i) => (i === index ? next : s)));
  };
  const removeSide = (index: number) => {
    setSides((prev) => prev.filter((_, i) => i !== index));
  };
  const addSide = () => {
    setSides((prev) => [...prev, { ...NEW_SIDE }]);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-xl mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4 md:p-8">
        <BpmDisplay bpm={bpm} onClick={() => bpmModalRef.current?.showModal()} />

        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            {sides.map((side, i) => (
              <PolyrhythmSideSettings
                key={i}
                value={side}
                onChange={(next) => updateSide(i, next)}
                onRemove={() => removeSide(i)}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="btn btn-circle btn-primary btn-soft"
              onClick={addSide}
              aria-label="追加"
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
