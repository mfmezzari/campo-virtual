import { useEffect, useMemo, useState } from "react";
import { Camera, Droplets, Thermometer } from "lucide-react";
import type { CultureFilter } from "../types";
import { liveCameras, stationWeather } from "../data/mock";
import { cx, formatDecimal, formatTime } from "../lib/format";
import { FieldImage } from "./FieldImage";
import { RainChip } from "./WeatherChips";

interface LiveViewProps {
  culture: CultureFilter;
}

export function LiveView({ culture }: LiveViewProps) {
  const cameras = useMemo(
    () =>
      liveCameras.filter(
        (camera) => culture === "todas" || camera.culture === "geral" || camera.culture === culture,
      ),
    [culture],
  );
  const [cameraId, setCameraId] = useState(cameras[0]?.id ?? liveCameras[0].id);

  useEffect(() => {
    if (!cameras.some((camera) => camera.id === cameraId)) {
      setCameraId(cameras[0]?.id ?? liveCameras[0].id);
    }
  }, [cameras, cameraId]);

  const active = cameras.find((camera) => camera.id === cameraId) ?? cameras[0];

  return (
    <section aria-label="Transmissão ao vivo" className="space-y-3 py-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Ao vivo</h1>
        <p className="text-sm text-ink-500">Prévia simulada das câmeras do talhão, com a estação meteorológica.</p>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] bg-ink-900 shadow-card">
        <FieldImage
          src={active.image}
          alt=""
          className="live-zoom aspect-video w-full object-cover opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-ink-900/30" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-extrabold text-white">
          <span className="pulse-dot h-2 w-2 rounded-full bg-white" />
          AO VIVO
        </div>
        <p className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[11px] font-bold text-white">
          Sinal simulado
        </p>
        <div className="absolute inset-x-3 bottom-3">
          <p className="mb-2 text-sm font-extrabold text-white">{active.label}</p>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/45 p-2 backdrop-blur-sm">
            <div className="text-center text-white">
              <Thermometer aria-hidden="true" className="mx-auto h-4 w-4" />
              <p className="mt-1 text-sm font-extrabold">{stationWeather.temperatureC}°C</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">Temperatura</p>
            </div>
            <RainChip millimeters={stationWeather.rainTodayMm} />
            <div className="text-center text-white">
              <Droplets aria-hidden="true" className="mx-auto h-4 w-4" />
              <p className="mt-1 text-sm font-extrabold">{stationWeather.humidityPct}%</p>
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

      <div>
        <h2 className="mb-2 text-sm font-extrabold text-ink-900">Ângulos de câmera</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cameras.map((camera) => {
            const selected = camera.id === active.id;
            return (
              <button
                key={camera.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCameraId(camera.id)}
                className={cx(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-extrabold",
                  selected ? "bg-leaf-700 text-white" : "bg-white text-ink-700",
                )}
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                {camera.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
