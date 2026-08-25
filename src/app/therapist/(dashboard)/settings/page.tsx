import TherapistChangePasswordForm from "./change-password-form";

export default function TherapistSettingsPage() {
  return (
    <div className="max-w-md rounded-2xl border border-brand-100 bg-white p-6">
      <h2 className="font-display font-semibold text-brand-900">Change password</h2>
      <p className="mt-1 text-sm text-ink/60">Used to log in to this portal.</p>
      <div className="mt-5">
        <TherapistChangePasswordForm />
      </div>
    </div>
  );
}
