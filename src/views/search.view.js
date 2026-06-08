import {
  BUDGET_OPTIONS,
  FLIGHT_CLASSES,
  HOTEL_RATINGS,
  INTERESTS,
  TRIP_PACES,
  WEATHER_PREFERENCES,
} from '../utils/constants.js'
import { debounce } from '../utils/debounce.js'
import { escapeHtml } from '../utils/view.js'
import { validateTripForm } from '../utils/validators.js'
import { tripStore } from '../store/trip.store.js'
import { createGeoService } from '../services/geo.service.js'

function getDefaultForm() {
  return {
    destination: '',
    startDate: '',
    endDate: '',
    adults: 2,
    children: 0,
    budget: 'medium',
    customBudget: '',
    interests: new Set(['food', 'museums']),
    preferences: {
      hotelRating: '4-star',
      flightClass: 'economy',
      weatherPreference: 'any',
      tripPace: 'balanced',
      notes: '',
    },
  }
}

function renderInterestOptions(selectedSet) {
  return INTERESTS.map(
    (interest) => `
      <label class="chip">
        <input type="checkbox" name="interests" value="${interest}" ${selectedSet.has(interest) ? 'checked' : ''} />
        ${interest}
      </label>
    `,
  ).join('')
}

function renderSelectOptions(options, selected) {
  return options
    .map((option) => `<option value="${option}" ${option === selected ? 'selected' : ''}>${option}</option>`)
    .join('')
}

