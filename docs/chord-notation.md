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
<Root><Type>[/<Bass>]
```

- **Root**: `C D E F G A B` ＋ シャープ系の派生音 `C# D# F# G# A#`（内部値は `#` に正規化、UI 表示のみ `C♯/D♭` のように異名併記）
- **Type**: 「メインタイプ」と「テンション」の組合せで決まる **完全な type 文字列**（tonal が `Chord.get(root + type)` で構成音を返せるもの）。詳細は次節。
- **Bass**: ルートと異なる場合のみ `/Bass` を付加（同じなら省略が正規形）

### メインタイプ × テンション 一覧

UI 上は「メインタイプ → テンション」の 2 段選択。**選んだ組合せに対応する type 文字列が tonal でちゃんと構成音を返すよう、登録テーブルで一意にマッピング**してある（[MAIN_TYPES](../src/features/chord-share/constants.ts)）。

| メインタイプ (value) | テンション label → 内部 type |
|---|---|
| **メジャー** (`""`) | なし→`""`, M7→`M7`, 7→`7`, 6→`6`, add9→`add9`, 9→`9`, ♭9→`7b9`, ♯9→`7#9`, ♯11→`7#11`, M7♯11→`M7#11`, 13→`13`, M13→`maj13` |
| **マイナー** (`m`) | なし→`m`, M7→`mM7`, 7→`m7`, 6→`m6`, 9→`m9`, 11→`m11`, 13→`m13`, ♭5→`m7b5`, ♯5→`m7#5` |
| **dim** (`dim`) | なし→`dim`, 7→`dim7` |
| **sus4** (`sus4`) | なし→`sus4`, 7→`7sus4`, 9→`9sus4` |
| **sus2** (`sus2`) | なし→`sus2` のみ |
| **aug** (`aug`) | なし→`aug`, M7→`maj7#5`, 7→`7#5`, 7♭9→`7b9#5`, 9→`9#5`, 7♯9→`7#5#9` |
| **パワー** (`5`) | なし→`5` のみ |

### 一般表記との差異

- メジャー無印は内部値も **`""` 固定**（`M` ではない）。`C` 単独で C メジャー。
- メジャー 7th は内部 `M7` 固定（`maj7` / `△7` は使わない）。ただし M13 のみ `maj13`（tonal が `M13` を認識しないため）。
- aug は単独 `aug` のみ。aug + 拡張は **`#5` サフィックス系**（`maj7#5`, `7#5`, `7b9#5` 等）にマップ。
- ディミニッシュ・オーグメントの記号表記（`°`, `+`, `ø`）は採用せず、ASCII の `dim` / `aug` を使う。
- 「♭5」と「♯11」は **異名同音だが構成音が違う**ため別物として扱う（詳細は § 9）。`b5/#11` のような両論併記ラベルは廃止。
- テンションは MainType ごとに使える集合を [MAIN_TYPES](../src/features/chord-share/constants.ts) で限定しており、UI 上は許可された組合せ以外は選べない。
- ただし `tonal` ライブラリが解釈できる広めの記法（`Cadd9`、`C13b9` 等）も [isValidChordNotes](../src/features/chord-share/constants.ts) のフォールバック判定で有効扱いになる（URL 直入力など）。

### パース・シリアライズ

- [parseChord](../src/features/chord-share/constants.ts): 文字列内の **最後の `/`** を Bass の区切りとして見る。残りを `tonal.Chord.tokenize` に渡して `(root, type)` を得る。type 文字列は登録テーブル ([findMainTypeByType](../src/features/chord-share/constants.ts)) で逆引きしてメインタイプ／テンションラベルを特定する。
- [serializeChord](../src/features/chord-share/constants.ts): `Bass === Root` のとき `/Bass` を省略。

### 再生時

[ChordPlayer](../src/features/chord-share/ChordPlayer.tsx) と [route.tsx](../src/features/chord-share/route.tsx) では `Chord.get(root + type).intervals` を取り、各 interval を `${root}3` から `Note.transpose` で展開して **オクターブ 3 起点の構成音** を得る（`Chord.notes("", "C3")` は空配列を返す tonal の制約を回避するため）。Bass は現状、表記専用で構成音には反映していない。

### URL シェア

[route.tsx](../src/features/chord-share/route.tsx) で `?chord=...` クエリにカンマ区切り保存。コード単体の表記にカンマは含めない前提。

```
?chord=Fsus2,Gsus4,Am7,Em7
```

---

## 9. tonal ライブラリでの解釈調査

