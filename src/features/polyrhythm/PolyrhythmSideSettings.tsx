import { Icon } from "@iconify/react";

const BEATS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export type Pitch = "low" | "mid" | "high";

const PITCH_OPTIONS: { value: Pitch; label: string }[] = [
  { value: "low", label: "低" },
  { value: "mid", label: "中" },
  { value: "high", label: "高" },
];

export type SideSettings = {
  pitch: Pitch;
  beats: number;
  volume: number;
  pan: number;
};

function formatPan(pan: number): string {
  if (pan === 0) return "C";
  const sign = pan < 0 ? "L" : "R";
  return `${sign}${Math.round(Math.abs(pan) * 100)}`;
}

type Props = {
  value: SideSettings;
  onChange: (next: SideSettings) => void;
  onRemove?: () => void;
};

export default function PolyrhythmSideSettings({ value, onChange, onRemove }: Props) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm relative">
      {onRemove && (
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-xs absolute top-1 right-1"
          onClick={onRemove}
          aria-label="削除"
        >
          <Icon icon="material-symbols:close-rounded" className="size-4" />
        </button>
      )}
      <div className="card-body p-4 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-60">連符</span>
          <div className="flex justify-center">
            <select
              className="select select-bordered w-20 text-xl font-bold text-right"
              value={value.beats}
              onChange={(e) => onChange({ ...value, beats: Number(e.target.value) })}
            >
              {BEATS_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-60">ステレオ</span>
          <div className="flex flex-row items-center gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-px bg-base-content/50" />
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={value.pan}
                onChange={(e) => onChange({ ...value, pan: Number(e.target.value) })}
                onDoubleClick={() => onChange({ ...value, pan: 0 })}
                className="range range-sm range-primary w-full"
                style={{ "--range-fill": 0 } as React.CSSProperties}
              />
            </div>
            <span className="text-xs w-10 text-right tabular-nums">
              {formatPan(value.pan)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-60">音の高さ</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {PITCH_OPTIONS.map(({ value: pitch, label }) => (
              <button
                key={pitch}
                type="button"
                className={`btn btn-sm rounded-full btn-neutral ${value.pitch !== pitch ? "btn-soft" : ""}`}
                onClick={() => onChange({ ...value, pitch })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-60">音量</span>
          <div className="flex flex-row items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={value.volume}
              onChange={(e) => onChange({ ...value, volume: Number(e.target.value) })}
              className="range range-sm range-primary flex-1"
            />
            <span className="text-xs w-8 text-right tabular-nums">
              {Math.round(value.volume * 100)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
