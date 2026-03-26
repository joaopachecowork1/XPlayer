import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const backend = process.env.CANHOES_API_URL || process.env.NEXT_PUBLIC_CANHOES_API_URL;
  if (!backend) return new NextResponse("CANHOES_API_URL not set", { status: 500 });
  const session = await getServerSession(authOptions);
  const idToken = session?.idToken;
  if (!idToken) return new NextResponse("no id_token in session", { status: 401 });
  const res = await fetch(new URL("/api/me", backend).toString(), {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}