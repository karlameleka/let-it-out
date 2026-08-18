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
    ],
  };
}
