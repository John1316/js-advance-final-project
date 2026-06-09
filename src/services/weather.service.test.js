import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWeatherService } from './weather.service.js'

describe('weather service fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns mock weather when the weather API returns 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )

    const service = createWeatherService({ provider: 'openweather' })
    const weather = await service.getWeather({
      lat: 48.8566,
      lon: 2.3522,
      city: 'Paris',
    })

    expect(weather).toMatchObject({
      city: 'Paris',
      summary: 'partly cloudy',
      tempC: 24,
    })
  })
})
