"use client";

import { useEffect, useState } from "react";
import { Activity, Flame, Trophy, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ThemeProvider } from "@/components/ui/themeprovider";
import { AuthWrapper } from "@/components/auth-wrapper";

export default function HomePage() {
  

  return (
    <ThemeProvider>
      <AuthWrapper>
        <DashboardLayout></DashboardLayout>
      </AuthWrapper>
    </ThemeProvider>
  );
}
