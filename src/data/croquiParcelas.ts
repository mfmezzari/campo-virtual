import type { Culture, GeoPoint, ParcelaCroqui } from "../types";
import { CAMPO_CENTER, fieldPoint, fieldRect, isGeoPoint } from "../lib/croquiGeo";

const SEEDED_AT = "2026-11-03T17:40:00";

const SOY_W = 90;
const SOY_H = 4.8;
const SOY_GAP = 0.45;
const SOY_COUNT = 17;
const ALLEY = 7;
const CORN_W = 36;
const CORN_H = 15.2;
const CORN_GAP = 1.4;
const COL_GAP = 3.5;
const RIGHT_SHIFT = 6;
const CORN_ROWS = 5;

const soySpan = SOY_COUNT * SOY_H + (SOY_COUNT - 1) * SOY_GAP;
const cornSpan = CORN_ROWS * CORN_H + (CORN_ROWS - 1) * CORN_GAP + RIGHT_SHIFT;
const totalH = Math.max(soySpan, cornSpan);
const totalW = SOY_W + ALLEY + CORN_W + COL_GAP + CORN_W;

/** Centro do bloco, para a câmera abrir em cima do croqui inteiro. */
export const CROQUI_CENTER = fieldPoint(totalW / 2, -totalH / 2);

const CORN_SLOTS: Record<string, { column: 0 | 1; row: number }> = {
  pioneer: { column: 0, row: 0 },
  morgan: { column: 0, row: 1 },
  agroeste: { column: 0, row: 2 },
  agroceres: { column: 0, row: 3 },
  nk_seeds: { column: 0, row: 4 },
  brevant: { column: 1, row: 0 },
  forseed: { column: 1, row: 1 },
  supra: { column: 1, row: 2 },
  dekalb: { column: 1, row: 3 },
  nidera: { column: 1, row: 4 },
};

const soja: Array<[string, string, string]> = [
  ["TMG", "GUAPURUVU", "Material TMG posicionado na abertura da faixa de soja. Observar porte, engalhamento e sanidade do baixeiro ao longo do ciclo."],
  ["TMG", "ARAUCÁRIA", "Cultivar TMG na sequência da faixa. Comparar o fechamento de entrelinha com Guapuruvu no mesmo ambiente de São Domingos."],
  ["CORDIUS", "2535", "Primeira cultivar Cordius do bloco. Usar como referência de ciclo dentro da série 25 do obtentor."],
  ["CORDIUS", "2550", "Cultivar Cordius intermediária do bloco. Contrastar com 2535 e 2575 em altura de planta e enchimento de vagens."],
  ["CORDIUS", "2575", "Cultivar Cordius que fecha o bloco do obtentor. Avaliar se o ciclo mais longo sustenta o potencial na janela da região."],
  ["BRASMAX", "ORION", "Brasmax Orion na faixa de cultivares. Acompanhar arquitetura de planta e reação a doenças de final de ciclo."],
  ["BRASMAX", "IMUNE", "Brasmax Imune ao lado das demais Brasmax. A leitura de campo prioriza sanidade foliar e uniformidade de estande."],
  ["BRASMAX", "GRAFENO", "Brasmax Grafeno, uma das cultivares centrais do bloco. Registrar vagens no terço superior e a sanidade do baixeiro."],
  ["BRASMAX", "TITANIUM", "Brasmax Titanium encerra o bloco do obtentor. Comparar porte e ciclo com Orion, Imune e Grafeno."],
  ["DON MARIO", "59IX61", "A sigla IX identifica a tecnologia Intacta 2 Xtend. Manejo de percevejo e de plantas daninhas segue a recomendação dessa biotecnologia."],
  ["DON MARIO", "54IX57", "Também Intacta 2 Xtend, em ciclo distinto de 59IX61. Comparar as duas Don Mario no mesmo talhão."],
  ["GOLDEN HARVEST", "2459", "Golden Harvest 2459 isolada na faixa. Observar arranque, engalhamento e uniformidade de maturação."],
  ["ORS", "CRONOS", "ORS Cronos na sequência da faixa. Avaliar inserção de vagens e comportamento sob a população praticada no dia de campo."],
  ["MONSOY", "5436", "Monsoy 5436. Registrar estande final e a sanidade no florescimento para comparar com as vizinhas."],
  ["STINE", "53KA33", "Stine 53KA33. Acompanhar o desenvolvimento vegetativo e a formação de vagens no terço médio."],
  ["STOLLER (TESTE)", "ZEUS+CO MO", "Tratamento Stoller com cobalto e molibdênio sobre Zeus. A parcela mostra o efeito do tratamento, não uma cultivar nova."],
  ["STOLLER (TESTE)", "ZEUS+SIGN", "Tratamento Stoller Sign sobre Zeus, lado a lado com Zeus + CoMo. Comparar vigor e retenção de vagens entre os dois testes."],
];

