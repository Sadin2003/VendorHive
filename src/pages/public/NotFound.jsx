import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import { LogoMark } from '../../components/ui/Logo'

export default function NotFound() {
  return (
    <div className="container page" style={{ textAlign: 'center', paddingTop: 90, paddingBottom: 110 }}>
      <LogoMark size={56} />
      <h1 style={{ fontSize: '6rem', letterSpacing: '-.05em', margin: '18px 0 0', color: 'var(--primary-600)', lineHeight: 1 }}>404</h1>
      <h2>This spot left the hive.</h2>
      <p className="muted" style={{ maxWidth: 440, margin: '0 auto 26px' }}>
        The page you're looking for was moved, expired, or never made it past the plans.
        The neighborhood is still here, though.
      </p>
      <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Button to="/">
          <Icon name="i-home" size={17} /> Back home
        </Button>
        <Button to="/explore" variant="outline">
          <Icon name="i-map-pin" size={17} /> Explore businesses
        </Button>
      </div>
    </div>
  )
}