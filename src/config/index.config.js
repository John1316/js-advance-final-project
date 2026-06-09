const config = {
  NOMINATIM_BASE: import.meta.env.VITE_NOMINATIM_BASE ?? "",
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY ?? "",
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY ?? "",
  WEATHER_PROVIDER: import.meta.env.VITE_WEATHER_PROVIDER ?? "",
  GEOCODING_PROVIDER: import.meta.env.VITE_GEOCODING_PROVIDER ?? "",
  HOTEL_PROVIDER: import.meta.env.VITE_HOTEL_PROVIDER ?? "",
  FLIGHT_PROVIDER: import.meta.env.VITE_FLIGHT_PROVIDER ?? "",
  AI_PROVIDER: import.meta.env.VITE_AI_PROVIDER ?? "",
  OPENAI_API_URL: import.meta.env.VITE_OPENAI_API_URL ?? "",
};

export default config;
