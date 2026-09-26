"use client";

import { usePathname } from "next/navigation";

/** The master-detail shell: a persistent list pane + a detail pane that
 * shows whichever child route is active. Both panes are always mounted on
 * desktop; on mobile only one shows at a time, toggled by pathname — the
 * bare /therapist/clients route means "no client selected yet", so the
 * list takes the full screen there and the detail pane (page.tsx's empty
 * state) stays hidden until a client is picked. */
export default function ClientsSplitPane({
  list,
  children,
}: {
  list: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isListRoute = pathname === "/therapist/clients";

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
      <div className={isListRoute ? "block" : "hidden lg:block"}>{list}</div>
      <div className={isListRoute ? "hidden lg:block" : "block"}>{children}</div>
    </div>
  );
}
