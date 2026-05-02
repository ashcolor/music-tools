import { useRef } from "react";
import { useMetronome } from "@/contexts/MetronomeContext";
import BPMInput from "./BPMInput";
import AccelerationIntervalInput from "./AccelerationIntervalInput";
import AccelerationStepInput from "./AccelerationStepInput";

const MIN_BPM = 0;
const MAX_BPM = 600;

const STEP_BUTTONS = [-10, -1, +1, +10];
const TAP_RESET_MS = 2000;
const TAP_MAX_SAMPLES = 8;

function BpmStepperRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-bold">{label}</span>
      <BPMInput value={value} onChange={onChange} />
      <div className="flex flex-row gap-1">
        {STEP_BUTTONS.map((delta) => (
          <button
            key={delta}
            type="button"
            className={`btn btn-sm btn-soft ${delta > 0 ? "btn-primary" : "btn-error"}`}
            onClick={() => onChange(value + delta)}
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
      </div>
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
      const bpm = Math.round(60000 / avg);
      actions.setBpm(bpm);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!state.accelerationEnabled && (
        <section className="flex flex-col gap-3 items-center">
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={state.bpm}
            onChange={(e) => actions.setBpm(Number(e.target.value))}
            className="input input-ghost w-40 text-center text-5xl font-mono font-bold text-primary focus:text-primary focus:outline-none h-auto py-2"
          />
          <div className="flex flex-row gap-2 justify-center">
            {STEP_BUTTONS.map((delta) => (
              <button
                key={delta}
                type="button"
                className={`btn btn-lg text-xl btn-soft ${delta > 0 ? "btn-primary" : "btn-error"}`}
                onClick={() => handleStep(delta)}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary w-32"
            onClick={handleTap}
          >
            タップ
          </button>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-2">
          <label className="label-text text-sm whitespace-nowrap">加速機能</label>
          <input
            type="checkbox"
            className="toggle border-base-300 bg-base-300 checked:border-accent checked:bg-accent"
            checked={state.accelerationEnabled}
            onChange={(e) => actions.setAccelerationEnabled(e.target.checked)}
          />
        </div>
        {state.accelerationEnabled && (
          <>
            <BpmStepperRow
              label="START"
              value={state.accelerationStartBpm}
              onChange={actions.setAccelerationStartBpm}
            />
            <BpmStepperRow
              label="GOAL"
              value={state.accelerationTargetBpm}
              onChange={actions.setAccelerationTargetBpm}
            />
            <div className="flex flex-row flex-wrap gap-1 items-center justify-center">
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
          </>
        )}
      </section>
    </div>
  );
}
