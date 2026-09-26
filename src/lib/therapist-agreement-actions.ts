"use server";

// A dedicated "use server" file — TherapistAgreementForm is a client
// component that imports these directly (needed for useActionState), and
// that only works when the whole module is a server-actions module (a
// file-level "use server" directive). site-settings.ts mixes plain
// data-fetchers (getSiteSettings) with inline-"use server" actions, which
// works fine when those actions are only ever referenced from Server
// Components (see updateSiteSettings/updateHiddenArticles there) but not
// when imported straight into a client component — the bundler then tries
// to pull the whole module, including prisma/pg, into the browser bundle.

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit-log";

const MAX_AGREEMENT_PDF_BYTES = 8 * 1024 * 1024; // 8MB, same ceiling as therapist toolkit PDFs

function dataUriByteSize(dataUri: string): number {
  const base64 = dataUri.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

export type TherapistAgreementFormState = { error?: string; success?: boolean } | undefined;

export async function updateTherapistAgreement(
  _prevState: TherapistAgreementFormState,
  formData: FormData,
): Promise<TherapistAgreementFormState> {
  const admin = await requireAdmin();
  const fileData = String(formData.get("fileData") ?? "");
  const fileName = String(formData.get("fileName") ?? "").trim();

  if (!fileData.startsWith("data:application/pdf")) return { error: "Please attach a PDF file." };
  if (dataUriByteSize(fileData) > MAX_AGREEMENT_PDF_BYTES) {
    return { error: `That PDF is too large, please keep it under ${Math.floor(MAX_AGREEMENT_PDF_BYTES / (1024 * 1024))}MB.` };
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", therapistAgreementFileData: fileData, therapistAgreementFileName: fileName || "agreement.pdf" },
    update: { therapistAgreementFileData: fileData, therapistAgreementFileName: fileName || "agreement.pdf" },
  });
  await logAudit({
    actor: admin,
    action: "site_settings.therapist_agreement_updated",
    summary: "Uploaded a new therapist agreement PDF",
    metadata: { fileName },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/therapist/legal");
  return { success: true };
}

export async function removeTherapistAgreement() {
  const admin = await requireAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", therapistAgreementFileData: null, therapistAgreementFileName: null },
    update: { therapistAgreementFileData: null, therapistAgreementFileName: null },
  });
  await logAudit({
    actor: admin,
    action: "site_settings.therapist_agreement_removed",
    summary: "Removed the therapist agreement PDF",
  });

  revalidatePath("/admin/settings");
  revalidatePath("/therapist/legal");
}
