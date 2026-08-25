import { requireCounselor } from "@/lib/therapist-session";
import { getReceivedReferrals, getSentReferrals } from "@/lib/therapist-data";
import ReferralTabs from "./referral-tabs";

export default async function TherapistReferralsPage() {
  const session = await requireCounselor();
  const [received, sent] = await Promise.all([
    getReceivedReferrals(session.counselorId),
    getSentReferrals(session.counselorId),
  ]);

  return (
    <div>
      <h2 className="font-display font-semibold text-brand-900">Referrals</h2>
      <p className="mt-1 text-sm text-ink/60">
        Hand a client off, or loop in a colleague to collaborate — with just what you choose to share.
      </p>
      <div className="mt-5">
        <ReferralTabs received={received} sent={sent} />
      </div>
    </div>
  );
}
