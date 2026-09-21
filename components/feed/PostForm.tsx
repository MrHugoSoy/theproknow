"use client";

import { useActionState, useState } from "react";
import { CircleHelp, FileText, GraduationCap, ImagePlus, Lightbulb, X, type LucideIcon } from "lucide-react";
import { createPost } from "@/app/actions/posts";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { TextField } from "@/components/ui/TextField";
import { createClient } from "@/lib/supabase/client";
import type { CommunitySummary, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  COVER_MAX_BYTES,
  COVER_MIME,
  postSchema,
  type PostFormState,
} from "@/lib/validation/post";

const TYPES: { value: PostType; label: string; hint: string; icon: LucideIcon }[] = [
  { value: "consejo", label: "Consejo", hint: "Comparte un truco o buena práctica", icon: Lightbulb },
  { value: "pregunta", label: "Pregunta", hint: "Pide ayuda a la comunidad", icon: CircleHelp },
  { value: "tutorial", label: "Tutorial", hint: "Enseña algo paso a paso", icon: GraduationCap },
  { value: "articulo", label: "Artículo", hint: "Explica un tema a fondo", icon: FileText },
];

type Props = {
  userId: string;
  communities: CommunitySummary[];
  initialType?: PostType;
};

export function PostForm({ userId, communities, initialType = "consejo" }: Props) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(createPost, {});
  const [clientErrors, setClientErrors] = useState<Record<string, string[] | undefined>>({});
  const [type, setType] = useState<PostType>(initialType);
  const [communityId, setCommunityId] = useState(communities[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [preview, setPreview] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverError, setCoverError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const errors = { ...state.errors, ...clientErrors };

  async function onCover(file: File | undefined) {
    if (!file) return;
    setCoverError(null);
    if (!(COVER_MIME as readonly string[]).includes(file.type)) {
      setCoverError("Usa una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setCoverError("La imagen supera los 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("covers").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      setCoverUrl(supabase.storage.from("covers").getPublicUrl(path).data.publicUrl);
    } catch {
      setCoverError("No pudimos subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const r = postSchema.safeParse({ type, communityId, title, body, coverUrl, videoUrl });
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-6"
    >
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Tipo de publicación</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map(({ value, label, hint, icon: Icon }) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
                type === value ? "border-brand bg-brand-soft" : "border-line bg-white hover:bg-surface",
              )}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="sr-only"
              />
              <Icon className={cn("size-5", type === value ? "text-brand" : "text-muted")} aria-hidden />
              <span className="font-semibold text-ink">{label}</span>
              <span className="text-xs text-muted">{hint}</span>
            </label>
          ))}
        </div>
        {errors.type?.[0] ? <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.type[0]}</p> : null}
      </fieldset>

      <div>
        <label htmlFor="communityId" className="mb-1.5 block text-sm font-semibold text-ink">
          Comunidad
        </label>
        <select
          id="communityId"
          name="communityId"
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          aria-invalid={errors.communityId ? true : undefined}
          className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.communityId?.[0] ? (
          <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.communityId[0]}</p>
        ) : null}
      </div>

      <TextField
        label="Título"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={140}
        placeholder={type === "pregunta" ? "¿Qué quieres saber?" : "Un título claro y específico"}
        error={errors.title?.[0]}
        hint={`${title.length}/140`}
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="body" className="text-sm font-semibold text-ink">
            {type === "pregunta" ? "Detalles" : "Contenido"}
          </label>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="text-[13px] font-medium text-brand hover:underline"
          >
            {preview ? "Seguir editando" : "Vista previa"}
          </button>
        </div>
        {preview ? (
          <div className="min-h-40 rounded-xl border border-line bg-white p-4">
            {body.trim() ? <Markdown>{body}</Markdown> : <p className="text-sm text-muted">Nada que mostrar todavía.</p>}
          </div>
        ) : (
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            maxLength={20000}
            aria-invalid={errors.body ? true : undefined}
            aria-describedby="body-hint"
            className={cn(
              "w-full rounded-xl border bg-white p-3.5 text-sm leading-relaxed text-ink placeholder:text-slate-500",
              errors.body ? "border-red-500" : "border-line",
            )}
            placeholder="Cuenta lo que sabes. Puedes usar **negritas**, *cursivas*, listas y ## títulos."
          />
        )}
        {/* En vista previa el textarea no existe: se envía el valor en un campo oculto */}
        {preview ? <input type="hidden" name="body" value={body} /> : null}
        {errors.body?.[0] ? (
          <p role="alert" className="mt-1 text-[13px] text-red-600">{errors.body[0]}</p>
        ) : (
          <p id="body-hint" className="mt-1 text-[13px] text-muted">
            Markdown básico, sin HTML. Añade #etiquetas al final para que te encuentren.
          </p>
        )}
      </div>

      {type === "tutorial" ? (
        <TextField
          label="Video de YouTube (opcional)"
          name="videoUrl"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          error={errors.videoUrl?.[0]}
          hint="Solo se aceptan enlaces de YouTube."
        />
      ) : null}

      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink">Imagen de portada (opcional)</p>
        <input type="hidden" name="coverUrl" value={coverUrl} />
        {coverUrl ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="Vista previa de la portada" className="h-36 rounded-xl border border-line object-cover" />
            <button
              type="button"
              onClick={() => setCoverUrl("")}
              aria-label="Quitar portada"
              className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-navy text-white shadow"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white text-sm text-muted hover:bg-surface has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
            <ImagePlus className="size-6" aria-hidden />
            {uploading ? "Subiendo…" : "Sube una imagen JPG, PNG o WebP (máx. 5 MB)"}
            <input
              type="file"
              accept={COVER_MIME.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={(e) => onCover(e.target.files?.[0])}
            />
          </label>
        )}
        {coverError || errors.coverUrl?.[0] ? (
          <p role="alert" className="mt-1 text-[13px] text-red-600">{coverError ?? errors.coverUrl?.[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? "Publicando…" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}
