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
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    markerColor: '#059669',
    desc: 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo',
  },
  an_uong: {
    id: 'an_uong',
    label: 'Ẩm thực & Quán ăn',
    iconName: 'Utensils',
    icon: '🍜',
    badgeBg: 'bg-[#fff1ee] text-[#5c1b10] border-[#fbc1b4]',
    badgeText: 'text-[#5c1b10]',
    badgeBorder: 'border-[#fbc1b4]',
    markerColor: '#df6d53',
    desc: 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe',
  },
  dich_vu: {
    id: 'dich_vu',
    label: 'Khách sạn & Tiện ích',
    iconName: 'Hotel',
    icon: '🏨',
    badgeBg: 'bg-[#f0f6ff] text-[#19304a] border-[#cadbfc]',
    badgeText: 'text-[#19304a]',
    badgeBorder: 'border-[#cadbfc]',
    markerColor: '#5e95cc',
    desc: 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách',
  },
  giai_tri: {
    id: 'giai_tri',
    label: 'Vui chơi & Giải trí',
    iconName: 'Sparkles',
    icon: '🎡',
    badgeBg: 'bg-[#f9f2ff] text-[#3b2057] border-[#ebd9fc]',
    badgeText: 'text-[#3b2057]',
    badgeBorder: 'border-[#ebd9fc]',
    markerColor: '#a37ec9',
    desc: 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc',
  },
  khac: {
    id: 'khac',
    label: 'Khác & Ghi nhớ',
    iconName: 'MapPin',
    icon: '📌',
    badgeBg: 'bg-[#f4f7f6] text-[#2c3d3c] border-[#d8e3e1]',
    badgeText: 'text-[#2c3d3c]',
    badgeBorder: 'border-[#d8e3e1]',
    markerColor: '#7d8c8b',
    desc: 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời',
  },
};

