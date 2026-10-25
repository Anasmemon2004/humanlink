import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import RequestHelp from './pages/RequestHelp'
import Confirmation from './pages/Confirmation'
import Coordinator from './pages/Coordinator'
import Volunteer from './pages/Volunteer'
import AccessGate from './components/AccessGate'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <Link to="/" className="text-lg font-bold text-blue-800">HumanLink</Link>
        <Link to="/request" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
          Request help
        </Link>
      </nav>
      <main className="p-4 sm:p-6">
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
    </div>
  )
}