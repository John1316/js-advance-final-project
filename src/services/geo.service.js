import { apiCache } from "./cache.service.js";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const NOMINATIM_HEADERS = { Accept: "application/json" };

function normalizeLocation(item, fallbackDestination = "") {
  return {
    name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
    country: item.address?.country ?? "",
    city:
      item.address?.city ??
      item.address?.town ??
      item.address?.village ??
      item.address?.state ??
      fallbackDestination,
  };
}

function createFallbackLocation(destination) {
  let hash = 0;
  for (const char of destination.toLowerCase()) {
    hash = (hash + char.charCodeAt(0) * 17) % 360;
  }

  return {
    name: destination,
    lat: Number((20 + (hash % 40)).toFixed(4)),
    lon: Number((-20 + (hash % 80)).toFixed(4)),
    country: "",
    city: destination,
    isFallback: true,
  };
}

async function fetchNominatim(url) {
  const response = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!response.ok) {
    throw new Error("Geocoding request failed.");
  }
  return response.json();
}

export function createGeoService() {
  return {
    async searchDestinations(query) {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) return [];

      const cacheKey = `geo-search:${trimmedQuery.toLowerCase()}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&q=${encodeURIComponent(trimmedQuery)}&limit=5`;
      const data = await fetchNominatim(url);
      const results = data.map((item) => normalizeLocation(item, trimmedQuery));

      apiCache.set(cacheKey, results);
      return results;
    },

    async geocode(destination) {
      const cacheKey = `geo:${destination.toLowerCase()}`;
      const cached = apiCache.get(cacheKey);
      if (cached) return cached;

      try {
        const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&q=${encodeURIComponent(destination)}&limit=1`;
        const data = await fetchNominatim(url);
        if (!data.length) {
          const fallback = createFallbackLocation(destination);
          apiCache.set(cacheKey, fallback);
          return fallback;
        }

        const result = normalizeLocation(data[0], destination);
        apiCache.set(cacheKey, result);
        return result;
      } catch {
        const fallback = createFallbackLocation(destination);
        apiCache.set(cacheKey, fallback);
        return fallback;
      }
    },
  };
}
