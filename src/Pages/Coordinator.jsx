import { useEffect, useMemo, useState } from 'react'
import { subscribeToRequests, assignRequest } from '../lib/requests'
import { REQUEST_TYPES, URGENCY_LEVELS, STATUSES } from '../lib/constants'

// Higher number = more urgent (used for sorting)
const URGENCY_RANK = { critical: 4, high: 3, medium: 2, low: 1 }

// Colour for each urgency badge
const URGENCY_STYLES = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-gray-900',
  low: 'bg-green-500 text-white',
}

// Colour for each status badge
const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  accepted: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
}

// Turns "in_progress" into "In progress"
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
  return new Date(toMillis(ts)).toLocaleString()
}

function SummaryCard({ title, count, color }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${color}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  )
}

function RequestCard({ request }) {
  const [open, setOpen] = useState(false)
  const [volunteer, setVolunteer] = useState(request.assignedTo || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const canAssign = request.status === 'new' || request.status === 'assigned'

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
    } catch (err) {
      console.error(err)
      setMessage('Could not assign. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            URGENCY_STYLES[request.urgency] || 'bg-gray-300'
          }`}
        >
          {request.urgency}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {label(request.type)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[request.status] || 'bg-gray-100'
          }`}
        >
          {label(request.status)}
        </span>
      </div>

      <p className="mt-3 font-medium text-gray-900">{request.description}</p>
      <p className="mt-1 text-sm text-gray-600">📍 {request.location}</p>
      <p className="mt-1 text-xs text-gray-500">
        Submitted {formatTime(request.createdAt)}
        {request.assignedTo ? ` · Volunteer: ${request.assignedTo}` : ''}
      </p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
      >
        {open ? 'Hide details' : 'Show details'}
      </button>

      {open && (
        <dl className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Request ID</dt>
            <dd className="break-all font-mono text-xs">{request.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">People affected</dt>
            <dd>{request.peopleAffected ?? request.peopleCount ?? 'Not given'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Contact name</dt>
            <dd>{request.contactName || 'Not given'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Contact phone</dt>
            <dd>{request.contactPhone || 'Not given'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Last updated</dt>
            <dd>{formatTime(request.updatedAt)}</dd>
          </div>
          {request.notes && (
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Notes</dt>
              <dd>{request.notes}</dd>
            </div>
          )}
        </dl>
      )}

      {canAssign && (
        <form onSubmit={handleAssign} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={volunteer}
            onChange={(e) => setVolunteer(e.target.value)}
            placeholder="Volunteer name"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? 'Assigning...' : request.status === 'assigned' ? 'Reassign' : 'Assign'}
          </button>
        </form>
      )}

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  )
}

export default function Coordinator() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  // Live list: runs once, keeps updating whenever Firestore changes
  useEffect(() => {
    const unsubscribe = subscribeToRequests((data) => {
      setRequests(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const counts = useMemo(() => {
    const c = { new: 0, assigned: 0, in_progress: 0, resolved: 0 }
    requests.forEach((r) => {
      if (r.status === 'new') c.new++
      else if (r.status === 'assigned' || r.status === 'accepted') c.assigned++
      else if (r.status === 'in_progress') c.in_progress++
      else if (r.status === 'resolved') c.resolved++
    })
    return c
  }, [requests])

  // Filter, then sort: most urgent first, and within the same urgency, oldest first
  const visible = useMemo(() => {
    return requests
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => typeFilter === 'all' || r.type === typeFilter)
      .filter((r) => urgencyFilter === 'all' || r.urgency === urgencyFilter)
      .sort((a, b) => {
        const diff = (URGENCY_RANK[b.urgency] || 0) - (URGENCY_RANK[a.urgency] || 0)
        if (diff !== 0) return diff
        return toMillis(a.createdAt) - toMillis(b.createdAt)
      })
  }, [requests, statusFilter, typeFilter, urgencyFilter])

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        Review incoming requests, prioritise them and assign volunteers.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard title="New" count={counts.new} color="bg-blue-50 text-blue-900" />
        <SummaryCard title="Assigned" count={counts.assigned} color="bg-purple-50 text-purple-900" />
        <SummaryCard title="In progress" count={counts.in_progress} color="bg-amber-50 text-amber-900" />
        <SummaryCard title="Resolved" count={counts.resolved} color="bg-green-50 text-green-900" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-gray-700">
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
            <option value="all">All types</option>
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>{label(t)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Urgency
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className={selectClass}>
            <option value="all">All urgency levels</option>
            {URGENCY_LEVELS.map((u) => (
              <option key={u} value={u}>{label(u)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-gray-600">Loading requests...</p>}
        {!loading && visible.length === 0 && (
          <p className="rounded-lg bg-gray-50 p-4 text-gray-600">No requests match these filters.</p>
        )}
        {visible.map((r) => (
          <RequestCard key={r.id} request={r} />
        ))}
      </div>
    </div>
  )
}