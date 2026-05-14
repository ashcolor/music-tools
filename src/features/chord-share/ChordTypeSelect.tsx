import { useState } from "react";
import { Icon } from "@iconify/react";
import { MAIN_TYPES, TENSION_TYPES } from "./constants";

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
  const [activeTension, setActiveTension] = useState("");
  const activeTensions =
    MAIN_TYPES.find((main) => main.value === value)?.tensionOptions ?? [];

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
            key={type.value}
            className={`btn btn-sm cursor-pointer ${
              type.value === value ? "btn-primary" : ""
            }`}
            onClick={() => onChange(type.value)}
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
        {TENSION_TYPES.map((type) => {
          const isActive = type.value === activeTension;
          const isDisabled = !activeTensions.includes(type.value);
          return (
            <span
              key={type.value}
              className={`btn btn-sm cursor-pointer ${
                isActive ? "btn-primary" : ""
              } ${isDisabled ? "btn-disabled" : ""}`}
              onClick={() => {
                if (!isDisabled) setActiveTension(type.value);
              }}
            >
              {type.label}
            </span>
          );
        })}
      </div>
    </>
  );
}
