-- Tạm thời xóa các bảng cũ (LƯU Ý: Xóa sạch dữ liệu cũ)
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS secretaries;

-- 0. Bảng Thư ký (Secretaries)
CREATE TABLE secretaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  departments text[] DEFAULT '{}'
);

-- 1. Bảng Đợt xét (Batches)
CREATE TABLE batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  type text NOT NULL, -- VD: III->II
  quota integer NOT NULL, -- Chỉ tiêu
  deadline text NOT NULL,
  "isActive" boolean DEFAULT true
);

-- 2. Bảng Tổ chuyên môn (Departments) do Admin quản lý
CREATE TABLE departments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE
);

-- 3. Bảng Ứng viên (Candidates)
CREATE TABLE candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  
  -- Trạng thái hồ sơ: 'draft' (nháp/chờ duyệt), 'verified' (tổ trưởng đã xác nhận), 'rejected' (yêu cầu sửa)
  status text DEFAULT 'draft',
  
  -- I. Thông tin cá nhân
  cccd text NOT NULL,
  "fullName" text NOT NULL,
  dob text,
  gender text,
  ethnicity text,
  unit text, -- Tên tổ chuyên môn (lấy từ departments)
  "currentTitle" text,
  "targetTitle" text,
  
  -- II. Thông tin công tác
  "decisionRecruitment" jsonb DEFAULT '{"date": "", "number": "", "issuer": ""}'::jsonb,
  "decisionProbation" jsonb DEFAULT '{"date": "", "number": "", "issuer": ""}'::jsonb,
  "decisionAppointment" jsonb DEFAULT '{"date": "", "number": "", "issuer": ""}'::jsonb,
  "decisionSalary" jsonb DEFAULT '{"date": "", "number": "", "issuer": ""}'::jsonb,
  
  -- III. Văn bằng
  degrees jsonb DEFAULT '[]'::jsonb,
  
  -- IV, V, VI. Các thành phần hồ sơ khác
  "resumeDoc" boolean DEFAULT false,
  "certIT" boolean DEFAULT false,
  "certLanguage" boolean DEFAULT false,
  "reviewDoc" boolean DEFAULT false,
  
  -- Thành tích
  achievements jsonb DEFAULT '[]'::jsonb,

  UNIQUE(batch_id, cccd)
);

-- Bật RLS và cấp quyền Public cho cả 4 bảng
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE secretaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users on batches" ON batches FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users on departments" ON departments FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users on candidates" ON candidates FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users on secretaries" ON secretaries FOR ALL TO public USING (true) WITH CHECK (true);
