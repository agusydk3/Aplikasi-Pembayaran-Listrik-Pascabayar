"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  ArrowLeft,
  FileText,
  User,
  Zap,
  LogOut,
  Calculator,
  Info,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react"

interface TagihanData {
  id_tagihan: number
  bulan: number
  tahun: number
  meter_awal: number
  meter_akhir: number
  tarifperkwh: number
  daya: number
  jumlah_meter: number
  status: "belum_bayar" | "sudah_bayar"
}

interface CustomerData {
  nama_pelanggan: string
  nomor_kwh: string
  username: string
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

export default function CustomerTagihan() {
  const router = useRouter()
  const [user, setUser] = useState<CustomerData | null>(null)
  const [tagihanData, setTagihanData] = useState<TagihanData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanData | null>(null)
  const [showDetail, setShowDetail] = useState(false)

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
    fetchTagihanData()
  }, []) // Remove router dependency

  const fetchTagihanData = async () => {
    try {
      const tokenData = localStorage.getItem("token")
      if (!tokenData) {
        router.push("/login")
        return
      }
      
      const response = await fetch("/api/customer/tagihan", {
        headers: {
          'Authorization': `Bearer ${tokenData}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTagihanData(data.tagihan)
      } else {
        // Handle token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Error fetching tagihan data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const openDetailModal = (tagihan: TagihanData) => {
    setSelectedTagihan(tagihan)
    setShowDetail(true)
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
  const belumBayar = tagihanData.filter((t) => t.status === "belum_bayar").length
  const sudahBayar = tagihanData.filter((t) => t.status === "sudah_bayar").length
  const totalPemakaian = tagihanData.reduce((sum, t) => sum + (t.meter_akhir - t.meter_awal), 0)
  const totalBiaya = tagihanData.reduce((sum, t) => {
    const pemakaian = t.meter_akhir - t.meter_awal
    return sum + pemakaian * t.tarifperkwh + 2500
  }, 0)
  const rataRataPemakaian = tagihanData.length > 0 ? totalPemakaian / tagihanData.length : 0

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
            <FileText className="h-8 w-8 mr-3" />
            Tagihan Listrik
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

       

        {/* Bills Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Riwayat Tagihan
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
                      <th className="text-right text-white font-semibold p-3">Biaya Listrik</th>
                      <th className="text-right text-white font-semibold p-3">Biaya Admin</th>
                      <th className="text-right text-white font-semibold p-3">Total Bayar</th>
                      <th className="text-center text-white font-semibold p-3">Status</th>
                      <th className="text-center text-white font-semibold p-3">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagihanData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-white/60 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          Belum ada tagihan
                        </td>
                      </tr>
                    ) : (
                      tagihanData.map((tagihan, index) => {
                        // Jika meter_awal dan meter_akhir tersedia, gunakan itu
                        // Jika tidak, gunakan jumlah_meter yang tersedia di database
                        const meterAwalTersedia = tagihan.meter_awal > 0;
                        const meterAkhirTersedia = tagihan.meter_akhir > 0;
                        const pemakaian = meterAwalTersedia && meterAkhirTersedia 
                          ? tagihan.meter_akhir - tagihan.meter_awal 
                          : tagihan.jumlah_meter;
                        const biayaListrik = pemakaian * tagihan.tarifperkwh;
                        const biayaAdmin = 2500;
                        const totalBayar = biayaListrik + biayaAdmin;

                        return (
                          <motion.tr
                            key={tagihan.id_tagihan}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="p-3">
                              <div className="text-white font-semibold">{bulanNama[tagihan.bulan]}</div>
                              <div className="text-blue-200 text-sm">{tagihan.tahun}</div>
                            </td>
                            <td className="text-right text-white p-3">
                              {meterAwalTersedia ? tagihan.meter_awal.toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="text-right text-white p-3">
                              {meterAkhirTersedia ? tagihan.meter_akhir.toLocaleString("id-ID") : "-"}
                            </td>
                            <td className="text-right text-white font-semibold p-3">
                              {pemakaian.toLocaleString("id-ID")}
                            </td>
                            <td className="text-right text-white p-3">
                              {tagihan.tarifperkwh > 0 
                                ? `Rp ${tagihan.tarifperkwh.toLocaleString("id-ID")}`
                                : "Data tidak tersedia"}
                            </td>
                            <td className="text-right text-white p-3">
                              {biayaListrik > 0 
                                ? `Rp ${biayaListrik.toLocaleString("id-ID")}`
                                : "Data tidak tersedia"}
                            </td>
                            <td className="text-right text-white p-3">Rp {biayaAdmin.toLocaleString("id-ID")}</td>
                            <td className="text-right text-white font-bold p-3">
                              Rp {totalBayar.toLocaleString("id-ID")}
                            </td>
                            <td className="text-center p-3">
                              {tagihan.status === "belum_bayar" ? (
                                <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Belum Bayar
                                </Badge>
                              ) : (
                                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Sudah Bayar
                                </Badge>
                              )}
                            </td>
                            <td className="text-center p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20 bg-transparent"
                                onClick={() => openDetailModal(tagihan)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
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

        {/* Statistics */}
        {tagihanData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Statistik Tagihan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h6 className="text-white font-semibold mb-4">Status Pembayaran</h6>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-200">Belum Dibayar:</span>
                        <span className="text-white font-semibold">{belumBayar} tagihan</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-200">Sudah Dibayar:</span>
                        <span className="text-white font-semibold">{sudahBayar} tagihan</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-600/20 p-3 rounded-lg">
                        <span className="text-white font-semibold">Total Tagihan:</span>
                        <span className="text-white font-bold">{tagihanData.length} tagihan</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-white font-semibold mb-4">Ringkasan Pemakaian</h6>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Total Pemakaian:</span>
                        <span className="text-white font-semibold">{totalPemakaian.toLocaleString("id-ID")} kWh</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Rata-rata/Bulan:</span>
                        <span className="text-white font-semibold">{rataRataPemakaian.toFixed(1)} kWh</span>
                      </div>
                      <div className="flex justify-between items-center bg-yellow-600/20 p-3 rounded-lg">
                        <span className="text-white font-semibold">Total Biaya:</span>
                        <span className="text-white font-bold">Rp {totalBiaya.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Detail Tagihan - {selectedTagihan && `${bulanNama[selectedTagihan.bulan]} ${selectedTagihan.tahun}`}
            </DialogTitle>
          </DialogHeader>
          {selectedTagihan && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="text-white font-semibold mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informasi Pelanggan
                  </h6>
                  <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Nama Pelanggan:</span>
                      <span className="text-white">{user.nama_pelanggan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Nomor KWH:</span>
                      <span className="text-white">{user.nomor_kwh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Daya:</span>
                      <span className="text-white">{selectedTagihan.daya}VA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Periode:</span>
                      <span className="text-white">
                        {bulanNama[selectedTagihan.bulan]} {selectedTagihan.tahun}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h6 className="text-white font-semibold mb-3 flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Rincian Tagihan
                  </h6>
                  <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                    {selectedTagihan.meter_awal > 0 && selectedTagihan.meter_akhir > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Meter Awal:</span>
                          <span className="text-white">{selectedTagihan.meter_awal.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Meter Akhir:</span>
                          <span className="text-white">{selectedTagihan.meter_akhir.toLocaleString("id-ID")}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-slate-300">Jumlah Meter:</span>
                        <span className="text-white">{selectedTagihan.jumlah_meter.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-300">Pemakaian:</span>
                      <span className="text-white">
                        {(selectedTagihan.meter_awal > 0 && selectedTagihan.meter_akhir > 0 
                          ? selectedTagihan.meter_akhir - selectedTagihan.meter_awal 
                          : selectedTagihan.jumlah_meter).toLocaleString("id-ID")} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Tarif per kWh:</span>
                      <span className="text-white">
                        {selectedTagihan.tarifperkwh > 0 
                          ? `Rp ${selectedTagihan.tarifperkwh.toLocaleString("id-ID")}`
                          : "Data tidak tersedia"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h6 className="text-white font-semibold mb-4 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Rincian Biaya
                </h6>
                {(() => {
                  const pemakaian = selectedTagihan.meter_awal > 0 && selectedTagihan.meter_akhir > 0
                    ? selectedTagihan.meter_akhir - selectedTagihan.meter_awal
                    : selectedTagihan.jumlah_meter;
                  const biayaListrik = pemakaian * selectedTagihan.tarifperkwh;
                  const biayaAdmin = 2500;
                  const totalBayar = biayaListrik + biayaAdmin;

                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Biaya Pemakaian Listrik:</span>
                        <span className="text-white">
                          {pemakaian.toLocaleString("id-ID")} kWh × 
                          {selectedTagihan.tarifperkwh > 0 
                            ? ` Rp ${selectedTagihan.tarifperkwh.toLocaleString("id-ID")} =`
                            : " (Tarif tidak tersedia) ="}
                          <strong className="ml-2">
                            {biayaListrik > 0 
                              ? `Rp ${biayaListrik.toLocaleString("id-ID")}`
                              : "Data tidak tersedia"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Biaya Admin:</span>
                        <span className="text-white font-semibold">Rp {biayaAdmin.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between items-center bg-green-600/20 p-3 rounded-lg">
                        <span className="text-white font-semibold">Total yang harus dibayar:</span>
                        <span className="text-white font-bold text-xl">Rp {totalBayar.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="bg-blue-600/20 p-4 rounded-lg">
                <h6 className="text-white font-semibold mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Status Pembayaran
                </h6>
                {selectedTagihan.status === "belum_bayar" ? (
                  <div>
                    <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30 mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Tagihan ini belum dibayar
                    </Badge>
                    <p className="text-blue-200 text-sm">
                      Silakan lakukan pembayaran melalui admin atau tempat pembayaran terdekat.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30 mb-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tagihan sudah dibayar
                    </Badge>
                    <p className="text-blue-200 text-sm">Terima kasih, pembayaran telah diterima.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowDetail(false)} className="bg-slate-700 hover:bg-slate-600">
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
