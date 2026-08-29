function Star({ filled, size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ fill: filled ? 'var(--star)' : '#e4ddd0' }}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function StarRating({
  value = 0,
  size = 15,
  max = 5,
  className = '',
  label,
}) {
  const rounded = Math.round(value)
  return (
    <span className={`stars ${className}`} style={{ gap: 2 }} role="img" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} filled={i < rounded} size={size} />
      ))}
      {label && <span style={{ marginLeft: 6 }}>{label}</span>}
    </span>
  )
}