import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { api } from '../../utils/api.js'

export default function LeadCaptureForm({ publicId }) {
  const [form, setForm]     = useState({ email: '', companyName: '', role: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  // Only show once the audit has been saved to the backend and has a publicId
  if (!publicId) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || status === 'loading' || status === 'success') return

    setStatus('loading')
    try {
      await api.saveLead({
        email:         form.email,
        companyName:   form.companyName,
        role:          form.role,
        auditPublicId: publicId,
      })
      setStatus('success')
      setMessage('Report saved! Check your inbox for a full summary with your AI-generated analysis.')
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-8 flex items-center justify-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4">
        <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
        <p className="font-body text-sm text-emerald-300">{message}</p>
      </div>
    )
  }

  return (
    <div className="mt-8 border-t border-white/[0.08] pt-8">
      <p className="font-body text-sm text-white/40 mb-5 text-center">
        Get this report emailed to you — includes your AI-generated savings summary
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-3">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="input-field flex-1"
          />
          <input
            type="text"
            placeholder="Company (optional)"
            value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            className="input-field sm:w-44"
          />
          <button
            type="submit"
            disabled={!form.email || status === 'loading'}
            className="btn-primary py-3 px-6 justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            {status === 'loading'
              ? <Loader2 size={15} className="animate-spin" />
              : <Mail size={15} />
            }
            {status === 'loading' ? 'Sending…' : 'Email Me'}
          </button>
        </div>

        {status === 'error' && (
          <p className="text-center text-red-400 text-xs font-body mt-2">{message}</p>
        )}
      </form>

      <p className="text-center font-body text-xs text-white/20 mt-3">
        No spam. One email with your audit summary. Unsubscribe any time.
      </p>
    </div>
  )
}
