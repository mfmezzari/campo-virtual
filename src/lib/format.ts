const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function asDate(iso: string) {
  return new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
}

export function daysBetween(startIso: string, endIso: string) {
  const start = asDate(startIso.slice(0, 10));
  const end = asDate(endIso.slice(0, 10));
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function formatDate(iso: string) {
  const date = asDate(iso);
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTime(iso: string) {
  const date = asDate(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDateTime(iso: string) {
  return iso.length <= 10 ? formatDate(iso) : `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function formatPopulation(value: number) {
  return `${new Intl.NumberFormat("pt-BR").format(value)} plantas/ha`;
}

export function formatGramsPerHa(value: number) {
  const digits = Number.isInteger(value) ? 0 : 1;
  return `${formatDecimal(value, digits)} g/ha`;
}

export function formatLitersPerHa(value: number | null) {
  if (value === null) return "—";
  const digits = Number.isInteger(value) ? 0 : 1;
  return `${formatDecimal(value, digits)} L/ha`;
}

export function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
