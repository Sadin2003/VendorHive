import { useState } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { Field, Input, Toggle } from '../../components/ui/Fields'
import { PageLoading, PageError } from '../../components/ui/Loading'
import { api } from '../../services/api'
import { useApi } from '../../utils/useApi'
import { useToast } from '../../components/ui/useToast'

const FLAG_META = {
  openApp: ['Accept new merchant applications', 'New shops can request to join or go on the waitlist.'],
  idCheck: ['Require ID + license upload', 'Merchants must verify before posting deals.'],
  crossPromos: ['Enable cross-promotions', 'Let merchants create co-op deals with neighbors.'],
  autoVerify: ['Auto-approve trusted merchants', 'Skip the queue for shops already verified by peers.'],
  newsletter: ['Weekly community digest', 'DIY Sunday drops a “shop local” digest email.'],
}

function escapeCell(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadCsv(rows, filename) {
  const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function SettingsBody({ data, onSaved }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [platform, setPlatform] = useState({
    name: data?.platformName || 'VendorHive',
    support: data?.supportEmail || '',
    tax: data?.salesTaxNote || '',
  })
  const [flags, setFlags] = useState(() => {
    const base = {}
    for (const k of Object.keys(FLAG_META)) base[k] = Boolean(data?.flags?.[k])
    return base
  })

  const flip = (k) => () => setFlags((t) => ({ ...t, [k]: !t[k] }))
  const set = (k) => (e) => setPlatform((p) => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      await api.admin.updateSettings({
        platformName: platform.name.trim(),
        supportEmail: platform.support.trim(),
        salesTaxNote: platform.tax,
        flags,
      })
      toast('Settings saved')
      onSaved()
    } catch (err) {
      toast(err.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const users = await api.admin.users()
      const rows = [
        ['name', 'email', 'role', 'status', 'joined', 'count'],
        ...(users || []).map((u) => [u.name, u.email, u.role, u.status, u.joined, u.deals]),
      ]
      downloadCsv(rows, `vendorhive-community-${new Date().toISOString().slice(0, 10)}.csv`)
      toast('Community data exported')
    } catch (err) {
      toast(err.message || 'Could not export data')
    } finally {
      setExporting(false)
    }
  }

  const toggleRow = (k) => {
    const [title, desc] = FLAG_META[k]
    return (
      <div className="row-between" style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="bold small">{title}</div>
          <span className="tiny muted">{desc}</span>
        </div>
        <Toggle checked={flags[k]} onChange={flip(k)} />
      </div>
    )
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Settings</h1>
          <p>Platform-wide preferences for the community.</p>
        </div>
        <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
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
            <Input placeholder="e.g. 6.25% Hive City tax, applied at checkout" value={platform.tax} onChange={set('tax')} />
          </Field>
        </div>

        <div className="card card-pad">
          <h4 style={{ margin: '0 0 4px' }}>Moderation & features</h4>
          <p className="small muted" style={{ margin: '0 0 8px' }}>These apply instantly to the whole community.</p>
          {Object.keys(FLAG_META).map((k) => toggleRow(k))}
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
          <Button variant="outline" size="sm" disabled={exporting} onClick={exportData}>
            <Icon name="i-download" size={14} /> {exporting ? 'Exporting…' : 'Export community data'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { data, loading, error, refetch } = useApi(() => api.admin.settings(), [], [])

  if (loading) return <div className="card card-pad"><PageLoading text="Loading settings…" /></div>
  if (error) return <PageError text="Could not load settings." />

  return <SettingsBody key={data?.key || 'settings'} data={data || {}} onSaved={refetch} />
}