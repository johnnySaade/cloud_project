import { useState } from "react";
import "./App.css";

function getWeatherInfo(code) {
  const c = Number(code);

  if (c === 0) return { text: "Clear sky", icon: "☀️" };
  if (c === 1 || c === 2) return { text: "Partly cloudy", icon: "🌤️" };
  if (c === 3) return { text: "Overcast", icon: "☁️" };
  if (c === 45 || c === 48) return { text: "Foggy", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(c)) return { text: "Drizzle", icon: "🌦️" };
  if ([61, 63, 65, 80, 81, 82].includes(c)) return { text: "Rain", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(c)) return { text: "Snow", icon: "❄️" };
  if (c === 95) return { text: "Thunderstorm", icon: "⛈️" };
  if (c === 96 || c === 99) return { text: "Storm & hail", icon: "🌩️" };

  return { text: "Unknown", icon: "❔" };
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = "http://3.79.28.121:4000";

  const fetchWeather = async (e) => {
    e.preventDefault();
    setError("");
    setWeather(null);

    if (!city) {
      setError("Please enter a city");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/weather?city=${encodeURIComponent(city)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Backend error");
        return;
      }

      setWeather(data);
    } catch {
      setError("Failed to fetch weather");
    }
  };

  return (
    <div className="app">
      <h1>City Weather App</h1>

      <form onSubmit={fetchWeather}>
        <input
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div>
          <h2>
            {weather.city}, {weather.country}
          </h2>
          <p>
            {getWeatherInfo(weather.current.weathercode).icon}{" "}
            {weather.current.temperature}°C
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
