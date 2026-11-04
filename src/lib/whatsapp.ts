export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** Número brasileiro com DDI 55 e DDD: 12 dígitos (fixo) ou 13 (celular). */
export function isWhatsapp(value: string) {
  return /^55\d{10,11}$/.test(digitsOnly(value));
}

export function formatWhatsapp(value: string) {
  const digits = digitsOnly(value);
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  return digits ? `+${digits}` : "";
}

export function doubtMessage(plotNumber: string) {
  return `Olá, tenho uma dúvida sobre o card da Parcela ${plotNumber} do CAMPO VIRTUAL`;
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(text)}`;
}
