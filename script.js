'use strict';

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const submitButton = document.getElementById('city-input-btn');
const statusMessage = document.getElementById('status');
const weatherInfo = document.getElementById('weather-info');

const weatherDescriptions = {
  0: ['Clear sky', '☀️'],
  1: ['Mainly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'],
  48: ['Depositing rime fog', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Moderate drizzle', '🌦️'],
  55: ['Dense drizzle', '🌧️'],
  56: ['Light freezing drizzle', '🌧️'],
  57: ['Dense freezing drizzle', '🌧️'],
  61: ['Slight rain', '🌦️'],
  63: ['Moderate rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  66: ['Light freezing rain', '🌧️'],
  67: ['Heavy freezing rain', '🌧️'],
  71: ['Slight snowfall', '🌨️'],
  73: ['Moderate snowfall', '🌨️'],
  75: ['Heavy snowfall', '❄️'],
  77: ['Snow grains', '❄️'],
  80: ['Slight rain showers', '🌦️'],
  81: ['Moderate rain showers', '🌧️'],
  82: ['Violent rain showers', '⛈️'],
  85: ['Slight snow showers', '🌨️'],
  86: ['Heavy snow showers', '❄️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm with slight hail', '⛈️'],
  99: ['Thunderstorm with heavy hail', '⛈️']
};

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
  statusMessage.hidden = false;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Local time unavailable';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather service returned error ${response.status}.`);
  return response.json();
}

async function weatherFn(cityName) {
  const city = cityName.trim();
  if (!city) {
    setStatus('Please enter a city name.', true);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Loading…';
  weatherInfo.hidden = true;
  setStatus(`Finding weather for ${city}…`);

  try {
    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.search = new URLSearchParams({ name: city, count: '1', language: 'en', format: 'json' });
    const geoData = await getJson(geoUrl);
    const place = geoData.results && geoData.results[0];

    if (!place) {
      setStatus(`City “${city}” was not found. Check the spelling and try again.`, true);
      return;
    }

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto'
    });
    const weatherData = await getJson(forecastUrl);
    const current = weatherData.current;
    if (!current) throw new Error('Current weather data is unavailable for this location.');

    const [description, icon] = weatherDescriptions[current.weather_code] || ['Weather conditions unavailable', '🌍'];
    document.getElementById('city-name').textContent = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
    document.getElementById('date').textContent = formatDate(current.time);
    document.getElementById('weather-icon').textContent = icon;
    document.getElementById('description').textContent = description;
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById('precipitation').textContent = `${current.precipitation} mm`;

    weatherInfo.hidden = false;
    statusMessage.hidden = true;
  } catch (error) {
    console.error('Unable to load weather:', error);
    setStatus('Unable to load weather. Check your internet connection and try again.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Get Weather';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  weatherFn(cityInput.value);
});

weatherFn('Chennai');
