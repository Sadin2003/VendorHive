import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import { Field, Select, Textarea } from '../../components/ui/Fields'
import { gradientFor } from '../../utils/gradients'
import { useToast } from '../../components/ui/useToast'

const QUEUE = [
  { id: 'm13', name: 'Coal & Clay Ceramics', owner: 'Ravi Shah', cat: 'Gifts & Local', addr: '19 Kiln Lane', waited: '28h', docs: '100%', note: 'Studio pottery with a storefront.' },
  { id: 'm14', name: 'The Hearth Pantry', owner: 'Lena Ortiz', cat: 'Bakeries', addr: '2 Oven Street', waited: '74h', docs: '92%', note: 'Bakery/deli, seasonal menu.' },
  { id: 'm15', name: 'Redline Bicycles', owner: 'Jon Mercer', cat: 'Services', addr: '31 Spoke Road', waited: '11h', docs: '100%', note: 'Repairs + rentals.' },
  { id: 'm16', name: 'Glow & Groom Studio', owner: 'Nadia Bhuiyan', cat: 'Health & Beauty', addr: '9 Amber Walk', waited: '5h', docs: '58%', note: 'Missing business license upload.' },
]

export default function MerchantVerification() {
  const toast = useToast()
  const [queue, setQueue] = useState(QUEUE)
  const [active, setActive] = useState(null)
  const [decision, setDecision] = useState('approved')
  const [reason, setReason] = useState('')

  const decide = () => {
    // only reject needs a reason
    if (decision === 'rejected' && !reason.trim()) {
      toast("Please add a reason so they know what to fix")
      return
    }
    if (decision === 'approved' && queue.length > 1) {
      toast(`${active.name} verified — they can post deals!`)
    } else {
      toast(decision === 'approved' ? 'Merchant verified' : 'Application rejected')
    }
    setQueue((q) => q.filter((x) => x.id !== active.id))
    setActive(null)
    setReason('')
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Merchant verification</h1>
          <p>Review proof of business before shops can list deals.</p>
        </div>
        <span className="badge badge-amber">{queue.length} waiting</span>
      </div>

      {queue.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', paddingBlock: 48 }}>
          <Icon name="i-check-circle" size={40} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: '12px 0 4px' }}>Queue cleared</h3>
          <p className="muted small" style={{ margin: 0 }}>All merchant applications have been reviewed.</p>
        </div>
      ) : (
        <div className="col" style={{ gap: 16 }}>
          {queue.map((m) => (
            <div key={m.id} className="card card-pad">
              <div className="row-between" style={{ gap: 16, flexWrap: 'wrap' }}>
                <div className="row" style={{ gap: 14 }}>
                  <span className="logo-badge" style={{ width: 44, height: 44, borderRadius: 12, background: gradientFor(m.name), fontSize: '0.9rem' }}>
                    {m.name.slice(0, 2)}
                  </span>
                  <div>
                    <div className="bold">{m.name}</div>
                    <span className="tiny muted">{m.cat} · {m.addr}</span>
                  </div>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Badge tone={m.waited.includes('74') ? 'red' : 'amber'}>{m.waited}</Badge>
                  <Badge tone={m.docs === '100%' ? 'green' : 'gray'}>docs {m.docs}</Badge>
                </div>
              </div>
              <p className="small muted" style={{ margin: '12px 0' }}>“{m.note}” — application notes from the owner.</p>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                <span className="badge badge-gray"><Icon name="i-file" size={12} /> Licenses ×2</span>
                <span className="badge badge-gray"><Icon name="i-camera" size={12} /> Interior photos ×4</span>
                <span className="badge badge-gray"><Icon name="i-users" size={12} /> Owner ID</span>
                <span className="grow" />
                <Button variant="ghost" onClick={() => { setActive(m); setDecision('rejected') }}><Icon name="i-x" size={14} /> Reject</Button>
                <Button variant="primary" onClick={() => { setActive(m); setDecision('approved') }}><Icon name="i-check" size={14} /> Approve</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title={`Review ${active?.name || ''}`}>
        <Field label="Owner">
          <div className="row" style={{ gap: 10, marginBottom: 6 }}>
            <Avatar text={active?.owner || ''} size="sm" />
            <span className="bold small">{active?.owner}</span>
          </div>
        </Field>
        <Field label="Decision">
          <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
            <option value="approved">Approve — docs verified</option>
            <option value="rejected">Reject — needs more info</option>
          </Select>
        </Field>
        {decision === 'rejected' && (
          <Field label="Reason (sent to the merchant)" required hint="Keep it actionable — missing doc, name mismatch, etc.">
            <Textarea
              rows={3}
              placeholder="e.g. Please upload the business license listed under the same name…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
        )}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
          <Button variant={decision === 'approved' ? 'primary' : 'danger'} onClick={decide}>
            {decision === 'approved' ? 'Confirm approval' : 'Reject application'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}