# コード表記について

コードネーム（chord symbol）の一般的な書き方と、本アプリ（chord-share 機能）で採用している表記ルールについてのメモ。

## 1. コードネームの全体構造

ポピュラー／ジャズで広く使われるコードネームは、おおむね次の 4 パーツの連結で表現される。

```
<Root><Quality><Extensions>[/<Bass>]
```

| パーツ | 例 | 意味 |
|---|---|---|
| Root | `C`, `F#`, `Bb` | 根音（コードの基準音） |
| Quality | `m`, `dim`, `aug`, `sus4` | 三和音／特殊和音の種別 |
| Extensions | `7`, `M7`, `9`, `add9`, `b13` | 7th・テンション・付加音 |
| Bass | `/G` | ベース音指定（オンコード／分数コード） |

例:

- `C` … C メジャー
- `Am7` … A マイナーセブンス
- `G7(b9)` … G ドミナントセブンス・♭9 付き
- `Dm7/G` … D マイナーセブンスのオンコード（ベース G）

慣習として **「単独で書かれた音名は長三和音を指す」** ことに合意があり、`C` は C メジャー、`F#` は F♯ メジャーを意味する。

## 2. ルート音 (Root)

- 英語音名 `C D E F G A B` を使う。
- 派生音は **右肩に `♯` / `♭`**（または `#` / `b`）を添える。例: `F#`, `Bb`。
- 異名同音（`C#` と `Db` など）はどちらで書いてもよいが、調性的に「正しい綴り」を選ぶのが一般的（例: A♭メジャー上では `Eb` ではなく `E♭` 系統で揃える）。

## 3. クオリティ (Quality)

三和音とその仲間の表記。同じものに複数の流派がある点に注意。

| 種類 | 構成音（root から） | 主な表記 | 備考 |
|---|---|---|---|
| メジャー | 1, 3, 5 | （無印） / `M` / `maj` / `△` | 単独の `C` は C メジャー |
| マイナー | 1, ♭3, 5 | `m` / `min` / `-` | 小文字の `m` が最も一般的 |
| ディミニッシュ（減） | 1, ♭3, ♭5 | `dim` / `°` | ジャズでは `°` 記号もよく使われる |
| ハーフディミニッシュ | 1, ♭3, ♭5, ♭7 | `m7(b5)` / `ø` | `m7♭5` と等価 |
| オーグメント（増） | 1, 3, ♯5 | `aug` / `+` | |
| sus4 | 1, 4, 5 | `sus4` / `sus` | 3 度を完全 4 度で置き換え |
| sus2 | 1, 2, 5 | `sus2` | 3 度を長 2 度で置き換え |
| パワーコード | 1, 5 | `5` | 3 度を省略。ロック／ギターで頻出 |

## 4. 7th（セブンス）と拡張音

| 種類 | 構成音 | 表記 |
|---|---|---|
| ドミナント 7th | 1, 3, 5, ♭7 | `7` |
| メジャー 7th | 1, 3, 5, 7 | `M7` / `maj7` / `△7` |
| マイナー 7th | 1, ♭3, 5, ♭7 | `m7` |
| マイナー・メジャー 7th | 1, ♭3, 5, 7 | `mM7` / `m(maj7)` |
| ディミニッシュ 7th | 1, ♭3, ♭5, ♭♭7 | `dim7` / `°7` |
| ハーフディミニッシュ | 1, ♭3, ♭5, ♭7 | `m7(b5)` / `ø7` |

**6th コード**: `C6 = C, E, G, A`。マイナーは `Cm6`。

**add コード**: 7th を含めず、テンション音だけを追加する記法。`Cadd9 = C, E, G, D`。`C9` との違いは「7 度を含むかどうか」。

## 5. テンション (9th / 11th / 13th)

7th コードの上にさらに 3 度ずつ重ねた音をテンションと呼ぶ。9・11・13 はそれぞれ 2・4・6 のオクターブ上に当たる。

### ナチュラルとオルタード

- **ナチュラルテンション**: `9`, `11`, `13`（♯／♭が付かない）
- **オルタードテンション**: `b9`, `#9`, `#11`, `b13`（半音変化したもの）

オルタードテンションは原則として **ドミナント 7th コードでのみ** 使われるのが一般的（例: `G7(b9,b13)`）。

### 表記の積み方

セブンス表記の右肩に列記する。流派は主に 2 通り。

| 書き方 | 例 |
|---|---|
| 括弧でくくる | `C7(9)`, `G7(b9,#11,b13)` |
| 数字を上から書き連ねる | `C13`, `Cm11`, `G7b9` |

`C13` のように単に `13` と書いた場合、慣習的には **「9th と 11th も含めて積み上がっている前提」** で解釈される（実際の演奏では一部省略することが多い）。

### 省略の慣習（ジャズ）

実音は限られるので、慣習的に以下を省くことが多い。

