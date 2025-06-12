const API_KEY = "f4f37a586901c1c0385a108eab625343";
let currentData = null;
let currentUnit = "metric"; // metric for Celsius, imperial for Fahrenheit

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const currentLocationButton = document.getElementById("currentLocationButton");
const unitSelect = document.getElementById("unitSelect");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const locationName = document.getElementById("locationName");
const humidityValue = document.getElementById("humidityValue");
const windSpeedValue = document.getElementById("windSpeedValue");
const pressureValue = document.getElementById("pressureValue");
const visibilityValue = document.getElementById("visibilityValue");

// Weather icon mapping using local images
const weatherIconMap = {
    "01d": "/images/clear.png", // clear sky day
    "01n": "/images/clear.png", // clear sky night
    "02d": "/images/clouds.png", // few clouds day
    "02n": "/images/clouds.png", // few clouds night
    "03d": "/images/clouds.png", // scattered clouds
    "03n": "/images/clouds.png", // scattered clouds
    "04d": "/images/clouds.png", // broken clouds
    "04n": "/images/clouds.png", // broken clouds
    "09d": "/images/rain.png", // shower rain
    "09n": "/images/rain.png", // shower rain
    "10d": "/images/rain.png", // rain day
    "10n": "/images/rain.png", // rain night
    "11d": "/images/rain.png", // thunderstorm
    "11n": "/images/rain.png", // thunderstorm
    "13d": "/images/snow.png", // snow
    "13n": "/images/snow.png", // snow
    "50d": "/images/mist.png", // mist
    "50n": "/images/mist.png", // mist
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    initializeEventListeners();
    fetchWeatherByCity("London"); // Default city
});

// Event listeners
function initializeEventListeners() {
    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });

    currentLocationButton.addEventListener("click", getCurrentLocation);
    unitSelect.addEventListener("change", handleUnitChange);

    // Add error handler for weather icon
    weatherIcon.onerror = () => {
        console.warn("Weather icon failed to load, using fallback");
        weatherIcon.src = "/images/clear.png"; // Fallback image
        weatherIcon.alt = "Weather icon not available";
    };
}

// Search functionality
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        searchInput.value = "";
    }
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.error("Error getting location:", error);
                showError(
                    "Could not get your location. Please search for a city instead."
                );
            }
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("City not found");
        }

        currentData = await response.json();
        updateWeatherDisplay();
    } catch (error) {
        console.error("Error fetching weather:", error);
        showError("City not found. Please try another location.");
    }
}

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(lat, lon) {
    try {
        showLoading();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Weather data not available");
        }

        currentData = await response.json();
        updateWeatherDisplay();
    } catch (error) {
        console.error("Error fetching weather:", error);
        showError("Could not fetch weather data for your location.");
    }
}

// Update weather display
function updateWeatherDisplay() {
    if (!currentData) return;

    const { name, sys, main, weather, wind, visibility } = currentData;

    // Update location name
    locationName.textContent = `${name}, ${sys.country}`;

    // Update temperature
    const tempUnit = currentUnit === "metric" ? "°C" : "°F";
    temperature.textContent = `${Math.round(main.temp)}${tempUnit}`;

    // Update weather icon using local images
    const iconCode = weather[0]?.icon;
    if (iconCode && weatherIconMap[iconCode]) {
        weatherIcon.src = weatherIconMap[iconCode];
        weatherIcon.alt = weather[0].description || "Weather icon";
        weatherIcon.style.display = "block";
    } else {
        console.warn("Weather icon code not found:", iconCode);
        weatherIcon.src = "/images/clear.png"; // Fallback image
        weatherIcon.alt = "Weather icon not available";
        weatherIcon.style.display = "block";
    }

    // Update humidity
    humidityValue.textContent = `${main.humidity}%`;

    // Update wind speed
    const windUnit = currentUnit === "metric" ? "km/h" : "mph";
    const windSpeed =
        currentUnit === "metric"
            ? (wind.speed * 3.6).toFixed(1) // Convert m/s to km/h
            : wind.speed.toFixed(1); // Already in mph for imperial
    windSpeedValue.textContent = `${windSpeed} ${windUnit}`;

    // Update pressure
    pressureValue.textContent = `${main.pressure} hPa`;

    // Update visibility
    console.log("Raw visibility value:", visibility); // Debug log
    const visibilityKm = typeof visibility === 'number' && visibility >= 0 ? (visibility / 1000).toFixed(1) : "N/A";
    visibilityValue.textContent = visibilityKm !== "N/A" ? `${visibilityKm} km` : "N/A";
}

// Handle unit change
function handleUnitChange() {
    const newUnit = unitSelect.value;
    if (newUnit !== currentUnit) {
        currentUnit = newUnit;
        if (currentData && currentData.name) {
            fetchWeatherByCity(currentData.name);
        } else {
            fetchWeatherByCity("London"); // Default to London if no data
        }
    }
}

// Show loading state
function showLoading() {
    temperature.textContent = "Loading...";
    locationName.textContent = "Fetching weather data...";
    humidityValue.textContent = "...";
    windSpeedValue.textContent = "...";
    pressureValue.textContent = "...";
    visibilityValue.textContent = "...";
    weatherIcon.style.display = "none";
}

// Show error message
function showError(message) {
    temperature.textContent = "Error";
    locationName.textContent = message;
    humidityValue.textContent = "--";
    windSpeedValue.textContent = "--";
    pressureValue.textContent = "--";
    visibilityValue.textContent = "--";
    weatherIcon.style.display = "none";
}

// Add some additional functionality for better UX
searchInput.addEventListener("focus", () => {
    searchInput.style.backgroundColor = "#f0f0f0";
});

searchInput.addEventListener("blur", () => {
    searchInput.style.backgroundColor = "white";
});

// Handle empty search
searchInput.addEventListener("input", (e) => {
    if (e.target.value.trim() === "") {
        // Could add suggestions here in the future
    }
});
