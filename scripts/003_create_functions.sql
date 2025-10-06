-- Function to automatically create user profile after auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, email, user_type, owner_key)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'user_type', 'student'),
    new.raw_user_meta_data ->> 'owner_key'
  );
  return new;
end;
$$;

-- Trigger to call the function after user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger set_updated_at_users
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_listings
  before update on public.listings
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_conversations
  before update on public.conversations
  for each row
  execute function public.handle_updated_at();
