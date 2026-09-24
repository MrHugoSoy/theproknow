# TheProKnow

**Aprende de quienes saben.** Red social de conocimiento en español donde la gente comparte consejos, preguntas, tutoriales y artículos.

Diseño de referencia: [`docs/mockup.png`](docs/mockup.png).

## Stack

- **Next.js 15** (App Router, Server Components por defecto) + **TypeScript** estricto
- **Tailwind CSS v4**, Inter, `lucide-react`
- **Supabase**: Auth (correo + Google), Postgres con RLS, Storage
- **zod** para validar en cliente y servidor · **react-markdown** (sin HTML crudo)
- Despliegue en **Vercel**

## Requisitos

- Node.js 20 o superior
- Un proyecto de [Supabase](https://supabase.com) (el plan gratuito basta)

## Puesta en marcha

### 1. Instalar

```bash
npm install
```

### 2. Crear la base de datos

En tu proyecto de Supabase abre **SQL Editor** y ejecuta, **en este orden**, cada archivo de [`supabase/migrations`](supabase/migrations) (uno por consulta):

| # | Archivo | Qué hace |
|---|---------|----------|
| 1 | `20260920000001_schema.sql` | Tablas, índices, triggers (contadores, reputación, notificaciones), niveles y **RLS en todas las tablas** |
| 2 | `20260920000002_storage_and_communities.sql` | Buckets `covers` y `avatars` y las 6 comunidades |
| 3 | `20260920000003_feeds.sql` | Feeds paginados por cursor y `trending_tags` |
| 4 | `20260920000004_feeds_as_of.sql` | Paginación estable en feeds por puntaje |
| 5 | `20260920000005_anon_reaction_select.sql` | Permiso de lectura para visitantes (RLS sigue ocultando las filas) |
| 6 | `20260920000006_feed_search_saved.sql` | Búsqueda de texto y modo «guardados» |
| 7 | `20260920000007_reputation_on_delete.sql` | Descuenta la reputación al borrar una publicación o una respuesta aceptada |
| 8 | `20260923000001_activate_carpinteria.sql` | Activa la comunidad Carpintería (se puede publicar y unirse) |
| 9 | `20260923000002_activate_all_communities.sql` | Activa las 3 comunidades restantes: las 6 quedan abiertas |

Alternativa con la CLI de Supabase: `supabase link --project-ref <ref>` y `supabase db push`.

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena `.env.local` (Project Settings → API en Supabase):

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave `anon` / `publishable` (pública por diseño; la protege RLS) |
| `NEXT_PUBLIC_SITE_URL` | **Solo el origen**, sin ruta: `http://localhost:3000` o `https://tu-dominio.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo para scripts locales. **Nunca** con prefijo `NEXT_PUBLIC_` ni en el cliente |

### 4. Configurar Auth en Supabase

**Authentication → URL Configuration**

- *Site URL*: tu `NEXT_PUBLIC_SITE_URL`
- *Redirect URLs*: `http://localhost:3000/**` y, en producción, `https://tu-dominio.com/**`

**Google (opcional)**

1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) crea un *OAuth client ID* (tipo «Web application»).
2. Como *Authorized redirect URI* pon la que muestra Supabase en **Authentication → Providers → Google** (`https://<ref>.supabase.co/auth/v1/callback`).
3. Pega el *Client ID* y el *Client Secret* en ese mismo panel y activa el proveedor.

**Confirmación de correo**: viene activa. En desarrollo puedes desactivarla en *Authentication → Sign In / Providers → Email* para no depender del envío de correos (el servidor gratuito de Supabase tiene un límite bajo por hora).

### 5. Datos de ejemplo (opcional)

Pega [`supabase/seed.sql`](supabase/seed.sql) en el SQL Editor. Crea 12 usuarios ficticios, 30 publicaciones y 48 comentarios en español (Diseño Gráfico y Fotografía), con likes, «Me ayudó» y respuestas aceptadas. Es idempotente: se puede volver a ejecutar, y solo toca cuentas `@seed.theproknow.test`. Esos usuarios no tienen contraseña, así que nadie puede iniciar sesión con ellos.

### 6. Arrancar

```bash
npm run dev
```

Abre <http://localhost:3000>. Sin variables de Supabase la app arranca en **modo demo** con datos de ejemplo en memoria (sin persistencia).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm start` | Sirve la compilación |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:e2e` | Pruebas de extremo a extremo (Playwright) |

> Si compilas mientras `next dev` está abierto, usa un directorio aparte para no pisar su caché:
> `NEXT_DIST_DIR=.next-build npm run build`.

## Pruebas

- **Unitarias** (`lib/**/*.test.ts`, Vitest): reputación y niveles, utilidades de texto/fecha/formato, y
  cada esquema de `lib/validation`. Son funciones puras, sin Supabase ni red — se ejecutan con `npm test`.
