import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChordDisplay } from "./ChordDisplay";

type Props = {
  id: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
};

export function SortableChord({ id, value, isActive, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <ChordDisplay value={value} onClick={onClick} isActive={isActive} />
    </div>
  );
}
