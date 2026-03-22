"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 🔥 Obtener usuario inicial
    getUser()

    // 🔥 ESCUCHAR CAMBIOS DE SESIÓN (CLAVE)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()

    // 🔥 actualizar UI
    setUser(null)

    // 🔥 redirigir
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
            P
          </div>

          <div>
            <h1 className="font-bold text-lg text-gray-900">
              ThePROknow
            </h1>
            <p className="text-xs text-blue-500 font-semibold">
              EXPERTISE HUB
            </p>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="flex-1 mx-10">
          <input
            placeholder="Buscar consejos..."
            className="w-full bg-gray-100 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Ingresar
              </button>

              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow hover:scale-105 transition"
              >
                Unirse
              </button>
            </>
          ) : (
            <>
              {/* PERFIL */}
              <div
                onClick={() => router.push(`/profile/${user.id}`)}
                className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition"
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Salir
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  )
}