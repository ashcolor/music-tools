import { useRef } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import AccelerationIntervalInput from "./AccelerationIntervalInput";
import AccelerationStepInput from "./AccelerationStepInput";

export default function AccelerationToggle() {
  const { state, actions } = useMetronome();
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex flex-row items-center justify-end gap-2 px-4 py-2">
      <button
        type="button"
        className="btn btn-ghost btn-square"
        onClick={() => modalRef.current?.showModal()}
        aria-label="加速設定"
      >
        <Icon icon="material-symbols:settings-rounded" width="32" height="32" />
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">加速設定</h3>
          <div className="flex flex-col gap-4">
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
              <div className="flex flex-row flex-wrap gap-1 items-center">
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
            )}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
