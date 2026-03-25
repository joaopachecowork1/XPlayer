"use client";

/**
 * DevModeBanner — visible only when NEXT_PUBLIC_MOCK_AUTH=true.
 *
 * Renders a small, dismissible badge in the bottom-left corner so
 * developers know they are in mock mode. Never shown in production.
 */

import { useState } from "react";
import { IS_MOCK_MODE } from "@/lib/mock";

/**
 * A subtle but unmistakable banner indicating mock/dev mode is active.
 * Placed fixed in the bottom-left corner, dismissible per session.
 */
export function DevModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Hard guard: never render in production, even if the component is imported.
  if (process.env.NODE_ENV === "production") return null;
  if (!IS_MOCK_MODE) return null;
  if (dismissed) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)",
        left: "0.75rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.6rem",
        borderRadius: "9999px",
        background: "rgba(10, 30, 14, 0.85)",
        border: "1px solid rgba(82, 183, 136, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontSize: "0.7rem",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: "#52b788",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35), 0 0 8px rgba(82,183,136,0.15)",
        userSelect: "none",
        pointerEvents: "auto",
        cursor: "default",
      }}
      title="Mock Auth is active. This banner appears when NEXT_PUBLIC_MOCK_AUTH=true is set in .env.local."
    >
      <span>🧪</span>
      <span style={{ letterSpacing: "0.03em" }}>DEV MODE — Mock Auth Active</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss dev mode banner"
        style={{
          marginLeft: "0.25rem",
          background: "none",
          border: "none",
          color: "rgba(82,183,136,0.6)",
          cursor: "pointer",
          padding: "0 0.15rem",
          fontSize: "0.75rem",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
