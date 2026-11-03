-- Supabase Seed SQL for elCinema
-- Seeds the initial Admin account and User account in auth.users

-- 1. Enable pgcrypto extension for password hashing
create extension if not exists "pgcrypto";

-- 2. Seed Admin user (admin@elcinema.com / Admin123456!)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '8cef91a7-6960-496c-bed4-a240ace6e48b',
  'authenticated',
  'authenticated',
  'admin@elcinema.com',
  crypt('Admin123456!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"full_name":"elCinema Admin","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) on conflict (id) do update set
  encrypted_password = crypt('Admin123456!', gen_salt('bf')),
  raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"admin"}',
  raw_user_meta_data = '{"full_name":"elCinema Admin","role":"admin"}',
  email_confirmed_at = now(),
  updated_at = now();

-- 3. Seed regular User (user@elcinema.com / User123456!)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '2205875a-c8b3-4bb0-bab5-ad2e3ff60660',
  'authenticated',
  'authenticated',
  'user@elcinema.com',
  crypt('User123456!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"],"role":"user"}',
  '{"full_name":"elCinema Regular User","role":"user"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) on conflict (id) do update set
  encrypted_password = crypt('User123456!', gen_salt('bf')),
  raw_app_meta_data = '{"provider":"email","providers":["email"],"role":"user"}',
  raw_user_meta_data = '{"full_name":"elCinema Regular User","role":"user"}',
  email_confirmed_at = now(),
  updated_at = now();

