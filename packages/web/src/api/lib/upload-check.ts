import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

/** chave de foto de peça gerada pela rota /upload/presign */
export const LEAD_PHOTO_KEY_RE = /^leads\/\d{10,16}-[a-z0-9]{1,8}-[a-z0-9.\-_]{1,80}$/;

type Kind = "image" | "pdf";

/** Os primeiros bytes de cada formato: confere o conteúdo de verdade, sem confiar no tipo que o navegador declarou. */
function matchesMagic(kind: Kind, b: Uint8Array) {
  const at = (i: number, s: string) => [...s].every((ch, k) => b[i + k] === ch.charCodeAt(0));
  if (kind === "pdf") return at(0, "%PDF-");
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && at(1, "PNG");
  const webp = at(0, "RIFF") && at(8, "WEBP");
  const heic = at(4, "ftyp") && ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis"].some((brand) => at(8, brand));
  return jpeg || png || webp || heic;
}

export type UploadVerdict = "ok" | "missing" | "too_big" | "bad_content";

/**
 * Confere um arquivo que já subiu pelo link assinado: existe, não passa do tamanho e o conteúdo é do
 * formato esperado. Arquivo reprovado é apagado do storage.
 */
export async function verifyUpload(bucket: string, key: string, kind: Kind, maxBytes: number): Promise<UploadVerdict> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    let verdict: UploadVerdict = "ok";
    if (!head.ContentLength || head.ContentLength > maxBytes) verdict = "too_big";
    else {
      const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-15" }));
      const bytes = await res.Body?.transformToByteArray();
      if (!bytes || !matchesMagic(kind, bytes)) verdict = "bad_content";
    }
    if (verdict !== "ok") await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => undefined);
    return verdict;
  } catch {
    return "missing";
  }
}
