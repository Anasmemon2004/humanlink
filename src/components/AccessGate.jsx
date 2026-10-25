import { useState } from 'react'

export default function AccessGate({ role, pin, children }) {
  const key = `humanlink-access-${role}`
  const [ok, setOk] = useState(sessionStorage.getItem(key) === 'yes')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  if (ok) return children

  function submit(e) {
    e.preventDefault()
    if (pin && value.trim() === pin) {
      sessionStorage.setItem(key, 'yes')
      setOk(true)
    } else {
      setError('Incorrect access code.')
    }
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-1 text-xl font-bold">{role} access</h1>
      <p className="mb-4 text-sm text-slate-600">
        This area is for authorised {role.toLowerCase()}s. Enter your access code.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Access code"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white">
          Enter
        </button>
      </form>
    </div>
  )
}