"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, Plus, Edit, Trash2, Search, X, Calculator, Zap } from "lucide-react"

interface Penggunaan {
  id_penggunaan: number
  id_pelanggan: number
  bulan: number
  tahun: number
  meter_awal: number
  meter_akhir: number
  pelanggan: {
    nama_pelanggan: string
    nomor_kwh: string
  }
}

interface Customer {
  id_pelanggan: number
  nama_pelanggan: string
  nomor_kwh: string
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

export default function PenggunaanPage() {
  const [penggunaanData, setPenggunaanData] = useState<Penggunaan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Customer search states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const [formData, setFormData] = useState({
    periode: "",
    meter_awal: "",
    meter_akhir: "",
  })

  useEffect(() => {
    fetchData()
    // Set default month to current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    setFormData((prev) => ({ ...prev, periode: currentMonth }))
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/penggunaan")
      const data = await response.json()
      setPenggunaanData(data.penggunaanData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchCustomers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/penggunaan?search_customer=${encodeURIComponent(query)}`)
      const customers = await response.json()
      setSearchResults(customers)
      setShowDropdown(true)
    } catch (error) {
      console.error("Error searching customers:", error)
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      searchCustomers(query)
    }, 500)

    setSearchTimeout(timeout)
  }

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setSearchQuery(customer.nama_pelanggan)
    setShowDropdown(false)
    setSearchResults([])
  }

  const clearSelection = () => {
    setSelectedCustomer(null)
    setSearchQuery("")
    setShowDropdown(false)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Silakan pilih pelanggan terlebih dahulu!",
        background: "#0f172a",
        color: "#f1f5f9",
        iconColor: "#ef4444",
      })
      return
    }

    const meterAwal = Number.parseInt(formData.meter_awal)
    const meterAkhir = Number.parseInt(formData.meter_akhir)

    if (meterAkhir <= meterAwal) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Meter akhir harus lebih besar dari meter awal!",
        background: "#0f172a",
        color: "#f1f5f9",
        iconColor: "#ef4444",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const action = editingId ? "update" : "create"
      const payload = editingId
        ? {
            action,
            id_penggunaan: editingId,
            meter_awal: meterAwal,
            meter_akhir: meterAkhir,
          }
        : {
            action,
            id_pelanggan: selectedCustomer.id_pelanggan,
            periode: formData.periode,
            meter_awal: meterAwal,
            meter_akhir: meterAkhir,
          }

      const response = await fetch("/api/admin/penggunaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        resetForm()
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (penggunaan: Penggunaan) => {
    setFormData({
      periode: `${penggunaan.tahun}-${String(penggunaan.bulan).padStart(2, "0")}`,
      meter_awal: penggunaan.meter_awal.toString(),
      meter_akhir: penggunaan.meter_akhir.toString(),
    })
    setSelectedCustomer({
      id_pelanggan: penggunaan.id_pelanggan,
      nama_pelanggan: penggunaan.pelanggan.nama_pelanggan,
      nomor_kwh: penggunaan.pelanggan.nomor_kwh,
    })
    setSearchQuery(penggunaan.pelanggan.nama_pelanggan)
    setEditingId(penggunaan.id_penggunaan)
  }

  const handleDelete = async (id: number, nama: string, periode: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Yakin ingin menghapus data penggunaan "${nama}" periode ${periode}?`,
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
        const response = await fetch("/api/admin/penggunaan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_penggunaan: id }),
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

  const resetForm = () => {
    setFormData({
      periode: "",
      meter_awal: "",
      meter_akhir: "",
    })
    clearSelection()
    setEditingId(null)
    // Reset to current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    setFormData((prev) => ({ ...prev, periode: currentMonth }))
  }

  const calculateUsage = () => {
    const meterAwal = Number.parseInt(formData.meter_awal) || 0
    const meterAkhir = Number.parseInt(formData.meter_akhir) || 0
    return meterAkhir > meterAwal ? meterAkhir - meterAwal : 0
  }

  const isFormValid = () => {
    return selectedCustomer && formData.periode && formData.meter_awal && formData.meter_akhir
  }

  if (isLoading) {
    return (
      <AdminLayout title="Kelola Penggunaan">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kelola Penggunaan Listrik">
      {/* Form Tambah/Edit Penggunaan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              {editingId ? "Edit Penggunaan" : "Tambah Penggunaan Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Search */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Cari Pelanggan</label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border-0 text-white placeholder-slate-400 pl-10"
                        style={{ background: "rgba(30, 41, 59, 0.5)" }}
                        placeholder="Mulai ketik nama pelanggan..."
                        autoComplete="off"
                      />
                    </div>

                    {/* Search Dropdown */}
                    {showDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 rounded-md border-0 shadow-lg z-50 max-h-60 overflow-y-auto"
                        style={{ background: "rgba(30, 41, 59, 0.95)", backdropFilter: "blur(20px)" }}
                      >
                        {searchResults.length === 0 ? (
                          <div className="p-3 text-slate-400 text-sm">Tidak ada pelanggan yang ditemukan</div>
                        ) : (
                          searchResults.map((customer) => (
                            <div
                              key={customer.id_pelanggan}
                              onClick={() => selectCustomer(customer)}
                              className="p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-600/30 last:border-b-0"
                            >
                              <div className="text-white font-medium">{customer.nama_pelanggan}</div>
                              <div className="text-slate-400 text-sm">No. KWH: {customer.nomor_kwh}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Selected Customer */}
                    {selectedCustomer && (
                      <div
                        className="mt-3 p-3 rounded-lg border-2"
                        style={{
                          background: "rgba(59, 130, 246, 0.1)",
                          borderColor: "rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{selectedCustomer.nama_pelanggan}</div>
                            <div className="text-slate-400 text-sm">No. KWH: {selectedCustomer.nomor_kwh}</div>
                          </div>
                          <Button
                            type="button"
                            onClick={clearSelection}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Periode */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Periode</label>
                  <Input
                    type="month"
                    value={formData.periode}
                    onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                    className="border-0 text-white"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    required
                    disabled={!!editingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meter Awal */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Meter Awal (kWh)</label>
                  <Input
                    type="number"
                    value={formData.meter_awal}
                    onChange={(e) => setFormData({ ...formData, meter_awal: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="Contoh: 1000"
                    required
                  />
                </div>

                {/* Meter Akhir */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Meter Akhir (kWh)</label>
                  <Input
                    type="number"
                    value={formData.meter_akhir}
                    onChange={(e) => setFormData({ ...formData, meter_akhir: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="Contoh: 1100"
                    required
                  />
                </div>
              </div>

              {/* Usage Preview */}
              {formData.meter_awal && formData.meter_akhir && calculateUsage() > 0 && (
                <div
                  className="p-4 rounded-lg border"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    borderColor: "rgba(34, 197, 94, 0.3)",
                  }}
                >
                  <div className="flex items-center text-green-400">
                    <Calculator className="w-5 h-5 mr-2" />
                    <span className="font-medium">Preview Pemakaian</span>
                  </div>
                  <div className="text-white mt-1">
                    Pemakaian: <strong>{calculateUsage().toLocaleString()} kWh</strong>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="text-white font-semibold border-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }}
                >
                  {isSubmitting ? <LoadingSpinner /> : editingId ? "Update Penggunaan" : "Tambah Penggunaan"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="border-0 text-white hover:bg-slate-700 bg-transparent"
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabel Data Penggunaan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Data Penggunaan Listrik ({penggunaanData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(100, 116, 139, 0.3)" }}>
                    <th className="text-left py-3 px-4 text-white font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Pelanggan</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">No. KWH</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Periode</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Meter Awal</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Meter Akhir</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Pemakaian</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {penggunaanData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        Belum ada data penggunaan
                      </td>
                    </tr>
                  ) : (
                    penggunaanData.map((penggunaan, index) => (
                      <motion.tr
                        key={penggunaan.id_penggunaan}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b hover:bg-slate-800/30 transition-colors"
                        style={{ borderColor: "rgba(100, 116, 139, 0.2)" }}
                      >
                        <td className="py-3 px-4 text-white font-mono">{penggunaan.id_penggunaan}</td>
                        <td className="py-3 px-4 text-white font-semibold">{penggunaan.pelanggan.nama_pelanggan}</td>
                        <td className="py-3 px-4 text-blue-400 font-mono">{penggunaan.pelanggan.nomor_kwh}</td>
                        <td className="py-3 px-4 text-white">
                          {bulanNama[penggunaan.bulan]} {penggunaan.tahun}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-right">
                          {penggunaan.meter_awal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-right">
                          {penggunaan.meter_akhir.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-green-400 text-right font-semibold">
                          <div className="flex items-center justify-end">
                            <Zap className="w-4 h-4 mr-1" />
                            {(penggunaan.meter_akhir - penggunaan.meter_awal).toLocaleString()} kWh
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(penggunaan)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleDelete(
                                  penggunaan.id_penggunaan,
                                  penggunaan.pelanggan.nama_pelanggan,
                                  `${bulanNama[penggunaan.bulan]} ${penggunaan.tahun}`,
                                )
                              }
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white border-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
    </AdminLayout>
  )
}
