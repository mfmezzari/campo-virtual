import { useState, type FormEvent } from "react";
import { formatDate } from "../../lib/format";
import { useField } from "../../state/FieldContext";
import { Field, Status, SubmitButton, controlClass } from "./fields";

export function ClimaHistoricoForm() {
  const { climaHistorico, saveClimaHistorico, removeClimaHistorico } = useField();
  const [date, setDate] = useState("2026-11-03");
  const [precipitation, setPrecipitation] = useState("");
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [humidity, setHumidity] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = saveClimaHistorico({
      date,
      precipitationMm: Number(precipitation.replace(",", ".")),
      tempMinC: Number(tempMin.replace(",", ".")),
      tempMaxC: Number(tempMax.replace(",", ".")),
      humidityPct: Number(humidity.replace(",", ".")),
    });
    if (message) {
      setError(message);
      setSaved("");
      return;
    }
    setError("");
    setSaved(`Dia ${formatDate(date)} entrou no gráfico do produtor.`);
    setPrecipitation("");
    setTempMin("");
    setTempMax("");
    setHumidity("");
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {climaHistorico.map((item) => (
          <li key={item.id} className="rounded-3xl bg-white p-4 shadow-card">
            <p className="font-extrabold text-ink-900">{formatDate(item.date)}</p>
            <p className="mt-1 text-sm text-ink-700">
              {item.precipitationMm} mm · mín. {item.tempMinC}°C · máx. {item.tempMaxC}°C · {item.humidityPct}%
            </p>
            <button
              type="button"
              onClick={() => removeClimaHistorico(item.id)}
              className="mt-3 min-h-11 rounded-2xl bg-rose-50 px-3 text-sm font-extrabold text-rose-700"
            >
              Remover do gráfico
            </button>
          </li>
        ))}
      </ul>
      <form className="space-y-3" onSubmit={onSubmit}>
        <h3 className="text-base font-extrabold text-ink-900">Novo dia</h3>
        <Field label="Data" htmlFor="clima-data">
          <input id="clima-data" className={controlClass} type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Precipitação (mm)" htmlFor="clima-chuva">
            <input id="clima-chuva" className={controlClass} value={precipitation} onChange={(event) => setPrecipitation(event.target.value)} inputMode="decimal" required />
          </Field>
          <Field label="Umidade (%)" htmlFor="clima-umidade">
            <input id="clima-umidade" className={controlClass} value={humidity} onChange={(event) => setHumidity(event.target.value)} inputMode="decimal" required />
          </Field>
          <Field label="Temp. mínima (°C)" htmlFor="clima-min">
            <input id="clima-min" className={controlClass} value={tempMin} onChange={(event) => setTempMin(event.target.value)} inputMode="decimal" required />
          </Field>
          <Field label="Temp. máxima (°C)" htmlFor="clima-max">
            <input id="clima-max" className={controlClass} value={tempMax} onChange={(event) => setTempMax(event.target.value)} inputMode="decimal" required />
          </Field>
        </div>
        {error ? (
          <p className="text-sm font-semibold text-orange-700" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? <Status>{saved}</Status> : null}
        <SubmitButton>Incluir no histórico</SubmitButton>
      </form>
    </div>
  );
}
