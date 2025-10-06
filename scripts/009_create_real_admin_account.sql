-- Create the real admin account for wouemboahmed@gmail.com
-- This script creates the authentication user and the corresponding entry in the users table

-- First, create the auth user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'wouemboahmed@gmail.com',
  crypt('@135792!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"RoomGo"}',
  false,
  'authenticated',
  'authenticated'
);

-- Then, create the corresponding entry in the public.users table
INSERT INTO public.users (id, email, username, user_type, created_at)
SELECT 
  id,
  'wouemboahmed@gmail.com',
  'RoomGo',
  'admin',
  now()
FROM auth.users
WHERE email = 'wouemboahmed@gmail.com';
