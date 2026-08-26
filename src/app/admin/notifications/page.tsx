import { prisma } from "@/lib/db";
import SendPushForm from "./send-push-form";

export default async function AdminNotificationsPage() {
  const [subscriberCount, configured] = await Promise.all([
    prisma.pushSubscription.count(),
    Promise.resolve(Boolean(process.env.VAPID_PRIVATE_KEY)),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">Push notifications</h2>
        <p className="mt-1 text-sm text-ink/60">
          {subscriberCount} client{subscriberCount === 1 ? "" : "s"} currently ha{subscriberCount === 1 ? "s" : "ve"} push
          notifications enabled (Android, desktop, and iPhones with the app added to their Home Screen).
        </p>
        {!configured && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Push isn&rsquo;t configured on this deployment yet — set VAPID_PRIVATE_KEY, NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            and VAPID_SUBJECT to enable sending.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">Send a notification</h2>
        <p className="mt-1 text-sm text-ink/60">
          Goes out to every subscribed client right away. Posting a new event on the Events tab already sends one
          automatically — use this for anything else you want to announce.
        </p>
        <div className="mt-4">
          <SendPushForm />
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">Scheduled reminder times</h2>
        <p className="mt-1 text-sm text-ink/60">
          The daily journal reminder and the day-before session reminder are both sent automatically once a day, at
          7:00 PM Egypt time — not sent from here. Vercel&rsquo;s free (Hobby) plan only allows a scheduled job to run
          once per day, so this time can&rsquo;t be changed per-notification from the dashboard without upgrading the
          hosting plan or wiring up an external scheduler.
        </p>
      </div>
    </div>
  );
}
