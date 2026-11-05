import { useRef, useState, type FormEvent } from "react";
import type { Culture, GeoPoint, ParcelaCroqui } from "../../types";
import { croquiTitle } from "../../data/croquiParcelas";
import { useFieldGps } from "../../lib/fieldGps";
import { useField } from "../../state/FieldContext";
import { CampoMap } from "../CampoMap";
import { Field, SubmitButton, controlClass } from "./fields";

type DrawMode = { kind: "create" } | { kind: "limites"; id: string } | { kind: "descricao"; id: string };

export function CroquiManager() {
  const { parcelasCroqui, updateParcelaDescricao, updateParcelaGeometria, createParcela, removeParcela } = useField();
  const gps = useFieldGps();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DrawMode | null>(null);
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [cultura, setCultura] = useState<Culture>("soja");
  const [empresa, setEmpresa] = useState("");
  const [cultivar, setCultivar] = useState("");
  const [descricao, setDescricao] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const drawing = mode?.kind === "create" || mode?.kind === "limites";

  function focusMap() {
    mapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function startCreate() {
    setMode({ kind: "create" });
    setPoints([]);
    setCultura("soja");
    setEmpresa("");
    setCultivar("");
    setDescricao("");
    setError("");
    setMessage("");
    setPendingDelete(null);
    focusMap();
  }

  function startLimites(item: ParcelaCroqui) {
    setMode({ kind: "limites", id: item.id });
    setPoints(item.coordenadas);
    setDescricao(item.descricaoTecnica);
    setError("");
    setMessage("");
    focusMap();
  }

  function startDescricao(item: ParcelaCroqui) {
    setMode({ kind: "descricao", id: item.id });
    setDescricao(item.descricaoTecnica);
    setPoints([]);
    setError("");
    setMessage("");
  }

  function cancel() {
    setMode(null);
    setPoints([]);
    setError("");
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    const result = createParcela({
      cultura,
      empresa,
      cultivarHibrido: cultivar,
      descricaoTecnica: descricao,
      coordenadas: points,
    });
    if (result) {
      setError(result);
      setMessage("");
      return;
    }
    setMode(null);
    setPoints([]);
    setError("");
    setMessage("Parcela criada. Ela já aparece no mapa do produtor.");
  }

  function onLimites(event: FormEvent) {
    event.preventDefault();
    if (mode?.kind !== "limites") return;
    const result = updateParcelaGeometria(mode.id, points);
    if (result) {
      setError(result);
      setMessage("");
      return;
    }
    setMode(null);
    setPoints([]);
    setError("");
    setMessage("Limites atualizados no mapa.");
  }

  function onDescricao(event: FormEvent) {
    event.preventDefault();
    if (mode?.kind !== "descricao") return;
    const result = updateParcelaDescricao(mode.id, descricao);
    if (result) {
      setError(result);
      setMessage("");
      return;
    }
    setMode(null);
    setError("");
    setMessage("Descrição atualizada. A ficha já abre assim no croqui do produtor.");
  }

  return (
    <div className="space-y-4">
      {message ? <p className="rounded-2xl bg-leaf-100 px-3 py-3 text-sm font-semibold text-leaf-800">{message}</p> : null}
      <div ref={mapRef}>
        <CampoMap
          parcelas={parcelasCroqui}
          culture="todas"
          selectedId={mode && mode.kind !== "create" ? mode.id : null}
          draft={drawing ? points : undefined}
          onMapClick={drawing ? (point) => setPoints((current) => [...current, point]) : undefined}
        />
      </div>

      {mode?.kind === "create" ? (
        <form className="space-y-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-sm" onSubmit={onCreate}>
          <h3 className="font-semibold text-ink-900">Nova parcela</h3>
          <PointTools
            count={points.length}
            onUndo={() => setPoints((current) => current.slice(0, -1))}
            onClear={() => setPoints([])}
            onGps={() => {
              const point = gps.point;
              if (!point) {
                setError("Ainda não há uma posição do GPS para marcar.");
                return;
              }
              setPoints((current) => [...current, point]);
              setError("");
            }}
          />
          <Field label="Cultura" htmlFor="croqui-cultura">
            <select id="croqui-cultura" className={controlClass} value={cultura} onChange={(event) => setCultura(event.target.value as Culture)}>
              <option value="soja">soja</option>
              <option value="milho">milho</option>
            </select>
          </Field>
          <Field label="Empresa" htmlFor="croqui-empresa">
            <input id="croqui-empresa" className={controlClass} value={empresa} maxLength={50} onChange={(event) => setEmpresa(event.target.value)} required />
          </Field>
          <Field label="Cultivar ou híbrido" htmlFor="croqui-cultivar">
            <input id="croqui-cultivar" className={controlClass} value={cultivar} maxLength={50} onChange={(event) => setCultivar(event.target.value)} required />
          </Field>
          <Field label="Descrição técnica" htmlFor="croqui-descricao">
            <textarea id="croqui-descricao" className={`${controlClass} min-h-32 py-3`} value={descricao} onChange={(event) => setDescricao(event.target.value)} required />
          </Field>
          {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
          <SubmitButton>Salvar parcela</SubmitButton>
          <button type="button" onClick={cancel} className="min-h-11 w-full text-sm font-bold text-ink-500">
            Cancelar
          </button>
        </form>
      ) : mode?.kind === "limites" ? (
        <form className="space-y-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-sm" onSubmit={onLimites}>
          <h3 className="font-semibold text-ink-900">Atualizar limites</h3>
          <PointTools
            count={points.length}
            onUndo={() => setPoints((current) => current.slice(0, -1))}
            onClear={() => setPoints([])}
            onGps={() => {
              const point = gps.point;
              if (!point) {
                setError("Ainda não há uma posição do GPS para marcar.");
                return;
              }
              setPoints((current) => [...current, point]);
              setError("");
            }}
          />
          {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
          <SubmitButton>Salvar limites</SubmitButton>
          <button type="button" onClick={cancel} className="min-h-11 w-full text-sm font-bold text-ink-500">
            Cancelar
          </button>
        </form>
      ) : (
        <button type="button" onClick={startCreate} className="min-h-11 w-full rounded-2xl bg-leaf-700 text-sm font-semibold text-white">
          Nova parcela
        </button>
      )}

      <ParcelaGroup
        title="Cultivares de soja"
        items={parcelasCroqui.filter((item) => item.cultura === "soja")}
        mode={mode}
        descricao={descricao}
        error={error}
        pendingDelete={pendingDelete}
        onDescricao={setDescricao}
        onStartDescricao={startDescricao}
        onStartLimites={startLimites}
        onSaveDescricao={onDescricao}
        onCancel={cancel}
        onAskDelete={setPendingDelete}
        onDelete={(id) => {
          removeParcela(id);
          setPendingDelete(null);
          if (mode && mode.kind !== "create" && mode.id === id) cancel();
          setMessage("Parcela excluída do mapa.");
          setError("");
        }}
      />
      <ParcelaGroup
        title="Híbridos de milho"
        items={parcelasCroqui.filter((item) => item.cultura === "milho")}
        mode={mode}
        descricao={descricao}
        error={error}
        pendingDelete={pendingDelete}
        onDescricao={setDescricao}
        onStartDescricao={startDescricao}
        onStartLimites={startLimites}
        onSaveDescricao={onDescricao}
        onCancel={cancel}
        onAskDelete={setPendingDelete}
        onDelete={(id) => {
          removeParcela(id);
          setPendingDelete(null);
          if (mode && mode.kind !== "create" && mode.id === id) cancel();
          setMessage("Parcela excluída do mapa.");
          setError("");
        }}
      />
    </div>
  );
}

function PointTools({
  count,
  onUndo,
  onClear,
  onGps,
}: {
  count: number;
  onUndo: () => void;
  onClear: () => void;
  onGps: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-500">Toque no mapa para marcar os cantos do polígono. São necessários pelo menos 3 pontos.</p>
      <p className="text-sm font-semibold text-ink-900">{count} ponto{count === 1 ? "" : "s"} marcado{count === 1 ? "" : "s"}</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onUndo} className="h-11 rounded-2xl bg-leaf-50 text-sm font-semibold text-leaf-800">
          Desfazer ponto
        </button>
        <button type="button" onClick={onClear} className="h-11 rounded-2xl bg-leaf-50 text-sm font-semibold text-leaf-800">
          Limpar
        </button>
      </div>
      <button type="button" onClick={onGps} className="h-11 w-full rounded-2xl bg-leaf-50 text-sm font-semibold text-leaf-800">
        Marcar minha posição
      </button>
    </div>
  );
}

function ParcelaGroup({
  title,
  items,
  mode,
  descricao,
  error,
  pendingDelete,
  onDescricao,
  onStartDescricao,
  onStartLimites,
  onSaveDescricao,
  onCancel,
  onAskDelete,
  onDelete,
}: {
  title: string;
  items: ParcelaCroqui[];
  mode: DrawMode | null;
  descricao: string;
  error: string;
  pendingDelete: string | null;
  onDescricao: (value: string) => void;
  onStartDescricao: (item: ParcelaCroqui) => void;
  onStartLimites: (item: ParcelaCroqui) => void;
  onSaveDescricao: (event: FormEvent) => void;
  onCancel: () => void;
  onAskDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => {
          const editing = mode?.kind === "descricao" && mode.id === item.id;
          return (
            <li key={item.id} className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-sm">
              <p className="font-semibold text-ink-900">{croquiTitle(item)}</p>
              {editing ? (
                <form className="mt-2 space-y-2" onSubmit={onSaveDescricao}>
                  <label htmlFor={`croqui-${item.id}`} className="text-sm font-bold text-ink-900">
                    Descrição técnica
                  </label>
                  <textarea
                    id={`croqui-${item.id}`}
                    className={`${controlClass} min-h-40 py-3`}
                    value={descricao}
                    onChange={(event) => onDescricao(event.target.value)}
                    required
                  />
                  {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
                  <SubmitButton>Salvar descrição</SubmitButton>
                  <button type="button" onClick={onCancel} className="min-h-11 w-full text-sm font-bold text-ink-500">
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <p className="mt-1 line-clamp-3 text-sm text-ink-500">{item.descricaoTecnica}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onStartDescricao(item)} className="inline-flex h-10 items-center rounded-2xl bg-leaf-50 px-3 text-sm font-semibold text-leaf-800">
                      Editar descrição
                    </button>
                    <button type="button" onClick={() => onStartLimites(item)} className="inline-flex h-10 items-center rounded-2xl bg-leaf-50 px-3 text-sm font-semibold text-leaf-800">
                      Atualizar limites
                    </button>
                    {pendingDelete === item.id ? (
                      <button type="button" onClick={() => onDelete(item.id)} className="inline-flex h-10 items-center rounded-2xl bg-orange-100 px-3 text-sm font-semibold text-orange-800">
                        Confirmar exclusão
                      </button>
                    ) : (
                      <button type="button" onClick={() => onAskDelete(item.id)} className="inline-flex h-10 items-center rounded-2xl bg-leaf-50 px-3 text-sm font-semibold text-ink-700">
                        Excluir
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
