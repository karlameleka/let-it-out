import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import WorkshopInterestPopup from "@/components/workshop-interest-popup";
import { CartProvider } from "@/lib/cart-context";
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
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <CartProvider>
          <SiteHeader user={user} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WorkshopInterestPopup />
        </CartProvider>
      </body>
    </html>
  );
}
