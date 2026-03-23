"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    getUser()

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
    setUser(null)
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">

      {/* 🔥 HEADER MÁS COMPACTO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-between gap-3">

        {/* LOGO */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
            P
          </div>

          <div>
            <h1 className="font-bold text-sm sm:text-lg text-gray-900">
              ThePROknow
            </h1>

            {/* 🔥 OCULTO EN MOBILE */}
            <p className="hidden sm:block text-xs text-blue-500 font-semibold">
              EXPERTISE HUB
            </p>
          </div>
        </div>

        {/* 🔍 BUSCADOR (RESPONSIVE) */}
        <div className="flex-1 mx-2 sm:mx-10">
          <input
            placeholder="Buscar..."
            className="w-full bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2 sm:gap-4">

          {!user ? (
            <>
              <button
                onClick={() => router.push("/login")}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
              >
                Ingresar
              </button>

              <button
                onClick={() => router.push("/register")}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow hover:scale-105 transition"
              >
                Unirse
              </button>
            </>
          ) : (
            <>
              {/* PERFIL */}
              <div
                onClick={() => router.push(`/profile/${user.id}`)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer hover:scale-105 transition"
              >
                {user.email?.charAt(0).toUpperCase()}
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="text-[10px] sm:text-xs text-gray-500 hover:text-red-500"
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