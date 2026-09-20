-- TheProKnow · esquema base, triggers, reputación y RLS
-- Idempotente en lo posible; pensado para correr una vez sobre un proyecto vacío.

-- ─────────────────────────────────────────────────────────────
-- Tipos
-- ─────────────────────────────────────────────────────────────
create type public.post_type as enum ('consejo', 'pregunta', 'tutorial', 'articulo');
create type public.notification_type as enum ('like', 'helpful', 'comment', 'reply', 'accepted', 'follow');

-- ─────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_.]{3,30}$'),
  display_name  text not null check (char_length(display_name) between 1 and 60),
  avatar_url    text,
  bio           text check (char_length(bio) <= 280),
  reputation    int not null default 0 check (reputation >= 0),
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table public.communities (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  icon         text not null default 'users',
  description  text,
  is_active    boolean not null default false
);

create table public.community_members (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  community_id  uuid not null references public.communities (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, community_id)
);

create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles (id) on delete cascade,
  community_id   uuid not null references public.communities (id) on delete restrict,
  type           public.post_type not null,
  title          text not null check (char_length(title) between 5 and 140),
  body           text not null check (char_length(body) between 1 and 20000),
  cover_url      text,
  video_url      text,
  like_count     int not null default 0,
  helpful_count  int not null default 0,
  comment_count  int not null default 0,
  save_count     int not null default 0,
  hidden         boolean not null default false,
  created_at     timestamptz not null default now()
);

create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts (id) on delete cascade,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  parent_id    uuid references public.comments (id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 5000),
  is_accepted  boolean not null default false,
  created_at   timestamptz not null default now()
);

