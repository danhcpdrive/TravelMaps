# 🗺️ Travel Maps - Bản Đồ Du Lịch & Ẩm Thực Tương Tác

Ứng dụng web hiện đại, trực quan giúp tìm kiếm, lưu trữ, lên kế hoạch lịch trình và quản lý các địa điểm du lịch, nhà hàng ẩm thực, dịch vụ tiện ích trên bản đồ tương tác với khả năng định vị GPS thực tế.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🗺️ Bản Đồ Tương Tác & Định Vị GPS
- **Tích hợp Leaflet Maps**: Bản đồ đa dạng lớp nền (Thường, Vệ tinh, Địa hình, Đêm) mượt mà.
- **Định vị vị trí hiện tại**: Phóng to và di chuyển mượt mà (`flyTo`) tới vị trí GPS thực tế của bạn với hiệu ứng nhịp đập trực quan.
- **Phân nhóm màu sắc ghim**: Phân biệt rõ ràng các ghim địa điểm theo 5 nhóm dịch vụ (Du lịch, Ẩm thực, Dịch vụ, Giải trí, Khác).

### 2. 📍 Quản Lý & Tìm Kiếm Địa Điểm
- **Bộ lọc đa chiều**: Lọc nhanh theo Nhóm dịch vụ, Thành phố/Tỉnh thành, Tìm kiếm từ khóa, Đã đến / Chưa đến, Địa điểm Yêu thích.
- **Sắp xếp linh hoạt**: Theo đánh giá, khoảng cách từ vị trí GPS, tên A-Z, hoặc mới nhất.
- **Chi tiết địa điểm phong phú**: Đánh giá sao, mức giá, giờ mở cửa, thời điểm lý tưởng, ghi chú, mẹo du lịch, đặc sản & bộ sưu tập ảnh.

### 3. 🗓️ Lập Kế Hoạch & Lịch Trình Chuyến Đi (Trip Planner)
- Tạo danh sách chuyến đi theo thời gian, điểm đến.
- Sắp xếp thứ tự các điểm dừng, tự động tính tổng khoảng cách (km) & thời gian di chuyển ước tính.
- Đánh dấu hoàn thành từng chặng trong chuyến đi.

### 4. 💰 Quản Lý Chi Tiêu Chuyến Đi (Expense Tracker)
- Ghi chép các khoản chi tiêu (Ăn uống, Di chuyển, Khách sạn, Vé tham quan, Mua sắm, Khác).
- So sánh ngân sách dự kiến và tổng chi thực tế với thanh tiến độ màu sắc.
- Lọc chi tiêu theo ngày hoặc theo từng chuyến đi cụ thể.

### 5. 📸 Đánh Giá & Lưu Nhớ Trải Nghiệm (Reviews & Log)
- Lưu giữ nhật ký chuyến đi, đánh giá cá nhân và cảm nhận chi tiết.
- Quản lý thẻ tag check-in (Sống ảo, Đặc sản, View hoàng hôn, Michelin, v.v.).

### 6. 🚨 Báo Cáo & Quản Trị Hệ Thống (RBAC)
- **Gửi báo cáo địa điểm**: Người dùng có thể báo cáo thông tin địa điểm bị sai, đóng cửa hoặc trùng lặp.
- **Phân quyền người dùng**:
  - **Khách xem (Viewer)**: Tra cứu bản đồ, tìm kiếm địa điểm.
  - **Thành viên (User)**: Đăng tải địa điểm, lập lịch trình, ghi chép chi tiêu, đánh giá.
  - **Quản trị viên (Admin)**: Duyệt & quản lý báo cáo, quản lý danh sách người dùng và dữ liệu.

### 7. 🔄 Đồng Bộ Supabase & Nhập/Xuất Dữ Liệu
- **Hỗ trợ CSDL Supabase PostgreSQL**: Đồng bộ dữ liệu đa thiết bị theo thời gian thực.
- **Chế độ lưu trữ Offline**: Tự động lưu trên `localStorage` khi chưa cấu hình CSDL.
- **Import / Export**: Nhập & xuất dữ liệu địa điểm ra file JSON hoặc CSV dễ dàng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Bản đồ**: Leaflet.js, React-Leaflet
- **Cơ sở dữ liệu**: Supabase (PostgreSQL), LocalStorage API
- **Mã hóa & Xác thực**: Custom Auth Engine, Bcrypt Hash

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Run Locally)

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18.x trở lên
- **npm** hoặc **yarn** / **bun**

### Các bước thực hiện

1. **Cloning / Tải mã nguồn**:
   ```bash
   git clone <repository-url>
   cd travel-maps
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Cấu hình môi trường (Tùy chọn cho Supabase)**:
   Tạo file `.env.local` ở thư mục gốc (hoặc sao chép từ `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   *(Nếu không cấu hình Supabase, ứng dụng sẽ tự động hoạt động ở chế độ LocalStorage).*

4. **Chạy ứng dụng ở môi trường phát triển**:
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ: `http://localhost:3000`

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu Supabase

Ứng dụng đi kèm script khởi tạo CSDL hoàn chỉnh trong file **`sqlsample.sql`** ở thư mục gốc.

### Các bảng chính:
1. `travel_groups`: Danh mục nhóm dịch vụ (Du lịch, Ẩm thực, Dịch vụ, Giải trí, Khác).
2. `travel_locations`: Thông tin tọa độ, địa chỉ, trạng thái kiểm tra & yêu thích.
3. `travel_location_details`: Chi tiết đánh giá, khung giờ, bài viết, mẹo du lịch, album ảnh.
4. `travel_cities`: Danh sách các tỉnh thành / thành phố du lịch.
5. `travel_location_full_view`: View tổng hợp giúp truy vấn nhanh dữ liệu địa điểm.

### Hướng dẫn khởi tạo Supabase:
1. Mở trang quản trị **Supabase Dashboard** -> vào mục **SQL Editor**.
2. Mở file `sqlsample.sql` trong dự án, copy toàn bộ nội dung dán vào SQL Editor.
3. Nhấn **Run** để khởi tạo các bảng và dữ liệu cơ sở.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
├── public/                 # Assets tĩnh (icons, images)
├── src/
│   ├── components/         # Các React Component giao diện (Modal, Navbar, Map, List, v.v.)
│   ├── lib/                # Thư viện tiện ích (Supabase client, Auth logic, Geo Utils)
│   ├── types.ts            # Định nghĩa các TypeScript Interface & Types
│   ├── App.tsx             # Component chính quản lý State toàn bộ ứng dụng
│   ├── index.css           # Cấu hình Tailwind CSS
│   └── main.tsx            # Entry point của ứng dụng
├── sqlsample.sql           # Script SQL khởi tạo CSDL Supabase
├── metadata.json           # Cấu hình tên, mô tả và quyền ứng dụng
├── README.md               # Tài liệu hướng dẫn dự án
└── package.json            # Quản lý thư viện dependencies
```

---

## 📄 Giấy Phép (License)

Dự án được phát hành dưới giấy phép **MIT License**.
