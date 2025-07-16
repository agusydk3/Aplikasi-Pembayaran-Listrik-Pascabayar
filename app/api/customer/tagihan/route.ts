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
    // Dapatkan data tagihan
    const { data: tagihan_data, error: tagihanError } = await supabase
      .from("tagihan")
      .select(`
        id_tagihan,
        id_penggunaan,
        id_pelanggan,
        bulan,
        tahun,
        jumlah_meter,
        status
      `)
      .eq("id_pelanggan", id_pelanggan)
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })

    if (tagihanError) throw tagihanError

    // Dapatkan data pelanggan
    const { data: pelangganData, error: pelangganError } = await supabase
      .from("pelanggan")
      .select(`
        id_pelanggan,
        id_tarif
      `)
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

    // Dapatkan semua ID penggunaan dari tagihan
    const penggunaanIds = tagihan_data
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

    // Format data tagihan
    const formattedTagihan = tagihan_data.map(t => {
      const penggunaan = t.id_penggunaan ? penggunaanMap[t.id_penggunaan] : null
      
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
      }
    })

    return NextResponse.json({ 
      tagihan: formattedTagihan,
      debug: {
        tagihanCount: tagihan_data.length,
        penggunaanCount: penggunaanData.length,
        pelangganData: pelangganData,
        tarifData: tarifData
      }
    })
  } catch (error: any) {
    console.error("Error fetching tagihan data:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
