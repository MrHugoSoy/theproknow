import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Mensajes", robots: { index: false, follow: false } };

export default function MensajesPage() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Próximamente"
      description="Estamos preparando los mensajes directos. Mientras tanto, conversa en los comentarios de cada publicación."
    />
  );
}
