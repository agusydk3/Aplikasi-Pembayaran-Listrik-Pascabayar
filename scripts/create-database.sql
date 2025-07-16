-- Create tables for electricity billing system
CREATE TABLE IF NOT EXISTS level (
    id_level SERIAL PRIMARY KEY,
    nama_level VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_admin VARCHAR(100) NOT NULL,
    id_level INTEGER REFERENCES level(id_level)
);

CREATE TABLE IF NOT EXISTS tarif (
    id_tarif SERIAL PRIMARY KEY,
    daya INTEGER NOT NULL,
    tarifperkwh DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pelanggan (
    id_pelanggan SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nomor_kwh VARCHAR(20) UNIQUE NOT NULL,
    nama_pelanggan VARCHAR(100) NOT NULL,
    alamat VARCHAR(255) NOT NULL,
    id_tarif INTEGER REFERENCES tarif(id_tarif)
);

CREATE TABLE IF NOT EXISTS penggunaan (
    id_penggunaan SERIAL PRIMARY KEY,
    id_pelanggan INTEGER REFERENCES pelanggan(id_pelanggan),
    bulan INTEGER NOT NULL,
    tahun INTEGER NOT NULL,
    meter_awal INTEGER NOT NULL,
    meter_akhir INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tagihan (
    id_tagihan SERIAL PRIMARY KEY,
    id_penggunaan INTEGER REFERENCES penggunaan(id_penggunaan),
    id_pelanggan INTEGER REFERENCES pelanggan(id_pelanggan),
    bulan INTEGER NOT NULL,
    tahun INTEGER NOT NULL,
    jumlah_meter INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'sudah_bayar'))
);

CREATE TABLE IF NOT EXISTS pembayaran (
    id_pembayaran SERIAL PRIMARY KEY,
    id_tagihan INTEGER REFERENCES tagihan(id_tagihan),
    id_pelanggan INTEGER REFERENCES pelanggan(id_pelanggan),
    tanggal_pembayaran TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bulan_bayar INTEGER NOT NULL,
    biaya_admin DECIMAL(10,2) DEFAULT 2500,
    total_bayar DECIMAL(10,2) NOT NULL
);
