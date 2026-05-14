import { Chord } from "tonal";

export const INITIAL_CHORDS = ["Fsus2", "Gsus4", "Am7", "Em7"];

export const NATURAL_NOTES = [
  { label: "C", value: "C" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "G", value: "G" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
];

export const DERIVED_NOTES: { label: string; value: string | null }[] = [
  { label: "C♯/D♭", value: "C#" },
  { label: "D♯/E♭", value: "D#" },
  { label: "", value: null },
  { label: "F♯/G♭", value: "F#" },
  { label: "G♯/A♭", value: "G#" },
  { label: "A♯/B♭", value: "A#" },
];

export type MainType = {
  label: string;
  value: string;
  tensionOptions: string[];
};

export const MAIN_TYPES: MainType[] = [
  {
    label: "メジャー",
    value: "M",
    tensionOptions: ["M7", "7", "b9", "9", "#9", "b5/#11", "#5/b13", "6/13"],
  },
  {
    label: "マイナー",
    value: "m",
    tensionOptions: ["M7", "7", "b9", "9", "11", "b5/#11", "#5/b13", "6/13"],
  },
  {
    label: "dim",
    value: "dim",
    tensionOptions: ["M7", "7", "b9", "9", "6/13"],
  },
  { label: "sus4", value: "sus4", tensionOptions: ["7", "9"] },
  { label: "sus2", value: "sus2", tensionOptions: ["7"] },
  {
    label: "aug",
    value: "aug",
    tensionOptions: ["M7", "b9", "9", "#9", "b5/#11", "6/13"],
  },
  { label: "パワーコード", value: "5", tensionOptions: [] },
];

export const TENSION_TYPES = [
  { label: "M7", value: "M7" },
  { label: "7", value: "7" },
  { label: "b9", value: "b9" },
  { label: "9", value: "9" },
  { label: "#9", value: "#9" },
  { label: "11", value: "11" },
  { label: "b5/#11", value: "b5/#11" },
  { label: "#5/b13", value: "#5/b13" },
  { label: "6/13", value: "6/13" },
];

const VALID_NOTE_SET = new Set<string>([
  ...NATURAL_NOTES.map((n) => n.value),
  ...DERIVED_NOTES.filter((n) => n.value).map((n) => n.value as string),
]);

export function isValidNote(value: string) {
  if (!value) return false;
  return VALID_NOTE_SET.has(value);
}

export function isValidMainType(value: string) {
  return MAIN_TYPES.some((m) => m.value === value);
}

export function isValidTension(mainType: string, tension: string) {
  if (!tension) return true;
  const main = MAIN_TYPES.find((m) => m.value === mainType);
  return main ? main.tensionOptions.includes(tension) : false;
}

export function isValidChordNotes(root: string, type: string) {
  if (!isValidNote(root)) return false;
  // 登録済みのメインタイプ・テンション組合せは有効とみなす
  for (const main of MAIN_TYPES) {
    if (type === main.value) return true;
    for (const tension of main.tensionOptions) {
      if (type === `${main.value}${tension}`) return true;
    }
  }
  // それ以外は tonal で検証
  try {
    const chord = Chord.get(`${root}${type}`);
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
