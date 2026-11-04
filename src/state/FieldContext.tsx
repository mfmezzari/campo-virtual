import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AgronomoContato,
  ClimaHistorico,
  Culture,
  FeedKind,
  FeedScope,
  FieldApplication,
  FieldPhoto,
  FeedUpdate,
  GeoPoint,
  ParcelaCroqui,
  Session,
  TeamAdmin,
  WeatherSnapshot,
} from "../types";
import { AGRONOMO_CARGOS } from "../types";
import { normalizeFeedKind } from "../lib/feed";
import { isWhatsapp, digitsOnly } from "../lib/whatsapp";
import {
  agronomosContatos as seedAgronomos,
  applications as seedApplications,
  currentStageByCulture as seedStages,
  feedUpdates as seedFeed,
  fieldPhotos as seedPhotos,
  phenologyStages,
  plots,
} from "../data/mock";
import { croquiParcelas as seedCroqui, identificadorDaParcela, mergeCroquiParcelas } from "../data/croquiParcelas";
import { validRing } from "../lib/croquiGeo";

const STORAGE_KEY = "campo-virtual-state";

export const SUPER_ADMIN: TeamAdmin = {
  id: "admin-super",
  matricula: "464139",
  name: "DETEC Santa Rosa",
  password: "SantaRosa2012",
  role: "super",
};

interface FieldState {
  feed: FeedUpdate[];
  photos: FieldPhoto[];
  applications: FieldApplication[];
  currentStageByCulture: Record<Culture, string>;
  admins: TeamAdmin[];
  agronomos: AgronomoContato[];
  climaHistorico: ClimaHistorico[];
  likedPostIds: string[];
  parcelasCroqui: ParcelaCroqui[];
  croquiRemovidas: string[];
  session: Session | null;
}

interface FeedInput {
  kind: FeedKind;
  culture: FeedScope;
  image: string;
  tags: string[];
  text: string;
}

interface ApplicationInput {
  culture: Culture;
  target: string;
  activeIngredient: string;
  doseGramsPerHa: number;
  sprayVolumeLPerHa: number | null;
  stageLabel: string;
  weather: WeatherSnapshot;
  note: string;
}

interface AdminInput {
  name: string;
  matricula: string;
  password: string;
}

interface ParcelaInput {
  cultura: Culture;
  empresa: string;
  cultivarHibrido: string;
  descricaoTecnica: string;
  coordenadas: GeoPoint[];
}

interface AgronomoInput {
  id?: string;
  nome: string;
  especialidade: string;
  whatsapp: string;
  ativo: boolean;
}

