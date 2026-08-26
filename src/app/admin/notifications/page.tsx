import { prisma } from "@/lib/db";
import { getSiteSettings, updateNotificationSchedule } from "@/lib/site-settings";
import SendPushForm from "./send-push-form";

function hourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}:00 ${period}`;
}

function HourSelect({ name, defaultValue }: { name: string; defaultValue: number }) {
  return (
    <select
      id={name}
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
    >
      {Array.from({ length: 24 }, (_, hour) => (
        <option key={hour} value={hour}>
          {hourLabel(hour)}
        </option>
      ))}
    </select>
  );
}

export default async function AdminNotificationsPage() {
  const [subscriberCount, configured, settings] = await Promise.all([
    prisma.pushSubscription.count(),
    Promise.resolve(Boolean(process.env.VAPID_PRIVATE_KEY)),
    getSiteSettings(),
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
          The daily journal reminder and the day-before session reminder each check every hour and only send during
          the hour you set here — times are Egypt local time. Changes apply on the next check, no redeploy needed.
        </p>
        <form action={updateNotificationSchedule} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="journalReminderHour">
              Daily journal reminder
            </label>
            <HourSelect name="journalReminderHour" defaultValue={settings.journalReminderHour} />
            <p className="mt-1 text-xs text-ink/40">Sent to everyone who&rsquo;s enabled reminders in Account settings.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="sessionReminderHour">
              Session reminder (day before)
            </label>
            <HourSelect name="sessionReminderHour" defaultValue={settings.sessionReminderHour} />
            <p className="mt-1 text-xs text-ink/40">Sent for confirmed sessions happening the next day.</p>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
            >
              Save schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
