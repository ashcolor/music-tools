import { Chord, Note } from "tonal";

export const INITIAL_CHORDS = ["Fsus2", "Gsus4", "Am7", "Em7"];

export type AccidentalDisplay = "sharp" | "flat";

export const NATURAL_NOTES = [
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "G", value: "G" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
];

const SHARP_DERIVED = [
  { label: "C♯", value: "C#" },
  { label: "D♯", value: "D#" },
  { label: "", value: null },
  { label: "F♯", value: "F#" },
  { label: "G♯", value: "G#" },
  { label: "A♯", value: "A#" },
] as const;

const FLAT_DERIVED = [
  { label: "D♭", value: "Db" },
  { label: "E♭", value: "Eb" },
  { label: "", value: null },
  { label: "G♭", value: "Gb" },
  { label: "A♭", value: "Ab" },
  { label: "B♭", value: "Bb" },
] as const;

export function getDerivedNotes(
  accidental: AccidentalDisplay,
): { label: string; value: string | null }[] {
  return accidental === "flat" ? [...FLAT_DERIVED] : [...SHARP_DERIVED];
}

const SHARP_TO_FLAT: Record<string, string> = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb",
};
const FLAT_TO_SHARP: Record<string, string> = Object.fromEntries(
  Object.entries(SHARP_TO_FLAT).map(([s, f]) => [f, s]),
);

export function toAccidental(note: string, accidental: AccidentalDisplay): string {
  if (!note) return note;
  if (accidental === "flat" && SHARP_TO_FLAT[note]) return SHARP_TO_FLAT[note];
  if (accidental === "sharp" && FLAT_TO_SHARP[note]) return FLAT_TO_SHARP[note];
  return note;
}

export function convertChordToAccidental(chord: string, accidental: AccidentalDisplay): string {
  const { root, type, bass } = parseChord(chord);
  return serializeChord(
    toAccidental(root, accidental),
    type,
    toAccidental(bass, accidental),
  );
}

export type TensionOption = {
  label: string;
  type: string;
};

export type MainType = {
  label: string;
  value: string;
  tensionOptions: TensionOption[];
};

export const MAIN_TYPES: MainType[] = [
  {
    label: "メジャー",
    value: "",
    tensionOptions: [
      { label: "なし", type: "" },
      { label: "M7", type: "M7" },
      { label: "7", type: "7" },
      { label: "6", type: "6" },
      { label: "add9", type: "add9" },
      { label: "9", type: "9" },
      { label: "♭9", type: "7b9" },
      { label: "♯9", type: "7#9" },
      { label: "♯11", type: "7#11" },
      { label: "M7♯11", type: "M7#11" },
      { label: "13", type: "13" },
      { label: "M13", type: "maj13" },
    ],
  },
  {
    label: "マイナー",
    value: "m",
    tensionOptions: [
      { label: "なし", type: "m" },
      { label: "M7", type: "mM7" },
      { label: "7", type: "m7" },
      { label: "6", type: "m6" },
      { label: "9", type: "m9" },
      { label: "11", type: "m11" },
      { label: "13", type: "m13" },
      { label: "♭5", type: "m7b5" },
      { label: "♯5", type: "m7#5" },
    ],
  },
  {
    label: "dim",
    value: "dim",
    tensionOptions: [
      { label: "なし", type: "dim" },
      { label: "7", type: "dim7" },
    ],
  },
  {
    label: "sus4",
    value: "sus4",
    tensionOptions: [
      { label: "なし", type: "sus4" },
      { label: "7", type: "7sus4" },
      { label: "9", type: "9sus4" },
    ],
  },
  {
    label: "sus2",
    value: "sus2",
    tensionOptions: [{ label: "なし", type: "sus2" }],
  },
  {
    label: "aug",
    value: "aug",
    tensionOptions: [
      { label: "なし", type: "aug" },
      { label: "M7", type: "maj7#5" },
      { label: "7", type: "7#5" },
      { label: "7♭9", type: "7b9#5" },
      { label: "9", type: "9#5" },
      { label: "7♯9", type: "7#5#9" },
    ],
  },
  {
    label: "パワーコード",
    value: "5",
    tensionOptions: [{ label: "なし", type: "5" }],
  },
];

export function findMainTypeByType(type: string) {
  for (const main of MAIN_TYPES) {
    const tension = main.tensionOptions.find((t) => t.type === type);
    if (tension) return { main, tension };
  }
  return null;
}

const VALID_NOTE_SET = new Set<string>([
  ...NATURAL_NOTES.map((n) => n.value),
  ...SHARP_DERIVED.filter((n) => n.value).map((n) => n.value as string),
  ...FLAT_DERIVED.filter((n) => n.value).map((n) => n.value as string),
]);

export function isValidNote(value: string) {
  if (!value) return false;
  return VALID_NOTE_SET.has(value);
}

export function isValidMainType(value: string) {
  return MAIN_TYPES.some((m) => m.value === value);
}

export function isValidTension(mainType: string, type: string) {
  const main = MAIN_TYPES.find((m) => m.value === mainType);
  if (!main) return false;
  return main.tensionOptions.some((t) => t.type === type);
}

export function isValidChordNotes(root: string, type: string) {
  if (!isValidNote(root)) return false;
  // 登録済みの type は有効
  if (findMainTypeByType(type)) return true;
  // それ以外は tonal で検証（シャープ正規化したルートで安定して引く）
  try {
    const normalizedRoot = Note.enharmonic(root) || root;
    const chord = Chord.get(`${normalizedRoot}${type}`);
    return !chord.empty && chord.notes.length > 0;
  } catch {
    return false;
  }
}

export function parseChord(s: string) {
  const str = s || "";
  const lastSlash = str.lastIndexOf("/");
  if (lastSlash >= 0) {
    const candidate = str.slice(lastSlash + 1);
    if (isValidNote(candidate)) {
      const main = str.slice(0, lastSlash);
      const [r, t] = Chord.tokenize(main);
      const root = r || "C";
      return { root, type: t || "", bass: candidate };
    }
  }
  const [r, t] = Chord.tokenize(str);
  const root = r || "C";
  return { root, type: t || "", bass: root };
}

export function serializeChord(root: string, type: string, bass: string) {
  return bass && bass !== root ? `${root}${type}/${bass}` : `${root}${type}`;
}
