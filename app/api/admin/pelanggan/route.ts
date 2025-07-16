import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const { data: pelangganData, error } = await supabase
      .from("pelanggan")
      .select(`
        *,
        tarif:id_tarif (
          id_tarif,
          daya,
          tarifperkwh
        )
      `)
      .order("id_pelanggan")

    if (error) throw error

    const { data: tarifList, error: tarifError } = await supabase.from("tarif").select("*").order("daya")

    if (tarifError) throw tarifError

    return NextResponse.json({ pelangganData, tarifList })
  } catch (error) {
    console.error("Error fetching pelanggan:", error)
    return NextResponse.json({ error: "Gagal mengambil data pelanggan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (action === "create") {
      const { username, password, nomor_kwh, nama_pelanggan, alamat, id_tarif } = data
      const hashedPassword = await bcrypt.hash(password, 10)

      const { error } = await supabase.from("pelanggan").insert({
        username,
        password: hashedPassword,
        nomor_kwh,
        nama_pelanggan,
        alamat,
        id_tarif,
      })

      if (error) throw error
      return NextResponse.json({ message: "Pelanggan berhasil ditambahkan!" })
    }

    if (action === "update") {
      const { id_pelanggan, username, nomor_kwh, nama_pelanggan, alamat, id_tarif } = data

      const { error } = await supabase
        .from("pelanggan")
        .update({ username, nomor_kwh, nama_pelanggan, alamat, id_tarif })
        .eq("id_pelanggan", id_pelanggan)

      if (error) throw error
      return NextResponse.json({ message: "Data pelanggan berhasil diupdate!" })
    }

    if (action === "delete") {
      const { id_pelanggan } = data

      // Delete related records first
      await supabase.from("pembayaran").delete().eq("id_pelanggan", id_pelanggan)
      await supabase.from("tagihan").delete().eq("id_pelanggan", id_pelanggan)
      await supabase.from("penggunaan").delete().eq("id_pelanggan", id_pelanggan)

      const { error } = await supabase.from("pelanggan").delete().eq("id_pelanggan", id_pelanggan)

      if (error) throw error
      return NextResponse.json({ message: "Pelanggan berhasil dihapus!" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in pelanggan API:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
