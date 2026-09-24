-- TheProKnow · datos de ejemplo ADICIONALES para Carpintería, Inteligencia Artificial, Negocios y Productividad.
--
-- Complementa a seed.sql SIN tocarlo: agrega 8 usuarios ficticios nuevos, 16 publicaciones y comentarios
-- en esas 4 comunidades. Los usuarios usan el mismo dominio @seed.theproknow.test, así que la limpieza
-- de datos de ejemplo del README los cubre igual.
--
-- Requiere que seed.sql ya se haya ejecutado (usa a sus usuarios para preguntar y comentar).
-- Es idempotente respecto a sí mismo: borra y recrea SOLO a los 8 usuarios nuevos y lo que cuelga de ellos.
-- No vuelvas a ejecutar seed.sql en un sitio con datos reales: recrearía sus posts con IDs nuevos.

delete from auth.users where email in (
  'robertoduarte@seed.theproknow.test', 'elenacardenas@seed.theproknow.test',
  'danielsoto@seed.theproknow.test',    'paolareyes@seed.theproknow.test',
  'fernandogil@seed.theproknow.test',   'monicalara@seed.theproknow.test',
  'sergioibarra@seed.theproknow.test',  'adrianaposada@seed.theproknow.test'
);

-- ── Usuarios ────────────────────────────────────────────────────────────────
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  u.username || '@seed.theproknow.test', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('username', u.username, 'display_name', u.display_name),
  now() - (u.days || ' days')::interval, now()
from (values
  ('robertoduarte', 'Roberto Duarte', 350),
  ('elenacardenas', 'Elena Cárdenas', 270),
  ('danielsoto',    'Daniel Soto',    330),
  ('paolareyes',    'Paola Reyes',    210),
  ('fernandogil',   'Fernando Gil',   310),
  ('monicalara',    'Mónica Lara',    250),
  ('sergioibarra',  'Sergio Ibarra',  190),
  ('adrianaposada', 'Adriana Posada', 140)
) as u(username, display_name, days);

update public.profiles p set bio = b.bio, is_verified = b.verified
from (values
  ('robertoduarte', 'Carpintero de muebles a medida. Enseño a construir con herramientas básicas.', true),
  ('elenacardenas', 'Ebanista y restauradora de muebles antiguos.',                                 false),
  ('danielsoto',    'Ingeniero de machine learning. Traduzco la IA a lenguaje humano.',            true),
  ('paolareyes',    'Diseñadora que usa IA todos los días en su flujo de trabajo.',                false),
  ('fernandogil',   'Emprendedor serial. He lanzado y cerrado más negocios de los que puedo contar.', false),
  ('monicalara',    'Contadora y asesora financiera para pequeños negocios.',                      true),
  ('sergioibarra',  'Consultor de productividad personal y hábitos de trabajo.',                   false),
  ('adrianaposada', 'Project manager. Ordeno el caos de equipos y calendarios.',                   true)
) as b(username, bio, verified)
where p.username = b.username;

-- ── Comunidades: cada usuario nuevo en la suya; algunos usuarios existentes también se unen ──
insert into public.community_members (user_id, community_id)
select p.id, c.id
from (values
  ('robertoduarte','carpinteria'), ('elenacardenas','carpinteria'),
  ('danielsoto','inteligencia-artificial'), ('paolareyes','inteligencia-artificial'),
  ('fernandogil','negocios'), ('monicalara','negocios'),
  ('sergioibarra','productividad'), ('adrianaposada','productividad')
) as m(username, slug)
join public.profiles p on p.username = m.username
join public.communities c on c.slug = m.slug;

insert into public.community_members (user_id, community_id)
select p.id, c.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') p
cross join public.communities c
where c.slug in ('carpinteria', 'inteligencia-artificial', 'negocios', 'productividad')
  and abs(hashtext('m' || p.username || c.slug)::bigint) % 100 < 30
on conflict do nothing;

-- ── Portadas generadas (SVG con degradado) ──────────────────────────────────
create or replace function pg_temp.cover(p int) returns text language sql immutable as $f$
  select case when p is null or p = 0 then null else
    'data:image/svg+xml;utf8,'
    || '<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 344 220%27>'
    || '<defs><linearGradient id=%27g%27 x1=%270%27 y1=%270%27 x2=%271%27 y2=%271%27>'
    || '<stop offset=%270%27 stop-color=%27%23'
    || (array['0B1B3B','7C4A21','3B2A1A','1E1B4B','0F766E','9D174D'])[p] || '%27/>'
    || '<stop offset=%271%27 stop-color=%27%23'
    || (array['2563EB','D9A56B','A8763E','DB2777','34D399','F59E0B'])[p] || '%27/>'
    || '</linearGradient></defs><rect width=%27344%27 height=%27220%27 fill=%27url(%23g)%27/></svg>'
  end
