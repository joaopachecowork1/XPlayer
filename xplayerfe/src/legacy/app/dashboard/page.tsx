"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardModule } from "@/components/modules/DashboardModule";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardModule />
    </DashboardLayout>
  );
}
