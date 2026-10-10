const RECENT_KEY = "weather_recent";
const UNIT_KEY = "weather_unit";
const MAX_RECENT = 6;

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function addRecent(place) {
  const recent = getRecent().filter(
    (p) => !(p.latitude === place.latitude && p.longitude === place.longitude)
  );
  recent.unshift({
    name: place.name,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  });
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function getUnit() {
  return localStorage.getItem(UNIT_KEY) || "C";
}

function setUnit(unit) {
  localStorage.setItem(UNIT_KEY, unit);
}