import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md-token)] border text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-psycho-4)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-moss)] text-[var(--color-text-primary)] border-transparent shadow-[var(--shadow-card)] hover:bg-[var(--color-moss-light)] active:scale-95",
        destructive:
          "bg-[var(--color-danger)] text-white border-transparent shadow-[var(--shadow-card)] hover:opacity-90 active:scale-95",
        outline:
          "border-[var(--color-beige-dark)]/30 bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-beige-dark)]/50 hover:bg-white/5 active:scale-95",
        secondary:
          "bg-[var(--color-brown-dark)] text-[var(--color-beige)] border-[var(--color-beige-dark)]/20 shadow-[var(--shadow-card)] hover:bg-[var(--color-brown)] active:scale-95",
        ghost:
          "border-transparent bg-transparent text-[var(--color-text-primary)] shadow-none hover:bg-white/6 active:scale-95",
        link: "border-transparent px-0 text-[var(--color-beige)] underline-offset-4 shadow-none hover:text-[var(--color-text-primary)] hover:underline",
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
