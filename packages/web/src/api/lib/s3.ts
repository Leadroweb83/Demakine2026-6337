import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.S3_REGION ?? "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET!;

/** Fotos de perfil da equipe (bucket público, nome de arquivo aleatório). */
export const AVATAR_BUCKET = "avatars";
export const AVATAR_TYPES = ["image/webp", "image/jpeg", "image/png"];

export function avatarPublicUrl(key: string) {
  const base = (process.env.S3_ENDPOINT ?? "").replace(
    ".storage.supabase.co/storage/v1/s3",
    ".supabase.co/storage/v1/object/public",
  );
  return `${base}/${AVATAR_BUCKET}/${key}`;
}

/** Currículos das candidaturas (bucket privado, só PDF, 5 MB no próprio bucket). */
export const RESUME_BUCKET = "curriculos";
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

/** Só imagem, para o upload de foto de peça. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function safeName(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}
