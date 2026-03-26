"use client";

import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { PublicUserDto } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type UsersAdminProps = {
  loading: boolean;
  members: PublicUserDto[];
};

function getMemberInitials(member: PublicUserDto) {
  return (member.displayName ?? member.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberRowSkeleton() {
  return (
    <div className="canhoes-list-item flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28 rounded" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    </div>
  );
}

function MemberRow({ member }: Readonly<{ member: PublicUserDto }>) {
  return (
    <div className="canhoes-list-item flex items-center gap-3 px-3 py-2.5">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          member.isAdmin
            ? "border-[var(--color-moss)]/35 bg-[rgba(74,92,47,0.2)] text-[var(--color-text-primary)]"
            : "border-[var(--color-beige-dark)]/25 bg-white/5 text-[var(--color-beige)]"
        )}
      >
        {getMemberInitials(member) || "?"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--color-text-primary)]">{member.displayName ?? "—"}</p>
        <p className="body-small truncate text-[var(--color-text-muted)]">{member.email}</p>
      </div>

      {member.isAdmin ? <Badge variant="outline">Admin</Badge> : null}
    </div>
  );
}

export function UsersAdmin({ loading, members }: Readonly<UsersAdminProps>) {
  const adminMembers = members.filter((member) => member.isAdmin);
  const regularMembers = members.filter((member) => !member.isAdmin);

  return (
    <div className="space-y-4">
      <div className="canhoes-list-item flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-text-primary)]">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">Membros ({loading ? "…" : members.length})</p>
          <p className="body-small text-[var(--color-text-muted)]">
            {loading ? "A carregar…" : `${adminMembers.length} admin · ${regularMembers.length} membros`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <MemberRowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && adminMembers.length > 0 ? (
        <div className="space-y-2">
          <p className="label px-1 text-[var(--color-text-muted)]">Administradores</p>
          {adminMembers.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      ) : null}

      {!loading && regularMembers.length > 0 ? (
        <div className="space-y-2">
          <p className="label px-1 text-[var(--color-text-muted)]">Membros</p>
          {regularMembers.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      ) : null}

      {!loading && members.length === 0 ? (
        <p className="body-small py-10 text-center text-[var(--color-text-muted)]">Nenhum membro encontrado.</p>
      ) : null}
    </div>
  );
}
