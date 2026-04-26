type Props = {
  value: number
  onChange: (value: number) => void
}

const BEATS = [2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function BeatsInput({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 justify-between">
      {BEATS.map((beats) => (
        <button
          key={beats}
          className={`btn btn-sm rounded-full btn-neutral ${value !== beats ? 'btn-soft' : ''}`}
          onClick={() => onChange(beats)}
        >
          {beats}
        </button>
      ))}
    </div>
  )
}
