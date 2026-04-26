"use client";

/**
 * Converts HEIC/HEIF images to JPEG client-side.
 * Returns the original file unchanged if it's not HEIC.
 * Falls back gracefully if conversion fails.
 */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (!isHeic) return file;

  try {
    // Dynamic import — heic2any is a browser-only library, must not be bundled server-side
    const heic2any = (await import("heic2any")).default;
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    });

    // heic2any returns Blob | Blob[] depending on number of frames
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  } catch (err) {
    console.error("HEIC conversion failed, returning original file:", err);
    return file;
  }
}
