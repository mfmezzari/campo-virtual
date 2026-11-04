import { useMemo, useState, type FormEvent } from "react";
import type { Culture } from "../../types";
import { phenologyStages } from "../../data/mock";
import { useField } from "../../state/FieldContext";
import { Field, Status, SubmitButton, controlClass } from "./fields";

const cultures: Culture[] = ["soja", "milho"];

export function ManejoForm() {
  const { addApplication, stageCode } = useField();
  const [culture, setCulture] = useState<Culture>("soja");
  const [target, setTarget] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [dose, setDose] = useState("");
  const [volume, setVolume] = useState("100");
  const [temperature, setTemperature] = useState("26");
  const [humidity, setHumidity] = useState("65");
  const [wind, setWind] = useState("8");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const stages = useMemo(
    () => phenologyStages.filter((stage) => stage.culture === culture),
    [culture],
  );
  const [stageLabel, setStageLabel] = useState(stageCode("soja"));

  function onCulture(next: Culture) {
    setCulture(next);
    setStageLabel(stageCode(next));
    setSaved(false);
  }

  function parseMetric(value: string) {
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const temperatureC = parseMetric(temperature);
    const humidityPct = parseMetric(humidity);
    const windKmh = parseMetric(wind);
    const doseGramsPerHa = parseMetric(dose);
    const sprayVolumeLPerHa = volume.trim() === "" ? null : parseMetric(volume);
    if (temperatureC === null || humidityPct === null || windKmh === null) {
      setError("Preencha temperatura, umidade e vento com números.");
      setSaved(false);
      return;
    }
    if (doseGramsPerHa === null || doseGramsPerHa <= 0) {
      setError("A dose precisa ser um número de gramas por hectare maior que zero.");
      setSaved(false);
      return;
    }
    if (volume.trim() !== "" && (sprayVolumeLPerHa === null || sprayVolumeLPerHa < 0)) {
      setError("O volume de calda precisa ser um número de litros por hectare.");
      setSaved(false);
      return;
    }
    addApplication({
      culture,
      target,
      activeIngredient,
      doseGramsPerHa,
      sprayVolumeLPerHa,
      stageLabel,
      weather: { temperatureC, humidityPct, windKmh },
      note,
    });
    setTarget("");
    setActiveIngredient("");
    setDose("");
    setNote("");
    setError("");
    setSaved(true);
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Field label="Parcela" htmlFor="manejo-plot">
        <select
          id="manejo-plot"
          className={controlClass}
          value={culture}
          onChange={(event) => onCulture(event.target.value as Culture)}
        >
          {cultures.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Alvo / objetivo" htmlFor="manejo-target">
        <input
          id="manejo-target"
          className={controlClass}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="Controle de lagarta / percevejo"
          required
        />
      </Field>
      <Field label="Princípio ativo" htmlFor="manejo-ingredient">
        <input
          id="manejo-ingredient"
          className={controlClass}
          value={activeIngredient}
          onChange={(event) => setActiveIngredient(event.target.value)}
          placeholder="Tiametoxam + Lambda-Cialotrina"
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Dose (g/ha)" htmlFor="manejo-dose" hint="Só o número, em gramas.">
          <input
            id="manejo-dose"
            className={controlClass}
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            placeholder="150"
            inputMode="decimal"
            required
          />
        </Field>
        <Field label="Volume de calda (L/ha)" htmlFor="manejo-volume" hint="Vazio se for a lanço.">
          <input
            id="manejo-volume"
            className={controlClass}
            value={volume}
            onChange={(event) => setVolume(event.target.value)}
            placeholder="100"
            inputMode="decimal"
          />
        </Field>
      </div>
      <Field label="Estádio fenológico" htmlFor="manejo-stage">
        <select id="manejo-stage" className={controlClass} value={stageLabel} onChange={(event) => setStageLabel(event.target.value)}>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.code}>
              {stage.code} · {stage.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Temp. °C" htmlFor="manejo-temp">
          <input id="manejo-temp" className={controlClass} value={temperature} onChange={(event) => setTemperature(event.target.value)} inputMode="decimal" required />
        </Field>
        <Field label="Umidade %" htmlFor="manejo-humidity">
          <input id="manejo-humidity" className={controlClass} value={humidity} onChange={(event) => setHumidity(event.target.value)} inputMode="decimal" required />
        </Field>
        <Field label="Vento km/h" htmlFor="manejo-wind">
          <input id="manejo-wind" className={controlClass} value={wind} onChange={(event) => setWind(event.target.value)} inputMode="decimal" required />
        </Field>
      </div>
      <Field label="Observação" htmlFor="manejo-note">
        <textarea id="manejo-note" className={`${controlClass} min-h-20 py-3`} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
      {saved ? <Status>Manejo registrado. O histórico do produtor já foi atualizado.</Status> : null}
      <SubmitButton>Registrar manejo</SubmitButton>
    </form>
  );
}
