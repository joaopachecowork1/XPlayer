import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(_req: NextRequest) {
  const backend = process.env.XPLAYER_API_URL || process.env.NEXT_PUBLIC_XPLAYER_API_URL;
  if (!backend) return new NextResponse("XPLAYER_API_URL not set", { status: 500 });
  const session = await getServerSession(authOptions as any);
  const idToken = (session as any)?.idToken as string | undefined;
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