$f$;

-- ── Publicaciones ───────────────────────────────────────────────────────────
insert into public.posts (author_id, community_id, type, title, body, cover_url, created_at)
select u.id, c.id, v.type::public.post_type, v.title, v.body, pg_temp.cover(v.cv),
       now() - (v.hours || ' hours')::interval
from (values
-- Carpintería
('robertoduarte','carpinteria','tutorial','Cómo hacer un escritorio de madera paso a paso',
$b$Te muestro el proceso completo para construir un escritorio resistente con herramientas básicas.

## Materiales
- 1 tablón de pino de 120 × 60 cm (3 cm de grosor) para la cubierta
- 4 patas de 70 cm
- Tornillos para madera de 2", cola blanca y barniz al agua

## Pasos
1. **Corta y lija** todas las piezas antes de armar: es mucho más fácil.
2. Une los travesaños a las patas con cola y **tornillos avellanados**.
3. Fija la cubierta desde abajo para que no se vean los tornillos.
4. Aplica dos manos de barniz, lijando suave entre una y otra.

Deja secar 24 horas antes de usarlo.

#carpinteria #escritorio$b$, 26, 2),
('elenacardenas','carpinteria','consejo','Cómo elegir la madera correcta para tu primer proyecto',
$b$Elegir mal la madera es el error más caro de un principiante. Lo que reviso siempre:

- **Que esté seca:** la madera húmeda se tuerce con el tiempo. Debe sentirse ligera y sin olor a humedad.
- **Que esté recta:** mira la tabla a lo largo, como si apuntaras con ella. Descarta las alabeadas.
- **Que no tenga nudos flojos** en zonas donde va a cargar peso.
- Para empezar, el **pino** es económico y fácil de trabajar; el **cedro** aguanta mejor la humedad.

Compra siempre un 10 % más de lo que calculaste: siempre hay un corte que sale mal.

#madera #principiantes$b$, 60, 3),
('robertoduarte','carpinteria','consejo','Lija en el orden correcto: guía de granos para un acabado perfecto',
$b$Un buen acabado empieza en la lija, no en el barniz.

1. **Grano 80:** quita marcas de sierra y desniveles.
2. **Grano 120:** suaviza y prepara la superficie.
3. **Grano 180–220:** deja el acabado fino antes de barnizar.

Reglas que no rompo: lija **siempre en el sentido de la veta**, no saltes más de un grano de golpe y limpia el polvo con un trapo húmedo antes de barnizar.

#lijado #acabados$b$, 120, 0),
('camilanavarro','carpinteria','pregunta','¿Qué herramientas básicas necesito para empezar en carpintería?',
$b$Quiero empezar a hacer mis propios muebles pero no sé por dónde comenzar ni cuánto gastar. ¿Cuáles son las herramientas realmente indispensables para un primer proyecto? Tengo un presupuesto limitado y poco espacio en casa.

#herramientas #principiantes$b$, 200, 0),
-- Inteligencia Artificial
('danielsoto','inteligencia-artificial','consejo','Cómo escribir prompts más claros: 5 reglas que uso a diario',
$b$La calidad de la respuesta depende de lo claro que sea tu mensaje. Mis 5 reglas:

1. **Da contexto:** quién eres, para qué lo necesitas y para quién es el resultado.
2. **Sé específico** con el formato: "una tabla de 3 columnas", "máximo 100 palabras".
3. **Pide un paso a la vez** en tareas complejas, en lugar de todo junto.
4. **Da un ejemplo** de lo que sí quieres.
5. **Itera:** si la primera respuesta no sirve, dile exactamente qué cambiar.

Y revisa siempre los datos importantes: la IA puede sonar segura y equivocarse.

#ia #prompts$b$, 11, 4),
('paolareyes','inteligencia-artificial','articulo','10 formas en las que la IA puede ayudarte como creativo',
$b$La inteligencia artificial no viene a reemplazarnos, sino a quitarnos trabajo repetitivo para dejar espacio a las ideas. Estas son 10 formas prácticas de integrarla:

## Para arrancar
- Generar lluvias de ideas cuando estás bloqueado.
- Explorar variaciones de un concepto en minutos.
- Resumir un brief largo en puntos accionables.
- Investigar referencias visuales y de mercado.

## Para producir
- Redactar primeras versiones de textos que luego pules tú.
- Adaptar un mismo mensaje a distintos formatos y tonos.
- Preparar guiones, listas de tomas y calendarios.

## Para revisar
- Pedir una segunda opinión sobre tu propuesta.
- Detectar errores de ortografía y consistencia.
- Documentar tu proceso para presentarlo a clientes.

El criterio creativo sigue siendo tuyo.

#ia #creatividad$b$, 75, 6),
('danielsoto','inteligencia-artificial','tutorial','Resume documentos largos con IA sin perder los datos importantes',
$b$Resumir con IA ahorra horas, pero hay que hacerlo con método para no perder información clave.

## Paso a paso
1. **Divide** el documento en secciones si es muy largo.
2. Pide un resumen **por sección**, indicando qué te interesa (fechas, cifras, decisiones).
3. Pide después un **resumen general** a partir de los resúmenes parciales.
4. **Verifica** cifras y nombres contra el original: es lo que más se equivoca.

Consejo extra: pide que marque con "[no encontrado]" lo que el texto no menciona, para evitar que invente.

#ia #productividad$b$, 150, 0),
('jorgeramirez','inteligencia-artificial','pregunta','¿Qué herramientas de IA realmente valen la pena en el trabajo diario?',
$b$Hay muchísimas opciones y me cuesta separar lo útil del ruido. Para trabajo de diseño freelance, ¿cuáles usan ustedes a diario y por qué? Prefiero herramientas que ahorren tiempo de verdad, no que sean solo una novedad.

#ia #herramientas$b$, 33, 0),
-- Negocios
('monicalara','negocios','consejo','Separa tus finanzas personales de las de tu negocio desde el primer día',
$b$Es el consejo que más me agradecen mis clientes años después.

- **Abre una cuenta distinta** para el negocio, aunque seas tu único empleado.
- **Págate un sueldo fijo** en lugar de sacar dinero cuando lo necesitas.
- **Guarda todos los comprobantes** de gastos del negocio en un solo lugar.
- Revisa tus números **una vez por semana**: 15 minutos bastan.

Mezclar las cuentas hace imposible saber si el negocio realmente gana dinero.

#finanzas #emprendimiento$b$, 18, 5),
('fernandogil','negocios','articulo','Errores comunes al lanzar tu primer producto (y cómo evitarlos)',
$b$He lanzado varios productos y me he equivocado en casi todo. Estos son los errores que más veo:

## 1. Construir antes de validar
Meses de trabajo para descubrir que nadie lo necesitaba. Habla primero con clientes potenciales.

## 2. Querer que sea perfecto
Lanza algo simple y mejora con lo que aprendas.

## 3. Ignorar el precio
Poner un precio "por si acaso" bajo es una trampa: atrae a quien menos valora tu trabajo.

## 4. No medir nada
Si no sabes cuántos te visitan y cuántos compran, no sabes qué arreglar.

#emprendimiento #producto$b$, 90, 1),
('monicalara','negocios','consejo','Cómo calcular el precio de tu producto sin regalar tu margen',
$b$Un precio sale de tus costos, no de lo que cobra la competencia.

1. Suma el **costo directo** (materiales, producción, empaque).
2. Añade una parte de tus **costos fijos** (renta, herramientas, tu tiempo).
3. Define el **margen** que necesitas para crecer, no solo para sobrevivir.
4. Compáralo después con el mercado y decide si tu propuesta justifica ese precio.

Si con ese cálculo tu producto sale "caro", el problema es el costo o la propuesta de valor, no tu margen.

#precios #finanzas$b$, 170, 0),
('mateorios','negocios','pregunta','¿Cómo valido una idea de negocio antes de invertir dinero?',
$b$Tengo una idea de negocio pero no quiero gastar mis ahorros sin saber si funciona. ¿Cómo la pruebo con poco dinero? ¿Qué han hecho ustedes para comprobar que a la gente le interesa antes de lanzarse?

#validacion #emprendimiento$b$, 55, 0),
-- Productividad
('sergioibarra','productividad','consejo','El método de las 3 tareas: cómo planear tu día en 5 minutos',
$b$Las listas de 20 pendientes paralizan. Yo uso solo tres:

1. **La tarea importante:** la que más avanza tus objetivos hoy.
2. **La tarea urgente:** lo que no puede esperar.
3. **La tarea pequeña:** algo que puedas cerrar en 10 minutos y te dé impulso.

Escríbelas la noche anterior o en los primeros 5 minutos del día. Haz primero la importante, cuando tienes más energía.

Lo demás es "extra": si lo logras, bien; si no, no arruina el día.

#productividad #habitos$b$, 6, 4),
('adrianaposada','productividad','tutorial','Organiza tu semana con bloques de tiempo paso a paso',
$b$Los bloques de tiempo convierten tu lista de pendientes en un calendario realista.

## Cómo hacerlo
1. Anota **todo** lo que tienes que hacer esta semana.
2. Estima cuánto tarda cada cosa (y suma un 25 % de margen).
3. Agenda primero lo **innegociable**: reuniones, comidas, descanso.
4. Coloca el trabajo profundo en tus **mejores horas del día**.
5. Deja **un bloque libre** al día para imprevistos.

Al final de la semana, revisa qué se cumplió y ajusta las estimaciones.

#organizacion #tiempo$b$, 105, 5),
('sergioibarra','productividad','articulo','Por qué hacer varias cosas a la vez te hace menos productivo',
$b$La multitarea se siente eficiente, pero en realidad estás **cambiando de contexto** una y otra vez, y cada cambio cuesta tiempo y concentración.

## Qué hacer en cambio
- Agrupa tareas parecidas (responder correos, llamadas) en un mismo bloque.
- Desactiva notificaciones mientras trabajas en algo importante.
- Cierra las pestañas y aplicaciones que no necesitas.
- Termina una tarea antes de empezar la siguiente.

Trabajar en una sola cosa a la vez se siente más lento al inicio, pero terminas antes y con mejor calidad.

#productividad #enfoque$b$, 240, 0),
('valeriaortiz','productividad','pregunta','¿Cómo dejo de revisar el correo a cada rato?',
$b$Siento que revisar el correo cada pocos minutos me quita concentración, pero me da ansiedad no hacerlo. ¿Qué rutina o herramienta les ha funcionado para revisar solo en ciertos momentos sin sentir que dejo algo pendiente?

#correo #enfoque$b$, 38, 0)
) as v(username, community, type, title, body, hours, cv)
join public.profiles u    on u.username = v.username
join public.communities c on c.slug = v.community;

-- ── Comentarios (nivel 1) ───────────────────────────────────────────────────
insert into public.comments (post_id, author_id, body, created_at)
select p.id, u.id, v.body, p.created_at + (now() - p.created_at) * v.frac
from (values
('Cómo hacer un escritorio', 'jorgeramirez',  $c$¿Qué medidas recomiendas si el escritorio va en un espacio pequeño?$c$, 0.20),
('Cómo hacer un escritorio', 'elenacardenas', $c$Muy buen paso a paso. Yo añadiría un refuerzo diagonal entre las patas si lo vas a usar muchas horas.$c$, 0.40),
('Cómo hacer un escritorio', 'camilanavarro',$c$Justo lo que necesitaba para mi primer proyecto, ¡gracias!$c$, 0.70),
('Cómo elegir la madera', 'robertoduarte', $c$De acuerdo con todo. Yo agregaría: si puedes, compra en una maderería donde te dejen elegir cada pieza.$c$, 0.30),
('Cómo elegir la madera', 'mateorios',     $c$¿El pino de ferretería sirve o hay que buscar en maderería?$c$, 0.60),
('Lija en el orden', 'elenacardenas', $c$Y no olvides el último paso: pasar un trapo húmedo antes del barniz para levantar la fibra.$c$, 0.35),
('¿Qué herramientas básicas', 'robertoduarte', $c$Para empezar: sierra de mano, escuadra, cinta métrica, taladro, un juego de lijas y prensas de sujeción. Con eso haces un primer mueble simple.$c$, 0.15),
('¿Qué herramientas básicas', 'elenacardenas', $c$Empieza con una mesa lateral o un banco: pocas piezas y muchos cortes rectos. Aprendes más que con un proyecto grande.$c$, 0.50),
('¿Qué herramientas básicas', 'sergioibarra',  $c$Compra herramientas usadas en buen estado: ahorras mucho al inicio.$c$, 0.75),
('Cómo escribir prompts', 'paolareyes',   $c$La regla de dar un ejemplo me cambió los resultados. Gracias por compartirlas.$c$, 0.25),
('Cómo escribir prompts', 'jorgeramirez', $c$¿Recomiendas un formato fijo o depende de la tarea?$c$, 0.55),
('10 formas en las que la IA', 'danielsoto',  $c$Muy buena lista. Lo de documentar tu proceso con IA es de lo más subestimado.$c$, 0.30),
('10 formas en las que la IA', 'marianaruiz', $c$Coincido: el criterio creativo sigue siendo humano. La IA acelera lo demás.$c$, 0.55),
('10 formas en las que la IA', 'valeriaortiz',$c$Lo voy a compartir con mi equipo.$c$, 0.80),
('Resume documentos largos', 'camilanavarro', $c$El truco de "[no encontrado]" es genial.$c$, 0.40),
('¿Qué herramientas de IA', 'danielsoto',  $c$Para diseño: un asistente de texto para ideas y borradores, y una herramienta de imágenes para explorar moodboards. Con esas dos ya cubres el 80 %.$c$, 0.15),
('¿Qué herramientas de IA', 'paolareyes',  $c$Yo uso mucho un asistente para resumir briefs de clientes. Ahorra bastante tiempo.$c$, 0.40),
('¿Qué herramientas de IA', 'analopez',    $c$Prueba cada una una semana con una tarea real. Las que no usas después, descártalas.$c$, 0.70),
('Separa tus finanzas', 'fernandogil',  $c$Consejo de oro. Yo tardé dos años en hacerlo y me costó caro.$c$, 0.30),
('Separa tus finanzas', 'jorgeramirez', $c$¿Cómo defines el sueldo fijo si los ingresos varían cada mes?$c$, 0.55),
('Errores comunes al lanzar', 'monicalara', $c$Sobre el precio: cobrar poco también desgasta al negocio. Excelente punto.$c$, 0.40),
('Errores comunes al lanzar', 'mateorios',  $c$Guardado. Justo estoy por lanzar mi primer proyecto.$c$, 0.70),
('Cómo calcular el precio', 'sofiamendoza', $c$¿Cómo incluyes el costo de tu propio tiempo si eres freelance?$c$, 0.40),
('¿Cómo valido una idea', 'fernandogil',  $c$Vende antes de construir: una página sencilla que explique tu propuesta y un botón de preventa. Si nadie deja su correo o compra, ya aprendiste sin gastar.$c$, 0.20),
('¿Cómo valido una idea', 'monicalara',   $c$Habla con 10 posibles clientes y pregúntales cómo resuelven hoy ese problema.$c$, 0.50),
('¿Cómo valido una idea', 'jorgeramirez', $c$Yo probé con una publicación en redes y un formulario. Me ahorró meses.$c$, 0.75),
('El método de las 3 tareas', 'adrianaposada', $c$Lo uso hace meses. La tarea pequeña como calentamiento funciona increíble.$c$, 0.30),
('El método de las 3 tareas', 'camilanavarro',$c$¿Y si tienes más de una tarea importante el mismo día?$c$, 0.60),
('Organiza tu semana', 'sergioibarra',   $c$El margen del 25 % es clave, casi nadie lo aplica.$c$, 0.35),
('Organiza tu semana', 'luciafernandez', $c$Lo probaré esta semana con mis sesiones y ediciones.$c$, 0.65),
('Por qué hacer varias cosas', 'valeriaortiz', $c$Desactivar notificaciones fue lo que más me cambió el día.$c$, 0.40),
('¿Cómo dejo de revisar', 'sergioibarra',   $c$Define 2 o 3 horarios fijos al día para el correo y cierra la aplicación el resto del tiempo. Al principio cuesta, pero se vuelve hábito.$c$, 0.20),
('¿Cómo dejo de revisar', 'adrianaposada', $c$Agrega una respuesta automática que indique tus horarios de revisión. Baja mucho la ansiedad.$c$, 0.45),
('¿Cómo dejo de revisar', 'mateorios',      $c$Yo lo tengo en el celular solo con notificaciones para contactos clave.$c$, 0.75)
) as v(prefix, username, body, frac)
join public.posts p    on p.title like v.prefix || '%'
join public.profiles u on u.username = v.username;

-- ── Respuestas (nivel 2) ────────────────────────────────────────────────────
insert into public.comments (post_id, author_id, parent_id, body, created_at)
select p.id, u.id, pc.id, v.body, pc.created_at + (now() - pc.created_at) * v.frac
from (values
('Cómo hacer un escritorio', '¿Qué medidas recomiendas', 'robertoduarte', $c$Para espacios chicos, 100 × 50 cm funciona bien. Mantén la altura entre 72 y 75 cm.$c$, 0.50),
('Cómo elegir la madera', '¿El pino de ferretería', 'elenacardenas', $c$Sirve para empezar, pero elige piezas rectas y sin humedad; en maderería tienen mejor selección.$c$, 0.80),
('Cómo escribir prompts', '¿Recomiendas un formato', 'danielsoto', $c$Depende, pero una estructura base de contexto, tarea y formato sirve casi siempre.$c$, 0.70),
('Separa tus finanzas', '¿Cómo defines el sueldo', 'monicalara', $c$Toma el promedio de los últimos 6 meses y págate un poco menos; el resto queda como colchón.$c$, 0.70),
('Cómo calcular el precio', '¿Cómo incluyes el costo', 'monicalara', $c$Define cuánto quieres ganar por hora y multiplícalo por las horas que te toma el proyecto.$c$, 0.70),
('El método de las 3 tareas', '¿Y si tienes más de una', 'sergioibarra', $c$Elige la que tiene la fecha o el impacto más cercano y deja la otra como "urgente" del día siguiente.$c$, 0.80)
) as v(post_prefix, parent_prefix, username, body, frac)
join public.posts p     on p.title like v.post_prefix || '%'
join public.comments pc on pc.post_id = p.id and pc.parent_id is null and pc.body like v.parent_prefix || '%'
join public.profiles u  on u.username = v.username;

-- ── Respuestas aceptadas (el trigger suma +15 de reputación) ────────────────
update public.comments c set is_accepted = true
from (values
  ('¿Qué herramientas básicas',    'Para empezar: sierra'),
  ('¿Qué herramientas de IA',      'Para diseño: un asistente'),
  ('¿Cómo valido una idea',        'Vende antes de construir'),
  ('¿Cómo dejo de revisar',        'Define 2 o 3 horarios')
) as a(post_prefix, comment_prefix)
join public.posts p on p.title like a.post_prefix || '%'
where c.post_id = p.id and c.parent_id is null and c.body like a.comment_prefix || '%';

-- ── Reacciones (deterministas), solo sobre los posts de ejemplo de estas 4 comunidades ──
insert into public.likes (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join (
  select p.id, p.author_id from public.posts p
  join public.communities c on c.id = p.community_id and c.slug in ('carpinteria', 'inteligencia-artificial', 'negocios', 'productividad')
  where p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
) p
where u.id <> p.author_id
  and abs(hashtext(u.username || p.id::text)::bigint) % 100
      < 30 + abs(hashtext(p.id::text)::bigint) % 50
on conflict do nothing;

insert into public.helpful_marks (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join (
  select p.id, p.author_id from public.posts p
  join public.communities c on c.id = p.community_id and c.slug in ('carpinteria', 'inteligencia-artificial', 'negocios', 'productividad')
  where p.type <> 'pregunta'
    and p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
) p
where u.id <> p.author_id
  and abs(hashtext('h' || u.username || p.id::text)::bigint) % 100
      < 15 + abs(hashtext(p.id::text)::bigint) % 45
on conflict do nothing;

insert into public.saves (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join (
  select p.id from public.posts p
  join public.communities c on c.id = p.community_id and c.slug in ('carpinteria', 'inteligencia-artificial', 'negocios', 'productividad')
  where p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
) p
where abs(hashtext('s' || u.username || p.id::text)::bigint) % 100 < 18
on conflict do nothing;

-- Seguimientos que involucran a los usuarios nuevos
insert into public.follows (follower_id, following_id)
select a.id, b.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') a
cross join (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') b
where a.id <> b.id
  and (a.username in ('robertoduarte','elenacardenas','danielsoto','paolareyes','fernandogil','monicalara','sergioibarra','adrianaposada')
    or b.username in ('robertoduarte','elenacardenas','danielsoto','paolareyes','fernandogil','monicalara','sergioibarra','adrianaposada'))
  and abs(hashtext(a.username || '>' || b.username)::bigint) % 100 < 35
on conflict do nothing;
