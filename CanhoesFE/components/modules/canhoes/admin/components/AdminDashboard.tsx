"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type {
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
  NomineeDto,
  PublicUserDto,
} from "@/lib/api/types";

type AdminDashboardProps = {
  allNominees: NomineeDto[];
  categories: AwardCategoryDto[];
  loading: boolean;
  members: PublicUserDto[];
  pendingCategoryProposals: CategoryProposalDto[];
  pendingMeasureProposals: MeasureProposalDto[];
  pendingNominees: NomineeDto[];
  totalVotes: number;
};

type MetricAccent = "amber" | "blue" | "green" | "red";

type MetricCardProps = {
  accent?: MetricAccent;
  badge?: string;
  icon: string;
  label: string;
  value: number | string;
};

const METRIC_ACCENT_STYLES: Record<MetricAccent, string> = {
  amber: "border-[var(--color-beige)]/25 bg-[rgba(107,76,42,0.16)] text-[var(--color-beige)]",
  blue: "border-[var(--color-psycho-4)]/25 bg-[rgba(77,150,255,0.1)] text-[var(--color-psycho-4)]",
  green: "border-[var(--color-moss)]/25 bg-[rgba(74,92,47,0.18)] text-[var(--color-text-primary)]",
  red: "border-[var(--color-danger)]/25 bg-[rgba(224,90,58,0.12)] text-[var(--color-danger)]",
};

function MetricCard({ accent = "green", badge, icon, label, value }: Readonly<MetricCardProps>) {
  return (
    <div className={cn("canhoes-list-item flex flex-col gap-2 p-4", METRIC_ACCENT_STYLES[accent])}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>

        {badge ? <Badge variant="outline">{badge}</Badge> : null}
      </div>

      <div className="text-2xl font-bold">{value}</div>
      <p className="body-small text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="canhoes-list-item space-y-2 p-4">
      <Skeleton className="h-6 w-6 rounded" />
      <Skeleton className="h-7 w-16 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
    </div>
  );
}

export function AdminDashboard({
  allNominees,
  categories,
  loading,
  members,
  pendingCategoryProposals,
  pendingMeasureProposals,
  pendingNominees,
  totalVotes,
}: Readonly<AdminDashboardProps>) {
  const activeCategories = categories.filter((category) => category.isActive).length;
  const approvedNominees = allNominees.filter((nominee) => nominee.status === "approved").length;
  const pendingReviews = pendingNominees.length + pendingCategoryProposals.length + pendingMeasureProposals.length;
  const adminCount = members.filter((member) => member.isAdmin).length;

  const recentNominees = [...allNominees]
    .sort((leftNominee, rightNominee) => new Date(rightNominee.createdAtUtc).getTime() - new Date(leftNominee.createdAtUtc).getTime())
    .slice(0, 5);

  const metrics: MetricCardProps[] = [
    {
      accent: "green",
      badge: `${categories.length} total`,
      icon: "🏆",
      label: "Categorias Ativas",
      value: loading ? "—" : activeCategories,
    },
    {
      accent: "blue",
      icon: "✅",
      label: "Nomeações Aprovadas",
      value: loading ? "—" : approvedNominees,
    },
    {
      accent: pendingReviews > 0 ? "amber" : "green",
      icon: pendingReviews > 0 ? "⚠️" : "👌",
      label: "Pendentes de Revisão",
      value: loading ? "—" : pendingReviews,
    },
    {
      accent: "blue",
      icon: "🗳️",
      label: "Votos Registados",
      value: loading ? "—" : totalVotes,
    },
    {
      accent: "green",
      badge: `${adminCount} admin`,
      icon: "👥",
      label: "Membros",
      value: loading ? "—" : members.length,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => <MetricSkeleton key={index} />)
          : metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      {!loading && pendingReviews > 0 ? (
        <div className="canhoes-list-item space-y-2 border-[var(--color-beige)]/25 bg-[rgba(107,76,42,0.16)] p-4">
          <div className="flex items-center gap-2 font-semibold text-[var(--color-beige)]">
            <span aria-hidden="true">⚠️</span>
            Atenção Necessária
          </div>

          <ul className="space-y-1">
            {pendingNominees.length > 0 ? (
              <li className="body-small text-[var(--color-text-primary)]">
                • {pendingNominees.length} nomeações pendentes de aprovação
              </li>
            ) : null}
            {pendingCategoryProposals.length > 0 ? (
              <li className="body-small text-[var(--color-text-primary)]">
                • {pendingCategoryProposals.length} propostas de categoria aguardam decisão
              </li>
            ) : null}
            {pendingMeasureProposals.length > 0 ? (
              <li className="body-small text-[var(--color-text-primary)]">
                • {pendingMeasureProposals.length} medidas propostas aguardam decisão
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {!loading && recentNominees.length > 0 ? (
        <div className="space-y-2">
          <p className="label text-[var(--color-text-muted)]">Actividade Recente</p>

          <div className="space-y-2">
            {recentNominees.map((nominee) => (
              <div key={nominee.id} className="canhoes-list-item flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">{nominee.title}</p>
                  <p className="body-small text-[var(--color-text-muted)]">
                    {new Date(nominee.createdAtUtc).toLocaleDateString("pt-PT", {
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>

                <Badge
                  variant={
                    nominee.status === "approved"
                      ? "default"
                      : nominee.status === "rejected"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {nominee.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
