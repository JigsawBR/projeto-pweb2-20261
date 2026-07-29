interface Props {
  progress: number
}

export default function GoalProgressBar({ progress }: Props) {
  const color = progress >= 100 ? 'var(--income)' : progress >= 60 ? '#f59e0b' : 'var(--expense)'

  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${progress}%`, background: color }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
