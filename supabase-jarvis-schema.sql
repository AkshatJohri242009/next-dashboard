-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- Enables pgvector extension for vector search
create extension if not exists vector with schema extensions;

-- ============================
-- JARVIS Users (extends existing auth)
-- ============================
create table if not exists jarvis_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  is_admin boolean default false,
  privileges jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================
-- Chat Sessions
-- ============================
create table if not exists jarvis_sessions (
  id text primary key,
  name text not null default 'New Chat',
  user_id uuid references jarvis_users(id) on delete cascade,
  model text not null default 'gpt-4o',
  endpoint_url text default 'https://api.openai.com/v1',
  system_prompt text default '',
  mode text default 'chat' check (mode in ('chat', 'agent', 'research')),
  folder text,
  is_archived boolean default false,
  message_count integer default 0,
  total_input_tokens integer default 0,
  total_output_tokens integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now()
);

create index if not exists idx_jarvis_sessions_user on jarvis_sessions(user_id, last_accessed_at desc);

-- ============================
-- Chat Messages
-- ============================
create table if not exists jarvis_messages (
  id text primary key,
  session_id text references jarvis_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_jarvis_messages_session on jarvis_messages(session_id, created_at);

-- ============================
-- Memories
-- ============================
create table if not exists jarvis_memories (
  id text primary key,
  user_id uuid references jarvis_users(id) on delete cascade,
  text text not null,
  category text default 'fact',
  source text default 'user',
  session_id text references jarvis_sessions(id) on delete set null,
  embedding vector(384),
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_jarvis_memories_user on jarvis_memories(user_id, created_at desc);
create index if not exists idx_jarvis_memories_category on jarvis_memories(category);

-- ============================
-- Documents
-- ============================
create table if not exists jarvis_documents (
  id text primary key,
  user_id uuid references jarvis_users(id) on delete cascade,
  session_id text references jarvis_sessions(id) on delete set null,
  title text not null default 'Untitled',
  language text,
  content text default '',
  embedding vector(384),
  version_count integer default 1,
  is_active boolean default true,
  is_archived boolean default false,
  source text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_jarvis_documents_user on jarvis_documents(user_id);

-- ============================
-- LLM Endpoints
-- ============================
create table if not exists jarvis_endpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references jarvis_users(id) on delete cascade,
  name text not null,
  base_url text not null,
  api_key text,
  model_type text default 'llm' check (model_type in ('llm', 'image')),
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================
-- RLS Policies
-- ============================
alter table jarvis_users enable row level security;
alter table jarvis_sessions enable row level security;
alter table jarvis_messages enable row level security;
alter table jarvis_memories enable row level security;
alter table jarvis_documents enable row level security;
alter table jarvis_endpoints enable row level security;

-- Helper: get user_id from session
create or replace function jarvis_user_id()
returns uuid
language sql
stable
as $$
  select id from jarvis_users where username = current_setting('app.user_id', true);
$$;

-- ============================
-- Auth Sessions
-- ============================
create table if not exists jarvis_auth_sessions (
  token text primary key,
  user_id uuid references jarvis_users(id) on delete cascade not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_jarvis_auth_sessions_expires on jarvis_auth_sessions(expires_at);

-- Note: RLS policies use a service-role client, so we skip per-user RLS
-- and handle auth at the API route level instead.
