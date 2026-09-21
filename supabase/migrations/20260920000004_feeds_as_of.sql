-- Paginación estable en feeds basados en puntaje.
-- El puntaje de Tendencias / Para ti depende de la hora actual; si cada página usa un now()
-- distinto, el orden se desplaza y una página puede repetir o saltarse posts. Ahora el cursor
-- lleva `p_as_of` (la hora de la primera página) y todas las páginas puntúan contra ese instante.
-- Los posts creados después de `p_as_of` no entran en esa sesión de paginación.

drop function if exists public.feed_nuevos(int, double precision, uuid, text, text);
drop function if exists public.feed_siguiendo(int, double precision, uuid, text, text);
drop function if exists public.feed_tendencias(int, double precision, uuid, text, text);
drop function if exists public.feed_para_ti(int, double precision, uuid, text, text);
drop function if exists public.feed_page(text, int, double precision, uuid, text, text);

create or replace function public.feed_page(
  p_mode             text,
  p_limit            int default 20,
  p_cursor_score     double precision default null,
  p_cursor_id        uuid default null,
  p_community_slug   text default null,
  p_author_username  text default null,
  p_as_of            timestamptz default null
)
returns setof public.feed_row
language plpgsql
stable
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := coalesce(p_as_of, now());
begin
  if p_mode not in ('nuevos', 'siguiendo', 'tendencias', 'para_ti') then
    raise exception 'Modo de feed inválido: %', p_mode using errcode = '22023';
  end if;

  return query
  select
    s.id, s.author_id, s.community_id, s.type, s.title, s.body_preview, s.cover_url, s.video_url,
    s.like_count, s.helpful_count, s.comment_count, s.save_count, s.created_at, s.score,
    s.author_username, s.author_display_name, s.author_avatar_url, s.author_is_verified, s.author_reputation,
    s.community_slug, s.community_name, s.community_icon, s.community_is_active,
    s.viewer_liked, s.viewer_helpful, s.viewer_saved, s.viewer_following, s.answerers
  from (
    select
      p.id, p.author_id, p.community_id, p.type, p.title,
      left(p.body, 700) as body_preview,
      p.cover_url, p.video_url,
      p.like_count, p.helpful_count, p.comment_count, p.save_count, p.created_at,
      (case
         when p_mode in ('nuevos', 'siguiendo')
           then floor(extract(epoch from p.created_at) * 1000)::double precision
         else
           ((p.helpful_count * 3 + p.like_count + p.comment_count * 2)::double precision
              / power(t.hrs + 2, 1.5))
           * (case when p_mode = 'para_ti'
                   then 1 + (case when f.following then 0.75 else 0 end)
                          + (case when f.joined    then 0.5  else 0 end)
                   else 1 end)
       end)::double precision as score,
      a.username     as author_username,
      a.display_name as author_display_name,
      a.avatar_url   as author_avatar_url,
      a.is_verified  as author_is_verified,
      a.reputation   as author_reputation,
      c.slug         as community_slug,
      c.name         as community_name,
      c.icon         as community_icon,
      c.is_active    as community_is_active,
      (v_uid is not null and exists (
         select 1 from public.likes l where l.user_id = v_uid and l.post_id = p.id))          as viewer_liked,
      (v_uid is not null and exists (
         select 1 from public.helpful_marks h where h.user_id = v_uid and h.post_id = p.id))  as viewer_helpful,
      (v_uid is not null and exists (
         select 1 from public.saves sv where sv.user_id = v_uid and sv.post_id = p.id))       as viewer_saved,
      f.following as viewer_following,
      case when p.type = 'pregunta' then (
        select coalesce(jsonb_agg(jsonb_build_object(
                 'display_name', x.display_name, 'avatar_url', x.avatar_url)), '[]'::jsonb)
        from (
          select distinct on (cm.author_id) pr.display_name, pr.avatar_url
          from public.comments cm
          join public.profiles pr on pr.id = cm.author_id
          where cm.post_id = p.id and cm.parent_id is null
          order by cm.author_id, cm.created_at desc
          limit 3
        ) x
      ) else '[]'::jsonb end as answerers
    from public.posts p
    join public.profiles a    on a.id = p.author_id
    join public.communities c on c.id = p.community_id
    cross join lateral (
      select greatest(extract(epoch from (v_now - p.created_at))::double precision / 3600.0, 0) as hrs
    ) t
    cross join lateral (
      select
        (v_uid is not null and exists (
           select 1 from public.follows fo
           where fo.follower_id = v_uid and fo.following_id = p.author_id)) as following,
        (v_uid is not null and exists (
           select 1 from public.community_members m
           where m.user_id = v_uid and m.community_id = p.community_id))   as joined
    ) f
    where p.created_at <= v_now
      and (p_community_slug  is null or c.slug = p_community_slug)
      and (p_author_username is null or a.username = p_author_username)
      and (p_mode <> 'siguiendo' or f.following or f.joined)
  ) s
  where p_cursor_score is null or (s.score, s.id) < (p_cursor_score, p_cursor_id)
  order by s.score desc, s.id desc
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
end;
$$;

