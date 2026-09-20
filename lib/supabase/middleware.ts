import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, requireSupabaseEnv } from "./env";

const PROTECTED = ["/publicar", "/notificaciones", "/guardados", "/ajustes"];
const AUTH_PAGES = ["/login", "/registro"];

const matches = (path: string, bases: string[]) =>
  bases.some((b) => path === b || path.startsWith(`${b}/`));

/** Refresca la sesión en cada request y aplica la protección de rutas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const { url, anonKey } = requireSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida el token con Supabase (no confiar en getSession() en el servidor).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const redirect = (to: string, search?: string) => {
    const target = request.nextUrl.clone();
    target.pathname = to;
    target.search = search ?? "";
    const res = NextResponse.redirect(target);
    // conserva las cookies de sesión refrescadas
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && matches(path, PROTECTED)) {
    return redirect("/login", `?next=${encodeURIComponent(path + request.nextUrl.search)}`);
  }
  if (user && matches(path, AUTH_PAGES)) return redirect("/");

  return response;
}
