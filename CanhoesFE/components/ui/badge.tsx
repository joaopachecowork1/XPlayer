import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-psycho-4)] focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-moss)] text-[var(--color-text-primary)]",
        secondary:
          "border-transparent bg-[var(--color-beige-dark)] text-[var(--color-text-dark)]",
        destructive:
          "border-transparent bg-[var(--color-danger)] text-white shadow-sm hover:opacity-90",
        outline: "border-[var(--color-beige-dark)]/30 bg-transparent text-[var(--color-beige)]",
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
