import { describe, expect, it } from 'vitest'
import { buildPrompt, buildTripPayload } from './ai.service.js'

describe('ai.service prompt builder', () => {
  const form = {
    destination: 'Tokyo',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    adults: 2,
    children: 0,
    budget: 'medium',
    interests: ['food', 'history'],
    preferences: { tripPace: 'balanced' },
  }

  const apiResults = {
    weather: { city: 'Tokyo', summary: 'clear', tempC: 28 },
    location: { city: 'Tokyo', lat: 35.6, lon: 139.6 },
    hotels: [{ name: 'Tokyo Hotel', pricePerNight: 120 }],
    flights: [{ price: 500 }],
  }

  it('builds a structured trip payload', () => {
    const payload = buildTripPayload(form, apiResults)

    expect(payload.destination).toBe('Tokyo')
    expect(payload.travelers.adults).toBe(2)
    expect(payload.weather.city).toBe('Tokyo')
    expect(payload.hotels).toHaveLength(1)
  })

  it('builds a prompt with required JSON keys', () => {
    const payload = buildTripPayload(form, apiResults)
    const prompt = buildPrompt(payload)

    expect(prompt).toContain('summary')
    expect(prompt).toContain('dailyPlan')
    expect(prompt).toContain('bestPlaces')
    expect(prompt).toContain('Tokyo')
  })
})
