import { useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { Note } from "tonal";
import { ChordTypeSelect } from "./ChordTypeSelect";
import { NoteSelect } from "./NoteSelect";
import { ChordPlayer } from "./ChordPlayer";
import { useChordShare } from "./ChordShareContext";
import {
  MAIN_TYPES,
  NATURAL_NOTES,
  findMainTypeByType,
  getDerivedNotes,
  isValidMainType,
  isValidNote,
  isValidTension,
  parseChord,
  serializeChord,
} from "./constants";

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
  onChangeIndex: (next: number) => void;
  onClose: () => void;
};

export function ChordSelectModal({
  chords,
  editingIndex,
  onUpdate,
  onChangeIndex,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = editingIndex !== null;
  const { accidentalDisplay } = useChordShare();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const noteOptions = useMemo(() => {
    const all: { label: string; value: string }[] = [];
    NATURAL_NOTES.forEach((n) => all.push({ label: n.label, value: n.value }));
    getDerivedNotes(accidentalDisplay).forEach((n) => {
      if (n.value) all.push({ label: n.label, value: n.value });
    });
    return all.sort((a, b) => {
      const ma = Note.midi(`${a.value}3`) ?? 0;
      const mb = Note.midi(`${b.value}3`) ?? 0;
      return ma - mb;
    });
  }, [accidentalDisplay]);

  const current = editingIndex !== null ? parseChord(chords[editingIndex] ?? "") : null;
  const prev =
    editingIndex !== null && editingIndex > 0
      ? parseChord(chords[editingIndex - 1] ?? "")
      : null;
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

  if (!current || editingIndex === null) {
    return <dialog ref={dialogRef} className="modal" onClose={onClose} />;
  }

  const { root, type, bass } = current;

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
    // 同じラベルがあれば引き継ぎ、なければ最初の option（=「なし」）
    const nextOpt =
      next.tensionOptions.find((t) => t.label === tensionLabel) ??
      next.tensionOptions[0];
    onTypeChange(nextOpt.type);
  };

  const handleTensionChange = (nextType: string) => {
    onTypeChange(nextType);
  };

  const isOnChord = root !== bass;
  const handleOnChordToggle = (checked: boolean) => {
    if (checked) {
      const fallback = noteOptions.find((n) => n.value !== root)?.value ?? root;
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

        <div className="flex w-full flex-col gap-3 md:hidden">
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm">ルート</span>
            <select
              className="select select-bordered flex-1"
              value={root}
              onChange={(e) => onRootChange(e.target.value)}
            >
              {!isValidNote(root) && (
                <option value={root}>{root || "(無効)"}</option>
              )}
              {noteOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {!isValidNote(root) && <WarningIcon />}
          </label>
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm">タイプ</span>
            <select
              className="select select-bordered flex-1"
              value={mainType}
              onChange={(e) => handleMainChange(e.target.value)}
            >
              {!isValidMainType(mainType) && (
                <option value={mainType}>{mainType || "(無効)"}</option>
              )}
              {MAIN_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {!isValidMainType(mainType) && <WarningIcon />}
          </label>
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm">テンション</span>
            <select
              className="select select-bordered flex-1"
              value={type}
              onChange={(e) => handleTensionChange(e.target.value)}
              disabled={availableTensions.length <= 1}
            >
              {!isValidTension(mainType, type) && (
                <option value={type}>{type || "(無効)"}</option>
              )}
              {availableTensions.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
            {!isValidTension(mainType, type) && <WarningIcon />}
          </label>
          <label className="flex items-center gap-3">
            <span className="w-20 text-sm">オンコード</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isOnChord}
              onChange={(e) => handleOnChordToggle(e.target.checked)}
            />
          </label>
          {isOnChord && (
            <label className="flex items-center gap-3">
              <span className="w-20 text-sm">ベース</span>
              <select
                className="select select-bordered flex-1"
                value={bass}
                onChange={(e) => onBassChange(e.target.value)}
              >
                {!isValidNote(bass) && (
                  <option value={bass}>{bass || "(無効)"}</option>
                )}
                {noteOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {!isValidNote(bass) && <WarningIcon />}
            </label>
          )}
        </div>

        <div className="hidden md:flex md:flex-col md:gap-4">
          <span className="flex items-center gap-2 text-lg">
            ルート
            {!isValidNote(root) && <WarningIcon />}
          </span>
          <NoteSelect value={root} onChange={onRootChange} />
          <div className="divider" />
          <ChordTypeSelect
            value={type}
            onChange={onTypeChange}
            mainTypeInvalid={!isValidMainType(mainType)}
            tensionInvalid={!isValidTension(mainType, type)}
          />
          <div className="divider" />
          <label className="flex items-center gap-3">
            <span className="text-lg">オンコード</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isOnChord}
              onChange={(e) => handleOnChordToggle(e.target.checked)}
            />
          </label>
          {isOnChord && (
            <>
              <span className="flex items-center gap-2 text-lg">
                ベース
                {!isValidNote(bass) && <WarningIcon />}
              </span>
              <NoteSelect value={bass} onChange={onBassChange} />
            </>
          )}
        </div>

        <div className="modal-action justify-center">
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
