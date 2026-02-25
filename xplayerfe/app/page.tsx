"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const router = useRouter();
  const { isLogged, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(isLogged ? "/dashboard" : "/login");
  }, [loading, isLogged, router]);

  return null;
}
