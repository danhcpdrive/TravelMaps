/**
 * TRAVEL MAPS - SCRIPT KHỞI TẠO CẤU TRÚC DATABASE & DỮ LIỆU CỐT LÕI
 * Rút gọn chỉ bao gồm:
 *  - Lệnh tạo tất cả các bảng (CREATE TABLE IF NOT EXISTS), View, Indexes, RLS
 *  - Dữ liệu tài khoản quản trị Admin Trùm (caophuocdanh@hotmail.com)
 *  - Dữ liệu 5 nhóm dịch vụ chuẩn
 *  - Dữ liệu 7 thẻ tags cơ bản
 *  - Dữ liệu đầy đủ 63 tỉnh thành Việt Nam
 * (Các địa điểm du lịch, review, chi tiêu mẫu người dùng tự nhập hoặc import từ file sqlsample.sql)
 */
export const CREATE_TABLE_SQL = `-- =============================================================================
-- TRAVEL MAPS - SCRIPT KHỞI TẠO CẤU TRÚC DATABASE & DỮ LIỆU CỐT LÕI (SCHEMA DDL)
-- =============================================================================
-- Hướng dẫn: Dán toàn bộ mã này vào Supabase SQL Editor và nhấn "Run".
-- Script bao gồm:
--  1. Các tiện ích mở rộng PostgreSQL (uuid-ossp, pgcrypto).
--  2. Toàn bộ câu lệnh CREATE TABLE (travel_users, travel_groups, travel_cities,
--     travel_locations, travel_location_details, travel_tags, travel_trips, ...)
--  3. View tổng hợp public.travel_places_view.
--  4. Chỉ mục tối ưu hiệu năng & Row Level Security (RLS) policies.
--  5. Dữ liệu mồi cần thiết: Tài khoản Admin Trùm, 5 Nhóm Dịch Vụ, 63 Tỉnh Thành VN.
-- (Các dữ liệu địa điểm, review, chi tiêu mẫu bạn có thể tự nhập hoặc import từ sqlsample.sql)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG & TÀI KHOẢN (travel_users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  avatar_url TEXT,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. BẢNG PHÂN NHÓM DỊCH VỤ (travel_groups)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  badge_bg VARCHAR(100),
  marker_color VARCHAR(50),
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. BẢNG THÀNH PHỐ / TỈNH THÀNH (travel_cities)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_cities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. BẢNG ĐỊA ĐIỂM CỐT LÕI (travel_locations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_locations (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_id VARCHAR(50) REFERENCES public.travel_groups(id) ON DELETE SET NULL,
  city_id VARCHAR(50) REFERENCES public.travel_cities(id) ON DELETE SET NULL,
  category VARCHAR(100),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  contact VARCHAR(100),
  checked BOOLEAN DEFAULT FALSE,
  visited_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. BẢNG CHI TIẾT ĐỊA ĐIỂM (travel_location_details)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_location_details (
  id VARCHAR(100) PRIMARY KEY,
  location_id VARCHAR(100) UNIQUE REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  price_range VARCHAR(100),
  opening_hours VARCHAR(100),
  best_time_to_visit VARCHAR(255),
  notes TEXT,
  travel_tips TEXT,
  specialties TEXT,
  thumbnail_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  website_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động tương thích ngược: Chuyển đổi gallery_urls sang JSONB nếu bảng cũ đang lưu dạng TEXT[] hoặc ARRAY
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'travel_location_details' 
      AND column_name = 'gallery_urls' 
      AND (data_type = 'ARRAY' OR udt_name = '_text' OR udt_name = '_varchar')
  ) THEN
    ALTER TABLE public.travel_location_details 
      ALTER COLUMN gallery_urls DROP DEFAULT;
    ALTER TABLE public.travel_location_details 
      ALTER COLUMN gallery_urls TYPE JSONB USING COALESCE(to_jsonb(gallery_urls), '[]'::jsonb);
    ALTER TABLE public.travel_location_details 
      ALTER COLUMN gallery_urls SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. BẢNG THẺ TAGS (travel_tags & travel_location_tags)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_tags (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.travel_location_tags (
  location_id VARCHAR(100) REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  tag_id VARCHAR(50) REFERENCES public.travel_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (location_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- 7. BẢNG LỊCH TRÌNH CHUYẾN ĐI (travel_trips & travel_trip_stops)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_trips (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2) DEFAULT 0,
  cover_image TEXT,
  status VARCHAR(50) DEFAULT 'planning',
  total_distance_km NUMERIC(10, 2) DEFAULT 0,
  total_expenses NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.travel_trip_stops (
  id VARCHAR(100) PRIMARY KEY,
  trip_id VARCHAR(100) REFERENCES public.travel_trips(id) ON DELETE CASCADE,
  location_id VARCHAR(100) REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  day_number INT DEFAULT 1,
  visit_time VARCHAR(50),
  order_index INT DEFAULT 1,
  transport_mode VARCHAR(50) DEFAULT 'driving',
  stop_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. BẢNG NHẬT KÝ & ĐÁNH GIÁ (travel_reviews_logs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_reviews_logs (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  location_id VARCHAR(100) REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  rating NUMERIC(3, 1) DEFAULT 5,
  actual_expense NUMERIC(15, 2) DEFAULT 0,
  review_text TEXT,
  captured_photos JSONB DEFAULT '[]'::jsonb,
  weather VARCHAR(100),
  companion VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động tương thích ngược: Chuyển đổi captured_photos sang JSONB nếu bảng cũ đang lưu dạng TEXT[] hoặc ARRAY
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'travel_reviews_logs' 
      AND column_name = 'captured_photos' 
      AND (data_type = 'ARRAY' OR udt_name = '_text' OR udt_name = '_varchar')
  ) THEN
    ALTER TABLE public.travel_reviews_logs 
      ALTER COLUMN captured_photos DROP DEFAULT;
    ALTER TABLE public.travel_reviews_logs 
      ALTER COLUMN captured_photos TYPE JSONB USING COALESCE(to_jsonb(captured_photos), '[]'::jsonb);
    ALTER TABLE public.travel_reviews_logs 
      ALTER COLUMN captured_photos SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 9. BẢNG SỔ CHI TIÊU (travel_expenses)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_expenses (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  trip_id VARCHAR(100) REFERENCES public.travel_trips(id) ON DELETE SET NULL,
  location_id VARCHAR(100) REFERENCES public.travel_locations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'food',
  amount NUMERIC(15, 2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'cash',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. BẢNG BÁO CÁO SAI SÓT / VI PHẠM (travel_reports)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_reports (
  id VARCHAR(100) PRIMARY KEY,
  location_id VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  location_address TEXT,
  reported_by_user_id VARCHAR(100),
  reported_by_user_name VARCHAR(255),
  reported_by_user_email VARCHAR(255),
  reason VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  proof_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. BẢNG NHẬT KÝ KIỂM TOÁN (travel_audit_logs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.travel_audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changed_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. VIEW TỔNG HỢP TIỆN DỤNG (travel_places_view)
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.travel_places_view CASCADE;
CREATE OR REPLACE VIEW public.travel_places_view AS
SELECT
  l.id,
  l.name,
  l.group_id,
  l.group_id AS "group",
  g.name AS group_name,
  g.icon AS group_icon,
  l.city_id,
  c.name AS city_name,
  l.category,
  l.lat,
  l.lng,
  l.address,
  l.phone,
  l.contact,
  l.checked,
  l.visited_at,
  l.is_favorite,
  l.is_deleted,
  l.deleted_at,
  COALESCE(d.rating, 4.8) AS rating,
  COALESCE(d.price_range, '') AS price_range,
  COALESCE(d.opening_hours, '') AS opening_hours,
  COALESCE(d.best_time_to_visit, '') AS best_time_to_visit,
  COALESCE(d.notes, '') AS notes,
  COALESCE(d.travel_tips, '') AS travel_tips,
  COALESCE(d.specialties, '') AS specialties,
  COALESCE(d.thumbnail_url, '') AS thumbnail_url,
  CASE 
    WHEN d.gallery_urls IS NULL THEN '[]'::jsonb 
    ELSE to_jsonb(d.gallery_urls) 
  END AS gallery_urls,
  COALESCE(d.website_url, '') AS website_url,
  l.created_at,
  l.updated_at
FROM public.travel_locations l
LEFT JOIN public.travel_location_details d ON l.id = d.location_id
LEFT JOIN public.travel_groups g ON l.group_id = g.id
LEFT JOIN public.travel_cities c ON l.city_id = c.id
WHERE l.is_deleted = FALSE;

-- -----------------------------------------------------------------------------
-- 13. CHỈ MỤC TỐI ƯU HIỆU NĂNG TÌM KIẾM
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_travel_locations_city ON public.travel_locations (city_id);
CREATE INDEX IF NOT EXISTS idx_travel_locations_group ON public.travel_locations (group_id);
CREATE INDEX IF NOT EXISTS idx_travel_locations_coords ON public.travel_locations (lat, lng);
CREATE INDEX IF NOT EXISTS idx_travel_locations_deleted ON public.travel_locations (is_deleted);
CREATE INDEX IF NOT EXISTS idx_travel_trips_user ON public.travel_trips (user_id);
CREATE INDEX IF NOT EXISTS idx_travel_reviews_loc ON public.travel_reviews_logs (location_id);
CREATE INDEX IF NOT EXISTS idx_travel_reviews_user ON public.travel_reviews_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_travel_expenses_user ON public.travel_expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_travel_reports_status ON public.travel_reports (status);

-- -----------------------------------------------------------------------------
-- 14. KÍCH HOẠT BẢO MẬT ROW LEVEL SECURITY (RLS) & CHÍNH SÁCH TRUY CẬP
-- -----------------------------------------------------------------------------
ALTER TABLE public.travel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_location_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_location_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_reviews_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_users' AND policyname = 'Public Access travel_users') THEN
    CREATE POLICY "Public Access travel_users" ON public.travel_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_groups' AND policyname = 'Public Access travel_groups') THEN
    CREATE POLICY "Public Access travel_groups" ON public.travel_groups FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_cities' AND policyname = 'Public Access travel_cities') THEN
    CREATE POLICY "Public Access travel_cities" ON public.travel_cities FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_locations' AND policyname = 'Public Access travel_locations') THEN
    CREATE POLICY "Public Access travel_locations" ON public.travel_locations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_location_details' AND policyname = 'Public Access travel_location_details') THEN
    CREATE POLICY "Public Access travel_location_details" ON public.travel_location_details FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_tags' AND policyname = 'Public Access travel_tags') THEN
    CREATE POLICY "Public Access travel_tags" ON public.travel_tags FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_location_tags' AND policyname = 'Public Access travel_location_tags') THEN
    CREATE POLICY "Public Access travel_location_tags" ON public.travel_location_tags FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_trips' AND policyname = 'Public Access travel_trips') THEN
    CREATE POLICY "Public Access travel_trips" ON public.travel_trips FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_trip_stops' AND policyname = 'Public Access travel_trip_stops') THEN
    CREATE POLICY "Public Access travel_trip_stops" ON public.travel_trip_stops FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_reviews_logs' AND policyname = 'Public Access travel_reviews_logs') THEN
    CREATE POLICY "Public Access travel_reviews_logs" ON public.travel_reviews_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_expenses' AND policyname = 'Public Access travel_expenses') THEN
    CREATE POLICY "Public Access travel_expenses" ON public.travel_expenses FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'travel_reports' AND policyname = 'Public Access travel_reports') THEN
    CREATE POLICY "Public Access travel_reports" ON public.travel_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =============================================================================
-- DỮ LIỆU CỐT LÕI KHỞI TẠO (ESSENTIAL SEED DATA)
-- =============================================================================

-- A. TÀI KHOẢN QUẢN TRỊ VIÊN ADMIN DUY NHẤT
DELETE FROM public.travel_users WHERE email IN ('viewer@travelmaps.vn', 'admin@travelmaps.vn', 'user@travelmaps.vn');

INSERT INTO public.travel_users (id, name, email, password, role, avatar_url, phone, status)
VALUES
  (
    'user-admin-trum',
    'Trùm',
    'caophuocdanh@hotmail.com',
    '$2b$10$Hqf.M6Ogn/h87uFdhFvok.X3JseEfHBrLNGhD56hV0mt0jOR24At2',
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    '0901234567',
    'active'
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status;

-- B. 5 PHÂN NHÓM DỊCH VỤ CƠ BẢN
INSERT INTO public.travel_groups (id, name, icon, badge_bg, marker_color, description, sort_order)
VALUES
  ('du_lich', 'Du lịch & Thắng cảnh', '🏖️', 'bg-emerald-100 text-emerald-800 border-emerald-300', '#059669', 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo', 1),
  ('an_uong', 'Ẩm thực & Quán ăn', '🍜', 'bg-amber-100 text-amber-800 border-amber-300', '#d97706', 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe', 2),
  ('dich_vu', 'Khách sạn & Tiện ích', '🏨', 'bg-blue-100 text-blue-800 border-blue-300', '#2563eb', 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách', 3),
  ('giai_tri', 'Vui chơi & Giải trí', '🎡', 'bg-purple-100 text-purple-800 border-purple-300', '#9333ea', 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc', 4),
  ('khac', 'Khác & Ghi nhớ', '📌', 'bg-slate-100 text-slate-800 border-slate-300', '#475569', 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  badge_bg = EXCLUDED.badge_bg,
  marker_color = EXCLUDED.marker_color,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- C. DANH MỤC 7 THẺ GẮN TAGS CƠ BẢN
INSERT INTO public.travel_tags (id, name, color, icon)
VALUES
  ('song_ao', 'Sống Ảo / Check-in', 'pink', '📸'),
  ('dac_san', 'Đặc Sản Địa Phương', 'amber', '🍲'),
  ('view_hoang_hon', 'View Hoàng Hôn', 'orange', '🌅'),
  ('gia_dinh', 'Thích Hợp Gia Đình', 'blue', '👨‍👩‍👧‍👦'),
  ('michelin', 'Michelin Selected', 'red', '⭐'),
  ('view_bien', 'View Biển / View Hồ', 'cyan', '🌊'),
  ('gia_binh_dan', 'Giá Bình Dân', 'emerald', '💵')
ON CONFLICT (id) DO NOTHING;

-- D. ĐẦY ĐỦ 63 TỈNH THÀNH / THÀNH PHỐ TOÀN QUỐC VIỆT NAM
INSERT INTO public.travel_cities (id, name, code, lat, lng, sort_order)
VALUES
  ('ha_noi', 'Hà Nội', 'HAN', 21.0285, 105.8542, 1),
  ('hai_phong', 'Hải Phòng', 'HPH', 20.8449, 106.6881, 2),
  ('quang_ninh', 'Quảng Ninh / Hạ Long', 'VHL', 20.95, 107.0833, 3),
  ('lao_cai', 'Lào Cai / Sa Pa', 'SAP', 22.4856, 103.9707, 4),
  ('ninh_binh', 'Ninh Bình', 'NBH', 20.2506, 105.9744, 5),
  ('ha_giang', 'Hà Giang', 'HGI', 22.8233, 104.9839, 6),
  ('cao_bang', 'Cao Bằng', 'CBG', 22.6657, 105.9739, 7),
  ('yen_bai', 'Yên Bái', 'YBI', 21.705, 104.875, 8),
  ('dien_bien', 'Điện Biên', 'DBN', 21.3861, 103.0231, 9),
  ('vinh_phuc', 'Vĩnh Phúc', 'VPC', 21.3089, 105.6047, 10),
  ('bac_giang', 'Bắc Giang', 'BGG', 21.2731, 106.1946, 11),
  ('bac_kan', 'Bắc Kạn', 'BKN', 22.147, 105.8348, 12),
  ('bac_ninh', 'Bắc Ninh', 'BNH', 21.1861, 106.0763, 13),
  ('ha_nam', 'Hà Nam', 'HNM', 20.5452, 105.9122, 14),
  ('hai_duong', 'Hải Dương', 'HDG', 20.9364, 106.315, 15),
  ('hoa_binh', 'Hòa Bình', 'HBH', 20.8133, 105.3383, 16),
  ('hung_yen', 'Hưng Yên', 'HYN', 20.6464, 106.0511, 17),
  ('lai_chau', 'Lai Châu', 'LCU', 22.3964, 103.4589, 18),
  ('lang_son', 'Lạng Sơn', 'LSN', 21.8533, 106.7611, 19),
  ('nam_dinh', 'Nam Định', 'NDH', 20.4333, 106.1833, 20),
  ('phu_tho', 'Phú Thọ', 'PTO', 21.3228, 105.215, 21),
  ('son_la', 'Sơn La', 'SLA', 21.3256, 103.9189, 22),
  ('thai_binh', 'Thái Bình', 'TBH', 20.45, 106.3333, 23),
  ('thai_nguyen', 'Thái Nguyên', 'TNN', 21.5928, 105.8442, 24),
  ('tuyen_quang', 'Tuyên Quang', 'TQG', 21.8239, 105.2158, 25),
  ('da_nang', 'Đà Nẵng', 'DAD', 16.0544, 108.2022, 26),
  ('quang_nam', 'Quảng Nam / Hội An', 'VNHAN', 15.8801, 108.338, 27),
  ('thua_thien_hue', 'Thừa Thiên Huế', 'HUI', 16.4637, 107.5909, 28),
  ('khanh_hoa', 'Khánh Hòa / Nha Trang', 'NHA', 12.2388, 109.1967, 29),
  ('lam_dong', 'Lâm Đồng / Đà Lạt', 'DLI', 11.9404, 108.4583, 30),
  ('quang_binh', 'Quảng Bình', 'QBH', 17.4686, 106.6222, 31),
  ('quang_tri', 'Quảng Trị', 'QTI', 16.75, 107.1833, 32),
  ('quang_ngai', 'Quảng Ngãi', 'QNI', 15.12, 108.8, 33),
  ('binh_dinh', 'Bình Định / Quy Nhơn', 'BDH', 13.783, 109.2197, 34),
  ('phu_yen', 'Phú Yên', 'PYU', 13.0883, 109.2925, 35),
  ('ninh_thuan', 'Ninh Thuận', 'NTH', 11.5667, 108.9833, 36),
  ('binh_thuan', 'Bình Thuận / Phan Thiết', 'BTN', 10.9333, 108.1, 37),
  ('thanh_hoa', 'Thanh Hóa', 'THA', 19.8, 105.7667, 38),
  ('nghe_an', 'Nghệ An', 'NAN', 18.6733, 105.6811, 39),
  ('ha_tinh', 'Hà Tĩnh', 'HTH', 18.343, 105.9058, 40),
  ('kon_tum', 'Kon Tum', 'KTM', 14.35, 108.0, 41),
  ('gia_lai', 'Gia Lai', 'GLAI', 13.9833, 108.0, 42),
  ('dak_lak', 'Đắk Lắk', 'DLK', 12.6667, 108.05, 43),
  ('dak_nong', 'Đắk Nông', '', 12.0042, 107.6875, 44),
  ('ho_chi_minh', 'TP. Hồ Chí Minh', 'SGN', 10.8231, 106.6297, 45),
  ('can_tho', 'Cần Thơ', 'VCA', 10.0452, 105.7469, 46),
  ('ba_ria_vung_tau', 'Bà Rịa - Vũng Tàu', 'VTG', 10.346, 107.0843, 47),
  ('kien_giang', 'Kiên Giang / Phú Quốc', 'PQC', 10.0125, 105.0809, 48),
  ('an_giang', 'An Giang', 'AGG', 10.5381, 105.1259, 49),
  ('bac_lieu', 'Bạc Liêu', 'BLU', 9.2941, 105.7244, 50),
  ('ben_tre', 'Bến Tre', 'BTE', 10.2432, 106.3751, 51),
  ('binh_duong', 'Bình Dương', 'BDG', 11.1604, 106.652, 52),
  ('binh_phuoc', 'Bình Phước', 'BPC', 11.6473, 106.892, 53),
  ('ca_mau', 'Cà Mau', 'CMU', 9.1769, 105.1524, 54),
  ('dong_nai', 'Đồng Nai', 'DNI', 10.945, 106.8247, 55),
  ('dong_thap', 'Đồng Tháp', 'DTP', 10.4938, 105.6881, 56),
  ('hau_giang', 'Hậu Giang', 'HGI2', 9.7842, 105.4701, 57),
  ('long_an', 'Long An', 'LAN', 10.5362, 106.4086, 58),
  ('soc_trang', 'Sóc Trăng', 'STG', 9.6033, 105.98, 59),
  ('tay_ninh', 'Tây Ninh', 'TNI', 11.31, 106.0983, 60),
  ('tien_giang', 'Tiền Giang', 'TGG', 10.4283, 106.3408, 61),
  ('tra_vinh', 'Trà Vinh', 'TVH', 9.9347, 106.3453, 62),
  ('vinh_long', 'Vĩnh Long', 'VLG', 10.2536, 105.9722, 63)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  sort_order = EXCLUDED.sort_order;
`;

export const SQL_SAMPLE_SCRIPT = CREATE_TABLE_SQL;
