const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

async function geocodeCity(name) {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding service unavailable");
  const data = await res.json();
  return data.results || [];
}

async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: 7,
  });
  const res = await fetch(`${WEATHER_URL}?${params}`);
  if (!res.ok) throw new Error("Weather service unavailable");
  return res.json();
}