export function createFlightService() {
  return {
    async searchFlights({ destination, dates, travelers, preferences }) {
      const classMultiplier =
        preferences?.flightClass === 'business'
          ? 2.5
          : preferences?.flightClass === 'first'
            ? 3.5
            : preferences?.flightClass === 'premium-economy'
              ? 1.5
              : 1

      const totalTravelers = travelers.adults + travelers.children

      return [
        {
          id: 'f1',
          airline: 'SkyWings',
          from: 'Home City',
          to: destination,
          departure: `${dates.from}T08:30:00`,
          arrival: `${dates.from}T12:10:00`,
          duration: '3h 40m',
          price: Math.round(320 * classMultiplier * totalTravelers),
          stops: 0,
        },
        {
          id: 'f2',
          airline: 'Global Air',
          from: 'Home City',
          to: destination,
          departure: `${dates.from}T14:15:00`,
          arrival: `${dates.from}T19:05:00`,
          duration: '4h 50m',
          price: Math.round(260 * classMultiplier * totalTravelers),
          stops: 1,
        },
        {
          id: 'f3',
          airline: 'AeroLine',
          from: 'Home City',
          to: destination,
          departure: `${dates.from}T06:00:00`,
          arrival: `${dates.from}T09:20:00`,
          duration: '3h 20m',
          price: Math.round(410 * classMultiplier * totalTravelers),
          stops: 0,
        },
      ]
    },
  }
}
