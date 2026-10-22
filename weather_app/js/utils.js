"use strict";

// ---- Unit storage ----
const UNIT_KEY = "aurora_unit";
function getUnit() {
  return localStorage.getItem(UNIT_KEY) || "C";
}
function setUnit(u) {
  localStorage.setItem(UNIT_KEY, u);
}

// ---- Debounce ----
function debounce(fn, wait = 300) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ---- Temperature conversion ----
function formatTemp(celsius, unit) {
  if (celsius == null || isNaN(celsius)) return "—";
  const v = unit === "F" ? celsius * 9 / 5 + 32 : celsius;
  return Math.round(v);
}

function formatWind(kmh, unit) {
  if (kmh == null || isNaN(kmh)) return "—";
  const v = unit === "F" ? kmh * 0.621371 : kmh;
  const suffix = unit === "F" ? "mph" : "km/h";
  return `${Math.round(v)} ${suffix}`;
}

// ---- Time formatting in a specific IANA timezone ----
function formatLocalTime(isoString, timezone) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "—";
  }
}

function formatHour(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      hour: "numeric",
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return "—";
  }
}

function formatDay(isoString, timezone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      weekday: "short",
    }).format(new Date(isoString));
  } catch {
    return "—";
  }
}

function formatShortTime(isoString, timezone) {
  if (!isoString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return "—";
  }
}

// ---- WMO weather code → text + icon ----
const WEATHER_CODES = {
  0:  { text: "Clear sky",            icon: "☀️", iconNight: "🌙" },
  1:  { text: "Mainly clear",         icon: "🌤️", iconNight: "🌙" },
  2:  { text: "Partly cloudy",        icon: "⛅", iconNight: "☁️" },
  3:  { text: "Overcast",             icon: "☁️", iconNight: "☁️" },
  45: { text: "Fog",                  icon: "🌫️", iconNight: "🌫️" },
  48: { text: "Depositing rime fog",  icon: "🌫️", iconNight: "🌫️" },
  51: { text: "Light drizzle",        icon: "🌦️", iconNight: "🌧️" },
  53: { text: "Drizzle",              icon: "🌦️", iconNight: "🌧️" },
  55: { text: "Dense drizzle",        icon: "🌧️", iconNight: "🌧️" },
  56: { text: "Freezing drizzle",     icon: "🌧️", iconNight: "🌧️" },
  57: { text: "Freezing drizzle",     icon: "🌧️", iconNight: "🌧️" },
  61: { text: "Light rain",           icon: "🌦️", iconNight: "🌧️" },
  63: { text: "Rain",                 icon: "🌧️", iconNight: "🌧️" },
  65: { text: "Heavy rain",           icon: "🌧️", iconNight: "🌧️" },
  66: { text: "Freezing rain",        icon: "🌨️", iconNight: "🌨️" },
  67: { text: "Freezing rain",        icon: "🌨️", iconNight: "🌨️" },
  71: { text: "Light snow",           icon: "🌨️", iconNight: "🌨️" },
  73: { text: "Snow",                 icon: "❄️", iconNight: "❄️" },
  75: { text: "Heavy snow",           icon: "❄️", iconNight: "❄️" },
  77: { text: "Snow grains",          icon: "🌨️", iconNight: "🌨️" },
  80: { text: "Rain showers",         icon: "🌦️", iconNight: "🌧️" },
  81: { text: "Rain showers",         icon: "🌧️", iconNight: "🌧️" },
  82: { text: "Violent rain showers", icon: "⛈️", iconNight: "⛈️" },
  85: { text: "Snow showers",         icon: "🌨️", iconNight: "🌨️" },
  86: { text: "Heavy snow showers",   icon: "❄️", iconNight: "❄️" },
  95: { text: "Thunderstorm",         icon: "⛈️", iconNight: "⛈️" },
  96: { text: "Thunderstorm + hail",  icon: "⛈️", iconNight: "⛈️" },
  99: { text: "Thunderstorm + hail",  icon: "⛈️", iconNight: "⛈️" },
};

function describeCode(code, isDay = 1) {
  const entry = WEATHER_CODES[code] || { text: "Unknown", icon: "❓", iconNight: "❓" };
  return {
    text: entry.text,
    icon: isDay ? entry.icon : entry.iconNight,
  };
}