/**
 * Server-only: copy verification selfie to profile-photos and return public URL.
 * Uses service role; never expose verification-docs to client.
 * TODO: add resizing/compression for a true low-res avatar if needed.
 */

import { createAdminClient } from "@/lib/auth";
import {
  getProfilePhotoPublicUrl,
  profilePhotoPath,
  PROFILE_PHOTOS_BUCKET,
  VERIFICATION_DOCS_BUCKET,
} from "@/lib/storage";

/**
 * Copy the selfie from verification-docs to profile-photos and return the public avatar URL.
 * @param selfieStoragePath - Path in verification-docs bucket (e.g. user_id/selfie_123.jpg)
 * @param userId - Participant user_id for the destination path
 * @returns Public URL for the new avatar, or null on failure
 */
export async function promoteSelfieToProfilePhoto(
  selfieStoragePath: string,
  userId: string
): Promise<string | null> {
  if (!selfieStoragePath?.trim() || !userId?.trim()) return null;

  const admin = createAdminClient();

  const { data: fileData, error: downloadError } = await admin.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .download(selfieStoragePath);

  if (downloadError || !fileData) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[promoteSelfieToProfilePhoto] download failed:", downloadError?.message);
    }
    return null;
  }

  const ext = getExtension(selfieStoragePath) || "jpg";
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const avatarPath = profilePhotoPath(userId, `avatar.${ext}`);

  // In Node.js, upload works reliably with Buffer; Blob.arrayBuffer() then Buffer.from ensures compatibility.
  const uploadBody =
    typeof fileData.arrayBuffer === "function"
      ? Buffer.from(await fileData.arrayBuffer())
      : fileData;

  const { error: uploadError } = await admin.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(avatarPath, uploadBody, {
      upsert: true,
      contentType,
      cacheControl: "31536000",
    });

  if (uploadError) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[promoteSelfieToProfilePhoto] upload failed:", uploadError.message);
    }
    return null;
  }

  return getProfilePhotoPublicUrl(avatarPath);
}

function getExtension(path: string): string | null {
  const match = path.match(/\.([a-z0-9]+)$/i);
  const ext = match?.[1]?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return null;
}