[tonal](https://github.com/tonaljs/tonal) v6.4.3 における `Chord.get(root + type)` の動作を実測した結果。アプリの内部値（type 文字列）として何を採用すべきかの判断材料。

### 9.1 主要な発見

#### ♭5 と ♯11 は別物として扱われる（異名同音だが構成音が違う）

| 入力 | tonal の解釈 | 構成音 |
|---|---|---|
| `C7b5` | dominant 7♭5（5度置換） | `C, E, G♭, B♭` |
| `C7#11` | lydian dominant | `C, E, G, B♭, F♯` |
| `CM7b5` | major 7♭5（5度置換） | `C, E, G♭, B` |
| `CM7#11` | major 7 ♯11 | `C, E, G, B, F♯` |
| `Cm7b5` | half-diminished | `C, E♭, G♭, B♭` |
| `Cm7#11` | **empty（認識不可）** | — |

♭5 は完全 5 度を **置換**、♯11 は完全 5 度を **残したまま追加** という違いが構成音に反映される。

#### 単独テンション表記はルート文字列を侵食する

| 入力 | tonal の誤解釈 |
|---|---|
| `Cb5` | 「C♭ のパワーコード」（root が C♭ になる） |
| `C#11` | 「C♯ の 11th コード」（root が C♯ になる） |
| `C7(b9)` | **empty**（括弧記法は非対応） |
| `C7(#11)` | **empty** |

→ **アプリ内部の type 文字列に `()` は使えない**。`Cb9` や `C#11` のようにルート直後にテンションを置く形も避けるべき。

### 9.2 メインタイプ別の動作確認結果

ルート `C` で `Chord.get("C" + type)` を呼び、`empty: false` かつ `notes.length > 0` を OK とした。

#### メジャー（value `""` を推奨、現状 `"M"` だと拡張が全滅）

現状の `value: "M"` だと `CMb9`, `CM9`, `CM#9`, `CM6/13` などが NG。`value: ""` にすれば素直に `C7b9` の形になる。

| 採用候補 type | 名前 | 構成音 |
|---|---|---|
| `(empty)` | C major | `C, E, G` |
| `M7` / `maj7` | major seventh | `C, E, G, B` |
| `7` | dominant seventh | `C, E, G, B♭` |
| `6` | sixth | `C, E, G, A` |
| `add9` | (add9) | `C, E, G, D` |
| `9` | dominant ninth | `C, E, G, B♭, D` |
| `7b9` | dominant ♭9 | `C, E, G, B♭, D♭` |
| `7#9` | dominant ♯9 | `C, E, G, B♭, D♯` |
| `7#11` | lydian dominant | `C, E, G, B♭, F♯` |
| `M7#11` / `maj7#11` | major 7 ♯11 | `C, E, G, B, F♯` |
| `7#5` | （aug 7 として扱われる） | `C, E, G♯, B♭` |
| `7b13` | （5度なし） | `C, E, B♭, A♭` |
| `13` | dominant 13 | `C, E, G, B♭, D, A` |
| `maj13` | major 13 | `C, E, G, B, D, A` |

NG だったもの: `(b9)`, `add b9`, `M7#5`, `+M7`, `M13`。

#### マイナー（value `"m"` のまま OK）

| type | 名前 | 構成音 |
|---|---|---|
| `m` | C minor | `C, E♭, G` |
| `m7` | minor seventh | `C, E♭, G, B♭` |
| `mM7` / `mMaj7` | minor/major seventh | `C, E♭, G, B` |
| `m6` | minor sixth | `C, E♭, G, A` |
| `m9` | minor ninth | `C, E♭, G, B♭, D` |
| `m11` | minor eleventh | `C, E♭, G, B♭, D, F` |
| `m13` | minor thirteenth | `C, E♭, G, B♭, D, A` |
| `m7b5` / `h7` / `ø` | half-diminished | `C, E♭, G♭, B♭` |
| `m7#5` | (♯5) | `C, E♭, A♭, B♭` |

NG だったもの: `m7b9`, `m7#11`, `mb13`, `minMaj7`, `m(maj7)`。

#### dim（拡張がほぼ全滅）

| type | 名前 | 構成音 |
|---|---|---|
| `dim` / `°` | diminished | `C, E♭, G♭` |
| `dim7` / `°7` | diminished seventh | `C, E♭, G♭, B𝄫` |

NG: `dimMaj7`, `dim7b9`, `dim9`, `dim6`, `dim13` すべて非対応。

#### sus 系

| type | 名前 | 構成音 |
|---|---|---|
| `sus4` / `sus` | suspended 4 | `C, F, G` |
| `7sus4` / `7sus` | sus4 7 | `C, F, G, B♭` |
| `9sus4` | (sus4 9) | `C, F, G, B♭, D` |
| `sus2` | suspended 2 | `C, D, G` |

注意: `7sus2` は **NG**（tonal が認識しない）。sus2 + 7th を表現したい場合は別ルートが必要。

#### aug（aug プレフィックスは効かず、`#5` サフィックスで表現）

| type | 名前 | 構成音 |
|---|---|---|
| `aug` / `+` | augmented | `C, E, G♯` |
| `maj7#5` | augmented seventh | `C, E, G♯, B` |
| `7#5` | （ドミナント 7♯5） | `C, E, G♯, B♭` |
| `7b9#5` | | `C, E, G♯, B♭, D♭` |
| `9#5` | | `C, E, G♯, B♭, D` |
| `7#5#9` | | `C, E, G♯, B♭, D♯` |

NG: `augMaj7`, `+M7`, `aug7b9`, `aug9`, `+9`, `aug7#9`, `aug7#11`, `aug6`, `aug13`, `13#5`。
→ **aug 系は `aug` プレフィックスではなく `#5` サフィックス**で表現する必要がある。実質、メジャー側の type バリエーションとして扱う方が tonal とは整合する。

#### パワーコード

| type | 名前 | 構成音 |
|---|---|---|
| `5` | fifth | `C, G` |

### 9.3 現状実装との乖離

[constants.ts](../src/features/chord-share/constants.ts) の `MAIN_TYPES` × `tensionOptions` の組み合わせのうち、以下が tonal で **構成音を取得できない**：

- **メジャー (`M`)** のテンション: `M7`, `b9`, `9`, `#9`, `b5/#11`, `#5/b13`, `6/13` すべて NG（`CM` + 拡張 → `CMM7`, `CMb9` などが非対応）。例外: `CM7` のみ `C` + `M7` と解釈されて OK。
- **マイナー (`m`)** のテンション: `b9`, `b5/#11`, `#5/b13`, `6/13` が NG。
- **dim** のテンション: `M7`, `7` 以外すべて NG（`dim7` 以外）。
- **sus4** のテンション: `7`, `9` ともに NG（`Csus47`, `Csus49` の順序問題）。
- **sus2** のテンション: `7` が NG（`Csus27`）。
- **aug** のテンション: すべて NG（`Caug` 以外）。
- **`b5/#11`, `#5/b13`, `6/13`** はスラッシュを含むため、[parseChord](../src/features/chord-share/constants.ts) の `lastIndexOf("/")` で Bass と誤認される二重バグ。

### 9.4 設計指針

実装で破綻させないために最低限守るべきこと：

1. **メジャー無印の value は `""` にする**（`M` ではなく）。現状の `M` プレフィックスは tonal とほぼ互換性がない。
2. **テンション選択肢は「メインタイプ + テンション = tonal で解釈可能な完全な type 文字列」になるよう構築する**。例：メジャー側で「♯11」を選んだら内部値は `7#11`、「M7+♯11」を選んだら `M7#11`。
3. **スラッシュを含むテンション表記（`b5/#11` 等）は廃止**。UI ラベルとして「♯11」「♯5」「6」のように片方に絞る。
4. **aug + 拡張テンションはメインタイプ aug の配下ではなく、メジャー側の `7#5` 系として持つ**（tonal の解釈に合わせる）。または `aug` をメインタイプから外して「テンション扱い」にする。
5. **sus2 + 7th は tonal で表現不可** なので選択肢から除外、または別途実装。
6. **dim は `dim` / `dim7` のみ** を選択肢にする（他は捨てる）。

---

## 参考

- [コード（和音）の種類とコードネームの表記 — うちやま作曲教室](https://sakkyoku.info/beginner/chord-type/)
- [テンションコード 概念と表記法 — SoundQuest](https://soundquest.jp/quest/chord/chord-mv4/tension-chord-concept/)
- [分数コード・オンコード・スラッシュコード — 作曲図書室](https://musicsounds.art/slashchord/)
- [基本的なコードネームを理解しよう — ヤマハ music_pal](https://jp.yamaha.com/services/music_pal/study/chord/name/index.html)
- [Chord notation — Wikipedia (English)](https://en.wikipedia.org/wiki/Chord_notation)
- [Chord Symbols — Open Music Theory](https://viva.pressbooks.pub/openmusictheory/chapter/chord-symbols/)
- [A Complete Guide to Chord Symbols — Musicnotes](https://www.musicnotes.com/blog/a-complete-guide-to-chord-symbols-in-music/)
