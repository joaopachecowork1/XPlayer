import type { Metadata } from "next";
import AppProviders from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "XPlayer",
  description: "XPlayer Frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0b1f18] text-emerald-50">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
