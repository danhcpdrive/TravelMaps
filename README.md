# 🗺️ Travel Maps - Nền Tảng Bản Đồ Du Lịch, Ẩm Thực & Lập Lịch Trình Thông Minh

Hệ thống ứng dụng web tương tác hiện đại giúp người dùng khám phá, tìm kiếm, lưu trữ, lập kế hoạch chuyến đi, quản lý chi tiêu và trải nghiệm 63 tỉnh thành Việt Nam trên nền tảng bản đồ GPS thời gian thực.

Ứng dụng được xây dựng theo kiến trúc **Hybrid Storage (Supabase PostgreSQL + Offline LocalStorage)**, tích hợp hệ thống phân quyền đa người dùng (**RBAC**) cùng bộ công cụ quản trị (**Admin Dashboard**) mạnh mẽ.

---

## 🎯 Mục Đích & Nhu Cầu Của Dự Án

- **Khám phá & Định vị thông minh**: Giúp người dùng dễ dàng tra cứu, lọc và điều hướng đến hàng trăm địa điểm du lịch, ẩm thực, vui chơi giải trí trên khắp 63 tỉnh thành Việt Nam.
- **Tối ưu hóa hành trình du lịch (Trip Planner)**: Tự động tính toán tổng cự ly di chuyển (km), thời gian ước tính, sắp xếp thứ tự các điểm dừng chân khoa học.
- **Quản lý tài chính chuyến đi (Expense Tracker)**: Lập ngân sách dự kiến, theo dõi chi tiêu thực tế theo từng hạng mục (ăn uống, đi lại, lưu trú, vé tham quan...) với thanh trực quan hóa tài chính.
- **Cộng đồng đóng góp & Báo cáo chất lượng**: Tiếp nhận phản hồi, đánh giá cá nhân và báo cáo sai lệch/đóng cửa địa điểm từ người dùng để duy trì dữ liệu chuẩn xác.
- **Hệ thống phân quyền & Quản trị dữ liệu**: Cung cấp tài khoản Quản trị viên (Admin) để quản lý thành viên, kiểm duyệt báo cáo, nhập/xuất file sao lưu (JSON/SQL), tích hợp cơ sở dữ liệu Supabase chỉ với 1 cú nhấp chuột.

---

## 🌟 Tính Năng Trọng Tâm

### 1. 🗺️ Bản Đồ Tương Tác Đa Nền Tảng & Định Vị GPS
- **Lớp bản đồ phong phú**: Hỗ trợ chuyển đổi linh hoạt giữa bản đồ Tiêu chuẩn (Street), Vệ tinh (Satellite), Địa hình (Terrain) và Chế độ Ban đêm (Dark Mode).
- **Định vị GPS thực tế**: Tự động xác định vị trí hiện tại với hiệu ứng sóng radar xung động, tự tính khoảng cách từ vị trí người dùng đến từng địa điểm.
- **Bộ nhận diện Marker theo nhóm dịch vụ**: Ghim bản đồ được phân màu và biểu tượng trực quan theo 5 nhóm:
  - 🏞️ **Du lịch & Danh thắng** (Xanh lá)
  - 🍜 **Ẩm thực & Nhà hàng** (Cam ấm)
  - ☕ **Dịch vụ & Tiện ích** (Xanh dương)
  - 🎪 **Giải trí & Vui chơi** (Tím)
  - 📌 **Khác & Điểm dừng chân** (Xám tro)

### 2. 🔍 Bộ Lọc & Tìm Kiếm Đa Tiêu Chí
- Tìm kiếm tức thì theo tên địa điểm, địa chỉ, món ăn đặc sản, hashtag.
- Lọc theo **63 Tỉnh Thành Việt Nam** hoặc theo từng **Nhóm dịch vụ**.
- Lọc nhanh: Địa điểm yêu thích (❤️), Đã ghé thăm (✅), Chưa đến (📍).
- Sắp xếp linh hoạt: Gần vị trí bạn nhất, Đánh giá cao nhất, Theo tên A-Z, Ngày tạo mới nhất.

### 3. 📝 Thông Tin Địa Điểm Chi Tiết
- Hình ảnh chất lượng cao, bài viết giới thiệu, đánh giá sao, phân khúc giá (₫ - ₫₫₫₫).
- Khung giờ mở cửa, thời điểm lý tưởng nhất trong năm để ghé thăm.
- Mẹo du lịch (Tips), món ngon phải thử (Must-try food), thẻ tag check-in.
- Mở chỉ đường trực tiếp qua Google Maps hoặc Apple Maps chỉ với 1 nút bấm.

### 4. 🧭 Lập Kế Hoạch Chuyến Đi (Trip Planner)
- Tạo và quản lý nhiều chuyến đi song song theo ngày khởi hành/kết thúc.
- Thêm/bớt các điểm dừng chân trong chuyến đi, kéo thả sắp xếp thứ tự lộ trình.
- Tự động đo khoảng cách tổng cộng giữa các điểm dừng và ước lượng thời gian di chuyển.
- Đánh dấu trạng thái hoàn thành từng điểm dừng chân trong suốt hành trình.

