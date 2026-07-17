-- Thêm cột certificates (JSONB) vào bảng candidates để lưu thông tin chứng chỉ chức danh nghề nghiệp
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb;
