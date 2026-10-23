import { Routes, Route, Link } from 'react-router-dom'
import RequestHelp from './pages/RequestHelp'
import Confirmation from './pages/Confirmation'
import Coordinator from './pages/Coordinator'
import Volunteer from './pages/Volunteer'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex gap-4 bg-blue-600 p-4 text-white font-medium">
        <Link to="/">Request Help</Link>
        <Link to="/coordinator">Coordinator</Link>
        <Link to="/volunteer">Volunteer</Link>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<RequestHelp />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route path="/coordinator" element={<Coordinator />} />
          <Route path="/volunteer" element={<Volunteer />} />
        </Routes>
      </main>
    </div>
  )
}