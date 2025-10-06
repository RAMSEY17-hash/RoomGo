-- Create default admin account
-- Email: admin@roomgo.com
-- Password: Admin123!
-- This account can be used to access the admin dashboard

-- First, check if admin already exists and delete if present (for re-running script)
delete from public.users where email = 'admin@roomgo.com';

-- Insert admin user
-- Note: In production, you should use Supabase Auth to create this user properly
-- For now, we'll create a basic entry
insert into public.users (
  id,
  email,
  username,
  user_type,
  phone,
  created_at
) values (
  gen_random_uuid(),
  'admin@roomgo.com',
  'Admin RoomGo',
  'admin',
  '+228 00 00 00 00',
  now()
);

-- Note: The password will need to be set through Supabase Auth
-- You can create this user manually in Supabase Dashboard > Authentication > Users
-- Or use the Supabase Auth API to create it programmatically
