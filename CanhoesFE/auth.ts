// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Estratégia: confiar no campo `isAdmin` do utilizador vindo do Adapter/DB.
 * - Na 1ª autenticação (callback `jwt` com `user`), copiamos user.isAdmin para o token.
 * - Em todos os pedidos seguintes, propagamos `token.isAdmin` para `session.user.isAdmin`.
 * 
 * ADMIN HARDCODED (para desenvolvimento):
 * - joaodinispacheco@gmail.com é SEMPRE admin
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
      console.log("[Auth] JWT callback:", {
        hasAccount: !!account,
        hasIdToken: !!account?.id_token,
        hasUser: !!user,
        tokenEmail: token.email,
      });
      
      // Guarda id_token se precisares de o reenviar ao backend
      if (account && account.id_token) {
        token.idToken = account.id_token;
        console.log("[Auth] idToken saved to JWT");
      }
      
      // Quando `user` vem do Adapter/DB, deve conter `isAdmin`
      if (user) {
        token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }

      // ADMIN HARDCODED: joaodinispacheco@gmail.com é SEMPRE admin
      const userEmail = token.email as string;
      if (userEmail) {
        const adminEmails = ['joaodinispacheco@gmail.com', 'joao.pacheco@canhoes.com'];
        if (adminEmails.some(email => userEmail.toLowerCase().includes(email.split('@')[0]))) {
          token.isAdmin = true;
          console.log("[Auth] Admin access granted for:", userEmail);
        }
      }

      // Garante persistência
      token.isAdmin = Boolean(token.isAdmin);
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      // Opcional: expor idToken se precisares no cliente
      session.idToken = token.idToken;
      console.log("[Auth] Session:", { 
        email: session.user?.email, 
        isAdmin: session.user?.isAdmin,
        hasIdToken: !!session.idToken 
      });
      return session;
    },
  },
};
