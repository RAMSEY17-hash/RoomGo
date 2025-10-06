-- Create users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  user_type text not null check (user_type in ('student', 'owner', 'admin')),
  owner_key text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null check (type in ('chambre', 'studio', 'appartement')),
  price numeric not null,
  quartier text not null,
  nearby_schools text[] default '{}',
  address text not null,
  amenities text[] default '{}',
  images text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(listing_id, student_id)
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Create two_factor_codes table
create table if not exists public.two_factor_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  code text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Create owner_keys table (for managing owner registration keys)
create table if not exists public.owner_keys (
  id uuid primary key default gen_random_uuid(),
  key_value text unique not null,
  is_used boolean default false,
  used_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_listings_owner_id on public.listings(owner_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_quartier on public.listings(quartier);
create index if not exists idx_conversations_student_id on public.conversations(student_id);
create index if not exists idx_conversations_owner_id on public.conversations(owner_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_two_factor_codes_user_id on public.two_factor_codes(user_id);
