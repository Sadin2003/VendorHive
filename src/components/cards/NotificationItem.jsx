import Icon from '../ui/Icon'

const ICON_TONES = {
  review: { bg: 'rgba(240,192,120,.28)', color: '#8a5a14', icon: 'i-star' },
  promotion: { bg: 'rgba(60,107,79,.12)', color: 'var(--primary-600)', icon: 'i-megaphone' },
  deal: { bg: 'rgba(96,144,192,.14)', color: 'var(--cyan-2)', icon: 'i-tag' },
  system: { bg: 'rgba(0,0,0,.06)', color: 'var(--text-muted)', icon: 'i-info' },
}

export default function NotificationItem({ notif, onRead }) {
  const tone = ICON_TONES[notif.type] || ICON_TONES.system
  return (
    <div className={`card notif ${notif.unread ? 'unread' : ''}`}>
      <div className="n-icon" style={{ background: tone.bg, color: tone.color }}>
        <Icon name={notif.icon || tone.icon} size={19} />
      </div>
      <div className="n-text">
        <div dangerouslySetInnerHTML={{ __html: notif.text }} />
        <div className="n-time">{notif.time}</div>
      </div>
      {notif.unread ? (
        <span className="n-dot" title="Unread" />
      ) : (
        <button
          type="button"
          className="btn-link tiny"
          onClick={() => onRead?.(notif.id)}
          style={{ alignSelf: 'center' }}
        >
          Dismiss
        </button>
      )}
    </div>
  )
}