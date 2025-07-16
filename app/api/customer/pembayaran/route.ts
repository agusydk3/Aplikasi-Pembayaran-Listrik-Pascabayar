import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { authenticateToken } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
  // Authenticate user using JWT token
  const authHeader = request.headers.get("authorization")
  const user = authenticateToken(authHeader)

  if (!user || !user.id_pelanggan) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id_pelanggan = user.id_pelanggan

  try {
    // Dapatkan data pelanggan dan tarif
    const { data: pelangganData, error: pelangganError } = await supabase
      .from("pelanggan")
      .select("id_pelanggan, id_tarif")
      .eq("id_pelanggan", id_pelanggan)
      .single()

    if (pelangganError) throw pelangganError

    // Dapatkan data tarif
    const { data: tarifData, error: tarifError } = await supabase
      .from("tarif")
      .select("id_tarif, daya, tarifperkwh")
      .eq("id_tarif", pelangganData.id_tarif)
      .single()

    if (tarifError) throw tarifError

    // Fetch unpaid bills
    const { data: tagihan_belum_bayar_data, error: tagihanError } = await supabase
      .from("tagihan")
      .select(`
        id_tagihan,
        bulan,
        tahun,
        id_penggunaan,
        jumlah_meter,
        status
      `)
      .eq("id_pelanggan", id_pelanggan)
      .eq("status", "belum_bayar")
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })

    if (tagihanError) throw tagihanError

    // Dapatkan semua ID penggunaan dari tagihan
    const penggunaanIds = tagihan_belum_bayar_data
      .map(t => t.id_penggunaan)
      .filter(id => id !== null) as number[]

    // Dapatkan data penggunaan
    let penggunaanData: any[] = []
    if (penggunaanIds.length > 0) {
      const { data, error: penggunaanError } = await supabase
        .from("penggunaan")
        .select("id_penggunaan, meter_awal, meter_akhir")
        .in("id_penggunaan", penggunaanIds)

      if (penggunaanError) throw penggunaanError
      penggunaanData = data || []
    }

    // Buat map untuk penggunaan untuk akses cepat
    const penggunaanMap = penggunaanData.reduce((acc, p) => {
      acc[p.id_penggunaan] = p
      return acc
    }, {} as Record<number, any>)

    const formattedTagihanBelumBayar = tagihan_belum_bayar_data.map((t) => {
      const penggunaan = t.id_penggunaan ? penggunaanMap[t.id_penggunaan] : null;
      
      return {
        id_tagihan: t.id_tagihan,
        bulan: t.bulan,
        tahun: t.tahun,
        meter_awal: penggunaan?.meter_awal || 0,
        meter_akhir: penggunaan?.meter_akhir || 0,
        jumlah_meter: t.jumlah_meter || 0,
        tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
        daya: tarifData?.daya || 0,
        status: t.status,
      };
    })

    // Fetch payment history
    const { data: pembayaran_data, error: pembayaranError } = await supabase
      .from("pembayaran")
      .select(`
        id_pembayaran,
        id_tagihan,
        bulan_bayar,
        biaya_admin,
        total_bayar,
        tanggal_pembayaran
      `)
      .eq("id_pelanggan", id_pelanggan)
      .order("tanggal_pembayaran", { ascending: false })

    if (pembayaranError) throw pembayaranError

    // Dapatkan semua ID tagihan dari pembayaran
    const tagihanIds = pembayaran_data
      .map(p => p.id_tagihan)
      .filter(id => id !== null) as number[]

    // Dapatkan data tagihan untuk pembayaran
    let tagihanData: any[] = []
    if (tagihanIds.length > 0) {
      const { data, error: tagihanPembayaranError } = await supabase
        .from("tagihan")
        .select("id_tagihan, bulan, tahun")
        .in("id_tagihan", tagihanIds)

      if (tagihanPembayaranError) throw tagihanPembayaranError
      tagihanData = data || []
    }

    // Buat map untuk tagihan untuk akses cepat
    const tagihanMap = tagihanData.reduce((acc, t) => {
      acc[t.id_tagihan] = t
      return acc
    }, {} as Record<number, any>)

    const formattedPembayaranData = pembayaran_data.map((p) => {
      const tagihan = p.id_tagihan ? tagihanMap[p.id_tagihan] : null;
      
      return {
        id_pembayaran: p.id_pembayaran,
        id_tagihan: p.id_tagihan,
        bulan: tagihan?.bulan || 0,
        tahun: tagihan?.tahun || 0,
        bulan_bayar: p.bulan_bayar,
        biaya_admin: p.biaya_admin,
        total_bayar: p.total_bayar,
        tanggal_pembayaran: p.tanggal_pembayaran,
        status: "lunas" // Default status for all payments
      };
    })

    return NextResponse.json({
      tagihan_belum_bayar: formattedTagihanBelumBayar,
      pembayaran_data: formattedPembayaranData,
      debug: {
        pelangganData,
        tarifData
      }
    })
  } catch (error: any) {
    console.error("Error fetching pembayaran data:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
