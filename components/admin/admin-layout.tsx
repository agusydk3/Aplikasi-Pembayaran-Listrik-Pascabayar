"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Zap, LogOut } from "lucide-react"

interface AdminUser {
  nama_admin: string
  username: string
  level: string
}

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  useEffect(() => {
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
  }, [router])

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
      background: "#0f172a",
      color: "#f1f5f9",
    })

    if (result.isConfirmed) {
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 50%, #312e81 100%)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 50%, #312e81 100%)" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(100, 116, 139, 0.5)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)" }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  Sistem Listrik Pascabayar
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.nama_admin}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Administrator
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-0 text-white hover:bg-slate-700 bg-transparent"
                style={{ borderColor: "rgba(100, 116, 139, 0.5)" }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push("/admin/dashboard")}
              variant="outline"
              size="sm"
              className="border-0 text-white hover:bg-slate-700 bg-transparent"
              style={{ borderColor: "rgba(100, 116, 139, 0.5)" }}
            >
              ← Kembali ke Dashboard
            </Button>
          </div>
        </motion.div>

        {children}
      </main>
    </div>
  )
}
