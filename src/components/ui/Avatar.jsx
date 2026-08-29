import { gradientFor, initials } from '../../utils/gradients'

export default function Avatar({
  text = 'VH',
  size = 'md',
  gradient,
  className = '',
  style,
}) {
  return (
    <span
      className={`avatar avatar-${size} ${className}`}
      style={{
        background: gradient || gradientFor(text),
        ...style,
      }}
    >
      {initials(text)}
    </span>
  )
}