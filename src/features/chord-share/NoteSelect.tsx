import { getDerivedNotes, NATURAL_NOTES } from "./constants";
import { useChordShare } from "./ChordShareContext";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function NoteSelect({ value, onChange }: Props) {
  const { accidentalDisplay } = useChordShare();
  const derivedNotes = getDerivedNotes(accidentalDisplay);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row place-items-center px-10">
        {derivedNotes.map((note, i) => (
          <div key={i} className="m-auto h-2/3 w-20">
            {note.value && (
              <span
                className={`btn btn-sm m-auto w-full cursor-pointer ${
                  note.value === value ? "btn-primary" : ""
                }`}
                onClick={() => onChange(note.value as string)}
              >
                {note.label}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-row place-items-center gap-2">
        {NATURAL_NOTES.map((note) => (
          <div key={note.value} className="m-auto w-20">
            <span
              className={`btn btn-sm m-auto w-full cursor-pointer ${
                note.value === value ? "btn-primary" : ""
              }`}
              onClick={() => onChange(note.value)}
            >
              {note.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
