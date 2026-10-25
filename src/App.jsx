import { useState } from 'react'
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import RequestHelp from './pages/RequestHelp'
import Confirmation from './pages/Confirmation'
import Coordinator from './pages/Coordinator'
import Volunteer from './pages/Volunteer'
import AccessGate from './components/AccessGate'
import {
  HeartHandshake,
  LifeBuoy,
  ShieldAlert,
  UserCheck,
  Menu,
  X,
  PhoneCall,
  Activity,
  ChevronRight,
  ShieldCheck,
} from './components/icons'

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Overview', icon: HeartHandshake },
    { to: '/volunteer', label: 'Volunteer Portal', icon: UserCheck },
    { to: '/coordinator', label: 'Coordinator Command', icon: ShieldAlert },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Brand */}
            <Link
              to="/"
              className="group flex items-center gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1 -ml-1 transition-transform"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                    Human<span className="text-blue-600">Link</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 leading-none">
                  Rapid Mutual Relief Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${isActive
                        ? 'bg-blue-50/80 text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            {/* Primary Action Button */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/request"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition-all hover:from-red-500 hover:to-rose-500 hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <LifeBuoy className="h-4 w-4 transition-transform group-hover:rotate-45" />
                <span>Request Help</span>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/request"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                <span>Need Help</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-6 md:hidden shadow-lg animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <HeartHandshake className="h-5 w-5 text-blue-600" />
                <span>Overview & Home</span>
              </NavLink>

              <NavLink
                to="/request"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-semibold ${isActive ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <LifeBuoy className="h-5 w-5 text-red-600" />
                <span>Request Immediate Help</span>
              </NavLink>

              <NavLink
                to="/volunteer"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <span>Volunteer Responder Portal</span>
              </NavLink>

              <NavLink
                to="/coordinator"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldAlert className="h-5 w-5 text-indigo-600" />
                <span>Coordinator Command Center</span>
              </NavLink>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                In immediate danger, contact your local emergency services first.
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestHelp />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route
            path="/coordinator"
            element={
              <AccessGate role="Coordinator" pin={import.meta.env.VITE_COORDINATOR_PIN}>
                <Coordinator />
              </AccessGate>
            }
          />
          <Route
            path="/volunteer"
            element={
              <AccessGate role="Volunteer" pin={import.meta.env.VITE_VOLUNTEER_PIN}>
                <Volunteer />
              </AccessGate>
            }
          />
        </Routes>
      </main>

      {/* Global Modern Footer */}
      <footer className="mt-20 border-t border-slate-200/80 bg-white text-slate-600 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Identity & Mission */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  <HeartHandshake className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Human<span className="text-blue-600">Link</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                A rapid-dispatch humanitarian coordination platform designed to bridge the critical gap between vulnerable individuals and local mutual relief responders.
              </p>
            </div>

            {/* Col 2: Navigation Pathways */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Portals & Actions
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/request" className="hover:text-red-600 transition-colors flex items-center gap-1 font-medium text-red-600">
                    <ChevronRight className="h-3 w-3" /> Submit Aid Request
                  </Link>
                </li>
                <li>
                  <Link to="/volunteer" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-slate-400" /> Volunteer Responder Board
                  </Link>
                </li>
                <li>
                  <Link to="/coordinator" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-slate-400" /> Incident Coordinator Console
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-slate-400" /> Platform Mission Overview
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Critical Hotlines */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Emergency
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                If someone is in immediate danger, contact your local emergency services first.
                HumanLink is a prototype and does not replace them.
              </p>
            </div>

            {/* Col 4: Trust & Transparency */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Trust & Operations
              </p>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Prototype notice</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  HumanLink is a hackathon prototype. Please use fake data only and do not submit real personal information.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom disclaimer bar */}
          <div className="mt-10 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} HumanLink Humanitarian Project. Open mutual relief initiative.
            </p>
            <p className="text-[11px] max-w-xl text-center sm:text-right text-slate-400">
              Disclaimer: In a life-threatening catastrophe or immediate medical emergency, always call local government emergency dispatch immediately. HumanLink complements official relief efforts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}