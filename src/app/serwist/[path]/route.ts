import { createSerwistRoute } from "@serwist/turbopack";
import { spawnSync } from "node:child_process";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

// Ties every precache entry to the deployed commit, so they all bust on
// every new deploy rather than needing a manual bump.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() || crypto.randomUUID();

// Marketing + resources pages: fetched and cached up front (at SW install
// time) so they're readable offline even if this exact page was never
// visited before the connection dropped — not just cached-as-you-browse.
// Deliberately excludes anything booking/payment/account-related
// (/checkout, /cart, /counseling/session/[id], /login, /account, /journal,
// /admin, ...) — those need a live connection to actually do anything, so
// pretending they work offline would be misleading. See sw.ts's NetworkOnly
// override for how those are kept from being served stale, too.
const STATIC_PAGES = [
  "/",
  "/about",
  "/services",
  "/counseling",
  "/workshops",
  "/shop",
  "/resources",
  "/resources/breathing",
  "/resources/cbt-exercises",
  "/resources/cbt-exercises/grounding",
  "/resources/cbt-exercises/next-step",
  "/resources/cognitive-reframing",
  "/contact",
  "/privacy",
  "/terms",
  "/shop-policy",
  "/install",
  "/offline",
];

async function buildPrecacheEntries() {
  const entries = STATIC_PAGES.map((url) => ({ url, revision }));

  // Best-effort: a build-time DB hiccup shouldn't fail the whole deploy over
  // the offline cache — ship with just the static pages if so.
  try {
    const [counselors, products, articles, settings] = await Promise.all([
      prisma.counselor.findMany({ where: { active: true }, select: { slug: true } }),
      prisma.product.findMany({ where: { active: true }, select: { slug: true } }),
      prisma.article.findMany({ select: { slug: true } }),
      getSiteSettings(),
    ]);

    for (const c of counselors) entries.push({ url: `/counseling/${c.slug}`, revision });
    for (const p of products) entries.push({ url: `/shop/${p.slug}`, revision });
    for (const a of articles) {
      if (!settings.hiddenArticleSlugs.includes(a.slug)) {
        entries.push({ url: `/resources/${a.slug}`, revision });
      }
    }
  } catch (err) {
    console.warn("[serwist] Could not reach the database at build time — precaching static pages only.", err);
  }

  return entries;
}

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: await buildPrecacheEntries(),
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
