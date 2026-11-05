import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { CultureFilter, ParcelaCroqui } from "../types";
import { CROQUI_CENTER, croquiTitle } from "../data/croquiParcelas";
import { cx } from "../lib/format";
import { applyParcelasRemotas, fetchParcelasCroqui } from "../lib/parcelasCroqui";
import { CampoMap } from "./CampoMap";

interface CroquiTabProps {
  parcelas: ParcelaCroqui[];
  culture: CultureFilter;
}

const CENTRO_DO_CAMPO = CROQUI_CENTER;

export function CroquiTab({ parcelas, culture }: CroquiTabProps) {
  const [remote, setRemote] = useState<ParcelaCroqui[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = applyParcelasRemotas(parcelas, remote);
  const selected = shown.find((item) => item.id === selectedId) ?? null;
  const frame = selected ? document.querySelector("[data-phone-frame]") : null;

  useEffect(() => {
    let active = true;
    fetchParcelasCroqui().then((rows) => {
      if (active) setRemote(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  function openParcela(id: string) {
    setSelectedId(id);
    fetchParcelasCroqui().then((rows) => {
      if (rows) setRemote(rows);
    });
  }

  return (
    <section aria-label="Croqui do dia de campo" className="space-y-5 py-5">
      <div>
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Croqui do campo</h1>
        <p className="text-sm text-ink-500">
          Soja à esquerda, em verde. Milho à direita, em laranja, com duas parcelas por obtentor. Toque na área para abrir a ficha.
        </p>
      </div>
      <CampoMap
        parcelas={shown}
        culture={culture}
        selectedId={selectedId}
        center={CENTRO_DO_CAMPO}
        zoom={18}
        onSelect={openParcela}
      />
      <ul className="sr-only">
        {shown.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => openParcela(item.id)}>
              {croquiTitle(item)}
            </button>
          </li>
        ))}
      </ul>
      {selected && frame
        ? createPortal(<CroquiDialog parcela={selected} onClose={() => setSelectedId(null)} />, frame)
        : null}
    </section>
  );
}

function CroquiDialog({ parcela, onClose }: { parcela: ParcelaCroqui; onClose: () => void }) {
  const soja = parcela.cultura === "soja";
  return (
    <div className="absolute inset-0 z-40 flex items-end">
      <button type="button" aria-label="Fechar ficha" className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="croqui-titulo"
        className="sheet-enter relative max-h-[86%] w-full overflow-y-auto rounded-t-2xl bg-white px-4 pb-6 pt-3 shadow-frame"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <span
            className={cx(
              "mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              soja ? "bg-leaf-100 text-leaf-800" : "bg-sun-100 text-sun-700",
            )}
          >
            {soja ? "Soja" : "Milho"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center gap-1 rounded-2xl bg-leaf-50 px-3 text-sm font-semibold text-leaf-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Fechar
          </button>
        </div>
        <h2 id="croqui-titulo" className="text-xl font-semibold leading-tight text-ink-900">
          {croquiTitle(parcela)}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{parcela.descricaoTecnica}</p>
      </div>
    </div>
  );
}
