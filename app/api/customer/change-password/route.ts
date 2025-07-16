import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  const { current_password, new_password, id_pelanggan } = await request.json()

  if (!id_pelanggan || !current_password || !new_password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  try {
    // Fetch current hashed password from Supabase
    const { data: userData, error: fetchError } = await supabase
      .from("pelanggan")
      .select("password")
      .eq("id_pelanggan", id_pelanggan)
      .single()

    if (fetchError) {
      console.error("Error fetching user:", fetchError.message)
      return NextResponse.json({ error: "User not found or database error" }, { status: 500 })
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Compare current password with stored hashed password
    const isPasswordValid = await bcrypt.compare(current_password, userData.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password lama tidak sesuai!" }, { status: 401 })
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10)

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from("pelanggan")
      .update({ password: hashedNewPassword })
      .eq("id_pelanggan", id_pelanggan)

    if (updateError) {
      console.error("Error updating password:", updateError.message)
      return NextResponse.json({ error: "Gagal memperbarui password!" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password berhasil diperbarui!" }, { status: 200 })
  } catch (error: any) {
    console.error("Server error:", error.message)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
