import { useParams } from 'react-router-dom'

export default function Confirmation() {
  const { id } = useParams()
  return <h1 className="text-2xl font-bold">Request submitted: {id} (Fatima)</h1>
}