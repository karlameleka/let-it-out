"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { updateTherapistProfile } from "@/lib/therapist-actions";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

export default function TherapistProfileForm({
  credentials,
  bio,
  email,
  specialties,
  languages,
  photoUrl,
}: {
  credentials: string;
  bio: string;
  email: string;
  specialties: string[];
  languages: string[];
  photoUrl: string | null;
}) {
  const [state, formAction] = useActionState(updateTherapistProfile, undefined);
  const [photo, setPhoto] = useState<string | null>(photoUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    setPhotoError(null);
    setPhotoProcessing(true);
    try {
      setPhoto(await compressImage(file, { maxDimension: 480, quality: 0.8 }));
    } catch {
      setPhotoError("Couldn't process that photo — try a different one.");
    } finally {
      setPhotoProcessing(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <span className={labelClass}>Photo</span>
        <div className="flex items-center gap-4">
          {photo ? (
            <Image src={photo} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" />
          ) : (
            <div className="h-[72px] w-[72px] rounded-full bg-brand-100" />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoProcessing}
            className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            {photoProcessing ? "Processing…" : "Change photo"}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        {photoError && <p className="mt-1.5 text-xs text-red-600">{photoError}</p>}
        <input type="hidden" name="photoUrl" value={photo ?? ""} />
      </div>

      <div>
        <label htmlFor="credentials" className={labelClass}>Credentials</label>
        <input id="credentials" name="credentials" defaultValue={credentials} required className={fieldClass} />
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>Bio</label>
        <textarea id="bio" name="bio" defaultValue={bio} required rows={5} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="specialties" className={labelClass}>Specialties (comma-separated)</label>
        <input
          id="specialties"
          name="specialties"
          defaultValue={specialties.join(", ")}
          className={fieldClass}
          placeholder="Anxiety, Relationships, Grief"
        />
      </div>

      <div>
        <label htmlFor="languages" className={labelClass}>Languages (comma-separated)</label>
        <input
          id="languages"
          name="languages"
          defaultValue={languages.join(", ")}
          className={fieldClass}
          placeholder="English, Arabic"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Notification email</label>
        <input id="email" name="email" type="email" defaultValue={email} required className={fieldClass} />
        <p className="mt-1.5 text-xs text-ink/50">
          Where new booking requests and session confirmations are sent — also your portal login email.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-brand-600">Profile updated.</p>}
      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save profile"}
    </Button>
  );
}
