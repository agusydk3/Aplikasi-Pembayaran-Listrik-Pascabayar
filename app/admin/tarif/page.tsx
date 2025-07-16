"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Calculator, Plus, Edit, Trash2, Zap } from "lucide-react"

interface Tarif {
  id_tarif: number
  daya: number
  tarifperkwh: number
}

export default function TarifPage() {
  const [tarifData, setTarifData] = useState<Tarif[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    daya: "",
    tarifperkwh: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/tarif")
      const result = await response.json()
      setTarifData(result.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const action = editingId ? "update" : "create"
      
      // Ensure daya and tarifperkwh are valid numbers
      const dayaValue = formData.daya ? Number(formData.daya) : 0
      const tarifValue = formData.tarifperkwh ? Number(formData.tarifperkwh) : 0
      
      if (isNaN(dayaValue) || isNaN(tarifValue)) {
        throw new Error("Nilai daya atau tarif tidak valid")
      }
      
      const payload = editingId
        ? {
            action,
            id_tarif: editingId,
            daya: dayaValue,
            tarifperkwh: tarifValue,
          }
        : { 
            action, 
            daya: dayaValue, 
            tarifperkwh: tarifValue 
          }

      const response = await fetch("/api/admin/tarif", {
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

  const handleEdit = (tarif: Tarif) => {
    setFormData({
      daya: tarif.daya.toString(),
      tarifperkwh: tarif.tarifperkwh.toString(),
    })
    setEditingId(tarif.id_tarif)
  }

  const handleDelete = async (id: number, daya: number) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Yakin ingin menghapus tarif ${daya}VA?`,
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
        const response = await fetch("/api/admin/tarif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_tarif: id }),
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
      daya: "",
      tarifperkwh: "",
    })
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Kelola Tarif">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kelola Tarif">
      {/* Form Tambah/Edit Tarif */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              {editingId ? "Edit Tarif" : "Tambah Tarif Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Daya (VA)</label>
                  <Input
                    type="number"
                    value={formData.daya}
                    onChange={(e) => setFormData({ ...formData, daya: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="900"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Tarif per kWh</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tarifperkwh}
                    onChange={(e) => setFormData({ ...formData, tarifperkwh: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="1352.00"
                    required
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white font-semibold border-0"
                    style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }}
                  >
                    {isSubmitting ? <LoadingSpinner /> : editingId ? "Update Tarif" : "Tambah Tarif"}
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="outline"
                      className="border-0 text-white hover:bg-slate-700 bg-transparent"
                    >
                      Batal
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabel Data Tarif */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Data Tarif ({tarifData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(100, 116, 139, 0.3)" }}>
                    <th className="text-left py-3 px-4 text-white font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Daya (VA)</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Tarif per kWh</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tarifData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        Belum ada data tarif
                      </td>
                    </tr>
                  ) : (
                    tarifData.map((tarif, index) => (
                      <motion.tr
                        key={tarif.id_tarif}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b hover:bg-slate-800/30 transition-colors"
                        style={{ borderColor: "rgba(100, 116, 139, 0.2)" }}
                      >
                        <td className="py-3 px-4 text-white font-mono">{tarif.id_tarif}</td>
                        <td className="py-3 px-4 text-yellow-400">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            {tarif.daya} VA
                          </div>
                        </td>
                        <td className="py-3 px-4 text-green-400 font-mono">Rp {tarif.tarifperkwh.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(tarif)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(tarif.id_tarif, tarif.daya)}
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
