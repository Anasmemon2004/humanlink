
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRequest } from '../lib/requests'
import { REQUEST_TYPES, URGENCY_LEVELS } from '../lib/constants'

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

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}

    if (!form.type) nextErrors.type = 'Please select the type of help.'
    if (!form.urgency) nextErrors.urgency = 'Please select urgency.'
    if (form.description.trim().length < 10) {
      nextErrors.description = 'Please describe your need in at least 10 characters.'
    }
    if (!form.peopleCount || Number(form.peopleCount) < 1) {
      nextErrors.peopleCount = 'Enter at least 1 person.'
    }
    if (!form.location.trim()) nextErrors.location = 'Please enter your location.'
    if (!form.contactName.trim()) nextErrors.contactName = 'Please enter your name.'
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.contactPhone.trim())) {
      nextErrors.contactPhone = 'Enter a valid phone number.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setSubmitting(true)
    try {
      const id = await createRequest({
        type: form.type,
        urgency: form.urgency,
        description: form.description.trim(),
        peopleCount: Number(form.peopleCount),
        location: form.location.trim(),
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        notes: form.notes.trim(),
      })
      navigate(`/confirmation/${id}`, { state: form })
    } catch (error) {
      console.error('Could not submit help request:', error)
      setSubmitError('Your request could not be submitted. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900'

  function ErrorMessage({ name }) {
    return errors[name] ? (
      <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
    ) : null
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Request Help</h1>
      <p className="mt-2 text-gray-600">
        Tell us what you need so our coordinators can review your request.
      </p>

      <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        If you are in immediate danger, contact your local emergency services.
        Do not wait for this form to be reviewed.
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="type" className="font-medium">Type of help *</label>
          <select id="type" name="type" value={form.type} onChange={handleChange} className={fieldClass}>
            <option value="">Select help type</option>
            {REQUEST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <ErrorMessage name="type" />
        </div>

        <div>
          <label htmlFor="urgency" className="font-medium">Urgency *</label>
          <select id="urgency" name="urgency" value={form.urgency} onChange={handleChange} className={fieldClass}>
            <option value="">Select urgency</option>
            {URGENCY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
          <ErrorMessage name="urgency" />
        </div>

        <div>
          <label htmlFor="description" className="font-medium">Describe the help you need *</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} className={fieldClass} placeholder="Explain what has happened and what help is needed." />
          <ErrorMessage name="description" />
        </div>

        <div>
          <label htmlFor="peopleCount" className="font-medium">Number of people *</label>
          <input id="peopleCount" name="peopleCount" type="number" min="1" step="1" value={form.peopleCount} onChange={handleChange} className={fieldClass} />
          <ErrorMessage name="peopleCount" />
        </div>

        <div>
          <label htmlFor="location" className="font-medium">Location *</label>
          <input id="location" name="location" value={form.location} onChange={handleChange} className={fieldClass} placeholder="Area, city, or a safe meeting point" />
          <ErrorMessage name="location" />
        </div>

        <div>
          <label htmlFor="contactName" className="font-medium">Contact name *</label>
          <input id="contactName" name="contactName" value={form.contactName} onChange={handleChange} className={fieldClass} />
          <ErrorMessage name="contactName" />
        </div>

        <div>
          <label htmlFor="contactPhone" className="font-medium">Contact phone *</label>
          <input id="contactPhone" name="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} className={fieldClass} placeholder="Your reachable phone number" />
          <ErrorMessage name="contactPhone" />
        </div>

        <div>
          <label htmlFor="notes" className="font-medium">Additional notes (optional)</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3} className={fieldClass} placeholder="Any other useful details" />
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={submitting} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Submitting...' : 'Submit Help Request'}
        </button>
      </form>
    </main>
  )
}
