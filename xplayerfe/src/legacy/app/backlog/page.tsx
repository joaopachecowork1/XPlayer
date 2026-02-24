"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { BacklogModule } from "@/components/modules/BacklogModule";

export default function BacklogPage() {
  return (
    <DashboardLayout>
      <BacklogModule />
    </DashboardLayout>
  );
}
