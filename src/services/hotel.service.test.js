import { describe, expect, it } from 'vitest'
import { createHotelService } from './hotel.service.js'

describe('hotel mock adapter', () => {
  it('returns normalized hotel suggestions', async () => {
    const service = createHotelService()
    const hotels = await service.searchHotels({
      destination: 'Rome',
      budget: 'medium',
      preferences: { hotelRating: '4-star' },
    })

    expect(hotels.length).toBeGreaterThan(0)
    expect(hotels[0]).toMatchObject({
      name: expect.stringContaining('Rome'),
      pricePerNight: expect.any(Number),
      rating: expect.any(Number),
    })
  })
})
