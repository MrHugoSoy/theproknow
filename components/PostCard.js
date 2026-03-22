"use client"

import { useRouter } from "next/navigation"

export default function PostCard({
  post,
  user,
  reaction,
  toggleReaction,
  onDelete,
}) {
  const router = useRouter()

  const isOwner =
    user && post && String(user.id) === String(post.user_id)

  const goToPost = () => {
    router.push(`/post/${post.id}`)
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition break-inside-avoid">

      {/* IMAGE */}
      <div className="relative">

        <div onClick={goToPost} className="cursor-pointer">

          <img
            src={post.image_url || "https://picsum.photos/500"}
            className="w-full object-cover aspect-[4/5] group-hover:scale-105 transition duration-300"
          />

          {/* 🔥 OVERLAY SUAVE */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* 🔥 CATEGORY FLOAT */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium shadow">
                {post.category}
              </span>
            </div>
          )}

          {/* 🔥 ACTION BAR */}
          <div className="absolute bottom-3 left-3 right-3">

            <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 flex justify-between items-center">

              <div className="flex gap-3 text-white text-sm">

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleReaction(post.id, "like")
                  }}
                  className="flex items-center gap-1 hover:scale-110 transition"
                >
                  ❤️ {post.likes_count || 0}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleReaction(post.id, "dislike")
                  }}
                  className="flex items-center gap-1 hover:scale-110 transition"
                >
                  👎 {post.dislikes_count || 0}
                </button>

              </div>

              {post.link && (
                <a
                  href={post.link}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white hover:scale-110 transition"
                >
                  🔗
                </a>
              )}

            </div>

          </div>

        </div>

        {/* DELETE */}
        {onDelete && isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(post.id)
            }}
            className="absolute top-3 right-3 z-50 bg-white/90 backdrop-blur text-red-500 px-2 py-1 rounded-md text-xs shadow hover:bg-red-500 hover:text-white transition"
          >
            ✕
          </button>
        )}

      </div>

      {/* INFO */}
      <div className="p-4 space-y-2">

        {/* USER */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
            {post.name?.charAt(0)?.toUpperCase()}
          </div>

          <span
            onClick={() => router.push(`/profile/${post.user_id}`)}
            className="cursor-pointer hover:underline"
          >
            @{post.name}
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {post.title}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-500 line-clamp-2 whitespace-pre-line">
          {post.content}
        </p>

      </div>
    </div>
  )
}