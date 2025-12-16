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

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const API_BASE = "http://3.79.28.121:4000";

  const fetchWeather = async (e) => {
    e.preventDefault();
    setError("");
    setWeather(null);

    const trimmed = city.trim();
    if (!trimmed) {
      setError("Please enter a city (e.g. Beirut)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/weather?city=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Backend error");
        return;
      }

      setWeather(data);

      // optional: refresh history after each search
      if (showHistory) {
        await fetchHistory();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setError("");
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to load history");
        return;
      }

      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    await fetchHistory();
  };

  const currentInfo = weather ? getWeatherInfo(weather.current.weathercode) : null;

  return (
    <div className="app">
      <div className="card-main">
        <header className="header">
          <h1 className="title">City Weather App</h1>
          <p className="subtitle">
            Search any city and get current weather + 3-day forecast
          </p>
        </header>

        <form className="form" onSubmit={fetchWeather}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter a city (e.g. Jounieh)"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </form>

        <div className="actions-row">
          <button
            className="secondary-btn"
            onClick={toggleHistory}
            type="button"
            disabled={loadingHistory}
          >
            {loadingHistory
              ? "Loading history..."
              : showHistory
              ? "Hide history"
              : "View history"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="results">
            <section className="current">
              <h2 className="place">
                {weather.city}, {weather.country}
              </h2>

              <div className="current-main">
                <span className="icon">{currentInfo.icon}</span>
                <span className="temp">
                  {Math.round(weather.current.temperature)}°C
                </span>
              </div>

              <p className="desc">{currentInfo.text}</p>

              <p className="meta">
                Wind: {weather.current.windspeed} km/h
                <span className="dot">•</span>
                Time:{" "}
                {new Date(weather.current.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </section>

            <section className="forecast">
              <h3>Next days</h3>
              <div className="forecast-grid">
                {weather.forecast.map((day) => {
                  const info = getWeatherInfo(day.weathercode);
                  return (
                    <div className="forecast-card" key={day.date}>
                      <p className="forecast-date">{formatDate(day.date)}</p>
                      <div className="forecast-icon">{info.icon}</div>
                      <p className="forecast-desc">{info.text}</p>
                      <p className="forecast-temp">
                        {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {showHistory && (
          <section className="history">
            <h3 className="history-title">Recent searches</h3>

            {history.length === 0 ? (
              <p className="history-empty">No searches yet.</p>
            ) : (
              <div className="history-list">
                {history.map((item, idx) => (
                  <div className="history-item" key={`${item.created_at}-${idx}`}>
                    <div className="history-left">
                      <div className="history-city">
                        {item.city}
                        {item.country ? `, ${item.country}` : ""}
                      </div>
                      <div className="history-time">
                        {formatDateTime(item.created_at)}
                      </div>
                    </div>
                    <div className="history-temp">
                      {Math.round(item.temperature)}°C
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
