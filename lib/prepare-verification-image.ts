import sharp from "sharp";

/** Keep vision payloads small for faster Anthropic responses (long edge cap). */
const MAX_EDGE = 1280;
const JPEG_QUALITY = 82;

export async function prepareVerificationImageForAi(
  buffer: Buffer
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const prepared = await sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    base64: prepared.toString("base64"),
    mediaType: "image/jpeg",
  };
}
