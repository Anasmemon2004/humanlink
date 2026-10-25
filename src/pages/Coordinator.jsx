import { useEffect, useMemo, useState } from 'react'
import { subscribeToRequests, assignRequest } from '../lib/requests'
import { REQUEST_TYPES, URGENCY_LEVELS, STATUSES } from '../lib/constants'
import {
  Search,
  UserCheck,
  Clock,
  MapPin,
  Phone,
  Users,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Utensils,
  Home,
  Stethoscope,
  LifeBuoy,
  X,
  SlidersHorizontal,
  Check,
  Activity,
  LayoutGrid,
  LayoutList,
  Printer,
  Copy,
  BarChart2,
} from '../components/icons'


// Higher number = more urgent (used for sorting)
const URGENCY_RANK = { critical: 4, high: 3, medium: 2, low: 1 }

// Category icons
const TYPE_ICONS = {
  food: Utensils,
  shelter: Home,
  medical: Stethoscope,
  rescue: AlertTriangle,
}

// Colour for each urgency badge
const URGENCY_STYLES = {
  critical: 'bg-red-600 text-white border-red-700 shadow-xs shadow-red-500/20',
  high: 'bg-orange-500 text-white border-orange-600',
  medium: 'bg-amber-400 text-slate-900 border-amber-500',
  low: 'bg-emerald-500 text-white border-emerald-600',
}

// Colour for each status badge
const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

