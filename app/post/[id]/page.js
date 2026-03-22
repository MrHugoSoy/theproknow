"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"

export default function PostPage() {
  const params = useParams()
  const id = params?.id

  const [post, setPost] = useState(null)
  const [user, setUser] = useState(null)
  const [likes, setLikes] = useState([])

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    const currentUser = await getUser()
    setUser(currentUser)

    // 📥 POST
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()

    // 👤 PERFIL
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user_id)
      .single()

    // ❤️ REACCIONES
    const { data: reactions } = await supabase
      .from("likes")
      .select("*")
      .eq("post_id", id)

    const likesCount =
      reactions?.filter((r) => r.reaction_type === "like").length || 0

    const dislikesCount =
      reactions?.filter((r) => r.reaction_type === "dislike").length || 0

    setPost({
      ...data,
      name: profile?.name || "Usuario",
      likes_count: likesCount,
      dislikes_count: dislikesCount,
    })

    if (currentUser) {
      const { data: userLikes } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", currentUser.id)

      setLikes(userLikes || [])
    }
  }

  const toggleReaction = async (type) => {
    if (!user) return alert("Inicia sesión")

    const existing = likes.find((l) => l.post_id === post.id)

    if (existing) {
      if (existing.reaction_type === type) {
        await supabase.from("likes").delete().eq("id", existing.id)
      } else {
        await supabase
          .from("likes")
          .update({ reaction_type: type })
          .eq("id", existing.id)
      }
    } else {
      await supabase.from("likes").insert([
        {
          post_id: post.id,
          user_id: user.id,
          reaction_type: type,
        },
      ])
    }

    loadData()
  }

  if (!post) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando...
      </main>
    )
  }

  const reaction = likes.find(
    (l) => l.post_id === post.id
  )?.reaction_type

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto p-6">

        {/* 🖼️ IMAGEN */}
        <img
          src={post.image_url}
          className="w-full h-80 object-cover rounded-2xl mb-6"
        />

        {/* 📝 CONTENIDO */}
        <h1 className="text-2xl font-bold mb-2">
          {post.title}
        </h1>

       <p className="whitespace-pre-line text-gray-700 leading-relaxed">
  {post.content}
</p>

        {/* 👤 USER */}
        <p className="text-sm text-gray-500 mb-6">
          Por {post.name}
        </p>

        {/* 🔗 LINK */}
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            className="block bg-blue-500 text-white px-4 py-2 rounded-xl mb-6 text-center"
          >
            🔗 Ver recurso
          </a>
        )}

        {/* 👍👎 */}
        <div className="flex gap-3">

          <button
            onClick={() => toggleReaction("like")}
            className={`px-4 py-2 rounded-full ${
              reaction === "like"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            👍 {post.likes_count}
          </button>

          <button
            onClick={() => toggleReaction("dislike")}
            className={`px-4 py-2 rounded-full ${
              reaction === "dislike"
                ? "bg-red-500 text-white"
                : "bg-gray-200"
            }`}
          >
            👎 {post.dislikes_count}
          </button>

        </div>

      </div>
    </main>
  )
}