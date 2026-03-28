import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md-token)] border text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-psycho-4)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-moss)] text-[var(--color-bg-card)] shadow-[var(--shadow-card)] hover:bg-[var(--color-moss-light)] hover:shadow-[var(--shadow-layered)] active:scale-[0.98]",
        destructive:
          "border-transparent bg-[var(--color-danger)] text-white shadow-[var(--shadow-card)] hover:bg-[var(--color-danger-hover)] active:scale-[0.98]",
        outline:
          "border-[var(--color-beige-dark)]/30 bg-[rgba(251,247,239,0.78)] text-[var(--color-text-primary)] shadow-[var(--shadow-paper)] hover:border-[var(--color-brown)]/35 hover:bg-[var(--color-bg-surface)] active:scale-[0.98]",
        secondary:
          "border-[var(--color-brown-dark)]/12 bg-[var(--color-brown-dark)] text-[var(--color-bg-card)] shadow-[var(--shadow-card)] hover:bg-[var(--color-brown)] active:scale-[0.98]",
        ghost:
          "border-transparent bg-transparent text-[var(--color-text-primary)] shadow-none hover:bg-[var(--color-bg-surface)] active:scale-[0.98]",
        link: "border-transparent px-0 text-[var(--color-brown)] underline-offset-4 shadow-none hover:text-[var(--color-text-primary)] hover:underline",
      },
      size: {
        default: "px-4 py-3",
        sm: "min-h-11 rounded-[var(--radius-sm-token)] px-3 py-2 text-sm",
        lg: "min-h-12 rounded-[var(--radius-lg-token)] px-6 py-3 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
