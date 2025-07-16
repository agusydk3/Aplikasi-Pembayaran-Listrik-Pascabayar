import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "belum_bayar"

    let query = supabase
      .from("tagihan")
      .select(`
        *,
        pelanggan:id_pelanggan (
          nama_pelanggan,
          nomor_kwh,
          tarif:id_tarif (
            daya,
            tarifperkwh
          )
        ),
        penggunaan:id_penggunaan (
          meter_awal,
          meter_akhir
        )
      `)
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })

    if (filter === "belum_bayar") {
      query = query.eq("status", "belum_bayar")
    } else if (filter === "sudah_bayar") {
      query = query.eq("status", "sudah_bayar")
    }

    const { data: tagihanData, error } = await query

    if (error) throw error

    // Get statistics
    const { data: allTagihan, error: statsError } = await supabase.from("tagihan").select("status")

    if (statsError) throw statsError

    const belumBayarCount = allTagihan?.filter((t) => t.status === "belum_bayar").length || 0
    const sudahBayarCount = allTagihan?.filter((t) => t.status === "sudah_bayar").length || 0
    const totalTagihanCount = allTagihan?.length || 0

    return NextResponse.json({
      tagihanData,
      stats: {
        belumBayarCount,
        sudahBayarCount,
        totalTagihanCount,
      },
    })
  } catch (error) {
    console.error("Error fetching tagihan:", error)
    return NextResponse.json({ error: "Gagal mengambil data tagihan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (action === "update") {
      const { id_tagihan, status } = data

      const { error } = await supabase.from("tagihan").update({ status }).eq("id_tagihan", id_tagihan)

      if (error) throw error
      return NextResponse.json({ message: "Status tagihan berhasil diupdate!" })
    }

    if (action === "delete") {
      const { id_tagihan } = data

      // Delete related pembayaran first
      await supabase.from("pembayaran").delete().eq("id_tagihan", id_tagihan)

      const { error } = await supabase.from("tagihan").delete().eq("id_tagihan", id_tagihan)

      if (error) throw error
      return NextResponse.json({ message: "Tagihan berhasil dihapus!" })
    }

    if (action === "bayar") {
      const { id_tagihan, id_pelanggan, bulan_bayar, total_bayar, biaya_admin } = data

      // Update status tagihan
      const { error: updateError } = await supabase
        .from("tagihan")
        .update({ status: "sudah_bayar" })
        .eq("id_tagihan", id_tagihan)

      if (updateError) throw updateError

      // Insert pembayaran
      const { error: insertError } = await supabase.from("pembayaran").insert({
        id_tagihan,
        id_pelanggan,
        bulan_bayar,
        biaya_admin,
        total_bayar,
      })

      if (insertError) throw insertError

      return NextResponse.json({ message: "Pembayaran berhasil diproses!" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in tagihan API:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
