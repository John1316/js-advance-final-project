export function createHotelService() {
  return {
    async searchHotels({ destination, budget, preferences }) {
      const ratingBoost = preferences?.hotelRating === '5-star' ? 1.2 : 1
      const budgetFactor = budget === 'luxury' ? 1.4 : budget === 'low' ? 0.7 : 1

      const hotels = [
        {
          id: 'h1',
          name: `${destination} Riverside Hotel`,
          rating: 4.6,
          pricePerNight: Math.round(120 * budgetFactor),
          stars: 4,
          amenities: ['wifi', 'breakfast', 'pool'],
        },
        {
          id: 'h2',
          name: `${destination} City Suites`,
          rating: 4.3,
          pricePerNight: Math.round(95 * budgetFactor),
          stars: 4,
          amenities: ['wifi', 'gym'],
        },
        {
          id: 'h3',
          name: `${destination} Boutique Stay`,
          rating: 4.8,
          pricePerNight: Math.round(180 * budgetFactor * ratingBoost),
          stars: 5,
          amenities: ['wifi', 'spa', 'restaurant'],
        },
        {
          id: 'h4',
          name: `${destination} Budget Inn`,
          rating: 3.9,
          pricePerNight: Math.round(65 * budgetFactor),
          stars: 3,
          amenities: ['wifi'],
        },
      ]

      return hotels
    },
  }
}