create or replace function public.feed_nuevos(
  p_limit int default 20, p_cursor_score double precision default null, p_cursor_id uuid default null,
  p_community_slug text default null, p_author_username text default null, p_as_of timestamptz default null)
returns setof public.feed_row language sql stable set search_path = ''
as $$ select * from public.feed_page('nuevos', p_limit, p_cursor_score, p_cursor_id, p_community_slug, p_author_username, p_as_of) $$;

create or replace function public.feed_siguiendo(
  p_limit int default 20, p_cursor_score double precision default null, p_cursor_id uuid default null,
  p_community_slug text default null, p_author_username text default null, p_as_of timestamptz default null)
returns setof public.feed_row language sql stable set search_path = ''
as $$ select * from public.feed_page('siguiendo', p_limit, p_cursor_score, p_cursor_id, p_community_slug, p_author_username, p_as_of) $$;

create or replace function public.feed_tendencias(
  p_limit int default 20, p_cursor_score double precision default null, p_cursor_id uuid default null,
  p_community_slug text default null, p_author_username text default null, p_as_of timestamptz default null)
returns setof public.feed_row language sql stable set search_path = ''
as $$ select * from public.feed_page('tendencias', p_limit, p_cursor_score, p_cursor_id, p_community_slug, p_author_username, p_as_of) $$;

create or replace function public.feed_para_ti(
  p_limit int default 20, p_cursor_score double precision default null, p_cursor_id uuid default null,
  p_community_slug text default null, p_author_username text default null, p_as_of timestamptz default null)
returns setof public.feed_row language sql stable set search_path = ''
as $$ select * from public.feed_page('para_ti', p_limit, p_cursor_score, p_cursor_id, p_community_slug, p_author_username, p_as_of) $$;

revoke execute on function
  public.feed_page(text, int, double precision, uuid, text, text, timestamptz),
  public.feed_nuevos(int, double precision, uuid, text, text, timestamptz),
  public.feed_siguiendo(int, double precision, uuid, text, text, timestamptz),
  public.feed_tendencias(int, double precision, uuid, text, text, timestamptz),
  public.feed_para_ti(int, double precision, uuid, text, text, timestamptz)
from public;

grant execute on function
  public.feed_page(text, int, double precision, uuid, text, text, timestamptz),
  public.feed_nuevos(int, double precision, uuid, text, text, timestamptz),
  public.feed_siguiendo(int, double precision, uuid, text, text, timestamptz),
  public.feed_tendencias(int, double precision, uuid, text, text, timestamptz),
  public.feed_para_ti(int, double precision, uuid, text, text, timestamptz)
to anon, authenticated;
