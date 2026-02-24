"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { CanhoesHubModule } from "@/components/modules/canhoes/CanhoesHubModule";
import { CanhoesShell } from "@/components/canhoes/CanhoesShell";

export default function CanhoesPage() {
  return (
    <DashboardLayout>
      <CanhoesShell>
        <CanhoesHubModule />
      </CanhoesShell>
    </DashboardLayout>
  );
}
