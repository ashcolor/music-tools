import { Icon } from "@iconify/react";
import { isValidChordNotes, isValidNote, parseChord } from "./constants";

type Props = {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
};

export function ChordDisplay({ value, onClick, isActive }: Props) {
  const { root, type, bass } = parseChord(value);
  const isInvalid = !isValidNote(root) || !isValidNote(bass) || !isValidChordNotes(root, type);
  return (
    <div
      className={`flex flex-row items-end leading-none cursor-pointer rounded px-2 py-1 transition-colors gap-0.5 ${
        isActive ? "bg-primary/20" : ""
      }`}
      onClick={onClick}
    >
      <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">{root}</span>
      <span className="text-lg sm:text-xl md:text-2xl leading-none">{type}</span>
      {root !== bass && (
        <>
          <span className="text-lg sm:text-xl md:text-2xl leading-none">/</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">{bass}</span>
        </>
      )}
      {isInvalid && (
        <Icon
          icon="material-symbols:warning-outline-rounded"
          className="size-5 sm:size-6 md:size-7 text-warning self-center"
          aria-label="無効なコード"
        />
      )}
    </div>
  );
}
