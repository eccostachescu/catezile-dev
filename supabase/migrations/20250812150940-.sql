-- 0015_auth_profile.sql (adapted to existing schema and is_admin())
-- 1) Extend profile table to include new columns without breaking existing role semantics
create extension if not exists citext with schema public;

alter table public.profile
  add column if not exists display_name text,
  add column if not exists handle citext,
  add column if not exists avatar_url text,
  add column if not exists locale text default 'ro-RO',
  add column if not exists timezone text default 'Europe/Bucharest';

-- ensure unique constraints
create unique index if not exists idx_profile_handle_unique on public.profile (handle);
create unique index if not exists idx_profile_email_unique on public.profile (email);

-- keep role values as 'USER'/'ADMIN' to match existing is_admin() implementation
-- updated_at trigger exists via public.set_updated_at; ensure trigger present
create trigger if not exists _profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();

-- 2) Settings table for notifications & marketing
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_reminders boolean default true,
  email_digest boolean default false,
  marketing_emails boolean default false,
  pushes boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger if not exists _user_settings_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();

-- 3) Email unsubscribe tokens
create table if not exists public.email_unsub (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'marketing',
  created_at timestamptz default now()
);

-- 4) RLS
alter table public.user_settings enable row level security;
alter table public.email_unsub enable row level security;
-- profile already had RLS configured; ensure policies cover new fields

-- profile policies
create policy if not exists "own profile" on public.profile for select using ((auth.uid() = id) or public.is_admin());
create policy if not exists "own profile update" on public.profile for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_settings policies
create policy if not exists "own settings" on public.user_settings for select using ((auth.uid() = user_id) or public.is_admin());
create policy if not exists "own settings upsert" on public.user_settings for insert with check (auth.uid() = user_id);
create policy if not exists "own settings update" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- email_unsub: system only (service role)
create policy if not exists "no direct access" on public.email_unsub for all using (false) with check (false);

-- 5) Trigger for auto-creating profile & settings at signup; also auto-admin allowlist
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile (id, email, display_name)
  values (new.id, new.email, split_part(new.email,'@',1))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if lower(new.email) = lower('eccostachescu@gmail.com') then
    update public.profile set role = 'ADMIN' where id = new.id;
  end if;

  return new;
end;$$;

-- Recreate trigger to ensure it's attached
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- 6) Storage: avatars bucket and policies (private; owner-only access)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Policies on storage.objects
-- Allow owners to view their own files in avatars bucket
create policy if not exists "Avatars viewable by owner"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow owners to upload into their own folder (first path segment must match uid)
create policy if not exists "Avatars upload by owner"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow owners to update their own files
create policy if not exists "Avatars update by owner"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins full access on avatars
create policy if not exists "Admins manage avatars"
  on storage.objects for all
  using (bucket_id = 'avatars' and public.is_admin())
  with check (bucket_id = 'avatars' and public.is_admin());