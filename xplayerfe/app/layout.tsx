import "./globals.css"

export const metadata = {
  title: "XPlayer",
  description: "Trabalha como um dev. Progride como num jogo.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-background text-foreground">
        <div className="max-w-md mx-auto p-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">🎮 XPlayer</h1>
            <p className="text-sm text-muted-foreground">
              Trabalha como um dev. Progride como num jogo.
            </p>
          </header>

          {children}
        </div>
      </body>
    </html>
  )
}
