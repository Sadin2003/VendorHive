const BASE = '/api'

async function request(path, options = {}) {
  const { body, ...rest } = options
  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),

  auth: {
    register: (payload) => api.post('/auth/register', payload),
    login: (payload) => api.post('/auth/login', payload),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
  },

  admin: {
    stats: () => api.get('/admin/stats'),
    verification: () => api.get('/admin/verification'),
    approveVerification: (id) => api.post(`/admin/verification/approve/${id}`),
    rejectVerification: (id, reason) => api.post(`/admin/verification/reject/${id}`, { reason }),
    users: (params = {}) => {
      const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v && v !== 'all')).toString()
      return api.get(`/admin/users${q ? `?${q}` : ''}`)
    },
    userStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
    businesses: () => api.get('/admin/businesses'),
    businessStatus: (id, status) => api.patch(`/admin/businesses/${id}/status`, { status }),
    reviews: (tab = 'pending') => api.get(`/admin/reviews?tab=${tab}`),
    reviewAction: (id, action) => api.post(`/admin/reviews/${id}/action`, { action }),
    analytics: () => api.get('/admin/analytics'),
    settings: () => api.get('/admin/settings'),
    updateSettings: (payload) => api.patch('/admin/settings', payload),
  },
}

export const csvUrl = (path) => BASE + path
