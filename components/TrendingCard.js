"use client"

import { useRouter } from "next/navigation"

export default function TrendingCard({ posts }) {
  const router = useRouter()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      <h2 className="font-semibold text-gray-800 mb-3">
        🔥 Trending
      </h2>

      <div className="space-y-2">

        {posts.map((post, index) => (
          <div
            key={post.id}
            onClick={() => router.push(`/post/${post.id}`)}
            className="bg-gray-100 rounded-xl p-2 text-xs hover:bg-gray-200 cursor-pointer transition"
          >
            <p className="font-medium line-clamp-1">
              {index + 1}. {post.title}
            </p>

            <p className="text-gray-400 text-[10px]">
              👍 {post.likes_count || 0}
            </p>
          </div>
        ))}

      </div>

    </div>
  )
}