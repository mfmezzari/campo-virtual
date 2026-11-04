import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível preparar a foto otimizada."));
    reader.readAsDataURL(blob);
  });
}

/** Envia o JPEG já compactado para o bucket público `fotos_campo` e devolve a URL pública. */
export async function uploadFotoCampo(blob: Blob) {
  if (!supabase || !supabaseUrl) {
    throw new Error("Supabase não configurado.");
  }

  const day = new Date().toISOString().slice(0, 10);
  const path = `${day}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("fotos_campo").upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("fotos_campo").getPublicUrl(path);
  return data.publicUrl;
}
