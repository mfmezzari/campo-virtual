-- CAMPO VIRTUAL — setup completo do Supabase
-- Cole este arquivo no SQL Editor do projeto e execute uma vez.
-- O script é idempotente: cria o que falta e recria as políticas, sem apagar linhas já gravadas.
--
-- Leitura: qualquer visitante (produtor), inclusive o papel anon.
-- Escrita: somente sessão autenticada da área DETEC.
-- O cadastro de outros administradores continua restrito à matrícula 464139.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ==========================================
-- 1. TABELAS
-- ==========================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  matricula varchar(50) unique not null,
  nome varchar(100),
  is_super_admin boolean not null default false,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.agronomos_contatos (
  id uuid primary key default gen_random_uuid(),
  nome varchar(100) not null,
  cargo varchar(50) not null,
  whatsapp varchar(20) not null,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  tipo_atividade varchar(50) not null,
  parcela varchar(20) not null,
  descricao text not null,
  imagem_url text,
  likes_count integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.manejos (
  id uuid primary key default gen_random_uuid(),
  parcela varchar(10) not null,
  alvo text not null,
  principio_ativo text not null,
  dose_gramas_ha numeric not null,
  volume_calda_l_ha numeric not null,
  estadio varchar(20) not null,
  data_aplicacao date not null default current_date,
  temp_c numeric,
  umidade_pct numeric,
  vento_kmh numeric,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.parcelas_croqui (
  id uuid primary key default gen_random_uuid(),
  identificador varchar(50) unique not null,
  cultura varchar(10) not null,
  empresa varchar(50) not null,
  cultivar_hibrido varchar(50) not null,
  descricao_tecnica text,
  coordenadas jsonb,
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Fenologia e clima também alimentam o aplicativo público.
create table if not exists public.fenologia (
  id uuid primary key default gen_random_uuid(),
  cultura text not null unique,
  estadio_id text not null,
  atualizado_em timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.clima_estacao (
  id uuid primary key default gen_random_uuid(),
  estacao text not null,
  localidade text not null,
  registrado_em timestamp with time zone not null default timezone('utc'::text, now()),
  temperatura_c numeric(4, 1) not null,
  umidade_pct numeric(4, 1) not null,
  vento_kmh numeric(4, 1) not null,
  chuva_dia_mm numeric(5, 1) not null default 0,
  chuva_acumulada_mm numeric(6, 1) not null default 0,
  previsao jsonb not null default jsonb_build_array()
);

create table if not exists public.clima_historico (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  precipitacao_mm numeric(6, 1) not null,
  temp_min_c numeric(4, 1) not null,
  temp_max_c numeric(4, 1) not null,
  umidade_pct numeric(4, 1) not null,
  autor_id uuid references public.profiles (id) on delete set null
);

create index if not exists feed_posts_created_at_idx on public.feed_posts (created_at desc);
create index if not exists manejos_data_idx on public.manejos (data_aplicacao desc);
create index if not exists parcelas_croqui_cultura_idx on public.parcelas_croqui (cultura);
create index if not exists agronomos_contatos_ativo_idx on public.agronomos_contatos (ativo);

-- Restrições ficam fora do CREATE TABLE para o editor não confundir os parênteses.
alter table public.agronomos_contatos drop constraint if exists agronomos_cargo_check;
alter table public.agronomos_contatos add constraint agronomos_cargo_check check (
  cargo = 'Agronomo (a)'
  or cargo = 'Veterinário (a)'
  or cargo = 'Secretária (o)'
);

alter table public.agronomos_contatos drop constraint if exists agronomos_whatsapp_digits;
alter table public.agronomos_contatos add constraint agronomos_whatsapp_digits check (
  char_length(whatsapp) between 12 and 13
  and whatsapp like '55%'
  and translate(whatsapp, '0123456789', '') = ''
);

alter table public.feed_posts drop constraint if exists feed_posts_tipo_check;
alter table public.feed_posts add constraint feed_posts_tipo_check check (
  tipo_atividade = 'Vistoria de rotina'
  or tipo_atividade = 'Manejo fitossanitário'
  or tipo_atividade = 'Organização de evento'
  or tipo_atividade = 'Aplicação de fertilizantes'
  or tipo_atividade = 'Plantio'
);

alter table public.feed_posts drop constraint if exists feed_posts_parcela_check;
alter table public.feed_posts add constraint feed_posts_parcela_check check (
  parcela = 'soja' or parcela = 'milho' or parcela = 'soja e milho'
);

alter table public.feed_posts drop constraint if exists feed_posts_likes_check;
alter table public.feed_posts add constraint feed_posts_likes_check check (likes_count >= 0);

alter table public.manejos drop constraint if exists manejos_parcela_check;
alter table public.manejos add constraint manejos_parcela_check check (
  parcela = 'soja' or parcela = 'milho'
);

alter table public.manejos drop constraint if exists manejos_dose_check;
alter table public.manejos add constraint manejos_dose_check check (dose_gramas_ha >= 0);

alter table public.manejos drop constraint if exists manejos_volume_check;
alter table public.manejos add constraint manejos_volume_check check (volume_calda_l_ha >= 0);

alter table public.parcelas_croqui drop constraint if exists parcelas_croqui_cultura_check;
alter table public.parcelas_croqui add constraint parcelas_croqui_cultura_check check (
  cultura = 'soja' or cultura = 'milho'
);

alter table public.fenologia drop constraint if exists fenologia_cultura_check;
alter table public.fenologia add constraint fenologia_cultura_check check (
  cultura = 'soja' or cultura = 'milho'
);

alter table public.clima_historico drop constraint if exists clima_historico_precipitacao_check;
alter table public.clima_historico add constraint clima_historico_precipitacao_check check (precipitacao_mm >= 0);

alter table public.clima_historico drop constraint if exists clima_historico_umidade_check;
alter table public.clima_historico add constraint clima_historico_umidade_check check (
  umidade_pct >= 0 and umidade_pct <= 100
);

alter table public.clima_historico drop constraint if exists clima_historico_temps;
alter table public.clima_historico add constraint clima_historico_temps check (temp_min_c <= temp_max_c);

-- ==========================================
-- 2. FUNÇÕES
-- ==========================================

create or replace function public.enforce_super_admin()
returns trigger
as $$
begin
  if new.matricula = '464139' then
    new.is_super_admin := true;
  elsif new.is_super_admin then
    raise exception 'Somente a matrícula 464139 pode ser super admin';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_super_admin on public.profiles;
create trigger profiles_super_admin
  before insert or update on public.profiles
  for each row execute function public.enforce_super_admin();

create or replace function public.is_staff()
returns boolean
stable
security definer
set search_path = public
as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid());
end;
$$ language plpgsql;

create or replace function public.is_super_admin()
returns boolean
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and matricula = '464139'
      and is_super_admin
  );
end;
$$ language plpgsql;

create or replace function public.increment_likes(post_id uuid)
returns integer
security definer
set search_path = public
as $$
declare
  total integer;
begin
  update public.feed_posts
    set likes_count = coalesce(likes_count, 0) + 1
    where id = post_id
    returning likes_count into total;

  if total is null then
    raise exception 'Card não encontrado';
  end if;

  return total;
end;
$$ language plpgsql;

revoke all on function public.increment_likes(uuid) from public;
grant execute on function public.increment_likes(uuid) to anon, authenticated;
drop function if exists public.ajustar_curtidas(uuid, integer);

-- ==========================================
-- 3. RLS — leitura pública, escrita autenticada
-- ==========================================

alter table public.profiles enable row level security;
alter table public.agronomos_contatos enable row level security;
alter table public.feed_posts enable row level security;
alter table public.manejos enable row level security;
alter table public.parcelas_croqui enable row level security;
alter table public.fenologia enable row level security;
alter table public.clima_estacao enable row level security;
alter table public.clima_historico enable row level security;

grant usage on schema public to anon, authenticated;
grant select on
  public.profiles,
  public.agronomos_contatos,
  public.feed_posts,
  public.manejos,
  public.parcelas_croqui,
  public.fenologia,
  public.clima_estacao,
  public.clima_historico
to anon, authenticated;
grant insert, update, delete on
  public.profiles,
  public.agronomos_contatos,
  public.feed_posts,
  public.manejos,
  public.parcelas_croqui,
  public.fenologia,
  public.clima_estacao,
  public.clima_historico
to authenticated;

-- Perfis: o produtor pode ler. Só a matrícula 464139 cadastra ou altera administradores.
drop policy if exists "Leitura pública de perfis" on public.profiles;
drop policy if exists "Gerenciamento de perfis por super admin" on public.profiles;
create policy "Leitura pública de perfis"
  on public.profiles for select
  using (true);
create policy "Gerenciamento de perfis por super admin"
  on public.profiles for all
  to authenticated
  using (public.is_super_admin() or (id = auth.uid() and matricula = '464139'))
  with check (public.is_super_admin() or (id = auth.uid() and matricula = '464139'));

drop policy if exists "Leitura pública em agronomos_contatos" on public.agronomos_contatos;
drop policy if exists "Escrita restrita em agronomos_contatos" on public.agronomos_contatos;
create policy "Leitura pública em agronomos_contatos"
  on public.agronomos_contatos for select
  using (true);
create policy "Escrita restrita em agronomos_contatos"
  on public.agronomos_contatos for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Leitura pública em feed_posts" on public.feed_posts;
drop policy if exists "Escrita restrita em feed_posts" on public.feed_posts;
create policy "Leitura pública em feed_posts"
  on public.feed_posts for select
  using (true);
create policy "Escrita restrita em feed_posts"
  on public.feed_posts for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Leitura pública em manejos" on public.manejos;
drop policy if exists "Escrita restrita em manejos" on public.manejos;
create policy "Leitura pública em manejos"
  on public.manejos for select
  using (true);
create policy "Escrita restrita em manejos"
  on public.manejos for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Permitir leitura publica das parcelas" on public.parcelas_croqui;
drop policy if exists "Permitir alteracao apenas para usuarios autenticados" on public.parcelas_croqui;
create policy "Permitir leitura publica das parcelas"
  on public.parcelas_croqui for select
  using (true);
create policy "Permitir alteracao apenas para usuarios autenticados"
  on public.parcelas_croqui for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Leitura pública em fenologia" on public.fenologia;
drop policy if exists "Escrita restrita em fenologia" on public.fenologia;
create policy "Leitura pública em fenologia"
  on public.fenologia for select
  using (true);
create policy "Escrita restrita em fenologia"
  on public.fenologia for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Leitura pública em clima_estacao" on public.clima_estacao;
drop policy if exists "Escrita restrita em clima_estacao" on public.clima_estacao;
create policy "Leitura pública em clima_estacao"
  on public.clima_estacao for select
  using (true);
create policy "Escrita restrita em clima_estacao"
  on public.clima_estacao for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Leitura pública em clima_historico" on public.clima_historico;
drop policy if exists "Escrita restrita em clima_historico" on public.clima_historico;
create policy "Leitura pública em clima_historico"
  on public.clima_historico for select
  using (true);
create policy "Escrita restrita em clima_historico"
  on public.clima_historico for all
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ==========================================
-- 4. STORAGE
-- fotos-feed: cards do feed, depois da compactação JPEG.
-- fotos-croqui: imagens do croqui.
-- fotos_campo: bucket que o cliente atual (uploadFotoCampo) já utiliza.
-- Os três são públicos para leitura e aceitam JPEG/PNG de até 10 MB.
-- ==========================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('fotos-feed', 'fotos-feed', true, 10485760, string_to_array('image/jpeg,image/png,image/webp', ',')),
  ('fotos-croqui', 'fotos-croqui', true, 10485760, string_to_array('image/jpeg,image/png,image/webp', ',')),
  ('fotos_campo', 'fotos_campo', true, 10485760, string_to_array('image/jpeg,image/png,image/webp', ','))
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Leitura pública das fotos do campo" on storage.objects;
drop policy if exists "Upload de fotos por usuários autenticados" on storage.objects;
drop policy if exists "Atualização de fotos por usuários autenticados" on storage.objects;
drop policy if exists "Exclusão de fotos por usuários autenticados" on storage.objects;

create policy "Leitura pública das fotos do campo"
  on storage.objects for select
  using (bucket_id in ('fotos-feed', 'fotos-croqui', 'fotos_campo'));

create policy "Upload de fotos por usuários autenticados"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('fotos-feed', 'fotos-croqui', 'fotos_campo')
    and auth.role() = 'authenticated'
  );

create policy "Atualização de fotos por usuários autenticados"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('fotos-feed', 'fotos-croqui', 'fotos_campo')
    and auth.role() = 'authenticated'
  )
  with check (
    bucket_id in ('fotos-feed', 'fotos-croqui', 'fotos_campo')
    and auth.role() = 'authenticated'
  );

create policy "Exclusão de fotos por usuários autenticados"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('fotos-feed', 'fotos-croqui', 'fotos_campo')
    and auth.role() = 'authenticated'
  );
