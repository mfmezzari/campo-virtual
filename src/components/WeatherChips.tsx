import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import type { WeatherSnapshot } from "../types";

export function WeatherChips({ temperatureC, humidityPct, windKmh }: WeatherSnapshot) {
  const items = [
    { icon: Thermometer, label: "Temperatura", value: `${temperatureC}°C` },
    { icon: Droplets, label: "Umidade", value: `${humidityPct}%` },
    { icon: Wind, label: "Vento", value: `${windKmh} km/h` },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-leaf-50 px-2 py-2 text-center">
          <item.icon aria-hidden="true" className="mx-auto h-4 w-4 text-leaf-700" />
          <p className="mt-1 text-sm font-extrabold text-ink-900">{item.value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function RainChip({ millimeters }: { millimeters: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-2 text-center text-white">
      <CloudRain aria-hidden="true" className="mx-auto h-4 w-4" />
      <p className="mt-1 text-sm font-extrabold">
        {new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(millimeters)} mm
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">Chuva do dia</p>
    </div>
  );
}
