import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useField } from "../state/FieldContext";
import { PhoneFrame } from "../components/PhoneFrame";
import { Field, controlClass } from "../components/admin/fields";

export function LoginPage() {
  const { session, login } = useField();
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (session) return <Navigate to="/admin" replace />;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = login(matricula, password);
    if (message) {
      setError(message);
      return;
    }
    navigate("/admin", { replace: true });
  }

  return (
    <PhoneFrame>
      <main className="flex flex-1 flex-col justify-center px-5 py-8">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-3xl bg-leaf-800 text-white">
          <LockKeyhole aria-hidden="true" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900">Área DETEC</h1>
        <p className="mt-1 text-sm text-ink-500">
          Acesso da equipe técnica. A simulação fica só neste navegador, até a aba ser fechada.
        </p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Field label="Matrícula" htmlFor="login-matricula">
            <input
              id="login-matricula"
              className={controlClass}
              value={matricula}
              onChange={(event) => setMatricula(event.target.value)}
              inputMode="numeric"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Senha" htmlFor="login-password">
            <input
              id="login-password"
              className={controlClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          {error ? (
            <p className="text-sm font-semibold text-orange-700" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="min-h-11 w-full rounded-2xl bg-leaf-700 text-sm font-extrabold text-white">
            Entrar
          </button>
        </form>
        <Link to="/" className="mt-6 text-center text-sm font-bold text-leaf-700">
          Voltar ao CAMPO VIRTUAL
        </Link>
      </main>
    </PhoneFrame>
  );
}
