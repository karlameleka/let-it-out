import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import CheckoutForm from "./checkout-form";

export default async function CheckoutPage() {
  const session = await getCurrentUser();
  const account = session
    ? {
        name: session.name,
        email: session.email,
        phone: session.phone,
        country: (await prisma.user.findUnique({ where: { id: session.userId }, select: { country: true } }))?.country ?? null,
      }
    : null;

  return <CheckoutForm account={account} />;
}
