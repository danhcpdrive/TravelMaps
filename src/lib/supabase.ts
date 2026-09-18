import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  TravelPlace,
  SupabaseConfigStatus,
  ServiceGroup,
  ServiceGroupInfo,
  TravelLocationRecord,
  TravelLocationDetailRecord,
  TravelTrip,
  TripStop,
  TravelReviewLog,
  TravelExpense,
  TravelTag,
  PlaceReport,
  ReportStatus,
  UserProfile,
  TravelCity,
} from '../types';
import { SERVICE_GROUPS, DEFAULT_CITIES } from './geoUtils';

export const DEFAULT_TAGS: TravelTag[] = [
  { id: 'song_ao', name: 'Sống Ảo / Check-in', color: 'pink', icon: '📸' },
  { id: 'dac_san', name: 'Đặc Sản Địa Phương', color: 'amber', icon: '🍲' },
  { id: 'view_hoang_hon', name: 'View Hoàng Hôn', color: 'orange', icon: '🌅' },
  { id: 'gia_dinh', name: 'Thích Hợp Gia Đình', color: 'blue', icon: '👨‍👩‍👧‍👦' },
  { id: 'michelin', name: 'Michelin Selected', color: 'red', icon: '⭐' },
  { id: 'view_bien', name: 'View Biển / View Hồ', color: 'cyan', icon: '🌊' },
  { id: 'gia_binh_dan', name: 'Giá Bình Dân', color: 'emerald', icon: '💵' },
];

const LOCAL_STORAGE_PLACES_KEY = 'travelmaps_saved_places_v3';
const LOCAL_STORAGE_GROUPS_KEY = 'travelmaps_saved_groups_v3';
const LOCAL_STORAGE_CITIES_KEY = 'travelmaps_saved_cities_v3';
const LOCAL_STORAGE_TRIPS_KEY = 'travelmaps_saved_trips_v3';
const LOCAL_STORAGE_REVIEWS_KEY = 'travelmaps_saved_reviews_v3';
const LOCAL_STORAGE_EXPENSES_KEY = 'travelmaps_saved_expenses_v3';
const LOCAL_STORAGE_TAGS_KEY = 'travelmaps_saved_tags_v3';
const LOCAL_STORAGE_REPORTS_KEY = 'travelmaps_saved_reports_v3';
const SUPABASE_CONFIG_KEY = 'travelmaps_supabase_project_config_v3';

/**
 * Format project ID or full URL into a valid Supabase URL
 * E.g. 'obwsqsljvgckrffnpxyz' -> 'https://obwsqsljvgckrffnpxyz.supabase.co'
 */
