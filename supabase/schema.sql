-- CAMPO VIRTUAL — esquema e RLS
-- Produtores leem o conteúdo sem login. Curtir chama increment_likes (+1).
-- A equipe autenticada grava feed, manejos, fenologia, croqui, clima e agrônomos.
-- Só a matrícula 464139 (is_super_admin) cadastra outros administradores.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ==========================================
-- 1. EXTENSÕES & BUCKET DE ARMAZENAMENTO
-- ==========================================
insert into storage.buckets (id, name, public)
values ('fotos_campo', 'fotos_campo', true)
on conflict (id) do nothing;

drop policy if exists "Fotos públicas para leitura" on storage.objects;
create policy "Fotos públicas para leitura"
on storage.objects for select
using (bucket_id = 'fotos_campo');

drop policy if exists "Upload de fotos por admins" on storage.objects;
create policy "Upload de fotos por admins"
on storage.objects for insert
to authenticated
with check (bucket_id = 'fotos_campo' and auth.role() = 'authenticated');

-- ==========================================
-- 2. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- ==========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  matricula varchar(50) unique not null,
  nome varchar(100),
  is_super_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;
alter table public.profiles alter column nome drop not null;

-- ==========================================
-- 3. TABELA DE CONTATOS DOS AGRÔNOMOS
-- ==========================================
create table if not exists public.agronomos_contatos (
  id uuid primary key default uuid_generate_v4(),
  nome varchar(100) not null,
  cargo varchar(50) not null check (cargo in ('Agronomo (a)', 'Veterinário (a)', 'Secretária (o)')),
  whatsapp varchar(20) not null,
  ativo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'agronomos_contatos' and column_name = 'cargo_especialidade'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'agronomos_contatos' and column_name = 'cargo'
  ) then
    alter table public.agronomos_contatos rename column cargo_especialidade to cargo;
  end if;
end $$;

alter table public.agronomos_contatos drop constraint if exists agronomos_whatsapp_digits;
alter table public.agronomos_contatos drop constraint if exists agronomos_cargo_check;
alter table public.agronomos_contatos
  add constraint agronomos_cargo_check
  check (cargo in ('Agronomo (a)', 'Veterinário (a)', 'Secretária (o)'));
alter table public.agronomos_contatos
  add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- ==========================================
