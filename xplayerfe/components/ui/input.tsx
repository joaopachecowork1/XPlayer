import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] selection:bg-[var(--btn-primary-bg)] selection:text-[var(--btn-primary-text)] border-[var(--border-subtle)] h-9 w-full min-w-0 rounded-[var(--radius-md-token)] border bg-[var(--bg-surface)] px-3 py-1 text-base text-[var(--text-primary)] shadow-xs transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--border-accent)] focus-visible:ring-[var(--border-accent)]/40 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
