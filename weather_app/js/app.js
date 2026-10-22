"use strict";

// ---- State ----
let currentPlace = null;
let currentData = null;
let unit = getUnit();

// ---- Element refs (controls) ----
const unitToggle = document.getElementById("unit-toggle");
const locationBtn = document.getElementById("location-btn");
const retryBtn = document.getElementById("retry-btn");

// ---- Init ----
function init() {
  unitToggle.textContent = unit === "F" ? "°F" : "°C";
  bindEvents();

  const recent = getRecent();
  renderRecent(recent, (p) => loadPlace(p));

  // Load last place, or London default
  if (recent.length) {
    loadPlace(recent[0]);
  } else {
    loadPlace({
      name: "London",
      country: "UK",
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: "Europe/London",
    });
  }
}

function bindEvents() {
  // Search input: debounced suggestions + Enter to pick first result
  el.searchInput.addEventListener("input", debounce(onSearchInput, 350));
  el.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit();
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  // Click outside closes suggestions
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-section")) hideSuggestions();
  });

  // Unit toggle (no refetch)
  unitToggle.addEventListener("click", () => {
    unit = unit === "C" ? "F" : "C";
    setUnit(unit);
    unitToggle.textContent = unit === "F" ? "°F" : "°C";
    if (currentData && currentPlace) {
      renderCurrent(currentData, currentPlace, unit);
      renderHourly(currentData, unit);
      renderDaily(currentData, unit);
    }
  });

  locationBtn.addEventListener("click", useMyLocation);

  retryBtn.addEventListener("click", () => {
    hideError();
    if (currentPlace) loadPlace(currentPlace);
  });
}

// ---- Search ----
async function onSearchInput() {
  const q = el.searchInput.value.trim();
  if (q.length < 2) {
    hideSuggestions();
    return;
  }
  try {
    const results = await geocodeCity(q);
    renderSuggestions(results, (place) => {
      el.searchInput.value = place.name;
      hideSuggestions();
      loadPlace(place);
    });
  } catch {
    hideSuggestions();
  }
}

async function onSearchSubmit() {
  const q = el.searchInput.value.trim();
  if (!q) return;
  hideSuggestions();

  try {
    showLoading(true);
    const results = await geocodeCity(q);
    showLoading(false);

    if (!results.length) {
      showError(`No city found matching "${q}". Try another spelling.`);
      return;
    }
    const place = results[0];
    el.searchInput.value = place.name;
    loadPlace(place);
  } catch (err) {
    showLoading(false);
    if (!navigator.onLine) {
      showError("You appear to be offline. Check your internet connection.");
    } else {
      showError("Could not reach the search service. Please try again.");
    }
  }
}

// ---- Load weather for a place ----
async function loadPlace(place) {
  if (!place || place.latitude == null || place.longitude == null) {
    showError("Invalid location data.");
    return;
  }

  currentPlace = place;
  showLoading(true);
  hideError();

  try {
    const data = await fetchWeather(place.latitude, place.longitude);

    if (!data.current) {
      throw new Error("Incomplete weather data");
    }

    // Merge timezone into place so renders have it
    const placeWithTz = { ...place, timezone: place.timezone || data.timezone };
    currentPlace = placeWithTz;
    currentData = data;

    renderCurrent(data, placeWithTz, unit);
    renderHourly(data, unit);
    renderDaily(data, unit);

    addRecent(placeWithTz);
    renderRecent(getRecent(), (p) => loadPlace(p));

    // Weather content is always visible — no more blank page
    el.weatherContent.hidden = false;
  } catch (err) {
    if (!navigator.onLine) {
      showError("You appear to be offline. Please check your internet connection.");
    } else if (err.name === "AbortError") {
      showError("The request timed out. Please try again.");
    } else if (err.status === 429) {
      showError("Too many requests. Please wait a moment and try again.");
    } else if (err.status >= 500) {
      showError("Weather service is temporarily unavailable. Try again shortly.");
    } else {
      showError("Could not load weather data. Please try again.");
    }
  } finally {
    showLoading(false);
  }
}

// ---- Geolocation ----
function useMyLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  showLoading(true);
  hideError();

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      loadPlace({
        name: "My location",
        country: "",
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    },
    (err) => {
      showLoading(false);
      if (err.code === err.PERMISSION_DENIED) {
        showError("Location permission denied. Enable it in your browser settings.");
      } else if (err.code === err.TIMEOUT) {
        showError("Location request timed out. Please try again.");
      } else {
        showError("Could not get your location. Please try again.");
      }
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

// ---- Service worker (PWA bonus) ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ---- Go ----
init();