const STORAGE_KEY = 'travel-planner:saved-trips'

export function loadSavedTrips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTrip(trip) {
  const trips = loadSavedTrips()
  const nextTrip = {
    ...trip,
    id: trip.id ?? crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  }

  const filtered = trips.filter((item) => item.id !== nextTrip.id)
  const updated = [nextTrip, ...filtered]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function deleteTrip(id) {
  const updated = loadSavedTrips().filter((trip) => trip.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
