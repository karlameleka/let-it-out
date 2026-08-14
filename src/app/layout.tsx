import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import WorkshopInterestPopup from "@/components/workshop-interest-popup";
import EntryGates from "@/components/entry-gates";
import ServiceWorkerRegister from "@/components/sw-register";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Let It Out | Mental Health Service",
    template: "%s | Let It Out",
  },
  description:
    "Let It Out is a psychologist-led mental health service founded in 2021, offering online counseling, guided journals, and trainings and workshops rooted in evidence-based care.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/icon-192.png",
    apple: "/brand/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e5b73",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <CurrencyProvider>
          <CartProvider>
            <SiteHeader user={user} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <WorkshopInterestPopup />
            <EntryGates />
            <ServiceWorkerRegister />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
