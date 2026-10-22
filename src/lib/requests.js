import { collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const col = collection(db, 'requests')

export async function createRequest(data) {
  const ref = await addDoc(col, {
    ...data,
    status: 'new',
    assignedTo: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export function subscribeToRequests(callback) {
  const q = query(col, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export function assignRequest(id, volunteerName) {
  return updateDoc(doc(db, 'requests', id), {
    assignedTo: volunteerName,
    status: 'assigned',
    updatedAt: serverTimestamp(),
  })
}

export function updateStatus(id, status, notes) {
  const changes = { status, updatedAt: serverTimestamp() }
  if (notes) changes.notes = notes
  return updateDoc(doc(db, 'requests', id), changes)
}