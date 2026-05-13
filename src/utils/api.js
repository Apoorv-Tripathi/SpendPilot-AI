const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || 'Request failed')
  return json.data
}

export const api = {
  saveAudit: (auditReport)  => request('/audits', { method: 'POST', body: JSON.stringify(auditReport) }),
  getAudit:  (publicId)     => request(`/audits/${publicId}`),
  saveLead:  (leadData)     => request('/leads',  { method: 'POST', body: JSON.stringify(leadData) }),
}
