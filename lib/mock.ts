// Datos mock de la Fase 1. Se reemplazan por Supabase en las fases 2–3.
import type { AuthorSummary, CommunitySummary, PostCardData } from "./types";

const author = (
  username: string,
  displayName: string,
  reputation: number,
  isVerified = true,
): AuthorSummary => ({
  id: username,
  username,
  displayName,
  avatarUrl: null,
  isVerified,
  reputation,
});

export const MOCK_ME = {
  ...author("hugo.ramirez", "Hugo Ramírez", 1240),
  posts: 128,
  followers: 342,
  following: 56,
};

export const MOCK_UNREAD_NOTIFICATIONS = 3;

// En modo demo el id es el slug (no es un UUID: no se puede publicar sin Supabase).
export const MOCK_COMMUNITIES: CommunitySummary[] = [
  { id: "diseno-grafico", slug: "diseno-grafico", name: "Diseño Gráfico", icon: "palette", isActive: true },
  { id: "fotografia", slug: "fotografia", name: "Fotografía", icon: "camera", isActive: true },
  { id: "inteligencia-artificial", slug: "inteligencia-artificial", name: "Inteligencia Artificial", icon: "bot", isActive: false },
  { id: "negocios", slug: "negocios", name: "Negocios", icon: "briefcase", isActive: false },
  { id: "carpinteria", slug: "carpinteria", name: "Carpintería", icon: "hammer", isActive: false },
  { id: "productividad", slug: "productividad", name: "Productividad", icon: "zap", isActive: false },
];

const c = (slug: string) => MOCK_COMMUNITIES.find((x) => x.slug === slug)!;

export const MOCK_EXPERTS = [
  { ...author("analopez", "Ana López", 12430), area: "Diseño Gráfico" },
  { ...author("carlosmartinez", "Carlos Martínez", 9842), area: "Fotografía" },
  { ...author("marianaruiz", "Mariana Ruiz", 8231), area: "Inteligencia Artificial" },
  { ...author("luisherrera", "Luis Herrera", 6982), area: "Carpintería" },
  { ...author("jorgeramirez", "Jorge Ramírez", 5421), area: "Productividad" },
];

export const MOCK_TRENDS = [
  { tag: "ia", posts: 2400 },
  { tag: "fotografiadeproducto", posts: 1800 },
  { tag: "portafolio", posts: 1200 },
  { tag: "emprender", posts: 980 },
  { tag: "productividad", posts: 870 },
];

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export function getMockPosts(): PostCardData[] {
  return [
    {
      id: "1",
      type: "consejo",
      title: "5 consejos para mejorar tus presentaciones en pocos minutos",
      excerpt:
        "Una buena presentación puede cambiar por completo la forma en que comunicas tus ideas. Aquí te comparto 5 consejos prácticos que siempre me han funcionado.",
      author: MOCK_EXPERTS[0]!,
      community: c("diseno-grafico"),
      createdAt: ago(2),
      coverUrl: null,
      coverMock: { from: "#0B1B3B", to: "#2563EB", text: "DISEÑA PRESENTACIONES QUE IMPACTAN" },
      likeCount: 248,
      commentCount: 32,
      saveCount: 68,
      helpfulCount: 91,
    },
    {
      id: "2",
      type: "consejo",
      title: "Cómo lograr fotos de producto con luz natural",
      excerpt:
        "La luz natural puede ser tu mejor aliada. Te muestro mi proceso paso a paso, la configuración y algunos trucos que uso en sesiones reales.",
      author: MOCK_EXPERTS[1]!,
      community: c("fotografia"),
      createdAt: ago(4),
      coverUrl: null,
      coverMock: { from: "#7c4a21", to: "#d9a56b", text: "Luz natural, resultados reales" },
      likeCount: 412,
      commentCount: 56,
      saveCount: 120,
      helpfulCount: 180,
    },
    {
      id: "3",
      type: "pregunta",
      title: "¿Qué herramientas de IA realmente valen la pena en 2025?",
      excerpt:
        "Hay muchas opciones y me gustaría saber cuáles consideran que sí valen la pena para el trabajo diario. ¿Cuáles usan y por qué?",
      author: MOCK_EXPERTS[4]!,
      community: c("inteligencia-artificial"),
      createdAt: ago(6),
      coverUrl: null,
      likeCount: 89,
      commentCount: 128,
      saveCount: 30,
      helpfulCount: 0,
      answerAuthors: [MOCK_EXPERTS[2]!, MOCK_EXPERTS[3]!, MOCK_EXPERTS[0]!].map((a) => ({
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
      })),
    },
    {
      id: "4",
      type: "tutorial",
      title: "Cómo hacer un escritorio de madera paso a paso",
      excerpt:
        "En este tutorial te muestro el proceso completo para construir un escritorio resistente y funcional con herramientas básicas. Incluye lista de materiales, medidas y planos descargables.",
      author: MOCK_EXPERTS[3]!,
      community: c("carpinteria"),
      createdAt: ago(26),
      coverUrl: null,
      coverMock: { from: "#3b2a1a", to: "#a8763e", text: "TU ESPACIO, TU HISTORIA" },
      likeCount: 620,
      commentCount: 74,
      saveCount: 310,
      helpfulCount: 402,
    },
    {
      id: "5",
      type: "articulo",
      title: "10 formas en las que la IA puede ayudarte como creativo",
      excerpt:
        "La inteligencia artificial no viene a reemplazarnos, sino a potenciar nuestro trabajo. Aquí te comparto 10 formas prácticas de integrarla a tu proceso creativo.",
      author: { ...MOCK_EXPERTS[2]!, isVerified: false },
      community: c("inteligencia-artificial"),
      createdAt: ago(27),
      coverUrl: null,
      coverMock: { from: "#1e1b4b", to: "#db2777", text: "CREATIVIDAD + IA" },
      likeCount: 315,
      commentCount: 41,
      saveCount: 96,
      helpfulCount: 120,
    },
  ];
}
