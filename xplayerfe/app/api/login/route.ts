import { NextResponse } from "next/server";

/**
 * Mock auth endpoint.
 *
 * Nota: isto é apenas para desbloquear a UI enquanto a autenticação real
 * não está feita.
 */
export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Credential pair de exemplo (podes mudar conforme quiseres)
  if (email === "admin@example.com" && password === "123456") {
    return NextResponse.json({
      token: "fake-jwt-token",
      user: { id: "admin-1", name: "Admin", email },
    });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
