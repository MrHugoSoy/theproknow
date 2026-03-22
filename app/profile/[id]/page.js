"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import PostCard from "@/components/PostCard"

export default function Profile() {
  const params = useParams()
  const id = params?.id

  const [userProfile, setUserProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [category, setCategory] = useState("carpinteria")
  const [likes, setLikes] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // FORM
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [link, setLink] = useState("")

  useEffect(() => {
    if (!id) return

    const init = async () => {
      const currentUser = await getUser()
      setUser(currentUser)

      await loadData(currentUser)
    }

    init()
  }, [id])

  const loadData = async (currentUser) => {
    setLoading(true)

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)

    const profile = profileData?.[0] || null

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })

    if (currentUser) {
      const { data: userLikes } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", currentUser.id)

      setLikes(userLikes || [])
    }

    const postsWithCounts = await Promise.all(
      (postsData || []).map(async (post) => {
        const { data: reactions } = await supabase
          .from("likes")
          .select("reaction_type")
          .eq("post_id", post.id)

        return {
          ...post,
          likes_count: reactions?.filter(r => r.reaction_type === "like").length || 0,
          dislikes_count: reactions?.filter(r => r.reaction_type === "dislike").length || 0,
          name: profile?.name || "Usuario",
        }
      })
    )

    setUserProfile(profile)
    setPosts(postsWithCounts)
    setLoading(false)
  }

  const toggleReaction = async (postId, type) => {
    if (!user) return alert("Debes iniciar sesión")

    const existing = likes.find((l) => l.post_id === postId)

    if (existing) {
      if (existing.reaction_type === type) {
        await supabase.from("likes").delete().eq("id", existing.id)
      } else {
        await supabase.from("likes").update({ reaction_type: type }).eq("id", existing.id)
      }
    } else {
      await supabase.from("likes").insert([
        { post_id: postId, user_id: user.id, reaction_type: type },
      ])
    }

    await loadData(user)
  }

  const deletePost = async (postId) => {
    if (!confirm("¿Eliminar este post?")) return

    await supabase.from("posts").delete().eq("id", postId)
    await loadData(user)
  }

  const uploadImage = async () => {
    if (!file) return null

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, file)

    if (error) {
      alert(error.message)
      return null
    }

    const { data } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const createPost = async () => {
    if (!title || !content) return alert("Completa los campos")

    const imageUrl = await uploadImage()

    await supabase.from("posts").insert([
      {
        title,
        content,
        image_url: imageUrl,
        link,
        category,
        user_id: user.id,
      },
    ])

    setTitle("")
    setContent("")
    setFile(null)
    setLink("")
    setCategory("carpinteria")

    await loadData(user)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* PERFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center font-bold">
            {userProfile?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h1 className="font-bold text-lg">{userProfile?.name}</h1>
            <p className="text-sm text-gray-500">{posts.length} publicaciones</p>
          </div>
        </div>

        {/* FORM PRO */}
        {user && id && String(user.id) === String(id) && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10">

            <p className="font-semibold text-gray-800 mb-4 text-lg">
              Comparte un tip 🚀
            </p>

            <div className="space-y-4">

              <input
                placeholder="Título del consejo..."
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                placeholder="Escribe tu consejo..."
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <div className="flex flex-wrap gap-2">

  {[
    { id: "carpinteria", label: "🪵 Carpintería" },
    { id: "mecanica", label: "🔧 Mecánica" },
    { id: "rope access", label: "🧗 Rope access" },
    { id: "dinero", label: "💰 Dinero" },
    { id: "derecho", label: "⚖️ Derecho" },
  ].map((cat) => (
    <button
      key={cat.id}
      onClick={() => setCategory(cat.id)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        category === cat.id
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {cat.label}
    </button>
  ))}

</div>

              {/* UPLOAD BONITO */}
              <label className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl cursor-pointer transition">

                <span className="text-sm text-gray-500">
                  {file ? file.name : "Subir imagen"}
                </span>

                <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                  Elegir
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-44 object-cover rounded-xl"
                />
              )}

              <input
                placeholder="Agregar link (opcional)"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />

              <button
                onClick={createPost}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium shadow hover:scale-[1.02] transition"
              >
                Publicar
              </button>

            </div>
          </div>
        )}

        {/* POSTS (MASONRY) */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">

          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard
                post={post}
                user={user}
                reaction={likes.find(l => l.post_id === post.id)?.reaction_type}
                toggleReaction={toggleReaction}
                onDelete={deletePost}
              />
            </div>
          ))}

        </div>

      </div>

    </main>
  )
}