export type Sound =
  | "electronicLow"
  | "electronicMid"
  | "electronicHigh"
  | "bassDrum"
  | "snare"
  | "hiHat";

export type RhythmSettings = {
  sound: Sound;
  beats: number;
  volume: number;
  pan: number;
};
