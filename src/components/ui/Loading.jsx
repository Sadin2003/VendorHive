import EmptyState from './EmptyState'

export function PageLoading({ text = 'Loading…' }) {
  return (
    <div className="page-loading">
      <div className="card" style={{ padding: '30px 46px', textAlign: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            margin: '0 auto',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="hint-role" style={{ marginTop: 12 }}>{text}</p>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return <div className="card skeleton" style={{ height: 190 }} />
}

export function SkeletonGrid({ n = 3, style }) {
  return (
    <div className="grid grid-3" style={style}>
      {Array.from({ length: n }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageError({ title = 'Something went wrong', text, retry }) {
  return (
    <div className="page-loading">
      <EmptyState icon="i-alert" title={title} text={text} action={retry ? { onClick: retry, children: 'Try again' } : undefined} />
    </div>
  )
}

export { EmptyState }