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
