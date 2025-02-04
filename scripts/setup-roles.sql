-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create roles table
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_roles junction table
create table if not exists public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  role_id uuid references public.roles not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role_id)
);

-- Insert default roles if they don't exist
insert into public.roles (name, description)
values
  ('user', 'Default role for all registered users'),
  ('admin', 'Administrative role with full system access')
on conflict (name) do nothing;

-- Enable Row Level Security (RLS)
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

-- Create policies for roles table
create policy "Roles are viewable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

create policy "Roles are insertable by admins only"
  on public.roles for insert
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      inner join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "Roles are updatable by admins only"
  on public.roles for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      inner join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "Roles are deletable by admins only"
  on public.roles for delete
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      inner join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

-- Create policies for user_roles table
create policy "User roles are viewable by authenticated users"
  on public.user_roles for select
  to authenticated
  using (true);

create policy "User roles are insertable by admins only"
  on public.user_roles for insert
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      inner join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

create policy "User roles are deletable by admins only"
  on public.user_roles for delete
  to authenticated
  using (
    exists (
      select 1
      from public.user_roles ur
      inner join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid()
      and r.name = 'admin'
    )
  );

-- Create function to assign default role to new users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role_id uuid;
begin
  -- Get the 'user' role id
  select id into default_role_id from public.roles where name = 'user';
  
  -- Assign the default role to the new user
  insert into public.user_roles (user_id, role_id)
  values (new.id, default_role_id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically assign default role to new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
