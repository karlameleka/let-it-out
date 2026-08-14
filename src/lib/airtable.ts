type LeadType = "Workshop Lead" | "Counseling Inquiry" | "Journal Customer" | "General Inquiry";
type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";

interface AirtableLeadFields {
  Name: string;
  Type: LeadType;
  Status: LeadStatus;
  Email?: string;
  Phone?: string;
  Source?: string;
  "Date Received"?: string;
  "Session Type"?: string;
  "Group Size"?: number;
  "Order Total"?: number;
  "Payment Method"?: string;
  Notes?: string;
}

/**
 * Pushes a new record to the "Leads & Customers" Airtable CRM table.
 * No-ops silently when Airtable isn't configured, and never throws —
 * a CRM sync failure must never break the form submission it came from.
 */
export async function syncLeadToAirtable(fields: AirtableLeadFields) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_LEADS_TABLE_ID;
  if (!apiKey || !baseId || !tableId) return;

  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: { "Date Received": new Date().toISOString().slice(0, 10), ...fields },
        typecast: true,
      }),
    });
    if (!res.ok) {
      console.error("[airtable] Sync failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[airtable] Sync failed:", err);
  }
}
