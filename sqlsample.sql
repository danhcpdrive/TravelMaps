-- =============================================================================
-- TRAVEL MAPS - FILE DỮ LIỆU MẪU TOÀN DIỆN (sqlsample.sql)
-- =============================================================================
-- Hướng dẫn: Mở Supabase SQL Editor, dán toàn bộ nội dung file này và nhấn "Run"
-- Script sử dụng "ON CONFLICT" để có thể chạy nhiều lần an toàn mà không bị trùng khóa.
-- Mật khẩu mẫu đã được mã hóa Bcrypt ($2b$10$...) chuẩn bảo mật.
-- Lưu ý: Khách xem (Viewer) là khách vãng lai tự do không cần tài khoản nên không lưu trong DB.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TÀI KHOẢN NGƯỜI DÙNG MẪU (travel_users)
-- Mật khẩu đã mã hóa Bcrypt:
-- Admin: 'admin123' (hoặc gõ nhanh 'admin')
-- User:  'user123'  (hoặc gõ nhanh 'user')
-- -----------------------------------------------------------------------------
-- Dọn dẹp tài khoản viewer nếu có trong database trước đây
DELETE FROM public.travel_users WHERE role = 'viewer' OR email = 'viewer@travelmaps.vn';

INSERT INTO public.travel_users (id, name, email, password, role, avatar_url, phone, status)
VALUES
  (
    'user-admin-01',
    'Quản Trị Viên (Admin)',
    'admin@travelmaps.vn',
    '$2b$10$EbWDlJAsmOK8uQDwTbBtae0tgh9y.kzwj92TfpNhAH6T3O1rIG5WO',
    'admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    '0901234567',
    'active'
  ),
  (
    'user-member-02',
    'Thành Viên Du Lịch (User)',
    'user@travelmaps.vn',
    '$2b$10$3A1QSQlhdo/JNYLv3ygI9eS8n40XtF5KypcCCZYMlq0NXqEphyZRu',
    'user',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    '0912345678',
    'active'
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status;

-- -----------------------------------------------------------------------------
-- 2. DANH MỤC PHÂN NHÓM DỊCH VỤ CHUẨN (travel_groups)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_groups (id, name, icon, badge_bg, marker_color, description, sort_order)
VALUES
  (
    'du_lich',
    'Du lịch & Thắng cảnh',
    '🏖️',
    'bg-emerald-100 text-emerald-800 border-emerald-300',
    '#059669',
    'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo',
    1
  ),
  (
    'an_uong',
    'Ẩm thực & Quán ăn',
    '🍜',
    'bg-amber-100 text-amber-800 border-amber-300',
    '#d97706',
    'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe',
    2
  ),
  (
    'dich_vu',
    'Khách sạn & Tiện ích',
    '🏨',
    'bg-blue-100 text-blue-800 border-blue-300',
    '#2563eb',
    'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách',
    3
  ),
  (
    'giai_tri',
    'Vui chơi & Giải trí',
    '🎡',
    'bg-purple-100 text-purple-800 border-purple-300',
    '#9333ea',
    'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc',
    4
  ),
  (
    'khac',
    'Khác & Ghi nhớ',
    '📌',
    'bg-slate-100 text-slate-800 border-slate-300',
    '#475569',
    'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời',
    5
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  badge_bg = EXCLUDED.badge_bg,
  marker_color = EXCLUDED.marker_color,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- -----------------------------------------------------------------------------
-- 2.1. DANH MỤC THÀNH PHỐ / TỈNH THÀNH (travel_cities)
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

INSERT INTO public.travel_cities (id, name, code, lat, lng, sort_order)
VALUES
  ('da_nang', 'Đà Nẵng', 'DAD', 16.0544, 108.2022, 1),
  ('hoi_an', 'Hội An / Quảng Nam', 'VNHAN', 15.8801, 108.3380, 2),
  ('ha_noi', 'Hà Nội', 'HAN', 21.0285, 105.8542, 3),
  ('ho_chi_minh', 'TP. Hồ Chí Minh', 'SGN', 10.8231, 106.6297, 4),
  ('phu_quoc', 'Phú Quốc', 'PQC', 10.2899, 103.9840, 5),
  ('sa_pa', 'Sa Pa', 'SAP', 22.3364, 103.8438, 6),
  ('hue', 'Thừa Thiên Huế', 'HUI', 16.4637, 107.5909, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE public.travel_locations ADD COLUMN IF NOT EXISTS city_id VARCHAR(50) REFERENCES public.travel_cities(id);

-- -----------------------------------------------------------------------------
-- 3. HỆ THỐNG THẺ NHÃN ĐẶC TRƯNG (travel_tags)
-- -----------------------------------------------------------------------------
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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- -----------------------------------------------------------------------------
-- 4. DANH SÁCH ĐỊA ĐIỂM CỐT LÕI (travel_locations)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_locations (
  id, name, group_id, city_id, category, lat, lng, address, phone, contact, checked, is_favorite, is_deleted
)
VALUES
  -- 1. Bà Nà Hills (Đà Nẵng)
  (
    'loc-bana-hills',
    'Sun World Ba Na Hills & Cầu Vàng',
    'du_lich',
    'da_nang',
    'Khu du lịch & Thắng cảnh',
    15.998855,
    107.996328,
    'Thôn An Sơn, Xã Hòa Ninh, Huyện Hòa Vang, Đà Nẵng',
    '18001000',
    'Hotline Sun World',
    true,
    true,
    false
  ),
  -- 2. Chùa Cầu & Phố Cổ Hội An (Quảng Nam)
  (
    'loc-pho-co-hoi-an',
    'Phố Cổ Hội An & Chùa Cầu',
    'du_lich',
    'hoi_an',
    'Di tích lịch sử văn hóa',
    15.877884,
    108.326265,
    'Đường Nguyễn Thị Minh Khai, Phường Minh An, TP. Hội An, Quảng Nam',
    '02353861327',
    'Trung tâm VHTT Hội An',
    true,
    true,
    false
  ),
  -- 3. Bãi biển Mỹ Khê (Đà Nẵng)
  (
    'loc-bien-my-khe',
    'Bãi Biển Mỹ Khê',
    'du_lich',
    'da_nang',
    'Bãi biển & Cảnh quan',
    16.059714,
    108.243452,
    'Đường Võ Nguyên Giáp, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng',
    '02363844444',
    'Ban quản lý Bán đảo Sơn Trà',
    true,
    true,
    false
  ),
  -- 4. Bán đảo Sơn Trà & Chùa Linh Ứng (Đà Nẵng)
  (
    'loc-chua-linh-ung',
    'Chùa Linh Ứng Bãi Bụt - Sơn Trà',
    'du_lich',
    'da_nang',
    'Tâm linh & Thắng cảnh',
    16.100142,
    108.277881,
    'Bán đảo Sơn Trà, Phường Thọ Quang, Quận Sơn Trà, Đà Nẵng',
    '02363920199',
    'Văn phòng Chùa Linh Ứng',
    false,
    true,
    false
  ),
  -- 5. Bánh Xèo Tôm Nhảy Năm Hiền (Đà Nẵng)
  (
    'loc-banh-xeo-nam-hien',
    'Bánh Xèo Tôm Nhảy Năm Hiền',
    'an_uong',
    'da_nang',
    'Đặc sản miền Trung',
    16.064512,
    108.216345,
    '46 Phan Thanh, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng',
    '0905684239',
    'Cô Hiền chủ quán',
    true,
    true,
    false
  ),
  -- 6. Mì Quảng Bà Mua (Đà Nẵng)
  (
    'loc-mi-quang-ba-mua',
    'Mì Quảng Bà Mua - Trần Bình Trọng',
    'an_uong',
    'da_nang',
    'Món ngon truyền thống',
    16.066723,
    108.220145,
    '19 Trần Bình Trọng, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
    '0985000075',
    'Quản lý chi nhánh Hải Châu',
    true,
    false,
    false
  ),
  -- 7. Cơm Gà Bà Buội (Hội An)
  (
    'loc-com-ga-ba-buoi',
    'Cơm Gà Bà Buội Hội An',
    'an_uong',
    'hoi_an',
    'Cơm gà gia truyền',
    15.879213,
    108.329845,
    '22 Phan Chu Trinh, Phường Minh An, TP. Hội An, Quảng Nam',
    '0905767999',
    'Chủ quán Bà Buội',
    false,
    true,
    false
  ),
  -- 8. Bánh Mì Phượng (Hội An)
  (
    'loc-banh-mi-phuong',
    'Bánh Mì Phượng Hội An',
    'an_uong',
    'hoi_an',
    'Ẩm thực đường phố',
    15.879942,
    108.334123,
    '2B Phan Chu Trinh, Phường Cẩm Châu, TP. Hội An, Quảng Nam',
    '0905904859',
    'Cô Phượng',
    true,
    true,
    false
  ),
  -- 9. InterContinental Danang Sun Peninsula Resort
  (
    'loc-intercontinental-danang',
    'InterContinental Danang Sun Peninsula Resort',
    'dich_vu',
    'da_nang',
    'Khu nghỉ dưỡng 5 sao',
    16.121845,
    108.307512,
    'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng',
    '02363938888',
    'Bộ phận Đặt phòng & Lễ tân',
    false,
    true,
    false
  ),
  -- 10. Khách sạn Haian Beach Hotel & Spa Đà Nẵng
  (
    'loc-haian-beach-hotel',
    'Haian Beach Hotel & Spa',
    'dich_vu',
    'da_nang',
    'Khách sạn 4 sao view biển',
    16.056123,
    108.245231,
    '278 Võ Nguyên Giáp, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng',
    '02362228666',
    'Lễ tân Khách sạn',
    true,
    false,
    false
  ),
  -- 11. VinWonders Nam Hội An
  (
    'loc-vinwonders-nam-hoi-an',
    'Tổ Hợp Vui Chơi VinWonders Nam Hội An',
    'giai_tri',
    'hoi_an',
    'Công viên giải trí & Safari',
    15.753891,
    108.413725,
    'Đường Võ Chí Công, Xã Bình Minh, Huyện Thăng Bình, Quảng Nam',
    '19006677',
    'Chăm sóc khách hàng VinWonders',
    false,
    false,
    false
  ),
  -- 12. Cầu Rồng & Phun Lửa Cuối Tuần (Đà Nẵng)
  (
    'loc-cau-rong-da-nang',
    'Cầu Rồng Đà Nẵng (Điểm ngắm Phun Lửa)',
    'giai_tri',
    'da_nang',
    'Biểu tượng thành phố',
    16.061092,
    108.227284,
    'Đường Nguyễn Văn Linh nối Võ Văn Kiệt, Quận Hải Châu, Đà Nẵng',
    '02363822288',
    'Trung tâm Xúc tiến Du lịch Đà Nẵng',
    true,
    true,
    false
  ),
  -- 13. Trạm Dừng Chân Đỉnh Đèo Hải Vân
  (
    'loc-deo-hai-van',
    'Đỉnh Đèo Hải Vân & Hải Vân Quan',
    'khac',
    'da_nang',
    'Điểm ngắm cảnh thiên nhiên',
    16.195321,
    108.131456,
    'Đỉnh Đèo Hải Vân, Ranh giới Đà Nẵng - Thừa Thiên Huế',
    '0905123987',
    'BQL Di tích Hải Vân Quan',
    false,
    true,
    false
  ),
  -- 14. Bến Du Thuyền Sông Hàn
  (
    'loc-ben-du-thuyen-song-han',
    'Bến Du Thuyền Sông Hàn',
    'khac',
    'da_nang',
    'Điểm tập kết tàu du lịch',
    16.073452,
    108.223841,
    '32 Bạch Đằng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
    '0935868789',
    'Điều hành du thuyền sông Hàn',
    true,
    false,
    false
  ),
  -- 15. Hồ Hoàn Kiếm & Đền Ngọc Sơn (Hà Nội)
  (
    'loc-ho-hoan-kiem',
    'Hồ Hoàn Kiếm & Đền Ngọc Sơn',
    'du_lich',
    'ha_noi',
    'Trái tim thủ đô',
    21.028511,
    105.852322,
    'Phố Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội',
    '02439286153',
    'BQL Di tích Hồ Hoàn Kiếm',
    true,
    true,
    false
  ),
  -- 16. Phở Thìn Lò Đúc (Hà Nội)
  (
    'loc-pho-thin-lo-duc',
    'Phở Thìn Lò Đúc (Phở Tái Lăn)',
    'an_uong',
    'ha_noi',
    'Quán phở truyền thống',
    21.017533,
    105.855421,
    '13 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội',
    '0904321988',
    'Quản lý Phở Thìn',
    true,
    false,
    false
  ),
  -- 17. Sofitel Legend Metropole Hà Nội
  (
    'loc-metropole-ha-noi',
    'Khách Sạn Sofitel Legend Metropole Hà Nội',
    'dich_vu',
    'ha_noi',
    'Khách sạn di sản 5 sao',
    21.025812,
    105.856121,
    '15 Phố Ngô Quyền, Tràng Tiền, Hoàn Kiếm, Hà Nội',
    '02438266919',
    'Lễ tân Metropole',
    false,
    true,
    false
  ),
  -- 18. Nhà Hát Lớn Hà Nội
  (
    'loc-nha-hat-lon-ha-noi',
    'Nhà Hát Lớn Hà Nội',
    'giai_tri',
    'ha_noi',
    'Kiến trúc Pháp cổ điển',
    21.024312,
    105.857632,
    '1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội',
    '02439330113',
    'Phòng vé Nhà Hát Lớn',
    true,
    false,
    false
  ),
  -- 19. Chợ Bến Thành & Dinh Độc Lập (TP.HCM)
  (
    'loc-cho-ben-thanh',
    'Chợ Bến Thành',
    'du_lich',
    'ho_chi_minh',
    'Biểu tượng Sài Gòn',
    10.772511,
    106.698022,
    'Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    '02838292096',
    'BQL Chợ Bến Thành',
    true,
    true,
    false
  ),
  -- 20. Cơm Tấm Ba Ghiền (TP.HCM)
  (
    'loc-com-tam-ba-ghien',
    'Cơm Tấm Ba Ghiền (Sườn Cốt Lết Khổng Lồ)',
    'an_uong',
    'ho_chi_minh',
    'Đặc sản Sài Gòn (Michelin Selected)',
    10.793211,
    106.663521,
    '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP. Hồ Chí Minh',
    '02838461070',
    'Chủ quán Ba Ghiền',
    true,
    false,
    false
  ),
  -- 21. Landmark 81 SkyView (TP.HCM)
  (
    'loc-landmark-81-skyview',
    'Landmark 81 SkyView',
    'giai_tri',
    'ho_chi_minh',
    'Đài quan sát cao nhất Việt Nam',
    10.795112,
    106.721832,
    '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    '0981938388',
    'Quầy vé SkyView',
    false,
    true,
    false
  ),
  -- 22. Rex Hotel Saigon (TP.HCM)
  (
    'loc-rex-hotel-saigon',
    'Rex Hotel Saigon',
    'dich_vu',
    'ho_chi_minh',
    'Khách sạn lịch sử 5 sao',
    10.775812,
    106.700321,
    '141 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    '02838292185',
    'Lễ tân Rex Hotel',
    true,
    false,
    false
  ),
  -- 23. Đỉnh Fansipan Legend (Sa Pa)
  (
    'loc-fansipan-legend',
    'Đỉnh Fansipan Legend (Nóc Nhà Đông Dương)',
    'du_lich',
    'sa_pa',
    'Đỉnh núi cao nhất Việt Nam 3.143m',
    22.303411,
    103.775122,
    'Khu du lịch Sun World Fansipan Legend, Sa Pa, Lào Cai',
    '0948308888',
    'Tổng đài Fansipan Legend',
    true,
    true,
    false
  ),
  -- 24. Thắng Cố A Quỳnh Sa Pa
  (
    'loc-thang-co-a-quynh',
    'Thắng Cố A Quỳnh Sa Pa',
    'an_uong',
    'sa_pa',
    'Đặc sản Tây Bắc',
    22.334121,
    103.841511,
    '15 Thạch Sơn, Thị trấn Sa Pa, Lào Cai',
    '02143871555',
    'Quản lý quán A Quỳnh',
    true,
    false,
    false
  ),
  -- 25. Hotel de la Coupole - MGallery (Sa Pa)
  (
    'loc-hotel-de-la-coupole',
    'Hotel de la Coupole - MGallery Sa Pa',
    'dich_vu',
    'sa_pa',
    'Khách sạn nghỉ dưỡng 5 sao',
    22.332812,
    103.842321,
    '1 Hoàng Liên, Thị trấn Sa Pa, Lào Cai',
    '02143629999',
    'Bộ phận Đặt phòng',
    false,
    true,
    false
  ),
  -- 26. Bãi Sao Phú Quốc
  (
    'loc-bai-sao-phu-quoc',
    'Bãi Sao Phú Quốc (Cát Trắng Mịn)',
    'du_lich',
    'phu_quoc',
    'Bãi biển đẹp nhất Phú Quốc',
    10.053121,
    104.032112,
    'Ấp Bãi Sao, Xã An Thới, TP. Phú Quốc, Kiên Giang',
    '0913987123',
    'BQL Bãi Sao',
    true,
    true,
    false
  ),
  -- 27. Bún Quậy Kiến Xây Phú Quốc
  (
    'loc-bun-quay-kien-xay',
    'Bún Quậy Kiến Xây Phú Quốc',
    'an_uong',
    'phu_quoc',
    'Ẩm thực Phú Quốc độc đáo',
    10.217812,
    103.958211,
    '28 Bạch Đằng, Thị trấn Dương Đông, TP. Phú Quốc, Kiên Giang',
    '0838108108',
    'Bún Quậy Kiến Xây',
    true,
    false,
    false
  ),
  -- 28. Vinpearl Safari Phú Quốc
  (
    'loc-vinpearl-safari-phu-quoc',
    'Vinpearl Safari Phú Quốc',
    'giai_tri',
    'phu_quoc',
    'Công viên bảo tồn động vật hoang dã',
    10.332112,
    103.889122,
    'Khu Bãi Dài, Xã Gành Dầu, TP. Phú Quốc, Kiên Giang',
    '1900232389',
    'Chăm sóc khách hàng Safari',
    false,
    true,
    false
  ),
  -- 29. Đại Nội & Cố Đô Huế
  (
    'loc-dai-noi-hue',
    'Đại Nội Huế (Hoàng Thành & Cấm Thành)',
    'du_lich',
    'hue',
    'Di sản văn hóa thế giới UNESCO',
    16.469121,
    107.578112,
    'Đường 23 Tháng 8, Phường Thuận Hòa, TP. Huế, Thừa Thiên Huế',
    '02343523237',
    'Trung tâm BTDTCĐ Huế',
    true,
    true,
    false
  ),
  -- 30. Bún Bò Huế Mạ Tôn
  (
    'loc-bun-bo-hue-mo-rot',
    'Bún Bò Huế Mạ Tôn / Mạ Rớt',
    'an_uong',
    'hue',
    'Bún bò Huế chính gốc',
    16.462311,
    107.592112,
    '20 Hà Nội, Phường Vĩnh Ninh, TP. Huế, Thừa Thiên Huế',
    '0905888999',
    'Quản lý Bún bò Mạ Tôn',
    true,
    false,
    false
  ),
  -- 31. Silk Path Grand Hue Hotel
  (
    'loc-silk-path-hue',
    'Silk Path Grand Hue Hotel',
    'dich_vu',
    'hue',
    'Khách sạn 5 sao sang trọng',
    16.460112,
    107.585212,
    '2 Lé Lợi, Phường Vĩnh Ninh, TP. Huế, Thừa Thiên Huế',
    '02343970999',
    'Lễ tân Silk Path Hue',
    false,
    true,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  group_id = EXCLUDED.group_id,
  city_id = EXCLUDED.city_id,
  category = EXCLUDED.category,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  contact = EXCLUDED.contact,
  checked = EXCLUDED.checked,
  is_favorite = EXCLUDED.is_favorite,
  is_deleted = EXCLUDED.is_deleted,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 5. BẢNG CHI TIẾT THÔNG TIN, MEDIA & LỜI KHUYÊN (travel_location_details)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_location_details (
  id, location_id, rating, price_range, opening_hours, best_time_to_visit, notes, travel_tips, specialties, thumbnail_url, gallery_urls, website_url
)
VALUES
  (
    'dt-bana-hills',
    'loc-bana-hills',
    4.9,
    '900.000đ - 1.250.000đ / vé',
    '07:30 - 21:00 hàng ngày',
    'Buổi sáng sớm 08:00 hoặc chiều 15:00 chụp Cầu Vàng ít đông',
    'Nên đặt vé cáp treo trước qua mạng để không phải xếp hàng chờ đợi.',
    'Mang theo áo khoác mỏng vì nhiệt độ trên đỉnh Bà Nà thường thấp hơn trung tâm từ 6-8 độ C.',
    'Cầu Vàng, Làng Pháp, Tàu hỏa leo núi, Hầm rượu Debay, Buffet ẩm thực 4 mùa',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80'
    ],
    'https://banahills.sunworld.vn'
  ),
  (
    'dt-pho-co-hoi-an',
    'loc-pho-co-hoi-an',
    4.9,
    'Miễn phí dạo phố (Vé tham quan di tích 120.000đ/người)',
    'Mở cửa 24/7 (Phố đi bộ bật đèn lồng từ 18:00)',
    '16:30 - 21:30 khi phố lên đèn lồng và thả hoa đăng trên sông Hoài',
    'Khu vực phố đi bộ cấm xe máy trong khung giờ 09:00-11:00 và 15:00-21:30.',
    'Nên thuê trang phục truyền thống hoặc áo dài chụp ảnh tại hẻm vàng Hội An.',
    'Thả hoa đăng sông Hoài, Chùa Cầu, Trà Mót, May đo lấy liền trong ngày',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'
    ],
    'https://hoianworldheritage.org.vn'
  ),
  (
    'dt-bien-my-khe',
    'loc-bien-my-khe',
    4.8,
    'Miễn phí tắm biển (Gửi xe: 5.000đ, Thuê ghế: 40.000đ)',
    '05:00 - 19:00 có cứu hộ trực biển',
    '05:00 - 06:30 sáng đón bình minh tuyệt đẹp hoặc sau 16:30 tắm mát',
    'Nằm trong top những bãi biển quyến rũ nhất hành tinh do Forbes bình chọn.',
    'Tắm trong khu vực có phao an toàn và cờ báo hiệu của lực lượng cứu hộ.',
    'Ngắm bình minh, chơi cano kéo dù bay, lướt ván đứng SUP, hải sản tươi sống',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-chua-linh-ung',
    'loc-chua-linh-ung',
    4.9,
    'Miễn phí vào cửa & giữ xe',
    '06:00 - 21:00',
    '07:00 - 09:00 sáng không khí thanh tịnh hoặc chiều ngắm hoàng hôn vịnh Đà Nẵng',
    'Trang phục lịch sự, kín đáo khi vào lễ chùa.',
    'Trên đường lên bán đảo Sơn Trà có thể gặp đàn khỉ hoang dã, không nên trêu chọc hay cho khỉ ăn thức ăn vặt.',
    'Tượng Phật Bà Quan Âm cao 67m hướng biển, ngắm toàn cảnh thành phố Đà Nẵng',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-banh-xeo-nam-hien',
    'loc-banh-xeo-nam-hien',
    4.7,
    '40.000đ - 85.000đ / đĩa',
    '09:00 - 22:00',
    '11:30 trưa hoặc 18:00 tối (quán đông nhưng phục vụ rất nhanh)',
    'Bánh xèo vỏ giòn rụm, tôm đất tươi nhảy tanh tách ăn kèm rau sống và nước chấm gan tương đậm đà.',
    'Gọi thêm nem lụi nướng than hoa ăn cùng bánh xèo cuốn bánh tráng rất hợp vị.',
    'Bánh xèo tôm nhảy, Bánh xèo bò, Nem lụi nướng, Bánh hỏi thịt nướng',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-mi-quang-ba-mua',
    'loc-mi-quang-ba-mua',
    4.6,
    '35.000đ - 55.000đ / tô',
    '06:30 - 22:00',
    'Buổi sáng sớm điểm tâm hoặc bữa xế chiều',
    'Quán có bãi đậu xe máy và ô tô thuận tiện, điều hòa mát mẻ.',
    'Ăn mì Quảng đúng điệu phải bẻ bánh tráng mè nướng giòn vào tô và vắt chanh ớt chuông xanh.',
    'Mì Quảng ếch, Mì Quảng gà ta rút xương, Mì tôm thịt trứng, Bánh tráng nướng',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-com-ga-ba-buoi',
    'loc-com-ga-ba-buoi',
    4.7,
    '50.000đ - 70.000đ / suất',
    '10:30 - 20:30 (Thường hết sớm lúc 19:30)',
    '11:00 - 12:00 trưa',
    'Quán có lịch sử từ thập niên 50, gà ta thả vườn thịt chắc, cơm nấu từ nước luộc gà óng vàng.',
    'Nên gọi thêm đĩa lòng mề gà xào nghệ và chén súp nóng đậm đà.',
    'Cơm gà xé, Cơm gà góc tư chiên giòn, Gỏi gà hoa chuối, Canh gà lá giang',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-banh-mi-phuong',
    'loc-banh-mi-phuong',
    4.8,
    '25.000đ - 40.000đ / ổ',
    '06:30 - 21:00',
    '08:00 sáng hoặc 16:30 chiều',
    'Được đầu bếp danh tiếng thế giới Anthony Bourdain ca ngợi là bánh mì ngon nhất thế giới.',
    'Vỏ bánh luôn nướng giòn nóng, có thể báo nhân viên gia giảm ớt nếu không ăn cay được.',
    'Bánh mì thập cẩm thịt nướng pate sốt đặc biệt, Bánh mì gà xé bơ tươi',
    'https://images.unsplash.com/photo-1621841957884-1210fe192e48?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1621841957884-1210fe192e48?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-intercontinental-danang',
    'loc-intercontinental-danang',
    5.0,
    '12.000.000đ - 35.000.000đ / đêm',
    'Nhận phòng: 15:00 - Trả phòng: 12:00',
    'Mùa khô từ tháng 2 đến tháng 8, thời tiết biển êm đềm tuyệt đối',
    'Thiết kế bởi kiến trúc sư lừng danh Bill Bensley theo phong cách hoàng gia Việt Nam 4 tầng Heaven, Sky, Earth, Sea.',
    'Nếu không lưu trú, có thể đặt trước bàn trà chiều (Afternoon Tea) hoặc bữa tối tại nhà hàng La Maison 1888.',
    'Nhà hàng Pháp La Maison 1888, Harnn Heritage Spa, Tàu điện Nam Tram riêng biệt',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'
    ],
    'https://danang.intercontinental.com'
  ),
  (
    'dt-haian-beach-hotel',
    'loc-haian-beach-hotel',
    4.8,
    '1.200.000đ - 2.800.000đ / đêm',
    'Lễ tân phục vụ 24/24',
    'Mùa hè ngắm trọn vẹn bình minh Mỹ Khê từ hồ bơi vô cực tầng thượng',
    'Vị trí đắc địa ngay mặt đường Võ Nguyên Giáp, chỉ cần qua đường là bãi tắm Mỹ Khê.',
    'Hồ bơi vô cực trên tầng 21 có phục vụ khay trà chiều nổi chụp ảnh sống ảo rất đẹp.',
    'Hồ bơi vô cực rooftop, Buffet sáng quốc tế đa dạng, Phòng hướng biển trực diện',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80'
    ],
    'https://haianbeachhotelspa.com'
  ),
  (
    'dt-vinwonders-nam-hoi-an',
    'loc-vinwonders-nam-hoi-an',
    4.8,
    '600.000đ - 750.000đ / vé',
    '09:00 - 19:30 hàng ngày',
    'Đi trọn vẹn cả ngày từ 09:30 sáng để trải nghiệm cả Safari trên sông và Công viên nước',
    'Tổ hợp vui chơi lớn nhất miền Trung kết hợp vui chơi mạo hiểm và văn hóa di sản.',
    'Nhớ mang theo đồ bơi và kem chống nắng để chơi khu công viên nước.',
    'River Safari đi thuyền ngắm động vật hoang dã, Đảo Văn Hóa Dân Gian, Tháp rơi tự do',
    'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&auto=format&fit=crop&q=80'
    ],
    'https://vinwonders.com'
  ),
  (
    'dt-cau-rong-da-nang',
    'loc-cau-rong-da-nang',
    4.9,
    'Miễn phí ngắm cảnh',
    'Phun Lửa & Phun Nước lúc 21:00 tối thứ 7 & Chủ Nhật hàng tuần',
    '20:30 tối thứ Bảy hoặc Chủ Nhật để chọn vị trí đứng đẹp trên cầu hoặc phố Bạch Đằng',
    'Khi rồng phun nước gió có thể tạt nước vào người, chú ý giữ điện thoại và máy ảnh.',
    'Nên kết hợp dạo chợ đêm Sơn Trà ngay dưới chân cầu sau khi xem rồng phun lửa.',
    'Biểu diễn Rồng Phun Lửa và Phun Nước độc đáo, Check-in Tượng Cá Chép Hóa Rồng',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-deo-hai-van',
    'loc-deo-hai-van',
    4.9,
    'Miễn phí tham quan',
    'Khuyên nên đi ban ngày (06:00 - 18:00)',
    '07:00 sáng săn biển mây hoặc 16:30 chiều ngắm hoàng hôn vịnh Lăng Cô',
    'Đoạn đèo quanh co hùng vĩ, lái xe máy cần có tay lái vững và kiểm tra phanh kỹ lưỡng.',
    'Dừng chân tại Hải Vân Quan uống cafe ngắm trọn cung đường đèo ven biển.',
    'Thiên hạ đệ nhất hùng quan, Di tích đồn lũy quân sự thời Nguyễn, View vịnh Lăng Cô',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  (
    'dt-ben-du-thuyen-song-han',
    'loc-ben-du-thuyen-song-han',
    4.7,
    '150.000đ - 300.000đ / vé du thuyền ngắm cảnh',
    '18:00 - 22:30',
    '19:30 - 21:00 tối thành phố lung linh ánh đèn cầu quay và cầu Rồng',
    'Mỗi chuyến du ngoạn sông Hàn kéo dài 45-60 phút có phục vụ múa Chăm Pa.',
    'Nên đặt vé trước vào dịp cuối tuần để tránh hết vé chuyến 20:30 xem rồng phun lửa từ dưới sông.',
    'Đi thuyền ngắm 4 cây cầu huyền thoại sông Hàn, Thưởng thức múa Chăm Pa, Trái cây nước uống',
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80',
    ARRAY[
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80'
    ],
    ''
  ),
  -- 15. Hồ Hoàn Kiếm (Hà Nội)
  (
    'dt-ho-hoan-kiem',
    'loc-ho-hoan-kiem',
    4.9,
    'Miễn phí dạo hồ (Đền Ngọc Sơn: 30.000đ/người)',
    'Mở cửa 24/7',
    'Cuối tuần (Thứ 6 - Chủ Nhật) khi toàn bộ khu vực thành phố đi bộ',
    'Phố đi bộ Hồ Gươm có nhiều hoạt động âm nhạc đường phố và trò chơi dân gian.',
    'Nên thử kem Tràng Tiền hoặc kem Thủy Tạ khi dạo quanh hồ.',
    'Tháp Rùa, Cầu Thê Húc, Đền Ngọc Sơn, Kem Tràng Tiền',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 16. Phở Thìn Lò Đúc (Hà Nội)
  (
    'dt-pho-thin-lo-duc',
    'loc-pho-thin-lo-duc',
    4.7,
    '90.000đ - 110.000đ / bát',
    '06:00 - 20:30',
    '07:00 - 08:30 sáng',
    'Phở xào tái lăn ngập hành lá thơm nức, vần lửa béo ngậy truyền thống.',
    'Nên gọi thêm quẩy giòn và trứng chèn nước phở béo.',
    'Phở bò tái lăn, Quẩy giòn, Trứng trần',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 17. Metropole Hà Nội
  (
    'dt-metropole-ha-noi',
    'loc-metropole-ha-noi',
    5.0,
    '7.500.000đ - 20.000.000đ / đêm',
    'Phục vụ 24/7',
    'Mùa thu Hà Nội ngắm khuôn viên kiến trúc Pháp tuyệt đẹp',
    'Khách sạn lâu đời nhất Hà Nội từng đón tiếp nhiều nguyên thủ quốc gia thế giới.',
    'Nên thử tiệc trà chiều Pháp Le Club Bar.',
    'Nhà hàng Pháp Le Beaulieu, Hầm tránh bom lịch sử, Trà chiều Le Club Bar',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
    'https://sofitel-legend-metropole-hanoi.com'
  ),
  -- 18. Nhà Hát Lớn Hà Nội
  (
    'dt-nha-hat-lon-ha-noi',
    'loc-nha-hat-lon-ha-noi',
    4.8,
    '300.000đ - 1.500.000đ / vé xem biểu diễn',
    '08:00 - 22:00',
    'Buổi tối khi lên đèn vàng lộng lẫy',
    'Công trình kiến trúc tân cổ điển kiểu Pháp xây dựng năm 1911.',
    'Uống cà phê Highland ngay góc sân Nhà Hát Lớn thong thả ngắm dòng người.',
    'Biểu diễn hòa nhạc giao hưởng, Opera, Ballet, Cà phê sân vườn',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 19. Chợ Bến Thành (TP.HCM)
  (
    'dt-cho-ben-thanh',
    'loc-cho-ben-thanh',
    4.7,
    'Tùy sản phẩm',
    '06:00 - 18:00 (Chợ đêm 18:30 - 22:00)',
    '15:00 - 18:00',
    'Khu vực bán bánh mứt, đồ mỹ nghệ và ẩm thực đặc sản Nam Bộ.',
    'Hỏi giá và trả giá nhẹ nhàng khi mua quà lưu niệm.',
    'Chè Sài Gòn, Bún mắm, Áo dài, Quà lưu niệm mỹ nghệ',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 20. Cơm Tấm Ba Ghiền (TP.HCM)
  (
    'dt-com-tam-ba-ghien',
    'loc-com-tam-ba-ghien',
    4.8,
    '75.000đ - 120.000đ / dĩa',
    '07:30 - 20:30',
    '11:30 - 13:00',
    'Miếng sườn ướp đậm đà nướng than hồng to che kín cả dĩa cơm tấm.',
    'Nên gọi đĩa đặc biệt gồm sườn, bì, chả, trứng ốp la.',
    'Cơm tấm sườn nướng khổng lồ, Chả trứng hấp, Bì heo giòn',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 21. Landmark 81 SkyView
  (
    'dt-landmark-81-skyview',
    'loc-landmark-81-skyview',
    4.8,
    '420.000đ - 810.000đ / vé',
    '08:30 - 22:00',
    '17:00 chiều ngắm hoàng hôn phủ toàn toàn cảnh Sài Gòn',
    'Khu vực đài quan sát kính trong suốt trên tầng 79-81.',
    'Trải nghiệm VR game nhảy dù ảo từ độ cao 461m.',
    'Đài quan sát SkyView, Cầu kính SkyTouch, VR nhảy dù',
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 22. Rex Hotel Saigon
  (
    'dt-rex-hotel-saigon',
    'loc-rex-hotel-saigon',
    4.8,
    '3.200.000đ - 8.000.000đ / đêm',
    'Phục vụ 24/7',
    'Buổi tối thưởng thức nhạc Jazz tại Rooftop Garden Bar',
    'Khách sạn biểu tượng ngay góc đại lộ Nguyễn Huệ.',
    'Rooftop Garden Bar từng là nơi giao lưu của các phóng viên chiến trường nổi tiếng.',
    'Rooftop Garden Bar, Nhà hàng Hoa Mai, Hồ bơi ngoài trời',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
    'https://rexhotelsaigon.com'
  ),
  -- 23. Đỉnh Fansipan Legend
  (
    'dt-fansipan-legend',
    'loc-fansipan-legend',
    4.9,
    '800.000đ - 1.100.000đ / vé cáp treo',
    '07:30 - 17:30',
    'Sáng sớm 08:30 biển mây trong xanh',
    'Tuyến cáp treo ba dây đạt kỷ lục thế giới đưa du khách vượt thung lũng Mường Hoa.',
    'Mang theo áo ấm dầy và găng tay vì đỉnh núi rất lạnh và nhiều gió.',
    'Cáp treo Fansipan, Đại Tượng Phật A Di Đà, Cột cờ Tổ quốc 3.143m',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'],
    'https://fansipanlegend.sunworld.vn'
  ),
  -- 24. Thắng Cố A Quỳnh Sa Pa
  (
    'dt-thang-co-a-quynh',
    'loc-thang-co-a-quynh',
    4.7,
    '150.000đ - 350.000đ / món',
    '09:00 - 22:00',
    'Buổi tối tiết trời Sa Pa se lạnh',
    'Món thắng cố ngựa truyền thống nấu cùng thảo mộc núi rừng Tây Bắc.',
    'Nên dùng kèm rượu ngô Bắc Hà nóng hổi.',
    'Thắng cố ngựa, Lẩu cá hồi cá tầm Sa Pa, Khâu nhục, Rượu ngô',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 25. Hotel de la Coupole
  (
    'dt-hotel-de-la-coupole',
    'loc-hotel-de-la-coupole',
    5.0,
    '3.500.000đ - 9.000.000đ / đêm',
    'Phục vụ 24/7',
    'Mùa đông săn mây Sa Pa',
    'Kiến trúc Pháp cổ điển kết hợp màu sắc văn hóa dân tộc H''Mông.',
    'Hồ bơi nước nóng trong nhà Le Grand Bassin có thiết kế cực kỳ quý phái.',
    'Hồ bơi nước nóng Le Grand Bassin, Nhà hàng Chic, Absinthe Bar',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'],
    'https://hoteldelacoupole.com'
  ),
  -- 26. Bãi Sao Phú Quốc
  (
    'dt-bai-sao-phu-quoc',
    'loc-bai-sao-phu-quoc',
    4.9,
    'Miễn phí tắm biển',
    '07:00 - 18:00',
    'Tháng 11 đến tháng 4 năm sau (Mùa biển êm)',
    'Bãi cát trắng mịn như kem trải dài 7km với làn nước xanh ngọc bích.',
    'Check-in xích đu cây dừa nghiêng ra biển cực thơ mộng.',
    'Cát trắng mịn, Chèo kayak, Xích đu cây dừa, Hải sản nướng',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 27. Bún Quậy Kiến Xây Phú Quốc
  (
    'dt-bun-quay-kien-xay',
    'loc-bun-quay-kien-xay',
    4.8,
    '55.000đ - 85.000đ / tô',
    '07:30 - 22:00',
    '18:30 tối',
    'Nước dùng ngọt thanh từ cá tôm tươi ngon, tự tay pha nước chấm theo khẩu vị.',
    'Thành phần gồm chả tôm, chả tôm mực quậy trực tiếp vào tô nước dùng sôi.',
    'Bún quậy tôm mực tươi, Tự pha nước chấm tắc ớt muối',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 28. Vinpearl Safari Phú Quốc
  (
    'dt-vinpearl-safari-phu-quoc',
    'loc-vinpearl-safari-phu-quoc',
    4.9,
    '650.000đ - 850.000đ / vé',
    '09:00 - 16:00',
    '09:30 sáng xem show biểu diễn động vật',
    'Công viên bán hoang dã đầu tiên tại Việt Nam với hơn 3.000 cá thể động vật.',
    'Trải nghiệm xe buýt chuyên dụng "Nhốt người thả thú" trải nghiệm cực kỳ thú vị.',
    'Xe buýt Safari ngắm hổ sư tử, Cho hươu cao cổ ăn, Show diễn chim',
    'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 29. Đại Nội Huế
  (
    'dt-dai-noi-hue',
    'loc-dai-noi-hue',
    4.9,
    '200.000đ / người',
    '07:00 - 17:30',
    '08:00 sáng hoặc 15:30 chiều',
    'Hoàng thành của 13 vị vua triều Nguyễn với kiến trúc cung đình đồ sộ.',
    'Thuê bộ trang phục triều phục hoàng gia chụp ảnh tại Điện Thái Hòa.',
    'Ngọ Môn, Điện Thái Hòa, Thế Miếu, Tử Cấm Thành, Thuê trang phục Cung đình',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 30. Bún Bò Huế Mạ Tôn
  (
    'dt-bun-bo-hue-mo-rot',
    'loc-bun-bo-hue-mo-rot',
    4.8,
    '40.000đ - 65.000đ / tô',
    '06:00 - 21:00',
    '07:00 sáng',
    'Nước dùng ruốc sả thơm lừng đậm đà chuẩn vị Cố đô.',
    'Nên gọi tô đặc biệt có chả crab, huyết, gân bò và giò heo.',
    'Bún bò Huế huyết giò heo, Chả cua Huế, Rau sống hoa chuối',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80'],
    ''
  ),
  -- 31. Silk Path Grand Hue
  (
    'dt-silk-path-hue',
    'loc-silk-path-hue',
    4.9,
    '1.800.000đ - 4.500.000đ / đêm',
    'Phục vụ 24/7',
    'Mùa lễ hội Festival Huế',
    'Khách sạn thiết kế hòa quyện giữa vẻ đẹp Indochine và kiến trúc Cung đình Huế.',
    'Vị trí ngay trung tâm thành phố, thuận tiện đi bộ ra dòng sông Hương thơ mộng.',
    'Hồ bơi ngoài trời hướng sân vườn, Spa trị liệu Cung đình, Nhà hàng Olivio',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80'],
    'https://silkpathhotel.com'
  )
ON CONFLICT (location_id) DO UPDATE SET
  rating = EXCLUDED.rating,
  price_range = EXCLUDED.price_range,
  opening_hours = EXCLUDED.opening_hours,
  best_time_to_visit = EXCLUDED.best_time_to_visit,
  notes = EXCLUDED.notes,
  travel_tips = EXCLUDED.travel_tips,
  specialties = EXCLUDED.specialties,
  thumbnail_url = EXCLUDED.thumbnail_url,
  gallery_urls = EXCLUDED.gallery_urls,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 6. GẮN THẺ NHÃN CHO ĐỊA ĐIỂM (travel_location_tags)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_location_tags (location_id, tag_id)
VALUES
  ('loc-bana-hills', 'song_ao'),
  ('loc-bana-hills', 'gia_dinh'),
  ('loc-pho-co-hoi-an', 'song_ao'),
  ('loc-pho-co-hoi-an', 'dac_san'),
  ('loc-pho-co-hoi-an', 'view_hoang_hon'),
  ('loc-bien-my-khe', 'view_bien'),
  ('loc-bien-my-khe', 'gia_dinh'),
  ('loc-bien-my-khe', 'gia_binh_dan'),
  ('loc-chua-linh-ung', 'view_bien'),
  ('loc-chua-linh-ung', 'gia_binh_dan'),
  ('loc-banh-xeo-nam-hien', 'dac_san'),
  ('loc-banh-xeo-nam-hien', 'gia_binh_dan'),
  ('loc-mi-quang-ba-mua', 'dac_san'),
  ('loc-mi-quang-ba-mua', 'gia_binh_dan'),
  ('loc-com-ga-ba-buoi', 'dac_san'),
  ('loc-com-ga-ba-buoi', 'michelin'),
  ('loc-banh-mi-phuong', 'dac_san'),
  ('loc-banh-mi-phuong', 'michelin'),
  ('loc-banh-mi-phuong', 'gia_binh_dan'),
  ('loc-intercontinental-danang', 'view_bien'),
  ('loc-intercontinental-danang', 'song_ao'),
  ('loc-intercontinental-danang', 'michelin'),
  ('loc-haian-beach-hotel', 'view_bien'),
  ('loc-haian-beach-hotel', 'song_ao'),
  ('loc-vinwonders-nam-hoi-an', 'gia_dinh'),
  ('loc-vinwonders-nam-hoi-an', 'song_ao'),
  ('loc-cau-rong-da-nang', 'song_ao'),
  ('loc-cau-rong-da-nang', 'mo_muon'),
  ('loc-deo-hai-van', 'view_hoang_hon'),
  ('loc-deo-hai-van', 'song_ao'),
  ('loc-ben-du-thuyen-song-han', 'view_hoang_hon'),
  ('loc-ben-du-thuyen-song-han', 'mo_muon')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. LỊCH TRÌNH CHUYẾN ĐI MẪU (travel_trips & travel_trip_stops)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_trips (
  id, title, description, start_date, end_date, budget, cover_image, status
)
VALUES
  (
    'trip-danang-hoian-4n3d',
    'Hành Trình Khám Phá Đà Nẵng - Hội An 4N3Đ',
    'Lịch trình chi tiết trọn vẹn 4 ngày 3 đêm kết hợp tắm biển Mỹ Khê, ngắm hoàng hôn phố cổ Hội An, chinh phục đỉnh Bà Nà Hills và food tour đặc sản.',
    '2026-10-15',
    '2026-10-18',
    6500000,
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
    'planning'
  ),
  (
    'trip-foodtour-danang',
    'Cuối Tuần Food Tour Ẩm Thực Đà Thành',
    'Trải nghiệm trọn vẹn các món ăn đường phố trứ danh: Bánh xèo tôm nhảy, Mì Quảng, Chè sầu riêng, Hải sản tươi sống ven biển.',
    '2026-11-06',
    '2026-11-08',
    2500000,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    'completed'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  budget = EXCLUDED.budget,
  cover_image = EXCLUDED.cover_image,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Các điểm dừng trong chuyến đi 4N3Đ
INSERT INTO public.travel_trip_stops (
  id, trip_id, location_id, day_number, visit_time, order_index, transport_mode, stop_notes
)
VALUES
  -- NGÀY 1: Nhận phòng, tắm biển & ngắm Cầu Rồng phun lửa
  (
    'stop-d1-1',
    'trip-danang-hoian-4n3d',
    'loc-haian-beach-hotel',
    1,
    '14:00',
    1,
    'driving',
    'Check-in khách sạn, nghỉ ngơi cất hành lý sau chuyến bay'
  ),
  (
    'stop-d1-2',
    'trip-danang-hoian-4n3d',
    'loc-bien-my-khe',
    1,
    '16:30',
    2,
    'walking',
    'Tắm biển Mỹ Khê đón hoàng hôn và chụp ảnh bãi cát trắng'
  ),
  (
    'stop-d1-3',
    'trip-danang-hoian-4n3d',
    'loc-banh-xeo-nam-hien',
    1,
    '18:30',
    3,
    'driving',
    'Ăn tối bánh xèo tôm nhảy và nem lụi giòn rụm'
  ),
  (
    'stop-d1-4',
    'trip-danang-hoian-4n3d',
    'loc-cau-rong-da-nang',
    1,
    '20:30',
    4,
    'driving',
    'Ngắm Cầu Rồng biểu diễn phun lửa và phun nước độc đáo lúc 21:00'
  ),

  -- NGÀY 2: Trọn vẹn Bà Nà Hills
  (
    'stop-d2-1',
    'trip-danang-hoian-4n3d',
    'loc-mi-quang-ba-mua',
    2,
    '07:30',
    1,
    'driving',
    'Điểm tâm sáng mì Quảng đậm vị nạp năng lượng'
  ),
  (
    'stop-d2-2',
    'trip-danang-hoian-4n3d',
    'loc-bana-hills',
    2,
    '09:00',
    2,
    'driving',
    'Lên đỉnh Bà Nà đi cáp treo, check-in Cầu Vàng, Làng Pháp và vui chơi'
  ),
  (
    'stop-d2-3',
    'trip-danang-hoian-4n3d',
    'loc-ben-du-thuyen-song-han',
    2,
    '19:30',
    3,
    'driving',
    'Du thuyền sông Hàn ngắm cảnh Đà Nẵng về đêm lung linh'
  ),

  -- NGÀY 3: Bán đảo Sơn Trà & Chiều tối Phố Cổ Hội An
  (
    'stop-d3-1',
    'trip-danang-hoian-4n3d',
    'loc-chua-linh-ung',
    3,
    '08:00',
    1,
    'driving',
    'Chiêm bái Chùa Linh Ứng Sơn Trà và tượng Phật Bà Quan Âm 67m'
  ),
  (
    'stop-d3-2',
    'trip-danang-hoian-4n3d',
    'loc-pho-co-hoi-an',
    3,
    '15:00',
    2,
    'driving',
    'Di chuyển vào Hội An, dạo phố đèn lồng, thả hoa đăng sông Hoài'
  ),
  (
    'stop-d3-3',
    'trip-danang-hoian-4n3d',
    'loc-com-ga-ba-buoi',
    3,
    '18:00',
    3,
    'walking',
    'Thưởng thức bữa tối cơm gà Bà Buội gia truyền thơm nức'
  ),
  (
    'stop-d3-4',
    'trip-danang-hoian-4n3d',
    'loc-banh-mi-phuong',
    3,
    '20:30',
    4,
    'walking',
    'Mua bánh mì Phượng ăn khuya trước khi trở về khách sạn'
  )
ON CONFLICT (id) DO UPDATE SET
  day_number = EXCLUDED.day_number,
  visit_time = EXCLUDED.visit_time,
  order_index = EXCLUDED.order_index,
  stop_notes = EXCLUDED.stop_notes;

-- -----------------------------------------------------------------------------
-- 8. NHẬT KÝ TRẢI NGHIỆM & ĐÁNH GIÁ MẪU (travel_reviews_logs)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_reviews_logs (
  id, location_id, visited_at, rating, actual_expense, review_text, weather, companion
)
VALUES
  (
    'rev-01',
    'loc-bana-hills',
    NOW() - INTERVAL '2 days',
    5.0,
    1150000,
    'Cầu Vàng buổi sáng mây bay sương mù vây quanh cực kỳ ảo diệu! Buffet tại Làng Pháp món ăn đa dạng, cáp treo đi rất êm và an toàn.',
    'Nắng râm mát 22°C',
    'Gia đình'
  ),
  (
    'rev-02',
    'loc-pho-co-hoi-an',
    NOW() - INTERVAL '4 days',
    5.0,
    320000,
    'Buổi tối Hội An lên đèn lồng đẹp như trong tranh cổ tích. Ngồi thuyền thả hoa đăng trên sông Hoài và nhâm nhi ly trà Mót mát lạnh thật sự đáng nhớ!',
    'Mát mẻ 25°C',
    'Cặp đôi'
  ),
  (
    'rev-03',
    'loc-banh-xeo-nam-hien',
    NOW() - INTERVAL '5 days',
    4.8,
    170000,
    'Bánh xèo tôm đất rất tươi, vỏ giòn tan không bị đọng dầu mỡ. Nước sốt gan đậu phộng béo bùi chuẩn vị miền Trung.',
    'Trời trong xanh',
    'Nhóm bạn'
  ),
  (
    'rev-04',
    'loc-com-ga-ba-buoi',
    NOW() - INTERVAL '7 days',
    4.7,
    150000,
    'Thịt gà dai ngọt tự nhiên, da vàng ươm giòn sần sật. Đĩa cơm thơm lừng nấu cùng nước dùng gà, dưa chua ăn kèm giải ngấy cực chuẩn.',
    'Nắng nhẹ',
    'Đi một mình'
  )
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  actual_expense = EXCLUDED.actual_expense,
  review_text = EXCLUDED.review_text;

-- -----------------------------------------------------------------------------
-- 9. SỔ CHI TIÊU DU LỊCH THEO TỪNG ĐỊA ĐIỂM (travel_expenses)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_expenses (
  id, trip_id, location_id, title, category, amount, payment_method, notes
)
VALUES
  (
    'exp-01',
    'trip-danang-hoian-4n3d',
    'loc-bana-hills',
    'Vé cáp treo Bà Nà Hills & Buffet trưa 4 Mùa (2 người)',
    'ticket',
    2300000,
    'card',
    'Đặt trước qua online được chiết khấu 5%'
  ),
  (
    'exp-02',
    'trip-danang-hoian-4n3d',
    'loc-haian-beach-hotel',
    'Tiền phòng khách sạn Haian Beach Hotel (3 đêm)',
    'hotel',
    3600000,
    'transfer',
    'Phòng Deluxe Seaview bao gồm buffet sáng'
  ),
  (
    'exp-03',
    'trip-danang-hoian-4n3d',
    'loc-banh-xeo-nam-hien',
    'Ăn tối bánh xèo tôm nhảy & nem lụi nướng',
    'food',
    180000,
    'cash',
    'Ăn 4 cái bánh xèo + 10 cây nem lụi + nước ngọt'
  ),
  (
    'exp-04',
    'trip-danang-hoian-4n3d',
    'loc-ben-du-thuyen-song-han',
    'Vé du thuyền ngắm cảnh sông Hàn buổi tối',
    'ticket',
    300000,
    'cash',
    'Vé cho 2 người lớn chuyến 19:30'
  ),
  (
    'exp-05',
    'trip-danang-hoian-4n3d',
    'loc-com-ga-ba-buoi',
    'Bữa tối cơm gà Hội An & gỏi gà hoa chuối',
    'food',
    195000,
    'cash',
    '2 phần cơm gà xé + 1 đĩa gỏi gà'
  ),
  (
    'exp-06',
    'trip-danang-hoian-4n3d',
    NULL,
    'Thuê xe máy tay ga tự lái (3 ngày) & Xăng xe',
    'transport',
    500000,
    'cash',
    'Thuê xe AirBlade tại sân bay 120k/ngày + 140k tiền xăng'
  ),
  (
    'exp-07',
    'trip-danang-hoian-4n3d',
    'loc-pho-co-hoi-an',
    'Mua quà lưu niệm đèn lồng Hội An & bánh đậu xanh',
    'shopping',
    250000,
    'cash',
    'Mua 2 chiếc đèn lồng lụa và 5 hộp bánh làm quà'
  )
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  title = EXCLUDED.title,
  category = EXCLUDED.category;

-- -----------------------------------------------------------------------------
-- 10. BÁO CÁO PHẢN ÁNH ĐỊA ĐIỂM MẪU (travel_reports)
-- -----------------------------------------------------------------------------
INSERT INTO public.travel_reports (
  id, location_id, location_name, location_address, reported_by_user_id, reported_by_user_name, reported_by_user_email, reason, description, status, admin_note
)
VALUES
  (
    'rep-01',
    'loc-com-ga-ba-buoi',
    'Cơm Gà Bà Buội Hội An',
    '22 Phan Chu Trinh, Phường Minh An, TP. Hội An, Quảng Nam',
    'user-member-02',
    'Nguyễn Văn Du Khách',
    'user@travelmaps.vn',
    'hours_changed',
    'Quán hiện tại thường hết gà sớm từ 19:30 vào các ngày cuối tuần, đề nghị cập nhật để mọi người đến sớm kẻo lỡ chuyến.',
    'resolved',
    'Đã kiểm tra và cập nhật ghi chú giờ mở cửa trong chi tiết địa điểm.'
  ),
  (
    'rep-02',
    'loc-deo-hai-van',
    'Đỉnh Đèo Hải Vân & Hải Vân Quan',
    'Đỉnh Đèo Hải Vân, Ranh giới Đà Nẵng - Thừa Thiên Huế',
    'user-member-02',
    'Trần Phượt Thủ',
    'phuotthu@gmail.com',
    'info_error',
    'Di tích Hải Vân Quan vừa hoàn thành trùng tu rất đẹp, đã mở cổng đón khách tham quan tự do.',
    'pending',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  admin_note = EXCLUDED.admin_note;

-- -----------------------------------------------------------------------------
-- HOÀN TẤT NẠP DỮ LIỆU MẪU
-- -----------------------------------------------------------------------------
SELECT 
  (SELECT count(*) FROM public.travel_locations WHERE is_deleted = false) AS total_locations,
  (SELECT count(*) FROM public.travel_groups) AS total_groups,
  (SELECT count(*) FROM public.travel_trips) AS total_trips,
  (SELECT count(*) FROM public.travel_reviews_logs) AS total_reviews,
  (SELECT count(*) FROM public.travel_expenses) AS total_expenses;
