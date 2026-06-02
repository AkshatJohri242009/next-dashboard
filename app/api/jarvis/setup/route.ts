import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SQL = `
create extension if not exists vector with schema extensions;

create table if not exists jarvis_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  is_admin boolean default false,
  privileges jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create table if not exists jarvis_messages (
  id text primary key,
  session_id text references jarvis_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

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

create table if not exists jarvis_auth_sessions (
  token text primary key,
  user_id uuid references jarvis_users(id) on delete cascade not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

create index if not exists idx_jarvis_sessions_user on jarvis_sessions(user_id, last_accessed_at desc);
create index if not exists idx_jarvis_messages_session on jarvis_messages(session_id, created_at);
create index if not exists idx_jarvis_memories_user on jarvis_memories(user_id, created_at desc);
create index if not exists idx_jarvis_memories_category on jarvis_memories(category);
create index if not exists idx_jarvis_documents_user on jarvis_documents(user_id);
create index if not exists idx_jarvis_auth_sessions_expires on jarvis_auth_sessions(expires_at);
`

export async function POST(req: Request) {
  try {
    const { serviceRoleKey } = await req.json()
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Service role key required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SUPABASE_URL not set" }, { status: 500 })
    }

    // Use service role key to create tables via raw SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: SQL }),
    })

    if (!response.ok) {
      // rpc doesn't exist, try direct table creation approach
      // Create jarvis_users first to test if tables exist
      const db = createClient(supabaseUrl, serviceRoleKey)
      const { error: testError } = await db.from("jarvis_users").select("id").limit(1).maybeSingle()
      
      if (testError && testError.message?.includes("does not exist")) {
        // Tables don't exist - return SQL for manual execution
        return NextResponse.json({
          error: "Tables don't exist. Run the SQL in Supabase Dashboard.",
          needsManualSetup: true,
          sql: SQL,
          instructions: "1. Go to https://supabase.com/dashboard/project/kwpfxhxcxsxlkubycxcu/sql/new\n2. Paste the SQL below\n3. Click 'Run'",
        }, { status: 400 })
      }
    }

    // Verify tables were created
    const db = createClient(supabaseUrl, serviceRoleKey)
    const { data } = await db.from("jarvis_users").select("id").limit(1).maybeSingle()
    
    return NextResponse.json({
      success: true,
      tables_exist: !!data,
      message: data ? "JARVIS tables are ready" : "Tables may not exist yet",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Setup failed" }, { status: 500 })
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ status: "unconfigured", message: "Missing SUPABASE_SERVICE_ROLE_KEY" })
  }

  const db = createClient(supabaseUrl, serviceKey)
  const { data, error } = await db.from("jarvis_users").select("id").limit(1).maybeSingle()
  
  if (error && error.message?.includes("does not exist")) {
    return NextResponse.json({ status: "needs_setup", tables_exist: false })
  }
  
  return NextResponse.json({
    status: data ? "ready" : "empty",
    tables_exist: !error,
  })
}
