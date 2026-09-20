-- TheProKnow · datos de ejemplo (12 usuarios ficticios, 30 posts, comentarios en español)
-- Comunidades: Diseño Gráfico y Fotografía.
--
-- Cómo usarlo: pega este archivo completo en el SQL Editor de Supabase y ejecútalo.
-- Es idempotente: borra primero a los usuarios seed (correo @seed.theproknow.test) y
-- todo lo que colgaba de ellos, y lo vuelve a crear. No toca cuentas reales.
-- Los usuarios seed no tienen contraseña, así que nadie puede iniciar sesión con ellos.
-- Los likes y "Me ayudó" se insertan en las tablas reales: los triggers calculan contadores,
-- reputación y notificaciones igual que en producción.

delete from auth.users where email like '%@seed.theproknow.test';

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
  ('analopez',       'Ana López',        400),
  ('carlosmartinez', 'Carlos Martínez',  390),
  ('marianaruiz',    'Mariana Ruiz',     380),
  ('luisherrera',    'Luis Herrera',     300),
  ('jorgeramirez',   'Jorge Ramírez',    280),
  ('sofiamendoza',   'Sofía Mendoza',    260),
  ('diegovargas',    'Diego Vargas',     240),
  ('valeriaortiz',   'Valeria Ortiz',    220),
  ('javiercastro',   'Javier Castro',    200),
  ('luciafernandez', 'Lucía Fernández',  180),
  ('mateorios',      'Mateo Ríos',       120),
  ('camilanavarro',  'Camila Navarro',    90)
) as u(username, display_name, days);

update public.profiles p set bio = b.bio, is_verified = b.verified
from (values
  ('analopez',       'Diseñadora gráfica. Presentaciones, branding y mucho café.', true),
  ('carlosmartinez', 'Fotógrafo de producto y retrato. Enseño luz natural.',        true),
  ('marianaruiz',    'Directora de arte. Tipografía y sistemas visuales.',         true),
  ('luisherrera',    'Fotografía de paisaje y viaje. Siempre persiguiendo la luz.', false),
  ('jorgeramirez',   'Diseñador freelance. Aprendiendo a cobrar mejor.',           false),
  ('sofiamendoza',   'Ilustradora y diseñadora editorial.',                        true),
  ('diegovargas',    'Fotografía callejera y nocturna en la ciudad.',              false),
  ('valeriaortiz',   'Diseñadora UX/UI. Accesibilidad primero.',                   false),
  ('javiercastro',   'Retocador digital. Piel natural, siempre.',                  false),
  ('luciafernandez', 'Fotógrafa de bodas y familias.',                             true),
  ('mateorios',      'Estudiante de diseño gráfico.',                              false),
  ('camilanavarro',  'Aficionada a la fotografía. Aprendiendo cada día.',          false)
) as b(username, bio, verified)
where p.username = b.username;

-- ── Comunidades ─────────────────────────────────────────────────────────────
insert into public.community_members (user_id, community_id)
select p.id, c.id
from (values
  ('analopez','diseno-grafico'), ('marianaruiz','diseno-grafico'), ('jorgeramirez','diseno-grafico'),
  ('sofiamendoza','diseno-grafico'), ('valeriaortiz','diseno-grafico'), ('mateorios','diseno-grafico'),
  ('carlosmartinez','fotografia'), ('luisherrera','fotografia'), ('diegovargas','fotografia'),
  ('javiercastro','fotografia'), ('luciafernandez','fotografia'), ('camilanavarro','fotografia'),
  ('mateorios','fotografia'), ('analopez','fotografia'), ('camilanavarro','diseno-grafico')
) as m(username, slug)
join public.profiles p on p.username = m.username
join public.communities c on c.slug = m.slug;

