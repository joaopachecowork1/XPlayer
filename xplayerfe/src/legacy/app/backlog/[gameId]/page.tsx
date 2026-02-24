"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { BacklogGameDetailModule } from "@/components/modules/BacklogGameDetailModule";

export default function BacklogGameDetailPage({ params }: { params: { gameId: string } }) {
  return (
    <DashboardLayout>
      <BacklogGameDetailModule gameId={params.gameId} />
    </DashboardLayout>
  );
}
