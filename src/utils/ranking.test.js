import { describe, expect, it } from 'vitest'
import {
  filterActivitiesByPreferences,
  rankPlaces,
  sortHotelsByScore,
} from './ranking.js'

describe('ranking utilities', () => {
  it('sorts hotels by score and budget fit', () => {
    const hotels = [
      { name: 'A', rating: 4.2, pricePerNight: 300 },
      { name: 'B', rating: 4.5, pricePerNight: 110 },
      { name: 'C', rating: 4.8, pricePerNight: 130 },
    ]

    const sorted = sortHotelsByScore(hotels, 'medium')
    expect(sorted[0].name).toBe('C')
  })

  it('filters activities by interests', () => {
    const activities = ['Visit a local museum', 'Beach walk', 'Night market food tour']
    const filtered = filterActivitiesByPreferences(activities, ['food'])

    expect(filtered).toContain('Night market food tour')
    expect(filtered.length).toBeGreaterThan(0)
  })

  it('ranks places using interests and weather', () => {
    const places = [
      { name: 'Museum', type: 'history', reason: 'Culture' },
      { name: 'Beach', type: 'beach', reason: 'Sun' },
    ]

    const ranked = rankPlaces(places, {
      interests: ['history'],
      weather: { tempC: 30, summary: 'sunny' },
    })

    expect(ranked[0].name).toBe('Museum')
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score)
  })
})
