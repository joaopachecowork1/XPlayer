// Routes through the Next.js proxy (/api/proxy/*) so that the backend is
// never called directly from the browser. This avoids CORS issues in all
// environments (local development, Vercel, mobile data, etc.).

export type CreateSessionRequest = {
  gameExternalId: number;
  gameName: string;
};

// The token argument is kept for backwards-compatibility but is no longer
// injected manually – the proxy route handler reads it from the NextAuth
// session and forwards it to the backend automatically.
export async function createSession(token: string, data: CreateSessionRequest) {
  const res = await fetch(`/api/proxy/sessions/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar sessão");
  }

  return res.json();
}