export default function PageHead({ title, subtitle, children, className = '' }) {
  return (
    <div className={`section-head ${className}`} style={{ alignItems: 'center' }}>
      <div>
        <h1 style={{ marginBottom: 4 }}>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>}
    </div>
  )
}