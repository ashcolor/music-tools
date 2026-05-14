import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { MAIN_TYPES, findMainTypeByType } from "./constants";

type Props = {
  value: string;
  onChange: (next: string) => void;
  mainTypeInvalid?: boolean;
  tensionInvalid?: boolean;
};

export function ChordTypeSelect({
  value,
  onChange,
  mainTypeInvalid,
  tensionInvalid,
}: Props) {
  const current = useMemo(() => findMainTypeByType(value), [value]);
  const activeMainValue = current?.main.value ?? "";
  const activeTensionType = current?.tension.type ?? value;
  const activeTensionLabel = current?.tension.label ?? "";

  const tensions = useMemo(
    () =>
      MAIN_TYPES.find((m) => m.value === activeMainValue)?.tensionOptions ?? [],
    [activeMainValue],
  );

  const handleMainClick = (nextMainValue: string) => {
    const next = MAIN_TYPES.find((m) => m.value === nextMainValue);
    if (!next) return;
    const nextOpt =
      next.tensionOptions.find((t) => t.label === activeTensionLabel) ??
      next.tensionOptions[0];
    onChange(nextOpt.type);
  };

  return (
    <>
      <span className="flex items-center gap-2">
        コードタイプ
        {mainTypeInvalid && (
          <Icon
            icon="material-symbols:warning-outline-rounded"
            className="size-5 shrink-0 text-warning"
            aria-label="無効な値"
          />
        )}
      </span>
      <div className="flex flex-row flex-wrap place-content-center gap-2">
        {MAIN_TYPES.map((type) => (
          <span
            key={type.value || "major"}
            className={`btn btn-sm cursor-pointer ${
              type.value === activeMainValue ? "btn-primary" : ""
            }`}
            onClick={() => handleMainClick(type.value)}
          >
            {type.label}
          </span>
        ))}
      </div>
      <span className="flex items-center gap-2">
        テンション
        {tensionInvalid && (
          <Icon
            icon="material-symbols:warning-outline-rounded"
            className="size-5 shrink-0 text-warning"
            aria-label="無効な値"
          />
        )}
      </span>
      <div className="flex flex-row flex-wrap place-content-center gap-2">
        {tensions.map((t) => (
          <span
            key={t.type || "none"}
            className={`btn btn-sm cursor-pointer ${
              t.type === activeTensionType ? "btn-primary" : ""
            }`}
            onClick={() => onChange(t.type)}
          >
            {t.label}
          </span>
        ))}
      </div>
    </>
  );
}
