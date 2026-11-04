import { useState } from "react";
import type { Culture } from "../../types";
import { phenologyStages } from "../../data/mock";
import { useField } from "../../state/FieldContext";
import { SegmentedControl } from "../SegmentedControl";
import { Status, SubmitButton } from "./fields";
import { cx } from "../../lib/format";

export function PhenologyForm() {
  const { currentStageByCulture, setCurrentStage, stageCode } = useField();
  const [culture, setCulture] = useState<Culture>("soja");
  const [saved, setSaved] = useState(false);
  const stages = phenologyStages.filter((stage) => stage.culture === culture);
  const selected = currentStageByCulture[culture];

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <SegmentedControl
        label="Cultura do estádio"
        value={culture}
        onChange={(value) => {
          setCulture(value);
          setSaved(false);
        }}
        options={[
          { value: "soja", label: "Soja" },
          { value: "milho", label: "Milho" },
        ]}
      />
      <p className="text-sm text-ink-500">
        Produtores veem {culture === "soja" ? "soja" : "milho"} em{" "}
        <span className="font-extrabold text-ink-900">{stageCode(culture)}</span>. A troca vale na hora.
      </p>
      <fieldset className="space-y-2">
        <legend className="sr-only">Estádio atual</legend>
        {stages.map((stage) => {
          const active = stage.id === selected;
          return (
            <label
              key={stage.id}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3",
                active ? "border-leaf-700 bg-leaf-100" : "border-transparent bg-white",
              )}
            >
              <input
                type="radio"
                name="estadio"
                className="h-4 w-4 accent-leaf-700"
                checked={active}
                onChange={() => {
                  setCurrentStage(culture, stage.id);
                  setSaved(true);
                }}
              />
              <span>
                <span className="block text-sm font-extrabold text-ink-900">
                  {stage.code} · {stage.name}
                </span>
                <span className="block text-xs text-ink-500">{stage.observe}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
      {saved ? <Status>Estádio atualizado na área pública.</Status> : null}
      <SubmitButton>Manter este estádio</SubmitButton>
    </form>
  );
}
