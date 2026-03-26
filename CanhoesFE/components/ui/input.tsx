import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input-psycho-focus file:text-[var(--color-text-dark)] placeholder:text-[var(--color-text-muted)] selection:bg-[var(--color-moss)] selection:text-[var(--color-text-primary)] min-h-11 w-full min-w-0 rounded-[var(--radius-md-token)] border-2 border-transparent bg-[var(--color-bg-surface-alt)] px-4 py-3 text-base text-[var(--color-text-dark)] shadow-none transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-transparent focus-visible:ring-[var(--color-psycho-4)]/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
