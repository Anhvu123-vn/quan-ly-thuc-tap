-- Script để tạo user admin với password "password123"
-- Chạy script này trong PostgreSQL để tạo tài khoản admin test

-- Xóa user admin cũ nếu có
DELETE FROM users WHERE email = 'admin@test.com';

-- Tạo user admin mới (password: password123)
INSERT INTO users (id, name, email, password_hash, role, avatar, phone, department, status) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin Test',
  'admin@test.com',
  '$2a$10$YourHashHere', -- Sẽ được update bằng code
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  '0901234567',
  'Administration',
  'active'
);

-- Sau đó chạy trong backend để update password hash đúng:
-- await bcrypt.hash('password123', 10)
