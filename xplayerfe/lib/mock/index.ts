/**
 * Mock mode utilities.
 *
 * Activated by setting `NEXT_PUBLIC_MOCK_AUTH=true` in `.env.local`.
 * Hard-guarded behind `NODE_ENV !== 'production'` so mock code
 * never runs in a production deployment.
 *
 * Usage:
 *   NEXT_PUBLIC_MOCK_AUTH=true npm run dev
 */

import type { AuthUser } from "@/contexts/AuthContext";

/** True only in non-production builds when the NEXT_PUBLIC_MOCK_AUTH flag is set. */
export const IS_MOCK_MODE: boolean =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

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
