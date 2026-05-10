import { Icon } from "@iconify/react";
import { useMetronome, type AccelerationMode } from "@/contexts/MetronomeContext";
import AccelerationIntervalInput from "./AccelerationIntervalInput";
import AccelerationStepInput from "./AccelerationStepInput";
import BpmEditor from "./BpmEditor";

const MODES: { value: AccelerationMode; label: string; icon: string }[] = [
  { value: "decel", label: "減速", icon: "material-symbols:trending-down-rounded" },
  { value: "off", label: "固定", icon: "material-symbols:trending-flat-rounded" },
  { value: "accel", label: "加速", icon: "material-symbols:trending-up-rounded" },
];

export default function TempoEditor() {
  const { state, actions } = useMetronome();
  const isOff = state.accelerationMode === "off";

  const currentValue = isOff ? state.bpm : state.accelerationStartBpm;
  const setValue = isOff ? actions.setBpm : actions.setAccelerationStartBpm;

  return (
    <div className="flex flex-col gap-6">
      <BpmEditor value={currentValue} onChange={setValue} />

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
