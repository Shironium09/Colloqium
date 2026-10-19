import { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, MapPin, Globe, ShieldAlert, Award, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'
import { fetchConferenceById } from '../services/api'

function formatDate(d) {
  if (!d) return 'None listed'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCurrency(amount, currency) {
  if (amount == null) return null
  if (currency === 'PHP') return `₱${Math.round(amount).toLocaleString()}`
  if (currency === 'USD') return `$${Math.round(amount).toLocaleString()}`
  return `${amount.toLocaleString()} ${currency}`
}

export default function ConferenceDetailModal({ confId, initialData, onClose, currency = 'USD' }) {
  const [data, setData] = useState(initialData || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('fees') // 'fees' | 'about' | 'history'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchConferenceById(confId)
      .then(res => {
        if (!cancelled) {
          setData(res)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Failed to load details')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [confId])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const conf = data || initialData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden z-10"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-start justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-terracotta)' }}
              >
                {conf.acronym}
              </span>

              {conf.online && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium"
                  style={{
                    backgroundColor: conf.online === 'online option' ? 'var(--color-sage-bg)' : 'var(--color-slate-badge-bg)',
                    color: conf.online === 'online option' ? 'var(--color-sage)' : 'var(--text-muted)',
                  }}
                >
                  <Globe size={12} />
                  {conf.online === 'online option' ? 'Hybrid' : conf.online === 'online only' ? 'Virtual' : 'In-person'}
                </span>
              )}

              {conf.status && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: conf.status === 'enriched' ? 'var(--color-sage-bg)' : 'var(--color-amber-bg)',
                    color: conf.status === 'enriched' ? 'var(--color-sage)' : 'var(--color-amber)',
                  }}
                >
                  {conf.status === 'enriched' ? 'Fees verified' : 'Pending review'}
                </span>
              )}
            </div>

            <h2
              className="text-base sm:text-lg font-semibold leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {conf.name}
            </h2>

            <div className="flex items-center gap-4 mt-2.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                {conf.city}, {conf.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                {conf.start_date} {conf.end_date ? `– ${conf.end_date}` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning if flagged organizer */}
        {conf.organizer_flag && (
          <div
            className="mx-6 mt-4 p-3.5 rounded-xl border flex items-start gap-3 text-xs sm:text-sm"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
            }}
          >
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Organizer Warning</p>
              <p className="opacity-90">{conf.organizer_flag}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex items-center px-6 border-b text-xs sm:text-sm font-medium gap-6 mt-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setActiveTab('fees')}
            className={`py-3 border-b-2 cursor-pointer transition-all ${
              activeTab === 'fees'
                ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Fee Structure {conf.fees?.length ? `(${conf.fees.length})` : ''}
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`py-3 border-b-2 cursor-pointer transition-all ${
              activeTab === 'deadlines'
                ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Key Deadlines
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-semibold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Past Editions & History
          </button>

          {conf.description && (
            <button
              onClick={() => setActiveTab('about')}
              className={`py-3 border-b-2 cursor-pointer transition-all ${
                activeTab === 'about'
                  ? 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] font-semibold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Description
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading && !data && (
            <div className="py-12 flex flex-col items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="w-6 h-6 border-2 border-t-[var(--color-terracotta)] border-gray-300 rounded-full animate-spin mb-3" />
              Loading complete details...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border text-sm flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--color-amber)' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* TAB: FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              {conf.fees && conf.fees.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid gap-2.5">
                    {conf.fees.map((f) => {
                      const isVerified = f.check_status === 'verified'
                      return (
                        <div
                          key={f.id}
                          className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: isVerified ? 'var(--bg)' : 'rgba(0,0,0,0.02)',
                            opacity: isVerified ? 1 : 0.6,
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {f.category || 'Standard Registration'}
                              </span>
                              {f.tier && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono border" style={{ borderColor: 'var(--border)' }}>
                                  {f.tier}
                                </span>
                              )}
                              {!isVerified && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200">
                                  {f.check_status || 'unverified'}
                                </span>
                              )}
                            </div>
                            {f.notes && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {f.notes}
                              </p>
                            )}
                            {f.evidence && (
                              <p className="text-[11px] mt-1 font-mono line-clamp-1 italic" style={{ color: 'var(--text-muted)' }} title={f.evidence}>
                                &ldquo;{f.evidence}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="sm:text-right shrink-0">
                            <div
                              className="font-bold text-sm sm:text-base font-mono"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {currency === 'PHP'
                                ? formatCurrency(f.amount_php, 'PHP')
                                : formatCurrency(f.amount_usd, 'USD')}
                            </div>
                            {f.currency !== currency && (
                              <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                                {f.amount?.toLocaleString()} {f.currency} orig.
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-[11px] text-center pt-2" style={{ color: 'var(--text-muted)' }}>
                    Exchange rates by{' '}
                    <a
                      href="https://www.exchangerate-api.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[var(--color-terracotta)]"
                    >
                      ExchangeRate-API
                    </a>
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  <HelpCircle className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="font-medium">No verified registration fees available yet.</p>
                  <p className="text-xs mt-1">
                    {conf.review_note || 'The conference website has not published fees for this cycle.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: DEADLINES */}
          {activeTab === 'deadlines' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Abstract Deadline', val: conf.abstract_deadline },
                  { label: 'Paper Submission', val: conf.paper_deadline },
                  { label: 'Author Notification', val: conf.notification_date },
                  { label: 'Camera Ready Deadline', val: conf.camera_ready_deadline },
                  { label: 'Registration Deadline', val: conf.registration_deadline },
                ].map(({ label, val }) => (
                  <div
                    key={label}
                    className="p-3.5 rounded-xl border flex flex-col justify-between text-xs sm:text-sm"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-semibold mt-1 font-mono text-[13px]" style={{ color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {formatDate(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: 'var(--color-sage)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {conf.history_label === 'has history' ? 'Past Publication Proceedings' : 'Publication History'}
                </span>
              </div>

              {conf.history?.editions && conf.history.editions.length > 0 ? (
                <div className="space-y-2">
                  {conf.history.editions.map((ed, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                    >
                      <div>
                        <span className="font-bold font-mono mr-2 text-[var(--color-terracotta)]">
                          {ed.year}
                        </span>
                        <span style={{ color: 'var(--text-primary)' }}>{ed.name || conf.name}</span>
                        {ed.publisher && (
                          <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-mono">
                            {ed.publisher}
                          </span>
                        )}
                      </div>
                      {ed.doi && (
                        <a
                          href={`https://doi.org/${ed.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs flex items-center gap-1 text-[var(--color-terracotta)] hover:underline"
                        >
                          DOI <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : conf.history_years?.length > 0 ? (
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">Recorded past active years:</p>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {conf.history_years.map(y => (
                      <span key={y} className="px-2.5 py-1 rounded-lg border font-semibold" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                        {y}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic">
                  No verified prior editions found. This may be an inaugural edition or indexed by smaller independent publishers.
                </p>
              )}
            </div>
          )}

          {/* TAB: ABOUT / DESCRIPTION */}
          {activeTab === 'about' && conf.description && (
            <div className="text-xs sm:text-sm leading-relaxed p-4 rounded-xl border whitespace-pre-wrap font-sans" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}>
              {conf.description}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2">
            {conf.sources?.map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {conf.registration_url && (
              <a
                href={conf.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all text-white shadow-sm cursor-pointer"
                style={{ backgroundColor: 'var(--color-terracotta)' }}
              >
                Register <ExternalLink size={14} />
              </a>
            )}
            {conf.homepage && (
              <a
                href={conf.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-all cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', backgroundColor: 'var(--bg)' }}
              >
                Visit Site <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
