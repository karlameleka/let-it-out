/** Turns a Spotify link a user pastes in (track, album, playlist, or
 * episode — copied straight from the Spotify app's "Share" menu) into the
 * embeddable player URL, or null if it isn't a recognizable Spotify link.
 * No API key needed — open.spotify.com/embed/... works unauthenticated. */
export function parseSpotifyEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.hostname !== "open.spotify.com") return null;

  const match = url.pathname.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const [, kind, id] = match;
  return `https://open.spotify.com/embed/${kind}/${id}`;
}
