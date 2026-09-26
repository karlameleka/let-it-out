import { Music } from "lucide-react";
import { parseSpotifyEmbedUrl } from "@/lib/spotify";
import SpotifyEmbed from "@/components/spotify-embed";

/** Renders an attached song link — a Spotify link (track/album/playlist/
 * episode) gets Spotify's own embedded player; any other link (Apple
 * Music, Anghami, YouTube, SoundCloud, ...) is shown as a plain clickable
 * link using the name the person typed for it, since only Spotify can be
 * embedded without an API key. */
export default function SongAttachment({
  url,
  name,
  className = "",
}: {
  url: string;
  name: string | null;
  className?: string;
}) {
  const embedUrl = parseSpotifyEmbedUrl(url);
  if (embedUrl) return <SpotifyEmbed embedUrl={embedUrl} className={className} />;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow ${className}`}
    >
      <Music className="h-4 w-4 shrink-0" strokeWidth={2} />
      {name?.trim() || url}
    </a>
  );
}
