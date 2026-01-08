"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { SettingsModule } from "@/components/modules/SettingsModule";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <SettingsModule />
    </DashboardLayout>
  );
}