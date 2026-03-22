"use client"

export default function StatsCard({ posts, usersCount }) {
  const totalLikes = posts.reduce(
    (acc, p) => acc + (p.likes_count || 0),
    0
  )

  // 🆕 POSTS HOY
  const today = new Date().toDateString()

  const postsToday = posts.filter(p => {
    return new Date(p.created_at).toDateString() === today
  }).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      <div className="flex items-center gap-2 mb-4">
        <span>📊</span>
        <h2 className="font-semibold text-gray-800">
          Estadísticas
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">

        {/* POSTS */}
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{posts.length}</p>
          <p className="text-xs text-gray-500">Posts</p>
        </div>

        {/* USUARIOS */}
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{usersCount}</p>
          <p className="text-xs text-gray-500">Usuarios</p>
        </div>

        {/* LIKES */}
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{totalLikes}</p>
          <p className="text-xs text-gray-500">Likes</p>
        </div>

        {/* NUEVOS HOY */}
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{postsToday}</p>
          <p className="text-xs text-gray-500">Nuevos Hoy</p>
        </div>

      </div>

    </div>
  )
}