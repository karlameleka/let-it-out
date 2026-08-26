import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const [session, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const account = session
    ? {
        name: session.name,
        email: session.email,
        phone: session.phone,
        country: (await prisma.user.findUnique({ where: { id: session.userId }, select: { country: true } }))?.country ?? null,
      }
    : null;
  const dict = getDictionary(locale).checkout;

  return <CheckoutForm account={account} dict={dict} />;
}
