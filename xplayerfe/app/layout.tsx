import { ThemeProvider } from "@/components/ui/themeprovider";
import "./globals.css";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
