import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LifeBuoy,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Heart,
  Clock,
  MapPin,
  Utensils,
  Home as HomeIcon,
  Stethoscope,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from '../components/icons'


export default function Home() {
  const [openFaq, setOpenFaq] = useState(0)

  const roleCards = [
    {
      to: '/request',
      badge: 'Immediate Aid',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      title: 'I Need Help',
      subtitle: 'For individuals, families, and communities facing crisis or displacement.',
      accent: 'border-t-4 border-t-red-600',
      features: [
        { icon: Utensils, text: 'Food rations & clean drinking water' },
        { icon: HomeIcon, text: 'Safe emergency shelter & warm clothing' },
        { icon: Stethoscope, text: 'First aid, prescriptions & hygiene' },
        { icon: AlertTriangle, text: 'Urgent rescue & evacuation assistance' },
      ],
      ctaText: 'Request Urgent Help',
      ctaClass:
        'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:from-red-500 hover:to-rose-500',
      icon: LifeBuoy,
      iconColor: 'text-red-600 bg-red-50',
    },
    {
      to: '/volunteer',
      badge: 'Field Responders',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'I am a Volunteer',
      subtitle: 'For verified community members ready to assist those in need.',
      accent: 'border-t-4 border-t-emerald-600',
      features: [
        { icon: CheckCircle2, text: 'View tasks assigned to your name' },
        { icon: MapPin, text: 'Direct location coordinates & contact info' },
        { icon: Clock, text: 'Update mission status from accepted to resolved' },
        { icon: Heart, text: 'Direct grassroots humanitarian impact' },
      ],
      ctaText: 'Open Volunteer Portal',
      ctaClass:
        'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10',
      icon: UserCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      to: '/coordinator',
      badge: 'Command & Triage',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'I am a Coordinator',
      subtitle: 'For crisis operations leads managing triage queues and dispatch.',
      accent: 'border-t-4 border-t-blue-700',
      features: [
        { icon: ShieldAlert, text: 'Real-time live incoming request queue' },
        { icon: AlertTriangle, text: 'Multi-factor urgency prioritisation' },
        { icon: Users, text: 'Dispatch & assign field volunteers instantly' },
        { icon: CheckCircle2, text: 'Operational oversight & resolution tracking' },
      ],
      ctaText: 'Access Command Console',
      ctaClass:
        'bg-blue-700 text-white hover:bg-blue-800 shadow-md shadow-blue-700/20',
      icon: ShieldAlert,
      iconColor: 'text-blue-700 bg-blue-50',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Submit Assistance Request',
      description:
        'Specify your immediate need—food, shelter, medical supplies, or rescue—with your location and contact number. No complex accounts required.',
      icon: LifeBuoy,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      step: '02',
      title: 'Intelligent Coordinator Triage',
      description:
        'Incident coordinators review incoming requests in real time, prioritize by urgency level, and pair you with the nearest equipped volunteer.',
      icon: ShieldAlert,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      step: '03',
      title: 'Direct Responder Dispatch',
      description:
        'Assigned volunteers receive your details, make contact, and deliver on-the-ground support, updating the status until safety is restored.',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ]

  const metrics = [
    { value: '24 / 7', label: 'Continuous Triage', detail: 'Round-the-clock monitoring' },
    { value: '< 15m', label: 'Initial Review Goal', detail: 'Critical requests triaged first' },
    { value: '100%', label: 'Free Mutual Aid', detail: 'Zero fees or commercial barriers' },
    { value: 'Direct', label: 'Ground Coordination', detail: 'Local volunteer networks' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 lg:p-16 text-white shadow-xl border border-slate-800">
        {/* Subtle decorative glowing background shapes */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
            When seconds count, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-rose-300">
              relief is within reach.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            HumanLink bridges the vital gap between vulnerable individuals in crisis and local
            responder networks. Submit emergency needs in seconds and receive coordinated mutual
            aid directly from verified coordinators and volunteers.
          </p>
        </div>
      </section>

      {/* Live Operational Metrics Strip */}
      <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
          >
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {m.value}
            </p>
            <p className="text-sm font-bold text-slate-700 mt-1">{m.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.detail}</p>
          </div>
        ))}
      </section>

      {/* Role Selection Pathways (The 3 Core Portals) */}
      <section className="mt-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Dedicated Portals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Choose your role in the response
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Whether you require immediate assistance or are stepping up to coordinate or deliver aid, select your pathway below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roleCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.to}
                className={`flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all border border-slate-200/80 ${card.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.subtitle}</p>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Key Services & Actions
                    </p>
                    <ul className="space-y-2.5">
                      {card.features.map((feature, fIdx) => {
                        const FeatureIcon = feature.icon
                        return (
                          <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <FeatureIcon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <span>{feature.text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    to={card.to}
                    className={`flex items-center justify-center gap-2 w-full rounded-xl py-3 px-4 text-sm font-bold transition-all ${card.ctaClass}`}
                  >
                    <span>{card.ctaText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works - 3-Step Journey */}
      <section className="mt-16 rounded-3xl bg-slate-900 p-8 sm:p-12 text-white border border-slate-800">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
            Operational Blueprint
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3">
            How HumanLink orchestrates emergency aid
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            A synchronized triage loop engineered to turn urgent requests into on-the-ground support with zero red tape.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((step) => {
            const StepIcon = step.icon
            return (
              <div
                key={step.step}
                className="relative rounded-2xl bg-slate-800/80 p-6 border border-slate-700/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-600 font-mono">
                      {step.step}
                    </span>
                    <div className={`p-2.5 rounded-xl border ${step.color}`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Frequently Asked Questions (Crisis & Mutual Aid Guidance) */}
      <section className="mt-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Crisis Response & Community FAQ
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Essential information regarding response times, privacy safeguards, and mutual aid protocols.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {[
            {
              question: 'How quickly will a volunteer responder reach my location?',
              answer:
                'Incident coordinators monitor the triage board 24/7. High and Critical urgency requests are reviewed immediately and matched with active responders equipped with vehicles and disaster supplies in your sector. Response timing depends on local road accessibility and weather hazards.',
            },
            {
              question: 'Is HumanLink completely free of charge?',
              answer:
                'Yes. HumanLink is a 100% free, community-driven humanitarian platform. There are no fees, subscriptions, or financial solicitations. Mutual aid is provided out of solidarity and community care.',
            },
            {
              question: 'Can I submit an emergency aid request on behalf of a neighbor or family member?',
              answer:
                'Yes. Simply fill in their location coordinates or street address in the form. You can provide your contact number or theirs, and note in the special instructions that you are acting as their representative.',
            },
            {
              question: 'How is my personal information protected during a crisis?',
              answer:
                'Your contact number and location are only exposed to the coordinator triaging your case and the assigned volunteer who physically fulfills the mission. Data is never commercialized, indexed publicly, or retained beyond operational need.',
            },
            {
              question: 'What should I do if my emergency escalates into active danger?',
              answer:
                'If someone suffers acute medical trauma, floodwaters breach shelter, or fire breaks out, do not wait for community volunteers—immediately dial official emergency lines (911 or 112). You may also submit a second ticket marked Critical.',
            },
          ].map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Emergency Hotlines & Protocols Banner */}
      <section className="mt-14 rounded-2xl bg-amber-50 border border-amber-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-amber-500/20 p-3 text-amber-800 border border-amber-400/30 shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950">
                Life-Threatening Emergency Protocol
              </h3>
              <p className="mt-1 text-sm text-amber-900/80 max-w-2xl leading-relaxed">
                HumanLink coordinates mutual community assistance and disaster supply distribution.
                If you are trapped in rising floodwaters, experiencing severe trauma, or in active danger,
                please prioritize official emergency dispatches.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call 911 / 112</span>
            </a>
            <a
              href="tel:988"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <span>Crisis Line 988</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}