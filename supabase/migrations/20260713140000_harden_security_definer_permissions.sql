-- Harden SECURITY DEFINER function execution permissions.
--
-- Trigger-only functions are invoked by triggers and should not be directly
-- executable by client roles. Crew RLS helper functions are required by
-- authenticated RLS policies, so only authenticated keeps EXECUTE.

revoke all privileges on function public.handle_new_user() from public;
revoke all privileges on function public.handle_new_user() from anon;
revoke all privileges on function public.handle_new_user() from authenticated;

revoke all privileges on function public.noxa_insert_event_host_attendance() from public;
revoke all privileges on function public.noxa_insert_event_host_attendance() from anon;
revoke all privileges on function public.noxa_insert_event_host_attendance() from authenticated;

revoke all privileges on function public.noxa_insert_crew_owner_membership() from public;
revoke all privileges on function public.noxa_insert_crew_owner_membership() from anon;
revoke all privileges on function public.noxa_insert_crew_owner_membership() from authenticated;

revoke all privileges on function public.noxa_protect_crew_owner_and_touch_updated_at() from public;
revoke all privileges on function public.noxa_protect_crew_owner_and_touch_updated_at() from anon;
revoke all privileges on function public.noxa_protect_crew_owner_and_touch_updated_at() from authenticated;

revoke all privileges on function public.noxa_is_crew_public(uuid) from public;
revoke all privileges on function public.noxa_is_crew_public(uuid) from anon;
revoke all privileges on function public.noxa_is_crew_public(uuid) from authenticated;

grant execute on function public.noxa_is_crew_public(uuid) to authenticated;

revoke all privileges on function public.noxa_is_crew_member(uuid) from public;
revoke all privileges on function public.noxa_is_crew_member(uuid) from anon;
revoke all privileges on function public.noxa_is_crew_member(uuid) from authenticated;

grant execute on function public.noxa_is_crew_member(uuid) to authenticated;

revoke all privileges on function public.noxa_can_view_crew(uuid) from public;
revoke all privileges on function public.noxa_can_view_crew(uuid) from anon;
revoke all privileges on function public.noxa_can_view_crew(uuid) from authenticated;

grant execute on function public.noxa_can_view_crew(uuid) to authenticated;
