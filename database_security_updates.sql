-- 1. B? sung các c?t cho b?ng teachers
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 2. B? sung các c?t cho b?ng heads
ALTER TABLE public.heads 
ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 3. B? sung các c?t cho b?ng secretaries
ALTER TABLE public.secretaries 
ADD COLUMN IF NOT EXISTS failed_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 4. T?o b?ng ghi nh?n l?ch s? truy c?p (access_logs)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'LOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Cho phép t?t c? insert vào access_logs (ho?c tu? policy b?o m?t c?a b?n)
-- N?u có b?t RLS, c?n thêm policy:
-- CREATE POLICY "Cho phép m?i ngu?i thêm log" ON public.access_logs FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Ch? admin du?c xem log" ON public.access_logs FOR SELECT USING (true); -- Tu? ch?nh theo ý mu?n
