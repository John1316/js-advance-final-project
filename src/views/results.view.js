import { TRIP_STATUS } from '../utils/constants.js'
import { escapeHtml } from '../utils/view.js'
import { filterActivitiesByPreferences } from '../utils/ranking.js'
import { tripStore } from '../store/trip.store.js'
import { deleteTrip, saveTrip } from '../services/storage.service.js'
import { generateTripPlan } from '../services/trip.planner.js'

let mapInstance = null

export function renderResultsView(root) {
  root._resultsCleanup?.()

  const unsubscribe = tripStore.subscribe(() => renderResultsView(root))
  root._resultsCleanup = () => unsubscribe()

  const state = tripStore.getState()

  if (state.status === TRIP_STATUS.IDLE) {
    root.innerHTML = state.form
      ? `
        <section class="card empty-state">
          <h2>Ready to generate</h2>
          <p>Your trip details are saved. Generate the plan to see results.</p>
          <button id="generate-trip" class="btn btn-primary" type="button">Generate Travel Plan</button>
        </section>
      `
      : `
        <section class="card empty-state">
          <h2>No trip generated yet</h2>
          <p>Fill out the search form first, then come back here for your itinerary.</p>
          <a href="/search" class="btn btn-primary" data-link>Go to Search</a>
        </section>
      `

    root.querySelector('#generate-trip')?.addEventListener('click', async () => {
      tripStore.setLoading()
      try {
        const result = await generateTripPlan(state.form)
        tripStore.setResults(result)
      } catch (error) {
        tripStore.setError(error.message ?? 'Failed to generate travel plan.')
      }
    })
    return
  }

  if (state.status === TRIP_STATUS.LOADING) {
    root.innerHTML = `
      <section class="card loading-state">
        <div class="spinner" aria-hidden="true"></div>
        <h2>Building your travel plan...</h2>
        <p>Fetching weather, map data, hotels, flights, and AI recommendations.</p>
      </section>
    `
    return
  }

  if (state.status === TRIP_STATUS.ERROR) {
    root.innerHTML = `
      <section class="card error-state">
        <h2>Something went wrong</h2>
        <p>${escapeHtml(state.error)}</p>
        <a href="/search" class="btn btn-secondary" data-link>Back to Search</a>
      </section>
    `
    return
  }

  const { form, weather, location, hotels, flights, plan, savedTrips } = state

  root.innerHTML = `
    <section class="page-header results-header">
      <div>
        <h1>${escapeHtml(form.destination)}</h1>
        <p>${escapeHtml(form.startDate)} to ${escapeHtml(form.endDate)} - ${form.adults + form.children} travelers</p>
      </div>
      <div class="header-actions">
        <button id="save-trip" class="btn btn-primary" type="button">Save Trip</button>
        <a href="/search" class="btn btn-secondary" data-link>Edit Search</a>
      </div>
    </section>

    <section class="results-grid">
      <article class="card">
        <h2>Trip Summary</h2>
        <p>${escapeHtml(plan.summary)}</p>
      </article>

      <article class="card">
        <h2>Weather</h2>
        <p><strong>${escapeHtml(weather.city)}</strong> - ${escapeHtml(weather.summary)}</p>
        <p>${weather.tempC} C (${weather.tempMinC} - ${weather.tempMaxC} C) - Humidity ${weather.humidity}% - Wind ${weather.windKph} km/h</p>
      </article>

      <article class="card map-card">
        <h2>Location</h2>
        <p>${escapeHtml(location.name)}</p>
        <div id="map" class="map-container" data-lat="${location.lat}" data-lon="${location.lon}"></div>
      </article>

      <article class="card">
        <h2>Top Hotels</h2>
        <ul class="item-list">${renderHotels(hotels)}</ul>
      </article>

      <article class="card">
        <h2>Flight Options</h2>
        <ul class="item-list">${renderFlights(flights)}</ul>
      </article>

      <article class="card budget-card">
        <h2>Budget Estimation</h2>
        <p class="budget-total">${plan.budget.currency} ${plan.budget.total.toLocaleString()}</p>
        <ul class="item-list">${renderBudget(plan.budget.breakdown)}</ul>
      </article>
    </section>

    <section class="card lazy-section" data-lazy="daily-plan">
      <h2>Day-by-Day Plan</h2>
      <div class="lazy-placeholder">Loading itinerary...</div>
    </section>

    <section class="card lazy-section" data-lazy="extras">
      <h2>Packing, Warnings & Best Places</h2>
      <div class="lazy-placeholder">Loading recommendations...</div>
    </section>

    <section class="card saved-section">
      <h2>Saved Trips (${savedTrips.length})</h2>
      ${savedTrips.length ? `<ul class="item-list">${renderSavedTrips(savedTrips)}</ul>` : '<p>No saved trips yet.</p>'}
    </section>
  `

  root.querySelector('#save-trip').addEventListener('click', () => {
    const updated = saveTrip({
      form,
      weather,
      location,
      hotels,
      flights,
      plan,
    })
    tripStore.setSavedTrips(updated)
  })

  root.querySelectorAll('[data-delete-trip]').forEach((button) => {
    button.addEventListener('click', () => {
      const updated = deleteTrip(button.dataset.deleteTrip)
      tripStore.setSavedTrips(updated)
    })
  })

  initMap(root)
  lazyRenderSections(root, form, plan)
}

