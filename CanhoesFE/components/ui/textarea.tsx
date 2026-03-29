import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[var(--text-ghost)] flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:border-[var(--border-neon)] focus-visible:bg-[var(--bg-surface)] focus-visible:ring-[3px] focus-visible:ring-[var(--border-neon)]/30 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