- 9th を入れるとき → ルートを省略
- 11th を入れるとき → 3rd を省略（不協和を避けるため）
- 13th を入れるとき → 5th を省略

## 6. オンコード（分数コード／スラッシュコード）

ベース音をルート以外に指定する記法。

- 表記: `Chord/Bass` または `Chord on Bass`（後者は日本のポップスで多い）
- 例: `C/E` … C メジャーをベース E で鳴らす（第 1 転回形）
- 例: `Dm7/G` … コード上は Dm7、最低音だけ G（実質 `G7(9,11)` の上部構造として解釈されることも）

ベース音がコード構成音と一致しなくてもよい点が重要。これにより上部構造トライアド（Upper Structure Triad）的な響きを作れる。

## 7. 表記ゆれの吸収

同じ和音でも流派ごとに表記が違う。リードシート（lead sheet）読みでは、よく使われる対応を覚えておくと混乱しない。

| 意味 | バリエーション |
|---|---|
| メジャー 7th | `CM7` / `Cmaj7` / `C△7` / `CΔ7` |
| マイナー | `Cm` / `Cmin` / `C-` |
| ディミニッシュ 7th | `Cdim7` / `C°7` |
| ハーフディミニッシュ | `Cm7(b5)` / `Cø7` / `Cm7-5` |
| オーグメント | `Caug` / `C+` / `C(#5)` |

---

## 8. このアプリでの採用方針

[chord-share 機能](../src/features/chord-share/) では、上記の一般表記から **採用する表記をひとつに絞って** 簡略化している。詳細は [constants.ts](../src/features/chord-share/constants.ts) と [ChordSelectModal.tsx](../src/features/chord-share/ChordSelectModal.tsx)。

### 採用する形

```
<Root><MainType><Tension>[/<Bass>]
```

- **Root**: `C D E F G A B` ＋ シャープ系の派生音 `C# D# F# G# A#`（内部値は `#` に正規化、UI 表示のみ `C♯/D♭` のように異名併記）
- **MainType**: `M`（メジャー） / `m` / `dim` / `sus4` / `sus2` / `aug` / `5`（パワーコード）
- **Tension**: `M7` `7` `b9` `9` `#9` `11` `b5/#11` `#5/b13` `6/13`
- **Bass**: ルートと異なる場合のみ `/Bass` を付加（同じなら省略が正規形）

### 一般表記との差異

- メジャー 7th は **`M7` 固定**（`maj7` / `△7` は内部で使わない）。
- ディミニッシュ／オーグメントの記号表記（`°`, `+`, `ø`）は採用せず、ASCII の `dim` / `aug` を使う。
- テンションは MainType ごとに使える集合を [MAIN_TYPES](../src/features/chord-share/constants.ts) で限定しており、UI 上は許可された組合せ以外は選べない。
- ただし `tonal` ライブラリが解釈できる広めの記法（`Cadd9`、`C13b9` 等）も [isValidChordNotes](../src/features/chord-share/constants.ts) のフォールバック判定で有効扱いになる。

### パース・シリアライズ

- [parseChord](../src/features/chord-share/constants.ts): 文字列内の **最後の `/`** を Bass の区切りとして見る（`b5/#11` のようにテンション内部の `/` を誤検出しないため）。残りを `tonal.Chord.tokenize` に渡して `(root, type)` を得る。
- [serializeChord](../src/features/chord-share/constants.ts): `Bass === Root` のとき `/Bass` を省略。

### 再生時

[ChordPlayer](../src/features/chord-share/ChordPlayer.tsx) と [route.tsx](../src/features/chord-share/route.tsx) では `tonal.Chord.notes(type, root + "3")` で **オクターブ 3 起点の構成音** を取得して鳴らす。Bass は現状、表記専用で構成音には反映していない。

### URL シェア

[route.tsx](../src/features/chord-share/route.tsx) で `?chord=...` クエリにカンマ区切り保存。コード単体の表記にカンマは含めない前提。

```
?chord=Fsus2,Gsus4,Am7,Em7
```

---

## 参考

- [コード（和音）の種類とコードネームの表記 — うちやま作曲教室](https://sakkyoku.info/beginner/chord-type/)
- [テンションコード 概念と表記法 — SoundQuest](https://soundquest.jp/quest/chord/chord-mv4/tension-chord-concept/)
- [分数コード・オンコード・スラッシュコード — 作曲図書室](https://musicsounds.art/slashchord/)
- [基本的なコードネームを理解しよう — ヤマハ music_pal](https://jp.yamaha.com/services/music_pal/study/chord/name/index.html)
- [Chord notation — Wikipedia (English)](https://en.wikipedia.org/wiki/Chord_notation)
- [Chord Symbols — Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/chord-symbols/)
- [A Complete Guide to Chord Symbols — Musicnotes](https://www.musicnotes.com/blog/a-complete-guide-to-chord-symbols-in-music/)
