import config from "../config/index.config.js";
import { fetchWithTimeout } from "../utils/fetch.js";
import { apiCache } from "./cache.service.js";

function normalizeWeather(data, city) {
  return {
    city,
    summary: data.weather?.[0]?.description ?? "Unknown",
    icon: data.weather?.[0]?.icon ?? "",
    tempC: Math.round(data.main?.temp ?? 0),
    tempMinC: Math.round(data.main?.temp_min ?? 0),
    tempMaxC: Math.round(data.main?.temp_max ?? 0),
    humidity: data.main?.humidity ?? 0,
    windKph: Math.round((data.wind?.speed ?? 0) * 3.6),
  };
}

function createMockWeather(city) {
  return {
    city,
    summary: "partly cloudy",
    icon: "02d",
    tempC: 24,
    tempMinC: 19,
    tempMaxC: 27,
    humidity: 58,
    windKph: 12,
  };
}

export function createWeatherService({ provider }) {
  return {
    async getWeather({ lat, lon, city }) {
      const cacheKey = `weather:${lat},${lon}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      if (
        provider === "mock" ||
        !config.OPENWEATHER_API_KEY ||
        config.OPENWEATHER_API_KEY.includes("your_")
      ) {
        const mock = createMockWeather(city);
        apiCache.set(cacheKey, mock);
        return mock;
      }

      const url = `${config.OPENWEATHER_API_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.OPENWEATHER_API_KEY}`;
      let response;
      try {
        response = await fetchWithTimeout(url, undefined, 5000);
      } catch {
        const mock = createMockWeather(city);
        apiCache.set(cacheKey, mock);
        return mock;
      }

      if (!response.ok) {
        const mock = createMockWeather(city);
        apiCache.set(cacheKey, mock);
        return mock;
      }

      try {
        const data = await response.json();
        const result = normalizeWeather(data, city);
        apiCache.set(cacheKey, result);
        return result;
      } catch {
        const mock = createMockWeather(city);
        apiCache.set(cacheKey, mock);
        return mock;
      }
    },
  };
}
