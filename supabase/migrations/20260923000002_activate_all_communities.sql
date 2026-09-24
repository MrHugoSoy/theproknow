-- Activa las comunidades que faltaban: Inteligencia Artificial, Negocios y Productividad.
-- Con esto las 6 comunidades iniciales quedan abiertas para unirse y publicar.
update public.communities set is_active = true where not is_active;