const milho = ["Pioneer", "Brevant", "Morgan", "ForSeed", "Agroeste", "Supra", "Agroceres", "Dekalb", "NK Seeds", "Nidera"];

export function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function identificadorDaParcela(cultura: Culture, empresa: string, cultivarHibrido: string) {
  return `${cultura}_${slug(empresa)}_${slug(cultivarHibrido)}`.slice(0, 50).replace(/_$/, "");
}

function soyPolygon(index: number): GeoPoint[] {
  const north = -index * (SOY_H + SOY_GAP);
  return fieldRect(0, north - SOY_H, SOY_W, SOY_H);
}

function cornPolygon(empresa: string, numero: number): GeoPoint[] {
  const slot = CORN_SLOTS[slug(empresa)];
  if (!slot) throw new Error(`Sem geometria de milho para ${empresa}.`);
  const west = SOY_W + ALLEY + slot.column * (CORN_W + COL_GAP);
  const blockNorth = -slot.column * RIGHT_SHIFT - slot.row * (CORN_H + CORN_GAP);
  const height = (CORN_H - 0.35) / 2;
  const south = numero === 1 ? blockNorth - height : blockNorth - CORN_H;
  return fieldRect(west, south, CORN_W, height);
}

function fichaSoja(empresa: string, cultivar: string, nota: string) {
  return [
    `Cultivar de soja ${cultivar}, obtentor ${empresa}, no croqui do Dia de Campo da Coamo em São Domingos (SC), safra 26/27.`,
    nota,
    "Época de semeadura de referência na região: outubro a novembro, dentro da janela indicada pela Coamo.",
    "População de referência: 240 a 300 mil plantas por hectare, ajustada ao grupo de maturação, ao espaçamento e à fertilidade da gleba.",
    "Na visita, observar estande, fechamento de entrelinha, sanidade do baixeiro e formação de vagens.",
  ].join("\n\n");
}

function fichaMilho(empresa: string, numero: string) {
  return [
    `Híbrido de milho ${empresa}, parcela ${numero}, no bloco de híbridos do Dia de Campo da Coamo em São Domingos (SC), safra 26/27.`,
    `Cada obtentor tem duas parcelas. A parcela ${numero} entra nessa comparação direta.`,
    "Época de semeadura de referência na região: setembro, conforme a janela da Coamo para o milho da safra.",
    "População de referência: 60 a 70 mil plantas por hectare, conforme a recomendação do obtentor para o híbrido e o ambiente.",
    "Na visita, observar uniformidade de emergência, stay-green, empalhamento e sanidade da espiga.",
  ].join("\n\n");
}

export const croquiParcelas: ParcelaCroqui[] = [
  ...soja.map(([empresa, cultivar, nota], index) => {
    const identificador = identificadorDaParcela("soja", empresa, cultivar);
    return {
      id: identificador,
      identificador,
      cultura: "soja" as const,
      empresa,
      cultivarHibrido: cultivar,
      parcelaNumero: null,
      descricaoTecnica: fichaSoja(empresa, cultivar, nota),
      coordenadas: soyPolygon(index),
      updatedAt: SEEDED_AT,
    };
  }),
  ...milho.flatMap((empresa) =>
    [1, 2].map((numero) => {
      const identificador = identificadorDaParcela("milho", empresa, String(numero));
      return {
        id: identificador,
        identificador,
        cultura: "milho" as const,
        empresa,
        cultivarHibrido: String(numero),
        parcelaNumero: String(numero),
        descricaoTecnica: fichaMilho(empresa, String(numero)),
        coordenadas: cornPolygon(empresa, numero),
        updatedAt: SEEDED_AT,
      };
    }),
  ),
];

