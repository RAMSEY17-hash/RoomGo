-- Create complete admin account with authentication
-- Email: admin@roomgo.com
-- Password: Admin123!

-- Step 1: Create the auth user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@roomgo.com';
  
  IF admin_user_id IS NULL THEN
    -- Create new admin user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@roomgo.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{}',
      FALSE,
      now(),
      now(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      NULL
    )
    RETURNING id INTO admin_user_id;
    
    -- Step 2: Create identity
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_user_id,
      format('{"sub":"%s","email":"%s"}', admin_user_id::text, 'admin@roomgo.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );
    
    -- Step 3: Create entry in public.users table
    INSERT INTO public.users (
      id,
      email,
      username,
      user_type,
      phone,
      is_active,
      created_at
    ) VALUES (
      admin_user_id,
      'admin@roomgo.com',
      'Admin RoomGo',
      'admin',
      '+228 00 00 00 00',
      TRUE,
      now()
    );
    
    RAISE NOTICE 'Admin account created successfully!';
  ELSE
    RAISE NOTICE 'Admin account already exists with ID: %', admin_user_id;
  END IF;
END $$;