// Turns "in_progress" into "In Progress"
function label(value) {
  if (!value) return ''
  const text = value.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Firestore timestamps can be briefly empty right after a request is created
function toMillis(ts) {
  if (!ts) return Date.now()
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  return new Date(ts).getTime()
}

function formatTime(ts) {
  if (!ts) return 'Just now'
  const date = new Date(toMillis(ts))
  const now = Date.now()
  const diffMinutes = Math.floor((now - date.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function SummaryCard({ title, count, active, onClick, icon: Icon, colorClass, borderClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 text-left transition-all border-2 cursor-pointer shadow-xs ${borderClass} ${
        active ? 'ring-2 ring-blue-600 shadow-md scale-[1.02]' : 'hover:scale-[1.01]'
      } ${colorClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{title}</span>
        {Icon && <Icon className="h-4 w-4 opacity-70" />}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">{count}</p>
      <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
        {active ? '● Filter applied' : 'Click to filter'}
      </span>
    </button>
  )
}

function RequestCard({ request }) {
  const [open, setOpen] = useState(false)
  const [volunteer, setVolunteer] = useState(request.assignedTo || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [copiedLoc, setCopiedLoc] = useState(false)

  function copyLocation() {
    if (request.location) {
      navigator.clipboard.writeText(request.location)
      setCopiedLoc(true)
      setTimeout(() => setCopiedLoc(false), 2000)
    }
  }

  const canAssign = request.status === 'new' || request.status === 'assigned'
  const TypeIcon = TYPE_ICONS[request.type] || LifeBuoy

  async function handleAssign(e) {
    e.preventDefault()
    const name = volunteer.trim()
    if (!name) {
      setMessage('Please enter a volunteer name.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await assignRequest(request.id, name)
      setMessage(`Assigned to ${name}.`)
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      console.error(err)
      setMessage('Could not assign. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isCritical = request.urgency === 'critical'

  return (
    <div
      className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-md ${
        isCritical ? 'border-l-6 border-l-red-600 border-slate-200' : 'border-slate-200/90'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Urgency Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider border ${
              URGENCY_STYLES[request.urgency] || 'bg-slate-200 text-slate-800'
            }`}
          >
            {isCritical && <span className="h-2 w-2 rounded-full bg-white animate-ping mr-0.5" />}
            <span>{request.urgency}</span>
          </span>

          {/* Type Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            <TypeIcon className="h-3.5 w-3.5 text-slate-500" />
            <span>{label(request.type)}</span>
          </span>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
              STATUS_STYLES[request.status] || 'bg-slate-100 text-slate-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                request.status === 'resolved'
                  ? 'bg-emerald-500'
                  : request.status === 'in_progress'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-blue-500'
              }`}
            />
            <span>{label(request.status)}</span>
          </span>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatTime(request.createdAt)}</span>
        </div>
      </div>

      {/* Main Request Description */}
      <div className="mt-3.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {request.description}
        </h3>
      </div>

      {/* Key Details Row: Location & People Count */}
      <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.location || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 font-medium group transition-colors"
            title="Open in Google Maps"
          >
            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
            <span className="underline decoration-slate-300 underline-offset-2 group-hover:decoration-blue-500">
              {request.location}
            </span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          {request.location && (
            <button
              type="button"
              onClick={copyLocation}
              title="Copy location"
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            >
              {copiedLoc ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {(request.peopleAffected || request.peopleCount) && (
          <span className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
            <Users className="h-3.5 w-3.5 text-slate-500" />
            <span>{request.peopleAffected ?? request.peopleCount} people affected</span>
          </span>
        )}


        {request.assignedTo && (
          <span className="flex items-center gap-1.5 font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Assigned: {request.assignedTo}</span>
          </span>
        )}
      </div>

      {/* Expand / Collapse Details Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
        >
          <span>{open ? 'Hide detailed dossier' : 'View full request dossier'}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {request.contactPhone && (
          <a
            href={`tel:${request.contactPhone}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600"
          >
            <Phone className="h-3 w-3 text-emerald-600" />
            <span>{request.contactPhone}</span>
          </a>
        )}
      </div>

      {/* Expanded Dossier Grid */}
      {open && (
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs border border-slate-200/80 animate-in fade-in">
          <div>
            <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Request Tracking ID
            </dt>
            <dd className="mt-0.5 font-mono font-bold text-slate-800 break-all select-all">
              {request.id}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Contact Person
            </dt>
            <dd className="mt-0.5 font-bold text-slate-900">
              {request.contactName || 'Not specified'}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Direct Phone Call
            </dt>
            <dd className="mt-0.5">
              {request.contactPhone ? (
                <a
                  href={`tel:${request.contactPhone}`}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="h-3 w-3 text-emerald-600" />
                  <span>{request.contactPhone}</span>
                </a>
              ) : (
                <span className="text-slate-400">Not provided</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Last Status Update
            </dt>
            <dd className="mt-0.5 text-slate-700">{formatTime(request.updatedAt)}</dd>
          </div>

          {request.notes && (
            <div className="sm:col-span-2 pt-2 border-t border-slate-200">
              <dt className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                Special Instructions & Constraints
              </dt>
              <dd className="mt-1 text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                {request.notes}
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* Volunteer Assignment Section */}
      {canAssign && (
        <form onSubmit={handleAssign} className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <UserPlus className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={volunteer}
              onChange={(e) => setVolunteer(e.target.value)}
              placeholder="Assign volunteer name (e.g. Sarah Jenkins)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {saving ? (
              <span>Dispatching...</span>
            ) : request.status === 'assigned' ? (
              <span>Reassign</span>
            ) : (
              <span>Dispatch Volunteer</span>
            )}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200">
          {message}
        </p>
      )}
    </div>
  )
}

function RequestTable({ requests }) {
  const [assigningId, setAssigningId] = useState(null)
  const [volunteerName, setVolunteerName] = useState('')
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  async function handleQuickAssign(id) {
    if (!volunteerName.trim()) return
    setSaving(true)
    try {
      await assignRequest(id, volunteerName.trim())
      setAssigningId(null)
      setVolunteerName('')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  function handleCopy(text, id) {
    if (text) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
            <th className="p-3.5 pl-4">Urgency & Category</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Assistance Description</th>
            <th className="p-3.5">Location</th>
            <th className="p-3.5">Requester Contact</th>
            <th className="p-3.5">Field Dispatch</th>
            <th className="p-3.5 pr-4 text-right">Logged</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((r) => {
            const TypeIcon = TYPE_ICONS[r.type] || LifeBuoy
            const isCritical = r.urgency === 'critical'
            const canAssign = r.status === 'new' || r.status === 'assigned'
            return (
              <tr key={r.id} className={`hover:bg-slate-50/70 transition-colors ${isCritical ? 'bg-red-50/25' : ''}`}>
                <td className="p-3.5 pl-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-extrabold uppercase text-[10px] border ${URGENCY_STYLES[r.urgency] || 'bg-slate-200 text-slate-800'}`}>
                      {isCritical && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping mr-1" />}
                      {r.urgency}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <TypeIcon className="h-3 w-3 text-slate-500" />
                      {label(r.type)}
                    </span>
                  </div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${STATUS_STYLES[r.status] || 'bg-slate-100 text-slate-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'resolved' ? 'bg-emerald-500' : r.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
                    {label(r.status)}
                  </span>
                </td>
                <td className="p-3.5 max-w-xs">
                  <p className="font-semibold text-slate-900 line-clamp-2 leading-relaxed" title={r.description}>
                    {r.description}
                  </p>
                  {(r.peopleAffected || r.peopleCount) && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                      <Users className="h-3 w-3 text-slate-400" /> {r.peopleAffected ?? r.peopleCount} people affected
                    </span>
                  )}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.location || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-medium"
                      title={r.location}
                    >
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="truncate max-w-[130px] underline decoration-slate-300 underline-offset-2">{r.location}</span>
                    </a>
                    {r.location && (
                      <button
                        type="button"
                        onClick={() => handleCopy(r.location, `loc-${r.id}`)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Copy location"
                      >
                        {copiedId === `loc-${r.id}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{r.contactName || 'Anonymous'}</div>
                  {r.contactPhone && (
                    <a href={`tel:${r.contactPhone}`} className="text-blue-700 hover:underline flex items-center gap-1 font-mono text-[11px] mt-0.5 font-bold">
                      <Phone className="h-3 w-3 text-emerald-600" /> {r.contactPhone}
                    </a>
                  )}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  {assigningId === r.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={volunteerName}
                        onChange={(e) => setVolunteerName(e.target.value)}
                        placeholder="Volunteer name..."
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs w-32 focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAssign(r.id)}
                        disabled={saving}
                        className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer text-xs"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssigningId(null)}
                        className="text-slate-400 hover:text-slate-600 px-1 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : r.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                        {r.assignedTo}
                      </span>
                      {canAssign && (
                        <button
                          type="button"
                          onClick={() => {
                            setAssigningId(r.id)
                            setVolunteerName(r.assignedTo)
                          }}
                          className="text-slate-400 hover:text-blue-600 text-[10px] font-semibold underline cursor-pointer"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  ) : canAssign ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningId(r.id)
                        setVolunteerName('')
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer"
                    >
                      <UserPlus className="h-3 w-3" /> Dispatch
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td className="p-3.5 pr-4 text-right whitespace-nowrap text-slate-400 font-mono text-[11px]">
                  {formatTime(r.createdAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Coordinator() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('urgency')

  // Live list: runs once, keeps updating whenever Firestore changes
  useEffect(() => {
    const unsubscribe = subscribeToRequests((data) => {
      setRequests(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const counts = useMemo(() => {
    const c = { new: 0, assigned: 0, in_progress: 0, resolved: 0, total: requests.length }
    requests.forEach((r) => {
      if (r.status === 'new') c.new++
      else if (r.status === 'assigned' || r.status === 'accepted') c.assigned++
      else if (r.status === 'in_progress') c.in_progress++
      else if (r.status === 'resolved') c.resolved++
    })
    return c
  }, [requests])

  const urgencyCounts = useMemo(() => {
    const u = { critical: 0, high: 0, medium: 0, low: 0 }
    requests.forEach((r) => {
      if (u[r.urgency] !== undefined) u[r.urgency]++
    })
    return u
  }, [requests])

  const typeCounts = useMemo(() => {
    const t = { food: 0, shelter: 0, medical: 0, rescue: 0 }
    requests.forEach((r) => {
      if (t[r.type] !== undefined) t[r.type]++
    })
    return t
  }, [requests])

  // Filter, then sort based on selected criteria
  const visible = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    return requests
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => typeFilter === 'all' || r.type === typeFilter)
      .filter((r) => urgencyFilter === 'all' || r.urgency === urgencyFilter)
      .filter((r) => {
        if (!query) return true
        return (
          (r.description && r.description.toLowerCase().includes(query)) ||
          (r.location && r.location.toLowerCase().includes(query)) ||
          (r.contactName && r.contactName.toLowerCase().includes(query)) ||
          (r.assignedTo && r.assignedTo.toLowerCase().includes(query)) ||
          (r.id && r.id.toLowerCase().includes(query))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          const diff = (URGENCY_RANK[b.urgency] || 0) - (URGENCY_RANK[a.urgency] || 0)
          if (diff !== 0) return diff
          return toMillis(a.createdAt) - toMillis(b.createdAt)
        }
        if (sortBy === 'newest') {
          return toMillis(b.createdAt) - toMillis(a.createdAt)
        }
        if (sortBy === 'oldest') {
          return toMillis(a.createdAt) - toMillis(b.createdAt)
        }
        if (sortBy === 'people') {
          const aCount = a.peopleAffected ?? a.peopleCount ?? 0
          const bCount = b.peopleAffected ?? b.peopleCount ?? 0
          return bCount - aCount
        }
        return 0
      })
  }, [requests, statusFilter, typeFilter, urgencyFilter, searchQuery, sortBy])

  function handleFilterCardClick(targetStatus) {
    if (statusFilter === targetStatus) {
      setStatusFilter('all')
    } else {
      setStatusFilter(targetStatus)
    }
  }

  function resetFilters() {
    setStatusFilter('all')
    setTypeFilter('all')
    setUrgencyFilter('all')
    setSearchQuery('')
    setSortBy('urgency')
  }

  const hasActiveFilters =
    statusFilter !== 'all' || typeFilter !== 'all' || urgencyFilter !== 'all' || searchQuery !== '' || sortBy !== 'urgency'

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 shadow-2xs'

  const resolutionRate = requests.length ? Math.round((counts.resolved / requests.length) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Live Status Beacon & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Triage Dispatch Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            Incident Coordinator Command
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Review incoming distress submissions, triage by multi-factor urgency rank, and dispatch local volunteer responders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Print triage sheet for offline disaster logs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Manifest</span>
          </button>
          <div className="rounded-xl bg-white px-4 py-2 border border-slate-200/90 text-right shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Queue
            </span>
            <span className="text-lg font-extrabold text-slate-900">{requests.length} Requests</span>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards (Interactive Filters) */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          title="New / Unassigned"
          count={counts.new}
          active={statusFilter === 'new'}
          onClick={() => handleFilterCardClick('new')}
          icon={LifeBuoy}
          colorClass="bg-blue-50/70 text-blue-950"
          borderClass={statusFilter === 'new' ? 'border-blue-600' : 'border-blue-200'}
        />
        <SummaryCard
          title="Assigned to Field"
          count={counts.assigned}
          active={statusFilter === 'assigned'}
          onClick={() => handleFilterCardClick('assigned')}
          icon={UserCheck}
          colorClass="bg-purple-50/70 text-purple-950"
          borderClass={statusFilter === 'assigned' ? 'border-purple-600' : 'border-purple-200'}
        />
        <SummaryCard
          title="In Progress"
          count={counts.in_progress}
          active={statusFilter === 'in_progress'}
          onClick={() => handleFilterCardClick('in_progress')}
          icon={Activity}
          colorClass="bg-amber-50/70 text-amber-950"
          borderClass={statusFilter === 'in_progress' ? 'border-amber-600' : 'border-amber-200'}
        />
        <SummaryCard
          title="Aid Resolved"
          count={counts.resolved}
          active={statusFilter === 'resolved'}
          onClick={() => handleFilterCardClick('resolved')}
          icon={CheckCircle2}
          colorClass="bg-emerald-50/70 text-emerald-950"
          borderClass={statusFilter === 'resolved' ? 'border-emerald-600' : 'border-emerald-200'}
        />
      </div>

      {/* Operational Analytics & Distribution Dashboard */}
      {requests.length > 0 && (
        <div className="mt-6 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Operational Triage Analytics
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Overall Resolution:</span>
              <span className="font-bold text-slate-900">{resolutionRate}%</span>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Segmented Urgency Distribution Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-600">
              <span>Urgency Distribution ({requests.length} total)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-red-700">
                  <span className="h-2 w-2 rounded-full bg-red-600" /> Critical: {urgencyCounts.critical}
                </span>
                <span className="flex items-center gap-1 text-orange-700">
                  <span className="h-2 w-2 rounded-full bg-orange-500" /> High: {urgencyCounts.high}
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Medium: {urgencyCounts.medium}
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low: {urgencyCounts.low}
                </span>
              </div>
            </div>

            <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
              {urgencyCounts.critical > 0 && (
                <div
                  className="bg-red-600 rounded-sm transition-all"
                  style={{ width: `${(urgencyCounts.critical / requests.length) * 100}%` }}
                  title={`Critical: ${urgencyCounts.critical}`}
                />
              )}
              {urgencyCounts.high > 0 && (
                <div
                  className="bg-orange-500 rounded-sm transition-all"
                  style={{ width: `${(urgencyCounts.high / requests.length) * 100}%` }}
                  title={`High: ${urgencyCounts.high}`}
                />
              )}
              {urgencyCounts.medium > 0 && (
                <div
                  className="bg-amber-400 rounded-sm transition-all"
                  style={{ width: `${(urgencyCounts.medium / requests.length) * 100}%` }}
                  title={`Medium: ${urgencyCounts.medium}`}
                />
              )}
              {urgencyCounts.low > 0 && (
                <div
                  className="bg-emerald-500 rounded-sm transition-all"
                  style={{ width: `${(urgencyCounts.low / requests.length) * 100}%` }}
                  title={`Low: ${urgencyCounts.low}`}
                />
              )}
            </div>
          </div>

          {/* Category Chips Breakdown */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Needs:</span>
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold">
              <Utensils className="h-3 w-3 text-amber-600" /> Food & Water: {typeCounts.food}
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">
              <Home className="h-3 w-3 text-blue-600" /> Shelter: {typeCounts.shelter}
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              <Stethoscope className="h-3 w-3 text-emerald-600" /> Medical: {typeCounts.medical}
            </span>
            <span className="inline-flex items-center gap-1 bg-red-50 text-red-900 border border-red-200 px-2.5 py-1 rounded-lg font-semibold">
              <AlertTriangle className="h-3 w-3 text-red-600" /> Rescue: {typeCounts.rescue}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Command Bar */}
      <div className="mt-8 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, name, description, ID..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right controls: View Switcher & Clear Filters */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="High-Density Table View"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Reset Filters Shortcut */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Filter Selectors */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700">
            Status Pipeline
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            Assistance Category
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All categories</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {label(t)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            Urgency Tier
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All urgency levels</option>
              {URGENCY_LEVELS.map((u) => (
                <option key={u} value={u}>
                  {label(u)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-slate-700">
            Sort Order
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClass}
            >
              <option value="urgency">Urgency (Highest First)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Longest Waiting (Oldest)</option>
              <option value="people">Most People Affected</option>
            </select>
          </label>
        </div>
      </div>

      {/* Requests Feed Container */}
      <div className="mt-6 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 rounded-2xl bg-white border border-slate-200">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Syncing with incident triage feed...</p>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No requests match current filters</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no distress tickets meeting your selected status, category, or search parameters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {!loading && visible.length > 0 && viewMode === 'table' && (
          <RequestTable requests={visible} />
        )}

        {!loading && visible.length > 0 && viewMode === 'cards' && (
          <div className="space-y-4">
            {visible.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}