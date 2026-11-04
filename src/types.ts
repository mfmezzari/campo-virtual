export type Culture = "soja" | "milho";

export type CultureFilter = "todas" | Culture;

/** Parcela do card novo: uma cultura ou as duas juntas. */
export type FeedScope = Culture | "soja e milho";

export type TabId = "feed" | "photos" | "manejos" | "clima" | "croqui" | "live" | "phenology";

export type FeedKind =
  | "Vistoria de rotina"
  | "Manejo fitossanitário"
  | "Organização de evento"
  | "Aplicação de fertilizantes"
  | "Plantio";

export type PlotCategory = "soja" | "milho" | "nutricao";

export type DaeFilter = "todos" | "0-30" | "31-60" | "61+";

export type PhotoView = "grid" | "timeline";

export interface Plot {
  id: string;
  number: string;
  name: string;
  culture: Culture;
  category: PlotCategory;
  populationPerHa: number;
  plantingDate: string;
  emergenceDate: string;
  stageCode: string;
  spacingM: number;
}

export interface FeedUpdate {
  id: string;
  kind: FeedKind;
  culture: FeedScope;
  /** Nulo quando o card vale para a cultura inteira (soja, milho ou soja e milho). */
  plotId: string | null;
  datetime: string;
  image: string;
  tags: string[];
  text: string;
  /** Contador público, no formato da coluna `feed_posts.likes_count`. */
  likes: number;
}

export const AGRONOMO_CARGOS = ["Agronomo (a)", "Veterinário (a)", "Secretária (o)"] as const;

export type AgronomoCargo = (typeof AGRONOMO_CARGOS)[number];

export interface AgronomoContato {
  id: string;
  nome: string;
  especialidade: string;
  /** Dígitos com DDI 55 e DDD, como em `agronomos_contatos.whatsapp`. */
  whatsapp: string;
  ativo: boolean;
}

export interface FieldPhoto {
  id: string;
  culture: FeedScope;
  /** Nulo quando a foto acompanha um card da cultura inteira. */
  plotId: string | null;
  datetime: string;
  stageCode: string;
  image: string;
  caption: string;
}

export interface WeatherSnapshot {
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
}

/** Aplicação no formato da tabela `manejos`: um princípio ativo e dose em g/ha. */
export interface FieldApplication {
  id: string;
  culture: Culture;
  plotIds: string[];
  date: string;
  target: string;
  note: string;
  weather: WeatherSnapshot;
  activeIngredient: string;
  doseGramsPerHa: number;
  sprayVolumeLPerHa: number | null;
  stageLabel: string;
}

export interface PhenologyStage {
  id: string;
  culture: Culture;
  code: string;
  name: string;
  observe: string;
  recommendation: string;
  image: string;
}

export interface LiveCamera {
  id: string;
  label: string;
  culture: Culture | "geral";
  description: string;
  image: string;
}

export type ForecastCondition = "sol" | "parcial" | "nublado" | "chuva";

export type ClimaMetric = "precipitacao" | "tempMin" | "tempMax" | "umidade";

/** Dia da série do gráfico, vindo da Open-Meteo ou de um lançamento da DETEC. */
export interface ClimaDia {
  date: string;
  precipitationMm: number;
  tempMinC: number;
  tempMaxC: number;
  humidityPct: number;
  condition: ForecastCondition;
}

export interface ClimaAgora {
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  rainTodayMm: number;
  condition: ForecastCondition;
  observedAt: string;
  source: "open-meteo" | "local";
}

/** Lançamento manual do histórico, no formato da tabela `clima_historico`. */
export interface ClimaHistorico {
  id: string;
  date: string;
  precipitationMm: number;
  tempMinC: number;
  tempMaxC: number;
  humidityPct: number;
}

export interface ForecastDay {
  date: string;
  condition: ForecastCondition;
  tempMinC: number;
  tempMaxC: number;
  rainMm: number;
}

/** Leitura da estação, no formato da tabela `clima_estacao`. */
export interface ClimaRegistro {
  id: string;
  station: string;
  locality: string;
  recordedAt: string;
  temperatureC: number;
  humidityPct: number;
  windKmh: number;
  rainTodayMm: number;
  rainAccumulatedMm: number;
  forecast: ForecastDay[];
}

export interface StationWeather {
  temperatureC: number;
  rainTodayMm: number;
  humidityPct: number;
  windKmh: number;
  updatedAt: string;
  station: string;
}

/** Vértice de polígono, no formato gravado em `parcelas_croqui.coordenadas`. */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Ficha de uma faixa do croqui, no formato da tabela `parcelas_croqui`. */
export interface ParcelaCroqui {
  id: string;
  identificador: string;
  cultura: Culture;
  empresa: string;
  cultivarHibrido: string;
  parcelaNumero: string | null;
  descricaoTecnica: string;
  coordenadas: GeoPoint[];
  updatedAt: string;
}

export type AdminRole = "super" | "secondary";

export interface TeamAdmin {
  id: string;
  matricula: string;
  name: string;
  password: string;
  role: AdminRole;
}

export interface Session {
  matricula: string;
  name: string;
  role: AdminRole;
}

export type ActiveSheet =
  | { type: "notifications" }
  | { type: "doubt"; updateId: string }
  | { type: "plot"; plotId: string }
  | null;
