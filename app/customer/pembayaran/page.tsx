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
  CreditCard,
  User,
  Zap,
  LogOut,
  Calendar,
  Calculator,
  Info,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  TriangleIcon as ExclamationTriangle,
} from "lucide-react"

interface TagihanBelumBayar {
  id_tagihan: number
  bulan: number
  tahun: number
  meter_awal: number
  meter_akhir: number
  jumlah_meter: number
  tarifperkwh: number
  daya: number
  status: string
}

interface PembayaranData {
  id_pembayaran: number
  id_tagihan: number
  bulan: number
  tahun: number
  bulan_bayar: number
  biaya_admin: number
  total_bayar: number
  tanggal_pembayaran: string
  status?: string
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

export default function CustomerPembayaran() {
  const router = useRouter()
  const [user, setUser] = useState<CustomerData | null>(null)
  const [tagihanBelumBayar, setTagihanBelumBayar] = useState<TagihanBelumBayar[]>([])
  const [pembayaranData, setPembayaranData] = useState<PembayaranData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTagihan, setSelectedTagihan] = useState<TagihanBelumBayar | null>(null)
  const [selectedPembayaran, setSelectedPembayaran] = useState<PembayaranData | null>(null)
  const [showDetailTagihan, setShowDetailTagihan] = useState(false)
  const [showDetailPembayaran, setShowDetailPembayaran] = useState(false)

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
    fetchPembayaranData()
  }, [])

  const fetchPembayaranData = async () => {
    try {
      const tokenData = localStorage.getItem("token")
      if (!tokenData) {
        router.push("/login")
        return
      }
      
      const response = await fetch("/api/customer/pembayaran", {
        headers: {
          'Authorization': `Bearer ${tokenData}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTagihanBelumBayar(data.tagihan_belum_bayar)
        setPembayaranData(data.pembayaran_data)
      } else {
        // Handle token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Error fetching pembayaran data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const openDetailTagihan = (tagihan: TagihanBelumBayar) => {
    setSelectedTagihan(tagihan)
    setShowDetailTagihan(true)
  }

  const openDetailPembayaran = (pembayaran: PembayaranData) => {
    setSelectedPembayaran(pembayaran)
    setShowDetailPembayaran(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) return null

  const totalDibayar = pembayaranData.reduce((sum, p) => sum + p.total_bayar, 0)

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
            <CreditCard className="h-8 w-8 mr-3" />
            Pembayaran Listrik
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

        {/* Unpaid Bills Section */}
        {tagihanBelumBayar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-md border-yellow-500/30">
              <CardHeader className="bg-yellow-600/20 border-b border-white/10">
                <CardTitle className="text-white flex items-center">
                  <ExclamationTriangle className="h-5 w-5 mr-2" />
                  Tagihan yang Belum Dibayar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tagihanBelumBayar.map((tagihan, index) => {
                    const pemakaian = tagihan.meter_akhir - tagihan.meter_awal
                    const biayaListrik = pemakaian * tagihan.tarifperkwh
                    const biayaAdmin = 2500
                    const totalBayar = biayaListrik + biayaAdmin

                    return (
                      <motion.div
                        key={tagihan.id_tagihan}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:shadow-lg hover:border-yellow-500/50 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="text-white font-semibold flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-yellow-300" />
                            {bulanNama[tagihan.bulan]} {tagihan.tahun}
                          </h6>
                          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">Belum Bayar</Badge>
                        </div>

                        <div className="bg-slate-900 rounded-md p-4 mb-4 space-y-2">
                          <div className="flex justify-between text-slate-300">
                            <span>
                              <Zap className="inline h-4 w-4 mr-1" />
                              Pemakaian:
                            </span>
                            <span>{pemakaian.toLocaleString("id-ID")} kWh</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>
                              <DollarSign className="inline h-4 w-4 mr-1" />
                              Tarif/kWh:
                            </span>
                            <span>Rp {tagihan.tarifperkwh.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>
                              <Calculator className="inline h-4 w-4 mr-1" />
                              Biaya Listrik:
                            </span>
                            <span>Rp {biayaListrik.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>
                              <Info className="inline h-4 w-4 mr-1" />
                              Biaya Admin:
                            </span>
                            <span>Rp {biayaAdmin.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between text-white font-bold text-lg bg-yellow-600/20 p-2 rounded-md">
                            <span>
                              <CreditCard className="inline h-4 w-4 mr-1" />
                              Total Bayar:
                            </span>
                            <span>Rp {totalBayar.toLocaleString("id-ID")}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => openDetailTagihan(tagihan)}
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="bg-blue-600/20 p-4 rounded-lg mt-6">
                  <h6 className="text-white font-semibold mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Informasi Pembayaran
                  </h6>
                  <p className="text-blue-200 mb-2">
                    Untuk melakukan pembayaran, silakan hubungi admin atau datang ke kantor pelayanan terdekat
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment History Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Riwayat Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold p-3">Tanggal Pembayaran</th>
                      <th className="text-left text-white font-semibold p-3">Periode</th>
                      <th className="text-left text-white font-semibold p-3">Bulan Bayar</th>
                      <th className="text-right text-white font-semibold p-3">Biaya Admin</th>
                      <th className="text-right text-white font-semibold p-3">Total Bayar</th>
                      <th className="text-center text-white font-semibold p-3">Status</th>
                      <th className="text-center text-white font-semibold p-3">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pembayaranData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-white/60 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          Belum ada data pembayaran
                        </td>
                      </tr>
                    ) : (
                      pembayaranData.map((pembayaran, index) => (
                        <motion.tr
                          key={pembayaran.id_pembayaran}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-white/10 hover:bg-white/5"
                        >
                          <td className="p-3 text-white">
                            <Calendar className="inline h-4 w-4 mr-2 text-blue-300" />
                            {new Date(pembayaran.tanggal_pembayaran).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 text-white font-semibold">
                            {bulanNama[pembayaran.bulan]} {pembayaran.tahun}
                          </td>
                          <td className="p-3 text-white">{bulanNama[pembayaran.bulan_bayar]}</td>
                          <td className="text-right p-3 text-white">
                            Rp {pembayaran.biaya_admin.toLocaleString("id-ID")}
                          </td>
                          <td className="text-right p-3 text-white font-bold">
                            Rp {pembayaran.total_bayar.toLocaleString("id-ID")}
                          </td>
                          <td className="text-center p-3">
                            <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Lunas
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20 bg-transparent"
                              onClick={() => openDetailPembayaran(pembayaran)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Tagihan Belum Bayar Modal */}
      <Dialog open={showDetailTagihan} onOpenChange={setShowDetailTagihan}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <ExclamationTriangle className="h-5 w-5 mr-2 text-yellow-400" />
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
                      <span className="text-slate-300">Nama:</span>
                      <span className="text-white">{user.nama_pelanggan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">No. KWH:</span>
                      <span className="text-white">{user.nomor_kwh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Daya:</span>
                      <span className="text-white">{selectedTagihan.daya}VA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">ID Tagihan:</span>
                      <span className="text-white">{selectedTagihan.id_tagihan}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h6 className="text-white font-semibold mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Data Meter
                  </h6>
                  <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Meter Awal:</span>
                      <span className="text-white">{selectedTagihan.meter_awal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Meter Akhir:</span>
                      <span className="text-white">{selectedTagihan.meter_akhir.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Pemakaian:</span>
                      <span className="text-white">
                        {(selectedTagihan.meter_akhir - selectedTagihan.meter_awal).toLocaleString("id-ID")} kWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Tarif/kWh:</span>
                      <span className="text-white">Rp {selectedTagihan.tarifperkwh.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6">
                <h6 className="text-white font-semibold mb-4 flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Rincian Biaya
                </h6>
                {(() => {
                  const pemakaian = selectedTagihan.meter_akhir - selectedTagihan.meter_awal
                  const biayaListrik = pemakaian * selectedTagihan.tarifperkwh
                  const biayaAdmin = 2500
                  const totalBayar = biayaListrik + biayaAdmin

                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Biaya Pemakaian Listrik:</span>
                        <span className="text-white">
                          {pemakaian.toLocaleString("id-ID")} kWh × Rp{" "}
                          {selectedTagihan.tarifperkwh.toLocaleString("id-ID")} =
                          <strong className="ml-2">Rp {biayaListrik.toLocaleString("id-ID")}</strong>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Biaya Administrasi:</span>
                        <span className="text-white font-semibold">Rp {biayaAdmin.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between items-center bg-yellow-600/20 p-3 rounded-lg">
                        <span className="text-white font-semibold">Total yang harus dibayar:</span>
                        <span className="text-white font-bold text-xl">Rp {totalBayar.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="bg-yellow-600/20 p-4 rounded-lg">
                <h6 className="text-white font-semibold mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Cara Pembayaran
                </h6>
                <p className="text-yellow-200 mb-2">Untuk melakukan pembayaran, silakan:</p>
                <ul className="list-decimal list-inside text-yellow-200">
                  <li>Datang ke kantor pelayanan terdekat</li>
                  <li>Hubungi admin melalui telepon</li>
                  <li>Gunakan layanan pembayaran online yang tersedia</li>
                  <li>
                    Bawa ID tagihan: <strong className="text-white">{selectedTagihan.id_tagihan}</strong>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowDetailTagihan(false)} className="bg-slate-700 hover:bg-slate-600">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Pembayaran Modal */}
      <Dialog open={showDetailPembayaran} onOpenChange={setShowDetailPembayaran}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Detail Pembayaran
            </DialogTitle>
          </DialogHeader>
          {selectedPembayaran && (
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">ID Pembayaran:</span>
                  <span className="text-white">{selectedPembayaran.id_pembayaran}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Tanggal Pembayaran:</span>
                  <span className="text-white">
                    {new Date(selectedPembayaran.tanggal_pembayaran).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Periode Tagihan:</span>
                  <span className="text-white">
                    {bulanNama[selectedPembayaran.bulan]} {selectedPembayaran.tahun}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Bulan Dibayar:</span>
                  <span className="text-white">{bulanNama[selectedPembayaran.bulan_bayar]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Biaya Admin:</span>
                  <span className="text-white">Rp {selectedPembayaran.biaya_admin.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between bg-green-600/20 p-2 rounded-md">
                  <span className="text-white font-semibold">Total Dibayar:</span>
                  <span className="text-white font-bold text-lg">
                    Rp {selectedPembayaran.total_bayar.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Status:</span>
                  <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Lunas
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowDetailPembayaran(false)} className="bg-slate-700 hover:bg-slate-600">
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
