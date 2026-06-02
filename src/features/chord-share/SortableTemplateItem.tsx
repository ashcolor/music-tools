import { Icon } from "@iconify/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChordTemplate } from "./chordTemplates";

type Props = {
  template: ChordTemplate;
  onLoad: (template: ChordTemplate) => void;
  onDelete: (template: ChordTemplate) => void;
};

export function SortableTemplateItem({ template, onLoad, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center gap-2 rounded-lg border border-base-300 p-2 bg-base-100 ${
        isDragging ? "opacity-50 z-10" : ""
      }`}
    >
      <span
        ref={setActivatorNodeRef}
        {...listeners}
        className="touch-none cursor-grab text-base-content/40 shrink-0"
        aria-label="並び替え"
        title="ドラッグで並び替え"
      >
        <Icon icon="fa6-solid:grip-lines" className="size-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{template.name}</div>
        <p className="text-xs opacity-60 font-mono truncate">{template.chords}</p>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-primary btn-square"
        onClick={() => onLoad(template)}
        aria-label={`${template.name}を読み込む`}
        title="読み込み"
      >
        <Icon icon="mdi:download" className="size-4" />
      </button>
      <button
        type="button"
        className="btn btn-sm btn-ghost btn-square text-error"
        onClick={() => onDelete(template)}
        aria-label={`${template.name}を削除`}
        title="削除"
      >
        <Icon icon="mdi:trash-can-outline" className="size-4" />
      </button>
    </div>
  );
}