export function formatSupabaseUrl(idOrUrl: string): string {
  const trimmed = (idOrUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed}.supabase.co`;
}

/**
 * Extract Project Reference ID from a Supabase URL or return ID as-is
 */
export function extractProjectId(idOrUrl: string): string {
  const trimmed = (idOrUrl || '').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^https?:\/\/([^.]+)\.supabase\.co/i);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

// Get config from localStorage or environment variables
export const getEnvConfig = (): { url: string; key: string; projectId: string; isCustom: boolean } => {
  try {
    const custom = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.key && (parsed.projectId || parsed.url)) {
        const rawUrl = parsed.projectId || parsed.url;
        const formattedUrl = formatSupabaseUrl(rawUrl);
        const projectId = extractProjectId(rawUrl);
        return {
          url: formattedUrl,
          key: parsed.key.trim(),
          projectId,
          isCustom: true,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom Supabase config from localStorage:', e);
  }

  const envIdOrUrl =
    (import.meta.env.VITE_SUPABASE_ID as string) ||
    (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) ||
    (import.meta.env.VITE_SUPABASE_URL as string) ||
    '';

  const envKey =
    (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string) ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
    '';

  const finalUrl = formatSupabaseUrl(envIdOrUrl);
  const finalProjectId = extractProjectId(envIdOrUrl);

  return {
    url: finalUrl,
    key: envKey.trim(),
    projectId: finalProjectId,
    isCustom: false,
  };
};

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  const { url, key } = getEnvConfig();

  if (url && key) {
    try {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function saveCustomSupabaseConfig(projectId: string, key: string) {
  try {
    const formattedUrl = formatSupabaseUrl(projectId);
    const cleanId = extractProjectId(projectId);
    const config = {
      projectId: cleanId,
      url: formattedUrl,
      key: key.trim(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    supabaseClient = null;
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config to localStorage:', e);
    return false;
  }
}

export function clearCustomSupabaseConfig() {
  try {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabaseClient = null;
  } catch (e) {
    console.error('Failed to remove custom Supabase config:', e);
  }
}

// Normalize any raw group string (ID or name) to a valid ServiceGroup ID
export function normalizeServiceGroup(raw: any): ServiceGroup {
  if (!raw) return 'du_lich';
  const str = String(raw).trim().toLowerCase();
  
  // Direct match on group ID
  if (['du_lich', 'an_uong', 'dich_vu', 'giai_tri', 'khac'].includes(str)) {
    return str as ServiceGroup;
  }
  
  // Match on Vietnamese names or keywords
  if (str.includes('ẩm thực') || str.includes('ăn') || str.includes('quán') || str.includes('bánh') || str.includes('phở') || str.includes('cơm') || str.includes('uống')) {
    return 'an_uong';
  }
  if (str.includes('khách sạn') || str.includes('dịch vụ') || str.includes('tiện ích') || str.includes('resort') || str.includes('hotel') || str.includes('homestay')) {
    return 'dich_vu';
  }
  if (str.includes('giải trí') || str.includes('vui chơi') || str.includes('công viên') || str.includes('rạp') || str.includes('bar') || str.includes('sân')) {
    return 'giai_tri';
  }
  if (str.includes('du lịch') || str.includes('thắng cảnh') || str.includes('di tích') || str.includes('bãi biển') || str.includes('núi') || str.includes('chùa')) {
    return 'du_lich';
  }
  if (str.includes('khác') || str.includes('ghi nhớ') || str.includes('trạm') || str.includes('bến')) {
    return 'khac';
  }
  
  return 'du_lich';
}

// Map database row to TravelPlace
export function mapRowToPlace(row: any): TravelPlace {
  const rawGroup = row.group_id || row.group || row.group_name;
  const group: ServiceGroup = normalizeServiceGroup(rawGroup);

  let parsedGallery: string[] = [];
  if (Array.isArray(row.gallery_urls)) {
    parsedGallery = row.gallery_urls;
  } else if (Array.isArray(row.galleryUrls)) {
    parsedGallery = row.galleryUrls;
  }

  let parsedTags: string[] = [];
  if (Array.isArray(row.tags)) {
    parsedTags = row.tags;
  }

  return {
    id: String(row.id),
    name: row.name || 'Địa điểm chưa đặt tên',
    group,
    city_id: row.city_id || row.cityId || '',
    cityName: row.city_name || row.cityName || '',
    category: row.category || 'Địa điểm tham quan',
    coordinates: {
      lat: (() => {
        const parsed = Number(row.lat ?? row.latitude ?? row.coordinates?.lat);
        return (!isNaN(parsed) && parsed !== 0) ? parsed : 16.0544;
      })(),
      lng: (() => {
        const parsed = Number(row.lng ?? row.longitude ?? row.coordinates?.lng);
        return (!isNaN(parsed) && parsed !== 0) ? parsed : 108.2022;
      })(),
    },
    address: row.address || '',
    phone: row.phone || '',
    contact: row.contact || '',
    checked: Boolean(row.checked),
    visitedAt: row.visited_at || row.visitedAt || null,
    isFavorite: Boolean(row.is_favorite || row.isFavorite),
    isDeleted: Boolean(row.is_deleted || row.isDeleted),
    
    // Details
    rating: row.rating !== undefined && row.rating !== null ? Number(row.rating) : 4.8,
    priceRange: row.price_range || row.priceRange || '',
    openingHours: row.opening_hours || row.openingHours || '',
    bestTimeToVisit: row.best_time_to_visit || row.bestTimeToVisit || '',
    notes: row.notes || '',
    travelTips: row.travel_tips || row.travelTips || '',
    specialties: row.specialties || '',
    thumbnailUrl: row.thumbnail_url || row.thumbnailUrl || '',
    galleryUrls: parsedGallery,
    website: row.website_url || row.website || '',
    tags: parsedTags,
    reviewsCount: row.reviews_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function splitPlaceToTables(place: TravelPlace): {
  location: TravelLocationRecord;
  detail: TravelLocationDetailRecord;
} {
  const rawLat = place?.coordinates?.lat !== undefined ? place.coordinates.lat : (place as any)?.lat;
  const rawLng = place?.coordinates?.lng !== undefined ? place.coordinates.lng : (place as any)?.lng;
  const parsedLat = Number(rawLat);
  const parsedLng = Number(rawLng);
  const lat = !isNaN(parsedLat) && parsedLat !== 0 ? parsedLat : 16.05441235;
  const lng = !isNaN(parsedLng) && parsedLng !== 0 ? parsedLng : 108.20223841;

  const cityIdStr = place?.city_id !== undefined && place?.city_id !== null ? String(place.city_id).trim() : null;

  const location: TravelLocationRecord = {
    id: String(place.id),
    name: String(place.name || 'Địa điểm'),
    group_id: normalizeServiceGroup(place.group),
    city_id: cityIdStr && cityIdStr !== '' ? cityIdStr : null,
    category: String(place.category || 'Địa điểm'),
    lat,
    lng,
    address: String(place.address || ''),
    phone: place.phone ? String(place.phone) : '',
    contact: place.contact ? String(place.contact) : '',
    checked: Boolean(place.checked),
    visited_at: place.visitedAt || (place.checked ? new Date().toISOString() : null),
    is_favorite: Boolean(place.isFavorite),
    is_deleted: Boolean(place.isDeleted),
    updated_at: new Date().toISOString(),
  };

  const detail: TravelLocationDetailRecord = {
    location_id: String(place.id),
    rating: place.rating !== undefined && place.rating !== null ? Number(place.rating) : 4.8,
    price_range: place.priceRange ? String(place.priceRange) : '',
    opening_hours: place.openingHours ? String(place.openingHours) : '',
    best_time_to_visit: place.bestTimeToVisit ? String(place.bestTimeToVisit) : '',
    notes: place.notes ? String(place.notes) : '',
    travel_tips: place.travelTips ? String(place.travelTips) : '',
    specialties: place.specialties ? String(place.specialties) : '',
    thumbnail_url: place.thumbnailUrl ? String(place.thumbnailUrl) : '',
    gallery_urls: Array.isArray(place.galleryUrls) ? place.galleryUrls.map(String) : [],
    website_url: place.website ? String(place.website) : '',
    updated_at: new Date().toISOString(),
  };

  return { location, detail };
}

/* =========================================================================
   GROUPS CRUD & LOCAL PERSISTENCE (travel_groups)
   ========================================================================= */

export const loadLocalGroups = (): ServiceGroupInfo[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GROUPS_KEY);
    if (!raw) return SERVICE_GROUPS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SERVICE_GROUPS;
  } catch (e) {
    return SERVICE_GROUPS;
  }
};

export const saveLocalGroups = (groups: ServiceGroupInfo[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save groups to localStorage:', e);
  }
};

export const fetchGroupsFromSupabase = async (): Promise<ServiceGroupInfo[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return loadLocalGroups();
  }

  try {
    const { data, error } = await client
      .from('travel_groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const groups: ServiceGroupInfo[] = data.map((g: any) => ({
        id: g.id as ServiceGroup,
        label: g.name || g.label || g.id,
        icon: g.icon || '📍',
        badgeBg: g.badge_bg || 'bg-slate-100 text-slate-800 border-slate-300',
        markerColor: g.marker_color || '#0d9488',
        description: g.description || '',
      }));
      saveLocalGroups(groups);
      return groups;
    }
  } catch (e) {
    console.warn('Failed to fetch travel_groups from Supabase, using local defaults:', e);
  }

  return loadLocalGroups();
};

/* =========================================================================
   CITIES CRUD & LOCAL PERSISTENCE (travel_cities)
   ========================================================================= */

export const loadLocalCities = (): TravelCity[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CITIES_KEY);
    if (!raw) return [...DEFAULT_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CITIES;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  } catch (e) {
    return [...DEFAULT_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }
};

export const saveLocalCities = (cities: TravelCity[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CITIES_KEY, JSON.stringify(cities));
  } catch (e) {
    console.error('Failed to save cities to localStorage:', e);
  }
};

export const fetchCitiesFromSupabase = async (client?: SupabaseClient | null): Promise<TravelCity[]> => {
  const sb = client || getSupabaseClient();
  if (!sb) {
    return loadLocalCities();
  }

  try {
    const { data, error } = await sb
      .from('travel_cities')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      const cities: TravelCity[] = data.map((c: any) => ({
        id: c.id,
        name: c.name || c.id,
        code: c.code || '',
        lat: c.lat ? Number(c.lat) : undefined,
        lng: c.lng ? Number(c.lng) : undefined,
        sort_order: c.sort_order || 0,
      }));

      // Ensure that default destination cities (e.g. hoi_an, sa_pa, phu_quoc, hue) exist
      const existingIds = new Set(cities.map((c) => c.id));
      const missingDefaults = DEFAULT_CITIES.filter((c) => !existingIds.has(c.id));
      if (missingDefaults.length > 0) {
        try {
          await sb.from('travel_cities').upsert(
            missingDefaults.map((c) => ({
              id: c.id,
              name: c.name,
              code: c.code || '',
              lat: c.lat || 0,
              lng: c.lng || 0,
              sort_order: c.sort_order || 0,
            })),
            { onConflict: 'id' }
          );
          cities.push(...missingDefaults);
        } catch (syncErr) {
          console.warn('Failed to sync missing cities in Supabase:', syncErr);
        }
      }

      // Sắp xếp danh sách thành phố chuẩn theo A-Z
      cities.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));

      saveLocalCities(cities.length > 0 ? cities : DEFAULT_CITIES);
      return cities.length > 0 ? cities : DEFAULT_CITIES;
    }
    if (error) {
      console.warn('Supabase query error for travel_cities:', error.message);
    }
  } catch (e) {
    console.warn('Failed to fetch travel_cities from Supabase:', e);
  }

  return loadLocalCities();
};

/* =========================================================================
   PLACES CRUD & LOCAL PERSISTENCE
   ========================================================================= */

export const loadLocalPlaces = (): TravelPlace[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PLACES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      group: normalizeServiceGroup(item.group || item.group_id || item.group_name),
    }));
  } catch (e) {
    return [];
  }
};

export const saveLocalPlaces = (places: TravelPlace[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PLACES_KEY, JSON.stringify(places));
  } catch (e) {
    console.error('Failed to save places to localStorage:', e);
  }
};

export const fetchPlacesFromSupabase = async (): Promise<TravelPlace[]> => {
  const client = getSupabaseClient();
  if (!client) {
    return loadLocalPlaces();
  }

  try {
    // 1. Try View
    const { data: viewData, error: viewError } = await client
      .from('travel_places_view')
      .select('*');

    if (!viewError && Array.isArray(viewData)) {
      const places = viewData.map(mapRowToPlace);
      saveLocalPlaces(places);
      return places;
    }

    // 2. Fallback to direct JOIN
    const { data: locData, error: locError } = await client
      .from('travel_locations')
      .select(`
        *,
        travel_location_details (*)
      `)
      .eq('is_deleted', false);

    if (!locError && Array.isArray(locData)) {
      const places = locData.map((loc: any) => {
        const det = Array.isArray(loc.travel_location_details)
          ? loc.travel_location_details[0]
          : loc.travel_location_details;
        return mapRowToPlace({ ...loc, ...(det || {}) });
      });
      saveLocalPlaces(places);
      return places;
    }

    return loadLocalPlaces();
  } catch (err) {
    console.warn('fetchPlacesFromSupabase failed, fallback to local storage:', err);
    return loadLocalPlaces();
  }
};

export const upsertPlaceToSupabase = async (place: TravelPlace): Promise<boolean> => {
  const currentPlaces = loadLocalPlaces();
  const index = currentPlaces.findIndex((p) => p.id === place.id);
  let updatedPlaces: TravelPlace[];
  if (index >= 0) {
    updatedPlaces = [...currentPlaces];
    updatedPlaces[index] = place;
  } else {
    updatedPlaces = [place, ...currentPlaces];
  }
  saveLocalPlaces(updatedPlaces);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { location, detail } = splitPlaceToTables(place);

    let { error: locError } = await client
      .from('travel_locations')
      .upsert(location, { onConflict: 'id' });

    // Handle foreign key constraint violation on city_id (error code 23503)
    if (locError && (locError.code === '23503' || String(locError.message || '').includes('foreign key constraint'))) {
      console.warn(`Foreign key violation on city_id "${location.city_id}". Attempting to ensure city exists in Supabase...`);
      if (location.city_id) {
        const foundCity = DEFAULT_CITIES.find((c) => c.id === location.city_id);
        const cityToInsert = {
          id: location.city_id,
          name: foundCity?.name || place.cityName || location.city_id,
          code: foundCity?.code || '',
          lat: foundCity?.lat || location.lat || 0,
          lng: foundCity?.lng || location.lng || 0,
          sort_order: foundCity?.sort_order || 99,
        };
        try {
          const { error: cityInsertError } = await client
            .from('travel_cities')
            .upsert(cityToInsert, { onConflict: 'id' });

          if (!cityInsertError) {
            const retryRes = await client
              .from('travel_locations')
              .upsert(location, { onConflict: 'id' });
            locError = retryRes.error;
          }
        } catch (cityErr) {
          console.warn('Could not auto-insert missing city:', cityErr);
        }
      }

      // If still failing with foreign key constraint, fallback to city_id: null to prevent data loss
      if (locError && (locError.code === '23503' || String(locError.message || '').includes('foreign key constraint'))) {
        console.warn('Fallback: saving location with city_id: null to prevent data loss.');
        const fallbackLocation = { ...location, city_id: null };
        const fallbackRes = await client
          .from('travel_locations')
          .upsert(fallbackLocation, { onConflict: 'id' });
        locError = fallbackRes.error;
      }
    }

    if (locError) {
      console.error('Failed to upsert to travel_locations:', locError);
      return false;
    }

    const { error: detError } = await client
      .from('travel_location_details')
      .upsert(detail, { onConflict: 'location_id' });

    if (detError) {
      console.warn('Warning: Failed to upsert to travel_location_details:', detError);
    }

    return true;
  } catch (err) {
    console.error('upsertPlaceToSupabase error:', err);
    return false;
  }
};

/**
 * Bulk Upsert multiple places into Supabase efficiently with batching and offline-first fallback.
 */
export const bulkUpsertPlacesToSupabase = async (
  newPlaces: TravelPlace[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  if (!newPlaces || newPlaces.length === 0) {
    return { success: true, count: 0 };
  }

  // 1. Merge and save to LocalStorage first (instant offline availability)
  const currentPlaces = loadLocalPlaces();
  const placesMap = new Map<string, TravelPlace>();
  currentPlaces.forEach((p) => placesMap.set(String(p.id), p));
  newPlaces.forEach((p) => placesMap.set(String(p.id), p));
  const mergedPlaces = Array.from(placesMap.values());
  saveLocalPlaces(mergedPlaces);

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, count: newPlaces.length };
  }

  try {
    const locationsToUpsert: TravelLocationRecord[] = [];
    const detailsToUpsert: TravelLocationDetailRecord[] = [];

    for (const place of newPlaces) {
      const { location, detail } = splitPlaceToTables(place);
      locationsToUpsert.push(location);
      detailsToUpsert.push(detail);
    }

    // Chunk size of 50 to prevent payload size limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < locationsToUpsert.length; i += CHUNK_SIZE) {
      const locChunk = locationsToUpsert.slice(i, i + CHUNK_SIZE);
      const detChunk = detailsToUpsert.slice(i, i + CHUNK_SIZE);

      const { error: locErr } = await client
        .from('travel_locations')
        .upsert(locChunk, { onConflict: 'id' });

      if (locErr) {
        if (isMissingTableOrSchemaError(locErr)) {
          console.warn('Bảng travel_locations chưa được khởi tạo trên Supabase, dữ liệu đã lưu an toàn vào LocalStorage.');
          return { success: true, count: newPlaces.length };
        }
        console.warn('Lỗi bulk upsert locations lên Supabase:', locErr);
      }

      const { error: detErr } = await client
        .from('travel_location_details')
        .upsert(detChunk, { onConflict: 'location_id' });

      if (detErr && !isMissingTableOrSchemaError(detErr)) {
        console.warn('Lỗi bulk upsert location_details lên Supabase:', detErr);
      }
    }

    return { success: true, count: newPlaces.length };
  } catch (err: any) {
    console.warn('bulkUpsertPlacesToSupabase exception (dữ liệu đã an toàn trên LocalStorage):', err);
    return { success: true, count: newPlaces.length };
  }
};

export const softDeletePlaceInSupabase = async (id: string): Promise<boolean> => {
  const currentPlaces = loadLocalPlaces();
  const updatedPlaces = currentPlaces.filter((p) => p.id !== id);
  saveLocalPlaces(updatedPlaces);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('travel_locations')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('Soft delete failed, trying hard delete:', error);
      await client.from('travel_locations').delete().eq('id', id);
    }
    return true;
  } catch (e) {
    console.error('Delete error in Supabase:', e);
    return false;
  }
};

/* =========================================================================
   TRIPS (ITINERARIES) CRUD
   ========================================================================= */

export const loadLocalTrips = (): TravelTrip[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalTrips = (trips: TravelTrip[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
};

export const fetchTripsFromSupabase = async (userId?: string): Promise<TravelTrip[]> => {
  const client = getSupabaseClient();
  if (!client) {
    const local = loadLocalTrips();
    return userId ? local.filter((t) => t.userId === userId) : local;
  }

  try {
    let query = client
      .from('travel_trips')
      .select(`
        *,
        travel_trip_stops (*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: tripsData, error } = await query;

    if (!error && Array.isArray(tripsData)) {
      const trips: TravelTrip[] = tripsData.map((t: any) => ({
        id: t.id,
        userId: t.user_id || undefined,
        userEmail: t.user_email || undefined,
        userName: t.user_name || undefined,
        title: t.title,
        description: t.description || '',
        startDate: t.start_date,
        endDate: t.end_date,
        budget: Number(t.budget) || 0,
        coverImage: t.cover_image,
        status: t.status || 'planning',
        stops: Array.isArray(t.travel_trip_stops)
          ? t.travel_trip_stops.map((s: any) => ({
              id: s.id,
              tripId: s.trip_id,
              locationId: s.location_id,
              dayNumber: s.day_number || 1,
              visitTime: s.visit_time || '',
              orderIndex: s.order_index || 1,
              transportMode: s.transport_mode || 'driving',
              stopNotes: s.stop_notes || '',
            }))
          : [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
      if (!userId) {
        saveLocalTrips(trips);
      }
      return trips;
    }
    const local = loadLocalTrips();
    return userId ? local.filter((t) => t.userId === userId) : local;
  } catch (e) {
    const local = loadLocalTrips();
    return userId ? local.filter((t) => t.userId === userId) : local;
  }
};

export const upsertTripToSupabase = async (trip: TravelTrip): Promise<boolean> => {
  const current = loadLocalTrips();
  const idx = current.findIndex((t) => t.id === trip.id);
  let updated: TravelTrip[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = trip;
  } else {
    updated = [trip, ...current];
  }
  saveLocalTrips(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error: tripError } = await client.from('travel_trips').upsert({
      id: trip.id,
      user_id: trip.userId || null,
      user_email: trip.userEmail || null,
      user_name: trip.userName || null,
      title: trip.title,
      description: trip.description || '',
      start_date: trip.startDate || null,
      end_date: trip.endDate || null,
      budget: trip.budget || 0,
      cover_image: trip.coverImage || '',
      status: trip.status || 'planning',
      updated_at: new Date().toISOString(),
    });

    if (tripError) return false;

    // Save stops if any
    if (trip.stops && trip.stops.length > 0) {
      const stopsRows = trip.stops.map((s) => ({
        id: s.id,
        trip_id: trip.id,
        location_id: s.locationId,
        day_number: s.dayNumber,
        visit_time: s.visitTime || '',
        order_index: s.orderIndex,
        transport_mode: s.transportMode || 'driving',
        stop_notes: s.stopNotes || '',
      }));
      await client.from('travel_trip_stops').upsert(stopsRows);
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteTripInSupabase = async (id: string): Promise<boolean> => {
  const current = loadLocalTrips();
  saveLocalTrips(current.filter((t) => t.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    await client.from('travel_trips').delete().eq('id', id);
    return true;
  } catch (e) {
    return false;
  }
};

/* =========================================================================
   REVIEWS & CHECK-IN LOGS
   ========================================================================= */

export const loadLocalReviews = (): TravelReviewLog[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalReviews = (reviews: TravelReviewLog[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Failed to save reviews to localStorage:', e);
  }
};

export const fetchReviewsFromSupabase = async (
  locationId?: string,
  userId?: string
): Promise<TravelReviewLog[]> => {
  const client = getSupabaseClient();
  if (!client) {
    let all = loadLocalReviews();
    if (locationId) all = all.filter((r) => r.locationId === locationId);
    if (userId) all = all.filter((r) => r.userId === userId);
    return all;
  }

  try {
    let query = client.from('travel_reviews_logs').select('*').order('created_at', { ascending: false });
    if (locationId) {
      query = query.eq('location_id', locationId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const mapped: TravelReviewLog[] = data.map((r: any) => ({
        id: r.id,
        userId: r.user_id || undefined,
        userEmail: r.user_email || undefined,
        userName: r.user_name || undefined,
        locationId: r.location_id,
        visitedAt: r.visited_at,
        rating: Number(r.rating) || 5,
        actualExpense: Number(r.actual_expense) || 0,
        reviewText: r.review_text || '',
        capturedPhotos: Array.isArray(r.captured_photos) ? r.captured_photos : [],
        weather: r.weather || '',
        companion: r.companion || '',
        createdAt: r.created_at,
      }));
      if (!locationId && !userId) saveLocalReviews(mapped);
      return mapped;
    }
    let all = loadLocalReviews();
    if (locationId) all = all.filter((r) => r.locationId === locationId);
    if (userId) all = all.filter((r) => r.userId === userId);
    return all;
  } catch (e) {
    let all = loadLocalReviews();
    if (locationId) all = all.filter((r) => r.locationId === locationId);
    if (userId) all = all.filter((r) => r.userId === userId);
    return all;
  }
};

export const upsertReviewToSupabase = async (review: TravelReviewLog): Promise<boolean> => {
  const current = loadLocalReviews();
  const idx = current.findIndex((r) => r.id === review.id);
  let updated: TravelReviewLog[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = review;
  } else {
    updated = [review, ...current];
  }
  saveLocalReviews(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_reviews_logs').upsert({
      id: review.id,
      user_id: review.userId || null,
      user_email: review.userEmail || null,
      user_name: review.userName || null,
      location_id: review.locationId,
      visited_at: review.visitedAt,
      rating: review.rating,
      actual_expense: review.actualExpense || 0,
      review_text: review.reviewText,
      captured_photos: review.capturedPhotos || [],
      weather: review.weather || '',
      companion: review.companion || '',
    });
    return !error;
  } catch (e) {
    return false;
  }
};

export const deleteReviewInSupabase = async (id: string): Promise<boolean> => {
  const current = loadLocalReviews();
  saveLocalReviews(current.filter((r) => r.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_reviews_logs').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
};

/* =========================================================================
   EXPENSES CRUD
   ========================================================================= */

export const loadLocalExpenses = (): TravelExpense[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXPENSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalExpenses = (expenses: TravelExpense[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to localStorage:', e);
  }
};

export const fetchExpensesFromSupabase = async (
  userId?: string,
  tripId?: string
): Promise<TravelExpense[]> => {
  const client = getSupabaseClient();
  if (!client) {
    let all = loadLocalExpenses();
    if (userId) all = all.filter((e) => e.userId === userId);
    if (tripId) all = all.filter((e) => e.tripId === tripId);
    return all;
  }

  try {
    let query = client.from('travel_expenses').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (tripId) {
      query = query.eq('trip_id', tripId);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const mapped: TravelExpense[] = data.map((e: any) => ({
        id: e.id,
        userId: e.user_id || undefined,
        userEmail: e.user_email || undefined,
        userName: e.user_name || undefined,
        tripId: e.trip_id,
        locationId: e.location_id,
        title: e.title || 'Chi phí',
        category: e.category || 'food',
        amount: Number(e.amount) || 0,
        paymentMethod: e.payment_method || 'cash',
        receiptUrl: e.receipt_url,
        notes: e.notes,
        createdAt: e.created_at,
      }));
      if (!userId && !tripId) saveLocalExpenses(mapped);
      return mapped;
    }
    let all = loadLocalExpenses();
    if (userId) all = all.filter((e) => e.userId === userId);
    if (tripId) all = all.filter((e) => e.tripId === tripId);
    return all;
  } catch (e) {
    let all = loadLocalExpenses();
    if (userId) all = all.filter((e) => e.userId === userId);
    if (tripId) all = all.filter((e) => e.tripId === tripId);
    return all;
  }
};

export const upsertExpenseToSupabase = async (expense: TravelExpense): Promise<boolean> => {
  const current = loadLocalExpenses();
  const idx = current.findIndex((e) => e.id === expense.id);
  let updated: TravelExpense[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = expense;
  } else {
    updated = [expense, ...current];
  }
  saveLocalExpenses(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_expenses').upsert({
      id: expense.id,
      user_id: expense.userId || null,
      user_email: expense.userEmail || null,
      user_name: expense.userName || null,
      trip_id: expense.tripId || null,
      location_id: expense.locationId || null,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      payment_method: expense.paymentMethod || 'cash',
      receipt_url: expense.receiptUrl || '',
      notes: expense.notes || '',
    });
    return !error;
  } catch (e) {
    return false;
  }
};

export const deleteExpenseInSupabase = async (id: string): Promise<boolean> => {
  const current = loadLocalExpenses();
  saveLocalExpenses(current.filter((e) => e.id !== id));

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_expenses').delete().eq('id', id);
    return !error;
  } catch (e) {
    return false;
  }
};

/* =========================================================================
   REPORTS (BÁO CÁO ĐỊA ĐIỂM)
   ========================================================================= */

export const loadLocalReports = (): PlaceReport[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalReports = (reports: PlaceReport[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Failed to save reports to localStorage:', e);
  }
};

export const fetchReportsFromSupabase = async (): Promise<PlaceReport[]> => {
  const client = getSupabaseClient();
  const localReports = loadLocalReports();

  if (!client) {
    return localReports;
  }

  try {
    const { data, error } = await client
      .from('travel_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const formatted: PlaceReport[] = data.map((r: any) => ({
        id: r.id,
        locationId: r.location_id,
        locationName: r.location_name,
        locationAddress: r.location_address,
        reportedByUserId: r.reported_by_user_id || 'anonymous',
        reportedByUserName: r.reported_by_user_name || 'Người dùng',
        reportedByUserEmail: r.reported_by_user_email,
        reason: r.reason,
        description: r.description,
        proofUrl: r.proof_url,
        status: r.status || 'pending',
        adminNote: r.admin_note,
        resolvedAt: r.resolved_at,
        createdAt: r.created_at || new Date().toISOString(),
      }));

      saveLocalReports(formatted);
      return formatted;
    }
    return localReports;
  } catch (err) {
    console.warn('Failed to fetch reports from Supabase, using local:', err);
    return localReports;
  }
};

export const submitPlaceReport = async (report: PlaceReport): Promise<boolean> => {
  const currentReports = loadLocalReports();
  const updated = [report, ...currentReports];
  saveLocalReports(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_reports').insert({
      id: report.id,
      location_id: report.locationId,
      location_name: report.locationName,
      location_address: report.locationAddress || '',
      reported_by_user_id: report.reportedByUserId,
      reported_by_user_name: report.reportedByUserName,
      reported_by_user_email: report.reportedByUserEmail || '',
      reason: report.reason,
      description: report.description,
      proof_url: report.proofUrl || '',
      status: report.status,
      admin_note: report.adminNote || '',
      created_at: report.createdAt,
    });
    return !error;
  } catch (e) {
    return false;
  }
};

export const updateReportStatusInDb = async (
  reportId: string,
  status: ReportStatus,
  adminNote?: string
): Promise<boolean> => {
  const currentReports = loadLocalReports();
  const updated = currentReports.map((r) =>
    r.id === reportId
      ? {
          ...r,
          status,
          adminNote: adminNote !== undefined ? adminNote : r.adminNote,
          resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : r.resolvedAt,
        }
      : r
  );
  saveLocalReports(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from('travel_reports')
      .update({
        status,
        admin_note: adminNote,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
      })
      .eq('id', reportId);
    return !error;
  } catch (e) {
    return false;
  }
};

export const deleteReportInDb = async (reportId: string): Promise<boolean> => {
  const currentReports = loadLocalReports();
  const updated = currentReports.filter((r) => r.id !== reportId);
  saveLocalReports(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client.from('travel_reports').delete().eq('id', reportId);
    return !error;
  } catch (e) {
    return false;
  }
};

/* =========================================================================
   USERS & AUTH DATABASE SYNC (travel_users)
   ========================================================================= */

const LOCAL_STORAGE_USERS_KEY = 'travelmaps_registered_users_v3';

export const loadLocalUsers = (): Array<UserProfile & { password?: string }> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
};

export const saveLocalUsers = (users: Array<UserProfile & { password?: string }>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
};

export const fetchUsersFromSupabase = async (): Promise<Array<UserProfile & { password?: string }>> => {
  const client = getSupabaseClient();
  const local = loadLocalUsers();

  if (!client) return local;

  try {
    const { data, error } = await client.from('travel_users').select('*');
    if (error || !data || data.length === 0) return local;

    const formatted = data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role || 'user',
      avatarUrl: u.avatar_url,
      phone: u.phone,
      createdAt: u.created_at,
    }));

    // Merge with local if any unique
    saveLocalUsers(formatted);
    return formatted;
  } catch (err) {
    return local;
  }
};

