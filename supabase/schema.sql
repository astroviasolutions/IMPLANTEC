-- Implantec Odontologia — schema (NÃO aplicado). RLS ligado em tudo.
-- Papéis: perfil em public.profiles (role: admin | dentista | recepcao).
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nome text not null, role text not null default 'recepcao' check (role in ('admin','dentista','recepcao'))
);
create function public.is_staff() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from profiles where id = auth.uid()) $$;
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from profiles where id = auth.uid() and role='admin') $$;

create table public.dentists (id uuid primary key default gen_random_uuid(), nome text not null, cro text, especialidade text,
  comissao_pct numeric(5,2) not null default 0, cor text default '#0e7490', ativo boolean default true);
create table public.services (id uuid primary key default gen_random_uuid(), nome text not null, categoria text,
  duracao_min int not null default 30, preco numeric(10,2) not null default 0, ativo boolean default true);
create table public.patients (id uuid primary key default gen_random_uuid(), nome text not null, whatsapp text, cpf text,
  nascimento date, email text, anamnese jsonb default '{}', odontograma jsonb default '{}', observacoes text,
  criado_em timestamptz default now());
create table public.appointments (id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients on delete set null, dentist_id uuid references dentists, service_id uuid references services,
  inicio timestamptz not null, fim timestamptz not null,
  status text not null default 'agendado' check (status in ('agendado','confirmado','em_atendimento','concluido','faltou','cancelado')),
  origem text default 'interno', nome_externo text, whatsapp_externo text, observacoes text, criado_em timestamptz default now());
create table public.budgets (id uuid primary key default gen_random_uuid(), patient_id uuid references patients on delete cascade,
  dentist_id uuid references dentists, itens jsonb not null default '[]', desconto numeric(10,2) default 0,
  status text not null default 'aberto' check (status in ('aberto','aprovado','recusado','concluido')),
  parcelas int default 1, criado_em timestamptz default now());
create table public.payments (id uuid primary key default gen_random_uuid(), patient_id uuid references patients, budget_id uuid references budgets,
  appointment_id uuid references appointments, dentist_id uuid references dentists, valor numeric(10,2) not null,
  forma text not null check (forma in ('pix','dinheiro','debito','credito','boleto','convenio')), data timestamptz default now(), obs text);
create table public.expenses (id uuid primary key default gen_random_uuid(), descricao text not null, categoria text,
  valor numeric(10,2) not null, data date default current_date);
create table public.notices (id uuid primary key default gen_random_uuid(), titulo text not null, texto text, ativo boolean default true, criado_em timestamptz default now());
create table public.signed_terms (id uuid primary key default gen_random_uuid(), patient_id uuid references patients on delete cascade,
  tipo text not null, arquivo_path text not null, criado_em timestamptz default now());
create table public.settings (chave text primary key, valor jsonb not null);

do $$ declare t text; begin
 foreach t in array array['profiles','dentists','services','patients','appointments','budgets','payments','expenses','notices','signed_terms','settings'] loop
  execute format('alter table public.%I enable row level security', t);
  execute format('create policy "staff_all" on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t);
 end loop; end $$;
-- Dados sensíveis financeiros/perfis: só admin escreve
drop policy "staff_all" on public.expenses;
create policy "admin_expenses" on public.expenses for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy "staff_all" on public.profiles;
create policy "profiles_read" on public.profiles for select to authenticated using (public.is_staff());
create policy "profiles_admin" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Público (site de agendamento): só catálogo + horários ocupados, nunca dados de paciente.
create policy "public_services" on public.services for select to anon using (ativo);
create policy "public_dentists" on public.dentists for select to anon using (ativo);
create policy "public_notices" on public.notices for select to anon using (ativo);
create or replace function public.horarios_ocupados(p_dentist uuid, p_dia date)
returns table(inicio timestamptz, fim timestamptz) language sql stable security definer set search_path=public as
$$ select inicio, fim from appointments where dentist_id=p_dentist and status not in ('cancelado','faltou')
   and inicio::date = p_dia $$;
grant execute on function public.horarios_ocupados to anon;
create or replace function public.agendar_publico(p_nome text, p_whatsapp text, p_dentist uuid, p_service uuid, p_inicio timestamptz)
returns uuid language plpgsql security definer set search_path=public as $$
declare dur int; novo uuid; begin
  if length(regexp_replace(p_whatsapp,'\D','','g')) < 10 then raise exception 'WhatsApp inválido'; end if;
  select duracao_min into dur from services where id=p_service and ativo; if dur is null then raise exception 'Serviço inválido'; end if;
  if exists(select 1 from appointments where dentist_id=p_dentist and status not in ('cancelado','faltou')
            and tstzrange(inicio,fim) && tstzrange(p_inicio, p_inicio + make_interval(mins=>dur))) then raise exception 'Horário indisponível'; end if;
  insert into appointments(dentist_id,service_id,inicio,fim,origem,nome_externo,whatsapp_externo)
  values(p_dentist,p_service,p_inicio,p_inicio+make_interval(mins=>dur),'site',p_nome,p_whatsapp) returning id into novo;
  return novo; end $$;
grant execute on function public.agendar_publico to anon;

-- Storage: criar bucket privado "termos" (PDFs assinados) com policy só para authenticated staff.
