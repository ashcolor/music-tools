import { describe, expect, it } from "vitest";
import { Chord, Note } from "tonal";
import {
  MAIN_TYPES,
  findMainTypeByType,
  isValidChordNotes,
  isValidMainType,
  isValidNote,
  isValidTension,
  parseChord,
  serializeChord,
} from "./constants";

function chordNotes(root: string, type: string): string[] {
  const intervals = Chord.get(`${root}${type}`).intervals;
  return intervals
    .map((iv) => Note.transpose(`${root}3`, iv))
    .filter((n): n is string => Boolean(n));
}

describe("MAIN_TYPES", () => {
  it("メインタイプの value が一意である", () => {
    const values = MAIN_TYPES.map((m) => m.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("テンションの type が全体で一意である（逆引き衝突を防ぐ）", () => {
    const allTypes = MAIN_TYPES.flatMap((m) => m.tensionOptions.map((t) => t.type));
    expect(new Set(allTypes).size).toBe(allTypes.length);
  });

  it("各メインタイプは少なくとも 1 つのテンションオプションを持つ", () => {
    for (const main of MAIN_TYPES) {
      expect(main.tensionOptions.length).toBeGreaterThan(0);
    }
  });

  it("各メインタイプの最初のテンションのラベルは「なし」", () => {
    for (const main of MAIN_TYPES) {
      expect(main.tensionOptions[0].label).toBe("なし");
    }
  });
});

describe("構成音が tonal で取得できる（全 type）", () => {
  for (const main of MAIN_TYPES) {
    for (const tension of main.tensionOptions) {
      it(`${main.label} × ${tension.label} → C${tension.type}`, () => {
        const notes = chordNotes("C", tension.type);
        expect(notes.length).toBeGreaterThan(0);
        for (const n of notes) {
          expect(n).toBeTruthy();
        }
      });
    }
  }
});

describe("代表的なコードの構成音", () => {
  const cases: Array<{ root: string; type: string; expected: string[] }> = [
    { root: "C", type: "", expected: ["C3", "E3", "G3"] },
    { root: "C", type: "M7", expected: ["C3", "E3", "G3", "B3"] },
    { root: "C", type: "7", expected: ["C3", "E3", "G3", "Bb3"] },
    { root: "C", type: "7#11", expected: ["C3", "E3", "G3", "Bb3", "F#4"] },
    { root: "C", type: "M7#11", expected: ["C3", "E3", "G3", "B3", "F#4"] },
    { root: "C", type: "m7", expected: ["C3", "Eb3", "G3", "Bb3"] },
    { root: "C", type: "m7b5", expected: ["C3", "Eb3", "Gb3", "Bb3"] },
    { root: "C", type: "dim7", expected: ["C3", "Eb3", "Gb3", "Bbb3"] },
    { root: "C", type: "7sus4", expected: ["C3", "F3", "G3", "Bb3"] },
    { root: "C", type: "sus2", expected: ["C3", "D3", "G3"] },
    { root: "C", type: "maj7#5", expected: ["C3", "E3", "G#3", "B3"] },
    { root: "C", type: "5", expected: ["C3", "G3"] },
    { root: "C", type: "add9", expected: ["C3", "E3", "G3", "D4"] },
    { root: "C", type: "13", expected: ["C3", "E3", "G3", "Bb3", "D4", "A4"] },
  ];
  for (const c of cases) {
    it(`${c.root}${c.type} → ${c.expected.join(", ")}`, () => {
      expect(chordNotes(c.root, c.type)).toEqual(c.expected);
    });
  }
});

describe("findMainTypeByType", () => {
  it("登録済み type の逆引きができる", () => {
    expect(findMainTypeByType("")?.main.label).toBe("メジャー");
    expect(findMainTypeByType("M7")?.main.label).toBe("メジャー");
    expect(findMainTypeByType("m7")?.main.label).toBe("マイナー");
    expect(findMainTypeByType("dim7")?.main.label).toBe("dim");
    expect(findMainTypeByType("7sus4")?.main.label).toBe("sus4");
    expect(findMainTypeByType("sus2")?.main.label).toBe("sus2");
    expect(findMainTypeByType("maj7#5")?.main.label).toBe("aug");
    expect(findMainTypeByType("5")?.main.label).toBe("パワーコード");
  });

  it("未登録の type は null を返す", () => {
    expect(findMainTypeByType("Mb9")).toBeNull();
    expect(findMainTypeByType("xxx")).toBeNull();
  });

  it("テンションラベルも一緒に取れる", () => {
    expect(findMainTypeByType("7#11")?.tension.label).toBe("♯11");
    expect(findMainTypeByType("m7b5")?.tension.label).toBe("♭5");
    expect(findMainTypeByType("maj7#5")?.tension.label).toBe("M7");
  });
});

describe("isValid*", () => {
  it("isValidNote", () => {
    expect(isValidNote("C")).toBe(true);
    expect(isValidNote("C#")).toBe(true);
    expect(isValidNote("Db")).toBe(true);
    expect(isValidNote("H")).toBe(false);
    expect(isValidNote("")).toBe(false);
  });

  it("isValidMainType", () => {
    expect(isValidMainType("")).toBe(true);
    expect(isValidMainType("m")).toBe(true);
    expect(isValidMainType("dim")).toBe(true);
    expect(isValidMainType("xxx")).toBe(false);
  });

  it("isValidTension（type 文字列ベース）", () => {
    expect(isValidTension("", "7")).toBe(true);
    expect(isValidTension("", "M7")).toBe(true);
    expect(isValidTension("m", "m7")).toBe(true);
    expect(isValidTension("m", "7")).toBe(false); // m 配下に "7" はない（"m7" はある）
    expect(isValidTension("sus4", "7sus4")).toBe(true);
    expect(isValidTension("aug", "maj7#5")).toBe(true);
    expect(isValidTension("xxx", "7")).toBe(false);
  });

  it("isValidChordNotes は登録済み type で true", () => {
    for (const main of MAIN_TYPES) {
      for (const tension of main.tensionOptions) {
        expect(isValidChordNotes("C", tension.type)).toBe(true);
      }
    }
  });

  it("isValidChordNotes は tonal フォールバックも効く", () => {
    // 登録外だが tonal が認識できるもの
    expect(isValidChordNotes("C", "M7b5")).toBe(true);
    expect(isValidChordNotes("C", "add9")).toBe(true);
    // 完全に解釈不能（root を二重に書いた等）
    expect(isValidChordNotes("C", "CCadd9")).toBe(false);
  });
});

describe("parseChord / serializeChord", () => {
  it("ルートだけ", () => {
    const p = parseChord("C");
    expect(p).toEqual({ root: "C", type: "", bass: "C" });
  });

  it("メジャー 7", () => {
    expect(parseChord("CM7")).toEqual({ root: "C", type: "M7", bass: "C" });
  });

  it("sus4 + 7", () => {
    expect(parseChord("C7sus4")).toEqual({ root: "C", type: "7sus4", bass: "C" });
  });

  it("オンコード", () => {
    expect(parseChord("Dm7/G")).toEqual({ root: "D", type: "m7", bass: "G" });
  });

  it("serializeChord: bass=root のとき省略", () => {
    expect(serializeChord("C", "M7", "C")).toBe("CM7");
  });

  it("serializeChord: bass!=root のとき付与", () => {
    expect(serializeChord("D", "m7", "G")).toBe("Dm7/G");
  });

  it("parse → serialize でラウンドトリップ", () => {
    const samples = ["C", "CM7", "C7", "Cm7", "C7sus4", "Cm7b5", "Cmaj7#5", "Dm7/G", "Fsus2"];
    for (const s of samples) {
      const p = parseChord(s);
      expect(serializeChord(p.root, p.type, p.bass)).toBe(s);
    }
  });
});