export const SERVICE_GROUPS = [
  { id: 'du_lich' as ServiceGroup, label: 'Du lịch & Thắng cảnh', icon: '🏖️', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300', markerColor: '#059669', description: 'Danh lam thắng cảnh, di tích lịch sử, bãi biển, núi rừng, điểm check-in sống ảo' },
  { id: 'an_uong' as ServiceGroup, label: 'Ẩm thực & Quán ăn', icon: '🍜', badgeBg: 'bg-[#fff1ee] text-[#5c1b10] border-[#fbc1b4]', markerColor: '#df6d53', description: 'Món ăn đặc sản địa phương, nhà hàng, quán ăn ngon, ẩm thực đường phố, cafe' },
  { id: 'dich_vu' as ServiceGroup, label: 'Khách sạn & Tiện ích', icon: '🏨', badgeBg: 'bg-[#f0f6ff] text-[#19304a] border-[#cadbfc]', markerColor: '#5e95cc', description: 'Khách sạn, Resort, Homestay, trạm xăng, thuê xe, dịch vụ y tế, hỗ trợ du khách' },
  { id: 'giai_tri' as ServiceGroup, label: 'Vui chơi & Giải trí', icon: '🎡', badgeBg: 'bg-[#f9f2ff] text-[#3b2057] border-[#ebd9fc]', markerColor: '#a37ec9', description: 'Công viên chủ đề, rạp chiếu phim, bar pub, khu thể thao mạo hiểm, ca nhạc' },
  { id: 'khac' as ServiceGroup, label: 'Khác & Ghi nhớ', icon: '📌', badgeBg: 'bg-[#f4f7f6] text-[#2c3d3c] border-[#d8e3e1]', markerColor: '#7d8c8b', description: 'Các địa điểm cá nhân, điểm hẹn riêng, trạm dừng chân tạm thời' },
];

export const DEFAULT_CITIES: TravelCity[] = [
  // Miền Bắc
  { id: 'ha_noi', name: 'Hà Nội', code: 'HAN', lat: 21.02850062, lng: 105.85424640, sort_order: 1 },
  { id: 'hai_phong', name: 'Hải Phòng', code: 'HPH', lat: 20.84497262, lng: 106.68817088, sort_order: 2 },
  { id: 'quang_ninh', name: 'Quảng Ninh / Hạ Long', code: 'VHL', lat: 20.95008287, lng: 107.08339666, sort_order: 3 },
  { id: 'lao_cai', name: 'Lào Cai / Sa Pa', code: 'SAP', lat: 22.48567680, lng: 103.97078686, sort_order: 4 },
  { id: 'ninh_binh', name: 'Ninh Bình', code: 'NBH', lat: 20.25069608, lng: 105.97443640, sort_order: 5 },
  { id: 'ha_giang', name: 'Hà Giang', code: 'HGI', lat: 22.82336260, lng: 104.98395840, sort_order: 6 },
  { id: 'cao_bang', name: 'Cao Bằng', code: 'CBG', lat: 22.66572420, lng: 105.97397602, sort_order: 7 },
  { id: 'yen_bai', name: 'Yên Bái', code: 'YBI', lat: 21.70503404, lng: 104.87504042, sort_order: 8 },
  { id: 'dien_bien', name: 'Điện Biên', code: 'DBN', lat: 21.38611664, lng: 103.02317266, sort_order: 9 },
  { id: 'vinh_phuc', name: 'Vĩnh Phúc', code: 'VPC', lat: 21.30891466, lng: 105.60470048, sort_order: 10 },
  { id: 'bac_giang', name: 'Bắc Giang', code: 'BGG', lat: 21.27316406, lng: 106.19464864, sort_order: 11 },
  { id: 'bac_kan', name: 'Bắc Kạn', code: 'BKN', lat: 22.14702420, lng: 105.83486246, sort_order: 12 },
  { id: 'bac_ninh', name: 'Bắc Ninh', code: 'BNH', lat: 21.18619286, lng: 106.07634428, sort_order: 13 },
  { id: 'ha_nam', name: 'Hà Nam', code: 'HNM', lat: 20.54520844, lng: 105.91223402, sort_order: 14 },
  { id: 'hai_duong', name: 'Hải Dương', code: 'HDG', lat: 20.93648624, lng: 106.31509062, sort_order: 15 },
  { id: 'hoa_binh', name: 'Hòa Bình', code: 'HBH', lat: 20.81337262, lng: 105.33838880, sort_order: 16 },
  { id: 'hung_yen', name: 'Hưng Yên', code: 'HYN', lat: 20.64648820, lng: 106.05111060, sort_order: 17 },
  { id: 'lai_chau', name: 'Lai Châu', code: 'LCU', lat: 22.39646248, lng: 103.45893088, sort_order: 18 },
  { id: 'lang_son', name: 'Lạng Sơn', code: 'LSN', lat: 21.85338866, lng: 106.76113200, sort_order: 19 },
  { id: 'nam_dinh', name: 'Nam Định', code: 'NDH', lat: 20.43337444, lng: 106.18337466, sort_order: 20 },
  { id: 'phu_tho', name: 'Phú Thọ', code: 'PTO', lat: 21.32280442, lng: 105.21503246, sort_order: 21 },
  { id: 'son_la', name: 'Sơn La', code: 'SLA', lat: 21.32569008, lng: 103.91890844, sort_order: 22 },
  { id: 'thai_binh', name: 'Thái Bình', code: 'TBH', lat: 20.45003066, lng: 106.33338206, sort_order: 23 },
  { id: 'thai_nguyen', name: 'Thái Nguyên', code: 'TNN', lat: 21.59289848, lng: 105.84421042, sort_order: 24 },
  { id: 'tuyen_quang', name: 'Tuyên Quang', code: 'TQG', lat: 21.82399262, lng: 105.21581084, sort_order: 25 },

  // Miền Trung & Tây Nguyên
  { id: 'da_nang', name: 'Đà Nẵng', code: 'DAD', lat: 16.05442068, lng: 108.20220446, sort_order: 26 },
  { id: 'quang_nam', name: 'Quảng Nam / Hội An', code: 'VNHAN', lat: 15.88011204, lng: 108.33800448, sort_order: 27 },
  { id: 'thua_thien_hue', name: 'Thừa Thiên Huế', code: 'HUI', lat: 16.46371666, lng: 107.59096842, sort_order: 28 },
  { id: 'khanh_hoa', name: 'Khánh Hòa / Nha Trang', code: 'NHA', lat: 12.23888040, lng: 109.19674266, sort_order: 29 },
  { id: 'lam_dong', name: 'Lâm Đồng / Đà Lạt', code: 'DLI', lat: 11.94045444, lng: 108.45836488, sort_order: 30 },
  { id: 'quang_binh', name: 'Quảng Bình', code: 'QBH', lat: 17.46864060, lng: 106.62226668, sort_order: 31 },
  { id: 'quang_tri', name: 'Quảng Trị', code: 'QTI', lat: 16.75009820, lng: 107.18332848, sort_order: 32 },
  { id: 'quang_ngai', name: 'Quảng Ngãi', code: 'QNI', lat: 15.12009006, lng: 108.80002644, sort_order: 33 },
  { id: 'binh_dinh', name: 'Bình Định / Quy Nhơn', code: 'BDH', lat: 13.78308260, lng: 109.21976800, sort_order: 34 },
  { id: 'phu_yen', name: 'Phú Yên', code: 'PYU', lat: 13.08831484, lng: 109.29257008, sort_order: 35 },
  { id: 'ninh_thuan', name: 'Ninh Thuận', code: 'NTH', lat: 11.56674822, lng: 108.98333204, sort_order: 36 },
  { id: 'binh_thuan', name: 'Bình Thuận / Phan Thiết', code: 'BTN', lat: 10.93337604, lng: 108.10007622, sort_order: 37 },
  { id: 'thanh_hoa', name: 'Thanh Hóa', code: 'THA', lat: 19.80008886, lng: 105.76671806, sort_order: 38 },
  { id: 'nghe_an', name: 'Nghệ An', code: 'NAN', lat: 18.67330428, lng: 105.68115824, sort_order: 39 },
  { id: 'ha_tinh', name: 'Hà Tĩnh', code: 'HTH', lat: 18.34301448, lng: 105.90587602, sort_order: 40 },
  { id: 'kon_tum', name: 'Kon Tum', code: 'KTM', lat: 14.35007802, lng: 108.00004224, sort_order: 41 },
  { id: 'gia_lai', name: 'Gia Lai', code: 'GLAI', lat: 13.98339840, lng: 108.00004224, sort_order: 42 },
  { id: 'dak_lak', name: 'Đắk Lắk', code: 'DLK', lat: 12.66672046, lng: 108.05007204, sort_order: 43 },
  { id: 'dak_nong', name: 'Đắk Nông', "code": "DKN", lat: 12.00425822, lng: 107.68755644, sort_order: 44 },

  // Miền Nam
  { id: 'ho_chi_minh', name: 'TP. Hồ Chí Minh', code: 'SGN', lat: 10.82319022, lng: 106.62974800, sort_order: 45 },
  { id: 'can_tho', name: 'Cần Thơ', code: 'VCA', lat: 10.04524242, lng: 105.74699802, sort_order: 46 },
  { id: 'ba_ria_vung_tau', name: 'Bà Rịa - Vũng Tàu', code: 'VTG', lat: 10.34602660, lng: 107.08436820, sort_order: 47 },
  { id: 'kien_giang', name: 'Kiên Giang / Phú Quốc', code: 'PQC', lat: 10.01253880, lng: 105.08090422, sort_order: 48 },
  { id: 'an_giang', name: 'An Giang', code: 'AGG', lat: 10.53814626, lng: 105.12596448, sort_order: 49 },
  { id: 'bac_lieu', name: 'Bạc Liêu', code: 'BLU', lat: 9.29410202, lng: 105.72440064, sort_order: 50 },
  { id: 'ben_tre', name: 'Bến Tre', code: 'BTE', lat: 10.24324282, lng: 106.37518424, sort_order: 51 },
  { id: 'binh_duong', name: 'Bình Dương', code: 'BDG', lat: 11.16043826, lng: 106.65201240, sort_order: 52 },
  { id: 'binh_phuoc', name: 'Bình Phước', code: 'BPC', lat: 11.64734648, lng: 106.89203826, sort_order: 53 },
  { id: 'ca_mau', name: 'Cà Mau', code: 'CMU', lat: 9.17695646, lng: 105.15245244, sort_order: 54 },
  { id: 'dong_nai', name: 'Đồng Nai', code: 'DNI', lat: 10.94505046, lng: 106.82471420, sort_order: 55 },
  { id: 'dong_thap', name: 'Đồng Tháp', code: 'DTP', lat: 10.49385000, lng: 105.68812228, sort_order: 56 },
  { id: 'hau_giang', name: 'Hậu Giang', code: 'HGI2', lat: 9.78429804, lng: 105.47011206, sort_order: 57 },
  { id: 'long_an', name: 'Long An', code: 'LAN', lat: 10.53625460, lng: 106.40862286, sort_order: 58 },
  { id: 'soc_trang', name: 'Sóc Trăng', code: 'STG', lat: 9.60338402, lng: 105.98006400, sort_order: 59 },
  { id: 'tay_ninh', name: 'Tây Ninh', code: 'TNI', lat: 11.31006802, lng: 106.09832260, sort_order: 60 },
  { id: 'tien_giang', name: 'Tiền Giang', code: 'TGG', lat: 10.42830060, lng: 106.34081624, sort_order: 61 },
  { id: 'tra_vinh', name: 'Trà Vinh', code: 'TVH', lat: 9.93479224, lng: 106.34535884, sort_order: 62 },
  { id: 'vinh_long', name: 'Vĩnh Long', code: 'VLG', lat: 10.25361260, lng: 105.97229804, sort_order: 63 },
  { id: 'hoi_an', name: 'Hội An', code: 'HOI', lat: 15.88011204, lng: 108.33800448, sort_order: 64 },
  { id: 'sa_pa', name: 'Sa Pa', code: 'SAP', lat: 22.33640808, lng: 103.84386824, sort_order: 65 },
  { id: 'phu_quoc', name: 'Phú Quốc', code: 'PQC', lat: 10.28997640, lng: 103.98406246, sort_order: 66 },
  { id: 'hue', name: 'Huế', code: 'HUE', lat: 16.46371666, lng: 107.59096842, sort_order: 67 },
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
    return { lat: 16.05442068, lng: 108.20220446, zoom: 6 }; // Da Nang center
  }
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  places.forEach((p) => {
    const lat = Number(p.coordinates?.lat);
    const lng = Number(p.coordinates?.lng);
    if (!isNaN(lat) && lat !== 0 && !isNaN(lng) && lng !== 0) {
      totalLat += lat;
      totalLng += lng;
      count++;
    }
  });

  if (count === 0) return { lat: 16.05442068, lng: 108.20220446, zoom: 6 };
  return {
    lat: totalLat / count,
    lng: totalLng / count,
    zoom: count === 1 ? 15 : count <= 4 ? 12 : 7,
  };
}

/**
 * Đảm bảo hiển thị tọa độ với tối thiểu 8 chữ số thập phân sau dấu chấm (chuẩn GPS WGS84)
 * Ví dụ: 10.46365546 hoặc 10.830969938724751, 106.56052423418281
 */
export function formatCoordinate(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val) || val === 0) return '0.00000000';
  const str = String(val);
  const parts = str.split('.');
  if (parts.length === 1) {
    return parts[0] + '.00000000';
  }
  if (parts[1].length < 8) {
    return parts[0] + '.' + parts[1].padEnd(8, '0');
  }
  return str;
}

