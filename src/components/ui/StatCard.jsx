import Icon from './Icon'

const TONES = {
  green: { bg: 'rgba(60,107,79,.12)', color: 'var(--primary-600)' },
  amber: { bg: 'rgba(240,192,120,.28)', color: '#8a5a14' },
  cyan: { bg: 'rgba(96,144,192,.14)', color: 'var(--cyan-2)' },
  red: { bg: 'rgba(192,86,66,.12)', color: 'var(--danger-2)' },
}

export default function StatCard({ icon, tone = 'green', value, label, delta, deltaDir = 'up' }) {
  const t = TONES[tone] || TONES.green
  return (
    <div className="card card-pad stat-card">
      <div className="stat-icon" style={{ background: t.bg, color: t.color }}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
        {delta && (
          <div className={`stat-delta ${deltaDir === 'down' ? 'down' : 'up'}`}>
            <Icon name="i-trending-up" size={13} />
            {delta}
          </div>
        )}
      </div>
    </div>
  )
}