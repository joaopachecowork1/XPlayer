import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Mock behaviour: accept the payload and return an id.
  // In a real backend, you would persist and return a DB id.
  const id = (body?.clientSessionId as string | undefined) ?? crypto.randomUUID();

  return NextResponse.json(
    {
      id,
      accepted: true,
      received: {
        gameId: body?.gameId,
        gameName: body?.gameName,
        platform: body?.platform,
        startedAt: body?.startedAt,
      },
    },
    { status: 200 }
  );
}
