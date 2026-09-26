"use client";

import { useEffect } from "react";

const RELOAD_GUARD_KEY = "lio_chunk_reload_guard";
const CHUNK_ERROR_PATTERN =
  /loading chunk|chunkloaderror|failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed/i;

/**
 * Recovers from a stale-chunk failure: a client-side navigation or lazy
 * import tries to fetch a JS chunk from the build the page was originally
 * served from, but a newer deploy has since replaced it (Vercel's
 * production alias only serves the CURRENT deployment's static assets, so
 * an old build's chunk path 404s). Left unhandled, a PWA window left open
 * across a deploy just silently fails to render — most visible as the
 * recurring "blank white page" report on the iOS home-screen install,
 * which has no address bar or reload button of its own to recover with.
 *
 * Guarded by a sessionStorage flag, cleared a few seconds after mount, so
 * a genuinely broken deployment (or a user who's actually offline) can't
 * be reloaded in a tight loop — at most one recovery reload per ~10s.
 */
export default function ChunkErrorRecovery() {
  useEffect(() => {
    function looksLikeChunkError(message: string | undefined | null) {
      return Boolean(message) && CHUNK_ERROR_PATTERN.test(message as string);
    }

    function recover(message: string | undefined | null) {
      if (!looksLikeChunkError(message)) return;
      try {
        if (window.sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
        window.sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
      } catch {
        // sessionStorage unavailable — still attempt the reload; worst
        // case is one extra reload, not a loop, since this only fires on
        // an actual chunk-load failure.
      }
      window.location.reload();
    }

    function onError(event: ErrorEvent) {
      recover(event.message);
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason: unknown = event.reason;
      recover(typeof reason === "string" ? reason : (reason as { message?: string } | undefined)?.message);
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const clearGuardTimer = setTimeout(() => {
      try {
        window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
      } catch {
        // Ignore — worst case the guard just lingers until the tab closes.
      }
    }, 10_000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      clearTimeout(clearGuardTimer);
    };
  }, []);

  return null;
}
