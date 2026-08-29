export function Field({ label, hint, required, children, className = '', htmlFor }) {
  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

export function Input({ className = '', ...rest }) {
  return <input className={`input ${className}`} {...rest} />
}

export function Textarea({ className = '', ...rest }) {
  return <textarea className={`textarea ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, id }) {
  return (
    <span className="toggle" role="switch" aria-checked={checked}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="track" />
      <span className="thumb" />
    </span>
  )
}