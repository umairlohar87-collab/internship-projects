# Weather App

A clean, responsive weather app built with vanilla HTML, CSS, and JavaScript.

## Features
- Search any city with autocomplete suggestions
- Current weather (temperature, feels like, humidity, wind, condition, local time)
- 24-hour hourly forecast (scrollable)
- 7-day forecast with min/max temperatures
- Celsius/Fahrenheit and km/h/mph unit switch
- "Use my location" button
- Recent searches saved in localStorage
- Loading, empty, and error states
- Weather-based theme (changes with condition and day/night)
- Fully responsive
- PWA-ready with offline fallback

## API
Data from [Open-Meteo](https://open-meteo.com/) — free, no API key required:
- Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast API: `https://api.open-meteo.com/v1/forecast`

## Run locally
Just open `index.html` in a browser, or serve with:
```bash
npx serve .