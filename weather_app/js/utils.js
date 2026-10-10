// Weather code lookup table (from Open-Meteo docs)
const WEATHER_CODES = {
  0: { text: "Clear sky", icon: "☀️", theme: "clear" },
  1: { text: "Mainly clear", icon: "🌤️", theme: "clear" },
  2: { text: "Partly cloudy", icon: "⛅", theme: "clouds" },
  3: { text: "Overcast", icon: "☁️", theme: "clouds" },
  45: { text: "Fog", icon: "🌫️", theme: "mist" },
  48: { text: "Depositing rime fog", icon: "🌫️", theme: "mist" },
  51: { text: "Light drizzle", icon: "🌦️", theme: "rain" },
  53: { text: "Moderate drizzle", icon: "🌦️", theme: "rain" },
  55: { text: "Dense drizzle", icon: "🌧️", theme: "rain" },
  56: { text: "Light freezing drizzle", icon: "🌧️", theme: "rain" },
  57: { text: "Dense freezing drizzle", icon: "🌧️", theme: "rain" },
  61: { text: "Slight rain", icon: "🌦️", theme: "rain" },
  63: { text: "Moderate rain", icon: "🌧️", theme: "rain" },
  65: { text: "Heavy rain", icon: "🌧️", theme: "rain" },
  66: { text: "Light freezing rain", icon: "🌧️", theme: "rain" },
  67: { text: "Heavy freezing rain", icon: "🌧️", theme: "rain" },
  71: { text: "Slight snow", icon: "🌨️", theme: "snow" },
  73: { text: "Moderate snow", icon: "🌨️", theme: "snow" },
  75: { text: "Heavy snow", icon: "❄️", theme: "snow" },
  77: { text: "Snow grains", icon: "🌨️", theme: "snow" },
  80: { text: "Slight rain showers", icon: "🌦️", theme: "rain" },
  81: { text: "Moderate rain showers", icon: "🌧️", theme: "rain" },
  82: { text: "Violent rain showers", icon: "⛈️", theme: "rain" },
  85: { text: "Slight snow showers", icon: "🌨️", theme: "snow" },
  86: { text: "Heavy snow showers", icon: "❄️", theme: "snow" },
  95: { text: "Thunderstorm", icon: "⛈️", theme: "thunder" },
  96: { text: "Thunderstorm with hail", icon: "⛈️", theme: "thunder" },
  99: { text: "Thunderstorm with heavy hail", icon: "⛈️", theme: "thunder" },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { text: "Unknown", icon: "❓", theme: "clouds" };
}

// Unit conversions
function cToF(c) { return c * 9 / 5 + 32; }
function kmhToMph(kmh) { return kmh * 0.621371; }

function formatTemp(celsius, unit) {
  const value = unit === "F" ? cToF(celsius) : celsius;
  return Math.round(value);
}

function formatWind(kmh, unit) {
  const value = unit === "F" ? kmhToMph(kmh) : kmh;
  return Math.round(value);
}

// Format time in a given timezone
function formatTime(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHour(isoString, timezone) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "numeric",
  });
}

function formatDay(isoString, timezone) {
  const date = new Date(isoString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "short",
  });
}

function isDaytime(sunriseISO, sunsetISO, currentISO) {
  const now = new Date(currentISO).getTime();
  return now >= new Date(sunriseISO).getTime() && now <= new Date(sunsetISO).getTime();
}

// Debounce helper
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}