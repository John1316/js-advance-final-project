import './style.css'
import { Router } from './router/router.js'
import { ROUTES } from './utils/constants.js'
import { tripStore } from './store/trip.store.js'
import { renderSearchView } from './views/search.view.js'
import { renderResultsView } from './views/results.view.js'
import { generateTripPlan } from './services/trip.planner.js'
import { loadSavedTrips } from './services/storage.service.js'

const viewRoot = document.getElementById('view-root')

tripStore.setSavedTrips(loadSavedTrips())

const router = new Router(viewRoot)

router
  .register(ROUTES.SEARCH, (root) => {
    root._resultsCleanup?.()
    renderSearchView(root, {
      onSubmit: () => {
        router.navigate(ROUTES.RESULTS)
        runGeneration()
      },
    })
  })
  .register(ROUTES.RESULTS, (root) => {
    renderResultsView(root)
  })
  .onNotFound((root) => {
    root.innerHTML = `
      <section class="card empty-state">
        <h2>Page not found</h2>
        <a href="/search" class="btn btn-primary" data-link>Back to Search</a>
      </section>
    `
  })
  .start()

async function runGeneration() {
  const { form } = tripStore.getState()
  if (!form) return

  tripStore.setLoading()

  try {
    const result = await generateTripPlan(form)
    tripStore.setResults(result)
  } catch (error) {
    tripStore.setError(error.message ?? 'Failed to generate travel plan.')
  }
}
