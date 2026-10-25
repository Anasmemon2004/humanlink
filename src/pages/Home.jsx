import { Link } from 'react-router-dom'

const cards = [
  { to: '/request', title: 'I need help', text: 'Request food, shelter, medical assistance or rescue.', style: 'bg-red-600' },
  { to: '/volunteer', title: 'I am a volunteer', text: 'See the tasks assigned to you and update progress.', style: 'bg-emerald-600' },
  { to: '/coordinator', title: 'I am a coordinator', text: 'Review, prioritise and assign incoming requests.', style: 'bg-blue-700' },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-3xl bg-gradient-to-br from-blue-800 to-blue-500 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold sm:text-4xl">HumanLink</h1>
        <p className="mt-3 max-w-xl text-blue-50">
          Connecting people in need with coordinators and volunteers, so help reaches
          the right place faster.
        </p>
        <Link
          to="/request"
          className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-blue-800"
        >
          Request help
        </Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl bg-white p-5 shadow transition hover:shadow-md">
            <span className={`mb-3 block h-1.5 w-12 rounded-full ${c.style}`} />
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{c.text}</p>
          </Link>
        ))}
      </section>

      <p className="mt-8 text-center text-xs text-slate-500">
        Prototype for demonstration. In an emergency, contact your local emergency services.
      </p>
    </div>
  )
}