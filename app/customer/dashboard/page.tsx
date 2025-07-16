"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  User,
  Zap,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Phone,
  Clock,
  Settings,
  Key,
  LogOut,
  Home,
  Eye,
  ArrowRight,
  Wallet
} from "lucide-react"
import Swal from "sweetalert2"

interface CustomerStats {
  total_penggunaan: number
  tagihan_belum_bayar: number
  total_pembayaran: number
  total_dibayar: number
}

interface CustomerData {
  id_pelanggan: number
  nama_pelanggan: string
  username: string
  nomor_kwh: string
  daya: number
  tarifperkwh: number
  alamat?: string
}

interface PenggunaanBulanIni {
  meter_awal: number
  meter_akhir: number
  tarifperkwh: number
}

interface TagihanTerbaru {
  id_tagihan: number
  bulan: number
  tahun: number
  meter_awal: number
  meter_akhir: number
  tarifperkwh: number
  jumlah_meter: number; // Added for new logic
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

export default function CustomerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<CustomerData | null>(null)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [penggunaanBulanIni, setPenggunaanBulanIni] = useState<PenggunaanBulanIni | null>(null)
  const [tagihanTerbaru, setTagihanTerbaru] = useState<TagihanTerbaru | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

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
    fetchDashboardData()
  }, []) // Remove router dependency

  const fetchDashboardData = async () => {
    try {
      const userData = localStorage.getItem("user")
      const tokenData = localStorage.getItem("token")
      
      if (!userData || !tokenData) {
        router.push("/login")
        return
      }
      
      const parsedUser = JSON.parse(userData)
      if (parsedUser.level !== "customer") {
        router.push("/login")
        return
      }
      
      const response = await fetch(`/api/customer/dashboard`, {
        headers: {
          'Authorization': `Bearer ${tokenData}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setPenggunaanBulanIni(data.penggunaan_bulan_ini)
        setTagihanTerbaru(data.tagihan_terbaru)
        
        // Update user data with the latest information from the API
        if (data.customer) {
          setUser(data.customer)
          
          // Update localStorage with the latest customer data
          const userData = localStorage.getItem("user")
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const updatedUser = {
              ...parsedUser,
              nama_pelanggan: data.customer.nama_pelanggan,
              nomor_kwh: data.customer.nomor_kwh,
              daya: data.customer.daya,
              alamat: data.customer.alamat || "",
              tarifperkwh: data.customer.tarifperkwh
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
          }
        }
      } else {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        
        // Handle token expired or invalid
        if (response.status === 401) {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorData.error || "Gagal mengambil data dashboard",
          background: "#1f2937",
          color: "#fff",
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data dashboard",
        background: "#1f2937",
        color: "#fff",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Konfirmasi password tidak sesuai!",
        background: "#1f2937",
        color: "#fff",
      })
      return
    }

    if (passwordForm.new_password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Password baru minimal 6 karakter!",
        background: "#1f2937",
        color: "#fff",
      })
      return
    }

    try {
      const response = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      })

      const result = await response.json()

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Password berhasil diperbarui!",
          background: "#1f2937",
          color: "#fff",
        })
        setShowChangePassword(false)
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: result.error,
          background: "#1f2937",
          color: "#fff",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Terjadi kesalahan server",
        background: "#1f2937",
        color: "#fff",
      })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 relative z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Portal Pelanggan</span>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <User className="h-4 w-4 mr-2" />
                {user.nama_pelanggan}
              </Button>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-[100]"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => {
                      setShowChangePassword(true)
                      setShowProfileMenu(false)
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Ubah Password
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <Home className="inline h-8 w-8 mr-3" />
                Selamat Datang, {user.nama_pelanggan}!
              </h1>
              <p className="text-blue-200 text-lg mb-4">
                Kelola tagihan listrik dan pantau penggunaan Anda dengan mudah
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                <span>
                  <User className="inline h-4 w-4 mr-1" />
                  Username: <strong>{user.username || "Data tidak tersedia"}</strong>
                </span>
                <span>
                  <FileText className="inline h-4 w-4 mr-1" />
                  Nomor KWH: <strong>{user.nomor_kwh || "Data tidak tersedia"}</strong>
                </span>
                <span>
                  <Zap className="inline h-4 w-4 mr-1" />
                  Daya: <strong>{user.daya || 0}VA</strong>
                </span>
                <span>
                  <Home className="inline h-4 w-4 mr-1" />
                  Alamat: <strong>{user.alamat || "Data tidak tersedia"}</strong>
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <User className="h-24 w-24 text-white/30" />
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-blue-600/20 backdrop-blur-md border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-blue-200 text-sm">Total Penggunaan</p>
                    <p className="text-2xl font-bold text-white break-words">{stats.total_penggunaan}</p>
                    <p className="text-blue-300 text-xs">Bulan tercatat</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-yellow-600/20 backdrop-blur-md border-yellow-500/30 hover:bg-yellow-600/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-yellow-200 text-sm">Tagihan Belum Bayar</p>
                    <p className="text-2xl font-bold text-white break-words">{stats.tagihan_belum_bayar}</p>
                    <p className="text-yellow-300 text-xs">Segera bayar</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-green-600/20 backdrop-blur-md border-green-500/30 hover:bg-green-600/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-green-200 text-sm">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-white break-words">{stats.total_pembayaran}</p>
                    <p className="text-green-300 text-xs">Riwayat lunas</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-purple-600/20 backdrop-blur-md border-purple-500/30 hover:bg-purple-600/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-purple-200 text-sm">Total Dibayar</p>
                    <p className="text-xl font-bold text-white break-words">
                      Rp {stats.total_dibayar.toLocaleString("id-ID")}
                    </p>
                    <p className="text-purple-300 text-xs">Keseluruhan</p>
                  </div>
                  {/* Ganti DollarSign dengan ikon Rupiah atau ikon yang lebih sesuai */}
                  <Wallet className="h-8 w-8 text-purple-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Penggunaan Bulan Ini */}
          {penggunaanBulanIni && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader className="bg-blue-600/20 border-b border-white/10">
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Penggunaan Bulan Ini
                    <span className="ml-2 text-sm text-blue-200">
                      ({new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200">Meter Awal:</span>
                      <span className="text-white font-semibold">
                        {penggunaanBulanIni.meter_awal.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-200">Meter Akhir:</span>
                      <span className="text-white font-semibold">
                        {penggunaanBulanIni.meter_akhir.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-blue-600/20 p-3 rounded-lg">
                      <span className="text-yellow-200 font-semibold">Pemakaian:</span>
                      <span className="text-white font-bold text-lg">
                        {(penggunaanBulanIni.meter_akhir - penggunaanBulanIni.meter_awal).toLocaleString("id-ID")} kWh
                      </span>
                    </div>
                    {penggunaanBulanIni.tarifperkwh > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Estimasi Biaya:</span>
                        <span className="text-white font-semibold">
                          Rp {((penggunaanBulanIni.meter_akhir - penggunaanBulanIni.meter_awal) * penggunaanBulanIni.tarifperkwh).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/customer/tagihan")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Tagihan
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tagihan Terbaru */}
          {tagihanTerbaru && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-white/10 backdrop-blur-md border-yellow-500/30">
                <CardHeader className="bg-yellow-600/20 border-b border-white/10">
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Tagihan Belum Dibayar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-yellow-600/20 p-3 rounded-lg mb-4">
                    <h6 className="text-white font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Periode: {bulanNama[tagihanTerbaru.bulan]} {tagihanTerbaru.tahun}
                    </h6>
                  </div>

                  {(() => {
                    // Gunakan jumlah_meter jika meter_awal dan meter_akhir tidak tersedia
                    const meterAwalTersedia = tagihanTerbaru.meter_awal > 0;
                    const meterAkhirTersedia = tagihanTerbaru.meter_akhir > 0;
                    const pemakaian = meterAwalTersedia && meterAkhirTersedia
                      ? tagihanTerbaru.meter_akhir - tagihanTerbaru.meter_awal
                      : tagihanTerbaru.jumlah_meter;
                    
                    const biayaListrik = tagihanTerbaru.tarifperkwh > 0 
                      ? pemakaian * tagihanTerbaru.tarifperkwh 
                      : 0;
                    const biayaAdmin = 2500;
                    const totalBayar = biayaListrik + biayaAdmin;

                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-blue-200">Pemakaian:</span>
                          <span className="text-white">{pemakaian.toLocaleString("id-ID")} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-200">Biaya Listrik:</span>
                          <span className="text-white">
                            {biayaListrik > 0 
                              ? `Rp ${biayaListrik.toLocaleString("id-ID")}` 
                              : "Data tidak tersedia"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-200">Biaya Admin:</span>
                          <span className="text-white">Rp {biayaAdmin.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between bg-yellow-600/20 p-3 rounded-lg">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-white font-bold text-lg">
                            {totalBayar > biayaAdmin 
                              ? `Rp ${totalBayar.toLocaleString("id-ID")}` 
                              : "Menunggu data tarif"}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="bg-blue-600/20 p-3 rounded-lg mt-4">
                    <p className="text-blue-200 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Segera lakukan pembayaran
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>


        {/* Menu Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Menu Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className="bg-blue-600/20 backdrop-blur-md border-blue-500/30 hover:bg-blue-600/30 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/customer/penggunaan")}
                >
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h6 className="text-white font-semibold mb-2">Riwayat Penggunaan</h6>
                    <p className="text-blue-200 text-sm mb-4">Lihat penggunaan listrik</p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-500 text-blue-300 hover:bg-blue-600/20 bg-transparent"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Lihat
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="bg-yellow-600/20 backdrop-blur-md border-yellow-500/30 hover:bg-yellow-600/30 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/customer/tagihan")}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h6 className="text-white font-semibold mb-2">Lihat Tagihan</h6>
                    <p className="text-yellow-200 text-sm mb-4">Cek tagihan listrik</p>
                    <Button
                      variant="outline"
                      className="w-full border-yellow-500 text-yellow-300 hover:bg-yellow-600/20 bg-transparent"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Lihat
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="bg-green-600/20 backdrop-blur-md border-green-500/30 hover:bg-green-600/30 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/customer/pembayaran")}
                >
                  <CardContent className="p-6 text-center">
                    <CreditCard className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h6 className="text-white font-semibold mb-2">Pembayaran</h6>
                    <p className="text-green-200 text-sm mb-4">Info pembayaran</p>
                    <Button
                      variant="outline"
                      className="w-full border-green-500 text-green-300 hover:bg-green-600/20 bg-transparent"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Lihat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <Phone className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h6 className="text-white font-semibold mb-2">Customer Service</h6>
                  <p className="text-blue-200 text-sm mb-2">Hubungi kami untuk bantuan</p>
                  <p className="text-white font-semibold">Telp: (021) 123-4567</p>
                </div>
                <div>
                  <Clock className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h6 className="text-white font-semibold mb-2">Jam Layanan</h6>
                  <p className="text-green-200 text-sm mb-2">Senin - Jumat</p>
                  <p className="text-white font-semibold">08:00 - 17:00 WIB</p>
                </div>
                <div>
                  <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h6 className="text-white font-semibold mb-2">Gangguan Listrik</h6>
                  <p className="text-yellow-200 text-sm mb-2">Laporan gangguan 24 jam</p>
                  <p className="text-white font-semibold">Telp: 123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="bg-slate-900 border-slate-700 z-[200]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Ubah Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="bg-blue-600/20 p-3 rounded-lg">
              <p className="text-blue-200 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                <strong>Informasi:</strong> Hanya password yang dapat diubah. Data lain seperti nama dan nomor KWH tidak
                dapat diubah oleh pelanggan.
              </p>
            </div>
            <div>
              <Label htmlFor="current_password" className="text-white">
                Password Lama
              </Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="new_password" className="text-white">
                Password Baru
              </Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm_password" className="text-white">
                Konfirmasi Password Baru
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)} className="flex-1">
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Key className="h-4 w-4 mr-2" />
                Ubah Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
