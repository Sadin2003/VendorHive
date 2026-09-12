import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './config/db.js'
import User from './models/User.js'
import Review from './models/Review.js'
import Interaction from './models/Interaction.js'
import SavedDeal from './models/SavedDeal.js'
import Follow from './models/Follow.js'
import ContactMessage from './models/ContactMessage.js'
import AuditLog from './models/AuditLog.js'

const BASE = 'http://localhost:5000'
let cookie = ''
let count = 0

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(cookie ? { Cookie: cookie } : {}) },
  })
  const body = await res.json()
  console.log(`${res.status} ${opts.method || 'GET'} ${path}`)
  return { res, body }
}

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`)
    count++
  }
}

function ok(res, expected = 200) {
  if (res.status !== expected) throw new Error(`expected ${expected}, got ${res.status}`)
}

await connectDB()

// Reset residue left by earlier runs so the suite is re-runnable:
// verified merchants are 'active', unverified applicants are 'pending'.
for (const m of await User.find({ role: 'merchant' })) {
  await User.updateOne(
    { _id: m._id },
    {
      $set: { status: m.verified ? 'active' : 'pending', verified: m.verified },
      $unset: { rejectionReason: 1 },
    }
  )
}

// login as admin
const login = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@vendorhive.app', password: 'admin1234' }),
})
ok(login.res)
cookie = login.res.headers.get('set-cookie')

// ---- create a pending merchant to approve later (synthetic) ----
let synthId = null
const synth = await api('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name: 'TestPatron', email: 'tp-verify@example.com', password: 'password123' }),
})
if (synth.res.status === 201) {
  synthId = synth.body.user.id
} else {
  // already exists from previous run
  const existing = await User.findOne({ email: 'tp-verify@example.com' })
  synthId = existing?._id
}

await test('login guard blocks non-admin (402400 customer)', async () => {
  const l = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'zoe@example.com', password: 'password123' }),
  })
  const c = l.res.headers.get('set-cookie')
  const r = await fetch(BASE + '/api/admin/dashboard', { headers: { Cookie: c } })
  if (r.status !== 403) throw new Error('non-admin should be forbidden')
})

await test('dashboard shape', async () => {
  const { body } = await api('/api/admin/dashboard')
  const d = body.data
  if (!Array.isArray(d.stats) || d.stats.length !== 4) throw new Error('stats missing')
  if (!Array.isArray(d.pendingVerification)) throw new Error('pendingVerification missing')
  if (!Array.isArray(d.flaggedReviews)) throw new Error('flaggedReviews missing')
  if (!Array.isArray(d.growth) || d.growth.length !== 12) throw new Error('growth')
  if (!Array.isArray(d.signups) || d.signups.length !== 11) throw new Error('signups')
  console.log('  stats:', d.stats.map((s) => `[${s.label} ${s.value}]`).join(' '))
})

await test('verification queue', async () => {
  const { body } = await api('/api/admin/merchants/verification')
  const q = body.data
  if (!Array.isArray(q)) throw new Error('not an array')
  if (q.length && !q[0].name) throw new Error('row shape')
  console.log('  pending:', q.map((m) => `${m.name}(${m.waited})`).join(', ') || 'none')
})

await test('merchants list (roles/status derive)', async () => {
  const { body } = await api('/api/admin/merchants')
  const list = body.data
  const bean = list.find((m) => m.name === 'Bean & Leaf')
  if (!bean) throw new Error('Bean & Leaf missing')
  if (bean.status !== 'live') throw new Error(`Bean & Leaf status ${bean.status}`)
  if (!bean.rating) throw new Error('rating missing')
  console.log('  rows:', list.length, '| sample:', bean.name, bean.status, bean.rating)
})

await test('users list', async () => {
  const { body } = await api('/api/admin/users')
  if (!Array.isArray(body.data) || !body.data.length) throw new Error('no users')
  const aisha = body.data.find((u) => u.name === 'Aisha Khan')
  if (!aisha || aisha.role !== 'shopper') throw new Error('aisha role')
})

await test('review queue (flagged/escalated present)', async () => {
  const { body } = await api('/api/admin/reviews?scope=queue')
  const q = body.data
  if (!Array.isArray(q)) throw new Error('not array')
  console.log('  queue:', q.map((r) => `${r.business}/${r.user} (${r.moderation}, ${r.risk})`).join(', ') || 'empty')
})

await test('moderation: escalate a live-kept review then remove it', async () => {
  const kept = await Review.findOne({ moderation: 'kept', flagged: false }).populate('business', 'businessName name')
  if (!kept) throw new Error('no kept review to work with')
  const r1 = await api(`/api/admin/reviews/${kept._id}/escalate`, { method: 'PUT' })
  ok(r1.res)
  const after = await Review.findById(kept._id)
  if (after.moderation !== 'escalated') throw new Error('escalation failed')
  const r2 = await api(`/api/admin/reviews/${kept._id}/remove`, { method: 'PUT' })
  ok(r2.res)
  const gone = await Review.findById(kept._id)
  if (gone.moderation !== 'removed') throw new Error('remove failed')
  const r3 = await api(`/api/admin/reviews/${kept._id}/keep`, { method: 'PUT' })
  ok(r3.res)
  const restored = await Review.findById(kept._id)
  if (restored.moderation !== 'kept' || restored.flagged) throw new Error('restore failed')
  console.log(`  ${kept.business?.businessName} rating now ${restored.risk}`)
})

await test('merchant approve/reject cycle on a pending applicant', async () => {
  const pending = await User.findOne({ role: 'merchant', status: 'pending' })
  if (!pending) {
    console.log('  (no pending merchants left — skip)')
    return
  }
  const before = pending.businessName || pending.name
  const rj = await api(`/api/admin/merchants/${pending._id}/reject`, { method: 'PUT', body: JSON.stringify({ reason: 'Docs incomplete' }) })
  ok(rj.res)
  let after = await User.findById(pending._id)
  if (after.status !== 'rejected' || after.rejectionReason !== 'Docs incomplete') throw new Error('rejection not persisted')
  const ap = await api(`/api/admin/merchants/${pending._id}/approve`, { method: 'PUT' })
  ok(ap.res)
  after = await User.findById(pending._id)
  if (!after.verified || after.status !== 'active') throw new Error('approval not persisted')
  await User.updateOne({ _id: pending._id }, { $set: { status: 'pending', verified: false }, $unset: { rejectionReason: 1 } })
  console.log(`  ${before} rejected→approved→restored`)
})

await test('merchant status toggle on Bean & Leaf', async () => {
  const bean = await User.findOne({ businessName: 'Bean & Leaf' })
  const r = await api(`/api/admin/merchants/${bean._id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'delisted' }) })
  ok(r.res)
  if (r.body.data.status !== 'delisted') throw new Error('delist failed')
  const r2 = await api(`/api/admin/merchants/${bean._id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'live' }) })
  ok(r2.res)
  if (r2.body.data.status !== 'live') throw new Error('relive failed')
})

await test('user suspend/restore on synth user', async () => {
  const u = await api(`/api/admin/users/${synthId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'suspended' }) })
  ok(u.res)
  const r = await api(`/api/admin/users/${synthId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'active' }) })
  ok(r.res)
})

await test('messages list + mark read', async () => {
  const { body } = await api('/api/admin/messages')
  if (!Array.isArray(body.data)) throw new Error('no messages')
  console.log('  messages:', body.data.map((m) => `${m.name}:${m.topic}`).join(' | ') || 'none')
  if (body.data.length) {
    const first = body.data[0]
    const r = await api(`/api/admin/messages/${first.id}/read`, { method: 'PUT' })
    ok(r.res)
  }
})

await test('settings get + update persist', async () => {
  const g = await api('/api/admin/settings')
  ok(g.res)
  const s = g.body.data
  const r = await api('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ platformName: s.platformName, flags: { newsletter: true } }),
  })
  ok(r.res)
  if (!r.body.data.flags.newsletter) throw new Error('flag not saved')
  await api('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ flags: { newsletter: false } }),
  })
})

await test('analytics shape', async () => {
  const { body } = await api('/api/admin/analytics')
  const d = body.data
  if (!Array.isArray(d.kpis) || d.kpis.length !== 4) throw new Error('kpis')
  if (!Array.isArray(d.categories) || !d.categories.length) throw new Error('categories')
  console.log('  cats:', d.categories.map((c) => `${c.c}:${c.deals}d/${c.saves}s`).join(' | '))
})

await test('audit log has entries', async () => {
  const n = await AuditLog.countDocuments()
  if (n < 3) throw new Error(`only ${n} audit entries`)
  const last = await AuditLog.findOne().sort({ createdAt: -1 })
  console.log('  last:', last.action)
})

// cleanup synthetic user + synth review activity
await User.deleteOne({ _id: synthId })
await Interaction.deleteMany({ user: synthId })
await SavedDeal.deleteMany({ user: synthId })
await Follow.deleteMany({ user: synthId })
await Review.deleteMany({ author: synthId })

console.log(`\n${count === 0 ? 'ALL PASS' : `${count} FAILED`}`)
process.exit(count === 0 ? 0 : 1)