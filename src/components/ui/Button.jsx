import { Link } from 'react-router-dom'

export default function Button({
  to,
  href,
  variant = 'primary',
  size,
  block,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', className].filter(Boolean).join(' ')
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {icon}
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {icon}
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={cls} {...rest}>
      {icon}
      {children}
    </button>
  )
}