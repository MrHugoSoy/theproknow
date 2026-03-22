"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUser, signOut } from "@/lib/auth"
import PostCard from "@/components/PostCard"

export default function Home() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [link, setLink] = useState("")
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState("carpinteria")

  const [error, setError] = useState("")
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState(null)
  const [likes, setLikes] = useState([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser()

      if (!currentUser) {
        router.push("/login")
      } else {
        setUser(currentUser)
        await getPosts(currentUser)
        await getLikes(currentUser.id)
      }
    }

    checkUser()
  }, [])

  // 🔥 POSTS
  const getPosts = async (currentUser) => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })

    if (!data) return setPosts([])

    const postsWithReactions = await Promise.all(
      data.map(async (post) => {
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)
          .eq("reaction_type", "like")

        const { count: dislikesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)
          .eq("reaction_type", "dislike")

        return {
          ...post,
          name: "Tú",
          likes_count: likesCount || 0,
          dislikes_count: dislikesCount || 0,
        }
      })
    )

    setPosts(postsWithReactions)
  }

  const getLikes = async (userId) => {
    const { data } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)

    setLikes(data || [])
  }

  // 🔁 TOGGLE
  const toggleReaction = async (postId, type) => {
    const existing = likes.find(
      (l) => l.post_id === postId && l.user_id === user.id
    )

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
          user_id: user.id,
          post_id: postId,
          reaction_type: type,
        },
      ])
    }

    await getLikes(user.id)
    await getPosts(user)
  }

  // 📸 IMAGEN
  const uploadImage = async () => {
    if (!image) return null

    const fileName = Date.now() + "-" + image.name.replace(/\s+/g, "-")

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, image)

    if (error) {
      alert(error.message)
      return null
    }

    const { data } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  // ➕ POST
  const createPost = async () => {
    if (!title) return setError("El título es obligatorio")
    if (!text) return setError("El contenido es obligatorio")

    setError("")

    const imageUrl = await uploadImage()

    await supabase.from("posts").insert([
      {
        title,
        content: text,
        link,
        image_url: imageUrl,
        category,
        user_id: user.id,
      },
    ])

    setTitle("")
    setText("")
    setLink("")
    setImage(null)
    setCategory("carpinteria")

    await getPosts(user)
  }

  const deletePost = async (id) => {
    await supabase.from("posts").delete().eq("id", id)
    await getPosts(user)
  }

  const filteredPosts = posts.filter((post) => {
    if (!search) return true

    return (
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.content?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">
              Mi Feed 🚀
            </h1>
            <p className="text-gray-500 mt-1">
              Solo ves tus propios consejos
            </p>
          </div>

          <button
            onClick={async () => {
              await signOut()
              router.push("/login")
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm"
          >
            🚪 Cerrar sesión
          </button>
        </div>

        {/* 🔥 FORMULARIO (FIX CLAVE) */}
        <div className="relative z-10 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del consejo..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué consejo quieres compartir?"
              className="w-full min-h-[120px] bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
            />

            {/* CATEGORÍAS */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="carpinteria">🪵 Carpintería</option>
              <option value="mecanica">🔧 Mecánica</option>
              <option value="freelance">💻 Freelance</option>
              <option value="soldadura">💰 Soldadura</option>
              <option value="derecho">💰 Derecho</option>
            </select>

            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link (opcional)"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mb-4">
              <label className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl cursor-pointer">
                <span className="text-sm text-gray-500">
                  {image ? image.name : "Agregar imagen"}
                </span>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={createPost}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition"
            >
              Publicar
            </button>

          </div>
        </div>

        {/* 🔥 FEED (MASONRY REAL) */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">

          {filteredPosts.map((post) => {
            const reaction = likes.find(
              (l) => l.post_id === post.id
            )?.reaction_type

            return (
              <div key={post.id} className="break-inside-avoid">
                <PostCard
                  post={post}
                  user={user}
                  reaction={reaction}
                  toggleReaction={toggleReaction}
                  onDelete={deletePost}
                />
              </div>
            )
          })}

        </div>

      </div>

    </main>
  )
}