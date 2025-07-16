"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  Clock,
  TrendingUp,
  CreditCard,
  Settings,
  Zap,
  FileText,
  Calculator,
  BarChart3,
  LogOut,
} from "lucide-react"

interface Stats {
  totalPelanggan: number
  tagihanBelumBayar: number
  penggunaanBulanIni: number
  pembayaranHariIni: number
}

interface AdminUser {
  nama_admin: string
  username: string
  level: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.level !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchStats()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      background: "#1f2937",
      color: "#f9fafb",
    })

    if (result.isConfirmed) {
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  const menuItems = [
    {
      title: "Kelola Pelanggan",
      description: "Manage data pelanggan",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/admin/pelanggan",
    },
    {
      title: "Kelola Penggunaan",
      description: "Input data penggunaan",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      href: "/admin/penggunaan",
    },
    {
      title: "Kelola Tagihan",
      description: "Manage tagihan listrik",
      icon: FileText,
      color: "from-yellow-500 to-yellow-600",
      href: "/admin/tagihan",
    },
    {
      title: "Kelola Tarif",
      description: "Setting tarif listrik",
      icon: Calculator,
      color: "from-purple-500 to-purple-600",
      href: "/admin/tarif",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-slate-400">Sistem Listrik Pascabayar</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.nama_admin}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Administrator</h2>
          <p className="text-slate-400">Selamat datang kembali, {user?.nama_admin}</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Pelanggan",
            value: stats?.totalPelanggan || 0,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
          },
          {
            title: "Tagihan Belum Bayar",
            value: stats?.tagihanBelumBayar || 0,
            icon: Clock,
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-500/10",
          },
          {
            title: "Penggunaan Bulan Ini",
            value: stats?.penggunaanBulanIni || 0,
            icon: BarChart3,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10",
          },
          {
            title: "Pembayaran Hari Ini",
            value: stats?.pembayaranHariIni || 0,
            icon: CreditCard,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500/10",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group h-full" // Tambahkan h-full
          >
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full"> {/* Tambahkan h-full */}
              <CardContent className="p-4 h-full"> {/* Ubah padding dan tambahkan h-full */}
                <div className="flex items-center justify-between h-full"> {/* Tambahkan h-full */}
                  <div className="flex-1 min-w-0"> {/* Tambahkan flex-1 dan min-w-0 */}
                    <p className="text-sm font-medium text-slate-400 mb-2 truncate">{stat.title}</p> {/* Tambahkan truncate */}
                    <p className="text-2xl font-bold text-white break-words">{stat.value.toLocaleString()}</p> {/* Ubah dari text-3xl ke text-2xl */}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0 ml-3`} // Ubah ukuran dan tambahkan flex-shrink-0 ml-3
                  >
                    <stat.icon className="w-5 h-5 text-white" /> {/* Ubah ukuran ikon */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>


        {/* Menu Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Menu Administrasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group cursor-pointer"
                    onClick={() => router.push(item.href)}
                  >
                    <Card className="bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 h-full">
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full bg-transparent"
                        >
                          Buka
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Informasi Login</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama:</span>
                      <span className="text-white">{user?.nama_admin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="text-white">{user?.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="text-white">Administrator</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terkini</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-slate-400">
                      <Clock className="w-4 h-4 mr-2" />
                      Login terakhir: {new Date().toLocaleString("id-ID")}
                    </div>
                    <div className="flex items-center text-slate-400">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Periode aktif: {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Zap className="w-4 h-4 mr-2" />
                      Status sistem:{" "}
                      <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
