import { TRIP_STATUS } from '../utils/constants.js'

class TripStore {
  #listeners = new Set()
  #state = {
    form: null,
    status: TRIP_STATUS.IDLE,
    error: null,
    weather: null,
    location: null,
    hotels: [],
    flights: [],
    plan: null,
    savedTrips: [],
  }

  getState() {
    return structuredClone(this.#state)
  }

  subscribe(listener) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #notify() {
    for (const listener of this.#listeners) {
      listener(this.getState())
    }
  }

  #patch(patch) {
    this.#state = { ...this.#state, ...patch }
    this.#notify()
  }

  setForm(form) {
    this.#patch({ form })
  }

  setLoading() {
    this.#patch({
      status: TRIP_STATUS.LOADING,
      error: null,
      plan: null,
    })
  }

  setResults({ weather, location, hotels, flights, plan }) {
    this.#patch({
      status: TRIP_STATUS.SUCCESS,
      error: null,
      weather,
      location,
      hotels,
      flights,
      plan,
    })
  }

  setError(message) {
    this.#patch({
      status: TRIP_STATUS.ERROR,
      error: message,
    })
  }

  setSavedTrips(savedTrips) {
    this.#patch({ savedTrips })
  }

  resetResults() {
    this.#patch({
      status: TRIP_STATUS.IDLE,
      error: null,
      weather: null,
      location: null,
      hotels: [],
      flights: [],
      plan: null,
    })
  }
}

export const tripStore = new TripStore()
