import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  Check,
  LifeBuoy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Home,
  Printer,
  Share2,
} from '../components/icons'

export default function Confirmation() {
  const { id } = useParams()
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  function handleCopy() {
    if (id) {
      navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HumanLink Emergency Request Reference',
          text: `HumanLink Aid Request ID: ${id}`,
          url,
        })
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    }
  }

  const timelineSteps = [
    {
      title: 'Request Logged',
      desc: 'Transmitted securely to the triage queue.',
      status: 'complete',
    },
    {
      title: 'Coordinator Review',
      desc: 'Checking urgency and local responder availability.',
      status: 'active',
    },
    {
      title: 'Volunteer Match',
      desc: 'Equipped responder assigned to your location.',
      status: 'pending',
    },
    {
      title: 'On-Site Aid Delivered',
      desc: 'Aid handed off and status marked resolved.',
      status: 'pending',
    },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-16">
      {/* Confirmation Card */}
      <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-md">
        {/* Top celebratory header strip */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 sm:px-8 py-8 text-white text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-inner">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">
            Help Request Submitted
          </h1>
          <p className="mt-2 text-sm text-emerald-100 max-w-md mx-auto">
            Your request has been logged into our real-time triage queue. A coordinator will review
            your details shortly.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Reference ID Card */}
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Request Reference ID
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                In Triage Queue
              </span>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all select-all">
                {id || 'Request ID unavailable'}
              </p>
              {id && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs transition-all shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs transition-all shrink-0 cursor-pointer"
                    title="Share request reference"
                  >
                    {shared ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs transition-all shrink-0 cursor-pointer"
                    title="Print receipt / physical copy"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Save or screenshot this ID to track your request with coordinators or responders.
            </p>
          </div>


          {/* Operational Timeline */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              What happens next?
            </h2>
            <div className="space-y-3">
              {timelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-xl p-3 bg-slate-50/70 border border-slate-100"
                >
                  <div className="mt-0.5 shrink-0">
                    {step.status === 'complete' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3.5 w-3.5 font-bold" />
                      </div>
                    )}
                    {step.status === 'active' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        <Clock className="h-3.5 w-3.5 animate-spin" />
                      </div>
                    )}
                    {step.status === 'pending' && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-500' : 'text-slate-900'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations checklist */}
          <div className="rounded-2xl bg-blue-50/60 p-5 border border-blue-200/80 space-y-2 text-xs text-blue-950">
            <p className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Helpful Guidance While Waiting
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Keep your phone on and reachable in case the coordinator or responder calls.</li>
              <li>Stay in a safe, sheltered position if hazardous weather or conditions persist.</li>
              <li>Conserve battery power on your mobile device by lowering screen brightness.</li>
            </ul>
          </div>

          {/* Immediate Danger Warning */}
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              If your situation worsens or someone enters critical medical distress, do not wait—contact official emergency services immediately by dialing <a href="tel:911" className="font-bold underline">911</a> or <a href="tel:112" className="font-bold underline">112</a>.
            </p>
          </div>

          {/* Navigation CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-blue-800 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>

            <Link
              to="/request"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <LifeBuoy className="h-4 w-4 text-slate-600" />
              <span>Submit Another Request</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
