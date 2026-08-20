import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Let It Out",
    short_name: "Let It Out",
    description:
      "A psychologist-led mental health service — online counseling, guided journals, and workshops.",
    start_url: "/",
    display: "standalone",
    background_color: "#1e5b73",
    theme_color: "#1e5b73",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Without a dedicated maskable icon, Android doesn't trust that our
      // full-bleed "any" icon has enough safe-zone padding to survive its
      // adaptive-icon mask (circle/squircle/rounded-square, varies by
      // launcher) — so it falls back to shrinking the whole icon onto a
      // plain white background, which is the tiny-logo-in-a-big-white-
      // square look. These variants have the glyph pre-shrunk to fit
      // safely within any mask shape, with the brand teal filling the
      // canvas edge-to-edge so no mask can reveal a gap.
      {
        src: "/brand/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
