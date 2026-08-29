import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Fields'
import { useToast } from '../../components/ui/useToast'

export default function Contact() {
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', topic: 'Help with an account', message: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="container page">
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ marginBottom: 8 }}>Talk to the Hive</h1>
        <p className="muted">Questions, feedback, or partnership ideas — we read every message.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gap: 24, alignItems: 'start', maxWidth: 1000, margin: '0 auto' }}>
        <div>
          <form
            className="card card-pad"
            onSubmit={(e) => {
              e.preventDefault()
              toast(`Thanks ${form.name.split(' ')[0] || 'there'}! We'll get back to you within a day.`)
              setForm({ name: '', email: '', topic: 'Help with an account', message: '' })
            }}
          >
            <div className="form-grid">
              <Field label="Your name" required>
                <Input required value={form.name} onChange={set('name')} placeholder="Alex Rivera" />
              </Field>
              <Field label="Email" required>
                <Input required type="email" value={form.email} onChange={set('email')} placeholder="alex@example.com" />
              </Field>
            </div>
            <Field label="Topic">
              <select className="select" value={form.topic} onChange={set('topic')}>
                <option>Help with an account</option>
                <option>Report a business</option>
                <option>Merchant signup</option>
                <option>Partnership</option>
                <option>Something else</option>
              </select>
            </Field>
            <Field label="Message" required>
              <Textarea required value={form.message} onChange={set('message')} placeholder="Tell us what's on your mind…" />
            </Field>
            <Button type="submit" block>
              <Icon name="i-send" />
              Send message
            </Button>
          </form>
        </div>

        <div className="col" style={{ gap: 20 }}>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 16 }}>Get in touch</h4>
            <div className="kv">
              <dt><Icon name="i-map-pin" size={16} style={{ verticalAlign: -2 }} /></dt><dd>14 Hive Court, Hive City</dd>
              <dt><Icon name="i-phone" size={16} style={{ verticalAlign: -2 }} /></dt><dd>(555) 010-1400</dd>
              <dt><Icon name="i-mail" size={16} style={{ verticalAlign: -2 }} /></dt><dd>hello@vendorhive.app</dd>
              <dt><Icon name="i-clock" size={16} style={{ verticalAlign: -2 }} /></dt><dd>Mon–Fri, 9am – 6pm</dd>
            </div>
          </div>
          <div className="card card-pad">
            <h4 style={{ marginBottom: 8 }}>For verified merchants</h4>
            <p className="small muted">
              Deal disputes and verification are handled fastest through your merchant dashboard.
            </p>
            <Button to="/merchant" variant="outline" size="sm">Open dashboard</Button>
          </div>
          <div className="card" style={{ padding: 22, background: 'var(--primary-800)', border: 'none' }}>
            <h4 style={{ color: '#fff', marginBottom: 12 }}>Follow the hive</h4>
            <div className="row" style={{ gap: 10 }}>
              {[['i-camera', 'Instagram'], ['i-globe', 'Facebook'], ['i-message', 'X'], ['i-play', 'YouTube']].map(([icon, name]) => (
                <a key={name} href="#social" className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }} aria-label={name}>
                  <Icon name={icon} size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}