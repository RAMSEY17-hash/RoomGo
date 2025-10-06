-- Script simple pour créer le compte admin
-- Exécutez ce script dans votre SQL Editor Supabase

-- Étape 1: Supprimer l'ancien compte s'il existe
DELETE FROM public.users WHERE email = 'wouemboahmed@gmail.com';

-- Étape 2: Créer ou mettre à jour le compte dans auth.users
-- Note: Si le compte existe déjà dans auth.users, cette commande échouera
-- C'est normal, passez à l'étape 3
DO $$
BEGIN
  -- Essayer de créer le compte auth
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
    aud,
    confirmation_token,
    email_change_token_new,
    recovery_token
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
    'authenticated',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Le compte auth existe déjà, on continue...';
END $$;

-- Étape 3: Créer l'entrée dans public.users avec user_type = admin
INSERT INTO public.users (id, email, username, user_type, created_at)
SELECT 
  au.id,
  'wouemboahmed@gmail.com',
  'RoomGo',
  'admin',
  now()
FROM auth.users au
WHERE au.email = 'wouemboahmed@gmail.com'
ON CONFLICT (email) 
DO UPDATE SET 
  user_type = 'admin',
  username = 'RoomGo';

-- Vérification: Afficher le compte créé
SELECT 
  u.email,
  u.username,
  u.user_type,
  u.created_at
FROM public.users u
WHERE u.email = 'wouemboahmed@gmail.com';
