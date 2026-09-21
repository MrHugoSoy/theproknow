import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { CommentData } from "@/lib/types";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

type Props = {
  comments: CommentData[];
  postId: string;
  postAuthorId: string;
  isQuestion: boolean;
  viewerId: string | null;
};

export function CommentSection({ comments, postId, postAuthorId, isQuestion, viewerId }: Props) {
  const noun = isQuestion ? "respuesta" : "comentario";
  const count = comments.length;

  return (
    <section id="comentarios" aria-labelledby="comentarios-titulo" className="scroll-mt-20">
      <Card className="p-5 sm:p-6">
        <h2 id="comentarios-titulo" className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
          <MessageCircle className="size-5 text-muted" aria-hidden />
          {count} {count === 1 ? noun : `${noun}s`}
        </h2>

        {viewerId ? (
          <div className="mb-6">
            <CommentForm
              postId={postId}
              label={isQuestion ? "Escribe tu respuesta" : "Escribe tu comentario"}
              placeholder={isQuestion ? "Escribe tu respuesta…" : "Añade un comentario…"}
              submitLabel={isQuestion ? "Responder" : "Comentar"}
            />
          </div>
        ) : (
          <p className="mb-6 rounded-xl bg-surface p-4 text-sm text-muted">
            <Link href={`/login?next=/p/${postId}`} className="font-semibold text-brand hover:underline">
              Inicia sesión
            </Link>{" "}
            o{" "}
            <Link href="/registro" className="font-semibold text-brand hover:underline">
              crea una cuenta
            </Link>{" "}
            para {isQuestion ? "responder" : "comentar"}.
          </p>
        )}

        {count === 0 ? (
          <p className="py-4 text-center text-sm text-muted">
            {isQuestion
              ? "Nadie ha respondido todavía. ¡Sé la primera persona en ayudar!"
              : "Aún no hay comentarios. Empieza la conversación."}
          </p>
        ) : (
          <CommentList
            comments={comments}
            postId={postId}
            postAuthorId={postAuthorId}
            isQuestion={isQuestion}
            viewerId={viewerId}
          />
        )}
      </Card>
    </section>
  );
}
