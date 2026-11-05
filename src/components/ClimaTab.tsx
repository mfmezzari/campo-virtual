import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ClimaMetric, ForecastCondition } from "../types";
import { useField } from "../state/FieldContext";
import { cx, formatDate, formatDecimal, formatTime } from "../lib/format";
import {
  conditionLabel,
  fetchSaoDomingosWeather,
  localClimaFallback,
  mergeClimaDays,
  SAO_DOMINGOS_SC,
  type ClimaSerie,
} from "../lib/openMeteo";

const conditionMeta: Record<ForecastCondition, { icon: LucideIcon }> = {
  sol: { icon: Sun },
  parcial: { icon: CloudSun },
  nublado: { icon: Cloud },
  chuva: { icon: CloudRain },
};

const metrics: Array<{ id: ClimaMetric; label: string; unit: string; color: string }> = [
  { id: "precipitacao", label: "Precipitação", unit: "mm", color: "#215838" },
  { id: "tempMin", label: "Temperatura mínima", unit: "°C", color: "#3b8d58" },
  { id: "tempMax", label: "Temperatura máxima", unit: "°C", color: "#e09a16" },
  { id: "umidade", label: "Umidade relativa", unit: "%", color: "#173d28" },
];

interface ClimaTabProps {
  sojaStage: string;
  milhoStage: string;
  onOpenPhenology: () => void;
}

function axisDay(iso: string) {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

function metricValue(metric: ClimaMetric, point: { precipitationMm: number; tempMinC: number; tempMaxC: number; humidityPct: number }) {
  if (metric === "precipitacao") return point.precipitationMm;
  if (metric === "tempMin") return point.tempMinC;
  if (metric === "tempMax") return point.tempMaxC;
  return point.humidityPct;
}

export function ClimaTab({ sojaStage, milhoStage, onOpenPhenology }: ClimaTabProps) {
  const { climaHistorico } = useField();
  const [serie, setSerie] = useState<ClimaSerie>(() => localClimaFallback());
  const [metric, setMetric] = useState<ClimaMetric>("precipitacao");
  const selected = metrics.find((item) => item.id === metric) ?? metrics[0];
  const ConditionIcon = conditionMeta[serie.now.condition].icon;

  useEffect(() => {
    const controller = new AbortController();
    fetchSaoDomingosWeather(controller.signal)
      .then((next) => setSerie(next))
      .catch(() => {
        if (!controller.signal.aborted) setSerie(localClimaFallback());
      });
    return () => controller.abort();
  }, []);

  const points = useMemo(() => mergeClimaDays(serie.days, climaHistorico), [serie.days, climaHistorico]);
  const chartData = points.map((point) => ({
    ...point,
    value: metricValue(metric, point),
  }));
  const liveChips = [
    { icon: Droplets, label: "Umidade", value: `${serie.now.humidityPct}%` },
    { icon: Wind, label: "Vento", value: `${formatDecimal(serie.now.windKmh, 0)} km/h` },
    { icon: CloudRain, label: "Chuva do dia", value: `${formatDecimal(serie.now.rainTodayMm)} mm` },
  ];

  return (
    <section aria-label="Clima da estação" className="space-y-5 py-5">
      <div>
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Clima</h1>
        <p className="text-sm text-ink-500">Estação Coamo · {SAO_DOMINGOS_SC.label}</p>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-leaf-700">Agora</p>
            <p className="mt-1 text-4xl font-semibold leading-none tracking-tight text-ink-900">{formatDecimal(serie.now.temperatureC, 0)}°C</p>
            <p className="mt-1 text-sm text-ink-500">{conditionLabel(serie.now.condition)}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-leaf-50 text-leaf-800">
            <ConditionIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          {serie.now.source === "open-meteo" ? "Open-Meteo" : "Leitura local"} · atualizado às{" "}
          {formatTime(serie.now.observedAt)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {liveChips.map((item) => (
            <div key={item.label} className="rounded-lg bg-slate-50 px-2 py-2 text-center text-ink-900">
              <item.icon aria-hidden="true" className="mx-auto h-4 w-4 text-leaf-700" strokeWidth={1.75} />
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-ink-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-sm">
        <div className="px-1">
          <h2 className="text-sm font-semibold text-ink-900">Histórico e previsão</h2>
          <p className="text-xs text-ink-500">
            {selected.label} ({selected.unit}). Sete dias para trás e sete à frente.
          </p>
        </div>
        <div role="radiogroup" aria-label="Métrica do gráfico" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {metrics.map((item) => {
            const active = item.id === metric;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMetric(item.id)}
                className={cx(
                  "h-9 shrink-0 rounded-lg px-3 text-xs font-medium transition-all duration-150",
                  active ? "bg-leaf-800 text-white" : "bg-slate-50 text-ink-500 hover:text-ink-900",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metric === "precipitacao" ? (
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="date" tickFormatter={axisDay} tick={{ fontSize: 10, fill: "#78716c" }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "#78716c" }} width={36} unit=" mm" />
                <Tooltip
                  formatter={(value) => [`${formatDecimal(Number(value))} mm`, "Precipitação"]}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Bar dataKey="value" fill={selected.color} radius={[6, 6, 0, 0]} maxBarSize={16} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="date" tickFormatter={axisDay} tick={{ fontSize: 10, fill: "#78716c" }} interval={2} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#78716c" }}
                  width={36}
                  domain={metric === "umidade" ? [0, 100] : ["auto", "auto"]}
                  unit={metric === "umidade" ? "%" : "°"}
                />
                <Tooltip
                  formatter={(value) => [`${formatDecimal(Number(value), metric === "umidade" ? 0 : 1)} ${selected.unit}`, selected.label]}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Line type="monotone" dataKey="value" stroke={selected.color} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        {climaHistorico.length > 0 ? (
          <p className="px-1 text-xs text-ink-500">
            A DETEC substituiu {climaHistorico.length === 1 ? "1 dia" : `${climaHistorico.length} dias`} nesta série.
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenPhenology}
        className="w-full rounded-xl bg-white px-4 py-4 text-left border border-slate-200/80 shadow-sm"
      >
        <span className="block text-sm font-semibold text-ink-900">Estádios fenológicos</span>
        <span className="mt-0.5 block text-sm text-ink-500">
          Soja em {sojaStage} · Milho em {milhoStage}
        </span>
      </button>
    </section>
  );
}
