-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Habits table
create table if not exists habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  color text not null default '#6366f1',
  notify_time text not null default '09:00',
  is_active boolean not null default true,
  created_at timestamptz default now() not null
);

-- Habit logs table
create table if not exists habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz default now() not null,
  unique(habit_id, date)
);

-- Row Level Security
alter table habits enable row level security;
alter table habit_logs enable row level security;

-- Policies for habits
create policy "Users can view own habits"
  on habits for select using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on habits for insert with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on habits for update using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on habits for delete using (auth.uid() = user_id);

-- Policies for habit_logs
create policy "Users can view own habit logs"
  on habit_logs for select using (auth.uid() = user_id);

create policy "Users can insert own habit logs"
  on habit_logs for insert with check (auth.uid() = user_id);

create policy "Users can update own habit logs"
  on habit_logs for update using (auth.uid() = user_id);

create policy "Users can delete own habit logs"
  on habit_logs for delete using (auth.uid() = user_id);
