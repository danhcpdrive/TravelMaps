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
  { id: 'da_nang', name: 'Đà Nẵng', code: 'DAD', lat: 16.0544, lng: 108.2022, sort_order: 1 },
  { id: 'hoi_an', name: 'Hội An / Quảng Nam', code: 'VNHAN', lat: 15.8801, lng: 108.3380, sort_order: 2 },
  { id: 'ha_noi', name: 'Hà Nội', code: 'HAN', lat: 21.0285, lng: 105.8542, sort_order: 3 },
  { id: 'ho_chi_minh', name: 'TP. Hồ Chí Minh', code: 'SGN', lat: 10.8231, lng: 106.6297, sort_order: 4 },
  { id: 'phu_quoc', name: 'Phú Quốc', code: 'PQC', lat: 10.2899, lng: 103.9840, sort_order: 5 },
  { id: 'sa_pa', name: 'Sa Pa', code: 'SAP', lat: 22.3364, lng: 103.8438, sort_order: 6 },
  { id: 'hue', name: 'Thừa Thiên Huế', code: 'HUI', lat: 16.4637, lng: 107.5909, sort_order: 7 },
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
  if (userLat === null || userLng === null) {
    return places.map((p) => ({ ...p, distanceKm: undefined }));
  }
  return places.map((place) => {
    const dist = calculateDistanceKm(userLat, userLng, place.coordinates.lat, place.coordinates.lng);
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

