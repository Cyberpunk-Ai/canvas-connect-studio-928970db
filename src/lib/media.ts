import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** True when the value is an external URL (e.g. a Google avatar) rather than a storage path. */
export function isExternalUrl(value: string | null | undefined): boolean {
  return !!value && /^(https?:)?\/\//.test(value);
}

export async function uploadMedia(
  userId: string,
  file: File,
  folder: "posts" | "avatars",
): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Images must be 10MB or smaller.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

export async function createSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
