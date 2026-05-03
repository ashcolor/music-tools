import { useRef } from "react";
import { Icon } from "@iconify/react";
import { useMetronome, type AccelerationMode } from "@/contexts/MetronomeContext";
import { useNumericInputDraft } from "@/hooks/useNumericInputDraft";
import AccelerationIntervalInput from "./AccelerationIntervalInput";
import AccelerationStepInput from "./AccelerationStepInput";

const MIN_BPM = 10;
const MAX_BPM = 999;
const DEFAULT_BPM = 120;

const TAP_RESET_MS = 2000;
const TAP_MAX_SAMPLES = 8;

const MODES: { value: AccelerationMode; label: string; icon: string }[] = [
  { value: "decel", label: "減速", icon: "material-symbols:trending-down-rounded" },
  { value: "off", label: "一定", icon: "material-symbols:trending-flat-rounded" },
  { value: "accel", label: "加速", icon: "material-symbols:trending-up-rounded" },
];

function NumericPad({
  value,
  onChange,
  side,
}: {
  value: number;
  onChange: (n: number) => void;
  side: "minus" | "plus";
}) {
  const colorClass = side === "minus" ? "btn-error" : "btn-primary";
  const tenDelta = side === "minus" ? -10 : 10;
  const oneDelta = side === "minus" ? -1 : 1;
  const tenLabel = side === "minus" ? "-10" : "+10";
  const oneLabel = side === "minus" ? "-1" : "+1";
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className={`btn btn-circle btn-soft ${colorClass}`}
        onClick={() => onChange(value + tenDelta)}
      >
        {tenLabel}
      </button>
      <button
        type="button"
        className={`btn btn-circle btn-soft ${colorClass}`}
        onClick={() => onChange(value + oneDelta)}
      >
        {oneLabel}
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
  fallbackOnBlur,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  allowEmpty?: boolean;
  placeholder?: number;
  fallbackOnBlur?: number;
}) {
  const tapsRef = useRef<number[]>([]);
  const numericValue = value ?? placeholder ?? MIN_BPM;
  const inputProps = useNumericInputDraft(value, onChange, {
    allowEmpty,
    fallbackOnBlur,
    minOnBlur: MIN_BPM,
    maxOnBlur: MAX_BPM,
  });

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
      <div className="flex flex-row items-center">
        <NumericPad value={numericValue} onChange={(n) => onChange(n)} side="minus" />
        <div className="relative">
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            placeholder={placeholder !== undefined ? String(placeholder) : ""}
            {...inputProps}
            className="input input-ghost w-28 px-1 text-center text-4xl md:text-5xl font-mono font-bold text-primary focus:text-primary focus:outline-none h-auto pt-2 pb-7"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-lg text-base-content/50">
            BPM
          </span>
        </div>
        <NumericPad value={numericValue} onChange={(n) => onChange(n)} side="plus" />
      </div>
      <button type="button" className="btn btn-sm btn-soft btn-secondary" onClick={handleTap}>
        タップで指定
      </button>
    </div>
  );
}

export default function TempoEditor() {
  const { state, actions } = useMetronome();
  const tapsRef = useRef<number[]>([]);
  const bpmField = useNumericInputDraft(
    state.bpm,
    (n) => {
      if (n !== null) actions.setBpm(n);
    },
    { fallbackOnBlur: DEFAULT_BPM, minOnBlur: MIN_BPM, maxOnBlur: MAX_BPM },
  );

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
          <div className="flex flex-row items-center">
            <NumericPad
              value={state.bpm}
              onChange={(n) => handleStep(n - state.bpm)}
              side="minus"
            />
            <div className="relative">
              <input
                type="number"
                min={MIN_BPM}
                max={MAX_BPM}
                placeholder={String(DEFAULT_BPM)}
                {...bpmField}
                className="input input-ghost w-32 text-center text-5xl md:text-6xl font-mono font-bold text-primary focus:text-primary focus:outline-none h-auto pt-2 pb-7"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-lg text-base-content/50">
                BPM
              </span>
            </div>
            <NumericPad
              value={state.bpm}
              onChange={(n) => handleStep(n - state.bpm)}
              side="plus"
            />
          </div>
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
              fallbackOnBlur={DEFAULT_BPM}
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
              placeholder={state.accelerationMode === "decel" ? 30 : 300}
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
