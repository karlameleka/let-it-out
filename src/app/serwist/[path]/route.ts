import { createSerwistRoute } from "@serwist/turbopack";
import { spawnSync } from "node:child_process";

// Ties the offline fallback page's precache entry to the deployed commit,
// so it busts on every new deploy rather than needing a manual bump.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
