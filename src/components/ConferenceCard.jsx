import { useState } from 'react'

function formatDateRange(s, e) {
  if (!s) return 'TBA'
  const start = new Date(s + 'T00:00:00')
  const end = e ? new Date(e + 'T00:00:00') : null
  const sm = start.toLocaleDateString('en-US', { month: 'short' })
  const sd = start.getDate()
  if (!end) return `${sm} ${sd}, ${start.getFullYear()}`
  const em = end.toLocaleDateString('en-US', { month: 'short' })
  const ed = end.getDate()
  if (sm === em) return `${sm} ${sd}–${ed}, ${start.getFullYear()}`
  return `${sm} ${sd} – ${em} ${ed}, ${start.getFullYear()}`
}

function formatDate(d) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isPast(d) {
  if (!d) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(d + 'T00:00:00') < today
}

function feeLabel(status, note) {
  if (status === 'enriched') return 'Fees verified'
  if (note?.startsWith('fees not published') || note?.startsWith('fees not found')) return 'Fees not posted yet'
  if (note?.startsWith('prices on the page')) return 'Fees on site, not extracted'
  return 'Pending review'
}

function modeLabel(online) {
  if (online === 'online option') return 'Hybrid'
  if (online === 'online only') return 'Virtual'
  if (online === 'in person only') return 'In-person'
  return null
}

function getFeeAmount(fee, curr) {
  if (!fee) return null
  if (curr === 'PHP') {
    const amt = fee.amount_php ?? (fee.amount_usd ? Math.round(fee.amount_usd * 62.5) : null)
    return amt != null ? `₱${Math.round(amt).toLocaleString()}` : null
  }
  return fee.amount_usd != null ? `$${fee.amount_usd.toLocaleString()}` : null
}

const GlobeIcon = (p) => (
  <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const MapPinIcon = (p) => (
  <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const CalendarIcon = (p) => (
  <svg {...p} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ClockIcon = (p) => (
  <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ArrowIcon = (p) => (
  <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function ConferenceCard({ conf: c, currency = 'USD', onSelect }) {
  const mode = modeLabel(c.online)
  const deadline = c.abstract_deadline || c.paper_deadline
  const deadlinePassed = isPast(deadline)
  const hasFee = !!c.standard_fee

  return (
    <article
      onClick={() => onSelect && onSelect(c)}
      className="group flex flex-col justify-between rounded-2xl border p-6 sm:p-8 md:p-9 w-full cursor-pointer hover:shadow-md"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        padding: 'clamp(22px, 4vw, 34px)',
        transition: 'all 180ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-terracotta-border)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div>
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <span
            className="text-base sm:text-[17px] font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-terracotta)' }}
          >
            {c.acronym}
          </span>

          {mode && (
            <span
              className="text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0"
              style={{
                backgroundColor: c.online === 'online option' ? 'var(--color-sage-bg)' : 'var(--color-slate-badge-bg)',
                color: c.online === 'online option' ? 'var(--color-sage)' : 'var(--text-muted)',
              }}
            >
              <GlobeIcon style={{ width: 11, height: 11 }} />
              {mode}
            </span>
          )}
        </div>

        <h3
          className="text-base sm:text-[17px] font-medium leading-snug mb-5"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          {c.name}
        </h3>

        <div className="flex flex-col gap-2 mb-6 text-[13px] sm:text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-2">
            <MapPinIcon style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {c.city}, {c.country}
          </span>
          <span className="flex items-center gap-2">
            <CalendarIcon style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {formatDateRange(c.start_date, c.end_date)}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-2">
        {hasFee ? (
          <div className="flex items-baseline gap-2 sm:gap-3 mb-4 flex-wrap">
            <span
              className="text-xl sm:text-2xl font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {getFeeAmount(c.standard_fee, currency)}
            </span>
            <span className="text-[12px] sm:text-[13px]" style={{ color: 'var(--text-muted)' }}>
              {currency}
            </span>
            {c.student_fee && (
              <>
                <span className="text-[12px]" style={{ color: 'var(--border)' }}>/</span>
                <span
                  className="text-sm sm:text-base font-medium tracking-tight"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
                >
                  {getFeeAmount(c.student_fee, currency)}
                </span>
                <span className="text-[11px] sm:text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  student
                </span>
              </>
            )}
          </div>
        ) : (
          <p className="text-[13px] sm:text-[14px] mb-4" style={{ color: 'var(--text-muted)' }}>
            {feeLabel(c.status, c.review_note)}
          </p>
        )}

        <div className="mb-4" style={{ height: 1, backgroundColor: 'var(--border)' }} />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[13px] flex-wrap" style={{ color: 'var(--text-muted)' }}>
            {deadline && (
              <span
                className="flex items-center gap-1.5"
                style={{
                  color: deadlinePassed ? 'var(--text-muted)' : 'var(--color-amber)',
                }}
              >
                <ClockIcon style={{ flexShrink: 0 }} />
                <span style={{ textDecoration: deadlinePassed ? 'line-through' : 'none' }}>
                  {formatDate(deadline)}
                </span>
              </span>
            )}

            {c.history_label === 'has history' && (
              <span className="flex items-center gap-1" style={{ color: 'var(--color-sage)' }}>
                {c.history_years.length} ed.
              </span>
            )}

            {c.sources?.map(s => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase inline-flex items-center"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-muted)',
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {c.homepage && (
            <a
              href={c.homepage}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium no-underline shrink-0"
              style={{ color: 'var(--text-muted)', transition: 'color 150ms ease' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-terracotta)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Visit <ArrowIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
