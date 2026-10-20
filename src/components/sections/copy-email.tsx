"use client";

import { useEffect, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(email).then(() => setCopied(true))}
      className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-5 font-mono text-sm text-muted transition-colors hover:border-fg hover:text-fg"
    >
      <span aria-live="polite">{copied ? "✓ Copied" : "Copy email"}</span>
    </button>
  );
}
