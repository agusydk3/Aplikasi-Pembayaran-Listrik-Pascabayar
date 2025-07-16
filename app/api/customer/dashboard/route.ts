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
    // Fetch customer data
    const { data: customerData, error: customerError } = await supabase
      .from("pelanggan")
      .select("*, id_tarif, alamat")
      .eq("id_pelanggan", id_pelanggan)
      .single()

    if (customerError) throw customerError

    // Fetch tarif data
    const { data: tarifData, error: tarifError } = await supabase
      .from("tarif")
      .select("id_tarif, daya, tarifperkwh")
      .eq("id_tarif", customerData.id_tarif)
      .single()

    if (tarifError) throw tarifError

    // Fetch statistics
    const { count: total_penggunaan, error: penggunaanError } = await supabase
      .from("penggunaan")
      .select("*", { count: "exact" })
      .eq("id_pelanggan", id_pelanggan)

    if (penggunaanError) throw penggunaanError

    const { count: tagihan_belum_bayar, error: tagihanBelumBayarError } = await supabase
      .from("tagihan")
      .select("*", { count: "exact" })
      .eq("id_pelanggan", id_pelanggan)
      .eq("status", "belum_bayar")

    if (tagihanBelumBayarError) throw tagihanBelumBayarError

    const { count: total_pembayaran, error: pembayaranError } = await supabase
      .from("pembayaran")
      .select("*", { count: "exact" })
      .eq("id_pelanggan", id_pelanggan)

    if (pembayaranError) throw pembayaranError

    const { data: total_dibayar_data, error: totalDibayarError } = await supabase
      .from("pembayaran")
      .select("total_bayar")
      .eq("id_pelanggan", id_pelanggan)

    if (totalDibayarError) throw totalDibayarError
    const total_dibayar = total_dibayar_data?.reduce((sum, item) => sum + item.total_bayar, 0) || 0

    // Fetch current month usage
    const bulan_ini = new Date().getMonth() + 1
    const tahun_ini = new Date().getFullYear()
    const { data: penggunaan_bulan_ini, error: penggunaanBulanIniError } = await supabase
      .from("penggunaan")
      .select("id_penggunaan, meter_awal, meter_akhir, bulan, tahun")
      .eq("id_pelanggan", id_pelanggan)
      .eq("bulan", bulan_ini)
      .eq("tahun", tahun_ini)
      .single()

    if (penggunaanBulanIniError && penggunaanBulanIniError.code !== "PGRST116") {
      // PGRST116 means no rows found
      throw penggunaanBulanIniError
    }

    // Fetch latest unpaid bill
    const { data: tagihan_terbaru, error: tagihanTerbaruError } = await supabase
      .from("tagihan")
      .select("id_tagihan, bulan, tahun, id_penggunaan, jumlah_meter, status")
      .eq("id_pelanggan", id_pelanggan)
      .eq("status", "belum_bayar")
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })
      .limit(1)
      .single()

    if (tagihanTerbaruError && tagihanTerbaruError.code !== "PGRST116") {
      throw tagihanTerbaruError
    }

    // Fetch penggunaan data for tagihan if available
    let penggunaan_tagihan = null
    if (tagihan_terbaru?.id_penggunaan) {
      const { data, error: penggunaanTagihanError } = await supabase
        .from("penggunaan")
        .select("meter_awal, meter_akhir")
        .eq("id_penggunaan", tagihan_terbaru.id_penggunaan)
        .single()

      if (penggunaanTagihanError && penggunaanTagihanError.code !== "PGRST116") {
        throw penggunaanTagihanError
      }
      
      penggunaan_tagihan = data
    }

    const formattedPenggunaanBulanIni = penggunaan_bulan_ini
      ? {
          meter_awal: penggunaan_bulan_ini.meter_awal,
          meter_akhir: penggunaan_bulan_ini.meter_akhir,
          tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
        }
      : null

    const formattedTagihanTerbaru = tagihan_terbaru
      ? {
          id_tagihan: tagihan_terbaru.id_tagihan,
          bulan: tagihan_terbaru.bulan,
          tahun: tagihan_terbaru.tahun,
          meter_awal: penggunaan_tagihan?.meter_awal || 0,
          meter_akhir: penggunaan_tagihan?.meter_akhir || 0,
          jumlah_meter: tagihan_terbaru.jumlah_meter || 0,
          tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
          status: tagihan_terbaru.status,
        }
      : null

    return NextResponse.json({
      stats: {
        total_penggunaan: total_penggunaan || 0,
        tagihan_belum_bayar: tagihan_belum_bayar || 0,
        total_pembayaran: total_pembayaran || 0,
        total_dibayar: total_dibayar,
      },
      penggunaan_bulan_ini: formattedPenggunaanBulanIni,
      tagihan_terbaru: formattedTagihanTerbaru,
      customer: {
        id_pelanggan: customerData.id_pelanggan,
        nama_pelanggan: customerData.nama_pelanggan,
        username: customerData.username,
        nomor_kwh: customerData.nomor_kwh,
        alamat: customerData.alamat || "",
        daya: tarifData?.daya || 0,
        tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
      }
    })
  } catch (error: any) {
    console.error("Error fetching customer dashboard data:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
