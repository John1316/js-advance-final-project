import { getConfiguredClients } from './api.factory.js'
import { retryQueue } from './retry.queue.js'
import { sortHotelsByScore, rankPlaces } from '../utils/ranking.js'

export async function generateTripPlan(form) {
  const clients = getConfiguredClients()

  const location = await clients.geo.geocode(form.destination)

  const [weather, hotels, flights] = await Promise.all([
    clients.weather.getWeather({
      lat: location.lat,
      lon: location.lon,
      city: location.city,
    }),
    clients.hotel.searchHotels({
      destination: form.destination,
      budget: form.budget,
      preferences: form.preferences,
    }),
    clients.flight.searchFlights({
      destination: form.destination,
      dates: { from: form.startDate, to: form.endDate },
      travelers: {
        adults: Number(form.adults),
        children: Number(form.children),
      },
      preferences: form.preferences,
    }),
  ])

  const rankedHotels = sortHotelsByScore(hotels, form.budget)
  const tripPayload = clients.ai.buildTripPayload(form, {
    weather,
    location,
    hotels: rankedHotels,
    flights,
  })

  let plan = await clients.ai.generatePlan(tripPayload)

  if (plan.bestPlaces?.length) {
    plan = {
      ...plan,
      bestPlaces: rankPlaces(plan.bestPlaces, {
        interests: form.interests,
        weather,
      }),
    }
  }

  retryQueue.enqueue(async () => {
    await clients.geo.geocode(form.destination)
  })

  return {
    weather,
    location,
    hotels: rankedHotels,
    flights,
    plan,
  }
}
