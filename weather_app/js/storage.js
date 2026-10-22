"use strict";

const RECENT_KEY = "aurora_recent";
const RECENT_MAX = 6;

function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function addRecent(place) {
  if (!place || !place.latitude || !place.longitude) return;
  const list = getRecent().filter(
    (p) => !(Math.abs(p.latitude - place.latitude) < 0.01 &&
             Math.abs(p.longitude - place.longitude) < 0.01)
  );
  list.unshift({
    name: place.name || "Unknown",
    country: place.country || "",
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || "",
  });
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
}