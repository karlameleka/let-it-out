import { Logo } from "@/components/logo";

/**
 * Shown while a page's server data is loading (client-side navigations,
 * slow first loads) — brand-700 teal with the full white logo, matching
 * the PWA's native splash screen (see manifest.ts background_color) so the
 * app never flashes to a blank/white loading state.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-brand-700 py-24">
      <Logo variant="horizontal-white" height={44} className="animate-pop-in" />
    </div>
  );
}
