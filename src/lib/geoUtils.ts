import { TravelPlace, FilterOptions, ServiceGroup, TravelCity } from '../types';

export interface ServiceGroupMeta {
  id: ServiceGroup;
  label: string;
  iconName: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  markerColor: string;
  desc: string;
}

export const SERVICE_GROUPS_MAP: Record<ServiceGroup, ServiceGroupMeta> = {
  du_lich: {
    id: 'du_lich',
    label: 'Du lịch & Thắng cảnh',
    iconName: 'Palmtree',
    icon: '🏖️',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-300',
    markerColor: '#059669',
    desc: 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo',
  },
  an_uong: {
    id: 'an_uong',
    label: 'Ẩm thực & Quán ăn',
    iconName: 'Utensils',
    icon: '🍜',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-300',
    markerColor: '#d97706',
    desc: 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe',
  },
  dich_vu: {
    id: 'dich_vu',
    label: 'Khách sạn & Tiện ích',
    iconName: 'Hotel',
    icon: '🏨',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-300',
    markerColor: '#2563eb',
    desc: 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách',
  },
  giai_tri: {
    id: 'giai_tri',
    label: 'Vui chơi & Giải trí',
    iconName: 'Sparkles',
    icon: '🎡',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-300',
    markerColor: '#9333ea',
    desc: 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc',
  },
  khac: {
    id: 'khac',
    label: 'Khác & Ghi nhớ',
    iconName: 'MapPin',
    icon: '📌',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    markerColor: '#475569',
    desc: 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời',
  },
};

