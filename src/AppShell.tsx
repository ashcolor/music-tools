import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import Header from "./components/Header";
import MetronomeApp from "./components/MetronomeApp";
import Toolbar from "./components/Toolbar";
import { PAGE_META, SITE_NAME } from "./constants";
import { MetronomeProvider, useMetronome } from "./contexts/MetronomeContext";
import { useMetronomeUrlSync } from "./hooks/useMetronomeUrlSync";
import { useWakeLock } from "./hooks/useWakeLock";
import { Contact } from "./features/contact/route";
import { Home } from "./features/home/route";
import { OperatorInfo } from "./features/operator-info/route";
import { PrivacyPolicy } from "./features/privacy-policy/route";

const CANONICAL_ORIGIN = "https://music-tools.ashcolor.jp";

function normalizePathname(pathname: string) {
  return pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
}

function getCanonicalHref(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return new URL(normalizedPath, `${CANONICAL_ORIGIN}/`).toString();
}

function getPageTitle(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  const pageMeta = PAGE_META[normalizedPath];
  if (!pageMeta || normalizedPath === "/") return SITE_NAME;
  return `${SITE_NAME} | ${pageMeta.title}`;
}

function getPageDescription(pathname: string) {
  const pageMeta = PAGE_META[normalizePathname(pathname)];
  return pageMeta?.description ?? PAGE_META["/"].description;
}

function upsertMetaByName(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    existing.setAttribute("content", content);
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("name", name);
  meta.setAttribute("content", content);
  document.head.append(meta);
}

function upsertMetaByProperty(property: string, content: string) {
  const selector = `meta[property="${property}"]`;
  const existing = document.head.querySelector<HTMLMetaElement>(selector);

  if (existing) {
    existing.setAttribute("content", content);
    return;
  }

  const meta = document.createElement("meta");
  meta.setAttribute("property", property);
  meta.setAttribute("content", content);
  document.head.append(meta);
}

function syncCanonicalHref(pathname: string) {
  const canonicalHref = getCanonicalHref(pathname);
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existing) {
    existing.setAttribute("href", canonicalHref);
    return;
  }

  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", canonicalHref);
  document.head.append(link);
}

function syncSeoMetadata(pathname: string) {
  const title = getPageTitle(pathname);
  const description = getPageDescription(pathname);
  const canonicalHref = getCanonicalHref(pathname);

  document.title = title;
  syncCanonicalHref(pathname);
  upsertMetaByName("apple-mobile-web-app-title", SITE_NAME);
  upsertMetaByName("description", description);
  upsertMetaByProperty("og:title", title);
  upsertMetaByProperty("og:description", description);
  upsertMetaByProperty("og:url", canonicalHref);
  upsertMetaByName("twitter:title", title);
  upsertMetaByName("twitter:description", description);
}

function MetronomeRoute() {
  const { state } = useMetronome();
  useMetronomeUrlSync();
  useWakeLock(state.wakeLock && state.isPlaying);
  return (
    <div className="flex flex-1 flex-col">
      <Toolbar />
      <MetronomeApp />
    </div>
  );
}

export function AppShell() {
  const location = useLocation();

  useEffect(() => {
    syncSeoMetadata(location.pathname);
  }, [location.pathname]);

  return (
    <MetronomeProvider>
      <div className="min-h-dvh bg-base-100 flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/metronome" element={<MetronomeRoute />} />
            <Route path="/operator" element={<OperatorInfo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </MetronomeProvider>
  );
}
