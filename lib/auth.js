// /lib/auth.js
import { supabase } from "./supabase"

// 🔐 LOGIN
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("LOGIN:", data, error)

  if (error) {
    alert(error.message)
    return null
  }

  return data
}

// 🚀 REGISTER
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log("SIGNUP DATA:", data)
    console.log("SIGNUP ERROR:", error)

    if (error) {
      alert(error.message)
      return null
    }

    // ⚠️ Si no hay user → probablemente confirm email activo
    if (!data.user) {
      alert("Revisa tu correo para confirmar tu cuenta 📩")
      return null
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
      console.error("PROFILE ERROR:", profileError)
    }

    // 🔥 LOGIN AUTOMÁTICO
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      alert("Error al iniciar sesión después del registro")
      return null
    }

    return loginData

  } catch (err) {
    console.error("ERROR TOTAL:", err)
    alert("Error inesperado")
    return null
  }
}

// 👤 GET USER (🔥 NECESARIO para tu app)
export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

// 🚪 LOGOUT
export const signOut = async () => {
  await supabase.auth.signOut()
}