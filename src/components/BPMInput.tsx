type Props = {
  value: number
  onChange: (value: number) => void
}

const MIN_BPM = 40
const MAX_BPM = 300

const buttonValues = [1, 10]

export default function BPMInput({ value, onChange }: Props) {
  const onClickButton = (delta: number) => {
    if (!value) {
      onChange(120)
      return
    }
    onChange(value + delta)
  }

  return (
    <div className="flex flex-row gap-1 items-center">
      <div className="flex flex-col items-center justify-center text-sm gap-1">
        {buttonValues.map((v) => (
          <button
            key={v}
            className="btn btn-neutral btn-soft btn-sm"
            onClick={() => onClickButton(v)}
          >
            {v > 0 ? '+' + v : v}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={MIN_BPM}
        max={MAX_BPM}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input input-bordered input-lg w-24 text-center text-xl font-mono"
      />
      <div className="flex flex-col items-center justify-center text-sm gap-1">
        {buttonValues.map((v) => (
          <button
            key={v}
            className="btn btn-neutral btn-soft btn-sm"
            onClick={() => onClickButton(v)}
          >
            {v > 0 ? '+' + v : v}
          </button>
        ))}
      </div>
    </div>
  )
}
