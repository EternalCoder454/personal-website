-- Content tables. Better Auth manages its own (user, session, account,
-- verification, twoFactor) via `npx @better-auth/cli migrate`.

create table if not exists skill (
  id        serial primary key,
  name      text    not null,
  level     integer not null check (level between 1 and 10),
  icon      text    not null,
  position  integer not null default 0
);

create table if not exists piece (
  id          serial primary key,
  section     text    not null check (section in ('pixel-art', 'builds')),
  src         text    not null,
  alt         text    not null default '',
  caption     text    not null default '',
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists piece_section_idx on piece (section, position);
