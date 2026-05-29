import type { Airport } from "./study-types"

export const airports: Airport[] = [
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands", lat: 52.3086, lon: 4.7639 },
  { code: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "USA", lat: 33.6407, lon: -84.4277 },
  { code: "BCN", name: "Barcelona-El Prat", city: "Barcelona", country: "Spain", lat: 41.2971, lon: 2.0785 },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", country: "India", lat: 19.0887, lon: 72.8679 },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", lat: 49.0097, lon: 2.5479 },
  { code: "DEL", name: "Indira Gandhi", city: "Delhi", country: "India", lat: 28.5562, lon: 77.1 },
  { code: "DEN", name: "Denver International", city: "Denver", country: "USA", lat: 39.8561, lon: -104.6737 },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "USA", lat: 32.8998, lon: -97.0403 },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "Qatar", lat: 25.2731, lon: 51.6088 },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "UAE", lat: 25.2532, lon: 55.3656 },
  { code: "EWR", name: "Newark Liberty", city: "Newark", country: "USA", lat: 40.6895, lon: -74.1745 },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", lat: 50.0333, lon: 8.5706 },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "China", lat: 22.308, lon: 113.9185 },
  { code: "IAD", name: "Washington Dulles", city: "Washington", country: "USA", lat: 38.9531, lon: -77.4565 },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "USA", lat: 29.9844, lon: -95.3414 },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", lat: 41.2613, lon: 28.7422 },
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "USA", lat: 40.6413, lon: -73.7781 },
  { code: "LHR", name: "Heathrow", city: "London", country: "UK", lat: 51.47, lon: -0.4543 },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA", lat: 33.9416, lon: -118.4085 },
  { code: "MAD", name: "Adolfo Suárez Madrid-Barajas", city: "Madrid", country: "Spain", lat: 40.4983, lon: -3.5676 },
  { code: "MCO", name: "Orlando International", city: "Orlando", country: "USA", lat: 28.4289, lon: -81.3162 },
  { code: "MEX", name: "Mexico City International", city: "Mexico City", country: "Mexico", lat: 19.4361, lon: -99.0719 },
  { code: "MIA", name: "Miami International", city: "Miami", country: "USA", lat: 25.7959, lon: -80.287 },
  { code: "MSP", name: "Minneapolis-Saint Paul", city: "Minneapolis", country: "USA", lat: 44.8824, lon: -93.2222 },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "Japan", lat: 35.7647, lon: 140.3864 },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "USA", lat: 41.9742, lon: -87.9073 },
  { code: "PEK", name: "Beijing Capital", city: "Beijing", country: "China", lat: 40.0799, lon: 116.6031 },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "USA", lat: 39.8729, lon: -75.2433 },
  { code: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix", country: "USA", lat: 33.4342, lon: -112.0118 },
  { code: "SEA", name: "Seattle-Tacoma", city: "Seattle", country: "USA", lat: 47.4489, lon: -122.3103 },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "USA", lat: 37.6213, lon: -122.379 },
  { code: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore", lat: 1.3644, lon: 103.9915 },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia", lat: -33.9361, lon: 151.1669 },
  { code: "TPE", name: "Taiwan Taoyuan International", city: "Taipei", country: "Taiwan", lat: 25.0764, lon: 121.2328 },
  { code: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada", lat: 43.6777, lon: -79.6306 },
  { code: "BLR", name: "Kempegowda International", city: "Bangalore", country: "India", lat: 13.1986, lon: 77.7064 },
  { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India", lat: 17.2403, lon: 78.4294 },
  { code: "MAA", name: "Chennai International", city: "Chennai", country: "India", lat: 12.9901, lon: 80.1694 },
  { code: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata", country: "India", lat: 22.6543, lon: 88.4467 },
  { code: "PNQ", name: "Pune International", city: "Pune", country: "India", lat: 18.5802, lon: 73.9194 },
]

function toRad(v: number): number {
  return (v * Math.PI) / 180
}

export function calcFlightMinutes(from: Airport, to: Airport): number {
  const R = 6371
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lon - from.lon)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const km = R * c
  const hours = km / 850
  const withBuffer = hours * 60 + 30
  return Math.round(withBuffer)
}
