"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileFormState } from "@/lib/validation/profile";

const AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX = 2 * 1024 * 1024;

type Props = {
  userId: string;
  initial: { displayName: string; username: string; bio: string; avatarUrl: string };
};

export function SettingsForm({ userId, initial }: Props) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {});
  const [clientErrors, setClientErrors] = useState<Record<string, string[] | undefined>>({});
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const errors = { ...state.errors, ...clientErrors };

  async function onAvatar(file: File | undefined) {
    if (!file) return;
    setAvatarError(null);
    if (!AVATAR_MIME.includes(file.type)) return setAvatarError("Usa una imagen JPG, PNG o WebP.");
    if (file.size > AVATAR_MAX) return setAvatarError("La imagen supera los 2 MB.");
    setUploading(true);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (error) throw error;
      setAvatarUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    } catch {
      setAvatarError("No pudimos subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const r = profileSchema.safeParse({ displayName, username, bio, avatarUrl });
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-5"
    >
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <div className="flex items-center gap-4">
        <Avatar name={displayName || username} src={avatarUrl || null} size="xl" />
        <div>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium shadow-sm hover:bg-surface has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand">
            <Camera className="size-4" aria-hidden />
            {uploading ? "Subiendo…" : "Cambiar foto"}
            <input
              type="file"
              accept={AVATAR_MIME.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={(e) => onAvatar(e.target.files?.[0])}
            />
          </label>
          {avatarUrl ? (
            <button type="button" onClick={() => setAvatarUrl("")} className="ml-3 text-[13px] text-muted hover:text-ink">
              Quitar
            </button>
          ) : null}
          <p className="mt-1 text-xs text-muted">JPG, PNG o WebP · máximo 2 MB</p>
          {avatarError || errors.avatarUrl?.[0] ? (
            <p role="alert" className="mt-1 text-[13px] text-red-600">
              {avatarError ?? errors.avatarUrl?.[0]}
            </p>
          ) : null}
        </div>
      </div>

      <TextField
        label="Nombre"
        name="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={60}
        error={errors.displayName?.[0]}
      />
      <TextField
        label="Nombre de usuario"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoCapitalize="none"
        error={errors.username?.[0]}
        hint="Tu perfil público será /u/tu-usuario"
      />

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-ink">
          Biografía
        </label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          aria-invalid={errors.bio ? true : undefined}
          className="w-full rounded-xl border border-line bg-white p-3 text-sm"
          placeholder="Cuéntale a la comunidad qué sabes y qué te gusta compartir."
        />
        <p className="mt-1 text-[13px] text-muted">{bio.length}/280</p>
        {errors.bio?.[0] ? (
          <p role="alert" className="text-[13px] text-red-600">
            {errors.bio[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`rounded-lg px-3 py-2 text-sm ${state.ok ? "bg-helpful-soft text-helpful" : "bg-red-50 text-red-700"}`}
        >
          {state.message}{" "}
          {state.ok && state.username ? (
            <Link href={`/u/${state.username}`} className="font-semibold underline">
              Ver mi perfil
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
