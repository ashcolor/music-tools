import { useEffect, useRef } from "react";
import { useMetronome } from "../../contexts/MetronomeContext";
import BeatsInput from "../../components/BeatsInput";
import BpmEditor from "../../components/BpmEditor";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MetronomeSettingsModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { state, actions } = useMetronome();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">テンポ</h3>
        <BpmEditor value={state.bpm} onChange={actions.setBpm} />
        <h3 className="font-bold text-lg mt-6 mb-4">拍子</h3>
        <BeatsInput value={state.beatsPerMeasure} onChange={actions.setBeatsPerMeasure} />
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
}