interface FieldContextValue extends FieldState {
  stageCode: (culture: Culture) => string;
  login: (matricula: string, password: string) => string | null;
  logout: () => void;
  addFeedPost: (input: FeedInput) => void;
  addApplication: (input: ApplicationInput) => void;
  setCurrentStage: (culture: Culture, stageId: string) => void;
  addAdmin: (input: AdminInput) => string | null;
  saveAgronomo: (input: AgronomoInput) => string | null;
  removeAgronomo: (id: string) => void;
  saveClimaHistorico: (input: Omit<ClimaHistorico, "id">) => string | null;
  removeClimaHistorico: (id: string) => void;
  toggleLike: (postId: string) => void;
  updateParcelaDescricao: (id: string, descricaoTecnica: string) => string | null;
  updateParcelaGeometria: (id: string, coordenadas: GeoPoint[]) => string | null;
  createParcela: (input: ParcelaInput) => string | null;
  removeParcela: (id: string) => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function nowLocalIso() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function withSuperAdmin(admins: TeamAdmin[]) {
  const secondary = admins.filter(
    (admin) => admin.role !== "super" && admin.matricula !== SUPER_ADMIN.matricula,
  );
  return [SUPER_ADMIN, ...secondary];
}

function isCurrentApplication(item: FieldApplication) {
  return typeof item.activeIngredient === "string" && typeof item.doseGramsPerHa === "number" && typeof item.stageLabel === "string";
}

function isState(value: unknown): value is FieldState {
  if (!value || typeof value !== "object") return false;
  const state = value as FieldState;
  return (
    Array.isArray(state.feed) &&
    Array.isArray(state.photos) &&
    Array.isArray(state.applications) &&
    Array.isArray(state.admins) &&
    Boolean(state.currentStageByCulture?.soja) &&
    Boolean(state.currentStageByCulture?.milho)
  );
}

function loadState(): FieldState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed: unknown = JSON.parse(raw);
    if (!isState(parsed)) return seedState();
    return {
      ...parsed,
      feed: parsed.feed.map((item) => ({
        ...item,
        kind: normalizeFeedKind(item.kind),
        likes: typeof item.likes === "number" && item.likes >= 0 ? Math.floor(item.likes) : 0,
      })),
      applications: parsed.applications.every(isCurrentApplication) ? parsed.applications : seedApplications,
      agronomos: Array.isArray(parsed.agronomos)
        ? parsed.agronomos.map((contato) => ({
            ...contato,
            especialidade: (AGRONOMO_CARGOS as readonly string[]).includes(contato.especialidade)
              ? contato.especialidade
              : AGRONOMO_CARGOS[0],
          }))
        : seedAgronomos,
      climaHistorico: Array.isArray(parsed.climaHistorico) ? parsed.climaHistorico : [],
      likedPostIds: Array.isArray(parsed.likedPostIds) ? parsed.likedPostIds : [],
      parcelasCroqui: mergeCroquiParcelas(parsed.parcelasCroqui, parsed.croquiRemovidas),
      croquiRemovidas: Array.isArray(parsed.croquiRemovidas)
        ? parsed.croquiRemovidas.filter((id): id is string => typeof id === "string")
        : [],
      admins: withSuperAdmin(parsed.admins),
    };
  } catch {
    return seedState();
  }
}

function seedState(): FieldState {
  return {
    feed: seedFeed,
    photos: seedPhotos,
    applications: seedApplications,
    currentStageByCulture: { ...seedStages },
    admins: [SUPER_ADMIN],
    agronomos: seedAgronomos,
    climaHistorico: [],
    likedPostIds: [],
    parcelasCroqui: seedCroqui,
    croquiRemovidas: [],
    session: null,
  };
}