create table public.likes (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.helpful_marks (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.saves (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  post_id     uuid not null references public.posts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table public.follows (
  follower_id   uuid not null references public.profiles (id) on delete cascade,
  following_id  uuid not null references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  actor_id    uuid not null references public.profiles (id) on delete cascade,
  type        public.notification_type not null,
  post_id     uuid references public.posts (id) on delete cascade,
  comment_id  uuid references public.comments (id) on delete cascade,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles (id) on delete cascade,
  post_id      uuid references public.posts (id) on delete cascade,
  comment_id   uuid references public.comments (id) on delete cascade,
  reason       text not null check (char_length(reason) between 3 and 500),
  created_at   timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1)
);

-- ─────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────
create index posts_created_at_idx        on public.posts (created_at desc, id desc);
create index posts_community_idx         on public.posts (community_id, created_at desc);
create index posts_author_idx            on public.posts (author_id, created_at desc);
create index comments_post_idx           on public.comments (post_id, created_at);
create index comments_author_idx         on public.comments (author_id);
create index comments_parent_idx         on public.comments (parent_id);
create index follows_following_idx       on public.follows (following_id);
create index community_members_comm_idx  on public.community_members (community_id);
create index notifications_user_idx      on public.notifications (user_id, created_at desc);
create index saves_user_idx              on public.saves (user_id, created_at desc);
create index profiles_reputation_idx     on public.profiles (reputation desc);
create unique index reports_unique_post    on public.reports (reporter_id, post_id)    where post_id is not null;
create unique index reports_unique_comment on public.reports (reporter_id, comment_id) where comment_id is not null;

-- ─────────────────────────────────────────────────────────────
-- Reputación: niveles
-- ─────────────────────────────────────────────────────────────
create or replace function public.reputation_level(points int)
returns table (level int, name text, progress int, next_level_at int)
language sql
immutable
set search_path = ''
as $$
  with l (lvl, nm, lo) as (
    values (1, 'Novato', 0), (2, 'Aprendiz', 100), (3, 'Conocedor', 500),
           (4, 'Experto', 2000), (5, 'Maestro', 5000)
  ),
  p as (select greatest(coalesce(points, 0), 0) as pts),
  cur as (select l.* from l, p where l.lo <= p.pts order by l.lo desc limit 1),
  nxt as (select l.* from l, p where l.lo > p.pts order by l.lo asc limit 1)
  select
    cur.lvl,
    cur.nm,
    case when nxt.lo is null then 100
         else round(100.0 * ((select pts from p) - cur.lo) / (nxt.lo - cur.lo))::int end,
    nxt.lo
  from cur left join nxt on true
$$;

-- ─────────────────────────────────────────────────────────────
-- Funciones internas (NO expuestas por la API)
-- ─────────────────────────────────────────────────────────────
create or replace function public.add_reputation(uid uuid, delta int)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set reputation = greatest(0, reputation + delta) where id = uid;
$$;

-- Perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  base       text;
  candidate  text;
  dname      text;
begin
  base := lower(regexp_replace(
            coalesce(nullif(meta ->> 'username', ''), split_part(coalesce(new.email, ''), '@', 1), ''),
            '[^a-zA-Z0-9_.]', '', 'g'));
  if char_length(base) < 3 then
    base := 'usuario' || base;
  end if;
  base := left(base, 24);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base || (1000 + floor(random() * 9000))::int;
  end loop;

  dname := left(coalesce(nullif(meta ->> 'display_name', ''), nullif(meta ->> 'full_name', ''),
                         nullif(meta ->> 'name', ''), candidate), 60);

  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, candidate, dname, coalesce(meta ->> 'avatar_url', meta ->> 'picture'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Anti-abuso: no reaccionar a tu propio post
create or replace function public.prevent_self_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.posts where id = new.post_id and author_id = new.user_id) then
    raise exception 'No puedes reaccionar a tu propia publicación' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger likes_no_self before insert on public.likes
  for each row execute function public.prevent_self_reaction();
create trigger helpful_no_self before insert on public.helpful_marks
  for each row execute function public.prevent_self_reaction();

-- Rate limit básico (a nivel de base de datos, aplica también a la API directa)
create or replace function public.rate_limit_posts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.posts
        where author_id = new.author_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'rate_limit: demasiadas publicaciones, intenta más tarde' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger posts_rate_limit before insert on public.posts
  for each row execute function public.rate_limit_posts();

create or replace function public.rate_limit_comments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.comments
        where author_id = new.author_id and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'rate_limit: demasiados comentarios, intenta más tarde' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Comentarios: anidación a 1 nivel + rate limit
create or replace function public.validate_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_parent uuid;
  p_post   uuid;
begin
  if new.parent_id is not null then
    select parent_id, post_id into p_parent, p_post from public.comments where id = new.parent_id;
    if not found or p_parent is not null or p_post <> new.post_id then
      raise exception 'Respuesta inválida: solo se permite un nivel de anidación' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
create trigger comments_validate before insert on public.comments
  for each row execute function public.validate_comment();
create trigger comments_rate_limit before insert on public.comments
  for each row execute function public.rate_limit_comments();

-- ─────────────────────────────────────────────────────────────
-- Contadores, reputación y notificaciones
-- ─────────────────────────────────────────────────────────────
create or replace function public.on_like_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_author uuid;
begin
  if tg_op = 'INSERT' then
    select author_id into v_author from public.posts where id = new.post_id;
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    perform public.add_reputation(v_author, 2);
    insert into public.notifications (user_id, actor_id, type, post_id)
      values (v_author, new.user_id, 'like', new.post_id);
    return new;
  else
    select author_id into v_author from public.posts where id = old.post_id;
    update public.posts set like_count = greatest(0, like_count - 1) where id = old.post_id;
    perform public.add_reputation(v_author, -2);
    delete from public.notifications
      where actor_id = old.user_id and post_id = old.post_id and type = 'like';
    return old;
  end if;
end;
$$;
create trigger likes_counter after insert or delete on public.likes
  for each row execute function public.on_like_change();

create or replace function public.on_helpful_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_author uuid;
begin
  if tg_op = 'INSERT' then
    select author_id into v_author from public.posts where id = new.post_id;
    update public.posts set helpful_count = helpful_count + 1 where id = new.post_id;
    perform public.add_reputation(v_author, 10);
    insert into public.notifications (user_id, actor_id, type, post_id)
      values (v_author, new.user_id, 'helpful', new.post_id);
    return new;
  else
    select author_id into v_author from public.posts where id = old.post_id;
    update public.posts set helpful_count = greatest(0, helpful_count - 1) where id = old.post_id;
    perform public.add_reputation(v_author, -10);
    delete from public.notifications
      where actor_id = old.user_id and post_id = old.post_id and type = 'helpful';
    return old;
  end if;
end;
$$;
create trigger helpful_counter after insert or delete on public.helpful_marks
  for each row execute function public.on_helpful_change();

create or replace function public.on_save_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set save_count = save_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set save_count = greatest(0, save_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$;
create trigger saves_counter after insert or delete on public.saves
  for each row execute function public.on_save_change();

create or replace function public.on_comment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_author   uuid;
  v_parent_author uuid;
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    select author_id into v_post_author from public.posts where id = new.post_id;
    if new.parent_id is null then
      if v_post_author <> new.author_id then
        insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
          values (v_post_author, new.author_id, 'comment', new.post_id, new.id);
      end if;
    else
      select author_id into v_parent_author from public.comments where id = new.parent_id;
      if v_parent_author <> new.author_id then
        insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
          values (v_parent_author, new.author_id, 'reply', new.post_id, new.id);
      end if;
    end if;
    return new;
  else
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$;
create trigger comments_counter after insert or delete on public.comments
  for each row execute function public.on_comment_change();

-- Respuesta aceptada: +15 de reputación (solo si no es el propio autor)
create or replace function public.on_comment_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare v_post_author uuid;
begin
  if new.is_accepted is distinct from old.is_accepted then
    select author_id into v_post_author from public.posts where id = new.post_id;
    if new.author_id <> v_post_author then
      perform public.add_reputation(new.author_id, case when new.is_accepted then 15 else -15 end);
      if new.is_accepted then
        insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
          values (new.author_id, v_post_author, 'accepted', new.post_id, new.id);
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger comments_accepted after update of is_accepted on public.comments
  for each row execute function public.on_comment_accepted();

create or replace function public.on_follow_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, actor_id, type)
      values (new.following_id, new.follower_id, 'follow');
    return new;
  else
    delete from public.notifications
      where user_id = old.following_id and actor_id = old.follower_id and type = 'follow';
    return old;
  end if;
end;
$$;
create trigger follows_notify after insert or delete on public.follows
  for each row execute function public.on_follow_change();

-- 5 reportes de usuarios distintos ocultan el post automáticamente
create or replace function public.on_report_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.post_id is not null
     and (select count(distinct reporter_id) from public.reports where post_id = new.post_id) >= 5 then
    update public.posts set hidden = true where id = new.post_id;
  end if;
  return new;
end;
$$;
create trigger reports_autohide after insert on public.reports
  for each row execute function public.on_report_created();

-- ─────────────────────────────────────────────────────────────
-- RPC pública: aceptar / quitar respuesta aceptada (solo autor de la pregunta)
-- ─────────────────────────────────────────────────────────────
create or replace function public.toggle_accepted_answer(p_comment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  c          public.comments%rowtype;
  p          public.posts%rowtype;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión' using errcode = '28000';
  end if;
  select * into c from public.comments where id = p_comment_id;
  if not found then raise exception 'Comentario no encontrado' using errcode = 'P0002'; end if;
  select * into p from public.posts where id = c.post_id;
  if p.author_id <> v_uid then
    raise exception 'Solo el autor de la pregunta puede aceptar una respuesta' using errcode = '42501';
  end if;
  if p.type <> 'pregunta' or c.parent_id is not null or c.author_id = v_uid then
    raise exception 'Respuesta no elegible' using errcode = '23514';
  end if;

  if c.is_accepted then
    update public.comments set is_accepted = false where id = c.id;
    return false;
  end if;
  update public.comments set is_accepted = false where post_id = c.post_id and is_accepted;
  update public.comments set is_accepted = true where id = c.id;
  return true;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Permisos de funciones: nada interno queda expuesto vía RPC
-- ─────────────────────────────────────────────────────────────
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.reputation_level(int) to anon, authenticated;
grant execute on function public.toggle_accepted_answer(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS en TODAS las tablas
-- ─────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.communities       enable row level security;
alter table public.community_members enable row level security;
alter table public.posts             enable row level security;
alter table public.comments          enable row level security;
alter table public.likes             enable row level security;
alter table public.helpful_marks     enable row level security;
alter table public.saves             enable row level security;
alter table public.follows           enable row level security;
alter table public.notifications     enable row level security;
alter table public.reports           enable row level security;

-- Permisos a nivel de tabla/columna (además de las políticas)
revoke all on all tables in schema public from anon, authenticated;

grant select on public.profiles, public.communities, public.community_members,
                public.posts, public.comments, public.follows to anon, authenticated;
grant select on public.likes, public.helpful_marks, public.saves, public.notifications to authenticated;

-- El usuario nunca escribe reputación ni is_verified
grant update (username, display_name, avatar_url, bio) on public.profiles to authenticated;

grant insert (author_id, community_id, type, title, body, cover_url, video_url) on public.posts to authenticated;
grant update (title, body, cover_url, video_url) on public.posts to authenticated;
grant delete on public.posts to authenticated;

grant insert (post_id, author_id, parent_id, body) on public.comments to authenticated;
grant update (body) on public.comments to authenticated;
grant delete on public.comments to authenticated;

grant insert (user_id, post_id) on public.likes, public.helpful_marks, public.saves to authenticated;
grant delete on public.likes, public.helpful_marks, public.saves to authenticated;
grant insert (follower_id, following_id) on public.follows to authenticated;
grant delete on public.follows to authenticated;
grant insert (user_id, community_id) on public.community_members to authenticated;
grant delete on public.community_members to authenticated;
grant update (read) on public.notifications to authenticated;
grant delete on public.notifications to authenticated;
grant insert (reporter_id, post_id, comment_id, reason) on public.reports to authenticated;

-- ── Políticas ──
-- profiles
create policy profiles_select on public.profiles for select using (true);
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- communities (solo lectura pública; se administran por migración)
create policy communities_select on public.communities for select using (true);

-- community_members
create policy members_select on public.community_members for select using (true);
create policy members_insert on public.community_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.communities c where c.id = community_id and c.is_active)
  );
create policy members_delete on public.community_members for delete to authenticated
  using (user_id = auth.uid());

-- posts
create policy posts_select on public.posts for select
  using (not hidden or author_id = auth.uid());
create policy posts_insert on public.posts for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.communities c where c.id = community_id and c.is_active)
  );
