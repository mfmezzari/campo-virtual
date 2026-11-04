import type { FeedKind } from "../types";

export const feedCategoryLabel: Record<FeedKind, FeedKind> = {
  "Vistoria de rotina": "Vistoria de rotina",
  "Manejo fitossanitário": "Manejo fitossanitário",
  "Organização de evento": "Organização de evento",
  "Aplicação de fertilizantes": "Aplicação de fertilizantes",
  Plantio: "Plantio",
};

const legacyKind: Record<string, FeedKind> = {
  manejo: "Manejo fitossanitário",
  alerta: "Manejo fitossanitário",
  evolucao: "Vistoria de rotina",
  fitossanitario: "Manejo fitossanitário",
  vistoria: "Vistoria de rotina",
  organizacao: "Organização de evento",
  fertilizante: "Aplicação de fertilizantes",
  plantio: "Plantio",
  "Vistoria de rotina": "Vistoria de rotina",
  "Manejo fitossanitário": "Manejo fitossanitário",
  "Organização de evento": "Organização de evento",
  "Aplicação de fertilizantes": "Aplicação de fertilizantes",
  Plantio: "Plantio",
};

export function normalizeFeedKind(kind: string): FeedKind {
  return legacyKind[kind] ?? "Vistoria de rotina";
}
