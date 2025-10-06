-- Add phone column to users table
alter table public.users add column if not exists phone text;

-- Add owner_key column to listings table to track which owner created the listing
alter table public.listings add column if not exists owner_key text;

-- Create index for owner_key lookups
create index if not exists idx_listings_owner_key on public.listings(owner_key);

-- Update owner_keys table to add email field
alter table public.owner_keys add column if not exists owner_email text;
