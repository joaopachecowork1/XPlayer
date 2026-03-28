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
            "!bg-[var(--color-moss)] !text-[var(--color-bg-card)]",
          cancelButton:
            "!bg-[var(--color-bg-surface-alt)] !text-[var(--color-text-dark)]",
          closeButton:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
          description: "!text-[var(--color-text-muted)]",
          error:
            "!border-[var(--color-danger)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
          info:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
          loading:
            "!border-[var(--color-beige-dark)]/25 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
          success:
            "!border-[var(--color-moss)]/22 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
          toast:
            "!rounded-[var(--radius-md-token)] !border !shadow-[var(--shadow-layered)]",
          warning:
            "!border-[var(--color-fire)]/20 !bg-[var(--color-bg-card)] !text-[var(--color-text-dark)]",
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
          "--normal-text": "var(--color-text-dark)",
          "--normal-border": "rgba(90, 62, 43, 0.16)",
          "--border-radius": "var(--radius-md-token)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
