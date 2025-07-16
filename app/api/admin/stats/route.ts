import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total customers
    const { count: totalPelanggan } = await supabase.from("pelanggan").select("*", { count: "exact", head: true })

    // Get unpaid bills
    const { count: tagihanBelumBayar } = await supabase
      .from("tagihan")
      .select("*", { count: "exact", head: true })
      .eq("status", "belum_bayar")

    // Get current month usage
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const { count: penggunaanBulanIni } = await supabase
      .from("penggunaan")
      .select("*", { count: "exact", head: true })
      .eq("bulan", currentMonth)
      .eq("tahun", currentYear)

    // Get today's payments
    const today = new Date().toISOString().split("T")[0]
    const { count: pembayaranHariIni } = await supabase
      .from("pembayaran")
      .select("*", { count: "exact", head: true })
      .gte("tanggal_pembayaran", today)
      .lt("tanggal_pembayaran", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0])

    return NextResponse.json({
      totalPelanggan: totalPelanggan || 0,
      tagihanBelumBayar: tagihanBelumBayar || 0,
      penggunaanBulanIni: penggunaanBulanIni || 0,
      pembayaranHariIni: pembayaranHariIni || 0,
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 })
  }
}
