import type { Sound } from "../types";

export const BEATS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export const SOUNDS: Sound[] = [
  "electronicLow",
  "electronicMid",
  "electronicHigh",
  "bassDrum",
  "snare",
  "hiHat",
];

export const SOUND_OPTIONS: { value: Sound; label: string }[] = [
  { value: "electronicLow", label: "電子音低" },
  { value: "electronicMid", label: "電子音中" },
  { value: "electronicHigh", label: "電子音高" },
  { value: "bassDrum", label: "バスドラム" },
  { value: "snare", label: "スネア" },
  { value: "hiHat", label: "ハイハット" },
];
