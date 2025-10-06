-- Drop existing listing policies
drop policy if exists "Anyone can view approved listings" on public.listings;
drop policy if exists "Admins can view all listings" on public.listings;

-- Create new policy to allow public access to validated listings
create policy "Anyone can view validated listings"
  on public.listings for select
  using (status = 'validee' or status = 'validated' or status = 'approved');

-- Allow anonymous users to view validated listings
create policy "Anonymous users can view validated listings"
  on public.listings for select
  to anon
  using (status = 'validee' or status = 'validated' or status = 'approved');

-- Allow authenticated users to view their own listings regardless of status
create policy "Owners can view their own listings"
  on public.listings for select
  to authenticated
  using (owner_id = auth.uid());

-- Admins can view all listings
create policy "Admins can view all listings"
  on public.listings for select
  to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and user_type = 'admin')
  );
