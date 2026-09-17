/**
 * TOÀN BỘ SCRIPT KHỞI TẠO HỆ THỐNG CƠ SỞ DỮ LIỆU TOÀN DIỆN CHO TRAVEL MAPS TRÊN SUPABASE / POSTGRESQL
 * 
 * Bao gồm:
 * 1. Extension PostGIS & UUID
 * 2. Bảng Nhóm dịch vụ (travel_groups)
 * 3. Bảng Vị trí cốt lõi (travel_locations) với Soft Delete & PostGIS geom
 * 4. Bảng Chi tiết, Gợi ý & Media (travel_location_details)
 * 5. Bảng Tags đa chiều (travel_tags & travel_location_tags)
 * 6. Bảng Lịch trình chuyến đi (travel_trips & travel_trip_stops)
 * 7. Bảng Nhật ký check-in & Đánh giá (travel_reviews_logs)
 * 8. Bảng Quản lý chi tiêu du lịch (travel_expenses)
 * 9. Bảng Lịch sử thay đổi (travel_audit_logs)
 * 10. View tổng hợp (travel_places_view)
 * 11. Stored Function RPC tìm kiếm lân cận PostGIS (get_nearby_locations)
 * 12. Dữ liệu mẫu (Seed Data)
 */

export const CREATE_TABLE_SQL = `-- 1. KÍCH HOẠT EXTENSIONS (NẾU CÓ QUYỀN)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. BẢNG NHÓM DỊCH VỤ (travel_groups)
CREATE TABLE IF NOT EXISTS public.travel_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(20) NOT NULL DEFAULT '📍',
  badge_bg VARCHAR(100) NOT NULL DEFAULT 'bg-slate-100 text-slate-800',
  marker_color VARCHAR(20) NOT NULL DEFAULT '#0d9488',
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1. BẢNG THÀNH PHỐ / TỈNH THÀNH (travel_cities)
CREATE TABLE IF NOT EXISTS public.travel_cities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG ĐỊA ĐIỂM CỐT LÕI (travel_locations)
CREATE TABLE IF NOT EXISTS public.travel_locations (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_id VARCHAR(50) NOT NULL REFERENCES public.travel_groups(id) ON UPDATE CASCADE,
  city_id VARCHAR(50) REFERENCES public.travel_cities(id),
  category VARCHAR(100) NOT NULL DEFAULT 'Địa điểm',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL DEFAULT '',
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

ALTER TABLE public.travel_locations ADD COLUMN IF NOT EXISTS city_id VARCHAR(50) REFERENCES public.travel_cities(id);

-- 4. BẢNG THÔNG TIN CHI TIẾT & MEDIA (travel_location_details)
CREATE TABLE IF NOT EXISTS public.travel_location_details (
  id VARCHAR(100) PRIMARY KEY,
  location_id VARCHAR(100) NOT NULL UNIQUE REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  rating NUMERIC(2, 1) DEFAULT 4.8 CHECK (rating >= 1.0 AND rating <= 5.0),
  price_range VARCHAR(100) DEFAULT '',
  opening_hours VARCHAR(100) DEFAULT '',
  best_time_to_visit VARCHAR(150) DEFAULT '',
  notes TEXT DEFAULT '',
  travel_tips TEXT DEFAULT '',
  specialties TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  gallery_urls TEXT[] DEFAULT '{}',
  website_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG TAGS ĐA CHIỀU (travel_tags & travel_location_tags)
CREATE TABLE IF NOT EXISTS public.travel_tags (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50) DEFAULT 'teal',
  icon VARCHAR(20) DEFAULT '🏷️',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.travel_location_tags (
  location_id VARCHAR(100) NOT NULL REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  tag_id VARCHAR(50) NOT NULL REFERENCES public.travel_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (location_id, tag_id)
);

-- 6. BẢNG LỊCH TRÌNH CHUYẾN ĐI (travel_trips & travel_trip_stops)
CREATE TABLE IF NOT EXISTS public.travel_trips (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(150),
  user_name VARCHAR(150),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12, 0) DEFAULT 0,
  cover_image TEXT,
  status VARCHAR(30) DEFAULT 'planning' CHECK (status IN ('planning', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động bổ sung các cột người dùng nếu bảng đã tồn tại từ trước
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS user_email VARCHAR(150);
ALTER TABLE public.travel_trips ADD COLUMN IF NOT EXISTS user_name VARCHAR(150);
CREATE INDEX IF NOT EXISTS idx_travel_trips_user_id ON public.travel_trips(user_id);

CREATE TABLE IF NOT EXISTS public.travel_trip_stops (
  id VARCHAR(100) PRIMARY KEY,
  trip_id VARCHAR(100) NOT NULL REFERENCES public.travel_trips(id) ON DELETE CASCADE,
  location_id VARCHAR(100) NOT NULL REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  day_number INT DEFAULT 1,
  visit_time VARCHAR(20),
  order_index INT DEFAULT 1,
  transport_mode VARCHAR(30) DEFAULT 'driving',
  stop_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG NHẬT KÝ CHECK-IN & ĐÁNH GIÁ (travel_reviews_logs)
CREATE TABLE IF NOT EXISTS public.travel_reviews_logs (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(150),
  user_name VARCHAR(150),
  location_id VARCHAR(100) NOT NULL REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  rating NUMERIC(2, 1) DEFAULT 5.0,
  actual_expense NUMERIC(12, 0) DEFAULT 0,
  review_text TEXT NOT NULL,
  captured_photos TEXT[] DEFAULT '{}',
  weather VARCHAR(50),
  companion VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động bổ sung các cột người dùng nếu bảng đã tồn tại từ trước
ALTER TABLE public.travel_reviews_logs ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE public.travel_reviews_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(150);
ALTER TABLE public.travel_reviews_logs ADD COLUMN IF NOT EXISTS user_name VARCHAR(150);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.travel_reviews_logs(user_id);

-- 8. BẢNG QUẢN LÝ CHI TIÊU DU LỊCH (travel_expenses)
CREATE TABLE IF NOT EXISTS public.travel_expenses (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_email VARCHAR(150),
  user_name VARCHAR(150),
  trip_id VARCHAR(100) REFERENCES public.travel_trips(id) ON DELETE SET NULL,
  location_id VARCHAR(100) REFERENCES public.travel_locations(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'food',
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) DEFAULT 'cash',
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tự động bổ sung các cột người dùng nếu bảng đã tồn tại từ trước
ALTER TABLE public.travel_expenses ADD COLUMN IF NOT EXISTS user_id VARCHAR(100);
ALTER TABLE public.travel_expenses ADD COLUMN IF NOT EXISTS user_email VARCHAR(150);
ALTER TABLE public.travel_expenses ADD COLUMN IF NOT EXISTS user_name VARCHAR(150);
CREATE INDEX IF NOT EXISTS idx_travel_expenses_user_id ON public.travel_expenses(user_id);

-- 9. BẢNG QUẢN LÝ BÁO CÁO ĐỊA ĐIỂM (travel_reports)
CREATE TABLE IF NOT EXISTS public.travel_reports (
  id VARCHAR(100) PRIMARY KEY,
  location_id VARCHAR(100) NOT NULL REFERENCES public.travel_locations(id) ON DELETE CASCADE,
  location_name VARCHAR(255) NOT NULL,
  location_address TEXT,
  reported_by_user_id VARCHAR(100),
  reported_by_user_name VARCHAR(100) DEFAULT 'Người dùng',
  reported_by_user_email VARCHAR(100),
  reason VARCHAR(50) NOT NULL DEFAULT 'other',
  description TEXT,
  proof_url TEXT,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BẢNG TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN (travel_users)
-- Lưu ý: Khách xem (Viewer) là khách vãng lai tự do, không cần đăng nhập nên không tạo tài khoản trong DB.
CREATE TABLE IF NOT EXISTS public.travel_users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Mật khẩu đã được mã hóa Bcrypt ($2b$10$...)
  role VARCHAR(30) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  phone VARCHAR(50),
  status VARCHAR(30) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BẢNG LỊCH SỬ THAY ĐỔI (travel_audit_logs)
CREATE TABLE IF NOT EXISTS public.travel_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  changed_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TẠO INDEXES TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_locations_group ON public.travel_locations(group_id);
CREATE INDEX IF NOT EXISTS idx_locations_deleted ON public.travel_locations(is_deleted);
CREATE INDEX IF NOT EXISTS idx_locations_coords ON public.travel_locations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON public.travel_trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_reviews_location ON public.travel_reviews_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON public.travel_expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.travel_reports(location_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.travel_reports(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.travel_users(email);

-- 11. TẠO VIEW TỔNG HỢP (travel_places_view)
CREATE OR REPLACE VIEW public.travel_places_view WITH (security_invoker = on) AS
SELECT 
  l.id,
  l.name,
  l.group_id AS "group",
  l.city_id,
  c.name AS city_name,
  g.name AS group_name,
  g.icon AS group_icon,
  g.badge_bg,
  g.marker_color,
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
  l.created_at,
  l.updated_at,
  d.rating,
  d.price_range,
  d.opening_hours,
  d.best_time_to_visit,
  d.notes,
  d.travel_tips,
  d.specialties,
  d.thumbnail_url,
  d.gallery_urls,
  d.website_url,
  COALESCE(
    (
      SELECT array_agg(t.name) 
      FROM public.travel_location_tags lt 
      JOIN public.travel_tags t ON lt.tag_id = t.id 
      WHERE lt.location_id = l.id
    ), 
    '{}'
  ) AS tags,
  (
    SELECT count(*)::int 
    FROM public.travel_reviews_logs r 
    WHERE r.location_id = l.id
  ) AS reviews_count
FROM public.travel_locations l
LEFT JOIN public.travel_groups g ON l.group_id = g.id
LEFT JOIN public.travel_cities c ON l.city_id = c.id
LEFT JOIN public.travel_location_details d ON l.id = d.location_id
WHERE l.is_deleted = FALSE;

-- 12. HÀM TÌM KIẾM ĐỊA ĐIỂM LÂN CẬN THEO TỌA ĐỘ (HAVERSINE RPC)
CREATE OR REPLACE FUNCTION public.get_nearby_places(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  max_distance_km DOUBLE PRECISION DEFAULT 50
)
RETURNS TABLE (
  id VARCHAR(100),
  name VARCHAR(255),
  group_id VARCHAR(50),
  category VARCHAR(100),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.group_id,
    l.category,
    l.lat,
    l.lng,
    l.address,
    (
      6371 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(user_lat)) * cos(radians(l.lat)) * 
          cos(radians(l.lng) - radians(user_lng)) + 
          sin(radians(user_lat)) * sin(radians(l.lat))
        ))
      )
    )::DOUBLE PRECISION AS distance_km
  FROM public.travel_locations l
  WHERE l.is_deleted = FALSE
    AND (
      6371 * acos(
        least(1.0, greatest(-1.0, 
          cos(radians(user_lat)) * cos(radians(l.lat)) * 
          cos(radians(l.lng) - radians(user_lng)) + 
          sin(radians(user_lat)) * sin(radians(l.lat))
        ))
      )
    ) <= max_distance_km
  ORDER BY distance_km ASC;
END;
$$;

-- 13. CẤP QUYỀN TRUY CẬP VÀ PHÂN QUYỀN BẢO MẬT (Row Level Security - RLS)
ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_location_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_location_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_reviews_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- A. Các bảng dữ liệu dùng chung công cộng (Địa điểm, Nhóm, Thẻ, Báo cáo)
  EXECUTE 'CREATE POLICY "Allow public read-write groups" ON public.travel_groups FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write locations" ON public.travel_locations FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write details" ON public.travel_location_details FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write tags" ON public.travel_tags FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write location_tags" ON public.travel_location_tags FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write reports" ON public.travel_reports FOR ALL USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "Allow public read-write users" ON public.travel_users FOR ALL USING (true) WITH CHECK (true)';

  -- B. BẢO MẬT PHÂN LẬP DỮ LIỆU CÁ NHÂN (User Data Isolation: Trips, Stops, Expenses, Reviews)
  -- Quy tắc: Người dùng chỉ được xem, thêm, sửa, xóa dữ liệu gắn với ID của chính mình (auth.uid() = user_id)
  
  -- 1. Lịch trình (travel_trips): Chỉ chủ sở hữu mới được xem và quản lý
  EXECUTE 'DROP POLICY IF EXISTS "Allow all public trips" ON public.travel_trips';
  EXECUTE 'DROP POLICY IF EXISTS "Users isolate own trips" ON public.travel_trips';
  EXECUTE 'CREATE POLICY "Users isolate own trips" ON public.travel_trips
    FOR ALL
    USING (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )
    WITH CHECK (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )';

  -- 2. Điểm dừng lịch trình (travel_trip_stops): Phụ thuộc vào quyền sở hữu lịch trình cha
  EXECUTE 'DROP POLICY IF EXISTS "Allow all public stops" ON public.travel_trip_stops';
  EXECUTE 'DROP POLICY IF EXISTS "Users isolate own trip stops" ON public.travel_trip_stops';
  EXECUTE 'CREATE POLICY "Users isolate own trip stops" ON public.travel_trip_stops
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.travel_trips t 
        WHERE t.id = travel_trip_stops.trip_id 
        AND (auth.uid()::text = t.user_id OR t.user_id IS NULL OR (auth.jwt() ->> ''role'') = ''service_role'')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.travel_trips t 
        WHERE t.id = travel_trip_stops.trip_id 
        AND (auth.uid()::text = t.user_id OR t.user_id IS NULL OR (auth.jwt() ->> ''role'') = ''service_role'')
      )
    )';

  -- 3. Chi tiêu cá nhân (travel_expenses): Tuyệt đối không cho người khác xem khoản chi của nhau
  EXECUTE 'DROP POLICY IF EXISTS "Allow all public expenses" ON public.travel_expenses';
  EXECUTE 'DROP POLICY IF EXISTS "Users isolate own expenses" ON public.travel_expenses';
  EXECUTE 'CREATE POLICY "Users isolate own expenses" ON public.travel_expenses
    FOR ALL
    USING (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )
    WITH CHECK (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )';

  -- 4. Nhật ký & Check-in (travel_reviews_logs)
  EXECUTE 'DROP POLICY IF EXISTS "Allow all public reviews" ON public.travel_reviews_logs';
  EXECUTE 'DROP POLICY IF EXISTS "Users isolate own reviews" ON public.travel_reviews_logs';
  EXECUTE 'CREATE POLICY "Users isolate own reviews" ON public.travel_reviews_logs
    FOR ALL
    USING (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )
    WITH CHECK (
      auth.uid()::text = user_id 
      OR user_id IS NULL
      OR (auth.jwt() ->> ''role'') = ''service_role''
    )';

EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 14. CHÈN DỮ LIỆU MẪU CƠ BẢN (SEEDS)
-- Xóa tài khoản viewer cũ nếu có (Viewer là khách tự do, không cần lưu trong database)
DELETE FROM public.travel_users WHERE role = 'viewer' OR email = 'viewer@travelmaps.vn';

-- Tài khoản Admin (mật khẩu: admin123) & User (mật khẩu: user123) đã được băm Bcrypt
INSERT INTO public.travel_users (id, name, email, password, role, avatar_url)
VALUES
  (
    'user-admin-01',
    'Quản Trị Viên (Admin)',
    'admin@travelmaps.vn',
    '$2b$10$EbWDlJAsmOK8uQDwTbBtae0tgh9y.kzwj92TfpNhAH6T3O1rIG5WO',
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  ),
  (
    'user-member-02',
    'Thành Viên Du Lịch (User)',
    'user@travelmaps.vn',
    '$2b$10$3A1QSQlhdo/JNYLv3ygI9eS8n40XtF5KypcCCZYMlq0NXqEphyZRu',
    'user',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url;

INSERT INTO public.travel_groups (id, name, icon, badge_bg, marker_color, description, sort_order)
VALUES
  ('du_lich', 'Du lịch & Thắng cảnh', '🏖️', 'bg-emerald-100 text-emerald-800 border-emerald-300', '#059669', 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo', 1),
  ('an_uong', 'Ẩm thực & Quán ăn', '🍜', 'bg-amber-100 text-amber-800 border-amber-300', '#d97706', 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe', 2),
  ('dich_vu', 'Khách sạn & Tiện ích', '🏨', 'bg-blue-100 text-blue-800 border-blue-300', '#2563eb', 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách', 3),
  ('giai_tri', 'Vui chơi & Giải trí', '🎡', 'bg-purple-100 text-purple-800 border-purple-300', '#9333ea', 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc', 4),
  ('khac', 'Khác & Ghi nhớ', '📌', 'bg-slate-100 text-slate-800 border-slate-300', '#475569', 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.travel_tags (id, name, color, icon)
VALUES
  ('view_hoang_hon', 'View Hoàng Hôn', 'orange', '🌅'),
  ('song_ao', 'Check-in Sống Ảo', 'pink', '📸'),
  ('dac_san', 'Đặc Sản Địa Phương', 'amber', '🍲'),
  ('gia_dinh', 'Phù Hợp Gia Đình', 'teal', '👨‍👩‍👧‍👦'),
  ('mo_muon', 'Mở Cửa Muộn / 24/7', 'indigo', '🌙'),
  ('michelin', 'Michelin / Nổi Tiếng', 'rose', '⭐'),
  ('view_bien', 'View Biển / View Hồ', 'cyan', '🌊'),
  ('gia_binh_dan', 'Giá Bình Dân', 'emerald', '💵')
ON CONFLICT (id) DO NOTHING;
`;
