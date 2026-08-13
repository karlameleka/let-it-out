export type SocialLink = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 8.5h2V5.2h-2c-2.2 0-3.8 1.6-3.8 3.8v1.9H9.4v3.2h1.8V21h3.2v-6.9h2.2l.5-3.2h-2.7V9c0-.5.3-.8.6-.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 4v9.6a2.8 2.8 0 1 1-2.2-2.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 4c.3 2.2 2 3.8 4.2 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkedIn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="8.3" r="1.2" fill="currentColor" />
      <path d="M8 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 17v-3.3c0-1.5 1-2.4 2.2-2.4 1.2 0 2 .9 2 2.4V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 8.4c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4.2.5.7 1.6.7 1.7.1.1.1.3 0 .4-.1.2-.1.3-.3.5-.1.1-.3.3-.4.4-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1 .2-.2.3-.2.6-.1.2.1 1.5.7 1.8.9.3.1.4.2.5.3.1.2.1.9-.2 1.4-.3.5-1.5 1.1-2.1 1.1-.6 0-1.4-.1-3.3-1-2.4-1-4-3.5-4.1-3.6-.1-.2-1-1.3-1-2.4 0-1.2.6-1.7.8-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7.5 12 13l8-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/letitout_byk/rewind", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/Let-it-Out-104788271746529", icon: Facebook },
  { label: "TikTok", href: "https://www.tiktok.com/@letitout_byk", icon: TikTok },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/105449822/", icon: LinkedIn },
  { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=201288200533", icon: WhatsApp },
  { label: "Email", href: "mailto:letitoutsupport@gmail.com", icon: Mail },
];
