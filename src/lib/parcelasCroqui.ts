import type { ParcelaCroqui } from "../types";
import { isGeoPoint } from "./croquiGeo";
import { supabase } from "./uploadFoto";

interface ParcelaRow {
  id: string;
  identificador: string;
  cultura: string;
  empresa: string;
  cultivar_hibrido: string;
  descricao_tecnica: string | null;
  coordenadas: unknown;
  updated_at: string;
}

function asRow(value: unknown): ParcelaCroqui | null {
  if (!value || typeof value !== "object") return null;
  const row = value as ParcelaRow;
  if (row.cultura !== "soja" && row.cultura !== "milho") return null;
  if (typeof row.identificador !== "string" || typeof row.empresa !== "string" || typeof row.cultivar_hibrido !== "string") return null;
  const coordenadas = Array.isArray(row.coordenadas) ? row.coordenadas.filter(isGeoPoint) : [];
  return {
    id: typeof row.id === "string" ? row.id : row.identificador,
    identificador: row.identificador,
    cultura: row.cultura,
    empresa: row.empresa,
    cultivarHibrido: row.cultivar_hibrido,
    parcelaNumero: row.cultura === "milho" && /^\d+$/.test(row.cultivar_hibrido) ? row.cultivar_hibrido : null,
    descricaoTecnica: row.descricao_tecnica ?? "",
    coordenadas,
    updatedAt: row.updated_at,
  };
}

/** Lê a tabela pública. Sem as variáveis do Supabase, devolve null e o app segue com o cadastro local. */
export async function fetchParcelasCroqui(): Promise<ParcelaCroqui[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("parcelas_croqui").select("*");
  if (error || !Array.isArray(data)) return null;
  return data.map(asRow).filter((item): item is ParcelaCroqui => item !== null);
}

export function applyParcelasRemotas(local: ParcelaCroqui[], remote: ParcelaCroqui[] | null) {
  if (!remote) return local;
  const byKey = new Map(remote.map((item) => [item.identificador, item]));
  const merged = local.map((item) => {
    const row = byKey.get(item.identificador);
    if (!row) return item;
    return {
      ...item,
      empresa: row.empresa,
      cultivarHibrido: row.cultivarHibrido,
      parcelaNumero: row.parcelaNumero,
      descricaoTecnica: row.descricaoTecnica.trim() ? row.descricaoTecnica : item.descricaoTecnica,
      coordenadas: row.coordenadas.length >= 3 ? row.coordenadas : item.coordenadas,
      updatedAt: row.updatedAt || item.updatedAt,
    };
  });
  const known = new Set(local.map((item) => item.identificador));
  const extras = remote.filter((item) => !known.has(item.identificador) && item.coordenadas.length >= 3);
  return [...merged, ...extras];
}
