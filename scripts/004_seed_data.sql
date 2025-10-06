-- Insert some owner keys for testing
insert into public.owner_keys (key_value) values
  ('OWNER-2024-ABC123'),
  ('OWNER-2024-DEF456'),
  ('OWNER-2024-GHI789'),
  ('OWNER-2024-JKL012'),
  ('OWNER-2024-MNO345')
on conflict (key_value) do nothing;
