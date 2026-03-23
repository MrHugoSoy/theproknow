"use client"

import PostCard from "./PostCard"

export default function Feed({
  posts,
  loading,
  likes,
  user,
  toggleReaction,
}) {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">

      {loading
        ? Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid bg-white rounded-2xl p-4 animate-pulse space-y-3"
            >
              <div className="w-full h-40 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          ))
        : posts.map(post => {

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
  )
}