export function isMissingTableOrSchemaError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('relation') ||
    msg.includes('does not exist')
  );
}

export const upsertUserToSupabase = async (user: UserProfile & { password?: string }): Promise<boolean> => {
  // Viewer là khách thăm quan tự do, không lưu tài khoản hay mật khẩu vào database
  if (user.role === 'viewer' || !user.email) return true;

  const local = loadLocalUsers();
  const idx = local.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  let updated: Array<UserProfile & { password?: string }>;
  if (idx >= 0) {
    updated = [...local];
    updated[idx] = { ...updated[idx], ...user };
  } else {
    updated = [user, ...local];
  }
  saveLocalUsers(updated);

  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const payload: any = {
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password || '123456',
      role: user.role,
      avatar_url: user.avatarUrl || '',
      updated_at: new Date().toISOString(),
    };

    // Chỉ đính kèm id nếu là số hợp lệ (> 0), tránh lỗi bigint parsing khi id là chuỗi custom
    if (user.id && /^\d+$/.test(String(user.id)) && Number(user.id) > 0) {
      payload.id = Number(user.id);
    }

    const { error } = await client.from('travel_users').upsert(
      payload,
      { onConflict: 'email' }
    );

    if (error) {
      if (isMissingTableOrSchemaError(error)) {
        console.warn('Bảng travel_users chưa được tạo hoặc cache schema chưa sẵn sàng trên Supabase. Đã lưu an toàn vào bộ nhớ cục bộ.');
        return true;
      }

      console.warn('Thử cập nhật user theo email:', error.message || error);
      // Fallback: Cập nhật trực tiếp theo email
      const { error: updateErr } = await client
        .from('travel_users')
        .update({
          name: user.name,
          avatar_url: user.avatarUrl || '',
          updated_at: new Date().toISOString(),
        })
        .eq('email', user.email.toLowerCase());

      if (updateErr) {
        if (!isMissingTableOrSchemaError(updateErr)) {
          console.warn('Không thể đồng bộ user lên Supabase:', updateErr.message || updateErr);
        }
        return false;
      }
    }
    return true;
  } catch (e: any) {
    if (!isMissingTableOrSchemaError(e)) {
      console.warn('Lỗi khi lưu user lên Supabase:', e?.message || e);
    }
    return false;
  }
};

