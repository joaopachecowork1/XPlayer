import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Mock behaviour: accept the payload.
  // A real implementation would validate, persist, and update user XP/level.
  return NextResponse.json(
    {
      accepted: true,
      received: {
        id: body?.id,
        startedAt: body?.startedAt,
        endedAt: body?.endedAt,
        duration: body?.duration,
        xpEarned: body?.xpEarned,
        gameId: body?.gameId,
        gameName: body?.gameName,
        platform: body?.platform,
      },
    },
    { status: 200 }
  );
}
