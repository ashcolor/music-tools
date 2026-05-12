import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome, type SoundType } from "@/contexts/MetronomeContext";

const SOUND_TYPES: { value: SoundType; label: string; icon: string }[] = [
  { value: "electronic", label: "電子音", icon: "mdi:sine-wave" },
  { value: "classic", label: "クラシック", icon: "mdi:metronome-tick" },
];

type Props = {
  showSoundType?: boolean;
};

export default function VolumeControl({ showSoundType = true }: Props = {}) {
  const { state, actions } = useMetronome();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const icon =
    state.volume <= 0
      ? "material-symbols:volume-off-rounded"
      : state.volume < 0.5
        ? "material-symbols:volume-down-rounded"
        : "material-symbols:volume-up-rounded";

  return (
    <div ref={containerRef} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-box shadow-lg p-3 flex flex-col gap-3 z-40 w-56">
          {showSoundType && (
            <div className="flex flex-row gap-1 flex-wrap">
              {SOUND_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`btn btn-sm rounded-full btn-neutral gap-1 ${state.soundType !== value ? "btn-soft" : ""}`}
                  onClick={() => actions.setSoundType(value)}
                >
                  <Icon icon={icon} className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-row items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.volume}
              onChange={(e) => actions.setVolume(Number(e.target.value))}
              className="range range-sm range-primary flex-1"
            />
            <span className="text-xs w-8 text-right tabular-nums">
              {Math.round(state.volume * 100)}
            </span>
          </div>
        </div>
      )}
      <button
        type="button"
        className="btn btn-circle btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="音量"
      >
        <Icon icon={icon} className="size-6" />
      </button>
    </div>
  );
}
