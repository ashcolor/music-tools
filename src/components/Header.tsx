import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import { SITE_NAME, tools } from "../constants";

const BRAND_TEXT = "音楽ツール";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { state, actions } = useMetronome();
  const isDark = state.theme === "dark";
  const location = useLocation();
  const isHome = location.pathname === "/";
  const currentTool = tools.find((tool) => tool.path === location.pathname);

  return (
    <>
      <header className="navbar bg-base-100 sticky top-0 z-30">
        <div className="navbar-start">
          <button
            type="button"
            className="btn btn-square btn-ghost"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            <Icon icon="fa6-solid:bars" className="size-4" />
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-bold whitespace-nowrap text-base-content no-underline"
          >
            <span className={`inline-flex items-center ${isHome ? "" : "opacity-50"}`}>
              <span>{BRAND_TEXT}</span>
              <Icon icon="fa-solid:plus" className="size-4" aria-hidden />
            </span>
            {currentTool ? <span>{currentTool.title}</span> : null}
          </Link>
        </div>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />}

      <div
        className={`bg-base-100 fixed top-0 left-0 z-50 flex h-full w-64 flex-col shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-base-300 flex items-center gap-2 border-b px-4 py-3">
          <img src="/icon-192.png" alt="ロゴ" className="size-10" />
          <span className="inline-flex items-center text-lg font-bold">
            <span>{BRAND_TEXT}</span>
            <Icon icon="fa-solid:plus" className="size-4" aria-hidden />
          </span>
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm ml-auto"
            onClick={() => actions.setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          >
            {isDark ? (
              <Icon icon="bi:moon" className="size-5" />
            ) : (
              <Icon icon="bi:sun" className="size-5" />
            )}
          </button>
        </div>

        <div>
          <ul className="menu bg-base-100 w-full">
            <li>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className={location.pathname === "/" ? "bg-base-200" : undefined}
              >
                HOME
              </Link>
            </li>
            <li className="menu-title text-xs opacity-60">ツール</li>
            {tools.map((tool) => (
              <li key={tool.path}>
                <Link
                  to={tool.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 py-4 ${location.pathname === tool.path ? "bg-base-200" : ""}`}
                >
                  <Icon icon={tool.sidebarIcon} className="size-5 shrink-0" />
                  <span>{tool.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-base-300 border-t p-4 text-xs">
          {currentTool ? (
            <>
              <div className="font-bold">{currentTool.title}</div>
              <p className="mt-1 opacity-60">{currentTool.description}</p>
            </>
          ) : (
            <>
              <div className="font-bold">{SITE_NAME}</div>
              <p className="mt-1 opacity-60">音楽の練習や演奏に使えるWebツール集</p>
            </>
          )}
          <div className="mt-3 opacity-60">© {new Date().getFullYear()} {SITE_NAME}</div>
        </div>
      </div>
    </>
  );
}
