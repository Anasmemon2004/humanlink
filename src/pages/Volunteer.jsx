import { useEffect, useState, useMemo } from 'react'
import { subscribeToRequests, updateStatus } from '../lib/requests'
import {
  UserCheck,
  Search,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  ExternalLink,
  MessageSquare,
  Utensils,
  Home,
  Stethoscope,
  LifeBuoy,
  X,
  LogOut,
  Shield,
  Loader2,
  Navigation,
  Copy,
  Sparkles,
} from '../components/icons'

const TYPE_ICONS = {
  food: Utensils,
  shelter: Home,
  medical: Stethoscope,
  rescue: AlertTriangle,
}

const URGENCY_STYLES = {
  critical: 'bg-red-600 text-white border-red-700',
  high: 'bg-orange-500 text-white border-orange-600',
  medium: 'bg-amber-400 text-slate-900 border-amber-500',
  low: 'bg-emerald-500 text-white border-emerald-600',
}

function label(value) {
  if (!value) return ''
  const text = value.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatTime(ts) {
  if (!ts) return 'Just now'
  const time = typeof ts.toMillis === 'function' ? ts.toMillis() : new Date(ts).getTime()
  return new Date(time).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Stage rankings for progress stepper
const STAGE_ORDER = ['assigned', 'accepted', 'in_progress', 'resolved']

export default function Volunteer() {
  const [savedName] = useState(() => {
    try {
      return localStorage.getItem('humanlink_responder_name') || ''
    } catch {
      return ''
    }
  })
  const [name, setName] = useState(savedName)
  const [enteredName, setEnteredName] = useState(savedName)
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState({})
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [copiedId, setCopiedId] = useState(null)


  useEffect(() => {
    const unsubscribe = subscribeToRequests((requests) => {
      setTasks(
        requests.filter(
          (request) =>
            request.assignedTo?.trim().toLowerCase() === enteredName.trim().toLowerCase()
        )
      )
    })

    return () => unsubscribe()
  }, [enteredName])

  async function changeStatus(task, status) {
    setBusyId(task.id)
    setMessage('')

    try {
      await updateStatus(task.id, status, notes[task.id])
      setMessage(`Success! Task status updated to "${label(status)}".`)
      setTimeout(() => setMessage(''), 4500)
    } catch (error) {
      console.error(error)
      setMessage('Update failed. Please check your connection and try again.')
    } finally {
      setBusyId(null)
    }
  }

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      assigned: tasks.filter((t) => t.status === 'assigned').length,
      accepted: tasks.filter((t) => t.status === 'accepted').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      resolved: tasks.filter((t) => t.status === 'resolved').length,
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks
    return tasks.filter((t) => t.status === statusFilter)
  }, [tasks, statusFilter])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* INITIAL CHECK-IN SCREEN IF NO NAME ENTERED */}
      {!enteredName ? (
        <div className="mx-auto max-w-xl">
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-lg">
            {/* Top decorative banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 sm:px-8 py-8 text-white text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-inner">
                <UserCheck className="h-8 w-8" />
              </div>
              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Volunteer Responder Portal
              </h1>
              <p className="mt-2 text-sm text-emerald-100 max-w-md mx-auto">
                Check in with your responder name to access assigned mutual aid missions and update
                progress directly from the field.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  if (name.trim()) {
                    const clean = name.trim()
                    setEnteredName(clean)
                    try {
                      localStorage.setItem('humanlink_responder_name', clean)
                    } catch (e) {
                      void e
                    }
                    setMessage('')
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="volunteerName" className="block text-sm font-bold text-slate-800 mb-1.5">
                    Your Full Responder Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      id="volunteerName"
                      type="text"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Sarah Jenkins or David Kim"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Must match the volunteer name specified by your crisis coordinator.
                  </p>
                </div>

                {savedName && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Recent:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setName(savedName)
                        setEnteredName(savedName)
                      }}
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Continue as {savedName}</span>
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>Find My Assigned Tasks</span>
                </button>
              </form>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Volunteer Guidelines
                </p>
                <p>
                  Confirm arrival and departure notes so coordinators maintain full situational
                  awareness across all disaster sectors.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VOLUNTEER MISSION BOARD (ACTIVE SESSION) */
        <div className="space-y-6">
          {/* Responder Profile Banner */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-xl shadow-md shadow-emerald-500/20">
                {enteredName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active Responder
                  </span>
                  <span className="text-xs text-slate-400">· Ready for Duty</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  Missions for {enteredName}
                </h1>
                <p className="text-xs text-slate-500">
                  {tasks.length} total dispatch {tasks.length === 1 ? 'task' : 'tasks'} assigned
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('humanlink_responder_name')
                  } catch (e) {
                    void e
                  }
                  setEnteredName('')
                  setName('')
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Switch Responder</span>
              </button>
            </div>
          </div>

          {/* Status Feedback Toast */}
          {message && (
            <div
              role="status"
              className="rounded-2xl bg-emerald-50 p-4 border border-emerald-300 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{message}</span>
              </div>
              <button
                type="button"
                onClick={() => setMessage('')}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'all', label: 'All Tasks', count: counts.all },
              { id: 'assigned', label: 'New Assigned', count: counts.assigned },
              { id: 'accepted', label: 'Accepted', count: counts.accepted },
              { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
              { id: 'resolved', label: 'Resolved', count: counts.resolved },
            ].map((tab) => {
              const isActive = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200/90 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {tasks.length === 0 ? 'No tasks assigned to this name' : 'No tasks in this category'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {tasks.length === 0
                  ? 'Double-check spelling or contact your incident coordinator to be assigned relief tasks.'
                  : 'You have caught up with all tasks under this filter!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTasks.map((task) => {
                const TypeIcon = TYPE_ICONS[task.type] || LifeBuoy
                const isBusy = busyId === task.id
                const isResolved = task.status === 'resolved'
                const stageIndex = STAGE_ORDER.indexOf(task.status)

                function appendCannedNote(snippet) {
                  setNotes((prev) => {
                    const current = prev[task.id] ?? task.notes ?? ''
                    const updated = current.trim() ? `${current.trim()} — ${snippet}` : snippet
                    return { ...prev, [task.id]: updated }
                  })
                }

                function handleCopyLoc() {
                  if (task.location) {
                    navigator.clipboard.writeText(task.location)
                    setCopiedId(`loc-${task.id}`)
                    setTimeout(() => setCopiedId(null), 2000)
                  }
                }

                return (
                  <article
                    key={task.id}
                    className={`rounded-2xl border bg-white p-6 shadow-xs transition-all ${
                      isResolved
                        ? 'border-emerald-200/80 bg-emerald-50/15'
                        : task.urgency === 'critical'
                        ? 'border-l-6 border-l-red-600 border-slate-200/90'
                        : 'border-slate-200/90'
                    }`}
                  >
                    {/* Top Status & Urgency Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider border ${
                            URGENCY_STYLES[task.urgency] || 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {task.urgency || 'Standard'}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                          <TypeIcon className="h-3.5 w-3.5 text-slate-500" />
                          <span>{label(task.type || 'Request')}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                          <span>Status: {label(task.status)}</span>
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatTime(task.createdAt)}</span>
                      </span>
                    </div>

                    {/* Mission Progress Stepper */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                        {[
                          { label: 'Assigned', idx: 0 },
                          { label: 'Accepted', idx: 1 },
                          { label: 'En Route', idx: 2 },
                          { label: 'Delivered', idx: 3 },
                        ].map((s) => {
                          const isDone = stageIndex > s.idx || isResolved
                          const isCurrent = stageIndex === s.idx && !isResolved
                          return (
                            <div key={s.idx} className="flex flex-col items-center">
                              <div
                                className={`h-2 w-full rounded-full mb-1.5 transition-all ${
                                  isDone
                                    ? 'bg-emerald-500'
                                    : isCurrent
                                    ? 'bg-blue-600 animate-pulse'
                                    : 'bg-slate-200'
                                }`}
                              />
                              <span
                                className={`text-[10px] uppercase tracking-wider font-bold ${
                                  isDone
                                    ? 'text-emerald-700'
                                    : isCurrent
                                    ? 'text-blue-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Task Description */}
                    <p className="mt-4 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {task.description}
                    </p>

                    {/* Metadata chips: Location & Contact */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Location link + GPS Navigation */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {task.location || 'Location not specified'}
                              </span>
                            </div>
                          </div>
                          {task.location && (
                            <button
                              type="button"
                              onClick={handleCopyLoc}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                              title="Copy address"
                            >
                              {copiedId === `loc-${task.id}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {task.location && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                            >
                              <Navigation className="h-3 w-3" />
                              <span>GPS Turn-by-Turn</span>
                            </a>
                            <span className="text-slate-300">·</span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Map View</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Requester Contact */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {task.contactName || 'Requester'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {task.contactPhone || 'No phone provided'}
                            </span>
                          </div>
                        </div>
                        {task.contactPhone && (
                          <a
                            href={`tel:${task.contactPhone}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call Requester</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Field Notes Input with Quick Canned Chips */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`notes-${task.id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          <span>Responder Notes & Delivery Log</span>
                        </label>
                      </div>

                      <textarea
                        id={`notes-${task.id}`}
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        value={notes[task.id] ?? task.notes ?? ''}
                        onChange={(event) =>
                          setNotes((previous) => ({
                            ...previous,
                            [task.id]: event.target.value,
                          }))
                        }
                        placeholder="Add situational notes (e.g. En route with rations, arrived at location, handed over safely)..."
                        rows={2}
                      />

                      {/* Quick Canned Status Chips */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-medium mr-1">Quick note:</span>
                        {[
                          'En route to location',
                          'Arrived on scene',
                          'Contacted family',
                          'Supplies safely delivered',
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => appendCannedNote(chip)}
                            className="rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 font-medium transition-colors cursor-pointer border border-slate-200"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Flow Pipeline Buttons */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Current Mission Stage: <span className="font-bold text-slate-800">{label(task.status)}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {task.status === 'assigned' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeStatus(task, 'accepted')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            <span>Accept Mission</span>
                          </button>
                        )}

                        {task.status === 'accepted' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeStatus(task, 'in_progress')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                            <span>Start Mission (En Route)</span>
                          </button>
                        )}

                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeStatus(task, 'resolved')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            <span>Mark Delivered & Resolved</span>
                          </button>
                        )}

                        {task.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Aid Successfully Delivered</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

