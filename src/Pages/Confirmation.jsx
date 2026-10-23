
import { Link, useParams } from 'react-router-dom'

export default function Confirmation() {
  const { id } = useParams()

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Request Submitted Successfully
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for reaching out. Your help request has been submitted
          and is waiting for the coordination team to review it.
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-600">Your Request ID</p>
          <p className="mt-1 break-all text-lg font-bold text-gray-900">
            {id || 'Request ID unavailable'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Keep this ID so you can refer to your request later.
          </p>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-gray-900">
          What happens next?
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-600">
          <li>A coordinator will review your request.</li>
          <li>The team may contact you using the details you provided.</li>
          <li>Please keep your phone available when possible.</li>
        </ul>

        <p className="mt-5 text-sm text-amber-800">
          If you are in immediate danger, contact your local emergency
          services instead of waiting for a response here.
        </p>

        <Link
          to="/"
          className="mt-7 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Return to Home
        </Link>
      </div>
    </main>
  )
}
