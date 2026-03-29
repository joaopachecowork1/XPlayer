"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      richColors
      expand={false}
      visibleToasts={4}
      className="toaster group"
      toastOptions={{
        classNames: {
          actionButton:
            "!bg-[var(--color-moss)] !text-[var(--text-primary)]",
          cancelButton:
            "!bg-[var(--color-bg-surface-alt)] !text-[var(--color-text-primary)]",
          closeButton:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
          description: "!text-[var(--color-text-muted)]",
          error:
            "!border-[var(--color-danger)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
          info:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
          loading:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
          success:
            "!border-[var(--color-moss)]/22 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
          toast:
            "!rounded-[var(--radius-md-token)] !border !shadow-[var(--shadow-layered)]",
          warning:
            "!border-[var(--color-fire)]/20 !bg-[var(--color-bg-card)] !text-[var(--color-text-primary)]",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-bg-card)",
          "--normal-text": "var(--color-text-primary)",
          "--normal-border": "var(--border-subtle)",
          "--border-radius": "var(--radius-md-token)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
