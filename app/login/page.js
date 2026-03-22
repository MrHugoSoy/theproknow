"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signUp } from "@/lib/auth"

export default function Login({ defaultMode = "login" }) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(defaultMode === "login")
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Completa todos los campos")
      return
    }

    setLoading(true)

    if (isLogin) {
      const res = await signIn(email, password)
      if (res) router.push("/")
    } else {
      const res = await signUp(email, password)
      if (res) router.push("/")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200">

      <div className="w-full max-w-md px-6">

        {/* CARD */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8 transition-all">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              P
            </div>

            <h1 className="text-2xl font-bold mt-3">
              {isLogin ? "Bienvenido 👋" : "Crear cuenta 🚀"}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {isLogin
                ? "Accede a tu cuenta"
                : "Únete a la comunidad"}
            </p>
          </div>

          {/* FORM */}
          <div className="space-y-4">

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            {/* BOTON */}
            <button
              onClick={handleAuth}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                loading
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-[1.02] shadow-lg"
              }`}
            >
              {loading
                ? "Cargando..."
                : isLogin
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </button>
          </div>

          {/* SWITCH */}
          <div className="text-center mt-6">
            <p
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-500 cursor-pointer hover:text-blue-500 transition"
            >
              {isLogin
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          ThePROknow © 2026
        </p>

      </div>
    </main>
  )
}