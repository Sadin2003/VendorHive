import Icon from './Icon'
import Button from './Button'

export default function EmptyState({ icon = 'i-inbox', title, text, action, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={34} />
      </div>
      <h4>{title}</h4>
      {text && <p style={{ maxWidth: 400, margin: '0 auto 18px' }}>{text}</p>}
      {action && <Button {...action} />}
      {children}
    </div>
  )
}