// src/app/canhoes/(app)/admin/page.tsx
//
// Admin page with client-side access guard.
// Shows the full admin panel to confirmed admins.
// Shows a themed "Acesso Negado" screen to everyone else —
// the tab remains visible and navigable by design.
"use client";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { loading, isLogged, user, loginGoogle } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  // Show a spinner while auth loads so we don't flash the denial screen.
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">A verificar permissões…</p>
      </div>
    );
  }

  // If session exists but user profile is still missing, avoid flashing a hard deny state.
  if (isLogged && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">A sincronizar permissões de administrador...</p>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 px-4 text-center">
        <div className="canhoes-title text-2xl">🔐 Sessão Necessária</div>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Inicia sessão para aceder ao painel de administração.
        </p>
        <Button className="canhoes-tap canhoes-neon-border" onClick={loginGoogle}>
          Iniciar Sessão
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      // "Acesso Negado" — themed denial screen.
      // The tab stays visible so users know this section exists;
      // only authenticated admins get the full panel.
      <div className="flex flex-col items-center justify-center py-16 gap-6 px-4 text-center">
        {/* Icon ring with neon pulse */}
        <div
          className="canhoes-pulse h-20 w-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, rgba(255,45,117,0.15), rgba(255,45,117,0.05))",
            border: "2px solid rgba(255,45,117,0.40)",
          }}
        >
          <Shield className="h-9 w-9" style={{ color: "#ff2d75" }} />
        </div>

        {/* Title */}
        <div>
          <h2
            className="canhoes-title text-2xl mb-2"
            style={{ color: "#ff2d75", textShadow: "0 0 18px rgba(255,45,117,0.50)" }}
          >
            🚫 Acesso Negado
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Não tens permissão para aceder ao painel de administração.
          </p>
        </div>

        {/* Back button */}
        <Button
          variant="outline"
          size="sm"
          className="canhoes-tap rounded-full px-6 h-10 border-jungle-700/40 hover:border-primary/50"
          onClick={() => router.push("/canhoes")}
        >
          ← Voltar ao Feed
        </Button>
      </div>
    );
  }

  return <CanhoesAdminModule />;
}