-- ── Portadas generadas (SVG con degradado; las reales se suben a Storage) ───
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
-- Diseño Gráfico
('analopez','diseno-grafico','consejo','5 consejos para mejorar tus presentaciones en pocos minutos',
$b$Una buena presentación puede cambiar por completo la forma en que comunicas tus ideas. Estos son los 5 consejos que siempre me funcionan:

1. **Una idea por diapositiva.** Si necesitas dos, son dos diapositivas.
2. **Máximo dos tipografías** y un tamaño de texto que se lea desde el fondo de la sala.
3. **Usa contraste real:** texto oscuro sobre fondo claro (o al revés), nunca gris sobre gris.
4. **Sustituye párrafos por imágenes o gráficas** que cuenten lo mismo.
5. **Ensaya en voz alta** con cronómetro; el diseño también es ritmo.

#presentaciones #diseño$b$, 2, 1),
('marianaruiz','diseno-grafico','consejo','Cómo elegir una paleta de color que no se vea genérica',
$b$La mayoría de las paletas se ven genéricas porque parten de colores "bonitos" y no de una intención. Mi proceso:

- Define **la emoción** que quieres transmitir antes de tocar un selector.
- Elige **un color protagonista**, uno de apoyo y un neutro con carácter (no gris puro).
- Prueba la paleta en **blanco y negro**: si no hay jerarquía de valor, no funcionará.
- Reserva un acento brillante para las acciones importantes.

#color #branding$b$, 9, 2),
('sofiamendoza','diseno-grafico','tutorial','Guía paso a paso para crear un logotipo en Illustrator',
$b$Te muestro cómo armo un logotipo sencillo en Illustrator, de la idea al archivo final.

## Pasos
1. **Boceta a mano** al menos 10 ideas; escanea las 2 mejores.
2. Traza con la herramienta *Pluma* y limita los puntos de ancla.
3. Construye sobre una **cuadrícula** para mantener proporciones.
4. Prueba en **una sola tinta** y en tamaño de favicon (16 px).
5. Exporta en SVG, PDF y PNG con fondo transparente.

Si quieres, en los comentarios comparto la plantilla de cuadrícula.

#logotipo #illustrator$b$, 30, 3),
('valeriaortiz','diseno-grafico','articulo','Por qué el espacio en blanco es tu mejor herramienta de diseño',
$b$El espacio en blanco no es espacio desperdiciado: es **lo que da respiro y jerarquía** al diseño.

## Por qué funciona
Cuando separas los elementos, el ojo entiende qué va con qué. Los márgenes generosos también comunican calidad: las marcas de lujo casi siempre los usan.

## Cómo aplicarlo
- Duplica el margen que crees necesario y luego ajusta.
- Agrupa por proximidad antes de añadir cajas o líneas.
- Si dudas entre añadir un elemento o dejar aire, deja aire.

#diseño #layout$b$, 52, 4),
('mateorios','diseno-grafico','pregunta','¿Qué tipografías recomiendan para un proyecto editorial?',
$b$Estoy armando una revista de fin de curso con mucho texto y algunas fotografías. Busco una tipografía con serifa para el cuerpo y otra para títulos que combinen bien. ¿Qué me recomiendan? Prefiero opciones gratuitas.

#tipografia #editorial$b$, 5, 0),
('analopez','diseno-grafico','consejo','Errores comunes en portafolios de diseño (y cómo evitarlos)',
$b$Revisé decenas de portafolios este año. Los errores que más se repiten:

1. **Mostrar todo** en lugar de tus 4–6 mejores proyectos.
2. Imágenes finales sin explicar **el problema y tu proceso**.
3. Mockups genéricos que no dicen nada del trabajo real.
4. Un sitio lento o que no se ve bien en celular.
5. Olvidar un **contacto claro**.

Cura, explica y simplifica.

#portafolio #diseño$b$, 75, 5),
('jorgeramirez','diseno-grafico','pregunta','¿Cobrar por hora o por proyecto como diseñador freelance?',
$b$Empecé como freelance hace poco y no sé cómo cotizar. ¿Es mejor cobrar por hora o por proyecto? Mis clientes son pequeños negocios locales y los alcances suelen cambiar a mitad del camino. ¿Cómo lo manejan ustedes?

#freelance #negocios$b$, 20, 0),
('marianaruiz','diseno-grafico','tutorial','Jerarquía tipográfica en 10 minutos',
$b$La jerarquía tipográfica guía la lectura. Te explico cómo armarla rápido:

## 1. Elige una escala
Puedes usar una razón de 1.25: 16 → 20 → 25 → 31 px.

## 2. Limita los pesos
Usa **bold** para títulos, *regular* para texto y un peso ligero para notas.

## 3. Cuida el interlineado
1.4–1.6 para texto corrido; 1.1–1.2 para títulos grandes.

## 4. Revisa con los ojos entrecerrados
Si no distingues qué es lo primero que se lee, ajusta tamaños.

#tipografia #jerarquia$b$, 100, 6),
('sofiamendoza','diseno-grafico','consejo','Cómo preparar archivos para impresión sin sustos',
$b$Antes de mandar a imprenta, revisa esto y evita reimpresiones:

- **Sangrado** de 3 mm en todos los lados.
- Modo de color **CMYK** (los RGB cambian al imprimir).
- Imágenes a **300 dpi** al tamaño final.
- Texto convertido a curvas o fuentes incrustadas.
- Negro rico solo en fondos; texto pequeño en negro 100 %.

Pide siempre una **prueba de color**.

#impresion #diseño$b$, 130, 0),
('valeriaortiz','diseno-grafico','consejo','Checklist rápido de accesibilidad de color',
$b$Un checklist rápido para revisar el color en tus interfaces:

- Texto normal: contraste mínimo **4.5:1**; texto grande: 3:1.
- No uses **solo el color** para indicar un error o estado.
- Revisa tu diseño en escala de grises.
- Comprueba los estados de foco, no solo el hover.

Los verificadores de contraste te ahorran mucho tiempo.

#accesibilidad #ux$b$, 160, 0),
('mateorios','diseno-grafico','pregunta','¿Cómo presento mi primer proyecto de branding a un cliente?',
$b$Tengo mi primer cliente de branding y me toca presentar la propuesta la próxima semana. ¿Cómo estructuran la presentación? ¿Muestro varias opciones o una sola línea? Me da nervio que me digan que no les gusta.

#branding #clientes$b$, 190, 0),
('analopez','diseno-grafico','articulo','Tendencias de branding que veremos este año',
$b$Tres cosas que se ven cada vez más en identidades de marca:

## 1. Logotipos flexibles
Marcas que cambian de forma según el contexto, con un núcleo reconocible.

## 2. Tipografía con personalidad
Menos sans neutras, más caracteres con rasgos propios.

## 3. Color con propósito
Paletas más sobrias y un solo acento memorable.

La clave: consistencia sobre novedad.

#branding #tendencias$b$, 220, 1),
('jorgeramirez','diseno-grafico','consejo','Cómo ordenar tus archivos de diseño para no perder nada',
$b$Mi sistema de carpetas para proyectos de diseño:

- `01_Brief`
- `02_Referencias`
- `03_Trabajo`
- `04_Entregables`
- `05_Archivo`

Nombra los archivos con **fecha + versión** (`2026-03-12_logo_v3`) y nunca uses `final_final`. Haz respaldo semanal.

#productividad #diseño$b$, 260, 0),
('sofiamendoza','diseno-grafico','tutorial','Crear un sistema de iconos consistente',
$b$Un set de iconos coherente transmite profesionalismo. Mi método:

1. Define la **cuadrícula base** (24×24 px) y el área segura.
2. Elige **un grosor de trazo** (por ejemplo 2 px) y esquinas redondeadas o rectas, no ambas.
3. Dibuja primero los 5 iconos más distintos para fijar el estilo.
4. Alinea al píxel y exporta en SVG optimizado.

Compararlos todos juntos en una hoja te muestra rápido las inconsistencias.

#iconos #ui$b$, 300, 2),
('marianaruiz','diseno-grafico','consejo','Retícula de 12 columnas: cuándo usarla y cuándo no',
$b$La retícula de 12 columnas es flexible porque se divide en 2, 3, 4 y 6. Sirve muy bien para **sitios web y sistemas editoriales complejos**.

Pero no la uses si tu pieza es muy simple: un cartel con una sola imagen agradece más una composición libre o una retícula de 3 columnas.

La retícula es una guía, no una jaula.

#layout #reticula$b$, 340, 0),
('valeriaortiz','diseno-grafico','articulo','Lo que aprendí rediseñando una app en 30 días',
$b$Rediseñé la app de un negocio local durante 30 días. Lo que aprendí:

## Habla con usuarios primero
Cinco conversaciones cambiaron mi lista de prioridades.

## Reduce antes de añadir
Quité tres pantallas y las tareas clave se hicieron más rápido.

## Prototipa y prueba pronto
Un prototipo tosco con usuarios reales vale más que un diseño perfecto sin validar.

#ux #producto$b$, 400, 3),
-- Fotografía
('carlosmartinez','fotografia','consejo','Cómo lograr fotos de producto con luz natural',
$b$La luz natural puede ser tu mejor aliada. Mi proceso paso a paso:

1. Coloca el producto junto a una **ventana grande**, sin sol directo.
2. Usa una **cartulina blanca** del lado opuesto para rebotar luz y suavizar sombras.
3. Cámara en trípode, **ISO bajo** y apertura f/5.6–f/8.
4. Cubre la ventana con una cortina blanca si la luz es dura.
5. Ajusta el balance de blancos con una tarjeta gris.

#producto #luznatural$b$, 4, 4),
('luisherrera','fotografia','tutorial','Fotografía de paisaje: guía de la hora dorada',
$b$La hora dorada dura poco, así que conviene llegar preparado.

## Antes
- Revisa la hora exacta de salida y puesta de sol.
- Llega **45 minutos antes** para elegir encuadre.

## Durante
- Trípode, disparador remoto y ISO 100.
- Apertura f/8–f/11 para buena nitidez.
- Haz **bracketing** si el contraste es alto.

## Después
Revisa el histograma y recupera sombras con suavidad.

#paisaje #horadorada$b$, 12, 5),
('diegovargas','fotografia','pregunta','¿Qué lente conviene para fotografía callejera?',
$b$Quiero empezar con fotografía callejera y tengo presupuesto para un solo lente. ¿Recomiendan un 35 mm, un 50 mm o algo más versátil como un zoom? Uso una cámara APS-C. ¿Qué les ha funcionado?

#calle #lentes$b$, 7, 0),
('luciafernandez','fotografia','consejo','Cómo dirigir a una pareja sin que se vea forzado',
$b$Las poses forzadas casi siempre vienen de dar órdenes, no de dar **acciones**. Lo que me funciona:

- Pídeles que caminen juntos y se digan algo al oído.
- Da instrucciones simples: "mírense", "ríanse de esto".
- Conversa con ellos y dispara entre poses; lo mejor suele salir en los cambios.
- Muéstrales una foto en la pantalla: se relajan al verse bien.

#bodas #retrato$b$, 40, 6),
('javiercastro','fotografia','tutorial','Retoque de piel natural en Lightroom y Photoshop',
$b$Un retoque natural conserva la textura de la piel. Mi flujo:

1. En Lightroom: corrige exposición y balance de blancos primero.
2. En Photoshop: **separación de frecuencias** con dos capas (baja y alta).
3. Suaviza manchas solo en la capa de baja frecuencia.
4. Quita imperfecciones puntuales en la de alta con el pincel corrector.
5. Baja la opacidad del retoque a **60–70 %**.

Menos es más.

#retoque #lightroom$b$, 60, 1),
('camilanavarro','fotografia','pregunta','¿Vale la pena pasar de celular a cámara mirrorless?',
$b$Llevo un año tomando fotos con mi celular y quiero dar el salto a una cámara mirrorless. ¿Vale la pena la inversión si es solo un pasatiempo? ¿Qué gama recomiendan para empezar sin gastar de más?

#camaras #principiantes$b$, 28, 0),
('carlosmartinez','fotografia','articulo','Composición: la regla de los tercios y cuándo romperla',
$b$La regla de los tercios divide la imagen en una cuadrícula de 3×3 y coloca el sujeto en las intersecciones. Funciona porque genera **equilibrio con tensión**.

## Cuándo romperla
- Simetría: las composiciones centradas pueden ser muy potentes.
- Espacio negativo: un sujeto pequeño en un encuadre amplio transmite soledad.

Aprende la regla y luego decide conscientemente cuándo no seguirla.

#composicion #fotografia$b$, 90, 2),
('luisherrera','fotografia','consejo','Trípode: 4 cosas que debes revisar antes de comprar',
$b$Antes de comprar un trípode, revisa:

1. **Carga máxima**: al menos el doble del peso de tu equipo.
2. Material: la fibra de carbono absorbe mejor la vibración.
3. **Altura** cómoda sin extender la columna central.
4. Rótula de bola vs. cabezal de 3 vías, según tu tipo de trabajo.

Un trípode barato e inestable arruina más fotos de las que ayuda.

#equipo #tripode$b$, 120, 0),
('diegovargas','fotografia','consejo','Fotografía nocturna en la ciudad sin ruido excesivo',
$b$Para fotos nocturnas limpias:

- Dispara en **RAW** y usa el ISO más bajo posible.
- Apóyate en un trípode o en cualquier superficie firme.
- Usa la reducción de ruido de larga exposición con cuidado: duplica el tiempo de captura.
- Aprovecha las luces de la ciudad como fuente principal.
- En edición, reduce el ruido de **crominancia** antes que el de luminancia.

#nocturna #ciudad$b$, 150, 3),
('luciafernandez','fotografia','articulo','Cómo cobrar tu primera sesión sin regalar tu trabajo',
$b$Cobrar poco por tu primer trabajo es tentador, pero puede marcar tu precio para siempre.

## Qué considerar
- Horas de sesión **más** edición, traslados y equipo.
- Tu experiencia y el uso que se dará a las fotos (licencia).

## Recomendaciones
1. Ofrece paquetes claros, no precios sueltos.
2. Pide un **anticipo** para reservar la fecha.
3. Firma un contrato sencillo.

Tu tiempo tiene valor, aunque estés empezando.

#freelance #fotografia$b$, 180, 0),
('javiercastro','fotografia','consejo','Calibrar tu monitor: por qué importa más que tu cámara',
$b$Puedes tener la mejor cámara, pero si tu monitor muestra colores incorrectos editarás a ciegas.

- Un **calibrador** de pantalla evita que tus fotos se vean distintas en otros dispositivos.
- Calibra cada 2–4 semanas.
- Ajusta el brillo a un nivel moderado (unos 100–120 cd/m²).

Antes de invertir en otro lente, considera invertir en esto.

#edicion #color$b$, 210, 0),
('camilanavarro','fotografia','consejo','Mis primeros 6 meses aprendiendo fotografía: lo esencial',
$b$Después de seis meses aprendiendo, esto es lo que más me sirvió:

1. Entender el **triángulo de exposición** (apertura, velocidad, ISO).
2. Fotografiar **todos los días**, aunque sean cosas simples.
3. Analizar mis fotos malas y anotar qué salió mal.
4. Seguir a fotógrafos que admiro y estudiar su composición.

No necesitas equipo nuevo para mejorar, necesitas práctica.

#principiantes #aprendizaje$b$, 240, 4),
('carlosmartinez','fotografia','tutorial','Iluminación con un solo flash: 3 esquemas básicos',
$b$Con un solo flash puedes lograr resultados profesionales. Tres esquemas básicos:

## 1. Luz lateral
Colócalo a 90° del sujeto para resaltar textura y volumen.

## 2. Luz a 45°
El clásico: suave y favorecedora, con una sombra ligera en el lado opuesto.

## 3. Rebote en pared o techo
Dirige el flash hacia una superficie blanca para una luz amplia y natural.

Añade un **difusor** para suavizar.

#flash #iluminacion$b$, 290, 5),
('luisherrera','fotografia','pregunta','¿Cómo protejo mi equipo en clima húmedo?',
$b$Viajo pronto a una zona muy húmeda y me preocupa que la humedad dañe mi cámara y lentes. ¿Qué precauciones recomiendan? ¿Sirven las bolsas de sílice o hay algo mejor? Gracias de antemano.

#equipo #viaje$b$, 350, 0)
) as v(username, community, type, title, body, hours, cv)
join public.profiles u    on u.username = v.username
join public.communities c on c.slug = v.community;

-- ── Comentarios (nivel 1) ───────────────────────────────────────────────────
-- Fecha = entre el post y ahora, según "frac".
insert into public.comments (post_id, author_id, body, created_at)
select p.id, u.id, v.body, p.created_at + (now() - p.created_at) * v.frac
from (values
('¿Qué tipografías recomiendan', 'marianaruiz',  $c$Para el cuerpo te sugiero **Source Serif** o **Merriweather**, muy legibles en impreso. Para títulos, prueba **Playfair Display**. Todas son gratuitas en Google Fonts.$c$, 0.15),
('¿Qué tipografías recomiendan', 'sofiamendoza', $c$Yo suelo usar **Lora** para texto largo. Evita mezclar más de dos familias en una revista.$c$, 0.30),
('¿Qué tipografías recomiendan', 'analopez',     $c$Si quieres algo más editorial, **DM Serif Display** para títulos funciona muy bien con una sans neutra en subtítulos.$c$, 0.50),
('¿Qué tipografías recomiendan', 'valeriaortiz', $c$Imprime una muestra antes de decidir. Algunas serifas se ven distintas en pantalla que en papel.$c$, 0.70),
('¿Cobrar por hora', 'analopez',     $c$Por proyecto, pero con **alcance definido por escrito**: número de rondas de cambios, entregables y tiempos. Todo lo extra se cobra aparte.$c$, 0.15),
('¿Cobrar por hora', 'sofiamendoza', $c$Yo empecé por hora para entender cuánto tardaba realmente. Después de unos proyectos ya podía cotizar por paquete con más seguridad.$c$, 0.35),
('¿Cobrar por hora', 'marianaruiz',  $c$Añade un margen del 20 % por imprevistos y pide 50 % de anticipo. Te cambia la vida.$c$, 0.55),
('¿Cobrar por hora', 'valeriaortiz', $c$Registra tus horas aunque cobres por proyecto; así sabes si tu precio es justo.$c$, 0.75),
('¿Cómo presento mi primer', 'analopez',     $c$Presenta **una línea principal bien defendida**, máximo dos. Con muchas opciones el cliente se pierde. Explica el porqué de cada decisión, no solo el resultado.$c$, 0.20),
('¿Cómo presento mi primer', 'marianaruiz',  $c$Muestra el logo aplicado en contextos reales (empaque, redes, papelería). Ayuda a que lo imaginen funcionando.$c$, 0.50),
('¿Cómo presento mi primer', 'jorgeramirez', $c$Y define desde el inicio cuántas rondas de ajustes incluye tu propuesta.$c$, 0.75),
('¿Qué lente conviene', 'carlosmartinez', $c$Con APS-C, un **35 mm** (equivale a ~50 mm) es el más equilibrado para calle. Ligero y discreto.$c$, 0.15),
('¿Qué lente conviene', 'luisherrera',    $c$Si te gusta acercarte más a la gente, prueba un 23 mm (~35 mm equivalente). Te obliga a estar cerca, pero las fotos ganan intimidad.$c$, 0.35),
('¿Qué lente conviene', 'javiercastro',   $c$Evita los zooms al principio: te dan demasiadas opciones y te distraen. Un solo lente fijo te enseña a moverte.$c$, 0.55),
('¿Qué lente conviene', 'camilanavarro',  $c$Mi 35 mm f/1.8 me costó poco y sigue siendo mi favorito.$c$, 0.80),
('¿Vale la pena pasar', 'carlosmartinez', $c$Si te gusta la fotografía, sí. La diferencia se nota en poca luz, profundidad de campo y control manual. Una mirrorless de entrada y el lente kit son suficientes para empezar.$c$, 0.20),
('¿Vale la pena pasar', 'luciafernandez', $c$Antes de comprar, alquila una unos días. Así compruebas si te gusta el peso y el flujo de trabajo.$c$, 0.40),
('¿Vale la pena pasar', 'diegovargas',    $c$Considera comprar usada; hay muy buenas opciones con poco uso y ahorras bastante.$c$, 0.60),
('¿Vale la pena pasar', 'javiercastro',   $c$Los celulares actuales son excelentes de día. La cámara vale la pena si quieres cambiar de lente y disparar en RAW.$c$, 0.80),
('¿Cómo protejo mi equipo', 'carlosmartinez', $c$Sílice dentro de la mochila y bolsas herméticas con cierre. Al volver al hotel, deja el equipo fuera de la funda para que respire.$c$, 0.25),
('¿Cómo protejo mi equipo', 'diegovargas',    $c$Evita cambiar de lente en ambientes muy húmedos y no pases de aire acondicionado a calor de golpe: se empaña.$c$, 0.50),
('¿Cómo protejo mi equipo', 'luciafernandez', $c$Guarda las bolsas de sílice en un recipiente cerrado y sécalas al sol de vez en cuando para reutilizarlas.$c$, 0.75),
('5 consejos para mejorar', 'sofiamendoza', $c$Muy de acuerdo con el punto 1. Una idea por diapositiva cambia todo.$c$, 0.20),
('5 consejos para mejorar', 'valeriaortiz', $c$Añadiría revisar el contraste con un verificador. Muchas presentaciones fallan ahí.$c$, 0.45),
('5 consejos para mejorar', 'mateorios',    $c$¡Gracias! Justo tengo una presentación mañana, voy a aplicar estos consejos.$c$, 0.70),
('Cómo elegir una paleta', 'analopez',  $c$La prueba en blanco y negro es oro. La uso siempre.$c$, 0.30),
('Cómo elegir una paleta', 'mateorios', $c$¿Algún recurso para practicar armando paletas?$c$, 0.60),
('Guía paso a paso para crear', 'mateorios',     $c$¿Podrías compartir la plantilla de cuadrícula? Sería genial.$c$, 0.30),
('Guía paso a paso para crear', 'jorgeramirez',  $c$Excelente guía. Probar el logo en tamaño favicon es un consejo subvalorado.$c$, 0.60),
('Cómo lograr fotos de producto', 'camilanavarro',  $c$¿Sirve una hoja de papel blanco en lugar de cartulina?$c$, 0.25),
('Cómo lograr fotos de producto', 'diegovargas',    $c$Yo uso una sábana blanca como difusor y funciona increíble.$c$, 0.50),
('Cómo lograr fotos de producto', 'luciafernandez', $c$Gran consejo el de la tarjeta gris; ahorra mucho tiempo de edición.$c$, 0.75),
('Fotografía de paisaje', 'camilanavarro',  $c$¡Justo lo que necesitaba para mi salida de este fin de semana!$c$, 0.30),
('Fotografía de paisaje', 'carlosmartinez', $c$Añadiría llevar un filtro ND graduado si vas a fotografiar cielos con mucho contraste.$c$, 0.60),
('Cómo dirigir a una pareja', 'camilanavarro', $c$Me sirvió muchísimo, siempre me quedo sin saber qué decir en las sesiones.$c$, 0.40),
('Composición: la regla', 'mateorios', $c$Muy útil. En diseño editorial pasa lo mismo con las retículas.$c$, 0.50),
('Errores comunes en portafolios', 'jorgeramirez', $c$El punto de explicar el proceso me hizo replantear todo mi sitio.$c$, 0.40)
) as v(prefix, username, body, frac)
join public.posts p    on p.title like v.prefix || '%'
join public.profiles u on u.username = v.username;

-- ── Respuestas (nivel 2) ────────────────────────────────────────────────────
insert into public.comments (post_id, author_id, parent_id, body, created_at)
select p.id, u.id, pc.id, v.body, pc.created_at + (now() - pc.created_at) * v.frac
from (values
('¿Qué tipografías recomiendan', 'Para el cuerpo te sugiero', 'mateorios',    $c$¡Gracias! Voy a probar Source Serif con Playfair para los títulos.$c$, 0.35),
('¿Cobrar por hora', 'Por proyecto, pero', 'jorgeramirez', $c$¿Y cómo manejas cuando el cliente pide cambios fuera del alcance?$c$, 0.30),
('¿Cobrar por hora', 'Por proyecto, pero', 'analopez',     $c$Le envío un presupuesto adicional antes de empezar; casi siempre lo aceptan.$c$, 0.55),
('¿Qué lente conviene', 'Con APS-C, un', 'diegovargas', $c$Confirmo, el 35 mm f/1.8 es una gran opción por precio.$c$, 0.30),
('¿Vale la pena pasar', 'Si te gusta la fotografía, sí', 'camilanavarro', $c$Gracias, voy a alquilar primero para probar.$c$, 0.50),
('5 consejos para mejorar', 'Añadiría revisar el contraste', 'analopez', $c$¡Muy buen punto! Lo sumo a la lista.$c$, 0.55),
('Guía paso a paso para crear', '¿Podrías compartir la plantilla', 'sofiamendoza', $c$Claro, la subo esta semana y la enlazo aquí.$c$, 0.40),
('Cómo lograr fotos de producto', '¿Sirve una hoja de papel', 'carlosmartinez', $c$Sí, sirve. Solo que puede ser más translúcida y dar sombras menos suaves.$c$, 0.40),
('¿Cómo protejo mi equipo', 'Sílice dentro de la mochila', 'luisherrera', $c$Gracias, justo eso haré.$c$, 0.50),
('¿Cómo presento mi primer', 'Presenta **una línea', 'mateorios', $c$Entendido, prepararé una sola línea con dos aplicaciones. ¡Gracias!$c$, 0.60),
('Cómo elegir una paleta', '¿Algún recurso para practicar', 'marianaruiz', $c$Prueba Coolors y Adobe Color; sirven para explorar y guardar paletas.$c$, 0.75)
) as v(post_prefix, parent_prefix, username, body, frac)
join public.posts p     on p.title like v.post_prefix || '%'
join public.comments pc on pc.post_id = p.id and pc.parent_id is null and pc.body like v.parent_prefix || '%'
join public.profiles u  on u.username = v.username;

-- ── Respuestas aceptadas (el trigger suma +15 de reputación) ────────────────
update public.comments c set is_accepted = true
from (values
  ('¿Qué tipografías recomiendan', 'Para el cuerpo te sugiero'),
  ('¿Cobrar por hora',             'Por proyecto, pero'),
  ('¿Qué lente conviene',          'Con APS-C, un')
) as a(post_prefix, comment_prefix)
join public.posts p on p.title like a.post_prefix || '%'
where c.post_id = p.id and c.parent_id is null and c.body like a.comment_prefix || '%';

-- ── Reacciones (deterministas: siempre salen los mismos números) ────────────
-- Cada post tiene una "popularidad" propia entre 30 % y 79 %.
insert into public.likes (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join public.posts p
where p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
  and u.id <> p.author_id
  and abs(hashtext(u.username || p.id::text)::bigint) % 100
      < 30 + abs(hashtext(p.id::text)::bigint) % 50;

insert into public.helpful_marks (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join public.posts p
where p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
  and p.type <> 'pregunta'
  and u.id <> p.author_id
  and abs(hashtext('h' || u.username || p.id::text)::bigint) % 100
      < 15 + abs(hashtext(p.id::text)::bigint) % 45;

insert into public.saves (user_id, post_id)
select u.id, p.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') u
cross join public.posts p
where p.author_id in (select p2.id from public.profiles p2 join auth.users au2 on au2.id = p2.id and au2.email like '%@seed.theproknow.test')
  and abs(hashtext('s' || u.username || p.id::text)::bigint) % 100 < 18;

insert into public.follows (follower_id, following_id)
select a.id, b.id
from (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') a
cross join (select p.id, p.username from public.profiles p join auth.users au on au.id = p.id and au.email like '%@seed.theproknow.test') b
where a.id <> b.id
  and abs(hashtext(a.username || '>' || b.username)::bigint) % 100 < 45;
