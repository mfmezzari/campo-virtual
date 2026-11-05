import { Droplets, Thermometer } from "lucide-react";
import { liveCameras, stationWeather } from "../data/mock";
import { formatDecimal, formatTime } from "../lib/format";
import { FieldImage } from "./FieldImage";
import { RainChip } from "./WeatherChips";

export function LiveView() {
  const active = liveCameras[0];

  return (
    <section aria-label="Transmissão ao vivo" className="space-y-5 py-5">
      <div>
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Ao vivo</h1>
        <p className="text-sm text-ink-500">Prévia simulada das câmeras do talhão, com a estação meteorológica.</p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-ink-900 border border-slate-200/80 shadow-sm">
        <FieldImage
          src={active.image}
          alt=""
          className="live-zoom aspect-video w-full object-cover opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-ink-900/30" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white">
          <span className="pulse-dot h-2 w-2 rounded-full bg-white" />
          AO VIVO
        </div>
        <p className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[11px] font-bold text-white">
          Sinal simulado
        </p>
        <div className="absolute inset-x-3 bottom-3">
          <p className="mb-2 text-sm font-semibold text-white">{active.label}</p>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/45 p-2 backdrop-blur-sm">
            <div className="text-center text-white">
              <Thermometer aria-hidden="true" className="mx-auto h-4 w-4" />
              <p className="mt-1 text-sm font-semibold">{stationWeather.temperatureC}°C</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">Temperatura</p>
            </div>
            <RainChip millimeters={stationWeather.rainTodayMm} />
            <div className="text-center text-white">
              <Droplets aria-hidden="true" className="mx-auto h-4 w-4" />
              <p className="mt-1 text-sm font-semibold">{stationWeather.humidityPct}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">Umidade</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-ink-500">
        {stationWeather.station} · atualizado às {formatTime(stationWeather.updatedAt)} · vento{" "}
        {formatDecimal(stationWeather.windKmh, 0)} km/h
      </p>
      <p className="text-sm text-ink-700">{active.description}</p>
    </section>
  );
}
