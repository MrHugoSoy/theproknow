-- Activa la comunidad Carpintería.
-- Una comunidad "activa" permite unirse (RLS members_insert) y publicar (RLS posts_insert),
-- y aparece en el selector de /publicar y en el sitemap. Las inactivas se muestran "Próximamente".
update public.communities set is_active = true where slug = 'carpinteria';
