import type { ChordTemplate } from "./chordTemplates";

export const BUILTIN_TEMPLATES: ChordTemplate[] = [
  {
    id: "builtin:canon",
    name: "カノン進行",
    chords: "C,G,Am,Em,F,C,F,G",
    builtin: true,
  },
  {
    id: "builtin:royal-road",
    name: "王道進行",
    chords: "FM7,G7,Em7,Am7",
    builtin: true,
  },
  {
    id: "builtin:komuro",
    name: "小室進行",
    chords: "Am,F,G,C",
    builtin: true,
  },
  {
    id: "builtin:marunouchi",
    name: "丸サ進行",
    chords: "FM7,E7,Am7,C7",
    builtin: true,
  },
  {
    id: "builtin:confame",
    name: "コンファメ進行",
    chords: "C,Bm7b5,Em7,Am7,Gm7,C7,Fmaj7",
    builtin: true,
  },
  {
    id: "builtin:picardy",
    name: "ピカルディ終止",
    chords: "Ab,Bb,C",
    builtin: true,
  },
  {
    id: "builtin:cycle",
    name: "循環コード",
    chords: "C,Am,Dm,G",
    builtin: true,
  },
];
