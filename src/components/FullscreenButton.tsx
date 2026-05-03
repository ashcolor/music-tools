import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      className="btn btn-circle btn-ghost"
      onClick={toggle}
      aria-label={isFullscreen ? "全画面解除" : "全画面"}
    >
      <Icon
        icon={isFullscreen ? "material-symbols:fullscreen-exit-rounded" : "material-symbols:fullscreen-rounded"}
        className="size-6"
      />
    </button>
  );
}
