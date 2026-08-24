"use client";

import { Button } from "@/components/ui";

export default function OfflineRetryButton({ label }: { label: string }) {
  return (
    <Button variant="primary" onClick={() => window.location.reload()}>
      {label}
    </Button>
  );
}
