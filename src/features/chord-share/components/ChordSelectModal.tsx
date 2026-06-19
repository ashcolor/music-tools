import { useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { ChordTypeSelect } from "./ChordTypeSelect";
import { NoteSelect } from "./NoteSelect";
import { ChordPlayer } from "./ChordPlayer";
import { PianoRoll } from "./PianoRoll";
import { SheetMusic } from "./SheetMusic";
import { useChordShare } from "../hooks/ChordShareContext";
import {
  MAIN_TYPES,
  NATURAL_NOTES,
  buildChordVoicing,
  findMainTypeByType,
  isValidMainType,
  isValidNote,
  isValidTension,
  noteRange,
  parseChord,
  serializeChord,
} from "../utils/constants";

function WarningIcon() {
  return (
    <Icon
      icon="material-symbols:warning-outline-rounded"
      className="size-5 shrink-0 text-warning"
      aria-label="無効な値"
    />
  );
}

function splitType(type: string): { main: string; tensionLabel: string } {
  const found = findMainTypeByType(type);
  if (found) return { main: found.main.value, tensionLabel: found.tension.label };
  return { main: "", tensionLabel: type };
}

type Props = {
  chords: string[];
  editingIndex: number | null;
  onUpdate: (index: number, next: string) => void;
  onDelete: (index: number) => void;
  onChangeIndex: (next: number) => void;
  onClose: () => void;
};

export function ChordSelectModal({
  chords,
  editingIndex,
  onUpdate,
  onDelete,
  onChangeIndex,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = editingIndex !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const current = editingIndex !== null ? parseChord(chords[editingIndex] ?? "") : null;
  const prev =
    editingIndex !== null && editingIndex > 0 ? parseChord(chords[editingIndex - 1] ?? "") : null;
  const next =
    editingIndex !== null && editingIndex < chords.length - 1
      ? parseChord(chords[editingIndex + 1] ?? "")
      : null;

  const { main: mainType, tensionLabel } = useMemo(
    () => splitType(current?.type ?? ""),
    [current?.type],
  );
  const availableTensions = useMemo(
    () => MAIN_TYPES.find((m) => m.value === mainType)?.tensionOptions ?? [],
    [mainType],
  );

  const { accidentalDisplay } = useChordShare();

  if (!current || editingIndex === null) {
    return <dialog ref={dialogRef} className="modal" onClose={onClose} />;
  }

  const { root, type, bass } = current;

  const voicingNotes =
    isValidNote(root) && isValidMainType(mainType) ? buildChordVoicing(root, type, bass) : [];

  const setField = (overrides: Partial<{ root: string; type: string; bass: string }>) => {
    const r = overrides.root ?? root;
    const t = overrides.type ?? type;
    let b = overrides.bass ?? bass;
    // root変更時、オンコードでない場合はbassも追随
    if (overrides.root !== undefined && bass === root) {
      b = r;
    }
    onUpdate(editingIndex, serializeChord(r, t, b));
  };

  const onRootChange = (v: string) => setField({ root: v });
  const onTypeChange = (v: string) => setField({ type: v });
  const onBassChange = (v: string) => setField({ bass: v });
  const handleMainChange = (nextMain: string) => {
    const next = MAIN_TYPES.find((m) => m.value === nextMain);
    if (!next) return;
    const nextOpt =
      next.tensionOptions.find((tension) => tension.label === tensionLabel) ??
      next.tensionOptions[0];
    onTypeChange(nextOpt.type);
  };

  const isOnChord = root !== bass;
  const handleOnChordToggle = (checked: boolean) => {
    if (checked) {
      const fallback = NATURAL_NOTES.find((note) => note.value !== root)?.value ?? root;
      onBassChange(fallback);
    } else {
      onBassChange(root);
    }
  };

  const renderChordLabel = (c: { root: string; type: string; bass: string }) => (
    <>
      <span>{c.root}</span>
      <span>{c.type}</span>
      {c.root !== c.bass && (
        <>
          <span>&nbsp;/&nbsp;</span>
          <span>{c.bass}</span>
        </>
      )}
    </>
  );

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box relative flex max-w-2xl flex-col place-content-center place-items-center gap-8">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="閉じる"
        >
          ✕
        </button>
        <div className="flex w-full flex-row items-center gap-2">
          {prev ? (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm flex-1 justify-end opacity-50"
                onClick={() => onChangeIndex(editingIndex - 1)}
              >
                <span className="text-base">{renderChordLabel(prev)}</span>
              </button>
              <Icon
                icon="material-symbols:chevron-right-rounded"
                className="size-5 shrink-0 opacity-50"
                aria-hidden
              />
            </>
          ) : (
            <div className="flex-1" />
          )}
          <h3 className="text-2xl font-bold px-2 text-center">{renderChordLabel(current)}</h3>
          {next ? (
            <>
              <Icon
                icon="material-symbols:chevron-right-rounded"
                className="size-5 shrink-0 opacity-50"
                aria-hidden
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm flex-1 justify-start opacity-50"
                onClick={() => onChangeIndex(editingIndex + 1)}
              >
                <span className="text-base">{renderChordLabel(next)}</span>
              </button>
            </>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-40">
            <SheetMusic notes={voicingNotes} accidentalDisplay={accidentalDisplay} />
          </div>
          <PianoRoll {...noteRange(voicingNotes.slice(1), 2)} activeNotes={voicingNotes.slice(1)} />
        </div>

        <div className="flex w-full flex-col gap-4 md:hidden">
          <span className="flex items-center gap-2 text-base">
            ルート
            {!isValidNote(root) && <WarningIcon />}
          </span>
          <NoteSelect value={root} onChange={onRootChange} />
          <div className="flex items-start gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-1 text-sm">
                タイプ
                {!isValidMainType(mainType) && <WarningIcon />}
              </span>
              <select
                className="select select-bordered w-full"
                value={mainType}
                onChange={(e) => handleMainChange(e.target.value)}
              >
                {!isValidMainType(mainType) && (
                  <option value={mainType}>{mainType || "(無効)"}</option>
                )}
                {MAIN_TYPES.map((main) => (
                  <option key={main.value} value={main.value}>
                    {main.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center gap-1 text-sm">
                テンション
                {!isValidTension(mainType, type) && <WarningIcon />}
              </span>
              <select
                className="select select-bordered w-full"
                value={type}
                onChange={(e) => onTypeChange(e.target.value)}
                disabled={availableTensions.length <= 1}
              >
                {!isValidTension(mainType, type) && (
                  <option value={type}>{type || "(無効)"}</option>
                )}
                {availableTensions.map((tension) => (
                  <option key={tension.type} value={tension.type}>
                    {tension.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3">
            <span className="text-base">オンコード</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isOnChord}
              onChange={(e) => handleOnChordToggle(e.target.checked)}
            />
          </label>
          {isOnChord && (
            <>
              <NoteSelect value={bass} onChange={onBassChange} />
              {!isValidNote(bass) && <WarningIcon />}
            </>
          )}
        </div>

        <div className="hidden w-full flex-col gap-4 md:flex">
          <span className="flex items-center gap-2 text-base sm:text-lg">
            ルート
            {!isValidNote(root) && <WarningIcon />}
          </span>
          <NoteSelect value={root} onChange={onRootChange} />
          <ChordTypeSelect
            value={type}
            onChange={onTypeChange}
            mainTypeInvalid={!isValidMainType(mainType)}
            tensionInvalid={!isValidTension(mainType, type)}
          />
          <label className="flex items-center gap-3">
            <span className="text-base sm:text-lg">オンコード</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isOnChord}
              onChange={(e) => handleOnChordToggle(e.target.checked)}
            />
          </label>
          {isOnChord && (
            <>
              <NoteSelect value={bass} onChange={onBassChange} />
              {!isValidNote(bass) && <WarningIcon />}
            </>
          )}
        </div>

        <div className="modal-action relative w-full justify-center">
          <button
            type="button"
            className="btn btn-ghost btn-sm text-error absolute left-0"
            onClick={() => onDelete(editingIndex)}
            aria-label="削除"
          >
            <Icon icon="material-symbols:delete-outline-rounded" className="size-5" />
          </button>
          <ChordPlayer chord={`${root}${type}`} />
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
