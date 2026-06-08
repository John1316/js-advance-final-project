import { config as exampleConfig } from './config.example.js'

export const config = {
  ...exampleConfig,
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY ?? exampleConfig.OPENWEATHER_API_KEY,
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY ?? exampleConfig.OPENROUTER_API_KEY,
  WEATHER_PROVIDER: import.meta.env.VITE_WEATHER_PROVIDER ?? exampleConfig.WEATHER_PROVIDER,
  GEOCODING_PROVIDER: import.meta.env.VITE_GEOCODING_PROVIDER ?? exampleConfig.GEOCODING_PROVIDER,
  HOTEL_PROVIDER: import.meta.env.VITE_HOTEL_PROVIDER ?? exampleConfig.HOTEL_PROVIDER,
  FLIGHT_PROVIDER: import.meta.env.VITE_FLIGHT_PROVIDER ?? exampleConfig.FLIGHT_PROVIDER,
  AI_PROVIDER: import.meta.env.VITE_AI_PROVIDER ?? exampleConfig.AI_PROVIDER,
}
