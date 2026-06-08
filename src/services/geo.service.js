import { apiCache } from './cache.service.js'

export function createGeoService() {
  return {
    async geocode(destination) {
      const cacheKey = `geo:${destination.toLowerCase()}`
      const cached = apiCache.get(cacheKey)
      if (cached) return cached

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Geocoding request failed.')
      }

      const data = await response.json()
      if (!data.length) {
        throw new Error(`Could not find location for "${destination}".`)
      }

      const result = {
        name: data[0].display_name,
        lat: Number(data[0].lat),
        lon: Number(data[0].lon),
        country: data[0].address?.country ?? '',
        city: data[0].address?.city ?? data[0].address?.town ?? destination,
      }

      apiCache.set(cacheKey, result)
      return result
    },
  }
}
