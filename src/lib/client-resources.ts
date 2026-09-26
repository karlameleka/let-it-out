import "server-only";
import { prisma } from "@/lib/db";

/** Everything a therapist has sent this logged-in client — matched by
 * their session email against AssignedResource.clientEmail, the same
 * email-matching pattern used everywhere else a client's records are
 * looked up (see getClientProfile in therapist-data.ts). Includes the
 * sending counselor's name so the client can see who it's from. */
export async function getMyAssignedResources(clientEmail: string) {
  return prisma.assignedResource.findMany({
    where: { clientEmail },
    include: { counselor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type MyAssignedResource = Awaited<ReturnType<typeof getMyAssignedResources>>[number];

/** The Cognitive Reframing tool a therapist assigned this client, if any —
 * opened as its own full page (see profile/reframing/page.tsx) rather
 * than embedded inline in the "My tools" card. Most recent wins if a
 * client was somehow sent it more than once. */
export async function getMyReframingAssignment(clientEmail: string) {
  return prisma.assignedResource.findFirst({
    where: { clientEmail, kind: "REFRAMING_TOOL" },
    orderBy: { createdAt: "desc" },
  });
}

/** The Thought Record tool a therapist assigned this client, if any —
 * opened as its own full page (see profile/thought-record/page.tsx). Most
 * recent wins if a client was somehow sent it more than once. */
export async function getMyThoughtRecordAssignment(clientEmail: string) {
  return prisma.assignedResource.findFirst({
    where: { clientEmail, kind: "THOUGHT_RECORD" },
    orderBy: { createdAt: "desc" },
  });
}

/** Drives the unread-count badge on the Resources tab and the
 * installed-app icon (see unread-tools-context.tsx). */
export async function getUnviewedAssignedResourceCount(clientEmail: string) {
  return prisma.assignedResource.count({ where: { clientEmail, viewedAt: null } });
}
