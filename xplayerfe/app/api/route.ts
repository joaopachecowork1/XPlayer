import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (email === "admin@example.com" && password === "123456") {
    return NextResponse.json({ token: "fake-jwt-token" })
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth === "Bearer fake-jwt-token") {
    return NextResponse.json({ message: "Protected content" })
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
