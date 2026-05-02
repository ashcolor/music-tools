import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";

export default function Toolbar() {
  const { actions } = useMetronome();
  const helpRef = useRef<HTMLDialogElement>(null);
  const resetRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // noop
    }
  };

  const handleReset = () => {
    actions.reset();
    resetRef.current?.close();
  };

  return (
    <div className="flex w-full items-center justify-end gap-1 px-4 py-2">
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="使い方"
        title="使い方"
        onClick={() => helpRef.current?.showModal()}
      >
        <Icon icon="bi:info-circle" className="size-5" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="初期化"
        title="初期化"
        onClick={() => resetRef.current?.showModal()}
      >
        <Icon icon="mdi:restore" className="size-5" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="URL共有"
        title={copied ? "コピーしました" : "URL共有"}
        onClick={handleShare}
      >
        <Icon icon={copied ? "mdi:check" : "lucide:share"} className="size-5" />
      </button>

      <dialog ref={helpRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">使い方</h3>
          <div className="flex flex-col gap-3 text-sm">
            <p>中央の数字をタップしてテンポや拍子を設定。再生ボタンでメトロノームを開始します。</p>
            <ul className="list-disc list-inside space-y-1">
              <li>モード: 一定 / 加速 / 減速 を選択</li>
              <li>加速・減速: スタートとゴールのBPM、N小節ごとに何BPM変化させるかを指定</li>
              <li>ゴールBPMが空欄の場合は加速300 / 減速30が自動で使われる</li>
              <li>右下のスピーカーで音量と音色を変更</li>
            </ul>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog ref={resetRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">初期化</h3>
          <p className="text-sm">設定を初期状態に戻します。よろしいですか？</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn">キャンセル</button>
              <button type="button" className="btn btn-error" onClick={handleReset}>
                初期化する
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
