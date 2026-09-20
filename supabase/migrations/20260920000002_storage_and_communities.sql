-- Buckets de Storage (portadas y avatares) y comunidades iniciales

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers',  'covers',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública; escritura solo dentro de la carpeta del propio usuario: <uid>/archivo
create policy "storage_public_read" on storage.objects for select
  using (bucket_id in ('covers', 'avatars'));

create policy "storage_own_insert" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('covers', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_own_update" on storage.objects for update to authenticated
  using (
    bucket_id in ('covers', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_own_delete" on storage.objects for delete to authenticated
  using (
    bucket_id in ('covers', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Comunidades iniciales (datos de referencia, no ficticios)
insert into public.communities (slug, name, icon, description, is_active) values
  ('diseno-grafico',          'Diseño Gráfico',          'palette',   'Branding, tipografía, presentaciones, portafolios y herramientas de diseño.', true),
  ('fotografia',              'Fotografía',              'camera',    'Técnica, luz, composición, edición y fotografía de producto.',               true),
  ('inteligencia-artificial', 'Inteligencia Artificial', 'bot',       'Herramientas y usos prácticos de la IA en el trabajo diario.',               false),
  ('negocios',                'Negocios',                'briefcase', 'Emprendimiento, ventas, finanzas y estrategia.',                             false),
  ('carpinteria',             'Carpintería',             'hammer',    'Proyectos, herramientas y técnicas de trabajo en madera.',                   false),
  ('productividad',           'Productividad',           'zap',       'Hábitos, organización personal y sistemas de trabajo.',                      false)
on conflict (slug) do nothing;
