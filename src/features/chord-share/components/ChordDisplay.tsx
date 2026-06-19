import { Icon } from "@iconify/react";
import { isValidChordNotes, isValidNote, parseChord } from "../utils/constants";

type Props = {
  value: string;
  onClick?: () => void;
  isActive?: boolean;
};

// 表示用に b/# を ♭/♯ へ変換し、臨時記号は音名より一回り小さく描画する
export const renderWithAccidentals = (text: string) =>
  text
    .replace(/#/g, "♯")
    .replace(/b/g, "♭")
    .split("")
    .map((char, index) =>
      char === "♯" || char === "♭" ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: 表示専用の静的な文字列分割のため
        <span key={index}>
          {char}
        </span>
      ) : (
        char
      ),
    );

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
      <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">
        {renderWithAccidentals(root)}
      </span>
      <span className="text-lg sm:text-xl md:text-2xl leading-none">
        {renderWithAccidentals(type)}
      </span>
      {root !== bass && (
        <>
          <span className="text-lg sm:text-xl md:text-2xl leading-none">/</span>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none">
            {renderWithAccidentals(bass)}
          </span>
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
