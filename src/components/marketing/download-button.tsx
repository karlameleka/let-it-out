import { Download } from "lucide-react";

const APP_ORIGIN = "https://www.letitouteg.org";

// The one destination every button on the marketing site leads to — see
// proxy.ts and the PR notes for why nothing here links into the live app.
export function DownloadButton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={`${APP_ORIGIN}/install`}
      className={`inline-flex items-center justify-center gap-2 rounded bg-brand-700 px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] ${className}`}
    >
      <Download className="h-4 w-4 shrink-0" strokeWidth={2} />
      {children ?? "Download the app"}
    </a>
  );
}
