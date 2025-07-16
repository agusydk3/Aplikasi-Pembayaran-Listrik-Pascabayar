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
    // Dapatkan data penggunaan
    const { data: penggunaan_data, error: penggunaanError } = await supabase
      .from("penggunaan")
      .select("*")
      .eq("id_pelanggan", id_pelanggan)
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })

    if (penggunaanError) throw penggunaanError

    // Dapatkan data pelanggan
    const { data: pelangganData, error: pelangganError } = await supabase
      .from("pelanggan")
      .select("id_pelanggan, id_tarif, nama_pelanggan, username, nomor_kwh, alamat")
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

    // Format data penggunaan
    const formattedPenggunaan = penggunaan_data.map((p) => ({
      id_penggunaan: p.id_penggunaan,
      bulan: p.bulan,
      tahun: p.tahun,
      meter_awal: p.meter_awal,
      meter_akhir: p.meter_akhir,
      tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
    }))

    return NextResponse.json({ 
      penggunaan: formattedPenggunaan,
      customer: {
        id_pelanggan: pelangganData.id_pelanggan,
        nama_pelanggan: pelangganData.nama_pelanggan,
        username: pelangganData.username,
        nomor_kwh: pelangganData.nomor_kwh,
        alamat: pelangganData.alamat || "",
        daya: tarifData?.daya || 0,
        tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
      },
      debug: {
        penggunaanCount: penggunaan_data.length,
        pelangganData,
        tarifData
      }
    })
  } catch (error: any) {
    console.error("Error fetching penggunaan data:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
