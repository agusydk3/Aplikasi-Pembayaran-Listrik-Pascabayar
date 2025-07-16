"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Zap, User, Lock, LogIn, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

          await Swal.fire({
            icon: "success",
            title: "Login Berhasil!",
          text: `Selamat datang, ${data.user.nama_admin || data.user.nama_pelanggan}`,
            timer: 2000,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#f1f5f9",
            iconColor: "#10b981",
        });

        if (data.user.level === "admin") {
          router.push("/admin/dashboard");
          } else {
          router.push("/customer/dashboard");
          }
        } else {
          await Swal.fire({
            icon: "error",
            title: "Login Gagal",
          text: data.message || "Username atau password salah",
            background: "#0f172a",
            color: "#f1f5f9",
            iconColor: "#ef4444",
        });
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan saat login",
          background: "#0f172a",
          color: "#f1f5f9",
          iconColor: "#ef4444",
      });
      } finally {
      setIsLoading(false);
      }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 50%, #312e81 100%)",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(59, 130, 246, 0.2)" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(147, 51, 234, 0.2)" }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ background: "rgba(6, 182, 212, 0.15)" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23334155' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card
            className="border-0 shadow-2xl"
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.1)",
            }}
          >
            <CardHeader className="text-center space-y-6 pb-8">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto relative"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-75"
                    style={{
                      background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <Zap className="w-10 h-10 text-white relative z-10" />
                </div>
                <div
                  className="absolute inset-0 w-20 h-20 rounded-2xl blur-xl opacity-50 -z-10"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  }}
                />
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <CardTitle
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #bfdbfe 50%, #ddd6fe 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Sistem Listrik Pascabayar
                </CardTitle>
                <CardDescription className="mt-3 text-base" style={{ color: "#94a3b8" }}>
                  Masuk ke akun Anda untuk melanjutkan
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Username Field */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium flex items-center" style={{ color: "#cbd5e1" }}>
                    <User className="w-4 h-4 mr-2" />
                    Username
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 border-0 text-white placeholder-slate-500 transition-all duration-300"
                      style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        borderColor: "rgba(100, 116, 139, 0.5)",
                      }}
                      placeholder="Masukkan username"
                      required
                    />
                    <div
                      className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium flex items-center" style={{ color: "#cbd5e1" }}>
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-0 text-white placeholder-slate-500 pr-12 transition-all duration-300"
                      style={{
                        background: "rgba(30, 41, 59, 0.5)",
                        borderColor: "rgba(100, 116, 139, 0.5)",
                      }}
                      placeholder="Masukkan password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                      style={{ color: "#94a3b8" }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div
                      className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Login Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25)",
                    }}
                  >
                    {isLoading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                        <LoadingSpinner />
                        <span className="ml-2">Memproses...</span>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} className="flex items-center justify-center">
                        <LogIn className="w-5 h-5 mr-2" />
                        Masuk
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Demo Accounts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-4 rounded-xl border"
                style={{
                  background: "rgba(30, 41, 59, 0.3)",
                  borderColor: "rgba(100, 116, 139, 0.5)",
                }}
              >
                <div className="text-center">
                  <p className="text-sm font-medium mb-3" style={{ color: "#cbd5e1" }}>
                    Demo Accounts:
                  </p>
                  <div className="space-y-2 text-xs">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-2 rounded-lg border"
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        borderColor: "rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      <span className="font-medium" style={{ color: "#60a5fa" }}>
                        Admin:
                      </span>
                      <span style={{ color: "#cbd5e1" }}>admin / admin123</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-2 rounded-lg border"
                      style={{
                        background: "rgba(34, 197, 94, 0.1)",
                        borderColor: "rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <span className="font-medium" style={{ color: "#4ade80" }}>
                        Customer:
                      </span>
                      <span style={{ color: "#cbd5e1" }}>pelanggan1 / 123456</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
