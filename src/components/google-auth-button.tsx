function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.4 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.8 4.2C13.6 15.4 18.4 12.5 24 12.5c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.4 29.6 4.5 24 4.5c-7.8 0-14.5 4.4-17.7 10.8z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.5c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4c-2 1.4-4.7 2.3-7.6 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.4 39.9 16.1 44.5 24 44.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.5 35.4 44.5 30.2 44.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ label }: { label: string }) {
  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-medium text-ink/80 transition-colors hover:bg-brand-50 active:bg-brand-50"
    >
      <GoogleIcon />
      {label}
    </a>
  );
}
