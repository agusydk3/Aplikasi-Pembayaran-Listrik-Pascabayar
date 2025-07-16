-- Insert initial data
INSERT INTO level (nama_level) VALUES 
('Administrator'), 
('Pelanggan')
ON CONFLICT DO NOTHING;

INSERT INTO tarif (daya, tarifperkwh) VALUES 
(900, 1352.00),
(1300, 1444.70),
(2200, 1699.53)
ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO "user" (username, password, nama_admin, id_level) VALUES 
('admin', '$2b$10$eDE61dxMgYj19rY4gH0c/.1rZgE7a29wrkB9ke4eFmLlD71Q4QhA2', 'Administrator', 1)
ON CONFLICT (username) DO NOTHING;

-- Insert sample customers (password: 123456)
INSERT INTO pelanggan (username, password, nomor_kwh, nama_pelanggan, id_tarif, alamat) VALUES 
('pelanggan1', '$2b$10$fiU22Ovz6fy0wTa6nnaxu.tkYIpRGDjboihniwCv8zXuNVSvz7bLq', 'KWH001', 'Daniel', 1, 'Jl. Merdeka No. 123')
ON CONFLICT (username) DO NOTHING;

