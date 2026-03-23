"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUser } from "@/lib/auth"

import CategoriesBar from "@/components/CategoriesBar"
import PostCard from "@/components/PostCard"
import StatsCard from "@/components/StatsCard"
import TrendingCard from "@/components/TrendingCard"
import AdCard from "@/components/AdCard"

export default function Landing() {
  const router = useRouter()

  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(null)
  const [likes, setLikes] = useState([])
  const [usersCount, setUsersCount] = useState(0)

  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("recent")

  useEffect(() => {
    getPosts()
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

  const getPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!data) return setPosts([])

    const profiles = await getProfiles()

    const postsWithData = await Promise.all(
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

    setPosts(postsWithData)
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
    await getPosts()
  }

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.content?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        category === "all" || post.category === category

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sort === "popular") {
        return (b.likes_count || 0) - (a.likes_count || 0)
      }
      return new Date(b.created_at) - new Date(a.created_at)
    })

  const trendingPosts = [...posts]
    .sort((a, b) => {
      const scoreA = (a.likes_count || 0) - (a.dislikes_count || 0)
      const scoreB = (b.likes_count || 0) - (b.dislikes_count || 0)
      return scoreB - scoreA
    })
    .slice(0, 3)

  return (
    <main className="min-h-screen">

      <div className="w-full px-8 py-6 flex gap-6">

        {/* 🟣 LEFT */}
        <div className="w-56 hidden lg:block">
          <div className="sticky top-24">
            <CategoriesBar
              category={category}
              setCategory={setCategory}
              vertical
            />
          </div>
        </div>

        {/* 🔵 CENTER */}
        <div className="flex-1 max-w-[1600px] mx-auto">

          {/* 🔥 MASONRY PRO */}
          <div className="columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-6 space-y-6 [column-fill:_balance]">

            {filteredPosts.map(post => {

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
                  />
                </div>
              )
            })}

          </div>

        </div>

        {/* 🟡 RIGHT */}
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