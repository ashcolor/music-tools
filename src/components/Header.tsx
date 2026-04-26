import { useState } from "react";
import { Icon } from "@iconify/react";

const BRAND_TEXT = "メトロノーム";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="navbar bg-base-100 sticky top-0 z-30 shadow-sm">
        <div className="flex-none">
          <button
            type="button"
            className="btn btn-square btn-ghost"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            <Icon icon="fa6-solid:bars" className="size-4" />
          </button>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />}

      <div
        className={`bg-base-100 fixed top-0 left-0 z-50 flex h-full w-64 flex-col shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
          <Icon icon="material-symbols:music-note-rounded" className="size-6" aria-hidden />
          <span className="text-lg font-bold">{BRAND_TEXT}</span>
        </div>
      </div>
    </>
  );
}
