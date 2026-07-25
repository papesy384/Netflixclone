/**
 * Extract a YouTube video ID from common URL shapes or a bare 11-char ID.
 * Returns null if the input is not a YouTube video.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Bare video ID (11 chars: A-Za-z0-9_-)
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const u = new URL(withProtocol);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;

      // /embed/ID, /shorts/ID, /live/ID
      const pathMatch = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{11})/);
      if (pathMatch) return pathMatch[2];
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
