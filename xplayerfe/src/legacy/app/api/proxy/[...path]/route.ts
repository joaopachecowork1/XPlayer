import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy to the backend (avoids CORS) + injects Google id_token.
 *
 * Frontend auth: NextAuth (Google).
 * Backend auth: expects Authorization: Bearer <Google id_token>.
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PUT");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "DELETE");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(request, resolvedParams, "PATCH");
}

async function handleProxyRequest(request: NextRequest, params: { path: string[] }, method: string) {
  try {
    // NOTE:
    // - getServerSession() is sometimes flaky in App Route handlers depending on next-auth version.
    // - getToken() reads the JWT directly from cookies and is the most reliable way to access custom fields.
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const idToken = (token as any)?.idToken as string | undefined;

    if (!idToken) {
      return NextResponse.json({ message: "Unauthorized - Please sign in" }, { status: 401 });
    }

    const path = params.path.join("/");
    const backendBase = process.env.XPLAYER_API_URL || "http://localhost:5000";
    const backendUrl = `${backendBase}/api/${path}${request.nextUrl.search}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${idToken}`);

    // Forward content-type so backend can parse JSON or multipart properly.
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      body = await request.text();
    }

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
    });

    // 204 has no body by definition; passing a body causes NextResponse to throw.
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json",
        },
      });
    }

    const responseData = await response.text();
    return new NextResponse(responseData || null, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json({ message: "Internal proxy error" }, { status: 500 });
  }
}
