import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import { useChordShare } from "./ChordShareContext";
import { INSTRUMENT_OPTIONS } from "./useSampler";

// chord-share 専用の音設定ポップアップ。再生バー左下のサウンドアイコンから
// 楽器と音量をまとめて設定する。共有の VolumeControl とは独立した実装。
export default function SoundSettings() {
  const { state, actions } = useMetronome();
  const { instrument, setInstrument } = useChordShare();
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
        <div className="absolute bottom-full left-0 mb-2 bg-base-100 border border-base-300 rounded-box shadow-lg p-3 flex flex-col gap-3 z-40 w-64">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium opacity-70">楽器</span>
            <div className="flex gap-2 flex-wrap" role="group" aria-label="再生する楽器">
              {INSTRUMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn btn-sm rounded-full btn-neutral ${instrument !== option.value ? "btn-soft" : ""}`}
                  onClick={() => setInstrument(option.value)}
                  aria-pressed={instrument === option.value}
                  title={option.label}
                >
                  <Icon icon={option.icon} className="size-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium opacity-70">音量</span>
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
        </div>
      )}
      <button
        type="button"
        className="btn btn-circle btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="音設定"
        aria-expanded={open}
      >
        <Icon icon={icon} className="size-6" />
      </button>
    </div>
  );
}
