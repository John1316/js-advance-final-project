import { config } from '../config.js'
import { createGeoService } from './geo.service.js'
import { createWeatherService } from './weather.service.js'
import { createHotelService } from './hotel.service.js'
import { createFlightService } from './flight.service.js'
import { createAiService } from './ai.service.js'

const registry = {
  geo: {
    nominatim: createGeoService,
  },
  weather: {
    openweather: createWeatherService,
    mock: createWeatherService,
  },
  hotel: {
    mock: createHotelService,
  },
  flight: {
    mock: createFlightService,
  },
  ai: {
    openrouter: createAiService,
    mock: createAiService,
  },
}

export function createApiClient(type, provider = 'mock') {
  const factory = registry[type]?.[provider]
  if (!factory) {
    throw new Error(`Unknown provider "${provider}" for type "${type}"`)
  }
  return factory({ provider })
}

export function getConfiguredClients() {
  return {
    geo: createApiClient('geo', config.GEOCODING_PROVIDER),
    weather: createApiClient('weather', config.WEATHER_PROVIDER),
    hotel: createApiClient('hotel', config.HOTEL_PROVIDER),
    flight: createApiClient('flight', config.FLIGHT_PROVIDER),
    ai: createApiClient('ai', config.AI_PROVIDER),
  }
}
