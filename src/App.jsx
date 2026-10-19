import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Sun,
  Moon,
  X,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import ConferenceCard from './components/ConferenceCard'
import ConferenceDetailModal from './components/ConferenceDetailModal'
import {
  fetchConferences,
  fetchHealth,
  fetchSummary,
  getApiKey,
  setApiKey,
  clearConferenceCache,
} from './services/api'

function isPast(d) {
  if (!d) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(d + 'T00:00:00') < today
}

const Icon = {
  Search: (p) => <Search size={16} strokeWidth={1.8} {...p} />,
  Filter: (p) => <SlidersHorizontal size={15} strokeWidth={1.8} {...p} />,
  X: (p) => <X size={18} strokeWidth={1.8} {...p} />,
}

function FilterPanel({ open, onClose, filters, onChange, summary }) {
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(false)
  const asideRef = useRef(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true))
      })
      return () => cancelAnimationFrame(id)
    } else {
      setActive(false)
      const timer = setTimeout(() => setMounted(false), 280)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted) return null

  const sections = [
    {
      key: 'continent',
      title: 'Continent',
      options: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'],
    },
    {
      key: 'online',
      title: 'Attendance',
      options: [
        { v: 'online option', l: 'Hybrid' },
        { v: 'online only', l: 'Virtual' },
        { v: 'in person only', l: 'In-person' },
      ],
    },
    {
      key: 'fees',
      title: 'Fees',
      options: [
        { v: 'has_fees', l: 'Has fees' },
        { v: 'no_fees', l: 'No fees yet' },
      ],
    },
    {
      key: 'history',
      title: 'History',
      options: [
        { v: 'has history', l: 'Has editions' },
        { v: 'no history found', l: 'No editions' },
      ],
    },
    {
      key: 'source',
      title: 'Source',
      options: ['ieee', 'wikicfp', 'easychair', 'edas', 'conferenceindex', 'ieeecs'],
    },
    {
      key: 'deadlines',
      title: 'Deadlines',
      options: [{ v: 'open', l: 'Still open' }],
    },
    {
      key: 'flagged',
      title: 'Flagged Organizers',
      options: [{ v: 'show_flagged', l: 'Show flagged / predatory warnings' }],
    },
  ]

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: active ? 1 : 0,
          pointerEvents: active ? 'auto' : 'none',
          transition: 'opacity 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Conference Filters"
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm sm:max-w-md overflow-y-auto flex flex-col"
        style={{
          backgroundColor: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: active ? '-8px 0 36px rgba(0, 0, 0, 0.16)' : 'none',
          transform: active ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease',
        }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 shrink-0"
          style={{
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Filters
            </h2>
            {summary?.scope?.conferences && (
              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {summary.scope.conferences} in scope
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
            style={{
              color: 'var(--text-muted)',
              backgroundColor: 'transparent',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            aria-label="Close filters"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-7 flex-1">
          {sections.map((sec) => (
            <div key={sec.key}>
              <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {sec.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {sec.options.map((opt) => {
                  const val = typeof opt === 'string' ? opt : opt.v
                  const label = typeof opt === 'string' ? opt : opt.l
                  const activeList = Array.isArray(filters[sec.key]) ? filters[sec.key] : []
                  const isOptActive = activeList.includes(val)
                  return (
                    <button
                      key={String(val)}
                      onClick={() => {
                        const next = isOptActive
                          ? activeList.filter((x) => x !== val)
                          : [...activeList, val]
                        onChange(sec.key, next)
                      }}
                      className="px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-150 active:scale-95"
                      style={{
                        border: `1px solid ${
                          isOptActive ? 'var(--color-terracotta-border)' : 'var(--border)'
                        }`,
                        backgroundColor: isOptActive
                          ? 'var(--color-terracotta-muted)'
                          : 'transparent',
                        color: isOptActive ? 'var(--color-terracotta)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            onClick={() => onChange('reset')}
            className="w-full py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-150 active:scale-[0.98]"
            style={{
              border: '1px solid var(--color-terracotta-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-terracotta)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-terracotta-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Reset all
          </button>
        </div>
      </aside>
    </>
  )
}

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date: Earliest First' },
  { value: 'date-desc', label: 'Date: Latest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

function SortDropdown({ sortBy, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeOption =
    SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0]

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative select-none" ref={dropdownRef}>
      <button
        type="button"
        id="sort-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-2 transition-all duration-150"
        style={{
          borderColor: isOpen ? 'var(--color-terracotta-border)' : 'var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          boxShadow: isOpen ? '0 0 0 2px var(--color-terracotta-muted)' : 'none',
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeOption.label}</span>
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
          }}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full mt-1.5 z-40 w-48 py-1 rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
          }}
        >
          {SORT_OPTIONS.map((opt) => {
            const isSelected = opt.value === sortBy
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSortChange(opt.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium cursor-pointer flex items-center justify-between transition-colors duration-120"
                style={{
                  backgroundColor: isSelected ? 'var(--color-terracotta-muted)' : 'transparent',
                  color: isSelected ? 'var(--color-terracotta)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
              >
                <span style={{ color: isSelected ? 'var(--color-terracotta)' : 'var(--text-primary)' }}>
                  {opt.label}
                </span>
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-terracotta)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('cq-theme') || 'light')
  const [currency, setCurrency] = useState('USD')
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedConf, setSelectedConf] = useState(null)
  const [sortBy, setSortBy] = useState('date-asc') // 'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12 // Default to 12 cards per page

  // Data loading state
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [healthWindow, setHealthWindow] = useState(null)
  const [summary, setSummary] = useState(null)
  const EMPTY = {
    continent: ['Asia'],
    online: [],
    fees: [],
    history: [],
    source: [],
    deadlines: [],
    flagged: [],
  }
  const [filters, setFilters] = useState(EMPTY)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cq-theme', theme)
  }, [theme])

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initial load with SWR (Stale-While-Revalidate)
  const loadData = async (forceRefresh = false) => {
    // Only show full blocking loader if we don't have conferences in memory
    if (conferences.length === 0 || forceRefresh) {
      if (forceRefresh) setIsRefreshing(true)
      else setLoading(true)
    }
    setError(null)
    try {
      // 1. Check health
      fetchHealth()
        .then((h) => {
          if (h?.window) setHealthWindow(h.window)
        })
        .catch(() => { })

      // 2. Fetch summary
      fetchSummary({ forceRefresh })
        .then((s) => setSummary(s))
        .catch(() => { })

      // 3. Fetch conferences with SWR:
      let data = []
      const selectedContinents = filters.continent || []
      if (selectedContinents.length === 1) {
        data = await fetchConferences(
          {
            continent: selectedContinents[0],
            compact: true,
            limit: 1000,
            forceRefresh,
          },
          (freshData) => {
            setConferences(freshData || [])
            setIsRefreshing(false)
          }
        )
      } else if (selectedContinents.length > 1) {
        const results = await Promise.all(
          selectedContinents.map((cont) =>
            fetchConferences({
              continent: cont,
              compact: true,
              limit: 1000,
              forceRefresh,
            })
          )
        )
        const map = new Map()
        results.flat().forEach((c) => {
          if (c && c.id) map.set(c.id, c)
        })
        data = Array.from(map.values())
      } else {
        // No continent filter (all continents)
        data = await fetchConferences(
          {
            continent: null,
            compact: true,
            limit: 1000,
            forceRefresh,
          },
          (freshData) => {
            setConferences(freshData || [])
            setIsRefreshing(false)
          }
        )
      }
      setConferences(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch conferences')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const continentKey = (filters.continent || []).slice().sort().join(',')
  useEffect(() => {
    loadData()
  }, [continentKey])

  function handleFilter(key, val) {
    if (key === 'reset') return setFilters(EMPTY)
    setFilters((p) => ({ ...p, [key]: val }))
  }

  const activeCount = useMemo(() => {
    let count = 0
    const isCustomContinent =
      (filters.continent || []).length !== 1 || filters.continent[0] !== 'Asia'
    if (isCustomContinent) count += (filters.continent || []).length
    count += (filters.online || []).length
    count += (filters.fees || []).length
    count += (filters.history || []).length
    count += (filters.source || []).length
    count += (filters.deadlines || []).length
    count += (filters.flagged || []).length
    return count
  }, [filters])

  // Filter & Sort Conferences Client-side for snappy UX
  const list = useMemo(() => {
    const res = conferences.filter((c) => {
      // Hide flagged by default unless toggled
      const showFlagged = (filters.flagged || []).includes('show_flagged')
      if (!showFlagged && c.organizer_flag) return false

      if (query) {
        const q = query.toLowerCase()
        const text = `${c.acronym || ''} ${c.name || ''} ${c.city || ''} ${c.country || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      if (filters.continent && filters.continent.length > 0) {
        if (!filters.continent.includes(c.continent)) return false
      }
      if (filters.fees && filters.fees.length === 1) {
        const hasFee = Boolean(c.standard_fee || c.fee_min)
        if (filters.fees.includes('has_fees') && !hasFee) return false
        if (filters.fees.includes('no_fees') && hasFee) return false
      }
      if (filters.online && filters.online.length > 0) {
        if (!filters.online.includes(c.online)) return false
      }
      if (filters.history && filters.history.length > 0) {
        if (!filters.history.includes(c.history_label)) return false
      }
      if (filters.source && filters.source.length > 0) {
        const match = c.sources?.some((s) => filters.source.includes(s))
        if (!match) return false
      }
      if (filters.deadlines && filters.deadlines.includes('open')) {
        const d = c.abstract_deadline || c.paper_deadline
        if (!d || isPast(d)) return false
      }
      return true
    })

    // Sort
    return res.sort((a, b) => {
      if (sortBy === 'date-asc') {
        return (a.start_date || '').localeCompare(b.start_date || '')
      }
      if (sortBy === 'date-desc') {
        return (b.start_date || '').localeCompare(a.start_date || '')
      }
      if (sortBy === 'price-asc') {
        const pa = a.standard_fee?.amount_usd ?? a.fee_min_usd ?? 999999
        const pb = b.standard_fee?.amount_usd ?? b.fee_min_usd ?? 999999
        return pa - pb
      }
      if (sortBy === 'price-desc') {
        const pa = a.standard_fee?.amount_usd ?? a.fee_min_usd ?? -1
        const pb = b.standard_fee?.amount_usd ?? b.fee_min_usd ?? -1
        return pb - pa
      }
      return 0
    })
  }, [conferences, query, filters, sortBy])

  // Reset to first page whenever search, filters, sorting or pageSize changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query, filters, sortBy, pageSize])

  // Pagination calculation
  const totalItems = list.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return list.slice(startIndex, startIndex + pageSize)
  }, [list, currentPage, pageSize])

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg)', transition: 'background-color 180ms ease' }}
    >
      {/* Navigation Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          transition: 'background-color 180ms ease, border-color 180ms ease',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4 select-none">
          <a href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <img
              src={theme === 'light' ? '/lightmode.svg' : '/darkmode.svg'}
              alt="Colloquium logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
            <span
              className="text-[20px] sm:text-[20px] font-semibold tracking-tight italic"
              style={{ color: 'var(--text-primary)' }}
            >
              COLLOQUIUM
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-xl">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[110px] sm:min-w-[180px] max-w-[280px]">
              <Icon.Search
                className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search acronym, name, city..."
                className={`w-full h-9 pl-8 sm:pl-10 ${query ? 'pr-8' : 'pr-2.5 sm:pr-4'
                  } rounded-lg text-[12px] sm:text-[13px]`}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-terracotta-border)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    document.getElementById('search-input')?.focus()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer transition-colors"
                  style={{
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X size={13} strokeWidth={2.2} />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                transition: 'border-color 150ms ease, color 150ms ease',
              }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-terracotta-border)'
                e.currentTarget.style.color = 'var(--color-terracotta)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
            </button>

            {/* Filter Toggle */}
            <button
              id="filter-btn"
              onClick={() => setFilterOpen(true)}
              className="shrink-0 h-9 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-medium cursor-pointer"
              style={{
                transition: 'all 150ms ease',
                border: `1px solid ${activeCount > 0 ? 'var(--color-terracotta-border)' : 'var(--border)'
                  }`,
                backgroundColor: activeCount > 0 ? 'var(--color-terracotta-muted)' : 'transparent',
                color: activeCount > 0 ? 'var(--color-terracotta)' : 'var(--text-secondary)',
              }}
            >
              <Icon.Filter />
              <span className="hidden xs:inline sm:inline">Filters</span>
              {activeCount > 0 && (
                <span
                  className="w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: 'var(--color-terracotta)', color: '#fff' }}
                >
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 pb-20 flex-1">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Conferences
            </h1>
            <p className="text-xs sm:text-[14px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              CS & Technology &middot;{' '}
              {healthWindow ? `${healthWindow[0]} to ${healthWindow[1]}` : 'Oct 2026 – Mar 2027'} &middot;{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{list.length}</strong> conference
              {list.length !== 1 ? 's' : ''} in{' '}
              {filters.continent.length === 0
                ? 'All Continents'
                : filters.continent.length === 1
                ? filters.continent[0]
                : `${filters.continent.length} Continents`}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Currency Switcher */}
            <div
              className="inline-flex items-center p-0.5 rounded-lg border text-[11px] font-semibold shrink-0 select-none h-9"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className="px-2.5 h-full rounded-md cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: currency === 'USD' ? 'var(--bg)' : 'transparent',
                  color: currency === 'USD' ? 'var(--color-terracotta)' : 'var(--text-muted)',
                  boxShadow: currency === 'USD' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  border: currency === 'USD' ? '1px solid var(--border)' : '1px solid transparent',
                }}
                title="Display in US Dollars ($)"
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('PHP')}
                className="px-2.5 h-full rounded-md cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: currency === 'PHP' ? 'var(--bg)' : 'transparent',
                  color: currency === 'PHP' ? 'var(--color-terracotta)' : 'var(--text-muted)',
                  boxShadow: currency === 'PHP' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  border: currency === 'PHP' ? '1px solid var(--border)' : '1px solid transparent',
                }}
                title="Display in Philippine Pesos (₱)"
              >
                ₱ PHP
              </button>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />

            {/* Refresh Cache Button */}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-9 w-9 rounded-lg border flex items-center justify-center cursor-pointer transition-all hover:border-[var(--color-terracotta-border)] hover:text-[var(--color-terracotta)]"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-secondary)',
              }}
              title="Refresh conference catalog from API"
              aria-label="Refresh conference catalog"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[var(--color-terracotta)]' : ''} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className="mb-8 p-4 rounded-xl border flex items-center justify-between gap-3 text-sm"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
            }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-red-600 text-white cursor-pointer"
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-9 h-9 border-3 border-t-[var(--color-terracotta)] border-gray-200 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Loading conference catalog from API...
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Fetching events across{' '}
              {filters.continent.length === 0
                ? 'All Continents'
                : filters.continent.join(', ')}
            </p>
          </div>
        ) : list.length > 0 ? (
          /* Cards Grid & Pagination */
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
              {paginatedList.map((c) => (
                <div key={c.id} className="w-full flex">
                  <ConferenceCard
                    conf={c}
                    currency={currency}
                    onSelect={(selected) => setSelectedConf(selected)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="flex flex-col items-center justify-center gap-3 pt-8 select-none"
              >
                {/* Numbers and Previous/Next buttons centered without boxes */}
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (currentPage !== 1) e.currentTarget.style.color = 'var(--color-terracotta)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                    })
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push({ isEllipsis: true, key: `ell-${p}` })
                      }
                      acc.push({ page: p, isEllipsis: false, key: `p-${p}` })
                      return acc
                    }, [])
                    .map((item) => {
                      if (item.isEllipsis) {
                        return (
                          <span
                            key={item.key}
                            className="w-6 text-center text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            ...
                          </span>
                        )
                      }
                      const isCur = item.page === currentPage
                      return (
                        <button
                          key={item.key}
                          onClick={() => handlePageChange(item.page)}
                          className="w-8 h-8 rounded-full text-xs font-mono font-medium cursor-pointer transition-colors"
                          style={{
                            backgroundColor: isCur ? 'var(--color-terracotta-muted)' : 'transparent',
                            color: isCur ? 'var(--color-terracotta)' : 'var(--text-secondary)',
                            fontWeight: isCur ? '700' : '500',
                          }}
                          onMouseEnter={e => {
                            if (!isCur) e.currentTarget.style.color = 'var(--color-terracotta)'
                          }}
                          onMouseLeave={e => {
                            if (!isCur) e.currentTarget.style.color = 'var(--text-secondary)'
                          }}
                        >
                          {item.page}
                        </button>
                      )
                    })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (currentPage !== totalPages) e.currentTarget.style.color = 'var(--color-terracotta)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>

                {/* Centered description below with increased spacing */}
                <p className="text-xs font-medium text-center mt-10 sm:mt-4 tracking-normal" style={{ color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {Math.min(currentPage * pageSize, totalItems)}
                  </strong>{' '}
                  of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> conferences
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl">
            <Icon.Search style={{ color: 'var(--text-muted)', width: 28, height: 28, marginBottom: 12 }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              No conferences match your search
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your filters or query
            </p>
            <button
              onClick={() => {
                setQuery('')
                handleFilter('reset')
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border hover:border-[var(--color-terracotta-border)]"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--color-terracotta)',
                backgroundColor: 'var(--surface)',
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Mandatory Attribution Footer */}
      <footer
        className="mt-auto py-6 border-t text-center text-xs"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text-muted)',
        }}
      >
        <p>
          Conference data refreshed from verified academic publisher listings &middot; Rates by{' '}
          <a
            href="https://www.exchangerate-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color-terracotta)]"
          >
            ExchangeRate-API
          </a>
        </p>
      </footer>

      {/* Slide-out Filter Panel */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={handleFilter}
        summary={summary}
      />

      {/* Detailed View Modal */}
      {selectedConf && (
        <ConferenceDetailModal
          confId={selectedConf.id}
          initialData={selectedConf}
          currency={currency}
          onClose={() => setSelectedConf(null)}
        />
      )}
    </div>
  )
}

