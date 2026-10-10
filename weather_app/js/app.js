// State
let currentPlace = null;
let currentData = null;
let unit = getUnit();
let searchController = null;

// Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const unitToggle = document.getElementById("unit-toggle");
const locationBtn = document.getElementById("location-btn");
const retryBtn = document.getElementById("retry-btn");

// Init
function init() {
  unitToggle.textContent = unit === "F" ? "°F" : "°C";
  renderRecent(getRecent(), (place) => loadPlace(place));
  bindEvents();
  // Load a default city on first visit
  if (!getRecent().length) {
    loadPlace({ name: "London", country: "UK", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" });
  } else {
    const last = getRecent()[0];
    loadPlace(last);
  }
}

function bindEvents() {
  searchBtn.addEventListener("click", onSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSearch();
    if (e.key === "Escape") hideSuggestions();
  });
  searchInput.addEventListener("input", debounce(onSearchInput, 350));
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-section")) hideSuggestions();
  });

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

async function onSearchInput() {
  const q = searchInput.value.trim();
  if (q.length < 2) {
    hideSuggestions();
    return;
  }
  try {
    const results = await geocodeCity(q);
    renderSuggestions(results, (place) => {
      searchInput.value = place.name;
      hideSuggestions();
      loadPlace(place);
    });
  } catch {
    hideSuggestions();
  }
}

function onSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  hideSuggestions();
  onSearchInput();
}

async function loadPlace(place) {
  currentPlace = place;
  showLoading(true);
  hideError();

  try {
    const data = await fetchWeather(place.latitude, place.longitude);
    currentData = data;
    renderCurrent(data, place, unit);
    renderHourly(data, unit);
    renderDaily(data, unit);
    addRecent({ ...place, timezone: data.timezone });
    renderRecent(getRecent(), (p) => loadPlace(p));
    document.getElementById("weather-content").hidden = false;
  } catch (err) {
    if (!navigator.onLine) {
      showError("You appear to be offline. Please check your internet connection.");
    } else {
      showError("Could not load weather data. Please try again.");
    }
  } finally {
    showLoading(false);
  }
}

async function useMyLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  showLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        // Reverse-geocode using Open-Meteo (name comes back from timezone if not available)
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`
        );
        // Open-Meteo doesn't support reverse geocoding; fall back to coordinates
        const place = {
          name: "My location",
          country: "",
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await loadPlace(place);
      } catch {
        await loadPlace({
          name: "My location",
          country: "",
          latitude,
          longitude,
        });
      }
    },
    (err) => {
      showLoading(false);
      if (err.code === err.PERMISSION_DENIED) {
        showError("Location permission denied. Please enable it in your browser settings.");
      } else if (err.code === err.TIMEOUT) {
        showError("Location request timed out. Please try again.");
      } else {
        showError("Could not get your location. Please try again.");
      }
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

// Service worker registration (PWA bonus)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

init();