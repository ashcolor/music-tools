import { useEffect, useRef } from "react";
import { Note } from "tonal";
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from "vexflow";
import { type AccidentalDisplay, toAccidental } from "../utils/constants";

type Props = {
  notes: string[];
  accidentalDisplay?: AccidentalDisplay;
};

function convertNoteAccidental(note: string, accidental: AccidentalDisplay): string {
  const match = note.match(/^([A-G](?:#{1,2}|b{1,2})?)(\d+)$/);
  if (!match) return note;
  const [, pc, octave] = match;
  return toAccidental(pc, accidental) + octave;
}

// auto モード時に notes 配列からシャープ/フラットどちらを優先するか判定
// bass note（低音側）が root の表記スタイルを持つため、それを優先する
function inferAccidentalDisplay(notes: string[]): AccidentalDisplay {
  const hasSharp = notes.some((n) => /[A-G]#/.test(n));
  const hasFlat = notes.some((n) => /[A-G]b/.test(n));
  if (hasSharp && !hasFlat) return "sharp";
  if (hasFlat && !hasSharp) return "flat";
  // 混在（bass が # で treble が ♭ など）は bass を優先 → sharp
  if (hasSharp && hasFlat) return "sharp";
  return "auto";
}

function tonalToVexKey(note: string): string {
  const match = note.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
  if (!match) return "";
  const [, letter, acc = "", octave] = match;
  return `${letter.toLowerCase()}${acc}/${octave}`;
}

function getAccidental(note: string): string | null {
  const match = note.match(/^[A-G](#{1,2}|b{1,2})?/);
  return match?.[1] ?? null;
}

const STAVE_HEIGHT = 110;
const STAVE_Y = 10;

export function SheetMusic({ notes, accidentalDisplay = "auto" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const effective =
      accidentalDisplay === "auto" ? inferAccidentalDisplay(notes) : accidentalDisplay;
    const converted = notes.map((n) => convertNoteAccidental(n, effective));

    // C3(48)〜B6(95) の範囲のみ treble で表示
    const trebleNotes = converted
      .filter((n) => {
        const midi = Note.midi(n);
        return midi !== null && midi >= 48 && midi <= 95;
      })
      .sort((a, b) => (Note.midi(a) ?? 0) - (Note.midi(b) ?? 0));

    const width = el.clientWidth || 240;
    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(width, STAVE_HEIGHT);
    const context = renderer.getContext();

    context.setFont("Arial", 10);

    const staveWidth = width - 20;
    const stave = new Stave(10, STAVE_Y, staveWidth);
    stave.addClef("treble");
    stave.setContext(context).draw();

    const noteData = trebleNotes
      .map((n) => ({ key: tonalToVexKey(n), accidental: getAccidental(n) }))
      .filter((n) => n.key);

    if (noteData.length === 0) return;

    const staveNote = new StaveNote({
      keys: noteData.map((n) => n.key),
      duration: "w",
    });
    noteData.forEach(({ accidental }, i) => {
      if (accidental) {
        staveNote.addModifier(new Accidental(accidental), i);
      }
    });

    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.setStrict(false);
    voice.addTickables([staveNote]);

    new Formatter().joinVoices([voice]).format([voice], staveWidth - 60);

    voice.draw(context, stave);

    // draw後にbbox取得して中央に補正
    const staveNoteEl = el.querySelector<SVGGElement>(".vf-stavenote");
    if (staveNoteEl) {
      const bbox = staveNoteEl.getBBox();
      const noteStartX = stave.getNoteStartX();
      const staveEndX = stave.getX() + stave.getWidth();
      const centerX = (noteStartX + staveEndX) / 2;
      const noteCenterX = bbox.x + bbox.width / 2;
      const shift = centerX - noteCenterX;
      staveNoteEl.setAttribute("transform", `translate(${shift}, 0)`);
    }
  }, [notes, accidentalDisplay]);

  return <div ref={containerRef} className="w-full" style={{ height: STAVE_HEIGHT }} />;
}
