"use client";

import { useEffect } from "react";
import { markMyToolsViewed } from "@/lib/client-resources-actions";
import { useUnreadTools } from "@/lib/unread-tools-context";

/** Renders nothing — fires once when the client's "My tools" section has
 * actually been shown to them, clearing the unread badge on the Resources
 * tab and the installed-app icon. */
export default function MyToolsViewedTracker({ hasUnviewed }: { hasUnviewed: boolean }) {
  const { refetch } = useUnreadTools();

  useEffect(() => {
    if (!hasUnviewed) return;
    markMyToolsViewed().then(() => refetch());
    // Only ever needs to run once per mount — re-running on refetch would
    // be a no-op anyway since hasUnviewed reflects the server-rendered
    // props from before this ran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
