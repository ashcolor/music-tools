import { useEffect, useRef } from "react";
import { ChordTypeSelect } from "./ChordTypeSelect";
import { NoteSelect } from "./NoteSelect";
import { ChordPlayer } from "./ChordPlayer";

type Props = {
  open: boolean;
  root: string;
  type: string;
  bass: string;
  onRootChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onBassChange: (v: string) => void;
  onClose: () => void;
};

export function ChordSelectModal({
  open,
  root,
  type,
  bass,
  onRootChange,
  onTypeChange,
  onBassChange,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box flex max-w-2xl flex-col place-content-center place-items-center gap-8">
        <h3 className="text-2xl font-bold">
          <span>{root}</span>
          <span>{type}</span>
          {root !== bass && (
            <>
              <span>&nbsp;/&nbsp;</span>
              <span>{bass}</span>
            </>
          )}
        </h3>
        <div className="flex flex-col gap-4">
          <span className="text-lg">ルート</span>
          <NoteSelect value={root} onChange={onRootChange} />
          <div className="divider" />
          <ChordTypeSelect value={type} onChange={onTypeChange} />
          <div className="divider" />
          <span className="text-lg">ベース</span>
          <NoteSelect value={bass} onChange={onBassChange} />
          <div className="modal-action justify-center">
            <div className="flex flex-col place-items-center gap-2">
              <ChordPlayer chord={`${root}${type}`} />
              <button type="button" className="btn" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