function renderHotels(hotels) {
  return hotels
    .slice(0, 3)
    .map(
      (hotel) => `
        <li>
          <strong>${escapeHtml(hotel.name)}</strong>
          <span>${hotel.stars} star - $${hotel.pricePerNight}/night - score ${hotel.rating}</span>
        </li>
      `,
    )
    .join('')
}

function renderFlights(flights) {
  return flights
    .slice(0, 3)
    .map(
      (flight) => `
        <li>
          <strong>${escapeHtml(flight.airline)}</strong>
          <span>${escapeHtml(flight.from)} to ${escapeHtml(flight.to)} - ${escapeHtml(flight.duration)} - $${flight.price}</span>
        </li>
      `,
    )
    .join('')
}

function renderBudget(breakdown) {
  return breakdown
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.label)}</strong>
          <span>$${item.amount.toLocaleString()}</span>
        </li>
      `,
    )
    .join('')
}

function renderDailyPlan(plan, interests) {
  return plan.dailyPlan
    .map((day) => {
      const activities = filterActivitiesByPreferences(day.activities, interests)
      return `
        <article class="day-card">
          <h3>Day ${day.day} - ${escapeHtml(day.title)}</h3>
          <ul>${activities.map((activity) => `<li>${escapeHtml(activity)}</li>`).join('')}</ul>
        </article>
      `
    })
    .join('')
}

function renderExtras(plan) {
  return `
    <div class="extras-grid">
      <div>
        <h3>Packing List</h3>
        <ul>${plan.packingList.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div>
        <h3>Warnings</h3>
        <ul>${plan.warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div>
        <h3>Recommended Places</h3>
        <ul>${plan.bestPlaces
          .map(
            (place) => `
              <li>
                <strong>${escapeHtml(place.name)}</strong>
                <span>${escapeHtml(place.type)} - ${escapeHtml(place.reason)}</span>
              </li>
            `,
          )
          .join('')}</ul>
      </div>
    </div>
  `
}

function renderSavedTrips(savedTrips) {
  return savedTrips
    .map(
      (trip) => `
        <li>
          <strong>${escapeHtml(trip.form.destination)}</strong>
          <span>${escapeHtml(trip.form.startDate)} to ${escapeHtml(trip.form.endDate)}</span>
          <button class="btn btn-danger btn-small" type="button" data-delete-trip="${trip.id}">Delete</button>
        </li>
      `,
    )
    .join('')
}

function lazyRenderSections(root, form, plan) {
  const dailySection = root.querySelector('[data-lazy="daily-plan"]')
  const extrasSection = root.querySelector('[data-lazy="extras"]')

  requestAnimationFrame(() => {
    dailySection.innerHTML = `
      <h2>Day-by-Day Plan</h2>
      <div class="day-grid">${renderDailyPlan(plan, form.interests)}</div>
    `
  })

  setTimeout(() => {
    extrasSection.innerHTML = `
      <h2>Packing, Warnings & Best Places</h2>
      ${renderExtras(plan)}
    `
  }, 120)
}

async function initMap(root) {
  const mapNode = root.querySelector('#map')
  if (!mapNode) return

  const lat = Number(mapNode.dataset.lat)
  const lon = Number(mapNode.dataset.lon)

  try {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }

    const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
    mapInstance = L.map(mapNode).setView([lat, lon], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance)
    L.marker([lat, lon]).addTo(mapInstance)
  } catch {
    mapNode.innerHTML = '<p class="hint">Map preview is unavailable, but your location data was saved.</p>'
  }
}