create policy posts_update on public.posts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy posts_delete on public.posts for delete to authenticated
  using (author_id = auth.uid());

-- comments
create policy comments_select on public.comments for select
  using (exists (
    select 1 from public.posts p
    where p.id = post_id and (not p.hidden or p.author_id = auth.uid())
  ));
create policy comments_insert on public.comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and not p.hidden)
  );
create policy comments_update on public.comments for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy comments_delete on public.comments for delete to authenticated
  using (author_id = auth.uid());

-- likes / helpful / saves: privados, solo su propio user_id
create policy likes_select on public.likes for select to authenticated using (user_id = auth.uid());
create policy likes_insert on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy likes_delete on public.likes for delete to authenticated using (user_id = auth.uid());

create policy helpful_select on public.helpful_marks for select to authenticated using (user_id = auth.uid());
create policy helpful_insert on public.helpful_marks for insert to authenticated with check (user_id = auth.uid());
create policy helpful_delete on public.helpful_marks for delete to authenticated using (user_id = auth.uid());

create policy saves_select on public.saves for select to authenticated using (user_id = auth.uid());
create policy saves_insert on public.saves for insert to authenticated with check (user_id = auth.uid());
create policy saves_delete on public.saves for delete to authenticated using (user_id = auth.uid());

-- follows: el grafo es público, solo escribe el propio follower
create policy follows_select on public.follows for select using (true);
create policy follows_insert on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete to authenticated using (follower_id = auth.uid());

-- notifications: solo las propias; se crean únicamente desde triggers
create policy notifications_select on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

-- reports: solo insertar (la moderación se hace con service role)
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());
