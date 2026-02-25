"use client";

// Back-compat re-export.
// Auth is now provided via a single app-level provider (contexts/AuthContext)
// to avoid N concurrent /me requests when multiple components need auth.

export { useAuth, type AuthUser } from "@/contexts/AuthContext";
