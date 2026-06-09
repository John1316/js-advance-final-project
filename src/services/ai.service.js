import { config } from "../config.js";
import { fetchWithTimeout } from "../utils/fetch.js";

export function buildTripPayload(form, apiResults) {
  return {
    destination: form.destination,
    dates: { from: form.startDate, to: form.endDate },
    travelers: {
      adults: Number(form.adults),
      children: Number(form.children),
    },
    budget:
      form.budget === "custom" ? `custom:${form.customBudget}` : form.budget,
    interests: form.interests,
    preferences: form.preferences,
    weather: apiResults.weather,
    location: apiResults.location,
    hotels: apiResults.hotels,
    flights: apiResults.flights,
  };
}

export function buildPrompt(tripPayload) {
  return `Create a travel plan based on this JSON:
${JSON.stringify(tripPayload, null, 2)}
Return valid JSON only with keys: summary, dailyPlan, budget, packingList, warnings, bestPlaces.
dailyPlan must be an array of objects with day, title, activities.
budget must include total, breakdown (array), and currency.
packingList must be an array of strings.
warnings must be an array of strings.
bestPlaces must be an array of objects with name, type, reason.`;
}

function createMockPlan(tripPayload) {
  const days = getTripDays(tripPayload.dates.from, tripPayload.dates.to);
  const interests = new Set(tripPayload.interests);

  return {
    summary: `A ${tripPayload.budget} ${tripPayload.preferences?.tripPace ?? "balanced"} trip to ${tripPayload.destination} for ${tripPayload.travelers.adults + tripPayload.travelers.children} travelers.`,
    dailyPlan: days.map((date, index) => ({
      day: index + 1,
      date,
      title: `Day ${index + 1} in ${tripPayload.location?.city ?? tripPayload.destination}`,
      activities: buildActivities(interests, index),
    })),
    budget: {
      currency: "USD",
      total: estimateBudget(tripPayload),
      breakdown: [
        { label: "Flights", amount: tripPayload.flights?.[0]?.price ?? 600 },
        {
          label: "Hotels",
          amount: (tripPayload.hotels?.[0]?.pricePerNight ?? 120) * days.length,
        },
        { label: "Food & Activities", amount: days.length * 80 },
        { label: "Local Transport", amount: days.length * 25 },
      ],
    },
    packingList: [
      "Passport and travel documents",
      tripPayload.weather?.tempC > 20 ? "Light clothing" : "Warm layers",
      "Comfortable walking shoes",
      "Power adapter",
      "Reusable water bottle",
    ],
    warnings: [
      tripPayload.weather?.summary?.includes("rain")
        ? "Rain is possible during your trip."
        : "Check local transit schedules for holiday changes.",
      "Keep digital copies of bookings and IDs.",
    ],
    bestPlaces: [
      {
        name: `${tripPayload.destination} Old Town`,
        type: interests.has("history") ? "history" : "sightseeing",
        reason: "Great for culture and photos.",
      },
      {
        name: `${tripPayload.destination} Central Market`,
        type: interests.has("food") ? "food" : "shopping",
        reason: "Popular local food and souvenirs.",
      },
      {
        name: `${tripPayload.destination} Waterfront`,
        type:
          interests.has("beach") || interests.has("nature")
            ? "nature"
            : "relaxation",
        reason: "Ideal for sunset walks.",
      },
    ],
  };
}

function getTripDays(from, to) {
  const days = [];
  const start = new Date(from);
  const end = new Date(to);

  for (
    let current = new Date(start);
    current < end;
    current.setDate(current.getDate() + 1)
  ) {
    days.push(current.toISOString().slice(0, 10));
  }

  return days.length ? days : [from];
}

function buildActivities(interests, dayIndex) {
  const pool = [
    interests.has("museums") ? "Visit a local museum" : null,
    interests.has("food") ? "Try a signature local dish" : null,
    interests.has("shopping") ? "Explore a market district" : null,
    interests.has("adventure") ? "Book an outdoor adventure tour" : null,
    interests.has("nature") ? "Walk through a city park or garden" : null,
    interests.has("nightlife") ? "Evening drinks in a popular district" : null,
    interests.has("family-friendly")
      ? "Family-friendly interactive exhibit"
      : null,
    "Neighborhood walking tour",
  ].filter(Boolean);

  return pool.slice(dayIndex % pool.length, (dayIndex % pool.length) + 3);
}

function estimateBudget(tripPayload) {
  const days = getTripDays(tripPayload.dates.from, tripPayload.dates.to).length;
  const flight = tripPayload.flights?.[0]?.price ?? 600;
  const hotel = (tripPayload.hotels?.[0]?.pricePerNight ?? 120) * days;
  return flight + hotel + days * 105;
}

function parseAiJson(content) {
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

export function createAiService({ provider }) {
  return {
    buildTripPayload,
    buildPrompt,

    async generatePlan(tripPayload) {
      if (
        provider === "mock" ||
        !config.OPENROUTER_API_KEY ||
        config.OPENROUTER_API_KEY.includes("your_")
      ) {
        return createMockPlan(tripPayload);
      }

      const prompt = buildPrompt(tripPayload);

      let response;
      try {
        response = await fetchWithTimeout(
          `${config.OPENAI_API_URL}/api/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin,
              "X-Title": "Travel Planner",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a travel planner. Respond with valid JSON only.",
                },
                { role: "user", content: prompt },
              ],
              temperature: 0.4,
            }),
          },
          8000,
        );
      } catch {
        return createMockPlan(tripPayload);
      }

      if (!response.ok) {
        return createMockPlan(tripPayload);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return createMockPlan(tripPayload);
      }

      try {
        return parseAiJson(content);
      } catch {
        return createMockPlan(tripPayload);
      }
    },
  };
}
