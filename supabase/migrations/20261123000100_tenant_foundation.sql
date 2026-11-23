-- Tenant relationships, stable event URLs and default-deny staff access.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create type public.staff_role as enum ('organisation_admin', 'moderator');
create type public.session_status as enum ('scheduled', 'open', 'closed');
create type public.question_status as enum ('new', 'selected', 'answered', 'dismissed');

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_memberships (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.staff_role not null,
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);
create index memberships_by_user on public.organisation_memberships(user_id, organisation_id);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  description text not null default '' check (char_length(description) <= 5000),
  starts_on date,
  ends_on date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, slug),
  unique (id, organisation_id),
  check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

create table public.lecture_sessions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  event_id uuid not null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  lecturer_name text check (char_length(lecturer_name) <= 160),
  position integer not null default 0 check (position >= 0),
  status public.session_status not null default 'scheduled',
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (event_id, organisation_id) references public.events(id, organisation_id) on delete cascade,
  unique (id, event_id, organisation_id),
  unique (id, organisation_id)
);
create index sessions_by_event on public.lecture_sessions(event_id, position, id);
create index sessions_by_organisation on public.lecture_sessions(organisation_id);
create unique index one_open_session_per_event on public.lecture_sessions(event_id) where status = 'open';

create table public.moderator_assignments (
  organisation_id uuid not null,
  session_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id),
  foreign key (session_id, organisation_id) references public.lecture_sessions(id, organisation_id) on delete cascade,
  foreign key (organisation_id, user_id) references public.organisation_memberships(organisation_id, user_id) on delete cascade
);
create index assignments_by_member on public.moderator_assignments(user_id, organisation_id, session_id);
create index assignments_by_organisation on public.moderator_assignments(organisation_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null,
  event_id uuid not null,
  session_id uuid not null,
  submission_id uuid not null,
  body text not null check (char_length(body) between 1 and 1000 and body ~ '[^[:space:]]'),
  status public.question_status not null default 'new',
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (session_id, event_id, organisation_id) references public.lecture_sessions(id, event_id, organisation_id) on delete cascade,
  unique (session_id, submission_id)
);
create index questions_by_session_status on public.questions(session_id, status, created_at, id);
create index questions_by_event on public.questions(event_id);
create index questions_by_organisation on public.questions(organisation_id);

-- These helpers are deliberately outside the Data API's exposed schemas.
create function private.is_organisation_admin(target_organisation_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organisation_memberships m
    where m.organisation_id = target_organisation_id
      and m.user_id = (select auth.uid()) and m.role = 'organisation_admin'
  );
$$;

create function private.can_access_session(target_session_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lecture_sessions s
    join public.organisation_memberships m on m.organisation_id = s.organisation_id
    where s.id = target_session_id and m.user_id = (select auth.uid())
      and (m.role = 'organisation_admin' or exists (
        select 1 from public.moderator_assignments a
        where a.session_id = s.id and a.organisation_id = m.organisation_id and a.user_id = m.user_id
      ))
  );
$$;

create function private.can_access_event(target_event_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.events e
    join public.organisation_memberships m on m.organisation_id = e.organisation_id
    where e.id = target_event_id and m.user_id = (select auth.uid())
      and (m.role = 'organisation_admin' or exists (
        select 1 from public.lecture_sessions s
        join public.moderator_assignments a on a.session_id = s.id and a.organisation_id = s.organisation_id
        where s.event_id = e.id and a.user_id = m.user_id
      ))
  );
$$;

create function private.touch_record()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if tg_table_name in ('lecture_sessions', 'questions') then new.revision := old.revision + 1; end if;
  return new;
end;
$$;

create function private.protect_identity()
returns trigger language plpgsql set search_path = '' as $$
declare column_name text;
begin
  foreach column_name in array tg_argv loop
    if to_jsonb(new)->column_name is distinct from to_jsonb(old)->column_name then
      raise exception using errcode = '23514', message = 'Record identity and permanent route fields cannot change';
    end if;
  end loop;
  return new;
end;
$$;

