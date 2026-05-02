import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";

export default function Toolbar() {
  const { actions } = useMetronome();
  const helpRef = useRef<HTMLDialogElement>(null);
  const shortcutsRef = useRef<HTMLDialogElement>(null);
  const resetRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  const openShortcutsFromHelp = () => {
    helpRef.current?.close();
    shortcutsRef.current?.showModal();
  };

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
        aria-label="キーボードショートカット"
        title="キーボードショートカット"
        onClick={() => shortcutsRef.current?.showModal()}
      >
        <Icon icon="mdi:keyboard-outline" className="size-5" />
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
            <div>
              <p className="font-bold">ツールバー</p>
              <div className="mt-1 flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  <Icon icon="bi:info-circle" className="size-4 shrink-0" />
                  <span>使い方</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="mdi:keyboard-outline" className="size-4 shrink-0" />
                  <span>ショートカット一覧</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="mdi:restore" className="size-4 shrink-0" />
                  <span>設定をリセット</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="lucide:share" className="size-4 shrink-0" />
                  <span>URLをコピー</span>
                </p>
              </div>
            </div>
            <div>
              <p className="font-bold">設定</p>
              <p>BPM設定は BPM をクリック</p>
              <p>拍子は拍子をクリック</p>
            </div>
            <div>
              <p className="font-bold">再生</p>
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-secondary text-secondary-content size-6 shrink-0">
                  <Icon icon="material-symbols:pause-rounded" className="size-4" />
                </span>
                <span>再生位置から再開</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full border border-base-300 size-6 shrink-0">
                  <Icon icon="material-symbols:stop-rounded" className="size-4" />
                </span>
                <span>再生位置をリセット</span>
              </p>
            </div>
            <div>
              <p className="font-bold">ショートカットキー</p>
              <p>PCの場合はショートカットキーを使用できます</p>
              <button
                type="button"
                className="link link-primary mt-1"
                onClick={openShortcutsFromHelp}
              >
                ショートカットキーの一覧はこちら
              </button>
            </div>
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

      <dialog ref={shortcutsRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">キーボードショートカット</h3>
          <div className="text-sm">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>キー</th>
                    <th>動作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Space</td>
                    <td>再生 / 一時停止</td>
                  </tr>
                  <tr>
                    <td>R</td>
                    <td>停止</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>ミュート切り替え</td>
                  </tr>
                  <tr>
                    <td>↑</td>
                    <td>BPM を 1 上げる</td>
                  </tr>
                  <tr>
                    <td>↓</td>
                    <td>BPM を 1 下げる</td>
                  </tr>
                  <tr>
                    <td>1 - 9</td>
                    <td>拍子を設定</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
