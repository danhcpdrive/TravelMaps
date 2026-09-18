export type ServiceGroup = 'du_lich' | 'an_uong' | 'dich_vu' | 'giai_tri' | 'khac';

/**
 * Bảng 1: travel_groups (Table Group)
 * Quản lý các phân nhóm dịch vụ
 */
export interface ServiceGroupRecord {
  id: ServiceGroup;
  name: string;
  icon: string;
  badge_bg: string;
  marker_color: string;
  description?: string;
  sort_order: number;
}

export interface ServiceGroupInfo {
  id: ServiceGroup;
  label: string;
  icon: string;
  badgeBg: string;
  markerColor: string;
  description?: string;
}

export interface PlaceCoordinates {
  lat: number;
  lng: number;
}

/**
 * Bảng Bổ Sung: travel_cities (Thành phố / Tỉnh thành)
 */
export interface TravelCity {
  id: string;
  name: string;
  code?: string;
  lat?: number;
  lng?: number;
  sort_order?: number;
}

/**
 * Bảng 2: travel_locations (Table Location)
 * Thông tin định danh & vị trí địa lý cốt lõi
 */
export interface TravelLocationRecord {
  id: string;
  name: string;
  group_id: ServiceGroup;
  city_id?: string | null;
  category?: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  contact?: string;
  checked: boolean;
  visited_at?: string | null;
  is_favorite?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Bảng 3: travel_location_details (Table Info / Details)
 * Tất cả thông tin chi tiết, hình ảnh, gợi ý, ghi chú, mức giá
 */
export interface TravelLocationDetailRecord {
  location_id: string;
  rating?: number;
  price_range?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  notes?: string;
  travel_tips?: string;
  specialties?: string;
  thumbnail_url?: string;
  gallery_urls?: string[];
  website_url?: string;
  updated_at?: string;
}

/**
 * Bảng 4: travel_tags (Tags đa chiều)
 */
export interface TravelTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

/**
 * Bảng 5: travel_location_tags (Quan hệ n-n)
 */
export interface LocationTagRecord {
  location_id: string;
  tag_id: string;
}

/**
 * Bảng 6: travel_trips (Lịch trình chuyến đi)
 */
export type TripStatus = 'planning' | 'ongoing' | 'completed';

export interface TravelTrip {
  id: string;
  userId?: string; // ID người dùng sở hữu chuyến đi (User isolation)
  userEmail?: string;
  userName?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number; // Ngân sách dự kiến (VND)
  coverImage?: string;
  status: TripStatus;
  stops?: TripStop[];
  totalDistanceKm?: number;
  totalExpenses?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Bảng 7: travel_trip_stops (Điểm dừng chân trong chuyến đi)
 */
export type TransportMode = 'driving' | 'motorcycle' | 'walking' | 'bicycling' | 'transit';

export interface TripStop {
  id: string;
  tripId: string;
  locationId: string;
  dayNumber: number; // Ngày 1, Ngày 2...
  visitTime?: string; // e.g. "08:30"
  orderIndex: number;
  transportMode?: TransportMode;
  stopNotes?: string;
  location?: TravelPlace;
}

/**
 * Bảng 8: travel_reviews_logs (Nhật ký trải nghiệm & check-in thực tế)
 */
export interface TravelReviewLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  locationId: string;
  locationName?: string;
  visitedAt: string;
  rating: number; // 1 - 5
  actualExpense?: number; // Chi phí thực tế (VND)
  reviewText: string;
  capturedPhotos?: string[]; // Ảnh thực tế do người dùng chụp
  weather?: string; // 'Nắng đẹp', 'Mát mẻ', 'Hoàng hôn', 'Mưa nhẹ'
  companion?: string; // 'Đi một mình', 'Bạn bè', 'Gia đình', 'Người yêu'
  createdAt: string;
}

/**
 * Bảng 9: travel_expenses (Quản lý chi tiêu chuyến đi & điểm đến)
 */
export type ExpenseCategory = 'food' | 'ticket' | 'transport' | 'hotel' | 'shopping' | 'other';

export interface TravelExpense {
  id: string;
  userId?: string; // ID người dùng sở hữu chi tiêu (User isolation)
  userEmail?: string;
  userName?: string;
  tripId?: string;
  locationId?: string;
  locationName?: string;
  title: string;
  category: ExpenseCategory;
  amount: number; // VND
  paymentMethod?: 'cash' | 'transfer' | 'card';
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

/**
 * Bảng 10: travel_audit_logs (Lịch sử thay đổi & khôi phục)
 */
export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changedFields?: string;
  createdAt: string;
}

/**
 * Phân quyền người dùng (Role-Based Access Control)
 * - viewer: Chỉ xem thông tin, bản đồ, lọc & tìm kiếm
 * - user: Thêm địa điểm tự do, review, lịch trình, chi tiêu, report địa điểm
 * - admin: Toàn quyền quản trị, sửa/xóa địa điểm, xử lý danh sách reports
 */
export type UserRole = 'viewer' | 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

/**
 * Bảng 11: travel_reports (Quản lý báo cáo địa điểm sai lệch / vi phạm)
 */
export type ReportReason =
  | 'wrong_location'    // Sai vị trí / tọa độ / địa chỉ
  | 'closed_down'       // Đã đóng cửa / Dừng hoạt động
  | 'wrong_info'        // Sai thông tin (giá, giờ mở cửa, hotline)
  | 'spam_fake'         // Địa điểm rác / Giả mạo / Không tồn tại
  | 'inappropriate'     // Nội dung không phù hợp / Phản cảm
  | 'other';            // Lý do khác

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface PlaceReport {
  id: string;
  locationId: string;
  locationName: string;
  locationAddress?: string;
  reportedByUserId: string;
  reportedByUserName: string;
  reportedByUserEmail?: string;
  reason: ReportReason;
  description: string;
  proofUrl?: string;
  status: ReportStatus;
  adminNote?: string;
  resolvedAt?: string;
  createdAt: string;
}

/**
 * Unified TravelPlace (Kết hợp từ 3 bảng thông qua View / JOIN)
 */
export interface TravelPlace {
  id: string;
  name: string;
  group: ServiceGroup;
  city_id?: string;
  cityName?: string;
  category?: string;
  coordinates: PlaceCoordinates;
  address: string;
  phone?: string;
  contact?: string;
  
