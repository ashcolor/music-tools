import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

type SnsShare = {
  label: string;
  iconName: string;
  color: string;
  buildHref: (shareUrl: string, title: string) => string;
};

const SNS_SHARES: SnsShare[] = [
  {
    label: "X(Twitter)",
    iconName: "mingcute:social-x-fill",
    color: "#0f1419",
    buildHref: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Facebook",
    iconName: "simple-icons:facebook",
    color: "#1877f2",
    buildHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "LINE",
    iconName: "simple-icons:line",
    color: "#06c755",
    buildHref: (url) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
  },
  {
    label: "はてなブックマーク",
    iconName: "simple-icons:hatenabookmark",
    color: "#00a4de",
    buildHref: (url) => {
      try {
        const u = new URL(url);
        return `https://b.hatena.ne.jp/entry/s/${encodeURIComponent(`${u.host}${u.pathname}${u.search}`)}`;
      } catch {
        return "https://b.hatena.ne.jp/";
      }
    },
  },
];

type Props = {
  wakeLock: boolean;
  onWakeLockChange: (v: boolean) => void;
  onReset: () => void;
  chords: string[];
  onApplyChords: (text: string) => void;
};

export default function ChordShareToolbar({
  wakeLock,
  onWakeLockChange,
  onReset,
  chords,
  onApplyChords,
}: Props) {
  const helpRef = useRef<HTMLDialogElement>(null);
  const shortcutsRef = useRef<HTMLDialogElement>(null);
  const resetRef = useRef<HTMLDialogElement>(null);
  const shareRef = useRef<HTMLDialogElement>(null);
  const settingsRef = useRef<HTMLDialogElement>(null);
  const chordInputRef = useRef<HTMLDialogElement>(null);
  const [chordText, setChordText] = useState("");
  const isWakeLockSupported =
    typeof navigator !== "undefined" && "wakeLock" in navigator;
  const [shareBaseUrl, setShareBaseUrl] = useState("");
  const [shareSearch, setShareSearch] = useState("");
  const [includeSettings, setIncludeSettings] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareUrl = includeSettings ? `${shareBaseUrl}${shareSearch}` : shareBaseUrl;
  const snsLinks = useMemo(
    () =>
      SNS_SHARES.map((s) => ({ ...s, href: s.buildHref(shareUrl, document.title) })),
    [shareUrl],
  );

  const openShortcutsFromHelp = () => {
    helpRef.current?.close();
    shortcutsRef.current?.showModal();
  };

  const openShare = () => {
    const { origin, pathname, search } = window.location;
    setShareBaseUrl(`${origin}${pathname}`);
    setShareSearch(search);
    setIncludeSettings(true);
    setCopied(false);
    shareRef.current?.showModal();
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // noop
    }
  };

  const handleReset = () => {
    onReset();
    resetRef.current?.close();
  };

  const openChordInput = () => {
    setChordText(chords.join(","));
    chordInputRef.current?.showModal();
  };

  const handleApplyChordText = () => {
    onApplyChords(chordText);
    chordInputRef.current?.close();
  };

  return (
    <div className="flex w-full items-center justify-end gap-1 px-4 py-2">
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square mr-auto"
        aria-label="コードを入力"
        title="コードを入力"
        onClick={openChordInput}
      >
        <Icon icon="mdi:alphabetical" className="size-5" />
      </button>
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
        title="URL共有"
        onClick={openShare}
      >
        <Icon icon="lucide:share-2" className="size-5" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-square"
        aria-label="設定"
        title="設定"
        onClick={() => settingsRef.current?.showModal()}
      >
        <Icon icon="mdi:cog" className="size-5" />
      </button>

      <dialog ref={helpRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">使い方</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="font-bold">コード編集</p>
              <p className="mt-1">コード名をクリックするとコードを変更できます</p>
            </div>
            <div>
              <p className="font-bold">再生</p>
              <div className="mt-1 flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-content size-6 shrink-0">
                    <Icon icon="material-symbols:play-arrow-rounded" className="size-4" />
                  </span>
                  <span>再生 / 一時停止から再開</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-secondary text-secondary-content size-6 shrink-0">
                    <Icon icon="material-symbols:pause-rounded" className="size-4" />
                  </span>
                  <span>一時停止</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full border border-base-300 size-6 shrink-0">
                    <Icon icon="material-symbols:stop-rounded" className="size-4" />
                  </span>
                  <span>停止（再生位置をリセット）</span>
                </p>
              </div>
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
                  <span>コードをリセット</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="lucide:share-2" className="size-4 shrink-0" />
                  <span>URLをコピー（コード進行を共有）</span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon icon="mdi:cog" className="size-4 shrink-0" />
                  <span>設定</span>
                </p>
              </div>
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
                    <td>
                      <kbd className="kbd">Space</kbd>
                    </td>
                    <td>再生 / 一時停止</td>
                  </tr>
                  <tr>
                    <td>
                      <kbd className="kbd">R</kbd>
                    </td>
                    <td>停止</td>
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

      <dialog ref={shareRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">URL共有</h3>
          <label className="label cursor-pointer justify-start gap-3 mb-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={includeSettings}
              onChange={(e) => {
                setIncludeSettings(e.target.checked);
                setCopied(false);
              }}
            />
            <span className="label-text">コード進行を含める</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="input input-bordered flex-1 font-mono text-xs"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopyShareUrl}
              aria-label={copied ? "コピーしました" : "URLをコピー"}
            >
              <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} className="size-5" />
              {copied ? "コピーしました" : "コピー"}
            </button>
          </div>
          <div className="mt-4 flex flex-row justify-center gap-3">
            {snsLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="btn btn-sm btn-square text-white border-0"
                style={{ backgroundColor: s.color }}
              >
                <Icon icon={s.iconName} className="size-5" />
              </a>
            ))}
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

      <dialog ref={settingsRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">設定</h3>
          <div className="flex flex-col gap-3 text-sm">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={wakeLock}
                disabled={!isWakeLockSupported}
                onChange={(e) => onWakeLockChange(e.target.checked)}
              />
              <div className="flex flex-col items-start">
                <span className="label-text">再生中の画面消灯を抑制</span>
                {!isWakeLockSupported && (
                  <span className="text-xs text-base-content/60">
                    お使いのブラウザは未対応です
                  </span>
                )}
              </div>
            </label>
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

      <dialog ref={chordInputRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">コードを入力</h3>
          <p className="text-sm mb-3">コードをカンマ区切りで入力してください</p>
          <textarea
            className="textarea textarea-bordered w-full font-mono text-sm"
            rows={3}
            placeholder="Fsus2,Gsus4,Am7,Em7"
            value={chordText}
            onChange={(e) => setChordText(e.target.value)}
          />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn">キャンセル</button>
              <button type="button" className="btn btn-primary" onClick={handleApplyChordText}>
                適用
              </button>
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
          <p className="text-sm">コード進行を初期状態に戻します。よろしいですか？</p>
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
