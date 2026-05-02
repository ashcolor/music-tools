import { forwardRef } from "react";
import { useMetronome } from "@/contexts/MetronomeContext";
import type { SoundType } from "@/contexts/MetronomeContext";

const SOUND_TYPES: { value: SoundType; label: string }[] = [
  { value: "electronic", label: "電子音" },
  { value: "analog", label: "アナログ" },
  { value: "woodfish", label: "木魚" },
];

const SettingsModal = forwardRef<HTMLDialogElement>((_, ref) => {
  const { state, actions } = useMetronome();

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">設定</h3>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h4 className="font-bold text-sm">音設定</h4>
            <div className="flex flex-row items-center gap-3">
              <label className="label-text text-sm whitespace-nowrap w-20">音量</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={state.volume}
                onChange={(e) => actions.setVolume(Number(e.target.value))}
                className="range range-sm flex-1"
              />
              <span className="text-sm w-10 text-right">{Math.round(state.volume * 100)}</span>
            </div>
            <div className="flex flex-row items-center gap-3">
              <label className="label-text text-sm whitespace-nowrap w-20">音の種類</label>
              <div className="flex flex-row gap-1 flex-wrap">
                {SOUND_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn btn-sm rounded-full btn-neutral ${state.soundType !== value ? "btn-soft" : ""}`}
                    onClick={() => actions.setSoundType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
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
  );
});

SettingsModal.displayName = "SettingsModal";

export default SettingsModal;
