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
import { Users, Plus, Edit, Trash2, Zap, MapPin } from "lucide-react"

interface Pelanggan {
  id_pelanggan: number
  username: string
  nomor_kwh: string
  nama_pelanggan: string
  alamat: string
  id_tarif: number
  tarif: {
    id_tarif: number
    daya: number
    tarifperkwh: number
  }
}

interface Tarif {
  id_tarif: number
  daya: number
  tarifperkwh: number
}

export default function PelangganPage() {
  const [pelangganData, setPelangganData] = useState<Pelanggan[]>([])
  const [tarifList, setTarifList] = useState<Tarif[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nomor_kwh: "",
    nama_pelanggan: "",
    alamat: "",
    id_tarif: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/pelanggan")
      const data = await response.json()
      setPelangganData(data.pelangganData || [])
      setTarifList(data.tarifList || [])
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
      const payload = editingId ? { action, id_pelanggan: editingId, ...formData } : { action, ...formData }

      const response = await fetch("/api/admin/pelanggan", {
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

  const handleEdit = (pelanggan: Pelanggan) => {
    setFormData({
      username: pelanggan.username,
      password: "",
      nomor_kwh: pelanggan.nomor_kwh,
      nama_pelanggan: pelanggan.nama_pelanggan,
      alamat: pelanggan.alamat || "",
      id_tarif: pelanggan.id_tarif.toString(),
    })
    setEditingId(pelanggan.id_pelanggan)
  }

  const handleDelete = async (id: number, nama: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Yakin ingin menghapus pelanggan "${nama}"?`,
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
        const response = await fetch("/api/admin/pelanggan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", id_pelanggan: id }),
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
      username: "",
      password: "",
      nomor_kwh: "",
      nama_pelanggan: "",
      alamat: "",
      id_tarif: "",
    })
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <AdminLayout title="Kelola Pelanggan">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Kelola Pelanggan">
      {/* Form Tambah/Edit Pelanggan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              {editingId ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Username</label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="Username"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Nama Pelanggan</label>
                  <Input
                    type="text"
                    value={formData.nama_pelanggan}
                    onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="Nama lengkap"
                    required
                  />
                </div>
                {!editingId && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="border-0 text-white placeholder-slate-400"
                      style={{ background: "rgba(30, 41, 59, 0.5)" }}
                      placeholder="Password"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Nomor KWH</label>
                  <Input
                    type="text"
                    value={formData.nomor_kwh}
                    onChange={(e) => setFormData({ ...formData, nomor_kwh: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="KWH001"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Alamat</label>
                  <Input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="border-0 text-white placeholder-slate-400"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    placeholder="Alamat lengkap"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Tarif</label>
                  <select
                    value={formData.id_tarif}
                    onChange={(e) => setFormData({ ...formData, id_tarif: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border-0 text-white"
                    style={{ background: "rgba(30, 41, 59, 0.5)" }}
                    required
                  >
                    <option value="">Pilih Tarif...</option>
                    {tarifList.map((tarif) => (
                      <option key={tarif.id_tarif} value={tarif.id_tarif} style={{ background: "#1e293b" }}>
                        {tarif.daya}VA - Rp {tarif.tarifperkwh.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white font-semibold border-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }}
                >
                  {isSubmitting ? <LoadingSpinner /> : editingId ? "Update Pelanggan" : "Tambah Pelanggan"}
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
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabel Data Pelanggan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card
          className="border-0 shadow-2xl"
          style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(20px)" }}
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Data Pelanggan ({pelangganData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(100, 116, 139, 0.3)" }}>
                    <th className="text-left py-3 px-4 text-white font-semibold">ID</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Username</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Nomor KWH</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Nama Pelanggan</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Alamat</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Daya</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Tarif per kWh</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pelangganData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        Belum ada data pelanggan
                      </td>
                    </tr>
                  ) : (
                    pelangganData.map((pelanggan, index) => (
                      <motion.tr
                        key={pelanggan.id_pelanggan}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b hover:bg-slate-800/30 transition-colors"
                        style={{ borderColor: "rgba(100, 116, 139, 0.2)" }}
                      >
                        <td className="py-3 px-4 text-white font-mono">{pelanggan.id_pelanggan}</td>
                        <td className="py-3 px-4 text-white">{pelanggan.username}</td>
                        <td className="py-3 px-4 text-blue-400 font-mono">{pelanggan.nomor_kwh}</td>
                        <td className="py-3 px-4 text-white font-semibold">{pelanggan.nama_pelanggan}</td>
                        <td className="py-3 px-4 text-white">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-purple-400" />
                            {pelanggan.alamat || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-yellow-400">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            {pelanggan.tarif.daya}VA
                          </div>
                        </td>
                        <td className="py-3 px-4 text-green-400 font-mono">
                          Rp {pelanggan.tarif.tarifperkwh.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleEdit(pelanggan)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(pelanggan.id_pelanggan, pelanggan.nama_pelanggan)}
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
