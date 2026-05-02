import { useRef } from "react";
import { Icon } from "@iconify/react";
import { useMetronome, type AccelerationMode } from "@/contexts/MetronomeContext";
import AccelerationIntervalInput from "./AccelerationIntervalInput";
import AccelerationStepInput from "./AccelerationStepInput";

const MIN_BPM = 10;
const MAX_BPM = 999;

const TAP_RESET_MS = 2000;
const TAP_MAX_SAMPLES = 8;

const MODES: { value: AccelerationMode; label: string; icon: string }[] = [
  { value: "off", label: "一定", icon: "material-symbols:trending-flat-rounded" },
  { value: "accel", label: "加速", icon: "material-symbols:trending-up-rounded" },
  { value: "decel", label: "減速", icon: "material-symbols:trending-down-rounded" },
];

function StepGrid({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      <button
        type="button"
        className="btn btn-sm btn-soft btn-primary text-xl"
        onClick={() => onChange(value + 10)}
      >
        +10
      </button>
      <button
        type="button"
        className="btn btn-sm btn-soft btn-primary text-xl"
        onClick={() => onChange(value + 1)}
      >
        +1
      </button>
      <button
        type="button"
        className="btn btn-sm btn-soft btn-error text-xl"
        onClick={() => onChange(value - 10)}
      >
        -10
      </button>
      <button
        type="button"
        className="btn btn-sm btn-soft btn-error text-xl"
        onClick={() => onChange(value - 1)}
      >
        -1
      </button>
    </div>
  );
}

function BpmStepperColumn({
  label,
  value,
  onChange,
  allowEmpty = false,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  allowEmpty?: boolean;
  placeholder?: string;
}) {
  const tapsRef = useRef<number[]>([]);
  const numericValue = value ?? MIN_BPM;

  const handleTap = () => {
    const now = performance.now();
    const taps = tapsRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > TAP_RESET_MS) {
      taps.length = 0;
    }
    taps.push(now);
    if (taps.length > TAP_MAX_SAMPLES) {
      taps.splice(0, taps.length - TAP_MAX_SAMPLES);
    }
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      onChange(Math.round(60000 / avg));
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="number"
        min={MIN_BPM}
        max={MAX_BPM}
        value={value === null ? "" : value}
        placeholder={placeholder ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "" && allowEmpty) {
            onChange(null);
          } else {
            onChange(Number(raw));
          }
        }}
        className="input input-ghost w-28 px-1 text-center text-4xl md:text-5xl font-mono font-bold text-primary focus:text-primary focus:outline-none h-auto py-2"
      />
      <StepGrid value={numericValue} onChange={(n) => onChange(n)} />
      <button type="button" className="btn btn-sm btn-soft btn-secondary" onClick={handleTap}>
        タップで指定
      </button>
    </div>
  );
}

export default function TempoEditor() {
  const { state, actions } = useMetronome();
  const tapsRef = useRef<number[]>([]);

  const handleStep = (delta: number) => {
    actions.setBpm(state.bpm + delta);
  };

  const handleTap = () => {
    const now = performance.now();
    const taps = tapsRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > TAP_RESET_MS) {
      taps.length = 0;
    }
    taps.push(now);
    if (taps.length > TAP_MAX_SAMPLES) {
      taps.splice(0, taps.length - TAP_MAX_SAMPLES);
    }
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      actions.setBpm(Math.round(60000 / avg));
    }
  };

  const isOff = state.accelerationMode === "off";

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-row gap-1 justify-center">
        {MODES.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm rounded-full btn-neutral ${state.accelerationMode !== value ? "btn-soft" : ""}`}
            onClick={() => actions.setAccelerationMode(value)}
          >
            <Icon icon={icon} className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </section>

      {isOff && (
        <section className="flex flex-col gap-3 items-center">
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={state.bpm}
            onChange={(e) => actions.setBpm(Number(e.target.value))}
            className="input input-ghost w-40 text-center text-5xl font-mono font-bold text-primary focus:text-primary focus:outline-none h-auto py-2"
          />
          <StepGrid value={state.bpm} onChange={(n) => handleStep(n - state.bpm)} />
          <button type="button" className="btn btn-soft btn-secondary" onClick={handleTap}>
            タップで指定
          </button>
        </section>
      )}

      {!isOff && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-center gap-3">
            <BpmStepperColumn
              label="スタート"
              value={state.accelerationStartBpm}
              onChange={(n) => actions.setAccelerationStartBpm(n ?? MIN_BPM)}
            />
            <Icon
              icon="material-symbols:double-arrow-rounded"
              className="size-6 text-base-content/50 shrink-0"
              aria-hidden
            />
            <BpmStepperColumn
              label="ゴール"
              value={state.accelerationTargetBpm}
              onChange={actions.setAccelerationTargetBpm}
              allowEmpty
              placeholder={state.accelerationMode === "decel" ? "30" : "300"}
            />
          </div>
          <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
            <AccelerationIntervalInput
              value={state.accelerationInterval}
              onChange={actions.setAccelerationInterval}
            />
            <span className="shrink-0">小節ごとに</span>
            <AccelerationStepInput
              value={state.accelerationStep}
              onChange={actions.setAccelerationStep}
            />
            <span className="shrink-0">BPM変化</span>
          </div>
        </section>
      )}
    </div>
  );
}
