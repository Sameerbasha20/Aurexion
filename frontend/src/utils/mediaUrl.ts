const DEFAULT_API_URL = "https://aurexion.onrender.com/api/v1/";

function getApiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

  try {
    return new URL(apiUrl).origin;
  } catch {
    return "";
  }
}

/** Resolve backend media paths without changing frontend-owned public assets. */
export function resolveMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const mediaPath = value.trim();
  if (mediaPath.startsWith("data:") || mediaPath.startsWith("blob:")) {
    return mediaPath;
  }

  try {
    const parsedUrl = new URL(mediaPath, window.location.origin);
    const isFrontendAsset = mediaPath.startsWith("/images/") || mediaPath.startsWith("/assets/");
    const isBackendMedia = mediaPath.startsWith("/media/") || mediaPath.startsWith("media/");
    const isDevelopmentHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsedUrl.hostname);

    if (isFrontendAsset) {
      return mediaPath;
    }

    if (isBackendMedia || isDevelopmentHost) {
      const apiOrigin = getApiOrigin();
      return apiOrigin ? `${apiOrigin}${parsedUrl.pathname}${parsedUrl.search}` : mediaPath;
    }

    return parsedUrl.href;
  } catch {
    return mediaPath;
  }
}
