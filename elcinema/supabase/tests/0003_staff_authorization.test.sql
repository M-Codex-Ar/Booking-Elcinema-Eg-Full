begin;
select plan(12);

insert into public.profiles (id, email, role)
values ('00000000-0000-4000-8000-000000000001', 'rls-test@example.invalid', 'user')
on conflict (id) do update set role = 'user';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","app_metadata":{"role":"user"},"user_metadata":{"role":"admin"}}',
  true
);
select is(public.current_staff_role(), 'user', 'editable user_metadata cannot set a staff role');
select is(public.is_admin(), false, 'user_metadata cannot grant admin authorization');
select is(public.can_edit_managed_content(), false, 'ordinary users cannot edit managed content');
select throws_ok(
  $$update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'a user cannot promote their own profile'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated","app_metadata":{"role":"editor"}}',
  true
);
select is(public.can_edit_managed_content(), true, 'trusted editor claims permit content edits');
select lives_ok(
  $$insert into public.managed_movies (id, title_en) values ('00000000-0000-4000-8000-000000000002', 'RLS editor test')$$,
  'editors may create managed content'
);
select lives_ok(
  $$update public.managed_movies set title_en = 'RLS editor update' where id = '00000000-0000-4000-8000-000000000002'$$,
  'editors may update managed content'
);
select throws_ok(
  $$delete from public.managed_movies where id = '00000000-0000-4000-8000-000000000002'$$,
  '42501',
  null,
  'editors cannot delete managed content'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated","app_metadata":{"role":"viewer"}}',
  true
);
select is(public.can_edit_managed_content(), false, 'viewers remain read-only');
select throws_ok(
  $$insert into public.managed_movies (title_en) values ('RLS viewer test')$$,
  '42501',
  null,
  'viewers cannot write managed content'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000004","role":"authenticated","app_metadata":{"role":"admin"}}',
  true
);
select is(public.is_admin(), true, 'trusted admin claims permit administrative actions');
select lives_ok(
  $$delete from public.managed_movies where id = '00000000-0000-4000-8000-000000000002'$$,
  'admins may delete managed content'
);

select * from finish();
rollback;
