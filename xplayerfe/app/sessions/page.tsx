"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { SessionsModule } from "@/components/modules/SessionsModule";

export default function SessionsPage() {
    return (
        <DashboardLayout>
            <SessionsModule />
        </DashboardLayout>
    );
}