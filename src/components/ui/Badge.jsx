export default function Badge({ tone = 'green', children, className = '', ...rest }) {
  return (
    <span className={`badge badge-${tone} ${className}`} {...rest}>
      {children}
    </span>
  )
}