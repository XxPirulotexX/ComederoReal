-- Ejecuta esto en el SQL Editor de Supabase.
create table status (
  id bigint generated always as identity primary key,
  device_id text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table commands (
  id bigint generated always as identity primary key,
  device_id text not null,
  action text not null,
  station text not null,
  args text default '',
  consumed boolean default false,
  created_at timestamptz default now()
);

create index on status (device_id, created_at desc);
create index on commands (device_id, consumed, created_at);
