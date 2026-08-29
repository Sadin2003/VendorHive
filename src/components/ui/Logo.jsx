import { Link } from 'react-router-dom'

export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="brand-mark" aria-hidden="true">
      <path fill="#3c6b4f" d="M32 2l26 15v30L32 62 6 47V17L32 2z" />
      <path fill="#294637" d="M32 8.5l20.9 11.6v23.2L32 54.9 11.1 43.3V20.1L32 8.5z" />
      <path fill="#f0c078" d="M20 25.5l12-4.5 12 4.5v13.5l-12 4.5-12-4.5V25.5z" />
      <path fill="#3c6b4f" d="M24 29.3l8-3 8 3v5.4l-8 3-8-3v-5.4z" />
      <path fill="#f4f0e6" d="M32 33.4l3.2-1.2v-3.4L32 27.6l-3.2 1.2v3.4L32 33.4z" />
    </svg>
  )
}

export default function Logo({ to = '/', children = 'VendorHive', className = '' }) {
  return (
    <Link to={to} className={`brand ${className}`} aria-label="VendorHive home">
      <LogoMark />
      <span>{children}</span>
    </Link>
  )
}