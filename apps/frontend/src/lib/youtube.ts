/** Extract a YouTube video id from common URL shapes (watch, youtu.be, embed, shorts). */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = re.exec(url);
    if (m) return m[1];
  }
  // Bare 11-char id
  const bare = url.trim();
  if (/^[\w-]{11}$/.test(bare)) return bare;
  return null;
}

/** Parse a newline/comma separated list of YouTube URLs into video ids. */
export function parseVideoUrls(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(youtubeId)
    .filter((id): id is string => !!id);
}
