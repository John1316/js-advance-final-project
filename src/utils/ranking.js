const BUDGET_WEIGHTS = {
  low: 0.7,
  medium: 1,
  luxury: 1.3,
  custom: 1,
}

const INTEREST_KEYWORDS = {
  food: ['market', 'food', 'restaurant', 'cafe'],
  shopping: ['market', 'mall', 'shopping', 'boutique'],
  museums: ['museum', 'gallery', 'exhibit'],
  adventure: ['adventure', 'hike', 'tour', 'outdoor'],
  nature: ['park', 'garden', 'waterfront', 'nature'],
  beach: ['beach', 'coast', 'waterfront'],
  history: ['old town', 'history', 'heritage', 'museum'],
  nightlife: ['night', 'bar', 'district'],
  'family-friendly': ['family', 'interactive', 'park'],
}

export function sortHotelsByScore(hotels, budget = 'medium') {
  const weight = BUDGET_WEIGHTS[budget] ?? 1

  return [...hotels].sort((a, b) => {
    const scoreA = a.rating - Math.abs(a.pricePerNight - 120 * weight) / 100
    const scoreB = b.rating - Math.abs(b.pricePerNight - 120 * weight) / 100
    return scoreB - scoreA
  })
}

export function filterActivitiesByPreferences(activities, interests = []) {
  const interestSet = new Set(interests)
  const keywords = [...interestSet].flatMap((interest) => INTEREST_KEYWORDS[interest] ?? [])

  if (!keywords.length) return activities

  return activities.filter((activity) =>
    keywords.some((keyword) => activity.toLowerCase().includes(keyword)),
  )
}

export function rankPlaces(places, { interests = [], weather = null } = {}) {
  const interestSet = new Set(interests)

  return [...places]
    .map((place) => {
      let score = 1
      if (interestSet.has(place.type)) score += 2
      if (weather?.tempC > 25 && ['beach', 'nature', 'relaxation'].includes(place.type)) score += 1
      if (weather?.summary?.includes('rain') && ['museum', 'shopping', 'food'].includes(place.type)) score += 1
      return { ...place, score }
    })
    .sort((a, b) => b.score - a.score)
}
