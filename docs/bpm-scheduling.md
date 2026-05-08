# 正確なBPM再生について

メトロノームの音を「ジッターのない正確な間隔」で鳴らすための実装メモ。
基本的なアイデアは Chris Wilson の [二つの時計についての物語](https://web.dev/articles/audio-scheduling?hl=ja) に従っている。

実装は [MetronomeContext.tsx](../src/contexts/MetronomeContext.tsx)。

## 何が問題か

素朴に書くなら `setInterval(() => playClick(), 60000 / bpm)` で十分そうに見えるが、これだと正確には鳴らない。

- `setInterval` / `setTimeout` は最低発火時刻の保証しかない（最大数十ms単位で遅れる）
- メインスレッドの負荷（GC、レンダリング、他のタスク）で簡単にズレる
- ブラウザがバックグラウンドタブをスロットリングする
- `requestAnimationFrame` は最大60fps（≒16.7ms）刻みなので、それより細かい時刻は表現できない

結果：BPM=120（=500ms間隔）でも実際には 480〜540ms のような揺れが入り、テンポが不安定になる。

## 二つの時計

解決策は「**音のスケジューリング用クロック**」と「**スケジューラ駆動用クロック**」を分けること。

| 役割 | 使うクロック | 精度 |
|---|---|---|
| 音をいつ鳴らすか決める | `AudioContext.currentTime` | サンプル単位（44.1kHzなら ≒ 0.023ms） |
| スケジューラを定期実行する | `setInterval` | 数ms〜数十msのジッター可 |

ポイントは、`setInterval` の発火タイミングが多少ズレても、その中で予約する「音の発音時刻」自体は `AudioContext` の高精度タイムラインに乗せること。発音時刻が正確なら、スケジューラの揺れは音には影響しない。

## ルックアヘッド方式

実装の核は **「先読み（lookahead）」** + **「先行スケジュール（schedule ahead）」** の組み合わせ。

| 定数 | 値 | 意味 |
|---|---|---|
| `SCHEDULER_INTERVAL_MS` | 25ms | スケジューラを起動する間隔 |
| `SCHEDULE_AHEAD_TIME` | 0.1s（100ms） | 「いまから何秒先までの音を予約しておくか」 |

スケジューラは 25ms ごとに起動して、

```
while (nextNoteTime < currentTime + SCHEDULE_AHEAD_TIME) {
  playClick(nextNoteTime, ...);
  nextNoteTime += 60 / bpm;
}
```

を繰り返す。`setInterval` がたまに 50ms 遅れて起動しても、100ms のバッファがあるので「予約漏れ」は起きない。

[MetronomeContext.tsx](../src/contexts/MetronomeContext.tsx) の `advanceScheduler` がこの処理を担当している。

## AudioContext での発音

`playClick(time)` は `time`（= `AudioContext.currentTime` ベースの絶対時刻）に音が鳴るようノードを予約する。

```ts
osc.frequency.setValueAtTime(freq, time);
gain.gain.setValueAtTime(volume, time);
gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
osc.start(time);
osc.stop(time + 0.1);
```

`start(time)` / `setValueAtTime(value, time)` は「その時刻にぴったり実行する」ことを保証してくれる。発音は Web Audio の内部スレッドで処理されるため、メインスレッドの状態に依存しない。

## UIとの同期

音の予約時刻と「画面のドット点滅・振り子の位置リセット」のタイミングを揃えるための仕組み。

1. スケジュールしたクリックは `scheduledQueueRef`（`{ beat, time }[]`）に積む
2. `requestAnimationFrame` ループで毎フレーム、`AudioContext.currentTime` が予約時刻に到達したエントリを取り出して `currentBeat` を更新

```ts
while (queue[0].time <= ctx.currentTime) {
  const note = queue.shift();
  dispatch({ type: "SET_CURRENT_BEAT", value: note.beat });
}
```

これで「音が鳴る瞬間」と「UI更新」が同じクロック（`AudioContext`）に同期する。
振り子バーの中央通過もこの `currentBeat` 切り替えに連動している（[pendulum.md](./pendulum.md) 参照）。

## 加減速モードでの扱い

accel/decel モードでは小節の頭で BPM を変えるが、`nextNoteTime += 60 / bpm` の `bpm` は次の拍を予約する瞬間の値を使うので、変更直後から自然に新しいテンポが反映される。バッファに残った既予約分はそのままの間隔で鳴る。

## 全体の流れ

```
[start()]
    │
    ├─ AudioContext を resume
    ├─ nextNoteTime = currentTime
    ├─ advanceScheduler() を即時実行
    ├─ setInterval(advanceScheduler, 25ms)
    └─ requestAnimationFrame(uiTick)
         │
         ├─ advanceScheduler （25msごと）
         │     └─ currentTime + 100ms までに発音時刻が来る音を全部予約
         │
         └─ uiTick （毎フレーム）
               └─ currentTime に到達した音について currentBeat を更新
```

## 参考

- [二つの時計についての物語 (Web.dev)](https://web.dev/articles/audio-scheduling?hl=ja)
- [Web Audio API: AudioContext.currentTime](https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/currentTime)
