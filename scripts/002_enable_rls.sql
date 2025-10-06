-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.two_factor_codes enable row level security;
alter table public.owner_keys enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Anyone can view usernames for messaging"
  on public.users for select
  using (true);

-- Listings policies
create policy "Anyone can view approved listings"
  on public.listings for select
  using (status = 'approved' or owner_id = auth.uid());

create policy "Owners can create listings"
  on public.listings for insert
  with check (
    auth.uid() = owner_id and
    exists (select 1 from public.users where id = auth.uid() and user_type = 'owner')
  );

create policy "Owners can update their own listings"
  on public.listings for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their own listings"
  on public.listings for delete
  using (auth.uid() = owner_id);

create policy "Admins can view all listings"
  on public.listings for select
  using (
    exists (select 1 from public.users where id = auth.uid() and user_type = 'admin')
  );

create policy "Admins can update any listing"
  on public.listings for update
  using (
    exists (select 1 from public.users where id = auth.uid() and user_type = 'admin')
  );

-- Conversations policies
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = student_id or auth.uid() = owner_id);

create policy "Students can create conversations"
  on public.conversations for insert
  with check (
    auth.uid() = student_id and
    exists (select 1 from public.users where id = auth.uid() and user_type = 'student')
  );

-- Messages policies
create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (student_id = auth.uid() or owner_id = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (student_id = auth.uid() or owner_id = auth.uid())
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations
      where id = conversation_id
      and (student_id = auth.uid() or owner_id = auth.uid())
    )
  );

-- Two factor codes policies
create policy "Users can view their own 2FA codes"
  on public.two_factor_codes for select
  using (auth.uid() = user_id);

create policy "System can create 2FA codes"
  on public.two_factor_codes for insert
  with check (true);

create policy "System can delete expired 2FA codes"
  on public.two_factor_codes for delete
  using (true);

-- Owner keys policies
create policy "Anyone can view unused owner keys"
  on public.owner_keys for select
  using (not is_used);

create policy "Admins can manage owner keys"
  on public.owner_keys for all
  using (
    exists (select 1 from public.users where id = auth.uid() and user_type = 'admin')
  );
