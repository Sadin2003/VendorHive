const BASE = '/api'

async function request(path, options = {}) {
  const { body, form, ...rest } = options

  const res = await fetch(BASE + path, {
    credentials: 'include',
    headers: form
      ? undefined
      : { 'Content-Type': 'application/json', ...(rest.headers || {}) },
    body: form || (body ? JSON.stringify(body) : undefined),
    ...rest,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }

  return data && typeof data === 'object' && 'data' in data ? data.data : data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', form: formData }),

  // ---- Auth ----
  auth: {
    register: (payload) => api.post('/auth/register', payload),
    login: (payload) => api.post('/auth/login', payload),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
    resetPassword: (payload) => api.post('/auth/reset-password', payload),
  },

  // ---- Public ----
  public: {
    categories: () => api.get('/categories'),
    businesses: (params = {}) => api.get(`/businesses${qs(params)}`),
    business: (id) => api.get(`/businesses/${id}`),
    deals: (params = {}) => api.get(`/deals${qs(params)}`),
    deal: (id) => api.get(`/deals/${id}`),
    relatedDeals: (id) => api.get(`/deals/${id}/related`),
    contact: (payload) => api.post('/contact', payload),
  },

  // ---- Customer (logged-in member) ----
  me: {
    profile: () => api.get('/me'),
    updateProfile: (payload) => api.put('/me', payload),
    changePassword: (payload) => api.put('/me/password', payload),
    deleteAccount: () => api.del('/me'),
    dashboard: (params = {}) => api.get(`/me/dashboard${qs(params)}`),
    saved: () => api.get('/me/deals'),
    saveDeal: (dealId) => api.put(`/me/deals/${dealId}`),
    unsaveDeal: (dealId) => api.del(`/me/deals/${dealId}`),
    following: () => api.get('/me/following'),
    follow: (businessId) => api.put(`/me/following/${businessId}`),
    unfollow: (businessId) => api.del(`/me/following/${businessId}`),
    reviews: () => api.get('/me/reviews'),
    createReview: (payload) => api.post('/me/reviews', payload),
    updateReview: (id, payload) => api.put(`/me/reviews/${id}`, payload),
    deleteReview: (id) => api.del(`/me/reviews/${id}`),
    toggleHelpful: (reviewId) => api.post(`/me/reviews/${reviewId}/helpful`),
    notifications: () => api.get('/me/notifications'),
    markAllNotificationsRead: () => api.put('/me/notifications/read'),
    markNotificationRead: (id) => api.put(`/me/notifications/${id}/read`),
    dismissNotification: (id) => api.del(`/me/notifications/${id}`),
  },

  // ---- Merchant ----
  merchant: {
    dashboard: () => api.get('/merchant/dashboard'),
    profile: () => api.get('/merchant/profile'),
    updateProfile: (payload) => api.put('/merchant/profile', payload),
    uploadCover: (formData) => api.upload('/merchant/cover', formData),
    uploadGallery: (formData) => api.upload('/merchant/gallery', formData),
    deals: () => api.get('/merchant/deals'),
    deal: (id) => api.get(`/merchant/deals/${id}`),
    createDeal: (payload) => api.post('/merchant/deals', payload),
    updateDeal: (id, payload) => api.put(`/merchant/deals/${id}`, payload),
    deleteDeal: (id) => api.del(`/merchant/deals/${id}`),
    reviews: () => api.get('/merchant/reviews'),
    flagReview: (id, reason) => api.put(`/merchant/reviews/${id}/flag`, { reason }),
    replyToReview: (id, text) => api.put(`/merchant/reviews/${id}/reply`, { text }),
    promotions: () => api.get('/merchant/promotions'),
    partners: () => api.get('/merchant/partners'),
    createPromotion: (payload) => api.post('/merchant/promotions', payload),
    acceptPromotion: (id) => api.put(`/merchant/promotions/${id}/accept`),
    declinePromotion: (id) => api.put(`/merchant/promotions/${id}/decline`),
    deletePromotion: (id) => api.del(`/merchant/promotions/${id}`),
  },

  // ---- Admin ----
  admin: {
    dashboard: () => api.get('/admin/dashboard'),
    analytics: () => api.get('/admin/analytics'),
    verification: () => api.get('/admin/merchants/verification'),
    approveMerchant: (id) => api.put(`/admin/merchants/${id}/approve`),
    rejectMerchant: (id, reason) => api.put(`/admin/merchants/${id}/reject`, { reason }),
    merchants: () => api.get('/admin/merchants'),
    merchantStatus: (id, status) => api.put(`/admin/merchants/${id}/status`, { status }),
    users: () => api.get('/admin/users'),
    userStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
    reviews: (scope = 'queue') => api.get(`/admin/reviews?scope=${scope}`),
    keepReview: (id) => api.put(`/admin/reviews/${id}/keep`),
    removeReview: (id) => api.put(`/admin/reviews/${id}/remove`),
    escalateReview: (id) => api.put(`/admin/reviews/${id}/escalate`),
    reviewRisk: (id, risk) => api.put(`/admin/reviews/${id}/risk`, { risk }),
    messages: () => api.get('/admin/messages'),
    markMessageRead: (id) => api.put(`/admin/messages/${id}/read`),
    deleteMessage: (id) => api.del(`/admin/messages/${id}`),
    settings: () => api.get('/admin/settings'),
    updateSettings: (payload) => api.put('/admin/settings', payload),
  },
}

function qs(params) {
  const keys = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!keys.length) return ''
  const p = new URLSearchParams()
  for (const [k, v] of keys) p.set(k, v)
  return `?${p.toString()}`
}