-- Reputación coherente al borrar contenido.
--
-- Problema: al borrar un post, sus likes / "Me ayudó" se eliminan en cascada, pero los triggers
-- de esas tablas buscan el post para saber quién es el autor y ya no existe, así que no descontaban
-- nada. El autor conservaba los puntos de un contenido que ya no existía (y borrar una reacción
-- suelta sí descontaba, lo cual era inconsistente).
--
-- Solución: descontar ANTES de borrar el post, usando sus contadores.

create or replace function public.on_post_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_answerer uuid;
begin
  -- +2 por like y +10 por "Me ayudó" que el autor había recibido en este post
  perform public.add_reputation(old.author_id, -(old.like_count * 2 + old.helpful_count * 10));

  -- la respuesta aceptada dio +15 a su autor (si no era el mismo autor de la pregunta)
  for v_answerer in
    select c.author_id from public.comments c
    where c.post_id = old.id and c.is_accepted and c.author_id <> old.author_id
  loop
    perform public.add_reputation(v_answerer, -15);
  end loop;
  return old;
end;
$$;

create trigger posts_before_delete
  before delete on public.posts
  for each row execute function public.on_post_deleted();

-- Borrar directamente una respuesta aceptada también retira sus +15.
-- (Si el comentario cae por cascada al borrar el post, el post ya no existe y se omite:
--  ese caso lo cubre on_post_deleted, sin contarlo dos veces.)
create or replace function public.on_comment_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_author uuid;
begin
  if old.is_accepted then
    select author_id into v_post_author from public.posts where id = old.post_id;
    if v_post_author is not null and old.author_id <> v_post_author then
      perform public.add_reputation(old.author_id, -15);
    end if;
  end if;
  return old;
end;
$$;

create trigger comments_before_delete
  before delete on public.comments
  for each row execute function public.on_comment_deleted();

revoke execute on function public.on_post_deleted(), public.on_comment_deleted() from public, anon, authenticated;
