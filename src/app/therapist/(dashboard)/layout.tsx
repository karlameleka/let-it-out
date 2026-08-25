import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentCounselor } from "@/lib/therapist-session";
import { logoutCounselorAction } from "@/lib/therapist-auth-actions";
import { prisma } from "@/lib/db";
import { Container, Button } from "@/components/ui";
import TherapistNav from "../therapist-nav";

export default async function TherapistDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentCounselor();
  if (!session) redirect("/therapist/login");

  const counselor = await prisma.counselor.findUnique({ where: { id: session.counselorId } });
  if (!counselor) redirect("/therapist/login");

  return (
    <div className="min-h-full bg-brand-50">
      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {counselor.photoUrl && (
              <Image
                src={counselor.photoUrl}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Therapist portal</p>
              <h1 className="font-display text-xl font-semibold text-brand-900">Hi {counselor.name.split(" ")[0]}</h1>
            </div>
          </div>
          <form action={logoutCounselorAction}>
            <Button type="submit" variant="outline" className="!px-4 !py-2 text-xs">
              Log out
            </Button>
          </form>
        </div>

        <TherapistNav />
        <div className="mt-8 pb-16">{children}</div>
      </Container>
    </div>
  );
}
