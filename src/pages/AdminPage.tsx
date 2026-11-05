import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { SUPER_ADMIN, useField } from "../state/FieldContext";
import { PhoneFrame } from "../components/PhoneFrame";
import { FeedForm } from "../components/admin/FeedForm";
import { ManejoForm } from "../components/admin/ManejoForm";
import { PhenologyForm } from "../components/admin/PhenologyForm";
import { AdminManager } from "../components/admin/AdminManager";
import { AgronomoManager } from "../components/admin/AgronomoManager";
import { ClimaHistoricoForm } from "../components/admin/ClimaHistoricoForm";
import { CroquiManager } from "../components/admin/CroquiManager";
import { cx } from "../lib/format";

type AdminTab = "feed" | "manejo" | "fenologia" | "clima" | "croqui" | "agronomos" | "admins";

export function AdminPage() {
  const { session, logout } = useField();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("feed");
  if (!session) return <Navigate to="/login" replace />;

  const canManageAdmins = session.matricula === SUPER_ADMIN.matricula && session.role === "super";
  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: "feed", label: "Novo card" },
    { id: "manejo", label: "Manejo" },
    { id: "fenologia", label: "Fenologia" },
    { id: "clima", label: "Clima" },
    { id: "croqui", label: "Croqui" },
    { id: "agronomos", label: "Agrônomos" },
    ...(canManageAdmins ? [{ id: "admins" as const, label: "Equipe" }] : []),
  ];
  const active = tabs.some((item) => item.id === tab) ? tab : "feed";

  return (
    <PhoneFrame>
      <header className="border-b border-slate-200/80 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-ink-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-leaf-700">DETEC</p>
            <h1 className="text-lg font-semibold leading-tight tracking-tight">Painel CAMPO VIRTUAL</h1>
            <p className="text-xs text-ink-500">
              {session.name} · {session.matricula}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200/80 px-3 text-sm font-medium text-ink-700 transition-all duration-150 hover:border-slate-300"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
            Sair
          </button>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Gestão DETEC">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active === item.id}
              onClick={() => setTab(item.id)}
              className={cx(
                "h-9 shrink-0 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                active === item.id ? "bg-leaf-800 text-white" : "bg-slate-50 text-ink-500 hover:border-slate-300 hover:text-ink-900",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="scroll-area flex-1 overflow-y-auto px-4 py-4">
        <div className="screen-enter space-y-3">
          {active === "feed" ? (
            <section aria-label="Novo card no feed">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Novo card no feed</h2>
              <p className="mb-3 text-sm text-ink-500">
                Todo card sai como Nova atividade, na categoria escolhida.
              </p>
              <FeedForm />
            </section>
          ) : null}
          {active === "manejo" ? (
            <section aria-label="Registrar manejo">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Registrar manejo</h2>
              <p className="mb-3 text-sm text-ink-500">
                Princípio ativo, dose em g/ha, calda, clima e estádio entram no histórico.
              </p>
              <ManejoForm />
            </section>
          ) : null}
          {active === "fenologia" ? (
            <section aria-label="Atualizar fenologia">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Atualizar fenologia</h2>
              <p className="mb-3 text-sm text-ink-500">O estágio marcado passa a ser o atual do campo.</p>
              <PhenologyForm />
            </section>
          ) : null}
          {active === "clima" ? (
            <section aria-label="Histórico do clima">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Histórico do clima</h2>
              <p className="mb-3 text-sm text-ink-500">
                O dia lançado substitui a Open-Meteo no gráfico de São Domingos (SC).
              </p>
              <ClimaHistoricoForm />
            </section>
          ) : null}
          {active === "croqui" ? (
            <section aria-label="Gerenciar parcelas do croqui">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Gerenciar Parcelas do Croqui</h2>
              <p className="mb-3 text-sm text-ink-500">
                Desenhe o polígono, grave a ficha e a parcela aparece no mapa de satélite do produtor.
              </p>
              <CroquiManager />
            </section>
          ) : null}
          {active === "agronomos" ? (
            <section aria-label="Contatos dos agrônomos">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Agrônomos</h2>
              <p className="mb-3 text-sm text-ink-500">
                Os contatos ativos aparecem em Dúvida ao agrônomo e abrem o WhatsApp da parcela.
              </p>
              <AgronomoManager />
            </section>
          ) : null}
          {active === "admins" && canManageAdmins ? (
            <section aria-label="Gerenciar administradores">
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-ink-900">Administradores</h2>
              <p className="mb-3 text-sm text-ink-500">Somente a matrícula 464139 vê e cadastra a equipe.</p>
              <AdminManager />
            </section>
          ) : null}
        </div>
      </main>
    </PhoneFrame>
  );
}
