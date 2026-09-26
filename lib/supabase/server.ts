import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { isSupabaseConfigured, requireSupabaseEnv } from "./env";

/** Cliente para Server Components, Server Actions y Route Handlers. */
export async function createClient() {
  // Modo demo: sin variables no hay sesión posible. Un cliente con valores de relleno hace que
  // `auth.getUser()` devuelva null sin red, y las Server Actions responden "auth" en vez de lanzar.
  const { url, anonKey } = isSupabaseConfigured()
    ? requireSupabaseEnv()
    : { url: "http://localhost:54321", anonKey: "demo" };
  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: el middleware ya refresca la sesión.
        }
      },
    },
  });
}
