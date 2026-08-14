import { prisma } from "@/lib/db";
import type { LeadType, LeadStatus } from "@/generated/prisma/enums";

interface LeadInput {
  name: string;
  type: LeadType;
  status?: LeadStatus;
  email?: string;
  phone?: string;
  source?: string;
  sessionType?: string;
  groupSize?: number;
  orderTotalEGP?: number;
  paymentMethod?: string;
  notes?: string;
}

/** Creates a CRM record for a real lead/customer. This is the single
 * source of truth for the admin CRM view — unlike the optional Airtable
 * sync, this always runs since it just writes to the app's own database. */
export async function createLead(input: LeadInput) {
  await prisma.lead.create({ data: input });
}
