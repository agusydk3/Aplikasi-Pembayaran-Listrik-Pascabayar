"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Zap, User, LogOut, TrendingUp, BarChart3 } from "lucide-react"

interface PenggunaanData {
  id_penggunaan: number
  bulan: number
  tahun: number
  meter_awal: number
  meter_akhir: number
  tarifperkwh: number
}

interface CustomerData {
  nama_pelanggan: string
}

const bulanNama = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export default function CustomerPenggunaan() {
  const router = useRouter()
  const [user, setUser] = useState<CustomerData | null>(null)
  const [penggunaanData, setPenggunaanData] = useState<PenggunaanData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.level !== "customer") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchPenggunaanData()
  }, []) // Remove router dependency

  const fetchPenggunaanData = async () => {
    try {
      const tokenData = localStorage.getItem("token")
      if (!tokenData) {
        router.push("/login")
        return
      }
      
      const response = await fetch("/api/customer/penggunaan", {
        headers: {
          'Authorization': `Bearer ${tokenData}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPenggunaanData(data.penggunaan)
      } else {
        // Handle token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Error fetching penggunaan data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) return null

  // Calculate statistics
  const totalPemakaian = penggunaanData.reduce((sum, p) => sum + (p.meter_akhir - p.meter_awal), 0)
  const rataRataPerBulan = penggunaanData.length > 0 ? totalPemakaian / penggunaanData.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Portal Pelanggan</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">
                <User className="inline h-4 w-4 mr-2" />
                {user.nama_pelanggan}
              </span>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white flex items-center"
          >
            <Zap className="h-8 w-8 mr-3" />
            Riwayat Penggunaan Listrik
          </motion.h1>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            onClick={() => router.push("/customer/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </div>

        {/* Usage History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Data Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold p-3">Periode</th>
                      <th className="text-right text-white font-semibold p-3">Meter Awal</th>
                      <th className="text-right text-white font-semibold p-3">Meter Akhir</th>
                      <th className="text-right text-white font-semibold p-3">Pemakaian (kWh)</th>
                      <th className="text-right text-white font-semibold p-3">Tarif per kWh</th>
                      <th className="text-right text-white font-semibold p-3">Estimasi Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penggunaanData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-white/60 py-8">
                          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          Belum ada data penggunaan
                        </td>
                      </tr>
                    ) : (
                      penggunaanData.map((data, index) => {
                        const pemakaian = data.meter_akhir - data.meter_awal
                        const estimasiBiaya = pemakaian * data.tarifperkwh
                        return (
                          <motion.tr
                            key={data.id_penggunaan}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="p-3 text-white">
                              <div className="font-semibold">{bulanNama[data.bulan]}</div>
                              <div className="text-blue-200 text-sm">{data.tahun}</div>
                            </td>
                            <td className="text-right p-3 text-white">{data.meter_awal.toLocaleString("id-ID")}</td>
                            <td className="text-right p-3 text-white">{data.meter_akhir.toLocaleString("id-ID")}</td>
                            <td className="text-right p-3 text-white font-semibold">
                              {pemakaian.toLocaleString("id-ID")}
                            </td>
                            <td className="text-right p-3 text-white">
                              {data.tarifperkwh > 0 
                                ? `Rp ${data.tarifperkwh.toLocaleString("id-ID")}` 
                                : "Data tidak tersedia"}
                            </td>
                            <td className="text-right p-3 text-white font-bold">
                              {estimasiBiaya > 0 
                                ? `Rp ${estimasiBiaya.toLocaleString("id-ID")}` 
                                : "Data tidak tersedia"}
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage Statistics */}
        {penggunaanData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Statistik Penggunaan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Total Pemakaian:</span>
                    <span className="text-white font-semibold">{totalPemakaian.toLocaleString("id-ID")} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Rata-rata per Bulan:</span>
                    <span className="text-white font-semibold">{rataRataPerBulan.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-600/20 p-3 rounded-lg">
                    <span className="text-white font-semibold">Jumlah Periode:</span>
                    <span className="text-white font-bold">{penggunaanData.length} bulan</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
