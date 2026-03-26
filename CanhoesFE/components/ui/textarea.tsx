import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[var(--color-text-muted)] focus-visible:border-transparent focus-visible:ring-[var(--color-psycho-4)]/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border-2 border-transparent bg-[var(--color-bg-surface-alt)] px-4 py-3 text-base text-[var(--color-text-dark)] shadow-none transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
