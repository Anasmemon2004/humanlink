import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createRequest } from '../lib/requests'
import { REQUEST_TYPES, URGENCY_LEVELS } from '../lib/constants'
import {
  LifeBuoy,
  Utensils,
  Home,
  Stethoscope,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  PhoneCall,
  Loader2,
  Plus,
  Minus,
  LocateFixed,
  Check,
  Sparkles,
  CheckCircle2,
} from '../components/icons'


// Metadata mapping for category icons and descriptions
const TYPE_META = {
  food: {
    icon: Utensils,
    label: 'Food & Clean Water',
    description: 'Emergency food rations, drinking water, infant formula, or baby supplies.',
    color: 'hover:border-amber-400 peer-checked:border-amber-600 peer-checked:bg-amber-50/50',
    iconBg: 'bg-amber-100 text-amber-700',
  },
  shelter: {
    icon: Home,
    label: 'Shelter & Evacuation',
    description: 'Emergency lodging, blankets, dry clothing, or evacuation from unsafe zones.',
    color: 'hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-50/50',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  medical: {
    icon: Stethoscope,
    label: 'Medical & Prescriptions',
    description: 'First aid assistance, life-sustaining prescription refills, medical equipment.',
    color: 'hover:border-emerald-400 peer-checked:border-emerald-600 peer-checked:bg-emerald-50/50',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
  rescue: {
    icon: AlertTriangle,
    label: 'Search & Rescue',
    description: 'Stranded or trapped individuals requiring immediate physical extraction.',
    color: 'hover:border-red-400 peer-checked:border-red-600 peer-checked:bg-red-50/50',
    iconBg: 'bg-red-100 text-red-700',
  },
}

// Metadata mapping for urgency tiers
const URGENCY_META = {
  low: {
    label: 'Low Urgency',
    badge: 'Standard Assistance',
    time: 'Response goal: 24–48 hours',
    border: 'peer-checked:border-emerald-600 peer-checked:bg-emerald-50/40',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium Urgency',
    badge: 'Expedited Review',
    time: 'Response goal: 12–24 hours',
    border: 'peer-checked:border-amber-500 peer-checked:bg-amber-50/40',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High Urgency',
    badge: 'Critical Need',
    time: 'Response goal: 2–6 hours',
    border: 'peer-checked:border-orange-600 peer-checked:bg-orange-50/40',
    dot: 'bg-orange-500',
  },
  critical: {
    label: 'Critical Urgency',
    badge: 'Immediate Danger',
    time: 'Immediate Dispatch Priority',
    border: 'peer-checked:border-red-600 peer-checked:bg-red-50/50',
    dot: 'bg-red-600 animate-ping',
  },
}

function FieldErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-in fade-in">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default function RequestHelp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: '',
    urgency: '',
    description: '',
    peopleCount: '1',
    location: '',
    contactName: '',
    contactPhone: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [detectingLoc, setDetectingLoc] = useState(false)
  const [locMessage, setLocMessage] = useState('')

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setLocMessage('Geolocation is not supported by your browser.')
      return
    }
    setDetectingLoc(true)
    setLocMessage('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const coordString = `GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
        setForm((prev) => ({
          ...prev,
          location: prev.location ? `${prev.location} [${coordString}]` : coordString,
        }))
        setErrors((prev) => ({ ...prev, location: '' }))
        setLocMessage('GPS location attached successfully.')
        setDetectingLoc(false)
        setTimeout(() => setLocMessage(''), 4000)
      },
      (error) => {
        console.error(error)
        setLocMessage('Could not retrieve GPS. Please type your address or nearest landmark.')
        setDetectingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  function handleChange(event) {

    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  function handleTypeSelect(typeKey) {
    setForm((previous) => ({ ...previous, type: typeKey }))
    setErrors((previous) => ({ ...previous, type: '' }))
  }

  function handleUrgencySelect(urgencyKey) {
    setForm((previous) => ({ ...previous, urgency: urgencyKey }))
    setErrors((previous) => ({ ...previous, urgency: '' }))
  }

  function adjustPeopleCount(delta) {
    const current = Number(form.peopleCount) || 1
    const nextVal = Math.max(1, current + delta)
    setForm((prev) => ({ ...prev, peopleCount: String(nextVal) }))
    setErrors((prev) => ({ ...prev, peopleCount: '' }))
  }

  function validate() {
    const nextErrors = {}

    if (!form.type) nextErrors.type = 'Please select the type of help needed.'
    if (!form.urgency) nextErrors.urgency = 'Please select an urgency level.'
    if (form.description.trim().length < 10) {
      nextErrors.description = 'Please describe your need in at least 10 characters.'
    }
    if (!form.peopleCount || Number(form.peopleCount) < 1) {
      nextErrors.peopleCount = 'Enter at least 1 person affected.'
    }
    if (!form.location.trim()) nextErrors.location = 'Please enter your specific location or meeting point.'
    if (!form.contactName.trim()) nextErrors.contactName = 'Please enter your name.'
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.contactPhone.trim())) {
      nextErrors.contactPhone = 'Enter a valid phone number (e.g. 555-123-4567).'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!validate()) {
      // Scroll to the first error
      const firstError = document.querySelector('[aria-invalid="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setSubmitting(true)
    try {
      const id = await createRequest({
        type: form.type,
        urgency: form.urgency,
        description: form.description.trim(),
        peopleAffected: Number(form.peopleCount),
        location: form.location.trim(),
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        notes: form.notes.trim(),
      })
      navigate(`/confirmation/${id}`)
    } catch (error) {
      console.error('Could not submit help request:', error)
      setSubmitError('Your request could not be submitted. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Main Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-red-700 border border-red-200 mb-3">
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>Emergency Assistance Request</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Tell us what help you need
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-2xl">
          Complete this rapid intake form. Incident coordinators review incoming submissions in
          real time to dispatch nearby volunteers.
        </p>
      </div>

      {/* Immediate Danger Callout Banner */}
      <div className="mt-6 rounded-2xl bg-amber-50 p-5 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-xl bg-amber-500/20 p-2 text-amber-800 shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-950">
              Is anyone in immediate physical danger?
            </p>
            <p className="mt-0.5 text-xs text-amber-900/80">
              For active medical emergencies, fires, or violent situations, contact local 911 / 112 immediately.
            </p>
          </div>
        </div>
        <a
          href="tel:911"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 shrink-0 transition-colors"
        >
          <PhoneCall className="h-3.5 w-3.5" /> Call 911 / 112
        </a>
      </div>

      {/* 3-Step Interactive Process Stepper */}
      <div className="mt-8 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            {
              step: '1',
              title: 'Need & Urgency',
              desc: 'Category & severity',
              isDone: Boolean(form.type && form.urgency && form.description.trim().length >= 10),
            },
            {
              step: '2',
              title: 'Location & People',
              desc: 'Headcount & GPS',
              isDone: Boolean(form.location.trim() && Number(form.peopleCount) >= 1),
            },
            {
              step: '3',
              title: 'Contact Details',
              desc: 'Name & direct line',
              isDone: Boolean(form.contactName.trim() && form.contactPhone.trim()),
            },
          ].map((st, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all shrink-0 ${
                  st.isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {st.isDone ? <Check className="h-4 w-4" /> : st.step}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{st.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-none">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
        {/* SECTION 1: Category & Urgency */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              Step 1 of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Nature of Need & Urgency</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the primary type of aid required and how urgently it is needed.
            </p>
          </div>

          {/* Type of Help (Interactive Cards + Accessible Hidden Select fallback) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="type" className="text-sm font-bold text-slate-800">
                Type of Help <span className="text-red-500">*</span>
              </label>
              {form.type && (
                <span className="text-xs font-semibold text-blue-600">
                  Selected: {form.type.toUpperCase()}
                </span>
              )}
            </div>

            {/* Hidden native select for standard accessibility / testing */}
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="sr-only"
              aria-invalid={errors.type ? 'true' : 'false'}
            >
              <option value="">Select help type</option>
              {REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REQUEST_TYPES.map((typeKey) => {
                const meta = TYPE_META[typeKey] || {
                  icon: LifeBuoy,
                  label: typeKey,
                  description: 'Emergency assistance',
                  iconBg: 'bg-slate-100 text-slate-700',
                }
                const Icon = meta.icon
                const isSelected = form.type === typeKey
                return (
                  <button
                    type="button"
                    key={typeKey}
                    onClick={() => handleTypeSelect(typeKey)}
                    className={`flex items-start gap-3.5 rounded-xl p-4 text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${meta.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {meta.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                        {meta.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            <FieldErrorMessage message={errors.type} />
          </div>

          {/* Urgency Level Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="urgency" className="text-sm font-bold text-slate-800">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              {form.urgency && (
                <span className="text-xs font-semibold text-slate-600">
                  Tier: {form.urgency.toUpperCase()}
                </span>
              )}
            </div>

            {/* Hidden native select for standard accessibility */}
            <select
              id="urgency"
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
              className="sr-only"
              aria-invalid={errors.urgency ? 'true' : 'false'}
            >
              <option value="">Select urgency</option>
              {URGENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {URGENCY_LEVELS.map((level) => {
                const meta = URGENCY_META[level] || {
                  label: level,
                  badge: 'Standard',
                  time: 'As soon as possible',
                  dot: 'bg-slate-400',
                }
                const isSelected = form.urgency === level
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => handleUrgencySelect(level)}
                    className={`flex flex-col justify-between rounded-xl p-3.5 text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? level === 'critical'
                          ? 'border-red-600 bg-red-50/60 shadow-xs ring-2 ring-red-500/20'
                          : 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {level}
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600">
                        {meta.badge}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{meta.time}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            <FieldErrorMessage message={errors.urgency} />
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="description" className="text-sm font-bold text-slate-800">
                Describe What Has Happened & What is Needed <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${form.description.length >= 10 ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {form.description.length} chars (min 10)
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="e.g., We are a family of 4 with a 6-month-old infant cut off from clean water. The road is flooded with knee-deep water. We urgently need drinking water, dry rations, and diaper supplies."
              className={`w-full rounded-xl border bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all ${
                errors.description ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 hover:border-slate-400'
              }`}
              aria-invalid={errors.description ? 'true' : 'false'}
            />
            <FieldErrorMessage message={errors.description} />
          </div>
        </div>

        {/* SECTION 2: People Count & Location */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              Step 2 of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Location & People Affected</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate headcount and location details allow responders to pack appropriate supplies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Number of People */}
            <div className="sm:col-span-1">
              <label htmlFor="peopleCount" className="block text-sm font-bold text-slate-800 mb-1.5">
                Number of People <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => adjustPeopleCount(-1)}
                  className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-l-xl transition-colors cursor-pointer"
                  aria-label="Decrease people count"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="peopleCount"
                  name="peopleCount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.peopleCount}
                  onChange={handleChange}
                  className="w-full text-center font-bold text-slate-900 focus:outline-hidden text-base py-2.5"
                  aria-invalid={errors.peopleCount ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => adjustPeopleCount(1)}
                  className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-r-xl transition-colors cursor-pointer"
                  aria-label="Increase people count"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Headcount Presets */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {[1, 2, 4, 6, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, peopleCount: String(num) }))
                      setErrors((prev) => ({ ...prev, peopleCount: '' }))
                    }}
                    className={`rounded-lg px-2 py-0.5 text-xs font-semibold border transition-all cursor-pointer ${
                      Number(form.peopleCount) === num
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num === 1 ? '1' : `${num}p`}
                  </button>
                ))}
              </div>
              <FieldErrorMessage message={errors.peopleCount} />
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="location" className="block text-sm font-bold text-slate-800">
                  Current Location or Safe Meeting Point <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLoc}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                  title="Detect GPS coordinates using your device"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  <span>{detectingLoc ? 'Detecting GPS...' : 'Auto-Detect Location'}</span>
                </button>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. 742 Evergreen Terrace, Apt 3B, or 'North Community Center parking lot'"
                  className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all ${
                    errors.location ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-invalid={errors.location ? 'true' : 'false'}
                />
              </div>

              {locMessage && (
                <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{locMessage}</span>
                </p>
              )}

              <p className="text-[11px] text-slate-500 mt-1">
                Include landmarks, cross streets, apartment or floor numbers if applicable.
              </p>
              <FieldErrorMessage message={errors.location} />
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact Details & Notes */}
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
              Step 3 of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Contact Details & Special Instructions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              We will only contact you to verify request details and notify you of responder arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block text-sm font-bold text-slate-800 mb-1.5">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all ${
                    errors.contactName ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-invalid={errors.contactName ? 'true' : 'false'}
                />
              </div>
              <FieldErrorMessage message={errors.contactName} />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-bold text-slate-800 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-234-5678"
                  className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all ${
                    errors.contactPhone ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  aria-invalid={errors.contactPhone ? 'true' : 'false'}
                />
              </div>
              <FieldErrorMessage message={errors.contactPhone} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-bold text-slate-800 mb-1.5">
              Additional Notes & Specific Constraints (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Any mobility limitations, dietary restrictions, severe allergies, companion pets, or specific entry codes."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Dynamic Live Intake Review Card */}
        {(form.type || form.urgency || form.location || form.contactName) && (
          <div className="rounded-2xl bg-blue-50/50 p-5 border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Live Request Dossier Preview</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Aid Category</span>
                <span className="font-bold text-slate-900">{form.type ? (TYPE_META[form.type]?.label || form.type) : 'Pending selection'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Urgency Tier</span>
                <span className="font-bold text-slate-900">{form.urgency ? form.urgency.toUpperCase() : 'Pending'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Headcount</span>
                <span className="font-bold text-slate-900">{form.peopleCount || '1'} {Number(form.peopleCount) === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct Contact</span>
                <span className="font-bold text-slate-900 truncate block">{form.contactPhone || form.contactName || 'Pending'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submission Error Banner */}
        {submitError && (
          <div role="alert" className="rounded-2xl bg-red-50 p-4 border border-red-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-bold">Submission Failed</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Submit Actions & Privacy Reassurance */}
        <div className="pt-2 space-y-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-500 hover:to-rose-500 hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Transmitting Help Request to Dispatchers...</span>
              </>
            ) : (
              <>
                <LifeBuoy className="h-5 w-5" />
                <span>Submit Emergency Help Request</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Strict humanitarian confidentiality. Data is accessible solely to verified coordinators.</span>
          </div>
        </div>
      </form>
    </div>
  )
}