-- 4. TABELA DO FEED DE POSTS (NOVA ATIVIDADE)
-- ==========================================
drop table if exists public.feed_posts cascade;
create table public.feed_posts (
  id uuid primary key default uuid_generate_v4(),
  tipo_atividade varchar(50) not null check (
    tipo_atividade in (
      'Vistoria de rotina',
      'Manejo fitossanitário',
      'Organização de evento',
      'Aplicação de fertilizantes',
      'Plantio'
    )
  ),
  parcela varchar(20) not null check (parcela in ('soja', 'milho', 'soja e milho')),
  descricao text not null,
  imagem_url text,
  likes_count integer default 0,
  created_by uuid references public.profiles (id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5. TABELA DE MANEJOS E APLICAÇÕES
-- ==========================================
drop table if exists public.manejos cascade;
create table public.manejos (
  id uuid primary key default uuid_generate_v4(),
  parcela varchar(10) not null check (parcela in ('soja', 'milho')),
  alvo text not null,
  principio_ativo text not null,
  dose_gramas_ha numeric not null,
  volume_calda_l_ha numeric not null,
  estadio varchar(20) not null,
  data_aplicacao date not null default current_date,
  temp_c numeric,
  umidade_pct numeric,
  vento_kmh numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fichas e polígonos do mapa de satélite. Não recria a tabela se ela já existir.
create table if not exists public.parcelas_croqui (
  id uuid primary key default gen_random_uuid(),
  identificador varchar(50) unique not null,
  cultura varchar(10) not null check (cultura in ('soja', 'milho')),
  empresa varchar(50) not null,
  cultivar_hibrido varchar(50) not null,
  descricao_tecnica text,
  coordenadas jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.fenologia (
  id uuid primary key default gen_random_uuid(),
  cultura text not null unique check (cultura in ('soja', 'milho')),
  estadio_id text not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.clima_estacao (
  id uuid primary key default gen_random_uuid(),
  estacao text not null,
  localidade text not null,
  registrado_em timestamptz not null default now(),
  temperatura_c numeric(4, 1) not null,
  umidade_pct numeric(4, 1) not null,
  vento_kmh numeric(4, 1) not null,
  chuva_dia_mm numeric(5, 1) not null default 0,
  chuva_acumulada_mm numeric(6, 1) not null default 0,
  previsao jsonb not null default '[]'::jsonb
);

create table if not exists public.clima_historico (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  precipitacao_mm numeric(6, 1) not null check (precipitacao_mm >= 0),
  temp_min_c numeric(4, 1) not null,
  temp_max_c numeric(4, 1) not null,
  umidade_pct numeric(4, 1) not null check (umidade_pct >= 0 and umidade_pct <= 100),
  autor_id uuid references public.profiles (id),
  constraint clima_historico_temps check (temp_min_c <= temp_max_c)
);

create or replace function public.enforce_super_admin()
returns trigger
language plpgsql
as $$
begin
  if new.matricula = '464139' then
    new.is_super_admin := true;
  elsif new.is_super_admin then
    raise exception 'Somente a matrícula 464139 pode ser super admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_super_admin on public.profiles;
create trigger profiles_super_admin
  before insert or update on public.profiles
  for each row execute function public.enforce_super_admin();

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and matricula = '464139'
      and is_super_admin
  );
$$;

-- ==========================================
-- 6. REGRAS DE SEGURANÇA (RLS)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.agronomos_contatos enable row level security;
alter table public.feed_posts enable row level security;
alter table public.manejos enable row level security;
alter table public.parcelas_croqui enable row level security;
alter table public.fenologia enable row level security;
alter table public.clima_estacao enable row level security;
alter table public.clima_historico enable row level security;

drop policy if exists profiles_select_staff on public.profiles;
drop policy if exists profiles_insert_super on public.profiles;
drop policy if exists profiles_update_super on public.profiles;
drop policy if exists "Leitura pública de perfis" on public.profiles;
drop policy if exists "Gerenciamento de perfis por super admin" on public.profiles;

create policy "Leitura pública de perfis" on public.profiles
  for select using (true);

-- Cadastro de administradores só pela matrícula 464139.
-- A própria matrícula 464139 também pode criar o primeiro perfil, antes de is_super_admin existir.
create policy "Gerenciamento de perfis por super admin" on public.profiles
  for all to authenticated
  using (public.is_super_admin() or (id = auth.uid() and matricula = '464139'))
  with check (public.is_super_admin() or (id = auth.uid() and matricula = '464139'));

drop policy if exists agronomos_public_read on public.agronomos_contatos;
drop policy if exists agronomos_staff_write on public.agronomos_contatos;
drop policy if exists "Leitura pública em agronomos_contatos" on public.agronomos_contatos;
drop policy if exists "Escrita restrita em agronomos_contatos" on public.agronomos_contatos;

create policy "Leitura pública em agronomos_contatos" on public.agronomos_contatos
  for select using (true);
create policy "Escrita restrita em agronomos_contatos" on public.agronomos_contatos
  for all to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists feed_public_read on public.feed_posts;
drop policy if exists feed_staff_write on public.feed_posts;
drop policy if exists "Leitura pública em feed_posts" on public.feed_posts;
drop policy if exists "Escrita restrita em feed_posts" on public.feed_posts;

create policy "Leitura pública em feed_posts" on public.feed_posts
  for select using (true);
create policy "Escrita restrita em feed_posts" on public.feed_posts
  for all to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists manejos_public_read on public.manejos;
drop policy if exists manejos_staff_write on public.manejos;
drop policy if exists "Leitura pública em manejos" on public.manejos;
drop policy if exists "Escrita restrita em manejos" on public.manejos;

create policy "Leitura pública em manejos" on public.manejos
  for select using (true);
create policy "Escrita restrita em manejos" on public.manejos
  for all to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists parcelas_public_read on public.parcelas_croqui;
drop policy if exists parcelas_staff_write on public.parcelas_croqui;
drop policy if exists "Leitura pública em parcelas_croqui" on public.parcelas_croqui;
drop policy if exists "Inclusão de parcelas por admins" on public.parcelas_croqui;
drop policy if exists "Atualização de parcelas por admins" on public.parcelas_croqui;
drop policy if exists "Exclusão de parcelas por admins" on public.parcelas_croqui;
drop policy if exists "Permitir leitura publica das parcelas" on public.parcelas_croqui;
drop policy if exists "Permitir alteracao apenas para usuarios autenticados" on public.parcelas_croqui;

create policy "Permitir leitura publica das parcelas"
on public.parcelas_croqui for select using (true);
create policy "Permitir alteracao apenas para usuarios autenticados"
on public.parcelas_croqui for all using (auth.role() = 'authenticated');

drop policy if exists fenologia_public_read on public.fenologia;
drop policy if exists fenologia_staff_write on public.fenologia;
create policy fenologia_public_read on public.fenologia
  for select to anon, authenticated using (true);
create policy fenologia_staff_write on public.fenologia
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists clima_public_read on public.clima_estacao;
drop policy if exists clima_staff_write on public.clima_estacao;
create policy clima_public_read on public.clima_estacao
  for select to anon, authenticated using (true);
create policy clima_staff_write on public.clima_estacao
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists clima_historico_public_read on public.clima_historico;
create policy clima_historico_public_read on public.clima_historico
  for select to anon, authenticated using (true);

drop policy if exists clima_historico_staff_write on public.clima_historico;
create policy clima_historico_staff_write on public.clima_historico
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Função para atualizar contagem de likes no Feed.
create or replace function public.increment_likes(post_id uuid)
returns integer
language plpgsql
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
$$;

revoke all on function public.increment_likes(uuid) from public;
grant execute on function public.increment_likes(uuid) to anon, authenticated;

drop function if exists public.ajustar_curtidas(uuid, integer);
