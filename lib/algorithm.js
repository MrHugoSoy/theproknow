// ==========================================
// 🔥 THEPROKNOW FEED ALGORITHM (PRO VERSION)
// ==========================================

// 🎯 SCORE GENERAL (balance entre popularidad + tiempo)
export const getPostScore = (post) => {
  const likes = post.likes_count || 0
  const dislikes = post.dislikes_count || 0

  // ⏱ calcular antigüedad en horas
  const hours =
    (Date.now() - new Date(post.created_at)) / 3600000

  // 🔥 posts nuevos tienen más boost
  const freshness = Math.max(0, 24 - hours)

  // 🎲 evita feed repetitivo (muy importante UX)
  const randomBoost = Math.random() * 2

  return (likes * 2) - (dislikes * 2) + freshness + randomBoost
}

// ==========================================
// 🚀 TRENDING (tipo Reddit / Hacker News)
// ==========================================

export const getTrendingScore = (post) => {
  const likes = post.likes_count || 0
  const dislikes = post.dislikes_count || 0

  const hours =
    (Date.now() - new Date(post.created_at)) / 3600000

  const gravity = 1.5

  return (likes - dislikes) / Math.pow(hours + 2, gravity)
}

// ==========================================
// 🆕 NUEVOS POSTS
// ==========================================

export const sortByNewest = (a, b) => {
  return new Date(b.created_at) - new Date(a.created_at)
}

// ==========================================
// 👍 POPULAR (simple)
// ==========================================

export const sortByLikes = (a, b) => {
  return (b.likes_count || 0) - (a.likes_count || 0)
}

// ==========================================
// 🔥 ALGORITMO PRINCIPAL (CONTROLADOR)
// ==========================================

export const sortPosts = (posts, type = "trending") => {
  if (!posts) return []

  const sorted = [...posts]

  switch (type) {
    case "trending":
      return sorted.sort(
        (a, b) => getTrendingScore(b) - getTrendingScore(a)
      )

    case "popular":
      return sorted.sort(
        (a, b) => getPostScore(b) - getPostScore(a)
      )

    case "likes":
      return sorted.sort(sortByLikes)

    case "new":
    default:
      return sorted.sort(sortByNewest)
  }
}

// ==========================================
// 🧠 BONUS PRO MAX (MEZCLA INTELIGENTE)
// ==========================================
// mezcla trending + nuevos + aleatorio

export const smartMix = (posts) => {
  if (!posts) return []

  const shuffled = [...posts].sort(() => Math.random() - 0.5)

  const trending = [...posts]
    .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
    .slice(0, 5)

  const newest = [...posts]
    .sort(sortByNewest)
    .slice(0, 5)

  // 🔥 combinación final
  const mix = [...trending, ...newest, ...shuffled]

  // eliminar duplicados
  const unique = Array.from(
    new Map(mix.map((item) => [item.id, item])).values()
  )

  return unique
}