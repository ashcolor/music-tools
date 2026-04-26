type Props = {
  value: number
  onChange: (value: number) => void
}

const MIN_INTERVAL = 1
const MAX_INTERVAL = 16
const STEP = 1

export default function AccelerationIntervalInput({ value, onChange }: Props) {
  return (
    <input
      type="number"
      min={MIN_INTERVAL}
      max={MAX_INTERVAL}
      step={STEP}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="input input-bordered max-w-12 text-center"
    />
  )
}
