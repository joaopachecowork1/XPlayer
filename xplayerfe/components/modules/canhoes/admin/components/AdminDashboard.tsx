"use client";

/**
 * AdminDashboard — Quick metrics and activity overview for the admin panel.
 *
 * Displays aggregated stats from already-loaded admin data:
 * categories, nominees, proposals, votes, and members.
 */

import type {
  AwardCategoryDto,
  NomineeDto,
  CategoryProposalDto,
  MeasureProposalDto,
  PublicUserDto,
} from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  categories: AwardCategoryDto[];
  allNominees: NomineeDto[];
  pendingNominees: NomineeDto[];
  pendingCategoryProposals: CategoryProposalDto[];
  pendingMeasureProposals: MeasureProposalDto[];
  members: PublicUserDto[];
  totalVotes: number;
  loading: boolean;
};

type MetricCardProps = {
  label: string;
  value: number | string;
  icon: string;
  accent?: "green" | "amber" | "red" | "blue";
  badge?: string;
};

function MetricCard({ label, value, icon, accent = "green", badge }: MetricCardProps) {
  const accentMap: Record<string, { border: string; glow: string; text: string }> = {
    green: {
      border: "rgba(82, 183, 136, 0.30)",
      glow: "rgba(82, 183, 136, 0.08)",
      text: "#52b788",
    },
    amber: {
      border: "rgba(233, 196, 106, 0.35)",
      glow: "rgba(233, 196, 106, 0.08)",
      text: "#e9c46a",
    },
    red: {
      border: "rgba(255, 45, 117, 0.35)",
      glow: "rgba(255, 45, 117, 0.08)",
      text: "#ff2d75",
    },
    blue: {
      border: "rgba(100, 180, 255, 0.30)",
      glow: "rgba(100, 180, 255, 0.08)",
      text: "#64b4ff",
    },
  };
  const colors = accentMap[accent];

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{
        background: `linear-gradient(145deg, rgba(15,36,21,0.6), rgba(10,24,14,0.6))`,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 16px ${colors.glow}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        {badge && (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{ background: colors.glow, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {badge}
          </Badge>
        )}
      </div>
      <div
        className="text-2xl font-bold mt-1"
        style={{ color: colors.text, fontFamily: "'Cinzel', serif" }}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(15,36,21,0.4)", border: "1px solid rgba(82,183,136,0.15)" }}>
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-7 w-16 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
    </div>
  );
}

/**
 * Admin Dashboard — shows key metrics at a glance.
 *
 * @example
 * <AdminDashboard categories={cats} allNominees={noms} ... />
 */
export function AdminDashboard({
  categories,
  allNominees,
  pendingNominees,
  pendingCategoryProposals,
  pendingMeasureProposals,
  members,
  totalVotes,
  loading,
}: Readonly<Props>) {
  const activeCategories = categories.filter((c) => c.isActive).length;
  const approvedNominees = allNominees.filter((n) => n.status === "approved").length;
  const pendingTotal = pendingNominees.length + pendingCategoryProposals.length + pendingMeasureProposals.length;
  const adminCount = members.filter((m) => m.isAdmin).length;

  const recentActivity = [...allNominees]
    .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime())
    .slice(0, 5);

  const metrics: MetricCardProps[] = [
    {
      label: "Categorias Ativas",
      value: loading ? "—" : activeCategories,
      icon: "🏆",
      accent: "green",
      badge: `${categories.length} total`,
    },
    {
      label: "Nomeações Aprovadas",
      value: loading ? "—" : approvedNominees,
      icon: "✅",
      accent: "blue",
    },
    {
      label: "Pendentes de Revisão",
      value: loading ? "—" : pendingTotal,
      icon: pendingTotal > 0 ? "⚠️" : "👌",
      accent: pendingTotal > 0 ? "amber" : "green",
    },
    {
      label: "Votos Registados",
      value: loading ? "—" : totalVotes,
      icon: "🗳️",
      accent: "blue",
    },
    {
      label: "Membros",
      value: loading ? "—" : members.length,
      icon: "👥",
      accent: "green",
      badge: `${adminCount} admin`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <MetricSkeleton key={i} />)
          : metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Alerts section */}
      {!loading && pendingTotal > 0 && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{
            background: "linear-gradient(145deg, rgba(40,20,10,0.6), rgba(30,15,8,0.6))",
            border: "1px solid rgba(233, 196, 106, 0.35)",
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: "#e9c46a", fontFamily: "'Cinzel', serif" }}>
            <span>⚠️</span> Atenção Necessária
          </div>
          <ul className="space-y-1">
            {pendingNominees.length > 0 && (
              <li className="text-sm text-muted-foreground">
                • <span style={{ color: "#e9c46a" }}>{pendingNominees.length}</span> nomeações pendentes de aprovação
              </li>
            )}
            {pendingCategoryProposals.length > 0 && (
              <li className="text-sm text-muted-foreground">
                • <span style={{ color: "#e9c46a" }}>{pendingCategoryProposals.length}</span> propostas de categoria aguardam decisão
              </li>
            )}
            {pendingMeasureProposals.length > 0 && (
              <li className="text-sm text-muted-foreground">
                • <span style={{ color: "#e9c46a" }}>{pendingMeasureProposals.length}</span> medidas propostas aguardam decisão
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Recent nominations */}
      {!loading && recentActivity.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">📋 Actividade Recente</div>
          <div className="space-y-1.5">
            {recentActivity.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "rgba(15,36,21,0.4)",
                  border: "1px solid rgba(82,183,136,0.15)",
                }}
              >
                <div className="min-w-0">
                  <span className="truncate font-medium">{n.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(n.createdAtUtc).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <Badge
                  variant={n.status === "approved" ? "default" : n.status === "rejected" ? "destructive" : "secondary"}
                  className="shrink-0 text-xs"
                >
                  {n.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
