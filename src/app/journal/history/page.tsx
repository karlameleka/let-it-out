import { redirect } from "next/navigation";

// The journal feed at /journal now shows the full entry history directly
// (with search and bookmarks), so this route just forwards there.
export default function JournalHistoryRedirect() {
  redirect("/journal");
}