### 5. 💰 Quản Lý Ngân Sách & Chi Tiêu (Expense Tracker)
- Thiết lập hạn mức ngân sách dự kiến cho chuyến đi.
- Ghi nhận chi tiết từng khoản chi: Số tiền, Hạng mục (Ăn uống, Đi lại, Khách sạn, Vé tham quan, Mua sắm, Khác), Ngày chi và Ghi chú.
- Thanh tiến độ cảnh báo ngân sách theo màu sắc (Xanh an toàn / Đỏ vượt ngân sách).

### 6. ⭐ Nhật Ký & Đánh Giá Cá Nhân (Reviews & Log)
- Lưu giữ nhật ký trải nghiệm, cảm nhận cá nhân sau mỗi chuyến đi.
- Chấm điểm chất lượng phục vụ, cảnh quan, chi phí và lưu trữ vĩnh viễn.

### 7. 👥 Quản Lý Tài Khoản, Phân Quyền & Avatar DiceBear
- **Hệ thống phân quyền 3 cấp độ (RBAC)**:
  - 👁️ **Khách thăm quan (Viewer)**: Xem bản đồ, tìm kiếm, tra cứu thông tin mà không cần tài khoản.
  - 👤 **Thành viên (User)**: Đăng tải địa điểm mới, tạo lịch trình cá nhân, ghi chép chi tiêu, đánh giá.
  - 🛡️ **Quản trị viên (Admin)**: Toàn quyền quản trị người dùng, phân quyền Admin, duyệt báo cáo, cấu hình CSDL, xuất nhập dữ liệu.
- **Bảo mật**: Mật khẩu mã hóa băm chuẩn Bcrypt salt round 10.
- **Avatar DiceBear thông minh**: Tích hợp các bộ sinh avatar đồ họa SVG trực tuyến (`avataaars`, `bottts`, `personas`, `lorelei`, `adventurer`...) kèm tính năng đổi ngẫu nhiên hoặc dán link ảnh tùy thích.
- **Bảo vệ Root Admin**: Khóa an toàn ngăn việc tự xóa hoặc giáng cấp tài khoản Admin Gốc (ID: 1).

### 8. 🛡️ Báo Cáo Sai Lệch Địa Điểm (Community Moderation)
- Cho phép người dùng gửi báo cáo khi phát hiện: *Sai tọa độ/địa chỉ, Đã đóng cửa, Trùng lặp, Thông tin sai lệch*.
- Admin có bảng điều khiển quản lý, duyệt và xử lý các báo cáo gửi về.

### 9. 💾 Kiến Trúc Lưu Trữ Kép (Supabase PostgreSQL + Local Storage)
- **Tự động Fallback an toàn**: Nếu chưa kết nối Supabase, ứng dụng hoạt động 100% đầy đủ tính năng thông qua LocalStorage.
- **Đồng bộ Supabase Realtime**: Khi nhập URL & Anon Key của Supabase, dữ liệu tự động đồng bộ lên máy chủ đám mây PostgreSQL.
- **Trình xuất nhập (Backup & Restore)**:
  - Hỗ trợ xuất và nạp file sao lưu định dạng `.json`.
  - Hỗ trợ nạp trực tiếp file script SQL (`.sql`) với trình phân tích cú pháp thông minh.
  - Trình xem Script SQL tích hợp sẵn toàn bộ mã DDL 11 bảng, Trigger, RLS Policies và dữ liệu mẫu 63 tỉnh thành.

---

## 🏗️ Kiến Trúc Cơ Sở Dữ Liệu (Supabase PostgreSQL)

Cơ sở dữ liệu được thiết kế chuẩn hóa quan hệ (3NF) gồm **11 bảng** và **1 View tổng hợp**:

```
├── travel_users             # Tài khoản, phân quyền (admin/user/viewer), avatar, bảo mật
├── travel_groups            # 5 nhóm danh mục dịch vụ chính kèm màu sắc & icon
├── travel_cities            # 63 Tỉnh / Thành phố Việt Nam kèm tọa độ trung tâm
├── travel_locations         # Bảng lõi địa điểm, tọa độ lat/lng, liên kết group & city
├── travel_location_details  # Bảng mở rộng: mô tả, giờ mở cửa, mùa đẹp, mẹo, album ảnh
├── travel_trips             # Kế hoạch chuyến đi, điểm đến, ngày bắt đầu/kết thúc
├── travel_trip_stops        # Các điểm dừng chân cụ thể trong từng chuyến đi
├── travel_expenses          # Chi tiết các khoản chi tiêu thực tế phát sinh
├── travel_expense_budgets   # Hạn mức ngân sách dự kiến của từng chuyến đi
├── travel_reviews           # Đánh giá, chấm điểm và nhật ký trải nghiệm cá nhân
├── travel_reports           # Báo cáo sai lệch địa điểm do cộng đồng gửi về
└── travel_location_full_view # View JOIN tối ưu hóa truy vấn toàn bộ thông tin địa điểm
```

