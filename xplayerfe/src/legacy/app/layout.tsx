import { ThemeProvider } from "@/components/ui/themeprovider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "XPlayer",
  description: "Trabalha como um dev. Progride como num jogo."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Toaster expand={true} position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
