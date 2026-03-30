"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LogSos = () => Promise<void>;

export function SosButton({ logSos }: { logSos: LogSos }) {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  async function handleClick() {
    if (loading || logged) return;
    setLoading(true);
    try {
      await logSos();
      setLogged(true);
    } catch {
      // Generic feedback
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      variant="safety"
      size="md"
      aria-label="Log safety event (dummy)"
    >
      <AlertCircle className="mr-2 h-4 w-4" aria-hidden />
      {logged ? "Event logged" : loading ? "Logging…" : "SOS (log only)"}
    </Button>
  );
}