- **Extremo a extremo** (`e2e/*.spec.ts`, Playwright): navegación pública, páginas estáticas, 404 (ruta
  desconocida, post/perfil/comunidad inexistentes) y `robots.txt`/`sitemap.xml`. Se ejecutan con
  `npm run test:e2e` (la primera vez, instala el navegador con `npx playwright install chromium`).
  Estas pruebas usan un navegador sin sesión iniciada y pasan igual **con o sin** Supabase configurado,
  para que corran en CI sin necesitar secretos. Cubren solo lectura: publicar, comentar, reaccionar,
  etc. no tienen pruebas automatizadas todavía y se han verificado manualmente contra un proyecto real.

## Integración continua

`.github/workflows/ci.yml` corre en cada push y pull request a `main`: tipos, lint, pruebas unitarias,
build de producción y las pruebas E2E. No requiere configurar ningún secreto — todo corre en "modo
demo" (sin variables de Supabase), igual que se describe arriba.

## Despliegue en Vercel

1. Sube el repositorio a GitHub e impórtalo en [vercel.com/new](https://vercel.com/new) (Framework: Next.js, sin cambiar comandos).
2. En **Settings → Environment Variables** añade `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL` (con tu dominio final, solo el origen). **No** añadas la *service role key*.
3. Despliega. Después, en Supabase (**Authentication → URL Configuration**) añade la URL de producción como *Site URL* y `https://tu-dominio.com/**` en *Redirect URLs*.
4. Si usas Google, no cambia nada en Google Cloud: la URI de retorno es la de Supabase.
5. Comprueba `https://tu-dominio.com/sitemap.xml` y `/robots.txt`.

> `NEXT_PUBLIC_SITE_URL` alimenta los enlaces de confirmación de correo, el sitemap, el canonical y las imágenes OG. Si no la defines, se usa `VERCEL_PROJECT_PRODUCTION_URL`.

## Estructura

```
app/
  (auth)/         login y registro
  (main)/         layout con navbar y sidebars
    (home)/       feed («/») con skeleton de carga
    p/[id]        detalle de publicación + comentarios
    u/[username]  perfil        c/[slug]  comunidad
    explorar · buscar · guardados · notificaciones · publicar · ajustes · mensajes
  actions/        Server Actions (zod): posts, comentarios, reacciones, seguir, reportes…
  auth/callback   intercambio de código OAuth / confirmación de correo
components/       ui/ · feed/ · comments/ · layout/ · report/ · settings/ …
lib/              data/ (consultas), supabase/ (clientes), validation/ (zod), reputation.ts
supabase/         migrations/ y seed.sql
docs/mockup.png   diseño de referencia
```

## Modelo de datos y reglas

- **Reputación**: +10 por cada «Me ayudó» recibido, +2 por like recibido, +15 por respuesta aceptada. Niveles: Novato (0) · Aprendiz (100) · Conocedor (500) · Experto (2 000) · Maestro (5 000). La función SQL `reputation_level(puntos)` devuelve nivel, nombre y progreso.
- **Anti-abuso**: no puedes dar like ni «Me ayudó» a tu propia publicación; no puedes aceptar tu propia respuesta; 5 reportes de usuarios distintos ocultan una publicación automáticamente.
- **Límite de frecuencia** (en la base de datos, aplica también a la API directa): 10 publicaciones por hora y 30 comentarios cada 10 minutos por usuario.
- **Feeds** (`feed_nuevos`, `feed_siguiendo`, `feed_tendencias`, `feed_para_ti`), paginados por cursor. Tendencias: `(helpful×3 + likes + comentarios×2) / (horas + 2)^1.5`. «Para ti» = Tendencias × boost por autores seguidos (×0.75) y comunidades a las que te uniste (×0.5).
- **Etiquetas**: no hay tabla de etiquetas; las «Tendencias» se calculan extrayendo los `#hashtags` del título y el cuerpo.

## Seguridad

- **RLS activo en las 11 tablas**, con permisos por columna: nadie puede escribir su reputación, `is_verified`, contadores ni `hidden` desde la API.
- Las funciones internas (triggers, `add_reputation`) **no** son ejecutables por la API; solo `reputation_level`, `toggle_accepted_answer` y los feeds.
- El contenido se guarda como texto y se renderiza con Markdown **sin HTML crudo**; las URLs se filtran y las portadas/avatares solo se aceptan desde la carpeta propia del usuario en Storage.
- Cabeceras de seguridad (HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). No se define una CSP estricta todavía.

## Accesibilidad

Etiquetas en todos los campos, enlace «Saltar al contenido», foco visible, diálogo de reporte nativo (`<dialog>`), respeto a `prefers-reduced-motion` y contraste **AA** verificado (medido y con auditoría automatizada axe-core sin violaciones en las páginas principales).

## Fuera del MVP

Historias, mensajes directos (`/mensajes` es un placeholder), plan Pro (tarjeta deshabilitada), encuestas y subida de video (solo enlaces de YouTube en tutoriales).

## Pendiente antes de lanzar

- Revisar **Privacidad** y **Términos**: son un borrador que describe el funcionamiento actual, no un texto legal.
- Añadir un canal de contacto real en `/contacto`.
- Valorar una política CSP y un servicio de correo propio (SMTP) para los correos de Auth.
