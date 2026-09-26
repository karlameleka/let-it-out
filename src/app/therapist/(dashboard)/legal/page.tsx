import { FileText, Download } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import PdfOpenButton from "@/components/pdf-open-button";

export default async function TherapistLegalPage() {
  const settings = await getSiteSettings();
  const hasAgreement = Boolean(settings.therapistAgreementFileData && settings.therapistAgreementFileName);

  return (
    <div className="max-w-md rounded-2xl border border-brand-100 bg-white p-6">
      <h2 className="font-display font-semibold text-brand-900">Legal</h2>
      <p className="mt-1 text-sm text-ink/60">Documents and agreements related to your work with us.</p>

      <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700">
            <FileText className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-brand-900">Therapist agreement</p>
            {hasAgreement ? (
              <PdfOpenButton
                fileData={settings.therapistAgreementFileData!}
                fileName={settings.therapistAgreementFileName!}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 link-grow"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Open / Download PDF
              </PdfOpenButton>
            ) : (
              <p className="mt-1 text-sm text-ink/50">Not uploaded yet — check back later.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
