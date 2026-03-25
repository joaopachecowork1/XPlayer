/**
 * Mock mode utilities.
 *
 * Enabled by default in development so the app works without a running backend
 * or Google OAuth credentials. Disable explicitly with NEXT_PUBLIC_MOCK_AUTH=false.
 *
 * In production this is always false — mock code never runs in deployed builds.
 *
 * Usage (dev, mock ON — default):
 *   npm run dev
 *
 * Usage (dev, mock OFF — needs real backend + Google OAuth):
 *   NEXT_PUBLIC_MOCK_AUTH=false npm run dev
 */

import type { AuthUser } from "@/contexts/AuthContext";

/** True in non-production builds unless explicitly disabled with NEXT_PUBLIC_MOCK_AUTH=false. */
export const IS_MOCK_MODE: boolean =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MOCK_AUTH !== "false";

/**
 * Mock admin user injected into AuthContext when mock mode is active.
 * Role: admin — has access to all protected pages and the admin panel.
 */
export const MOCK_AUTH_USER: AuthUser = {
  id: "mock-admin-001",
  email: "admin@dev.local",
  name: "Dev Admin",
  isAdmin: true,
};
