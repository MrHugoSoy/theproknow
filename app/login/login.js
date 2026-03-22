"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Completa todos los campos")
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log("LOGIN:", data, error)

        if (error) {
          alert(error.message)
          setLoading(false)
          return
        }

        router.push("/")
      } else {
        // 🚀 REGISTRO
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        console.log("SIGNUP:", data, error)

        if (error) {
          alert(error.message)
          setLoading(false)
          return
        }

        if (!data.user) {
          alert("No se creó el usuario")
          setLoading(false)
          return
        }

        // 🔥 CREAR PROFILE
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name: email.split("@")[0],
            },
          ])

        if (profileError) {
          console.error(profileError)
        }

        alert("Cuenta creada 🚀")

        // 🔥 LOGIN AUTOMÁTICO
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          alert("Error al iniciar sesión")
          setLoading(false)
          return
        }

        router.push("/")
      }
    } catch (err) {
      console.error(err)
      alert("Error inesperado")
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">

      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-200">

        {/* TITULO */}
        <h1 className="text-3xl font-extrabold text-center mb-6">
          {isLogin ? "Bienvenido 👋" : "Crear cuenta 🚀"}
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* BOTON */}
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            loading
              ? "bg-gray-300 text-gray-500"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading
            ? "Cargando..."
            : isLogin
            ? "Iniciar sesión"
            : "Registrarse"}
        </button>

        {/* SWITCH */}
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-500 text-center mt-4 cursor-pointer hover:text-blue-500"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </p>

      </div>

    </main>
  )
}