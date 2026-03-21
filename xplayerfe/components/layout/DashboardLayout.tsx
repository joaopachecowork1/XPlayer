"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Header } from "./Header"
import Sidebar from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { useAuth } from "@/hooks/useAuth"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SessionProvider } from "@/hooks/useSession"
import { ActiveSessionBar } from "@/components/session/ActiveSessionBar"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter()
  const { isLogged, loading } = useAuth()
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)


  useEffect(() => {
    if (loading) return

    if (!isLogged) router.push("/login")
  }, [loading, isLogged, router])

  // Enquanto inicializa mock auth, evita flicker
  if (loading) return null
  if (!isLogged) return null

  return (
    <SessionProvider>
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={desktopCollapsed}
          onCollapsedChange={setDesktopCollapsed}
        />
      </div>

      {/* Mobile sidebar (drawer) — only used on md+ for extra pages not in bottom nav */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 max-w-[85vw] [&_[data-slot=sheet-close]]:hidden"
        >
          <Sidebar
            collapsed={false}
            onCollapsedChange={() => {
              // Em mobile, mantemos sempre expandido.
            }}
            mode="mobile"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Global, minimal indicator when a session is active */}
        <ActiveSessionBar />

        <main
          className="flex-1 p-0 bg-muted/20"
          onClick={() => {
            // Em desktop: ao clicar na área de conteúdo, recolhe a sidebar (pedido do utilizador).
            if (typeof window !== "undefined" && window.innerWidth >= 768 && !desktopCollapsed) {
              setDesktopCollapsed(true)
            }
          }}
        >
          {/* Extra bottom padding on mobile to clear the bottom nav */}
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 md:pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>

    {/* Mobile bottom navigation — shown only on small screens */}
    <BottomNav />
    </SessionProvider>
  )
}
