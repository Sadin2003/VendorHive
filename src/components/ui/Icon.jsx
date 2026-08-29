export default function Icon({ name, size = 18, className = '', style, ...rest }) {
  return (
    <svg
      className={`svg-icon ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
      {...rest}
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  )
}