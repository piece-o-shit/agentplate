-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_settings table
create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null unique,
  theme text default 'light',
  notifications jsonb default '{"email": true, "push": true}'::jsonb,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activity_logs table
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create agents table
create table if not exists public.agents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  configuration jsonb default '{}'::jsonb,
  status text default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.activity_logs enable row level security;
alter table public.agents enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Create policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- Create policies for activity_logs
create policy "Users can view their own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "System can insert activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- Create policies for agents
create policy "Users can view their own agents"
  on public.agents for select
  using (auth.uid() = user_id);

create policy "Users can update their own agents"
  on public.agents for update
  using (auth.uid() = user_id);

create policy "Users can insert their own agents"
  on public.agents for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own agents"
  on public.agents for delete
  using (auth.uid() = user_id);

-- Create function to handle profile creation on user signup
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  -- Create empty profile
  insert into public.profiles (user_id)
  values (new.id);

  -- Create default settings
  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user profile
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create updated_at triggers
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at_user_settings
  before update on public.user_settings
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at_agents
  before update on public.agents
  for each row
  execute function public.handle_updated_at();