export function renderSearchView(root, { onSubmit }) {
  const existing = tripStore.getState().form
  const formState = existing
    ? { ...existing, interests: new Set(existing.interests) }
    : getDefaultForm()
  const geoService = createGeoService()
  let destinationSearchId = 0
  let destinationSuggestions = []
  let selectedLocation = formState.location ?? null

  root.innerHTML = `
    <section class="page-header">
      <h1>Plan Your Trip</h1>
      <p>Tell us where you want to go and we will build a complete travel plan.</p>
    </section>

    <form id="trip-form" class="card form-grid" novalidate>
      <div id="form-summary" class="form-summary hidden" role="alert"></div>
      <div class="field full">
        <label for="destination">Destination</label>
        <input id="destination" name="destination" type="text" placeholder="Paris, Japan, beach honeymoon..." value="${escapeHtml(formState.destination)}" required />
        <small id="destination-hint" class="hint"></small>
        <div id="destination-results" class="destination-results" aria-live="polite"></div>
        <p class="error" data-error="destination"></p>
      </div>

      <div class="field">
        <label for="startDate">Start Date</label>
        <input id="startDate" name="startDate" type="date" value="${formState.startDate}" required />
        <p class="error" data-error="startDate"></p>
      </div>

      <div class="field">
        <label for="endDate">End Date</label>
        <input id="endDate" name="endDate" type="date" value="${formState.endDate}" required />
        <p class="error" data-error="endDate"></p>
      </div>

      <div class="field">
        <label for="adults">Adults</label>
        <input id="adults" name="adults" type="number" min="1" value="${formState.adults}" />
        <p class="error" data-error="adults"></p>
      </div>

      <div class="field">
        <label for="children">Children</label>
        <input id="children" name="children" type="number" min="0" value="${formState.children}" />
        <p class="error" data-error="children"></p>
      </div>

      <div class="field">
        <label for="budget">Budget</label>
        <select id="budget" name="budget">${renderSelectOptions(BUDGET_OPTIONS, formState.budget)}</select>
      </div>

      <div class="field ${formState.budget === 'custom' ? '' : 'hidden'}" id="custom-budget-field">
        <label for="customBudget">Custom Budget (USD)</label>
        <input id="customBudget" name="customBudget" type="number" min="1" value="${formState.customBudget}" />
        <p class="error" data-error="customBudget"></p>
      </div>

      <div class="field full">
        <label>Interests</label>
        <div class="chip-group">${renderInterestOptions(formState.interests)}</div>
        <p class="error" data-error="interests"></p>
      </div>

      <div class="field">
        <label for="hotelRating">Hotel Rating</label>
        <select id="hotelRating" name="hotelRating">${renderSelectOptions(HOTEL_RATINGS, formState.preferences.hotelRating)}</select>
      </div>

      <div class="field">
        <label for="flightClass">Flight Class</label>
        <select id="flightClass" name="flightClass">${renderSelectOptions(FLIGHT_CLASSES, formState.preferences.flightClass)}</select>
      </div>

      <div class="field">
        <label for="weatherPreference">Weather Preference</label>
        <select id="weatherPreference" name="weatherPreference">${renderSelectOptions(WEATHER_PREFERENCES, formState.preferences.weatherPreference)}</select>
      </div>

      <div class="field">
        <label for="tripPace">Trip Pace</label>
        <select id="tripPace" name="tripPace">${renderSelectOptions(TRIP_PACES, formState.preferences.tripPace)}</select>
      </div>

      <div class="field full">
        <label for="notes">Special Notes</label>
        <textarea id="notes" name="notes" rows="3" placeholder="Dietary needs, accessibility, must-see places...">${escapeHtml(formState.preferences.notes)}</textarea>
      </div>

      <div class="field full actions">
        <button type="submit" class="btn btn-primary">Generate Travel Plan</button>
      </div>
    </form>
  `

  const form = root.querySelector('#trip-form')
  const formSummary = form.querySelector('#form-summary')
  const destinationInput = form.querySelector('#destination')
  const destinationHint = form.querySelector('#destination-hint')
  const destinationResults = form.querySelector('#destination-results')
  const startDateInput = form.querySelector('#startDate')
  const endDateInput = form.querySelector('#endDate')
  const budgetSelect = form.querySelector('#budget')
  const customBudgetField = form.querySelector('#custom-budget-field')
  const submitButton = form.querySelector('button[type="submit"]')

  if (startDateInput.value) {
    endDateInput.min = startDateInput.value
  }

  startDateInput.addEventListener('change', () => {
    endDateInput.min = startDateInput.value
    if (endDateInput.value && endDateInput.value <= startDateInput.value) {
      endDateInput.value = ''
    }
  })

  const searchDestinations = debounce(async (value) => {
    const query = value.trim()
    const requestId = ++destinationSearchId

    if (query.length < 2) {
      destinationSuggestions = []
      selectedLocation = null
      destinationHint.textContent = ''
      destinationResults.innerHTML = ''
      return
    }

    selectedLocation = null

    destinationHint.textContent = `Searching destination records for "${query}"...`

    try {
      const destinations = await geoService.searchDestinations(query)
      if (requestId !== destinationSearchId) return

      destinationSuggestions = destinations
      destinationHint.textContent = destinations.length
        ? 'Select a destination record or keep your typed destination.'
        : 'No destination records found. You can still keep your typed destination.'
      destinationResults.innerHTML = renderDestinationResults(destinations)
    } catch {
      if (requestId !== destinationSearchId) return

      destinationSuggestions = []
      destinationHint.textContent = 'Destination search is unavailable. You can still continue.'
      destinationResults.innerHTML = ''
    }
  }, 300)

  destinationInput.addEventListener('input', (event) => {
    searchDestinations(event.target.value)
  })

  destinationResults.addEventListener('click', (event) => {
    const button = event.target.closest('[data-destination-index]')
    if (!button) return

    const destination = destinationSuggestions[Number(button.dataset.destinationIndex)]
    if (!destination) return

    selectedLocation = destination
    destinationInput.value = destination.city || destination.name
    destinationHint.textContent = 'Destination selected.'
    destinationResults.innerHTML = ''
  })

  budgetSelect.addEventListener('change', () => {
    customBudgetField.classList.toggle('hidden', budgetSelect.value !== 'custom')
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    clearErrors(form)
    hideFormSummary(formSummary)

    const formData = new FormData(form)
    const interests = new Set(formData.getAll('interests'))

    const payload = {
      destination: formData.get('destination')?.trim() ?? '',
      location: selectedLocation,
      startDate: formData.get('startDate') ?? '',
      endDate: formData.get('endDate') ?? '',
      adults: formData.get('adults'),
      children: formData.get('children'),
      budget: formData.get('budget'),
      customBudget: formData.get('customBudget'),
      interests: [...interests],
      preferences: {
        hotelRating: formData.get('hotelRating'),
        flightClass: formData.get('flightClass'),
        weatherPreference: formData.get('weatherPreference'),
        tripPace: formData.get('tripPace'),
        notes: formData.get('notes')?.trim() ?? '',
      },
    }

    const { isValid, errors } = validateTripForm(payload)
    if (!isValid) {
      showErrors(form, errors)
      showFormSummary(formSummary, 'Please fix the highlighted fields before generating your plan.')
      scrollToFirstError(form)
      return
    }

    submitButton.disabled = true
    submitButton.textContent = 'Generating...'

    try {
      tripStore.setForm(payload)
      await onSubmit(payload)
    } catch (error) {
      submitButton.disabled = false
      submitButton.textContent = 'Generate Travel Plan'
      showFormSummary(
        formSummary,
        error.message ?? 'Could not start travel plan generation. Please try again.',
      )
    }
  })
}

function renderDestinationResults(destinations) {
  if (!destinations.length) return ''

  return `
    <ul>
      ${destinations
        .map(
          (destination, index) => `
            <li>
              <button type="button" data-destination-index="${index}">
                <strong>${escapeHtml(destination.city || destination.name)}</strong>
                <span>${escapeHtml(destination.name)}</span>
              </button>
            </li>
          `,
        )
        .join('')}
    </ul>
  `
}

function showFormSummary(summaryNode, message) {
  summaryNode.textContent = message
  summaryNode.classList.remove('hidden')
}

function hideFormSummary(summaryNode) {
  summaryNode.textContent = ''
  summaryNode.classList.add('hidden')
}

function scrollToFirstError(form) {
  const firstError = form.querySelector('.error:not(:empty)')
  firstError?.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function clearErrors(form) {
  form.querySelectorAll('[data-error]').forEach((node) => {
    node.textContent = ''
  })
}

function showErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const node = form.querySelector(`[data-error="${field}"]`)
    if (node) node.textContent = message
  })
}
