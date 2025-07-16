import bcrypt from "bcryptjs"
import { supabase } from "./supabase"
import jwt from "jsonwebtoken"

// Secret key untuk JWT, sebaiknya disimpan di environment variable
const JWT_SECRET = process.env.JWT_SECRET || "listrik-app-secret-key"

export interface User {
  id_user?: number
  id_pelanggan?: number
  username: string
  nama_admin?: string
  nama_pelanggan?: string
  nomor_kwh?: string
  alamat?: string
  daya?: number
  tarifperkwh?: number
  id_level?: number
  level: "admin" | "customer"
}

export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    // Check admin users first
    const { data: adminData, error: adminError } = await supabase
      .from("user")
      .select(`
        id_user,
        username,
        password,
        nama_admin,
        id_level,
        level:level(nama_level)
      `)
      .eq("username", username)
      .single()

    if (adminData && !adminError) {
      const isValidPassword = await bcrypt.compare(password, adminData.password)
      if (isValidPassword) {
        return {
          id_user: adminData.id_user,
          username: adminData.username,
          nama_admin: adminData.nama_admin,
          id_level: adminData.id_level,
          level: "admin",
        }
      }
    }

    // Check customer users
    const { data: customerData, error: customerError } = await supabase
      .from("pelanggan")
      .select(`
        id_pelanggan,
        username,
        password,
        nama_pelanggan,
        nomor_kwh,
        alamat,
        id_tarif
      `)
      .eq("username", username)
      .single()

    if (customerData && !customerError) {
      const isValidPassword = await bcrypt.compare(password, customerData.password)
      if (isValidPassword) {
        // Get tariff data for the customer
        const { data: tarifData, error: tarifError } = await supabase
          .from("tarif")
          .select("daya, tarifperkwh")
          .eq("id_tarif", customerData.id_tarif)
          .single()

        return {
          id_pelanggan: customerData.id_pelanggan,
          username: customerData.username,
          nama_pelanggan: customerData.nama_pelanggan,
          nomor_kwh: customerData.nomor_kwh,
          alamat: customerData.alamat || "",
          daya: tarifData?.daya || 0,
          tarifperkwh: parseFloat(tarifData?.tarifperkwh) || 0,
          level: "customer",
        }
      }
    }

    return null
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

// Fungsi untuk membuat JWT token
export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" })
}

// Fungsi untuk memverifikasi dan mendekode JWT token
export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Middleware untuk memeriksa apakah request memiliki token yang valid
export function authenticateToken(authHeader: string | null): User | null {
  if (!authHeader) return null
  
  const token = authHeader.split(" ")[1]
  if (!token) return null
  
  return verifyToken(token)
}
