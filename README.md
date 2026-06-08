# Travel Planner

A 2-step travel planning SPA built with Vanilla JavaScript and Vite for the Advanced JavaScript Final Project.

## Live Demo

Add your deployed URL here after publishing (Vercel, Netlify, etc.).

## Screenshots

| Search Page | Results Page |
|---|---|
| Add screenshot | Add screenshot |

## Features

- **Step 1 - Search**: Collect destination, dates, travelers, budget, interests, and preferences with validation
- **Step 2 - Results**: Loading state, weather, map, hotels, flights, AI-generated itinerary, and saved trips
- **SPA Routing**: `/search` and `/results` using History API
- **State Management**: Observer/PubSub pattern via `trip.store.js`
- **Offline Storage**: Save generated trips in LocalStorage

## Getting Started

```bash
yarn install
cp .env.example .env
yarn dev
```

Open `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `.env` and fill in keys as needed:

| Variable | Description |
|---|---|
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key (optional, falls back to mock) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI (optional, falls back to mock) |
| `VITE_WEATHER_PROVIDER` | `openweather` or `mock` |
| `VITE_GEOCODING_PROVIDER` | `nominatim` (OpenStreetMap, free) |
| `VITE_HOTEL_PROVIDER` | `mock` |
| `VITE_FLIGHT_PROVIDER` | `mock` |
| `VITE_AI_PROVIDER` | `openrouter` or `mock` |

Do not commit real API keys.

## Scripts

- `yarn dev` - Development server
- `yarn build` - Production build
- `yarn preview` - Preview production build
- `yarn test` - Run unit tests

## Architecture

```
src/
  router/router.js          # SPA routing (History API)
  store/trip.store.js       # Observer/PubSub state
  views/
    search.view.js          # Step 1 form
    results.view.js         # Step 2 results
  services/
    api.factory.js          # Factory pattern for API clients
    ai.service.js           # Prompt builder + AI/mock strategy
    geo.service.js          # Nominatim geocoding
    weather.service.js      # OpenWeather + mock fallback
    hotel.service.js        # Mock hotel adapter
    flight.service.js       # Mock flight adapter
    cache.service.js        # Map-based response cache
    retry.queue.js          # Queue for retry tasks
    storage.service.js      # LocalStorage persistence
    trip.planner.js         # Orchestrates parallel API calls
  utils/
    validators.js
    ranking.js
    debounce.js
```

## APIs: Real vs Mocked

| Service | Provider | Status |
|---|---|---|
| Geocoding | Nominatim (OpenStreetMap) | Real (free, no key) |
| Weather | OpenWeatherMap | Real with key, mock fallback |
| Hotels | Mock adapter | Mocked |
| Flights | Mock adapter | Mocked |
| AI Plan | OpenRouter | Real with key, mock fallback |
| Map tiles | Leaflet + OpenStreetMap | Real (free) |

## Design Patterns & Data Structures

| Pattern / Structure | Usage |
|---|---|
| **Observer / PubSub** | `TripStore` notifies views on state changes |
| **Factory Pattern** | `api.factory.js` creates service clients by provider |
| **Strategy Pattern** | Switch between real APIs and mock adapters |
| **Map** | `apiCache` stores normalized API responses |
| **Set** | Unique interests in search form |
| **Queue** | `retryQueue` for deferred retry tasks |
| **Promise.all** | Parallel weather, hotel, and flight fetching |
| **Debounce** | Destination input hint updates |
| **Lazy render** | Heavy result sections rendered after first paint |

## AI Payload

The app sends this structure to the AI service:

```js
const tripPayload = {
  destination,
  dates: { from, to },
  travelers: { adults, children },
  budget,
  interests,
  preferences,
  weather,
  location,
  hotels,
  flights,
}
```

Expected AI response keys: `summary`, `dailyPlan`, `budget`, `packingList`, `warnings`, `bestPlaces`.

## Testing

```bash
yarn test
```

Tests cover validators, prompt builder, ranking utilities, and hotel mock adapter.

## Commit History

This project is built incrementally with separate commits:

1. Scaffold Vite vanilla JS app
2. Router + PubSub store foundation
3. Search form with validation
4. API services and strategy adapters
5. Results page with loading and sections
6. Ranking utilities and LocalStorage
7. Tests, README, and env examples