  // Info & Rich Media details (từ table travel_location_details)
  rating?: number;
  priceRange?: string;
  openingHours?: string;
  bestTimeToVisit?: string;
  notes?: string;
  travelTips?: string;
  specialties?: string;
  thumbnailUrl?: string;
  galleryUrls?: string[];
  website?: string;
  
  // Tags đa chiều
  tags?: string[]; // Array of tag IDs or names
  
  // User check-in & Favorites
  checked: boolean;
  visitedAt?: string | null;
  isFavorite?: boolean;
  isDeleted?: boolean;
  
  distanceKm?: number;
  reviewsCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FilterOptions {
  searchQuery: string;
  group: 'all' | ServiceGroup;
  cityId?: 'all' | string;
  maxDistanceKm?: 'all' | number;
  tag?: string;
  status: 'all' | 'visited' | 'unvisited' | 'favorite';
  sortBy: 'name' | 'distance' | 'rating' | 'group' | 'visited';
}

export interface SupabaseConfigStatus {
  projectId: string;
  anonKey: string;
  url?: string;
  isCustom?: boolean;
  isConnected: boolean;
  tablesStatus?: {
    groupsTable: boolean;
    locationsTable: boolean;
    detailsTable: boolean;
    tagsTable: boolean;
    tripsTable: boolean;
    reviewsTable: boolean;
    expensesTable: boolean;
    placesView: boolean;
  };
  tableExists: boolean;
  errorMessage?: string;
}
