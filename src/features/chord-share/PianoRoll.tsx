import { useMemo } from "react";
import { Note } from "tonal";

type Props = {
  startNote?: string;
  endNote?: string;
  activeNotes: string[];
};

function isBlackNote(note: string) {
  return note.includes("#") || note.includes("b");
}

export function PianoRoll({ startNote = "C2", endNote = "C5", activeNotes }: Props) {
  const { whiteKeys, blackKeysByLeftIndex } = useMemo(() => {
    const startMidi = Note.midi(startNote);
    const endMidi = Note.midi(endNote);
    const whites: { note: string; midi: number }[] = [];
    const blackMap = new Map<number, { note: string; midi: number }>();
    if (startMidi === null || endMidi === null) {
      return { whiteKeys: whites, blackKeysByLeftIndex: blackMap };
    }
    for (let m = startMidi; m < endMidi; m++) {
      const note = Note.fromMidi(m);
      if (!isBlackNote(note)) {
        whites.push({ note, midi: m });
      }
    }
    for (let i = 0; i < whites.length - 1; i++) {
      const between = whites[i].midi + 1;
      if (between < whites[i + 1].midi) {
        blackMap.set(i, { note: Note.fromMidi(between), midi: between });
      }
    }
    return { whiteKeys: whites, blackKeysByLeftIndex: blackMap };
  }, [startNote, endNote]);

  const activeMidiSet = useMemo(() => {
    const set = new Set<number>();
    activeNotes.forEach((note) => {
      const midi = Note.midi(note);
      if (midi !== null) set.add(midi);
    });
    return set;
  }, [activeNotes]);

  return (
    <div
      className="flex w-full flex-row border border-base-content/30 select-none"
      style={{ aspectRatio: `${whiteKeys.length * 3} / 8` }}
    >
      {whiteKeys.map((white, i) => {
        const whiteActive = activeMidiSet.has(white.midi);
        const black = blackKeysByLeftIndex.get(i);
        const blackActive = black ? activeMidiSet.has(black.midi) : false;
        return (
          <div key={white.note} className="relative h-full flex-1 min-w-0">
            <div
              className={`h-full w-full border border-base-content/20 ${whiteActive ? "bg-primary" : "bg-white"}`}
            />
            {black && (
              <div
                className={`absolute top-0 right-0 translate-x-1/2 h-[63%] w-[37.5%] border border-base-content/20 z-10 ${blackActive ? "bg-primary" : "bg-black"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
