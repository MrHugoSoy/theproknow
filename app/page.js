"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"

import { sortPosts, getTrendingScore } from "@/lib/algorithm"

import CategoriesBar from "@/components/CategoriesBar"
import StatsCard from "@/components/StatsCard"
import TrendingCard from "@/components/TrendingCard"
import AdCard from "@/components/AdCard"
import Feed from "@/components/Feed"

export default function Landing() {
  const router = useRouter()

  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(null)
  const [likes, setLikes] = useState([])
  const [usersCount, setUsersCount] = useState(0)

  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("trending")
  const [loading, setLoading] = useState(true)

  // 🔥 NUEVO
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 10

  useEffect(() => {
    getPosts(0, true)
    getUsersCount()
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getUser()
    setUser(currentUser)

    if (currentUser) {
      await getLikes(currentUser.id)
    }
  }

  const getUsersCount = async () => {
    const { data } = await supabase.rpc("get_users_count")
    setUsersCount(data || 0)
  }

  const getProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*")
    return data || []
  }

  // 🔥 NUEVO getPosts con paginación
  const getPosts = async (pageNumber = 0, reset = false) => {
    if (!hasMore && !reset) return

    setLoading(true)

    const from = pageNumber * LIMIT
    const to = from + LIMIT - 1

    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to)

    if (!data || data.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    const profiles = await getProfiles()

    const newPosts = await Promise.all(
      data.map(async (post) => {
        const userProfile = profiles.find(p => p.id === post.user_id)

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
          name: userProfile?.name || "Usuario",
          likes_count: likesCount || 0,
          dislikes_count: dislikesCount || 0,
        }
      })
    )

    setPosts(prev => reset ? newPosts : [...prev, ...newPosts])
    setPage(pageNumber)
    setLoading(false)
  }

  const getLikes = async (userId) => {
    const { data } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)

    setLikes(data || [])
  }

  const toggleReaction = async (postId, type) => {
    if (!user) {
      router.push("/login")
      return
    }

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
    await getPosts(0, true)
  }

  // 🔥 SCROLL INFINITO
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        getPosts(page + 1)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [page, hasMore])

  // 🔥 FILTRO + ALGORITMO
  const filteredPosts = sortPosts(
    posts.filter(post => {
      const matchesSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.content?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        category === "all" || post.category === category

      return matchesSearch && matchesCategory
    }),
    sort
  )

  const trendingPosts = [...posts]
    .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
    .slice(0, 3)

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-6 flex gap-4 lg:gap-6">

        {/* LEFT */}
        <div className="w-56 hidden lg:block">
          <div className="sticky top-24">
            <CategoriesBar
              category={category}
              setCategory={setCategory}
              vertical
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 max-w-[1600px] mx-auto">

          {/* MENU */}
          <div className="sticky top-[65px] z-40 mb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">

              <button onClick={() => setSort("trending")}
                className={`px-4 py-2 rounded-full text-xs ${sort==="trending"?"bg-black text-white":"bg-gray-200"}`}>
                🔥 Trending
              </button>

              <button onClick={() => setSort("popular")}
                className={`px-4 py-2 rounded-full text-xs ${sort==="popular"?"bg-black text-white":"bg-gray-200"}`}>
                👍 Popular
              </button>

              <button onClick={() => setSort("new")}
                className={`px-4 py-2 rounded-full text-xs ${sort==="new"?"bg-black text-white":"bg-gray-200"}`}>
                🆕 Nuevo
              </button>

            </div>
          </div>

          {/* FEED */}
          <Feed
            posts={filteredPosts}
            loading={loading}
            likes={likes}
            user={user}
            toggleReaction={toggleReaction}
          />

        </div>

        {/* RIGHT */}
        <div className="w-72 hidden lg:block space-y-4">

          <StatsCard posts={posts} usersCount={usersCount} />

          <div className="sticky top-24 space-y-4">
            <TrendingCard posts={trendingPosts} />
            <AdCard />
          </div>

        </div>

      </div>

    </main>
  )
}