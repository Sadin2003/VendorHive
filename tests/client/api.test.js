import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../src/services/api.js'

function fakeResponse({ ok = true, status = 200, json } = {}) {
  return { ok, status, json: async () => json }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api.request', () => {
  it('unwraps the data payload', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { success: true, data: [1, 2, 3] } }))
    await expect(api.get('/x')).resolves.toEqual([1, 2, 3])
    expect(fetch).toHaveBeenCalledWith('/api/x', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    })
  })

  it('passes through the raw response when there is no data key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { message: 'hi' } }))
    await expect(api.get('/y')).resolves.toEqual({ message: 'hi' })
  })

  it('serializes JSON bodies with the right headers', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { data: { token: 't' } } }))
    await api.auth.login({ email: 'a@b.co', password: 'pw' })
    const [, opts] = fetch.mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toEqual({ email: 'a@b.co', password: 'pw' })
  })

  it('sends FormData without a content-type header', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { data: 'ok' } }))
    const form = new FormData()
    form.append('cover', 'x')
    await api.upload('/merchant/cover', form)
    const [, opts] = fetch.mock.calls[0]
    expect(opts.body).toBe(form)
    expect(opts.headers).toBeUndefined()
  })

  it('throws the server error message with status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ ok: false, status: 404, json: { error: 'Not found' } }))
    await expect(api.get('/deals/nope')).rejects.toMatchObject({ message: 'Not found', status: 404 })
  })

  it('falls back to a generic error message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ ok: false, status: 500, json: {} }))
    await expect(api.get('/deals')).rejects.toThrow('Request failed (500)')
  })
})

describe('api.qs', () => {
  it('builds encoded query strings and drops empty values', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { data: [] } }))
    await api.public.businesses({ q: 'Café', page: 2, tag: '', distance: null })
    expect(fetch).toHaveBeenCalledWith(
      '/api/businesses?q=Caf%C3%A9&page=2',
      expect.objectContaining({ credentials: 'include' })
    )
  })

  it('omits the query string when params are empty', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(fakeResponse({ json: { data: [] } }))
    await api.public.deals({})
    expect(fetch).toHaveBeenCalledWith('/api/deals', expect.any(Object))
  })
})
