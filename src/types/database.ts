/**
 * Contrato das tabelas públicas do Supabase.
 * Espelha `supabase/schema.sql`. O app ainda lê o estado local;
 * estas linhas são o formato persistido quando o projeto for ligado ao banco.
 */

import type { FeedKind, FeedScope } from "../types";

export interface ProfileRow {
  id: string;
  matricula: string;
  nome: string | null;
  is_super_admin: boolean;
  created_at: string;
}

export interface ParcelaCroquiRow {
  id: string;
  identificador: string;
  cultura: "soja" | "milho";
  empresa: string;
  cultivar_hibrido: string;
  descricao_tecnica: string | null;
  coordenadas: { lat: number; lng: number }[] | null;
  updated_at: string;
}

export type TipoAtividade = FeedKind;

export interface FeedPostRow {
  id: string;
  tipo_atividade: TipoAtividade;
  parcela: FeedScope;
  descricao: string;
  imagem_url: string | null;
  likes_count: number;
  created_by: string | null;
  created_at: string;
}

export interface ManejoRow {
  id: string;
  parcela: "soja" | "milho";
  alvo: string;
  principio_ativo: string;
  dose_gramas_ha: number;
  volume_calda_l_ha: number;
  estadio: string;
  data_aplicacao: string;
  temp_c: number | null;
  umidade_pct: number | null;
  vento_kmh: number | null;
  created_at: string;
}

export interface FenologiaRow {
  id: string;
  cultura: "soja" | "milho";
  estadio_id: string;
  atualizado_em: string;
}

export interface ClimaPrevisaoRow {
  data: string;
  condicao: "sol" | "parcial" | "nublado" | "chuva";
  temp_min_c: number;
  temp_max_c: number;
  chuva_mm: number;
}

export interface AgronomoContatoRow {
  id: string;
  nome: string;
  cargo: "Agronomo (a)" | "Veterinário (a)" | "Secretária (o)";
  whatsapp: string;
  ativo: boolean;
  created_at: string;
}

export interface ClimaHistoricoRow {
  id: string;
  data: string;
  precipitacao_mm: number;
  temp_min_c: number;
  temp_max_c: number;
  umidade_pct: number;
  autor_id: string | null;
}

export interface ClimaEstacaoRow {
  id: string;
  estacao: string;
  localidade: string;
  registrado_em: string;
  temperatura_c: number;
  umidade_pct: number;
  vento_kmh: number;
  chuva_dia_mm: number;
  chuva_acumulada_mm: number;
  previsao: ClimaPrevisaoRow[];
}

type Table<Row, Insert = Partial<Row> & Pick<Row, never>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, "id" | "matricula"> & { nome?: string | null; is_super_admin?: boolean; created_at?: string }
      >;
      parcelas_croqui: Table<
        ParcelaCroquiRow,
        Omit<ParcelaCroquiRow, "id" | "updated_at" | "descricao_tecnica" | "coordenadas"> & {
          id?: string;
          updated_at?: string;
          descricao_tecnica?: string | null;
          coordenadas?: { lat: number; lng: number }[] | null;
        }
      >;
      feed_posts: Table<
        FeedPostRow,
        Omit<FeedPostRow, "id" | "likes_count" | "created_at" | "created_by" | "imagem_url"> & {
          id?: string;
          likes_count?: number;
          created_at?: string;
          created_by?: string | null;
          imagem_url?: string | null;
        }
      >;
      manejos: Table<
        ManejoRow,
        Omit<ManejoRow, "id" | "created_at" | "data_aplicacao" | "temp_c" | "umidade_pct" | "vento_kmh"> & {
          id?: string;
          created_at?: string;
          data_aplicacao?: string;
          temp_c?: number | null;
          umidade_pct?: number | null;
          vento_kmh?: number | null;
        }
      >;
      fenologia: Table<FenologiaRow>;
      clima_estacao: Table<ClimaEstacaoRow>;
      clima_historico: Table<ClimaHistoricoRow, Omit<ClimaHistoricoRow, "id" | "autor_id"> & { id?: string; autor_id?: string | null }>;
      agronomos_contatos: Table<
        AgronomoContatoRow,
        Omit<AgronomoContatoRow, "id" | "ativo" | "created_at"> & { id?: string; ativo?: boolean; created_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_super_admin: { Args: Record<string, never>; Returns: boolean };
      increment_likes: { Args: { post_id: string }; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
