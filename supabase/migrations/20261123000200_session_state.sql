-- Administrative state primitive; the event row serializes competing opens.
create function private.set_session_status(target_session_id uuid, expected_revision integer, desired_status public.session_status)
returns public.lecture_sessions language plpgsql security definer set search_path = '' as $$
declare target public.lecture_sessions;
begin
  select * into target from public.lecture_sessions where id = target_session_id;
  if not found or not private.is_organisation_admin(target.organisation_id) then
    raise exception using errcode = '42501', message = 'Session is not available';
  end if;
  if expected_revision is null or expected_revision < 0 or desired_status is null or desired_status not in ('open', 'closed') then
    raise exception using errcode = '22023', message = 'Invalid session transition';
  end if;
  perform 1 from public.events where id = target.event_id for update;
  select * into target from public.lecture_sessions where id = target_session_id for update;
  if target.revision <> expected_revision then
    raise exception using errcode = '40001', message = 'Session changed; refresh before retrying';
  end if;
  if target.status = desired_status then return target; end if;
  if desired_status = 'open' and exists (
    select 1 from public.lecture_sessions where event_id = target.event_id and id <> target.id and status = 'open'
  ) then
    raise exception using errcode = '23505', message = 'Another session is already open';
  end if;
  update public.lecture_sessions set status = desired_status where id = target_session_id returning * into target;
  return target;
end;
$$;

-- PostgREST exposes only this invoker wrapper; the implementation still verifies identity and membership.
create function public.set_session_status(target_session_id uuid, expected_revision integer, desired_status public.session_status)
returns public.lecture_sessions language sql security invoker set search_path = '' as $$
  select private.set_session_status(target_session_id, expected_revision, desired_status);
$$;

revoke all on function private.set_session_status(uuid, integer, public.session_status) from public, anon, authenticated;
revoke all on function public.set_session_status(uuid, integer, public.session_status) from public, anon, authenticated;
grant execute on function private.set_session_status(uuid, integer, public.session_status) to authenticated;
grant execute on function public.set_session_status(uuid, integer, public.session_status) to authenticated;
