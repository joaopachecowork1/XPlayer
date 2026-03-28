"use client";

import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";

import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/lib/auth/useIsAdmin";

function AdminStateCard({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <section className="page-hero mx-auto max-w-xl px-5 py-10 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-moss)]/22 bg-[rgba(85,107,79,0.14)] text-[var(--color-title-dark)] shadow-[var(--shadow-paper)]">
        <Shield className="h-7 w-7" />
      </div>
      <div className="mt-5 space-y-2">
        <h2 className="heading-2 text-[var(--color-title-dark)]">{title}</h2>
        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}

export default function AdminPage() {
  const { loading, isLogged, user, loginGoogle } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  if (loading) {
    return (
      <AdminStateCard
        title="A verificar permissoes"
        description="A secao de administracao so abre depois de validar a sessao e as regras do evento."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (isLogged && !user) {
    return (
      <AdminStateCard
        title="A sincronizar perfil"
        description="A conta ja tem sessao, mas o perfil ainda esta a ser sincronizado com o contexto do evento."
        action={
          <div className="mx-auto h-9 w-9 rounded-full border-4 border-[var(--color-moss)] border-t-transparent animate-spin" />
        }
      />
    );
  }

  if (!isLogged) {
    return (
      <AdminStateCard
        title="Sessao necessaria"
        description="Entra com a tua conta para abrir o centro de controlo do evento."
        action={
          <Button className="w-full sm:w-auto" onClick={loginGoogle}>
            Entrar com Google
          </Button>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <AdminStateCard
        title="Acesso restrito"
        description="Esta area continua visivel, mas so os admins confirmados conseguem moderar propostas, votos e fases do evento."
        action={
          <Button variant="outline" onClick={() => router.push("/canhoes")}>
            Voltar ao feed
          </Button>
        }
      />
    );
  }

  return <CanhoesAdminModule />;
}
