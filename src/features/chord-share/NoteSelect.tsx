import { getDerivedNotes, NATURAL_NOTES } from "./constants";
import { useChordShare } from "./ChordShareContext";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

const noteBtnClass = (active: boolean) =>
  `btn btn-xs w-full px-0 sm:btn-sm sm:px-2 ${active ? "btn-primary" : ""}`;

export function NoteSelect({ value, onChange }: Props) {
  const { accidentalDisplay } = useChordShare();
  const derivedNotes = getDerivedNotes(accidentalDisplay);

  return (
    <div className="relative w-full overflow-visible pt-6 sm:pt-8">
      <div className="flex w-full gap-0.5 overflow-visible sm:gap-1">
        {NATURAL_NOTES.map((note, i) => {
          const sharp = i < derivedNotes.length ? derivedNotes[i] : null;

          return (
            <div key={note.value} className="relative min-w-0 flex-1 overflow-visible">
              {sharp?.value && (
                <button
                  type="button"
                  className={`${noteBtnClass(sharp.value === value)} absolute bottom-full right-0 z-20 mb-px translate-x-1/2`}
                  onClick={() => onChange(sharp.value as string)}
                >
                  {sharp.label}
                </button>
              )}
              <button
                type="button"
                className={noteBtnClass(note.value === value)}
                onClick={() => onChange(note.value)}
              >
                {note.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