/**
 * Cập nhật avatar_url trực tiếp lên cơ sở dữ liệu Supabase theo email hoặc ID
 */
export const updateUserAvatarInSupabase = async (
  emailOrId: string,
  avatarUrl: string
): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const isNumeric = /^\d+$/.test(String(emailOrId));
    let query = client.from('travel_users').update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (isNumeric) {
      query = query.eq('id', Number(emailOrId));
    } else {
      query = query.eq('email', emailOrId.toLowerCase());
    }

    const { error } = await query;
    if (error) {
      if (isMissingTableOrSchemaError(error)) {
        console.warn('Bảng travel_users chưa có trên Supabase để lưu avatar. Avatar đã được áp dụng trong phiên làm việc.');
        return true;
      }
      console.warn('Lỗi cập nhật avatar lên Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (e: any) {
    if (!isMissingTableOrSchemaError(e)) {
      console.warn('Exception khi cập nhật avatar:', e?.message || e);
    }
    return false;
  }
};

/* =========================================================================
   TAGS
   ========================================================================= */

export const loadLocalTags = (): TravelTag[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TAGS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_TAGS_KEY, JSON.stringify(DEFAULT_TAGS));
      return DEFAULT_TAGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_TAGS;
  }
};

/* =========================================================================
   STATUS CHECK FOR ALL TABLES
   ========================================================================= */

