"use client";

import { CanhoesShell } from "@/components/canhoes/CanhoesShell";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CanhoesAdminModule from "@/components/modules/canhoes/admin/CanhoesAdminModule";

export default function CanhoesAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Only admins can access the admin page.
    if (!user?.isAdmin) router.replace("/canhoes");
  }, [loading, user?.isAdmin, router]);

  if (loading) {
    return (
      <CanhoesShell>
        <div className="text-sm text-muted-foreground">A verificar permissões...</div>
      </CanhoesShell>
    );
  }

  if (!user?.isAdmin) {
    return (
      <CanhoesShell>
        <div className="text-sm text-muted-foreground">Sem permissões para aceder a esta página.</div>
      </CanhoesShell>
    );
  }

  return (
    <CanhoesShell>
      <CanhoesAdminModule />
    </CanhoesShell>
  );
}
