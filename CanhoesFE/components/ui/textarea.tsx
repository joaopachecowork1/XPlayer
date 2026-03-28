import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[var(--color-text-muted)] flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border-2 border-transparent bg-[rgba(234,223,207,0.86)] px-4 py-3 text-base text-[var(--color-text-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:border-transparent focus-visible:bg-[var(--color-bg-card)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-psycho-4)]/30 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
