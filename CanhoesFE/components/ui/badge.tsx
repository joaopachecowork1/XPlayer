import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 font-[var(--font-mono)] text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-psycho-4)] focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-moss)] text-[var(--text-primary)] shadow-[var(--shadow-paper)]",
        secondary:
          "border-transparent bg-[var(--bark)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]",
        destructive:
          "border-transparent bg-[var(--color-danger)] text-white shadow-sm hover:opacity-90",
        outline:
          "border-[var(--border-neon)] bg-transparent text-[var(--neon-green)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
