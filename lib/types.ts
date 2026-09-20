export type PostType = "consejo" | "pregunta" | "tutorial" | "articulo";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  consejo: "Consejo",
  pregunta: "Pregunta",
  tutorial: "Tutorial",
  articulo: "Artículo",
};

export type AuthorSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  reputation: number;
};

export type CommunitySummary = {
  slug: string;
  name: string;
  /** nombre de ícono lucide (ver components/ui/CommunityIcon) */
  icon: string;
  isActive: boolean;
};

export type PostCardData = {
  id: string;
  type: PostType;
  title: string;
  excerpt: string;
  author: AuthorSummary;
  community: CommunitySummary | null;
  createdAt: string;
  coverUrl: string | null;
  /** solo mock/fase 1: portada generada con gradiente */
  coverMock?: { from: string; to: string; text: string };
  likeCount: number;
  commentCount: number;
  saveCount: number;
  helpfulCount: number;
  answerAuthors?: AuthorSummary[];
  viewer?: { liked: boolean; helpful: boolean; saved: boolean; following: boolean };
};
