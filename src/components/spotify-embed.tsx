/** Renders a pasted Spotify track/album/playlist/episode link as Spotify's
 * own embeddable player (open.spotify.com/embed/...) — no API key needed. */
export default function SpotifyEmbed({ embedUrl, className = "" }: { embedUrl: string; className?: string }) {
  return (
    <iframe
      src={embedUrl}
      className={`w-full rounded-xl ${className}`}
      height={152}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify player"
    />
  );
}
