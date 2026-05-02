import { useRef } from "react";
import { Icon } from "@iconify/react";
import SettingsModal from "./SettingsModal";

export default function SettingsButton() {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex flex-row items-center justify-end gap-2 px-4 py-2">
      <button
        type="button"
        className="btn btn-ghost btn-square"
        onClick={() => modalRef.current?.showModal()}
        aria-label="設定"
      >
        <Icon icon="material-symbols:settings-rounded" className="size-6" />
      </button>

      <SettingsModal ref={modalRef} />
    </div>
  );
}
