import { Users } from "lucide-react";

export default function TherapistClientsPage() {
  return (
    <div className="hidden min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-brand-200 lg:flex">
      <div className="text-center">
        <Users className="mx-auto h-8 w-8 text-brand-300" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-ink/50">Select a client to see their record.</p>
      </div>
    </div>
  );
}
