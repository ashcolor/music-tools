import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";

export default function VolumeControl() {
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
    <div ref={containerRef} className="fixed bottom-20 right-4 md:bottom-4 z-30">
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-base-100 border border-base-300 rounded-box shadow-lg p-3 flex flex-col items-center gap-2">
          <span className="text-xs w-8 text-center">{Math.round(state.volume * 100)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={state.volume}
            onChange={(e) => actions.setVolume(Number(e.target.value))}
            className="range range-sm range-primary"
            style={{ writingMode: "vertical-lr", direction: "rtl", height: "8rem" }}
          />
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
