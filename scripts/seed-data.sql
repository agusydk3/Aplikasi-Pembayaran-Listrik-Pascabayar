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
('admin', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Administrator', 1)
ON CONFLICT (username) DO NOTHING;

-- Insert sample customers (password: 123456)
INSERT INTO pelanggan (username, password, nomor_kwh, nama_pelanggan, id_tarif) VALUES 
('pelanggan1', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'KWH001', 'John Doe', 1),
('pelanggan2', '$2b$10$rOzJqQZQZQZQZQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKK', 'KWH002', 'Jane Smith', 2)
ON CONFLICT (username) DO NOTHING;
