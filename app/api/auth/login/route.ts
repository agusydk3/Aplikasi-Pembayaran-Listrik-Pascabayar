import { type NextRequest, NextResponse } from "next/server"
import { loginUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 })
    }

    const user = await loginUser(username, password)

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(user)

    return NextResponse.json({ 
      user,
      token
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
