// Usa variáveis de ambiente para o URL da API. 
// Cria um ficheiro .env.local na raiz do frontend e adiciona: NEXT_PUBLIC_API_URL=http://localhost:5000
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type CreateSessionRequest = {
  gameExternalId: number;
  gameName: string;
};

// Removemos a necessidade de passar o token se usares o authFetch, 
// mas mantemos o token como argumento caso não o estejas a usar.
export async function createSession(token: string, data: CreateSessionRequest) {
  const res = await fetch(`${API_URL}/api/sessions/start`, { // Corrigido para garantir que aponta para a rota correta do BE
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar sessão");
  }

  return res.json();
}