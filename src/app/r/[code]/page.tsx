import { prisma } from "@/lib/db";
import ReferralLandingClient from "./referral-landing-client";

export const metadata = { title: "You're invited" };

/** A friend's invite link — /r/<referralCode>. Purely a redirect: stash
 * the code client-side (see ReferralLandingClient) so it survives until
 * this friend's PWA install actually completes, then send them on to the
 * home page. The reward itself is minted later by activateReferral(),
 * never here — landing on this page is not what activates anything. */
export default async function ReferralLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code.toUpperCase() },
    select: { id: true },
  });

  return <ReferralLandingClient code={code.toUpperCase()} valid={Boolean(referrer)} />;
}
