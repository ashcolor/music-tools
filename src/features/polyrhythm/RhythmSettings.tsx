import { Icon } from "@iconify/react";

const BEATS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export type Pitch = "low" | "mid" | "high";

const PITCH_OPTIONS: { value: Pitch; label: string }[] = [
  { value: "low", label: "低" },
  { value: "mid", label: "中" },
  { value: "high", label: "高" },
];

export type RhythmSettings = {
  pitch: Pitch;
  beats: number;
  volume: number;
  pan: number;
};

type Props = {
  value: RhythmSettings;
  onChange: (next: RhythmSettings) => void;
  onRemove?: () => void;
};

export default function RhythmSettingsCard({ value, onChange, onRemove }: Props) {
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
            <details className="dropdown">
              <summary className="btn btn-outline w-20 text-xl font-bold">
                {value.beats}
                <Icon icon="material-symbols:arrow-drop-down-rounded" className="size-5" />
              </summary>
              <ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-20 p-2 shadow border border-base-300 max-h-60 overflow-y-auto flex-nowrap mt-1">
                {BEATS_OPTIONS.map((b) => (
                  <li key={b}>
                    <button
                      type="button"
                      className={`justify-center text-base ${value.beats === b ? "menu-active" : ""}`}
                      onClick={(e) => {
                        onChange({ ...value, beats: b });
                        e.currentTarget
                          .closest("details")
                          ?.removeAttribute("open");
                      }}
                    >
                      {b}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs opacity-60">ステレオ</span>
          <div className="w-full">
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
            <div className="flex justify-between px-2.5 mt-2 text-xs">
              <span>|</span>
              <span>|</span>
              <span>|</span>
            </div>
            <div className="flex justify-between px-2.5 mt-1 text-xs">
              <span>左</span>
              <span>中央</span>
              <span>右</span>
            </div>
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
