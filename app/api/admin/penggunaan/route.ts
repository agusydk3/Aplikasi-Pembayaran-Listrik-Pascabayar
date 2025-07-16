import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchCustomer = searchParams.get("search_customer")

    if (searchCustomer) {
      const { data: customers, error } = await supabase
        .from("pelanggan")
        .select("id_pelanggan, nama_pelanggan, nomor_kwh")
        .ilike("nama_pelanggan", `%${searchCustomer}%`)
        .order("nama_pelanggan")
        .limit(10)

      if (error) throw error
      return NextResponse.json(customers)
    }

    const { data: penggunaanData, error } = await supabase
      .from("penggunaan")
      .select(`
        *,
        pelanggan:id_pelanggan (
          nama_pelanggan,
          nomor_kwh
        )
      `)
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })

    if (error) throw error

    return NextResponse.json({ penggunaanData })
  } catch (error) {
    console.error("Error fetching penggunaan:", error)
    return NextResponse.json({ error: "Gagal mengambil data penggunaan" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (action === "create") {
      const { id_pelanggan, periode, meter_awal, meter_akhir } = data
      const date = new Date(periode + "-01")
      const bulan = date.getMonth() + 1
      const tahun = date.getFullYear()

      // Check if record already exists
      const { count } = await supabase
        .from("penggunaan")
        .select("*", { count: "exact", head: true })
        .eq("id_pelanggan", id_pelanggan)
        .eq("bulan", bulan)
        .eq("tahun", tahun)

      if (count && count > 0) {
        return NextResponse.json(
          { error: "Data penggunaan untuk pelanggan dan periode ini sudah ada!" },
          { status: 400 },
        )
      }

      const { data: penggunaanResult, error: penggunaanError } = await supabase
        .from("penggunaan")
        .insert({
          id_pelanggan,
          bulan,
          tahun,
          meter_awal,
          meter_akhir,
        })
        .select()
        .single()

      if (penggunaanError) throw penggunaanError

      // Auto generate tagihan
      const jumlah_meter = meter_akhir - meter_awal
      const { error: tagihanError } = await supabase.from("tagihan").insert({
        id_penggunaan: penggunaanResult.id_penggunaan,
        id_pelanggan,
        bulan,
        tahun,
        jumlah_meter,
      })

      if (tagihanError) throw tagihanError

      return NextResponse.json({ message: "Data penggunaan berhasil ditambahkan dan tagihan otomatis dibuat!" })
    }

    if (action === "update") {
      const { id_penggunaan, meter_awal, meter_akhir } = data

      const { error } = await supabase
        .from("penggunaan")
        .update({ meter_awal, meter_akhir })
        .eq("id_penggunaan", id_penggunaan)

      if (error) throw error

      // Update tagihan
      const jumlah_meter = meter_akhir - meter_awal
      await supabase.from("tagihan").update({ jumlah_meter }).eq("id_penggunaan", id_penggunaan)

      return NextResponse.json({ message: "Data penggunaan berhasil diupdate!" })
    }

    if (action === "delete") {
      const { id_penggunaan } = data

      // Delete tagihan first
      await supabase.from("tagihan").delete().eq("id_penggunaan", id_penggunaan)

      const { error } = await supabase.from("penggunaan").delete().eq("id_penggunaan", id_penggunaan)

      if (error) throw error
      return NextResponse.json({ message: "Data penggunaan berhasil dihapus!" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in penggunaan API:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
