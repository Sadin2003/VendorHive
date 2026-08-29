import Icon from './Icon'

export default function Stepper({ steps = [], current = 0 }) {
  return (
    <div className="stepper" aria-label="Progress">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : ''
        return (
          <div key={s} className={`step ${state}`}>
            {i < current ? (
              <span className="dot">
                <Icon name="i-check" size={14} />
              </span>
            ) : (
              <span className="dot">{i + 1}</span>
            )}
            <span className="lbl">{s}</span>
            {i < steps.length - 1 && <span className={`bar ${i < current ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}