export default function Tabs({ items, active, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`} role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={active === it.id}
          className={active === it.id ? 'active' : ''}
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {typeof it.count === 'number' && <span className="count">{it.count}</span>}
        </button>
      ))}
    </div>
  )
}