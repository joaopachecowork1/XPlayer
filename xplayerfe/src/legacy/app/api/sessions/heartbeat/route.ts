import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Mock behaviour: always accept.
  return NextResponse.json(
    {
      accepted: true,
      received: {
        id: body?.id,
        at: body?.at,
      },
    },
    { status: 200 }
  );
}
