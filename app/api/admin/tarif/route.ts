import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase.from("tarif").select("*").order("id_tarif")

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching tarif:", error)
    return NextResponse.json({ error: "Gagal mengambil data tarif" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    if (action === "create") {
      const { daya, tarifperkwh } = data
      
      // Ensure daya and tarifperkwh are properly converted to numbers
      const dayaValue = typeof daya === 'string' ? parseInt(daya, 10) : Number(daya)
      const tarifValue = typeof tarifperkwh === 'string' ? parseFloat(tarifperkwh) : Number(tarifperkwh)
      
      if (isNaN(dayaValue) || isNaN(tarifValue)) {
        return NextResponse.json({ error: "Nilai daya atau tarif tidak valid" }, { status: 400 })
      }

      const { error } = await supabase.from("tarif").insert({ 
        daya: dayaValue, 
        tarifperkwh: tarifValue 
      })

      if (error) throw error
      return NextResponse.json({ message: "Tarif berhasil ditambahkan!" })
    }

    if (action === "update") {
      const { id_tarif, daya, tarifperkwh } = data
      
      // Ensure daya and tarifperkwh are properly converted to numbers
      const dayaValue = typeof daya === 'string' ? parseInt(daya, 10) : Number(daya)
      const tarifValue = typeof tarifperkwh === 'string' ? parseFloat(tarifperkwh) : Number(tarifperkwh)
      
      if (isNaN(dayaValue) || isNaN(tarifValue)) {
        return NextResponse.json({ error: "Nilai daya atau tarif tidak valid" }, { status: 400 })
      }

      const { error } = await supabase.from("tarif").update({ 
        daya: dayaValue, 
        tarifperkwh: tarifValue 
      }).eq("id_tarif", id_tarif)

      if (error) throw error
      return NextResponse.json({ message: "Tarif berhasil diupdate!" })
    }

    if (action === "delete") {
      const { id_tarif } = data

      // Check if tarif is being used
      const { count } = await supabase
        .from("pelanggan")
        .select("*", { count: "exact", head: true })
        .eq("id_tarif", id_tarif)

      if (count && count > 0) {
        return NextResponse.json(
          { error: "Tarif tidak dapat dihapus karena masih digunakan oleh pelanggan!" },
          { status: 400 },
        )
      }

      const { error } = await supabase.from("tarif").delete().eq("id_tarif", id_tarif)

      if (error) throw error
      return NextResponse.json({ message: "Tarif berhasil dihapus!" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in tarif API:", error)
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      // Check for Supabase specific errors
      if (error.message.includes("duplicate")) {
        return NextResponse.json({ error: "Tarif dengan daya tersebut sudah ada" }, { status: 400 })
      }
      
      // Return the actual error message for better debugging
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
