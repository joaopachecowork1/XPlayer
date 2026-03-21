import type { Metadata, Viewport } from "next";
import AppProviders from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPlayer",
  description: "XPlayer Frontend",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
