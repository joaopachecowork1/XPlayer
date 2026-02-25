// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Estratégia: confiar no campo `isAdmin` do utilizador vindo do Adapter/DB.
 * - Na 1ª autenticação (callback `jwt` com `user`), copiamos user.isAdmin para o token.
 * - Em todos os pedidos seguintes, propagamos `token.isAdmin` para `session.user.isAdmin`.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Ensure we receive an OpenID Connect id_token (needed by the backend)
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Guarda id_token se precisares de o reenviar ao backend
      if (account && account.id_token) {
        (token as any).idToken = account.id_token;
      }
      // Quando `user` vem do Adapter/DB, deve conter `isAdmin`
      if (user) {
        (token as any).isAdmin = Boolean((user as any).isAdmin);
      }
      // Garante persistência
      (token as any).isAdmin = Boolean((token as any).isAdmin);
      return token;
    },
    async session({ session, token }) {
      (session.user as any).isAdmin = Boolean((token as any).isAdmin);
      // Opcional: expor idToken se precisares no cliente
      (session as any).idToken = (token as any).idToken;
      return session;
    },
  },
};
