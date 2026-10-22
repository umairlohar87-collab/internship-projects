"use strict";

// ---- Element refs ----
const el = {
  searchInput: document.getElementById("search-input"),
  suggestions: document.getElementById("suggestions"),
  recentSection: document.getElementById("recent-section"),
  recentList: document.getElementById("recent-list"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  errorMessage: document.getElementById("error-message"),
  weatherContent: document.getElementById("weather-content"),
  cityName: document.getElementById("city-name"),
  localTime: document.getElementById("local-time"),
  currentIcon: document.getElementById("current-icon"),
  currentTemp: document.getElementById("current-temp"),
  tempUnit: document.getElementById("temp-unit"),
  conditionText: document.getElementById("condition-text"),
  feelsLike: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  hourlyList: document.getElementById("hourly-list"),
  dailyList: document.getElementById("daily-list"),
  hourlyTag: document.getElementById("hourly-tag"),
  dailyTag: document.getElementById("daily-tag"),
  brandSub: document.getElementById("brand-sub"),
  body: document.body,
};

// ---- Loading / error ----
function showLoading(visible) {
  el.loading.hidden = !visible;
}

function showError(message) {
  el.errorMessage.textContent = message;
  el.error.hidden = false;
}

function hideError() {
  el.error.hidden = true;
}

// ---- Suggestions ----
function renderSuggestions(results, onPick) {
  el.suggestions.innerHTML = "";
  if (!results || !results.length) {
    el.suggestions.hidden = true;
    return;
  }
  results.forEach((r) => {
    const li = document.createElement("li");
    li.className = "suggestion-item";
    li.setAttribute("role", "option");
    const region = [r.admin1, r.country].filter(Boolean).join(", ");
    li.innerHTML = `<span class="sug-name">${r.name}</span><span class="sug-region">${region}</span>`;
    li.addEventListener("click", () => onPick(r));
    el.suggestions.appendChild(li);
  });
  el.suggestions.hidden = false;
}

function hideSuggestions() {
  el.suggestions.hidden = true;
}

// ---- Recent ----
function renderRecent(recent, onPick) {
  if (!recent || !recent.length) {
    el.recentSection.hidden = true;
    return;
  }
  el.recentList.innerHTML = "";
  recent.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "recent-chip";
    btn.type = "button";
    btn.textContent = p.name;
    btn.addEventListener("click", () => onPick(p));
    el.recentList.appendChild(btn);
  });
  el.recentSection.hidden = false;
}

// ---- Current ----
function renderCurrent(data, place, unit) {
  const c = data && data.current;
  if (!c) return;

  const tz = place.timezone || data.timezone;
  const isDay = c.is_day === 1;
  const desc = describeCode(c.weather_code, isDay);

  el.cityName.textContent = place.country
    ? `${place.name}, ${place.country}`
    : place.name;

  el.localTime.textContent = formatLocalTime(c.time, tz);
  el.currentIcon.textContent = desc.icon;
  el.currentTemp.textContent = formatTemp(c.temperature_2m, unit);
  el.tempUnit.textContent = unit === "F" ? "°F" : "°C";
  el.conditionText.textContent = desc.text;
  el.feelsLike.textContent = `${formatTemp(c.apparent_temperature, unit)}°`;
  el.humidity.textContent = `${Math.round(c.relative_humidity_2m)}%`;
  el.wind.textContent = formatWind(c.wind_speed_10m, unit);

  if (data.daily && data.daily.sunrise && data.daily.sunset) {
    el.sunrise.textContent = formatShortTime(data.daily.sunrise[0], tz);
    el.sunset.textContent = formatShortTime(data.daily.sunset[0], tz);
  } else {
    el.sunrise.textContent = "—";
    el.sunset.textContent = "—";
  }

  el.brandSub.textContent = `${desc.text} · ${place.name}`;
  applyTheme(c.weather_code, isDay);
}

// ---- Hourly (next 24) ----
function renderHourly(data, unit) {
  const h = data && data.hourly;
  if (!h || !h.time) {
    el.hourlyList.innerHTML = "";
    return;
  }
  const tz = data.timezone;
  const now = new Date();
  // find first index at/after now
  let startIdx = 0;
  for (let i = 0; i < h.time.length; i++) {
    if (new Date(h.time[i]) >= now) { startIdx = i; break; }
  }

  el.hourlyList.innerHTML = "";
  for (let i = startIdx; i < Math.min(startIdx + 24, h.time.length); i++) {
    const iso = h.time[i];
    const temp = h.temperature_2m[i];
    const code = h.weather_code[i];
    const desc = describeCode(code, 1);

    const cell = document.createElement("div");
    cell.className = "hour-cell";
    cell.innerHTML = `
      <span class="hour-time">${i === startIdx ? "Now" : formatHour(iso, tz)}</span>
      <span class="hour-icon">${desc.icon}</span>
      <span class="hour-temp">${formatTemp(temp, unit)}°</span>
    `;
    el.hourlyList.appendChild(cell);
  }
}

// ---- Daily (7 day) ----
function renderDaily(data, unit) {
  const d = data && data.daily;
  if (!d || !d.time) {
    el.dailyList.innerHTML = "";
    return;
  }
  const tz = data.timezone;
  el.dailyList.innerHTML = "";
  for (let i = 0; i < Math.min(7, d.time.length); i++) {
    const iso = d.time[i];
    const max = d.temperature_2m_max[i];
    const min = d.temperature_2m_min[i];
    const code = d.weather_code[i];
    const desc = describeCode(code, 1);

    const row = document.createElement("div");
    row.className = "day-row";
    row.innerHTML = `
      <span class="day-name">${i === 0 ? "Today" : formatDay(iso, tz)}</span>
      <span class="day-icon">${desc.icon}</span>
      <span class="day-cond">${desc.text}</span>
      <span class="day-range">
        <span class="day-max">${formatTemp(max, unit)}°</span>
        <span class="day-min">${formatTemp(min, unit)}°</span>
      </span>
    `;
    el.dailyList.appendChild(row);
  }
}

// ---- Theme by weather + day/night ----
function applyTheme(code, isDay) {
  document.body.dataset.weather =
    code === 0 || code === 1 ? "clear" :
    code === 2 || code === 3 ? "cloudy" :
    code >= 45 && code <= 48 ? "fog" :
    code >= 51 && code <= 67 ? "rain" :
    code >= 71 && code <= 86 ? "snow" :
    code >= 95 ? "storm" : "cloudy";
  document.body.dataset.time = isDay ? "day" : "night";
}