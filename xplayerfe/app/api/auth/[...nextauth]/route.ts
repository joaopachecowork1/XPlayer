import NextAuth from "next-auth";
import { authOptions } from "@/auth";

// Single source of truth for NextAuth configuration.
// - Ensures Google `id_token` is persisted in JWT as `token.idToken`
// - Exposes it on the session as `session.idToken`
// - Backend expects `Authorization: Bearer <id_token>`

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
