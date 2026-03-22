import { NextRequest, NextResponse } from "next/server";

const backend =
  process.env.XPLAYER_API_URL ||
  process.env.NEXT_PUBLIC_XPLAYER_API_URL ||
  "http://localhost:5000";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${backend}/uploads/${path}`;

  const res = await fetch(url, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    status: res.status,
    headers: { "content-type": contentType },
  });
}