export function FieldProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FieldState>(loadState);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // A foto local pode estourar a cota. O estado em memória continua valendo nesta visita.
    }
  }, [state]);

  const value = useMemo<FieldContextValue>(() => {
    const stageCode = (culture: Culture) =>
      phenologyStages.find((stage) => stage.id === state.currentStageByCulture[culture])?.code ?? "";

    return {
      ...state,
      stageCode,
      login(matricula, password) {
        const found = state.admins.find(
          (admin) => admin.matricula === matricula.trim() && admin.password === password,
        );
        if (!found) return "Matrícula ou senha incorretos.";
        setState((current) => ({
          ...current,
          session: { matricula: found.matricula, name: found.name, role: found.role },
        }));
        return null;
      },
      logout() {
        setState((current) => ({ ...current, session: null }));
      },
      addFeedPost(input) {
        const datetime = nowLocalIso();
        const id = `f-${Date.now()}`;
        const post: FeedUpdate = {
          id,
          kind: input.kind,
          culture: input.culture,
          plotId: null,
          datetime,
          image: input.image,
          tags: input.tags,
          text: input.text.trim(),
          likes: 0,
        };
        const photo: FieldPhoto = {
          id: `ph-${id}`,
          culture: input.culture,
          plotId: null,
          datetime,
          stageCode:
            input.culture === "soja e milho"
              ? `${stageCode("soja")} / ${stageCode("milho")}`
              : stageCode(input.culture),
          image: input.image,
          caption: input.text.trim(),
        };
        setState((current) => ({
          ...current,
          feed: [post, ...current.feed],
          photos: [photo, ...current.photos],
        }));
      },
      addApplication(input) {
        const application: FieldApplication = {
          id: `a-${Date.now()}`,
          culture: input.culture,
          plotIds: plots.filter((plot) => plot.culture === input.culture).map((plot) => plot.id),
          date: nowLocalIso(),
          target: input.target.trim(),
          note: input.note.trim() || "Registrado pela equipe DETEC.",
          weather: input.weather,
          activeIngredient: input.activeIngredient.trim(),
          doseGramsPerHa: input.doseGramsPerHa,
          sprayVolumeLPerHa: input.sprayVolumeLPerHa,
          stageLabel: input.stageLabel,
        };
        setState((current) => ({
          ...current,
          applications: [application, ...current.applications],
        }));
      },
      setCurrentStage(culture, stageId) {
        setState((current) => ({
          ...current,
          currentStageByCulture: { ...current.currentStageByCulture, [culture]: stageId },
        }));
      },
      addAdmin(input) {
        if (state.session?.matricula !== SUPER_ADMIN.matricula) {
          return "Somente a matrícula 464139 pode cadastrar administradores.";
        }
        const matricula = input.matricula.trim();
        if (!/^\d{4,12}$/.test(matricula)) return "A matrícula deve ter de 4 a 12 números.";
        if (input.password.trim().length < 6) return "A senha precisa ter ao menos 6 caracteres.";
        if (state.admins.some((admin) => admin.matricula === matricula)) {
          return "Esta matrícula já está cadastrada.";
        }
        const admin: TeamAdmin = {
          id: `admin-${Date.now()}`,
          matricula,
          name: input.name.trim(),
          password: input.password,
          role: "secondary",
        };
        setState((current) => ({ ...current, admins: [...current.admins, admin] }));
        return null;
      },
      saveAgronomo(input) {
        if (!state.session) return "Entre na área DETEC para cadastrar agrônomos.";
        const nome = input.nome.trim();
        const especialidade = input.especialidade.trim();
        const whatsapp = digitsOnly(input.whatsapp);
        if (nome.length < 3) return "Informe o nome do agrônomo.";
        if (!(AGRONOMO_CARGOS as readonly string[]).includes(especialidade)) {
          return "Escolha um cargo da lista.";
        }
        if (!isWhatsapp(whatsapp)) return "Use o WhatsApp com DDI 55 e DDD, só números.";
        const duplicated = state.agronomos.some(
          (contato) => contato.whatsapp === whatsapp && contato.id !== input.id,
        );
        if (duplicated) return "Este WhatsApp já está cadastrado.";
        const contato: AgronomoContato = {
          id: input.id ?? `agr-${Date.now()}`,
          nome,
          especialidade,
          whatsapp,
          ativo: input.ativo,
        };
        setState((current) => ({
          ...current,
          agronomos: input.id
            ? current.agronomos.map((item) => (item.id === input.id ? contato : item))
            : [...current.agronomos, contato],
        }));
        return null;
      },
      removeAgronomo(id) {
        if (!state.session) return;
        setState((current) => ({
          ...current,
          agronomos: current.agronomos.filter((contato) => contato.id !== id),
        }));
      },
      saveClimaHistorico(input) {
        if (!state.session) return "Entre na área DETEC para lançar o clima.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return "Informe a data do dia.";
        if (![input.precipitationMm, input.tempMinC, input.tempMaxC, input.humidityPct].every(Number.isFinite)) {
          return "Preencha chuva, temperaturas e umidade com números.";
        }
        if (input.precipitationMm < 0) return "A precipitação não pode ser negativa.";
        if (input.humidityPct < 0 || input.humidityPct > 100) return "A umidade fica entre 0 e 100%.";
        if (input.tempMinC > input.tempMaxC) return "A mínima não pode passar da máxima.";
        const entry: ClimaHistorico = {
          id: state.climaHistorico.find((item) => item.date === input.date)?.id ?? `clima-${Date.now()}`,
          date: input.date,
          precipitationMm: input.precipitationMm,
          tempMinC: input.tempMinC,
          tempMaxC: input.tempMaxC,
          humidityPct: input.humidityPct,
        };
        setState((current) => ({
          ...current,
          climaHistorico: [
            ...current.climaHistorico.filter((item) => item.date !== entry.date),
            entry,
          ].sort((a, b) => b.date.localeCompare(a.date)),
        }));
        return null;
      },
      removeClimaHistorico(id) {
        if (!state.session) return;
        setState((current) => ({
          ...current,
          climaHistorico: current.climaHistorico.filter((item) => item.id !== id),
        }));
      },
      updateParcelaDescricao(id, descricaoTecnica) {
        const text = descricaoTecnica.trim();
        if (text.length < 10) return "Descreva a ficha com ao menos 10 caracteres.";
        const exists = state.parcelasCroqui.some((item) => item.id === id);
        if (!exists) return "Parcela não encontrada no croqui.";
        setState((current) => ({
          ...current,
          parcelasCroqui: current.parcelasCroqui.map((item) =>
            item.id === id ? { ...item, descricaoTecnica: text, updatedAt: nowLocalIso() } : item,
          ),
        }));
        return null;
      },
      updateParcelaGeometria(id, coordenadas) {
        if (!validRing(coordenadas)) return "Marque ao menos 3 cantos no mapa.";
        const exists = state.parcelasCroqui.some((item) => item.id === id);
        if (!exists) return "Parcela não encontrada no croqui.";
        setState((current) => ({
          ...current,
          parcelasCroqui: current.parcelasCroqui.map((item) =>
            item.id === id ? { ...item, coordenadas, updatedAt: nowLocalIso() } : item,
          ),
        }));
        return null;
      },
      createParcela(input) {
        const empresa = input.empresa.trim();
        const cultivarHibrido = input.cultivarHibrido.trim();
        const descricaoTecnica = input.descricaoTecnica.trim();
        if (empresa.length < 2 || empresa.length > 50) return "Informe a empresa com até 50 caracteres.";
        if (cultivarHibrido.length < 1 || cultivarHibrido.length > 50) return "Informe o cultivar ou híbrido com até 50 caracteres.";
        if (descricaoTecnica.length < 10) return "Descreva a ficha com ao menos 10 caracteres.";
        if (!validRing(input.coordenadas)) return "Marque ao menos 3 cantos no mapa.";
        const identificador = identificadorDaParcela(input.cultura, empresa, cultivarHibrido);
        if (!identificador || identificador === input.cultura) return "Não foi possível gerar o identificador da parcela.";
        if (state.parcelasCroqui.some((item) => item.identificador === identificador)) {
          return "Já existe uma parcela com essa empresa e esse nome.";
        }
        const parcela: ParcelaCroqui = {
          id: identificador,
          identificador,
          cultura: input.cultura,
          empresa,
          cultivarHibrido,
          parcelaNumero: input.cultura === "milho" && /^\d+$/.test(cultivarHibrido) ? cultivarHibrido : null,
          descricaoTecnica,
          coordenadas: input.coordenadas,
          updatedAt: nowLocalIso(),
        };
        setState((current) => ({
          ...current,
          croquiRemovidas: current.croquiRemovidas.filter((item) => item !== identificador),
          parcelasCroqui: [...current.parcelasCroqui, parcela],
        }));
        return null;
      },
      removeParcela(id) {
        const found = state.parcelasCroqui.find((item) => item.id === id);
        if (!found) return;
        setState((current) => ({
          ...current,
          croquiRemovidas: current.croquiRemovidas.includes(found.identificador)
            ? current.croquiRemovidas
            : [...current.croquiRemovidas, found.identificador],
          parcelasCroqui: current.parcelasCroqui.filter((item) => item.id !== id),
        }));
      },
      toggleLike(postId) {
        setState((current) => {
          const liked = current.likedPostIds.includes(postId);
          return {
            ...current,
            likedPostIds: liked
              ? current.likedPostIds.filter((id) => id !== postId)
              : [...current.likedPostIds, postId],
            feed: current.feed.map((post) =>
              post.id === postId ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) } : post,
            ),
          };
        });
      },
    };
  }, [state]);

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>;
}

export function useField() {
  const context = useContext(FieldContext);
  if (!context) throw new Error("useField precisa estar dentro de FieldProvider.");
  return context;
}
