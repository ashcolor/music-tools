import { Chord, Note } from "tonal";

export const INITIAL_CHORDS = ["Fsus2", "Gsus4", "Am7", "Em7"];

export type AccidentalDisplay = "sharp" | "flat" | "auto";

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

/**
 * コード構成音をピッチクラスに潰し、C4(MIDI 60)付近のクローズドボイシングに
 * 再配置する。テンションが入っても上に伸びず、間延びしない響きになる。
 * bass を指定すると低音ベースとして先頭に追加する(スラッシュコード対応)。
 */
export function buildChordVoicing(
  root: string,
  type: string,
  bass?: string,
): string[] {
  const { notes } = Chord.get(`${root}${type}`);
  const chromas = notes
    .map((n) => Note.chroma(n))
    .filter((c): c is number => c !== undefined);
  if (chromas.length === 0) return [];

  // 一番低いピッチクラスを起点に回転
  let index = 0;
  for (let a = 1; a < chromas.length; a++) {
    if (chromas[a] < chromas[index]) index = a;
  }
  const rotated = chromas
    .concat(chromas)
    .slice(index, chromas.length + index);

  // C4付近から、直前の音以上で一番近い同名音へ積み直す
  let prev = 60;
  const midis = rotated.map((c) => (prev += (((c - prev) % 12) + 12) % 12));
  const tones = midis
    .map((m) => Note.fromMidi(m))
    .filter((n): n is string => Boolean(n));

  return bass ? [`${bass}2`, ...tones] : tones;
}

/**
 * ルート音を起点に上へ堆積したボイシングを返す(コード設定画面の鍵盤表示用)。
 * buildChordVoicing と違い最低ピッチクラスへの回転を行わない。
 */
export function buildChordVoicingFromRoot(
  root: string,
  type: string,
  bass?: string,
): string[] {
  const { notes } = Chord.get(`${root}${type}`);
  const chromas = notes
    .map((n) => Note.chroma(n))
    .filter((c): c is number => c !== undefined);
  if (chromas.length === 0) return [];

  // ルート(配列先頭)から、直前の音以上で一番近い同名音へ積み上げ
  let prev = 60;
  const midis = chromas.map((c) => (prev += (((c - prev) % 12) + 12) % 12));
  const tones = midis
    .map((m) => Note.fromMidi(m))
    .filter((n): n is string => Boolean(n));

  return bass ? [`${bass}2`, ...tones] : tones;
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

const SHARP_PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function transposeNote(
  note: string,
  semitones: number,
  accidental: AccidentalDisplay,
): string {
  const chroma = Note.chroma(note);
  if (chroma === undefined) return note;
  const next = (((chroma + semitones) % 12) + 12) % 12;
  return toAccidental(SHARP_PITCH_CLASSES[next], accidental);
}

/** コードのルート/ベースを半音単位で移調する。type はそのまま維持する。 */
export function transposeChord(
  chord: string,
  semitones: number,
  accidental: AccidentalDisplay,
): string {
  const { root, type, bass } = parseChord(chord);
  return serializeChord(
    transposeNote(root, semitones, accidental),
    type,
    transposeNote(bass, semitones, accidental),
  );
}