---

## 🛠️ Công Nghệ Phát Triển (Tech Stack)

| Hạng mục | Công nghệ sử dụng |
| :--- | :--- |
| **Giao diện (Frontend)** | React 18, TypeScript, Vite |
| **Tạo kiểu (Styling)** | Tailwind CSS, Lucide Icons, Animation Motion |
| **Bản đồ số (Map Engine)** | Leaflet.js, React-Leaflet, OpenStreetMap, CartoDB, Esri Satellite |
| **Cơ sở dữ liệu đám mây** | Supabase (PostgreSQL 15+), Row Level Security (RLS) |
| **Lưu trữ ngoại tuyến** | Browser LocalStorage API (Offline-first Fallback) |
| **Xác thực & Mã hóa** | Bcrypt Password Hashing, Session Management |
| **Avatar Engine** | DiceBear SVG Microservice API |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản `>= 18.0.0`
- **npm** (hoặc `pnpm`, `yarn`)

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Cấu hình biến môi trường (Tùy chọn)
Tạo file `.env` hoặc `.env.local` ở thư mục gốc nếu muốn kết nối cố định tới Supabase:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*(Nếu không khai báo biến môi trường, bạn vẫn có thể nhập thông tin Supabase trực tiếp ngay trên giao diện ứng dụng).*

### 4. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Truy cập ứng dụng trên trình duyệt tại: **`http://localhost:3000`**

### 5. Build dự án cho Production
```bash
npm run build
```

---

## 🔑 Tài Khoản Quản Trị Viên Mặc Định

Hệ thống được thiết lập sẵn tài khoản Quản trị viên khởi tạo:
- **Email**: `caophuocdanh@hotmail.com`
- **Mật khẩu**: `0918273645`
- **Vai trò**: Quản trị viên (Admin ID: 1)

*(Bạn có thể đổi mật khẩu, cập nhật tên và avatar của tài khoản này bất kỳ lúc nào trong phần Hồ Sơ Cá Nhân).*

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
travel-maps/
├── public/                    # Tài nguyên tĩnh (favicon, icons, assets)
├── src/
│   ├── components/            # Các module giao diện React
│   │   ├── AdminUserManagerModal.tsx # Quản lý người dùng, phân quyền, reset pass
│   │   ├── AddLocationModal.tsx      # Modal thêm mới / sửa địa điểm
│   │   ├── ExpensesModal.tsx         # Quản lý ngân sách & chi tiêu chuyến đi
│   │   ├── ImportExportModal.tsx     # Nhập/xuất JSON, nạp file SQL sao lưu
│   │   ├── LocationDetailModal.tsx   # Chi tiết địa điểm, chỉ đường, mẹo, đánh giá
│   │   ├── LocationReportModal.tsx   # Gửi báo cáo sai lệch địa điểm
│   │   ├── MapComponent.tsx          # Bản đồ Leaflet tương tác & GPS
│   │   ├── Navbar.tsx                # Thanh điều hướng, tìm kiếm, lọc nhanh
│   │   ├── SupabaseModal.tsx         # Trình cấu hình & xem Script SQL khởi tạo
│   │   ├── TripPlannerModal.tsx      # Lên kế hoạch chuyến đi, sắp xếp lộ trình
│   │   └── UserProfileModal.tsx      # Hồ sơ người dùng, đổi avatar DiceBear
│   ├── lib/                   # Thư viện xử lý logic & kết nối
│   │   ├── auth.ts            # Quản lý phiên đăng nhập, RBAC, hash mật khẩu
│   │   ├── geo.ts             # Thuật toán tính khoảng cách GPS (Haversine)
│   │   ├── sqlScript.ts       # Script DDL/DML khởi tạo 11 bảng CSDL chuẩn
│   │   └── supabase.ts        # Supabase Client, CRUD operations, Local fallback
│   ├── types.ts               # Khai báo TypeScript Interfaces & Models
│   ├── App.tsx                # Root Component kết nối State & Luồng nghiệp vụ
│   ├── index.css              # Tùy biến Tailwind CSS toàn cục
│   └── main.tsx               # Điểm nhập khởi chạy React App
├── sqlsample.sql              # Script SQL mẫu hỗ trợ nạp CSDL đầy đủ
├── metadata.json              # Khai báo cấu hình dự án
├── package.json               # Danh sách thư viện phụ thuộc
└── README.md                  # Tài liệu hướng dẫn sử dụng & kiến trúc
```

---

## 📜 Giấy Phép (License)

Dự án được phát hành theo giấy phép mã nguồn mở **MIT License**.
Tự do sử dụng, chỉnh sửa và phát triển phục vụ mục đích học tập và công việc.
