import { OG_SIZE, ogImage } from "@/lib/og";
import { getLevel } from "@/lib/reputation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export const alt = "Perfil en TheProKnow";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (isSupabaseConfigured() && /^[a-z0-9_.]{3,30}$/.test(username)) {
    const { data } = await createPublicClient()
      .from("profiles")
      .select("display_name, username, reputation, bio")
      .eq("username", username)
      .maybeSingle();
    if (data) {
      const lvl = getLevel(data.reputation);
      return ogImage({
        eyebrow: `Nivel ${lvl.level} · ${lvl.name} · ${new Intl.NumberFormat("es-MX").format(data.reputation)} pts`,
        title: data.display_name,
        subtitle: data.bio || `@${data.username}`,
      });
    }
  }
  return ogImage({ title: "Perfil en TheProKnow" });
}
