import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "../../contexts/MetronomeContext";
import BeatsInput from "../../components/BeatsInput";
import BpmEditor from "../../components/BpmEditor";

export type NoteValue = 4 | 2 | 1 | 0.5;

export const NOTE_VALUE_OPTIONS: { value: NoteValue; label: string; icon: string }[] = [
  { value: 4, label: "全音符", icon: "mdi:music-note-whole" },
  { value: 2, label: "2分音符", icon: "mdi:music-note-half" },
  { value: 1, label: "4分音符", icon: "mdi:music-note-quarter" },
  { value: 0.5, label: "8分音符", icon: "mdi:music-note-eighth" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  noteValue: NoteValue;
  onNoteValueChange: (v: NoteValue) => void;
};

export function MetronomeSettingsModal({ open, onClose, noteValue, onNoteValueChange }: Props) {
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
        <h3 className="font-bold text-lg mt-6 mb-4">音符</h3>
        <div className="flex gap-2 flex-wrap justify-center">
          {NOTE_VALUE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm rounded-full btn-neutral ${noteValue !== opt.value ? "btn-soft" : ""}`}
              onClick={() => onNoteValueChange(opt.value)}
              title={opt.label}
            >
              <Icon icon={opt.icon} className="size-4" />
              <span>{opt.label}</span>
            </button>
          ))}
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
}
