import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Toggle } from '../../components/ui/Fields'
import { useToast } from '../../components/ui/useToast'

export default function Settings() {
  const toast = useToast()
  const [platform, setPlatform] = useState({ name: 'VendorHive', support: 'support@vendorhive.co' })
  const [toggles, setToggles] = useState({
    openApp: true,
    idCheck: true,
    crossPromos: true,
    newsletter: false,
    autoVerify: false,
  })

  const flip = (k) => () => setToggles((t) => ({ ...t, [k]: !t[k] }))
  const set = (k) => (e) => setPlatform((p) => ({ ...p, [k]: e.target.value }))

  const toggleRow = (k, title, desc) => (
    <div className="row-between" style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div className="bold small">{title}</div>
        <span className="tiny muted">{desc}</span>
      </div>
      <Toggle checked={toggles[k]} onChange={flip(k)} />
    </div>
  )

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Settings</h1>
          <p>Platform-wide preferences for the community.</p>
        </div>
        <Button variant="primary" onClick={() => toast('Settings saved')}>Save changes</Button>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div className="card card-pad">
          <h4 style={{ marginBottom: 16 }}>Community & branding</h4>
          <Field label="Platform name" hint="Shown in emails and the footer.">
            <Input value={platform.name} onChange={set('name')} />
          </Field>
          <Field label="Support email">
            <Input value={platform.support} onChange={set('support')} />
          </Field>
          <Field label="Sales tax note">
            <Input placeholder="e.g. 6.25% Hive City tax, applied at checkout" />
          </Field>
        </div>

        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>Moderation & features</h4>
          <p className="small muted" style={{ margin: '0 0 8px' }}>These apply instantly to the whole community.</p>
          {toggleRow('openApp', 'Accept new merchant applications', 'New shops can request to join or go on the waitlist.')}
          {toggleRow('idCheck', 'Require ID + license upload', 'Merchants must verify before posting deals.')}
          {toggleRow('crossPromos', 'Enable cross-promotions', 'Let merchants create co-op deals with neighbors.')}
          {toggleRow('autoVerify', 'Auto-approve trusted merchants', 'Skip the queue for shops already verified by peers.')}
          {toggleRow('newsletter', 'Weekly community digest', 'DIY Sunday drops a “shop local” digest email.')}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, borderColor: 'var(--danger-300)', padding: 20 }}>
        <h4 style={{ margin: 0, color: 'var(--danger)', display: 'flex', gap: 8 }}>
          <Icon name="i-alert" size={18} /> Danger zone
        </h4>
        <p className="small muted" style={{ margin: '8px 0 14px' }}>
          These changes affect every member and are recorded in the audit log.
        </p>
        <div className="col" style={{ gap: 8, maxWidth: 340 }}>
          <Button variant="outline" size="sm" onClick={() => toast('Export started — you will get an email')}>
            <Icon name="i-download" size={14} /> Export community data
          </Button>
          <Button variant="danger" size="sm" onClick={() => toast('Feature flag flipped for preview')}>
            <Icon name="i-trash" size={14} /> Reset member-generated content
          </Button>
        </div>
      </div>
    </div>
  )
}