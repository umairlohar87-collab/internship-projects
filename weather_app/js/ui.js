const $ = (id) => document.getElementById(id);

function showLoading(show) {
  $("loading").hidden = !show;
}

function showError(message) {
  $("error-message").textContent = message;
  $("error").hidden = false;
  $("weather-content").hidden = true;
}

function hideError() {
  $("error").hidden = true;
}

function setTheme(weatherCode, isDay) {
  const info = getWeatherInfo(weatherCode);
  let theme = info.theme;
  if ((theme === "clear" || theme === "clouds") && !isDay) {
    theme = theme === "clear" ? "clear-night" : "clouds";
  }
  document.body.className = `theme-${theme}`;
}

function renderCurrent(data, place, unit) {
  const cur = data.current;
  const info = getWeatherInfo(cur.weather_code);
  const tz = data.timezone;

  $("city-name").textContent = `${place.name}${place.country ? ", " + place.country : ""}`;
  $("local-time").textContent = `Local time: ${formatTime(cur.time, tz)}`;
  $("current-icon").textContent = info.icon;
  $("current-temp").textContent = formatTemp(cur.temperature_2m, unit);
  $("temp-unit").textContent = unit === "F" ? "°F" : "°C";
  $("condition-text").textContent = info.text;
  $("feels-like").textContent = `${formatTemp(cur.apparent_temperature, unit)}°`;
  $("humidity").textContent = `${cur.relative_humidity_2m}%`;
  $("wind").textContent = `${formatWind(cur.wind_speed_10m, unit)} ${unit === "F" ? "mph" : "km/h"}`;

  const sunrise = data.daily.sunrise[0];
  const sunset = data.daily.sunset[0];
  $("sunrise").textContent = formatTime(sunrise, tz);
  $("sunset").textContent = formatTime(sunset, tz);

  setTheme(cur.weather_code, cur.is_day === 1);
}

function renderHourly(data, unit) {
  const tz = data.timezone;
  const now = new Date(data.current.time).getTime();
  const list = $("hourly-list");
  list.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weather_code;

  let startIdx = times.findIndex((t) => new Date(t).getTime() >= now);
  if (startIdx < 0) startIdx = 0;

  for (let i = startIdx; i < Math.min(startIdx + 24, times.length); i++) {
    const info = getWeatherInfo(codes[i]);
    const item = document.createElement("div");
    item.className = "hourly-item";
    item.innerHTML = `
      <div class="hour">${i === startIdx ? "Now" : formatHour(times[i], tz)}</div>
      <div class="icon">${info.icon}</div>
      <div class="temp">${formatTemp(temps[i], unit)}°</div>
    `;
    list.appendChild(item);
  }
}

function renderDaily(data, unit) {
  const tz = data.timezone;
  const list = $("daily-list");
  list.innerHTML = "";

  const days = data.daily.time;
  const codes = data.daily.weather_code;
  const maxT = data.daily.temperature_2m_max;
  const minT = data.daily.temperature_2m_min;

  for (let i = 0; i < days.length; i++) {
    const info = getWeatherInfo(codes[i]);
    const item = document.createElement("div");
    item.className = "daily-item";
    item.innerHTML = `
      <span class="day">${i === 0 ? "Today" : formatDay(days[i], tz)}</span>
      <span class="icon" title="${info.text}">${info.icon}</span>
      <span class="temp-max">${formatTemp(maxT[i], unit)}°</span>
      <span class="temp-min">${formatTemp(minT[i], unit)}°</span>
    `;
    list.appendChild(item);
  }
}

function renderRecent(recent, onSelect) {
  const section = $("recent-section");
  const list = $("recent-list");
  list.innerHTML = "";
  if (!recent.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  recent.forEach((place) => {
    const btn = document.createElement("button");
    btn.className = "recent-chip";
    btn.textContent = place.name;
    btn.addEventListener("click", () => onSelect(place));
    list.appendChild(btn);
  });
}

function renderSuggestions(results, onSelect) {
  const ul = $("suggestions");
  ul.innerHTML = "";
  if (!results.length) {
    ul.hidden = true;
    return;
  }
  results.forEach((place) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.innerHTML = `${place.name} <span class="country">${place.admin1 ? place.admin1 + ", " : ""}${place.country || ""}</span>`;
    li.addEventListener("click", () => onSelect(place));
    ul.appendChild(li);
  });
  ul.hidden = false;
}

function hideSuggestions() {
  $("suggestions").hidden = true;
}