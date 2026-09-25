/** Resizes and JPEG-compresses an image client-side before it's stored as
 * a data URI — keeps journal entry photos small without needing any blob
 * storage service. Takes a Blob (a File is one) so makeThumbnail below can
 * reuse it on an already-compressed data URI too. */
export async function compressImage(
  file: Blob,
  { maxDimension = 1280, quality = 0.75 } = {},
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}

/** Decodes a data: URI straight into a Blob via plain base64 decoding — no
 * network involved. `fetch()` can technically read a data: URI too, but
 * that routes it through the CSP connect-src check (this app's policy is
 * `'self' https://challenges.cloudflare.com`, so a fetch of a data: URI is
 * flatly rejected as a CSP violation, not a same-origin exemption). */
function dataUriToBlob(dataUri: string): Blob {
  const [header, base64] = dataUri.split(",");
  const mime = /data:(.*?);base64/.exec(header)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** A small, low-quality preview of an already-compressed photo — for list
 * views (the journal feed) that show many entries' photos at once. Full
 * decoded size scales with the *pixel* dimensions, not the file size, so
 * rendering the full 1280px photo at a 64px CSS size still forces the
 * browser to decode a multi-megapixel bitmap per entry — with enough
 * entries in the feed, that decode cost (and the memory it holds onto)
 * is what actually made the journal feed slow to the point of freezing.
 * Storing this separately means the feed never has to touch, decrypt, or
 * decode the full-resolution photo at all. */
export async function makeThumbnail(photoDataUri: string, { maxDimension = 96, quality = 0.5 } = {}): Promise<string> {
  return compressImage(dataUriToBlob(photoDataUri), { maxDimension, quality });
}
