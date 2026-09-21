import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = "TheProKnow · Aprende de quienes saben";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    title: "Aprende de quienes saben",
    subtitle: "Consejos, preguntas, tutoriales y artículos en español",
  });
}
