import { memo } from "react";
import { Icon } from "@iconify/react";

const BEATS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export type Sound =
  | "electronicLow"
  | "electronicMid"
  | "electronicHigh"
  | "bassDrum"
  | "snare"
  | "hiHat";

export const SOUNDS: Sound[] = [
  "electronicLow",
  "electronicMid",
  "electronicHigh",
  "bassDrum",
  "snare",
  "hiHat",
];

const SOUND_OPTIONS: { value: Sound; label: string }[] = [
  { value: "electronicLow", label: "電子音低" },
  { value: "electronicMid", label: "電子音中" },
  { value: "electronicHigh", label: "電子音高" },
  { value: "bassDrum", label: "バスドラム" },
  { value: "snare", label: "スネア" },
  { value: "hiHat", label: "ハイハット" },
];

export type RhythmSettings = {
  sound: Sound;
  beats: number;
  volume: number;
  pan: number;
};

type Props = {
  index: number;
  value: RhythmSettings;
  onChange: (index: number, next: RhythmSettings) => void;
  onRemove?: (index: number) => void;
};

function RhythmSettingsCard({ index, value, onChange, onRemove }: Props) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm relative">
      {onRemove && (
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-xs absolute top-1 right-1"
          onClick={() => onRemove(index)}
          aria-label="削除"
        >
          <Icon icon="material-symbols:close-rounded" className="size-4" />
        </button>
      )}
      <div className="card-body p-4 gap-4">
        <div className="flex flex-row items-center gap-3">
          <Icon icon="material-symbols:music-note-rounded" className="size-6 opacity-70" />
          <details className="dropdown">
            <summary className="btn btn-outline btn-sm w-14 text-base font-bold">
              {value.beats}
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-14 p-1 shadow border border-base-300 max-h-60 overflow-y-auto flex-nowrap mt-1">
              {BEATS_OPTIONS.map((b) => (
                <li key={b}>
                  <button
                    type="button"
                    className={`justify-center text-base ${value.beats === b ? "menu-active" : ""}`}
                    onClick={(e) => {
                      onChange(index, { ...value, beats: b });
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

        <div className="flex flex-row items-center gap-2">
          <span className="text-xs">左</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={value.pan}
              onChange={(e) => onChange(index, { ...value, pan: Number(e.target.value) })}
              onDoubleClick={() => onChange(index, { ...value, pan: 0 })}
              className="range range-xs range-primary w-full relative z-10"
              style={{ "--range-fill": 0 } as React.CSSProperties}
            />
            <span className="absolute left-1/2 -translate-x-1/2 text-xs pointer-events-none z-0 opacity-60">
              |
            </span>
          </div>
          <span className="text-xs">右</span>
        </div>

        <div className="flex flex-row items-center gap-3">
          <Icon icon="material-symbols:graphic-eq-rounded" className="size-5 opacity-70" />
          <select
            className="select select-sm flex-1"
            value={value.sound}
            onChange={(e) => onChange(index, { ...value, sound: e.target.value as Sound })}
          >
            {SOUND_OPTIONS.map(({ value: sound, label }) => (
              <option key={sound} value={sound}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row items-center gap-3">
          <Icon icon="material-symbols:volume-up-rounded" className="size-5 opacity-70" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value.volume}
            onChange={(e) => onChange(index, { ...value, volume: Number(e.target.value) })}
            className="range range-xs range-primary flex-1"
          />
          <span className="text-xs w-8 text-right tabular-nums">
            {Math.round(value.volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(RhythmSettingsCard);