export const checkSupabaseStatus = async (): Promise<SupabaseConfigStatus> => {
  const config = getEnvConfig();
  if (!config.url || !config.key) {
    return {
      projectId: config.projectId,
      anonKey: '',
      url: '',
      isCustom: config.isCustom,
      isConnected: false,
      tableExists: false,
      errorMessage: 'Chưa cấu hình Supabase Project Reference ID & API Key',
    };
  }

  try {
    const client = createClient(config.url, config.key);

    const [locRes, detRes, grpRes, tagRes, tripRes, revRes, expRes, repRes, userRes, viewRes] = await Promise.all([
      client.from('travel_locations').select('id').limit(1),
      client.from('travel_location_details').select('id').limit(1),
      client.from('travel_groups').select('id').limit(1),
      client.from('travel_tags').select('id').limit(1),
      client.from('travel_trips').select('id').limit(1),
      client.from('travel_reviews_logs').select('id').limit(1),
      client.from('travel_expenses').select('id').limit(1),
      client.from('travel_reports').select('id').limit(1),
      client.from('travel_users').select('id').limit(1),
      client.from('travel_places_view').select('id').limit(1),
    ]);

    const tablesStatus = {
      groupsTable: !grpRes.error,
      locationsTable: !locRes.error,
      detailsTable: !detRes.error,
      tagsTable: !tagRes.error,
      tripsTable: !tripRes.error,
      reviewsTable: !revRes.error,
      expensesTable: !expRes.error,
      reportsTable: !repRes.error,
      usersTable: !userRes.error,
      placesView: !viewRes.error,
    };

    const isConnected = !locRes.error || !detRes.error || !grpRes.error || !viewRes.error;
    const tableExists = tablesStatus.locationsTable && tablesStatus.detailsTable;

    let errorMessage: string | undefined;
    if (!isConnected) {
      errorMessage = locRes.error?.message || 'Không thể kết nối đến máy chủ Supabase';
    } else if (!tableExists) {
      errorMessage = 'Kết nối thành công nhưng chưa tạo đủ các bảng quan hệ. Vui lòng chạy Script SQL.';
    }

    return {
      projectId: config.projectId,
      anonKey: config.key ? `${config.key.substring(0, 8)}...` : '',
      url: config.url,
      isCustom: config.isCustom,
      isConnected,
      tableExists,
      tablesStatus,
      errorMessage,
    };
  } catch (err: any) {
    return {
      projectId: config.projectId,
      anonKey: '',
      url: config.url,
      isCustom: config.isCustom,
      isConnected: false,
      tableExists: false,
      errorMessage: err?.message || 'Lỗi kiểm tra kết nối',
    };
  }
};
