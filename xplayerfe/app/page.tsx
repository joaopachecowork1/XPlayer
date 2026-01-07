"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/ui/dashboardlayout";

export default function HomePage() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLogged(!!token);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {!isLogged && (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              You are not logged in. Please login to start tracking sessions.
            </CardContent>
          </Card>
        )}

        {isLogged && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Sessions"
                value="12"
                icon={<Activity />}
              />
              <StatCard
                title="XP"
                value="1,250"
                icon={<Trophy />}
              />
              <StatCard
                title="Streak"
                value="4 days"
                icon={<Flame />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome back 🎮</CardTitle>
              </CardHeader>
              <CardContent>
                Track your gaming sessions, earn XP and keep your streak alive.
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