create trigger organisations_touch before update on public.organisations for each row execute function private.touch_record();
create trigger events_touch before update on public.events for each row execute function private.touch_record();
create trigger sessions_touch before update on public.lecture_sessions for each row execute function private.touch_record();
create trigger questions_touch before update on public.questions for each row execute function private.touch_record();
create trigger organisations_identity before update on public.organisations for each row execute function private.protect_identity('id', 'slug');
create trigger events_identity before update on public.events for each row execute function private.protect_identity('id', 'organisation_id', 'slug');
create trigger sessions_identity before update on public.lecture_sessions for each row execute function private.protect_identity('id', 'organisation_id', 'event_id');
create trigger questions_identity before update on public.questions for each row execute function private.protect_identity('id', 'organisation_id', 'event_id', 'session_id', 'submission_id', 'body');

alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.events enable row level security;
alter table public.lecture_sessions enable row level security;
alter table public.moderator_assignments enable row level security;
alter table public.questions enable row level security;

-- Remove Supabase's permissive default grants before selectively enabling access.
revoke all on public.organisations, public.organisation_memberships, public.events,
  public.lecture_sessions, public.moderator_assignments, public.questions from public, anon, authenticated;
grant select on public.organisations, public.events, public.lecture_sessions to anon, authenticated;
grant select on public.organisation_memberships, public.moderator_assignments, public.questions to authenticated;
grant update (name) on public.organisations to authenticated;
grant insert (organisation_id, name, slug, description, starts_on, ends_on) on public.events to authenticated;
grant update (name, description, starts_on, ends_on) on public.events to authenticated;
grant insert (organisation_id, event_id, title, lecturer_name, position) on public.lecture_sessions to authenticated;
grant update (title, lecturer_name, position) on public.lecture_sessions to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_organisation_admin(uuid), private.can_access_session(uuid), private.can_access_event(uuid) to authenticated;

create policy published_organisations on public.organisations for select to anon, authenticated using (
  exists (select 1 from public.events e where e.organisation_id = organisations.id and e.published_at is not null)
);
create policy member_organisations on public.organisations for select to authenticated using (
  exists (select 1 from public.organisation_memberships m where m.organisation_id = organisations.id and m.user_id = (select auth.uid()))
);
create policy admin_organisation_update on public.organisations for update to authenticated
  using (private.is_organisation_admin(id)) with check (private.is_organisation_admin(id));

create policy member_directory on public.organisation_memberships for select to authenticated
  using (user_id = (select auth.uid()) or private.is_organisation_admin(organisation_id));

create policy published_events on public.events for select to anon, authenticated using (published_at is not null);
create policy staff_events on public.events for select to authenticated using (
  private.is_organisation_admin(organisation_id) or private.can_access_event(id)
);
create policy admin_event_insert on public.events for insert to authenticated with check (private.is_organisation_admin(organisation_id));
create policy admin_event_update on public.events for update to authenticated
  using (private.is_organisation_admin(organisation_id)) with check (private.is_organisation_admin(organisation_id));

create policy current_public_session on public.lecture_sessions for select to anon, authenticated using (
  status = 'open' and exists (select 1 from public.events e where e.id = lecture_sessions.event_id and e.published_at is not null)
);
create policy assigned_sessions on public.lecture_sessions for select to authenticated using (
  private.is_organisation_admin(organisation_id) or private.can_access_session(id)
);
create policy admin_session_insert on public.lecture_sessions for insert to authenticated with check (private.is_organisation_admin(organisation_id));
create policy admin_session_update on public.lecture_sessions for update to authenticated
  using (private.is_organisation_admin(organisation_id)) with check (private.is_organisation_admin(organisation_id));

create policy assignment_directory on public.moderator_assignments for select to authenticated
  using (user_id = (select auth.uid()) or private.is_organisation_admin(organisation_id));
create policy private_staff_questions on public.questions for select to authenticated using (private.can_access_session(session_id));

comment on table public.questions is 'Private staff-only question records. No client writes until the validated, rate-limited submission boundary is implemented.';
comment on table public.organisation_memberships is 'Authoritative live staff roles. No self-service membership or role writes.';
