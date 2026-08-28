import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/therapist",
        "/therapist/*",
        "/account",
        "/journal",
        "/journal/*",
        "/checkout",
        "/cart",
        "/orders/*",
        "/intake",
        "/login",
        "/login/*",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/r/*",
        "/api/*",
      ],
    },
    host: baseUrl,
  };
}
