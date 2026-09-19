import { notFound } from "next/navigation";
import { requireCounselor } from "@/lib/therapist-session";
import { getOwnCounselorWithBookings, deriveClients } from "@/lib/therapist-data";
import ClientsSplitPane from "./split-pane";
import ClientListPane from "./client-list-pane";

export default async function TherapistClientsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCounselor();
  const counselor = await getOwnCounselorWithBookings(session.counselorId);
  if (!counselor) notFound();

  const clients = deriveClients(counselor);
  const requests = [...counselor.bookingRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <ClientsSplitPane list={<ClientListPane clients={clients} requests={requests} />}>{children}</ClientsSplitPane>
  );
}
