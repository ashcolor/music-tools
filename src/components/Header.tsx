import { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "@iconify/react";
import { useMetronome } from "@/contexts/MetronomeContext";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";
import {
  SITE_NAME,
  allTools,
  experimentalTools,
  externalTools,
  groupExternalToolsByCategory,
  infoPages,
  tools,
} from "../constants";
import { IosInstallGuideModal } from "./IosInstallGuideModal";

function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

function isIosBrowser() {
  const ua = navigator.userAgent;
  const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
  const isIpadOsDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isIosDevice || isIpadOsDesktopMode;
}

const BRAND_TEXT = "音楽ツール";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { state, actions } = useMetronome();
  const isDark = state.theme === "dark";
  const location = useLocation();
  const isHome = location.pathname === "/";
  const currentTool = allTools.find((tool) => tool.path === location.pathname);
  const externalGroups = groupExternalToolsByCategory(externalTools);
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const isIos = isIosBrowser();
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePwaInstallPrompt();
  const installLabel = isMobile ? "ホーム画面に追加" : "アプリをインストール";
  const isInstallActionAvailable = canInstall || isIos;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateDeviceState = () => {
      setIsMobile(isMobileDevice());
    };

    updateDeviceState();
    mediaQuery.addEventListener("change", updateDeviceState);

    return () => {
      mediaQuery.removeEventListener("change", updateDeviceState);
    };
  }, []);

  const installApp = async () => {
    if (!canInstall) {
      if (isIos) {
        setShowIosInstallHelp(true);
      }
      return;
    }

    await promptInstall();
    setShowIosInstallHelp(false);
    setOpen(false);
  };

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
            {externalGroups.map((group) => (
              <Fragment key={group.category}>
                <li className="menu-title text-xs opacity-60">{group.category}</li>
                {group.items.map((tool) => (
                  <li key={tool.url}>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-4 py-4"
                    >
                      <Icon icon={tool.sidebarIcon} className="size-5 shrink-0" />
                      <span className="flex-1">{tool.title}</span>
                      <Icon
                        icon="material-symbols:open-in-new-rounded"
                        className="size-4 opacity-60"
                        aria-label="外部リンク"
                      />
                    </a>
                  </li>
                ))}
              </Fragment>
            ))}
            <li className="menu-title text-xs opacity-60">ベータ版</li>
            {experimentalTools.map((tool) => (
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

        <div className="mt-auto">
          {!isInstalled && (
            <div className="p-4">
              <button
                type="button"
                onClick={installApp}
                disabled={!isInstallActionAvailable}
                className="btn btn-primary w-full"
              >
                <Icon icon="fa6-solid:download" className="size-4" />
                <span>{installLabel}</span>
              </button>
            </div>
          )}

          <div className="border-base-300 border-t" />
          <div className="p-4 text-xs">
            <div className="flex flex-col gap-1">
              {infoPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  onClick={() => setOpen(false)}
                  className="link link-hover"
                >
                  {page.title}
                </Link>
              ))}
            </div>
            <div className="mt-3 opacity-60">© {new Date().getFullYear()} {SITE_NAME}</div>
          </div>
        </div>
      </div>

      <IosInstallGuideModal
        open={showIosInstallHelp}
        onClose={() => setShowIosInstallHelp(false)}
      />
    </>
  );
}
