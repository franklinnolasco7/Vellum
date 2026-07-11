/** @type {Map<string, string>} bookId to objectURL */
const cache = new Map();

export function getCoverUrl(bookId, base64DataUri) {
  if (!base64DataUri) return null;
  const hit = cache.get(bookId);
  if (hit) return hit;

  try {
    const commaIdx = base64DataUri.indexOf(",");
    if (commaIdx === -1) return base64DataUri;
    const header = base64DataUri.slice(0, commaIdx);
    const data = base64DataUri.slice(commaIdx + 1);
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    cache.set(bookId, url);
    return url;
  } catch (_err) {
    // Rendering the original URI is better than showing a blank cover.
    return base64DataUri;
  }
}

export function invalidate(bookId) {
  const url = cache.get(bookId);
  if (url) {
    URL.revokeObjectURL(url);
    cache.delete(bookId);
  }
}

export function invalidateAll() {
  for (const url of cache.values()) URL.revokeObjectURL(url);
  cache.clear();
}