/** Texto desenhado dentro da faixa, no mesmo arranjo da foto: empresa e cultivar, ou empresa e número. */
export function rotuloDaParcela(item: Pick<ParcelaCroqui, "cultura" | "empresa" | "cultivarHibrido" | "parcelaNumero">) {
  if (item.cultura === "milho") return { esquerda: item.empresa, direita: item.parcelaNumero ?? item.cultivarHibrido };
  return { esquerda: item.empresa, direita: item.cultivarHibrido };
}

export function croquiTitle(item: Pick<ParcelaCroqui, "cultura" | "empresa" | "cultivarHibrido" | "parcelaNumero">) {
  if (item.cultura === "milho" && item.parcelaNumero) return `${item.empresa} - Parcela ${item.parcelaNumero}`;
  if (item.cultura === "milho" && /^\d+$/.test(item.cultivarHibrido)) return `${item.empresa} - Parcela ${item.cultivarHibrido}`;
  return `${item.empresa} - ${item.cultivarHibrido}`;
}

function asParcela(value: unknown): ParcelaCroqui | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<ParcelaCroqui> & { identificadorMapa?: string };
  const identificador = typeof row.identificador === "string" ? row.identificador : row.identificadorMapa;
  if (!identificador || (row.cultura !== "soja" && row.cultura !== "milho")) return null;
  if (typeof row.empresa !== "string" || typeof row.cultivarHibrido !== "string") return null;
  const coordenadas = Array.isArray(row.coordenadas) ? row.coordenadas.filter(isGeoPoint) : [];
  return {
    id: typeof row.id === "string" ? row.id : identificador,
    identificador,
    cultura: row.cultura,
    empresa: row.empresa,
    cultivarHibrido: row.cultivarHibrido,
    parcelaNumero: typeof row.parcelaNumero === "string" ? row.parcelaNumero : null,
    descricaoTecnica: typeof row.descricaoTecnica === "string" ? row.descricaoTecnica : "",
    coordenadas,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : SEEDED_AT,
  };
}

const CENTRO_ANTERIOR = { lat: -26.5625, lng: -52.5312 };

function trazerParaOCampo(points: GeoPoint[]): GeoPoint[] {
  if (points.length === 0) return points;
  const lat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
  const lng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;
  const pertoDoCentroAntigo =
    Math.abs(lat - CENTRO_ANTERIOR.lat) < 0.004 && Math.abs(lng - CENTRO_ANTERIOR.lng) < 0.004;
  if (!pertoDoCentroAntigo) return points;
  return points.map((point) => ({
    lat: point.lat + (CAMPO_CENTER.lat - CENTRO_ANTERIOR.lat),
    lng: point.lng + (CAMPO_CENTER.lng - CENTRO_ANTERIOR.lng),
  }));
}

export function mergeCroquiParcelas(stored: unknown, removed: unknown): ParcelaCroqui[] {
  const removedIds = new Set(Array.isArray(removed) ? removed.filter((id): id is string => typeof id === "string") : []);
  const savedList = Array.isArray(stored)
    ? stored
        .map(asParcela)
        .filter((item): item is ParcelaCroqui => item !== null)
        .map((item) => ({ ...item, coordenadas: trazerParaOCampo(item.coordenadas) }))
    : [];
  const saved = new Map(savedList.map((item) => [item.identificador, item]));
  const seedIds = new Set(croquiParcelas.map((item) => item.identificador));
  const base = croquiParcelas
    .filter((item) => !removedIds.has(item.identificador))
    .map((item) => {
      const current = saved.get(item.identificador);
      if (!current) return item;
      return {
        ...item,
        empresa: current.empresa || item.empresa,
        cultivarHibrido: current.cultivarHibrido || item.cultivarHibrido,
        descricaoTecnica: current.descricaoTecnica.trim().length >= 10 ? current.descricaoTecnica : item.descricaoTecnica,
        coordenadas: item.coordenadas,
        updatedAt: current.updatedAt || item.updatedAt,
      };
    });
  const extras = savedList.filter(
    (item) => !seedIds.has(item.identificador) && !removedIds.has(item.identificador) && item.coordenadas.length >= 3,
  );
  return [...base, ...extras];
}

export function croquiByCulture(items: ParcelaCroqui[], cultura: Culture) {
  return items.filter((item) => item.cultura === cultura);
}
