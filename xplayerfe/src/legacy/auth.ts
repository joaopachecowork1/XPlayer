import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Minimal NextAuth config for Google sign-in.
 *
 * - Stores Google's id_token in JWT (account.id_token)
 * - Exposes it on the session as session.idToken
 * - Proxy can forward Authorization: Bearer <id_token> to the backend
 */
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "openid email profile",
                    prompt: "consent",
                },
            },
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, account }) {
            if (account?.id_token) {
                (token as any).idToken = account.id_token;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).idToken = (token as any).idToken;
            return session;
        },
    },
};
