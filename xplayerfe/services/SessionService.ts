const API_URL = "http://localhost:5000";

export type CreateSessionRequest = {
  gameExternalId: number;
  gameName: string;
};

export async function createSession(
  token: string,
  data: CreateSessionRequest
) {
  const res = await fetch(`${API_URL}/sessions/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  return res.json();
}
