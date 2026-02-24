"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { FriendsModule } from "@/components/modules/FriendsModule";

export default function FriendsPage() {
  return (
    <DashboardLayout>
      <FriendsModule />
    </DashboardLayout>
  );
}