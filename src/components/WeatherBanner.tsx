"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { dayLabel, type WeatherForecast } from "@/lib/weather";

const COORDS_KEY = "rebuild-weather-coords";

type StoredCoords = {
  lat: number;
  lon: number;
  label: string;
};

function readStoredCoords(): StoredCoords | null {
  try {
    const raw = localStorage.getItem(COORDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCoords;
    if (
      typeof parsed.lat === "number" &&
      typeof parsed.lon === "number" &&
      typeof parsed.label === "string"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storeCoords(coords: StoredCoords) {
  try {
    localStorage.setItem(COORDS_KEY, JSON.stringify(coords));
  } catch {
    /* ignore */
  }
}

export function WeatherBanner() {
  const { state, today } = useApp();
  const timezone = state.profile?.timezone ?? "America/Los_Angeles";
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [todayKey, setTodayKey] = useState(today);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load(lat?: number, lon?: number, label?: string) {
      const qs = new URLSearchParams();
      if (lat != null && lon != null) {
        qs.set("lat", String(lat));
        qs.set("lon", String(lon));
        if (label) qs.set("label", label);
      }
      const res = await fetch(`/api/weather?${qs.toString()}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Weather unavailable");
        return;
      }
      setForecast({ locationLabel: data.locationLabel, days: data.days });
      setTodayKey(data.today ?? today);
      setError("");
    }

    function requestForecast(coords?: StoredCoords) {
      if (coords) {
        void load(coords.lat, coords.lon, coords.label);
        return;
      }
      void load();
    }

    const stored = readStoredCoords();
    if (stored) {
      requestForecast(stored);
    } else if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: StoredCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: "Near you",
          };
          storeCoords(coords);
          requestForecast(coords);
        },
        () => requestForecast(),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
      );
    } else {
      requestForecast();
    }

    return () => {
      cancelled = true;
    };
  }, [timezone, today]);

  if (error && !forecast) {
    return (
      <section className="weather-banner weather-banner-muted" aria-label="Weather">
        <p className="tiny muted">{error}</p>
      </section>
    );
  }

  if (!forecast) {
    return (
      <section className="weather-banner weather-banner-loading" aria-label="Weather">
        <p className="tiny muted">Loading forecast…</p>
      </section>
    );
  }

  return (
    <section className="weather-banner" aria-label="5-day weather forecast">
      <div className="weather-banner-head">
        <p className="weather-banner-kicker">{forecast.locationLabel}</p>
        <p className="tiny weather-banner-sub">5-day forecast</p>
      </div>
      <div className="weather-banner-days">
        {forecast.days.map((day) => (
          <div key={day.date} className="weather-day">
            <span className="weather-day-name">{dayLabel(day.date, todayKey)}</span>
            <span className="weather-day-icon" aria-hidden>
              {day.icon}
            </span>
            <span className="weather-day-temps">
              <span className="weather-high">{day.highF}°</span>
              <span className="weather-low">{day.lowF}°</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
