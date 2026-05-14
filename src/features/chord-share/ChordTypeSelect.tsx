import { useState } from "react";
import { MAIN_TYPES, TENSION_TYPES } from "./constants";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function ChordTypeSelect({ value, onChange }: Props) {
  const [activeTension, setActiveTension] = useState("");
  const activeTensions =
    MAIN_TYPES.find((main) => main.value === value)?.tensionOptions ?? [];

  return (
    <>
      <span>コードタイプ</span>
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
      <span>テンション</span>
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
