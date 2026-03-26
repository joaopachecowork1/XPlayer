"use client";

/**
 * DevModeBanner — visible only in development (mock mode is active by default).
 *
 * Renders a small, dismissible badge so developers can confirm they are in
 * mock/demo mode. Disable mock mode with NEXT_PUBLIC_MOCK_AUTH=false.
 * Never shown in production.
 */

import { useState } from "react";
import { IS_MOCK_MODE } from "@/lib/mock";

export function DevModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Hard guard: never render in production.
  if (process.env.NODE_ENV === "production") return null;
  if (!IS_MOCK_MODE) return null;
  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] left-3 z-[9999] flex select-none items-center gap-1.5 rounded-full border border-[var(--color-moss)]/40 bg-[rgba(26,31,20,0.9)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-primary)] shadow-[var(--shadow-card)] backdrop-blur"
      title="Modo demonstração activo. Para desativar: NEXT_PUBLIC_MOCK_AUTH=false"
    >
      <span>🧪</span>
      <span>Demo sem backend</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss dev mode banner"
        className="canhoes-tap ml-1 rounded-full border border-transparent px-1 text-[var(--color-text-muted)] hover:border-[var(--color-moss)]/30 hover:text-[var(--color-text-primary)]"
      >
        ×
      </button>
    </div>
  );
}
