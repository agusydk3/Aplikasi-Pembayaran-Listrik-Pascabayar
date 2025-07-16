"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileText, Clock, CheckCircle, Filter, Edit, Trash2, CreditCard, Zap } from "lucide-react"

interface Tagihan {
  id_tagihan: number
  id_pelanggan: number
  id_penggunaan: number
  bulan: number
  tahun: number
  jumlah_meter: number
  status: "belum_bayar" | "sudah_bayar"
  pelanggan: {
    nama_pelanggan: string
    nomor_kwh: string
    tarif: {
      daya: number
      tarifperkwh: number
    }
  }
  penggunaan: {
    meter_awal: number
    meter_akhir: number
  }
}

interface Stats {
  belumBayarCount: number
  sudahBayarCount: number
  totalTagihanCount: number
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

export default function TagihanPage() {
  const [tagihanData, setTagihanData] = useState<Tagihan[]>([])
  const [stats, setStats] = useState<Stats>({
    belumBayarCount: 0,
    sudahBayarCount: 0,
    totalTagihanCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"belum_bayar" | "sudah_bayar" | "semua">("belum_bayar")

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/admin/tagihan?filter=${filter}`)
      const data = await response.json()
      setTagihanData(data.tagihanData || [])
      setStats(data.stats || { belumBayarCount: 0, sudahBayarCount: 0, totalTagihanCount: 0 })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: "belum_bayar" | "sudah_bayar") => {
    try {
      const response = await fetch("/api/admin/tagihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id_tagihan: id, status }),
      })

      const result = await response.json()

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: result.message,
          background: "#0f172a",
          color: "#f1f5f9",
          iconColor: "#10b981",
        })
        fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        background: "#0f172a",
        color: "#f1f5f9",
        iconColor: "#ef4444",
      })
    }
  }

  const handleDelete = async (id: number, nama: string, periode: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Yakin ingin menghapus tagihan "${nama}" periode ${periode}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      background: "#0f172a",
      color: "#f1f5f9",
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/admin/tagihan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_tagihan: id }),
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: data.message,
            background: "#0f172a",
            color: "#f1f5f9",
            iconColor: "#10b981",
          })
          fetchData()
        } else {
          throw new Error(data.error)
        }
      } catch (error: any) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          background: "#0f172a",
          color: "#f1f5f9",
          iconColor: "#ef4444",
        })
      }
    }
  }

  const handlePayment = async (tagihan: Tagihan) => {
    const pemakaian = tagihan.penggunaan.meter_akhir - tagihan.penggunaan.meter_awal
    const biayaListrik = pemakaian * tagihan.pelanggan.tarif.tarifperkwh
    const biayaAdmin = 2500
    const totalBayar = biayaListrik + biayaAdmin

    const result = await Swal.fire({
      title: "Konfirmasi Pembayaran",
      html: `
        <div class="text-left">
          <p><strong>Pelanggan:</strong> ${tagihan.pelanggan.nama_pelanggan}</p>
          <p><strong>Periode:</strong> ${bulanNama[tagihan.bulan]} ${tagihan.tahun}</p>
          <p><strong>Pemakaian:</strong> ${pemakaian.toLocaleString()} kWh</p>
          <p><strong>Total Bayar:</strong> <span class="text-green-400">Rp ${totalBayar.toLocaleString()}</span></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Konfirmasi Pembayaran",
      cancelButtonText: "Batal",
      background: "#0f172a",
      color: "#f1f5f9",
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch("/api/admin/tagihan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "bayar",
            id_tagihan: tagihan.id_tagihan,
            id_pelanggan: tagihan.id_pelanggan,
            bulan_bayar: tagihan.bulan,
            total_bayar: totalBayar,
            biaya_admin: biayaAdmin,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Pembayaran Berhasil!",
            text: data.message,
            background: "#0f172a",
            color: "#f1f5f9",
            iconColor: "#10b981",
          })
          fetchData()
        } else {
          throw new Error(data.error)
        }
      } catch (error: any) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          background: "#0f172a",
          color: "#f1f5f9",
          iconColor: "#ef4444",
        })
      }
    }
  }

  const calculateBill = (tagihan: Tagihan) => {
    const pemakaian = tagihan.penggunaan.meter_akhir - tagihan.penggunaan.meter_awal
    const biayaListrik = pemakaian * tagihan.pelanggan.tarif.tarifperkwh
    const biayaAdmin = 2500
    const totalBayar = biayaListrik + biayaAdmin

    return {
      pemakaian,
      biayaListrik,
      biayaAdmin,
      totalBayar,
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Kelola Tagihan">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kelola Tagihan">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Belum Dibayar",
            value: stats.belumBayarCount,
            icon: Clock,
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-500/10",
          },
          {
            title: "Sudah Dibayar",
            value: stats.sudahBayarCount,
            icon: CheckCircle,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10",
          },
          {
            title: "Total Tagihan",
            value: stats.totalTagihanCount,
            icon: FileText,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Card
              className="border-0 shadow-2xl"
              style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card
          className="border-0 shadow-2xl mb-8"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "belum_bayar", label: "Belum Dibayar", count: stats.belumBayarCount, icon: Clock },
                { key: "sudah_bayar", label: "Sudah Dibayar", count: stats.sudahBayarCount, icon: CheckCircle },
                { key: "semua", label: "Semua Tagihan", count: stats.totalTagihanCount, icon: FileText },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`border-0 ${
                    filter === tab.key
                      ? "text-white"
                      : "text-slate-400 hover:text-white bg-transparent hover:bg-slate-700"
                  }`}
                  style={
                    filter === tab.key
                      ? { background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }
                      : {}
                  }
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabel Data Tagihan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Data Tagihan -{" "}
              {filter === "belum_bayar" ? "Belum Dibayar" : filter === "sudah_bayar" ? "Sudah Dibayar" : "Semua"} (
              {tagihanData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(100, 116, 139, 0.3)" }}>
                    <th className="text-left py-3 px-4 text-white font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Pelanggan</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">KWH</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Periode</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Pakai</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Tarif</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Total</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tagihanData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        {filter === "belum_bayar"
                          ? "Tidak ada tagihan yang belum dibayar"
                          : filter === "sudah_bayar"
                            ? "Tidak ada tagihan yang sudah dibayar"
                            : "Belum ada data tagihan"}
                      </td>
                    </tr>
                  ) : (
                    tagihanData.map((tagihan, index) => {
                      const bill = calculateBill(tagihan)
                      return (
                        <motion.tr
                          key={tagihan.id_tagihan}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b hover:bg-slate-800/30 transition-colors"
                          style={{ borderColor: "rgba(100, 116, 139, 0.2)" }}
                        >
                          <td className="py-3 px-4 text-white font-mono">{tagihan.id_tagihan}</td>
                          <td className="py-3 px-4">
                            <div className="text-white font-semibold">{tagihan.pelanggan.nama_pelanggan}</div>
                            <div className="text-slate-400 text-sm flex items-center">
                              <Zap className="w-3 h-3 mr-1" />
                              {tagihan.pelanggan.tarif.daya}VA
                            </div>
                          </td>
                          <td className="py-3 px-4 text-blue-400 font-mono text-sm">{tagihan.pelanggan.nomor_kwh}</td>
                          <td className="py-3 px-4 text-white">
                            <div>{bulanNama[tagihan.bulan]}</div>
                            <div className="text-slate-400 text-sm">{tagihan.tahun}</div>
                          </td>
                          <td className="py-3 px-4 text-green-400 text-right">
                            <div className="font-semibold">{bill.pemakaian.toLocaleString()}</div>
                            <div className="text-slate-400 text-sm">kWh</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 text-right font-mono">
                            {tagihan.pelanggan.tarif.tarifperkwh.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-yellow-400 text-right">
                            <div className="font-semibold">Rp {bill.totalBayar.toLocaleString()}</div>
                            <div className="text-slate-400 text-sm">+admin</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tagihan.status === "belum_bayar"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {tagihan.status === "belum_bayar" ? "Belum Bayar" : "Sudah Bayar"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              {tagihan.status === "belum_bayar" && (
                                <Button
                                  onClick={() => handlePayment(tagihan)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white border-0"
                                  title="Proses Pembayaran"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                onClick={() =>
                                  handleUpdateStatus(
                                    tagihan.id_tagihan,
                                    tagihan.status === "belum_bayar" ? "sudah_bayar" : "belum_bayar",
                                  )
                                }
                                size="sm"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                                title="Edit Status"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDelete(
                                    tagihan.id_tagihan,
                                    tagihan.pelanggan.nama_pelanggan,
                                    `${bulanNama[tagihan.bulan]} ${tagihan.tahun}`,
                                  )
                                }
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white border-0"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
    </AdminLayout>
  )
}
