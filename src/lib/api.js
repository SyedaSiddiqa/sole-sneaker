const BASE = import.meta.env.VITE_API_URL || '/api'
export const TOKEN_KEY = 'sole-token'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function request(method, path, body, { signal } = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0)
  }
  let data = {}
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    // An expired/invalid token on an authenticated call -> tell AuthContext to sign out
    if (res.status === 401 && token) window.dispatchEvent(new Event('sole:unauthorized'))
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status, data.errors)
  }
  return data
}

export const api = {
  get: (path, opts) => request('GET', path, undefined, opts),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  delete: (path) => request('DELETE', path),
}

export const toQuery = (params) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return
    q.set(k, Array.isArray(v) ? v.join(',') : v)
  })
  return q.toString()
}
