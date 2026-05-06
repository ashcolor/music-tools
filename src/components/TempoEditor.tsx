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
  { value: "off", label: "固定", icon: "material-symbols:trending-flat-rounded" },
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

export default function TempoEditor() {
  const { state, actions } = useMetronome();
  const tapsRef = useRef<number[]>([]);
  const isOff = state.accelerationMode === "off";

  const currentValue = isOff ? state.bpm : state.accelerationStartBpm;
  const setValue = isOff ? actions.setBpm : actions.setAccelerationStartBpm;

  const bpmField = useNumericInputDraft(
    currentValue,
    (n) => {
      if (n !== null) setValue(n);
    },
    { fallbackOnBlur: DEFAULT_BPM, minOnBlur: MIN_BPM, maxOnBlur: MAX_BPM },
  );

  const handleStep = (delta: number) => {
    setValue(currentValue + delta);
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
      setValue(Math.round(60000 / avg));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 items-center">
        <div className="flex flex-row items-center">
          <NumericPad
            value={currentValue}
            onChange={(n) => handleStep(n - currentValue)}
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
            value={currentValue}
            onChange={(n) => handleStep(n - currentValue)}
            side="plus"
          />
        </div>
        <button type="button" className="btn btn-soft btn-secondary" onClick={handleTap}>
          タップで指定
        </button>
      </section>

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

      {!isOff && (
        <section className="flex flex-row flex-wrap gap-2 items-center justify-center">
          <AccelerationStepInput
            value={state.accelerationStep}
            onChange={actions.setAccelerationStep}
          />
          <span className="shrink-0">BPM /</span>
          <AccelerationIntervalInput
            value={state.accelerationInterval}
            onChange={actions.setAccelerationInterval}
          />
          <span className="shrink-0">小節</span>
        </section>
      )}
    </div>
  );
}
