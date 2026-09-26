import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import CartContent from "./cart-content";

export default async function CartPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale).cart;
  return <CartContent dict={dict} />;
}
