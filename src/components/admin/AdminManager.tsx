import { useState, type FormEvent } from "react";
import { SUPER_ADMIN, useField } from "../../state/FieldContext";
import { Field, Status, SubmitButton, controlClass } from "./fields";

export function AdminManager() {
  const { admins, addAdmin } = useField();
  const [name, setName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = addAdmin({ name, matricula, password });
    if (message) {
      setError(message);
      setSaved("");
      return;
    }
    setSaved(`Matrícula ${matricula.trim()} pode entrar no painel.`);
    setError("");
    setName("");
    setMatricula("");
    setPassword("");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Administradores ativos da DETEC</caption>
          <thead className="text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-3 py-3 font-bold">Nome</th>
              <th className="px-3 py-3 font-bold">Matrícula</th>
              <th className="px-3 py-3 font-bold">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-leaf-100">
                <td className="px-3 py-3 font-bold text-ink-900">{admin.name}</td>
                <td className="px-3 py-3 text-ink-700">{admin.matricula}</td>
                <td className="px-3 py-3 text-xs font-extrabold uppercase text-leaf-800">
                  {admin.matricula === SUPER_ADMIN.matricula ? "Super admin" : "Equipe"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        <h2 className="text-base font-extrabold text-ink-900">Nova matrícula</h2>
        <Field label="Nome" htmlFor="admin-name">
          <input id="admin-name" className={controlClass} value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Matrícula" htmlFor="admin-matricula">
          <input
            id="admin-matricula"
            className={controlClass}
            value={matricula}
            onChange={(event) => setMatricula(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </Field>
        <Field label="Senha" htmlFor="admin-password" hint="A pessoa entra com esta senha. Ela não vê esta aba.">
          <input
            id="admin-password"
            className={controlClass}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </Field>
        {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
        {saved ? <Status>{saved}</Status> : null}
        <SubmitButton>Cadastrar administrador</SubmitButton>
      </form>
    </div>
  );
}
