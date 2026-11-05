import { useState, type FormEvent } from "react";
import { AGRONOMO_CARGOS, type AgronomoContato } from "../../types";
import { formatWhatsapp } from "../../lib/whatsapp";
import { useField } from "../../state/FieldContext";
import { Field, Status, SubmitButton, controlClass } from "./fields";

const emptyForm: { nome: string; especialidade: string; whatsapp: string; ativo: boolean } = {
  nome: "",
  especialidade: AGRONOMO_CARGOS[0],
  whatsapp: "",
  ativo: true,
};

export function AgronomoManager() {
  const { agronomos, saveAgronomo, removeAgronomo } = useField();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function startEdit(contato: AgronomoContato) {
    setEditingId(contato.id);
    setForm({
      nome: contato.nome,
      especialidade: contato.especialidade,
      whatsapp: contato.whatsapp,
      ativo: contato.ativo,
    });
    setError("");
    setSaved("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = saveAgronomo({
      id: editingId ?? undefined,
      nome: form.nome,
      especialidade: form.especialidade,
      whatsapp: form.whatsapp,
      ativo: form.ativo,
    });
    if (message) {
      setError(message);
      setSaved("");
      return;
    }
    setSaved(editingId ? "Contato atualizado. O feed já usa esta lista." : "Contato disponível no feed dos produtores.");
    setError("");
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {agronomos.map((contato) => (
          <li key={contato.id} className="rounded-xl bg-white p-4 border border-slate-200/80 shadow-sm">
            <p className="font-semibold text-ink-900">{contato.nome}</p>
            <p className="text-sm text-ink-700">{contato.especialidade}</p>
            <p className="mt-1 text-sm font-semibold text-ink-500">{formatWhatsapp(contato.whatsapp)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf-800">
              {contato.ativo ? "Ativo no feed" : "Oculto no feed"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => startEdit(contato)}
                className="min-h-11 rounded-2xl bg-leaf-50 text-sm font-semibold text-leaf-800"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  removeAgronomo(contato.id);
                  if (editingId === contato.id) cancelEdit();
                  setSaved("Contato removido.");
                  setError("");
                }}
                className="min-h-11 rounded-2xl bg-rose-50 text-sm font-semibold text-rose-700"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="space-y-3" onSubmit={onSubmit}>
        <h3 className="text-base font-semibold text-ink-900">
          {editingId ? "Editar contato" : "Novo contato"}
        </h3>
        <Field label="Nome" htmlFor="agro-nome">
          <input
            id="agro-nome"
            className={controlClass}
            value={form.nome}
            onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
            required
          />
        </Field>
        <Field label="Cargo / Especialidade" htmlFor="agro-cargo">
          <select
            id="agro-cargo"
            className={controlClass}
            value={form.especialidade}
            onChange={(event) => setForm((current) => ({ ...current, especialidade: event.target.value }))}
            required
          >
            {AGRONOMO_CARGOS.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </Field>
        <Field label="WhatsApp" htmlFor="agro-whatsapp" hint="DDI 55, DDD e número, só dígitos. Ex.: 5549999999999">
          <input
            id="agro-whatsapp"
            className={controlClass}
            value={form.whatsapp}
            onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm font-bold text-ink-900">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
            className="h-4 w-4 accent-leaf-700"
          />
          Ativo para os produtores
        </label>
        {error ? (
          <p className="text-sm font-semibold text-orange-700" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? <Status>{saved}</Status> : null}
        <SubmitButton>{editingId ? "Salvar alterações" : "Cadastrar contato"}</SubmitButton>
        {editingId ? (
          <button type="button" onClick={cancelEdit} className="min-h-11 w-full text-sm font-bold text-ink-500">
            Cancelar edição
          </button>
        ) : null}
      </form>
      {agronomos.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhum agrônomo cadastrado. O botão do feed avisa o produtor.</p>
      ) : null}
    </div>
  );
}
