"use client";

/**
 * UsersAdmin — read-only members list for the admin panel.
 *
 * Shows all registered members with their admin status.
 * Future: add ban/suspend/promote actions once backend supports them.
 */

import type { PublicUserDto } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

type Props = {
  members: PublicUserDto[];
  loading: boolean;
};

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(15,36,21,0.4)", border: "1px solid rgba(82,183,136,0.12)" }}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: PublicUserDto }) {
  const initials = (member.displayName ?? member.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[rgba(82,183,136,0.06)]"
      style={{ border: "1px solid rgba(82,183,136,0.12)" }}
    >
      {/* Avatar */}
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: member.isAdmin
            ? "linear-gradient(135deg, rgba(82,183,136,0.3), rgba(45,106,79,0.5))"
            : "rgba(30,51,34,0.6)",
          border: member.isAdmin ? "1px solid rgba(82,183,136,0.5)" : "1px solid rgba(82,183,136,0.2)",
          color: member.isAdmin ? "#52b788" : "#a0b8a4",
        }}
      >
        {initials || "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {member.displayName ?? "—"}
        </div>
        <div className="text-xs text-muted-foreground truncate">{member.email}</div>
      </div>

      {/* Admin badge */}
      {member.isAdmin && (
        <Badge
          variant="outline"
          className="shrink-0 text-xs"
          style={{ borderColor: "rgba(82,183,136,0.4)", color: "#52b788" }}
        >
          Admin
        </Badge>
      )}
    </div>
  );
}

/**
 * UsersAdmin — admin panel members tab.
 *
 * @example
 * <UsersAdmin members={members} loading={loading} />
 */
export function UsersAdmin({ members, loading }: Readonly<Props>) {
  const admins = members.filter((m) => m.isAdmin);
  const regular = members.filter((m) => !m.isAdmin);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: "linear-gradient(145deg, rgba(15,36,21,0.6), rgba(10,24,14,0.6))",
          border: "1px solid rgba(82,183,136,0.25)",
        }}
      >
        <Users className="h-5 w-5 shrink-0" style={{ color: "#52b788" }} />
        <div>
          <div className="font-medium" style={{ color: "#e9d8a6", fontFamily: "'Cinzel', serif" }}>
            Membros ({loading ? "…" : members.length})
          </div>
          <div className="text-xs text-muted-foreground">
            {loading ? "A carregar…" : `${admins.length} admin · ${regular.length} membros`}
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <MemberRowSkeleton key={i} />)}
        </div>
      )}

      {/* Admin members */}
      {!loading && admins.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Administradores
          </div>
          {admins.map((m) => <MemberRow key={m.id} member={m} />)}
        </div>
      )}

      {/* Regular members */}
      {!loading && regular.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Membros
          </div>
          {regular.map((m) => <MemberRow key={m.id} member={m} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Nenhum membro encontrado.
        </div>
      )}
    </div>
  );
}