export const SERVICE_GROUPS = [
  { id: 'du_lich' as ServiceGroup, label: 'Du lịch & Thắng cảnh', icon: '🏖️', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300', markerColor: '#059669', description: 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo' },
  { id: 'an_uong' as ServiceGroup, label: 'Ẩm thực & Quán ăn', icon: '🍜', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300', markerColor: '#d97706', description: 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe' },
  { id: 'dich_vu' as ServiceGroup, label: 'Khách sạn & Tiện ích', icon: '🏨', badgeBg: 'bg-blue-100 text-blue-800 border-blue-300', markerColor: '#2563eb', description: 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách' },
  { id: 'giai_tri' as ServiceGroup, label: 'Vui chơi & Giải trí', icon: '🎡', badgeBg: 'bg-purple-100 text-purple-800 border-purple-300', markerColor: '#9333ea', description: 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc' },
  { id: 'khac' as ServiceGroup, label: 'Khác & Ghi nhớ', icon: '📌', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', markerColor: '#475569', description: 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời' },
];

export const DEFAULT_CITIES: TravelCity[] = [
  // Miền Bắc
  { id: 'ha_noi', name: 'Hà Nội', code: 'HAN', lat: 21.0285, lng: 105.8542, sort_order: 1 },
  { id: 'hai_phong', name: 'Hải Phòng', code: 'HPH', lat: 20.8449, lng: 106.6881, sort_order: 2 },
  { id: 'quang_ninh', name: 'Quảng Ninh / Hạ Long', code: 'VHL', lat: 20.9500, lng: 107.0833, sort_order: 3 },
  { id: 'lao_cai', name: 'Lào Cai / Sa Pa', code: 'SAP', lat: 22.4856, lng: 103.9707, sort_order: 4 },
  { id: 'ninh_binh', name: 'Ninh Bình', code: 'NBH', lat: 20.2506, lng: 105.9744, sort_order: 5 },
  { id: 'ha_giang', name: 'Hà Giang', code: 'HGI', lat: 22.8233, lng: 104.9839, sort_order: 6 },
  { id: 'cao_bang', name: 'Cao Bằng', code: 'CBG', lat: 22.6657, lng: 105.9739, sort_order: 7 },
  { id: 'yen_bai', name: 'Yên Bái', code: 'YBI', lat: 21.7050, lng: 104.8750, sort_order: 8 },
  { id: 'dien_bien', name: 'Điện Biên', code: 'DBN', lat: 21.3861, lng: 103.0231, sort_order: 9 },
  { id: 'vinh_phuc', name: 'Vĩnh Phúc', code: 'VPC', lat: 21.3089, lng: 105.6047, sort_order: 10 },
  { id: 'bac_giang', name: 'Bắc Giang', code: 'BGG', lat: 21.2731, lng: 106.1946, sort_order: 11 },
  { id: 'bac_kan', name: 'Bắc Kạn', code: 'BKN', lat: 22.1470, lng: 105.8348, sort_order: 12 },
  { id: 'bac_ninh', name: 'Bắc Ninh', code: 'BNH', lat: 21.1861, lng: 106.0763, sort_order: 13 },
  { id: 'ha_nam', name: 'Hà Nam', code: 'HNM', lat: 20.5452, lng: 105.9122, sort_order: 14 },
  { id: 'hai_duong', name: 'Hải Dương', code: 'HDG', lat: 20.9364, lng: 106.3150, sort_order: 15 },
  { id: 'hoa_binh', name: 'Hòa Bình', code: 'HBH', lat: 20.8133, lng: 105.3383, sort_order: 16 },
  { id: 'hung_yen', name: 'Hưng Yên', code: 'HYN', lat: 20.6464, lng: 106.0511, sort_order: 17 },
  { id: 'lai_chau', name: 'Lai Châu', code: 'LCU', lat: 22.3964, lng: 103.4589, sort_order: 18 },
  { id: 'lang_son', name: 'Lạng Sơn', code: 'LSN', lat: 21.8533, lng: 106.7611, sort_order: 19 },
  { id: 'nam_dinh', name: 'Nam Định', code: 'NDH', lat: 20.4333, lng: 106.1833, sort_order: 20 },
  { id: 'phu_tho', name: 'Phú Thọ', code: 'PTO', lat: 21.3228, lng: 105.2150, sort_order: 21 },
  { id: 'son_la', name: 'Sơn La', code: 'SLA', lat: 21.3256, lng: 103.9189, sort_order: 22 },
  { id: 'thai_binh', name: 'Thái Bình', code: 'TBH', lat: 20.4500, lng: 106.3333, sort_order: 23 },
  { id: 'thai_nguyen', name: 'Thái Nguyên', code: 'TNN', lat: 21.5928, lng: 105.8442, sort_order: 24 },
  { id: 'tuyen_quang', name: 'Tuyên Quang', code: 'TQG', lat: 21.8239, lng: 105.2158, sort_order: 25 },

  // Miền Trung & Tây Nguyên
  { id: 'da_nang', name: 'Đà Nẵng', code: 'DAD', lat: 16.0544, lng: 108.2022, sort_order: 26 },
  { id: 'quang_nam', name: 'Quảng Nam / Hội An', code: 'VNHAN', lat: 15.8801, lng: 108.3380, sort_order: 27 },
  { id: 'thua_thien_hue', name: 'Thừa Thiên Huế', code: 'HUI', lat: 16.4637, lng: 107.5909, sort_order: 28 },
  { id: 'khanh_hoa', name: 'Khánh Hòa / Nha Trang', code: 'NHA', lat: 12.2388, lng: 109.1967, sort_order: 29 },
  { id: 'lam_dong', name: 'Lâm Đồng / Đà Lạt', code: 'DLI', lat: 11.9404, lng: 108.4583, sort_order: 30 },
  { id: 'quang_binh', name: 'Quảng Bình', code: 'QBH', lat: 17.4686, lng: 106.6222, sort_order: 31 },
  { id: 'quang_tri', name: 'Quảng Trị', code: 'QTI', lat: 16.7500, lng: 107.1833, sort_order: 32 },
  { id: 'quang_ngai', name: 'Quảng Ngãi', code: 'QNI', lat: 15.1200, lng: 108.8000, sort_order: 33 },
  { id: 'binh_dinh', name: 'Bình Định / Quy Nhơn', code: 'BDH', lat: 13.7830, lng: 109.2197, sort_order: 34 },
  { id: 'phu_yen', name: 'Phú Yên', code: 'PYU', lat: 13.0883, lng: 109.2925, sort_order: 35 },
  { id: 'ninh_thuan', name: 'Ninh Thuận', code: 'NTH', lat: 11.5667, lng: 108.9833, sort_order: 36 },
  { id: 'binh_thuan', name: 'Bình Thuận / Phan Thiết', code: 'BTN', lat: 10.9333, lng: 108.1000, sort_order: 37 },
  { id: 'thanh_hoa', name: 'Thanh Hóa', code: 'THA', lat: 19.8000, lng: 105.7667, sort_order: 38 },
  { id: 'nghe_an', name: 'Nghệ An', code: 'NAN', lat: 18.6733, lng: 105.6811, sort_order: 39 },
  { id: 'ha_tinh', name: 'Hà Tĩnh', code: 'HTH', lat: 18.3430, lng: 105.9058, sort_order: 40 },
  { id: 'kon_tum', name: 'Kon Tum', code: 'KTM', lat: 14.3500, lng: 108.0000, sort_order: 41 },
  { id: 'gia_lai', name: 'Gia Lai', code: 'GLAI', lat: 13.9833, lng: 108.0000, sort_order: 42 },
  { id: 'dak_lak', name: 'Đắk Lắk', code: 'DLK', lat: 12.6667, lng: 108.0500, sort_order: 43 },
  { id: 'dak_nong', name: 'Đắk Nông', "code": "DKN", lat: 12.0042, lng: 107.6875, sort_order: 44 },

  // Miền Nam
  { id: 'ho_chi_minh', name: 'TP. Hồ Chí Minh', code: 'SGN', lat: 10.8231, lng: 106.6297, sort_order: 45 },
  { id: 'can_tho', name: 'Cần Thơ', code: 'VCA', lat: 10.0452, lng: 105.7469, sort_order: 46 },
  { id: 'ba_ria_vung_tau', name: 'Bà Rịa - Vũng Tàu', code: 'VTG', lat: 10.3460, lng: 107.0843, sort_order: 47 },
  { id: 'kien_giang', name: 'Kiên Giang / Phú Quốc', code: 'PQC', lat: 10.0125, lng: 105.0809, sort_order: 48 },
  { id: 'an_giang', name: 'An Giang', code: 'AGG', lat: 10.5381, lng: 105.1259, sort_order: 49 },
  { id: 'bac_lieu', name: 'Bạc Liêu', code: 'BLU', lat: 9.2941, lng: 105.7244, sort_order: 50 },
  { id: 'ben_tre', name: 'Bến Tre', code: 'BTE', lat: 10.2432, lng: 106.3751, sort_order: 51 },
  { id: 'binh_duong', name: 'Bình Dương', code: 'BDG', lat: 11.1604, lng: 106.6520, sort_order: 52 },
  { id: 'binh_phuoc', name: 'Bình Phước', code: 'BPC', lat: 11.6473, lng: 106.8920, sort_order: 53 },
  { id: 'ca_mau', name: 'Cà Mau', code: 'CMU', lat: 9.1769, lng: 105.1524, sort_order: 54 },
  { id: 'dong_nai', name: 'Đồng Nai', code: 'DNI', lat: 10.9450, lng: 106.8247, sort_order: 55 },
  { id: 'dong_thap', name: 'Đồng Tháp', code: 'DTP', lat: 10.4938, lng: 105.6881, sort_order: 56 },
  { id: 'hau_giang', name: 'Hậu Giang', code: 'HGI2', lat: 9.7842, lng: 105.4701, sort_order: 57 },
  { id: 'long_an', name: 'Long An', code: 'LAN', lat: 10.5362, lng: 106.4086, sort_order: 58 },
  { id: 'soc_trang', name: 'Sóc Trăng', code: 'STG', lat: 9.6033, lng: 105.9800, sort_order: 59 },
  { id: 'tay_ninh', name: 'Tây Ninh', code: 'TNI', lat: 11.3100, lng: 106.0983, sort_order: 60 },
  { id: 'tien_giang', name: 'Tiền Giang', code: 'TGG', lat: 10.4283, lng: 106.3408, sort_order: 61 },
  { id: 'tra_vinh', name: 'Trà Vinh', code: 'TVH', lat: 9.9347, lng: 106.3453, sort_order: 62 },
  { id: 'vinh_long', name: 'Vĩnh Long', code: 'VLG', lat: 10.2536, lng: 105.9722, sort_order: 63 },
];

export const DISTANCE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả khoảng cách' },
  { value: 2, label: 'Bán kính < 2 km' },
  { value: 5, label: 'Bán kính < 5 km' },
  { value: 10, label: 'Bán kính < 10 km' },
  { value: 15, label: 'Bán kính < 15 km' },
  { value: 20, label: 'Bán kính < 20 km' },
  { value: 50, label: 'Bán kính < 50 km' },
  { value: 100, label: 'Bán kính < 100 km' },
];

// Haversine formula to compute distance in kilometers between two lat/lng points
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // 2 decimal places
}

// Update place list with distance calculated from user position
export function applyUserDistance(places: TravelPlace[], userLat: number | null, userLng: number | null): TravelPlace[] {
  const uLat = Number(userLat);
  const uLng = Number(userLng);
  if (userLat === null || userLng === null || isNaN(uLat) || isNaN(uLng)) {
    return places.map((p) => ({ ...p, distanceKm: undefined }));
  }
  return places.map((place) => {
    const pLat = Number(place.coordinates?.lat);
    const pLng = Number(place.coordinates?.lng);
    if (isNaN(pLat) || isNaN(pLng)) {
      return { ...place, distanceKm: undefined };
    }
    const dist = calculateDistanceKm(uLat, uLng, pLat, pLng);
    return { ...place, distanceKm: dist };
  });
}

// Filter and sort place list based on user filter criteria
export function filterAndSortPlaces(places: TravelPlace[], filters: FilterOptions): TravelPlace[] {
  let result = [...places];

  // Group filter
  if (filters.group && filters.group !== 'all') {
    result = result.filter((p) => p.group === filters.group);
  }

  // City filter (Lọc theo thành phố)
  if (filters.cityId && filters.cityId !== 'all') {
    result = result.filter(
      (p) =>
        p.city_id === filters.cityId ||
        (p.cityName && p.cityName.toLowerCase().includes(filters.cityId.toLowerCase()))
    );
  }

  // Max Distance Filter (Lọc bán kính từ vị trí hiện tại: 2km, 5km, 10km, 15km...)
  if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && typeof filters.maxDistanceKm === 'number') {
    const maxRadius = filters.maxDistanceKm;
    result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadius);
  }

  // Search query (search in name, address, notes, specialties, phone)
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        (p.specialties && p.specialties.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query)) ||
        (p.phone && p.phone.toLowerCase().includes(query)) ||
        (p.priceRange && p.priceRange.toLowerCase().includes(query))
    );
  }

  // Status filter
  if (filters.status === 'visited') {
    result = result.filter((p) => p.checked);
  } else if (filters.status === 'unvisited') {
    result = result.filter((p) => !p.checked);
  } else if (filters.status === 'favorite') {
    result = result.filter((p) => p.isFavorite);
  }

  // Sort
  result.sort((a, b) => {
    if (filters.sortBy === 'name') {
      return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
    }
    if (filters.sortBy === 'distance') {
      const distA = a.distanceKm ?? 999999;
      const distB = b.distanceKm ?? 999999;
      return distA - distB;
    }
    if (filters.sortBy === 'rating') {
      const rateA = a.rating ?? 0;
      const rateB = b.rating ?? 0;
      return rateB - rateA;
    }
    if (filters.sortBy === 'group') {
      return a.group.localeCompare(b.group);
    }
    if (filters.sortBy === 'visited') {
      if (a.checked && !b.checked) return -1;
      if (!a.checked && b.checked) return 1;
      const timeA = a.visitedAt ? new Date(a.visitedAt).getTime() : 0;
      const timeB = b.visitedAt ? new Date(b.visitedAt).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  return result;
}

// Get unique categories list for selected group or all
export function getCategoriesList(places: TravelPlace[], currentGroup: 'all' | ServiceGroup = 'all'): string[] {
  const categories = new Set<string>();
  places.forEach((p) => {
    if (currentGroup === 'all' || p.group === currentGroup) {
      if (p.category && p.category.trim()) {
        categories.add(p.category.trim());
      }
    }
  });
  return ['Tất cả', ...Array.from(categories)];
}

// Get center point of all places or default to Vietnam center
export function calculateMapCenter(places: TravelPlace[]): { lat: number; lng: number; zoom: number } {
  if (!places || places.length === 0) {
    return { lat: 16.0544, lng: 108.2022, zoom: 6 }; // Da Nang center
  }
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  places.forEach((p) => {
    if (p.coordinates?.lat && p.coordinates?.lng) {
      totalLat += p.coordinates.lat;
      totalLng += p.coordinates.lng;
      count++;
    }
  });

  if (count === 0) return { lat: 16.0544, lng: 108.2022, zoom: 6 };
  return {
    lat: totalLat / count,
    lng: totalLng / count,
    zoom: count === 1 ? 15 : count <= 4 ? 12 : 7,
  };
}

