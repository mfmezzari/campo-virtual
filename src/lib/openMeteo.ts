import type { ClimaAgora, ClimaDia, ClimaHistorico, ForecastCondition } from "../types";
import { climaAtual } from "../data/mock";

/** Sede de São Domingos, Santa Catarina. */
export const SAO_DOMINGOS_SC = {
  latitude: -26.5547,
  longitude: -52.5314,
  label: "São Domingos, SC",
};

export interface ClimaSerie {
  now: ClimaAgora;
  days: ClimaDia[];
}

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    relative_humidity_2m_mean?: number[];
  };
}

export function conditionFromCode(code: number): ForecastCondition {
  if (code === 0) return "sol";
  if (code <= 2) return "parcial";
  if (code === 3 || code === 45 || code === 48) return "nublado";
  return "chuva";
}

export function conditionLabel(condition: ForecastCondition) {
  if (condition === "sol") return "Sol";
  if (condition === "parcial") return "Parcialmente nublado";
  if (condition === "nublado") return "Nublado";
  return "Chuva";
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

export function localClimaFallback(): ClimaSerie {
  const today = climaAtual.recordedAt.slice(0, 10);
  const past: ClimaDia[] = [
    { date: "2026-10-28", precipitationMm: 0, tempMinC: 14, tempMaxC: 24, humidityPct: 72, condition: "sol" },
    { date: "2026-10-29", precipitationMm: 4, tempMinC: 15, tempMaxC: 22, humidityPct: 81, condition: "chuva" },
    { date: "2026-10-30", precipitationMm: 1, tempMinC: 14, tempMaxC: 23, humidityPct: 76, condition: "parcial" },
    { date: "2026-10-31", precipitationMm: 0, tempMinC: 13, tempMaxC: 25, humidityPct: 68, condition: "sol" },
    { date: "2026-11-01", precipitationMm: 8, tempMinC: 16, tempMaxC: 21, humidityPct: 88, condition: "chuva" },
    { date: "2026-11-02", precipitationMm: 2, tempMinC: 15, tempMaxC: 22, humidityPct: 80, condition: "nublado" },
  ];
  const todayPoint: ClimaDia = {
    date: today,
    precipitationMm: climaAtual.rainTodayMm,
    tempMinC: 16,
    tempMaxC: climaAtual.temperatureC,
    humidityPct: climaAtual.humidityPct,
    condition: "parcial",
  };
  const forecast: ClimaDia[] = climaAtual.forecast.map((day) => ({
    date: day.date,
    precipitationMm: day.rainMm,
    tempMinC: day.tempMinC,
    tempMaxC: day.tempMaxC,
    humidityPct: day.condition === "chuva" ? 86 : day.condition === "nublado" ? 78 : 70,
    condition: day.condition,
  }));
  return {
    now: {
      temperatureC: climaAtual.temperatureC,
      humidityPct: climaAtual.humidityPct,
      windKmh: climaAtual.windKmh,
      rainTodayMm: climaAtual.rainTodayMm,
      condition: "parcial",
      observedAt: climaAtual.recordedAt,
      source: "local",
    },
    days: [...past, todayPoint, ...forecast],
  };
}

function parseOpenMeteo(payload: OpenMeteoResponse): ClimaSerie | null {
  const current = payload.current;
  const daily = payload.daily;
  if (!current || !daily?.time?.length) return null;
  const days: ClimaDia[] = daily.time.map((date, index) => ({
    date,
    precipitationMm: round1(daily.precipitation_sum?.[index] ?? 0),
    tempMinC: round1(daily.temperature_2m_min?.[index] ?? 0),
    tempMaxC: round1(daily.temperature_2m_max?.[index] ?? 0),
    humidityPct: Math.round(daily.relative_humidity_2m_mean?.[index] ?? 0),
    condition: conditionFromCode(daily.weather_code?.[index] ?? 1),
  }));
  const today = (current.time ?? "").slice(0, 10);
  const todayPoint = days.find((day) => day.date === today);
  return {
    now: {
      temperatureC: round1(current.temperature_2m ?? 0),
      humidityPct: Math.round(current.relative_humidity_2m ?? 0),
      windKmh: round1(current.wind_speed_10m ?? 0),
      rainTodayMm: todayPoint?.precipitationMm ?? round1(current.precipitation ?? 0),
      condition: conditionFromCode(current.weather_code ?? 1),
      observedAt: current.time ?? new Date().toISOString(),
      source: "open-meteo",
    },
    days,
  };
}

export async function fetchSaoDomingosWeather(signal?: AbortSignal): Promise<ClimaSerie> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(SAO_DOMINGOS_SC.latitude));
  url.searchParams.set("longitude", String(SAO_DOMINGOS_SC.longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean",
  );
  url.searchParams.set("timezone", "America/Sao_Paulo");
  url.searchParams.set("past_days", "7");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "kmh");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Open-Meteo indisponível");
  const payload = (await response.json()) as OpenMeteoResponse;
  const parsed = parseOpenMeteo(payload);
  if (!parsed) throw new Error("Resposta de clima incompleta");
  return parsed;
}

export function mergeClimaDays(days: ClimaDia[], overrides: ClimaHistorico[]) {
  const byDate = new Map(days.map((day) => [day.date, { ...day, fromDetec: false }]));
  for (const item of overrides) {
    const previous = byDate.get(item.date);
    byDate.set(item.date, {
      date: item.date,
      precipitationMm: item.precipitationMm,
      tempMinC: item.tempMinC,
      tempMaxC: item.tempMaxC,
      humidityPct: item.humidityPct,
      condition: previous?.condition ?? "parcial",
      fromDetec: true,
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
