import {
  TravelPlace,
  TravelCity,
  TravelReviewLog,
  TravelExpense,
  TravelTrip,
  ServiceGroup,
  ServiceGroupInfo,
} from '../types';
import { normalizeServiceGroup } from './supabase';
import { DEFAULT_CITIES, SERVICE_GROUPS_MAP } from './geoUtils';

/**
 * SQL-synchronized structure for unified view (public.travel_places_view)
 */
export interface SqlPlaceViewRecord {
  id: string;
  name: string;
  group_id: ServiceGroup;
  group: ServiceGroup;
  group_name: string;
  city_id: string | null;
  city_name: string;
  category: string;
  lat: number;
  lng: number;
  coordinates: { lat: number; lng: number };
  address: string;
  phone: string;
  contact: string;
  checked: boolean;
  visited_at: string | null;
  is_favorite: boolean;
  is_deleted: boolean;
  rating: number;
  price_range: string;
  opening_hours: string;
  best_time_to_visit: string;
  notes: string;
  travel_tips: string;
  specialties: string;
  thumbnail_url: string;
  gallery_urls: string[];
  website_url: string;
  reviews_count: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * SQL-synchronized relational database backup structure
 */
export interface SqlRelationalDatabaseBackup {
  version: string;
  database: string;
  exported_at: string;
  description: string;
  summary: {
    locations_count: number;
    details_count: number;
    cities_count: number;
    groups_count: number;
    reviews_count: number;
    expenses_count: number;
    trips_count: number;
  };
  tables: {
    travel_cities: Array<{
      id: string;
      name: string;
      code: string;
      lat: number;
      lng: number;
      sort_order: number;
    }>;
    travel_groups: Array<{
      id: string;
      name: string;
      icon: string;
      badge_bg: string;
      marker_color: string;
      description: string;
      sort_order: number;
    }>;
    travel_locations: Array<{
      id: string;
      name: string;
      group_id: string;
      city_id: string | null;
      category: string;
      lat: number;
      lng: number;
      address: string;
      phone: string;
      contact: string;
      checked: boolean;
      visited_at: string | null;
      is_favorite: boolean;
      is_deleted: boolean;
      created_at?: string;
      updated_at?: string;
    }>;
    travel_location_details: Array<{
      location_id: string;
      rating: number;
      price_range: string;
      opening_hours: string;
      best_time_to_visit: string;
      notes: string;
      travel_tips: string;
      specialties: string;
      thumbnail_url: string;
      gallery_urls: string[];
      website_url: string;
      updated_at?: string;
    }>;
    travel_reviews_logs: Array<{
      id: string;
      user_id: string | null;
      user_email: string | null;
      user_name: string | null;
      location_id: string;
      visited_at: string;
      rating: number;
      actual_expense: number;
      review_text: string;
      captured_photos: string[];
      weather: string;
      companion: string;
      created_at: string;
    }>;
    travel_expenses: Array<{
      id: string;
      user_id: string | null;
      user_email: string | null;
      user_name: string | null;
      trip_id: string | null;
      location_id: string | null;
      title: string;
      category: string;
      amount: number;
      payment_method: string;
      receipt_url: string;
      notes: string;
      created_at: string;
    }>;
    travel_trips: Array<{
      id: string;
      user_id: string | null;
      user_email: string | null;
      user_name: string | null;
      title: string;
      description: string;
      start_date: string | null;
      end_date: string | null;
      budget: number;
      cover_image: string;
      status: string;
      total_distance_km: number;
      total_expenses: number;
      created_at?: string;
      updated_at?: string;
    }>;
  };
}

/**
 * Convert TravelPlace[] to array strictly synchronized with travel_places_view columns
 */
export function formatPlacesToSqlViewJson(
  places: TravelPlace[],
  cities: TravelCity[] = DEFAULT_CITIES
): SqlPlaceViewRecord[] {
  const cityMap = new Map<string, string>();
  DEFAULT_CITIES.forEach((c) => cityMap.set(c.id, c.name));
  cities.forEach((c) => cityMap.set(c.id, c.name));

  return places.map((p) => {
    const rawLat = p.coordinates?.lat !== undefined ? p.coordinates.lat : (p as any).lat;
    const rawLng = p.coordinates?.lng !== undefined ? p.coordinates.lng : (p as any).lng;
    const lat = Number(rawLat) || 16.0544;
    const lng = Number(rawLng) || 108.2022;

    const cityId = p.city_id && String(p.city_id).trim() !== '' ? String(p.city_id).trim() : null;
    const cityName = (cityId ? cityMap.get(cityId) : null) || p.cityName || '';

    const groupMeta = SERVICE_GROUPS_MAP[p.group] || SERVICE_GROUPS_MAP.du_lich;

    return {
      id: String(p.id),
      name: p.name || 'Địa điểm',
      group_id: p.group || 'du_lich',
      group: p.group || 'du_lich',
      group_name: groupMeta.label,
      city_id: cityId,
      city_name: cityName,
      category: p.category || 'Địa điểm',
      lat,
      lng,
      coordinates: { lat, lng },
      address: p.address || '',
      phone: p.phone || '',
      contact: p.contact || '',
      checked: Boolean(p.checked),
      visited_at: p.visitedAt || (p.checked ? new Date().toISOString() : null),
      is_favorite: Boolean(p.isFavorite),
      is_deleted: Boolean(p.isDeleted),
      rating: p.rating !== undefined ? Number(p.rating) : 4.8,
      price_range: p.priceRange || '',
      opening_hours: p.openingHours || '',
      best_time_to_visit: p.bestTimeToVisit || '',
      notes: p.notes || '',
      travel_tips: p.travelTips || '',
      specialties: p.specialties || '',
      thumbnail_url: p.thumbnailUrl || '',
      gallery_urls: Array.isArray(p.galleryUrls) ? p.galleryUrls : [],
      website_url: p.website || '',
      reviews_count: p.reviewsCount || 0,
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString(),
    };
  });
}

/**
 * Convert all data to Full Relational Database Backup JSON matching SQL tables
 */
export function formatToRelationalDatabaseJson(
  places: TravelPlace[],
  cities: TravelCity[] = DEFAULT_CITIES,
  reviews: TravelReviewLog[] = [],
  expenses: TravelExpense[] = [],
  trips: TravelTrip[] = []
): SqlRelationalDatabaseBackup {
  const cityMap = new Map<string, TravelCity>();
  DEFAULT_CITIES.forEach((c) => cityMap.set(c.id, c));
  cities.forEach((c) => cityMap.set(c.id, c));
  const fullCities = Array.from(cityMap.values());

  const groupsList = Object.values(SERVICE_GROUPS_MAP).map((g, idx) => ({
    id: g.id,
    name: g.label,
    icon: g.icon,
    badge_bg: g.badgeBg,
    marker_color: g.markerColor,
    description: g.desc,
    sort_order: idx + 1,
  }));

  const locations = places.map((p) => {
    const rawLat = p.coordinates?.lat !== undefined ? p.coordinates.lat : (p as any).lat;
    const rawLng = p.coordinates?.lng !== undefined ? p.coordinates.lng : (p as any).lng;
    const lat = Number(rawLat) || 16.0544;
    const lng = Number(rawLng) || 108.2022;
    const cityId = p.city_id && String(p.city_id).trim() !== '' ? String(p.city_id).trim() : null;

    return {
      id: String(p.id),
      name: p.name || 'Địa điểm',
      group_id: p.group || 'du_lich',
      city_id: cityId,
      category: p.category || 'Địa điểm',
      lat,
      lng,
      address: p.address || '',
      phone: p.phone || '',
      contact: p.contact || '',
      checked: Boolean(p.checked),
      visited_at: p.visitedAt || (p.checked ? new Date().toISOString() : null),
      is_favorite: Boolean(p.isFavorite),
      is_deleted: Boolean(p.isDeleted),
      created_at: p.created_at || new Date().toISOString(),
      updated_at: p.updated_at || new Date().toISOString(),
    };
  });

  const locationDetails = places.map((p) => ({
    location_id: String(p.id),
    rating: p.rating !== undefined ? Number(p.rating) : 4.8,
    price_range: p.priceRange || '',
    opening_hours: p.openingHours || '',
    best_time_to_visit: p.bestTimeToVisit || '',
    notes: p.notes || '',
    travel_tips: p.travelTips || '',
    specialties: p.specialties || '',
    thumbnail_url: p.thumbnailUrl || '',
    gallery_urls: Array.isArray(p.galleryUrls) ? p.galleryUrls : [],
    website_url: p.website || '',
    updated_at: p.updated_at || new Date().toISOString(),
  }));

  const formattedReviews = reviews.map((r) => ({
    id: String(r.id),
    user_id: r.userId || null,
    user_email: r.userEmail || null,
    user_name: r.userName || null,
    location_id: String(r.locationId),
    visited_at: r.visitedAt || new Date().toISOString(),
    rating: Number(r.rating) || 5,
    actual_expense: Number(r.actualExpense) || 0,
    review_text: r.reviewText || '',
    captured_photos: Array.isArray(r.capturedPhotos) ? r.capturedPhotos : [],
    weather: r.weather || '',
    companion: r.companion || '',
    created_at: r.createdAt || new Date().toISOString(),
  }));

  const formattedExpenses = expenses.map((e) => ({
    id: String(e.id),
    user_id: e.userId || null,
    user_email: e.userEmail || null,
    user_name: e.userName || null,
    trip_id: e.tripId ? String(e.tripId) : null,
    location_id: e.locationId ? String(e.locationId) : null,
    title: e.title || 'Chi phí',
    category: e.category || 'food',
    amount: Number(e.amount) || 0,
    payment_method: e.paymentMethod || 'cash',
    receipt_url: e.receiptUrl || '',
    notes: e.notes || '',
    created_at: e.createdAt || new Date().toISOString(),
  }));

  const formattedTrips = trips.map((t) => ({
    id: String(t.id),
    user_id: t.userId || null,
    user_email: t.userEmail || null,
    user_name: t.userName || null,
    title: t.title || 'Chuyến đi',
    description: t.description || '',
    start_date: t.startDate || null,
    end_date: t.endDate || null,
    budget: Number(t.budget) || 0,
    cover_image: t.coverImage || '',
    status: t.status || 'planning',
    total_distance_km: Number(t.totalDistanceKm) || 0,
    total_expenses: Number(t.totalExpenses) || 0,
    created_at: t.createdAt || new Date().toISOString(),
    updated_at: t.updatedAt || new Date().toISOString(),
  }));

  return {
    version: '1.0',
    database: 'travel_maps',
    exported_at: new Date().toISOString(),
    description: 'Bản sao lưu CSDL Travel Maps đồng bộ 100% với PostgreSQL / Supabase',
    summary: {
      locations_count: locations.length,
      details_count: locationDetails.length,
      cities_count: fullCities.length,
      groups_count: groupsList.length,
      reviews_count: formattedReviews.length,
      expenses_count: formattedExpenses.length,
      trips_count: formattedTrips.length,
    },
    tables: {
      travel_cities: fullCities.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || '',
        lat: c.lat || 0,
        lng: c.lng || 0,
        sort_order: c.sort_order || 99,
      })),
      travel_groups: groupsList,
      travel_locations: locations,
      travel_location_details: locationDetails,
      travel_reviews_logs: formattedReviews,
      travel_expenses: formattedExpenses,
      travel_trips: formattedTrips,
    },
  };
}

/**
 * Escapes string for PostgreSQL SQL insert literal
 */
function escapeSqlString(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Generates ready-to-run PostgreSQL / Supabase SQL INSERT script
 */
export function generateSqlScriptFromData(
  places: TravelPlace[],
  cities: TravelCity[] = DEFAULT_CITIES,
  reviews: TravelReviewLog[] = [],
  expenses: TravelExpense[] = [],
  trips: TravelTrip[] = []
): string {
  const parts: string[] = [];

  parts.push(`-- =============================================================================`);
  parts.push(`-- TRAVEL MAPS - DỮ LIỆU ĐỒNG BỘ XUẤT TỰ ĐỘNG (POSTGRESQL / SUPABASE)`);
  parts.push(`-- Ngày xuất: ${new Date().toLocaleString('vi-VN')}`);
  parts.push(`-- Số lượng địa điểm: ${places.length} | Tỉnh thành: ${cities.length}`);
  parts.push(`-- =============================================================================\n`);

  // 1. Cities
  if (cities.length > 0) {
    parts.push(`-- 1. DANH MỤC TỈNH THÀNH (travel_cities)`);
    parts.push(`INSERT INTO public.travel_cities (id, name, code, lat, lng, sort_order) VALUES`);
    const cityRows = cities.map((c) => {
      const id = escapeSqlString(c.id);
      const name = escapeSqlString(c.name);
      const code = escapeSqlString(c.code || '');
      const lat = Number(c.lat) || 0;
      const lng = Number(c.lng) || 0;
      const order = Number(c.sort_order) || 99;
      return `  (${id}, ${name}, ${code}, ${lat}, ${lng}, ${order})`;
    });
    parts.push(cityRows.join(',\n'));
    parts.push(`ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code, lat = EXCLUDED.lat, lng = EXCLUDED.lng, sort_order = EXCLUDED.sort_order;\n`);
  }

  // 2. Locations
  if (places.length > 0) {
    parts.push(`-- 2. DANH SÁCH ĐỊA ĐIỂM (travel_locations)`);
    parts.push(`INSERT INTO public.travel_locations (id, name, group_id, city_id, category, lat, lng, address, phone, contact, checked, visited_at, is_favorite, is_deleted) VALUES`);
    const locRows = places.map((p) => {
      const id = escapeSqlString(p.id);
      const name = escapeSqlString(p.name || 'Địa điểm');
      const groupId = escapeSqlString(p.group || 'du_lich');
      const cityId = p.city_id && String(p.city_id).trim() !== '' ? escapeSqlString(p.city_id) : 'NULL';
      const category = escapeSqlString(p.category || 'Địa điểm');
      const rawLat = p.coordinates?.lat !== undefined ? p.coordinates.lat : (p as any).lat;
      const rawLng = p.coordinates?.lng !== undefined ? p.coordinates.lng : (p as any).lng;
      const lat = Number(rawLat) || 16.0544;
      const lng = Number(rawLng) || 108.2022;
      const address = escapeSqlString(p.address || '');
      const phone = escapeSqlString(p.phone || '');
      const contact = escapeSqlString(p.contact || '');
      const checked = p.checked ? 'TRUE' : 'FALSE';
      const visitedAt = p.visitedAt ? escapeSqlString(p.visitedAt) : (p.checked ? 'NOW()' : 'NULL');
      const isFav = p.isFavorite ? 'TRUE' : 'FALSE';
      const isDel = p.isDeleted ? 'TRUE' : 'FALSE';
      return `  (${id}, ${name}, ${groupId}, ${cityId}, ${category}, ${lat}, ${lng}, ${address}, ${phone}, ${contact}, ${checked}, ${visitedAt}, ${isFav}, ${isDel})`;
    });
    parts.push(locRows.join(',\n'));
    parts.push(`ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, group_id = EXCLUDED.group_id, city_id = EXCLUDED.city_id, category = EXCLUDED.category, lat = EXCLUDED.lat, lng = EXCLUDED.lng, address = EXCLUDED.address, phone = EXCLUDED.phone, contact = EXCLUDED.contact, checked = EXCLUDED.checked, visited_at = EXCLUDED.visited_at, is_favorite = EXCLUDED.is_favorite;\n`);

    // 3. Location Details
    parts.push(`-- 3. CHI TIẾT ĐỊA ĐIỂM (travel_location_details)`);
    parts.push(`INSERT INTO public.travel_location_details (location_id, rating, price_range, opening_hours, best_time_to_visit, notes, travel_tips, specialties, thumbnail_url, gallery_urls, website_url) VALUES`);
    const detailRows = places.map((p) => {
      const locId = escapeSqlString(p.id);
      const rating = Number(p.rating) || 4.8;
      const price = escapeSqlString(p.priceRange || '');
      const hours = escapeSqlString(p.openingHours || '');
      const bestTime = escapeSqlString(p.bestTimeToVisit || '');
      const notes = escapeSqlString(p.notes || '');
      const tips = escapeSqlString(p.travelTips || '');
      const specs = escapeSqlString(p.specialties || '');
      const thumb = escapeSqlString(p.thumbnailUrl || '');
      const gallery = Array.isArray(p.galleryUrls) ? p.galleryUrls : [];
      const galleryJson = escapeSqlString(JSON.stringify(gallery)) + '::jsonb';
      const web = escapeSqlString(p.website || '');
      return `  (${locId}, ${rating}, ${price}, ${hours}, ${bestTime}, ${notes}, ${tips}, ${specs}, ${thumb}, ${galleryJson}, ${web})`;
    });
    parts.push(detailRows.join(',\n'));
    parts.push(`ON CONFLICT (location_id) DO UPDATE SET rating = EXCLUDED.rating, price_range = EXCLUDED.price_range, opening_hours = EXCLUDED.opening_hours, best_time_to_visit = EXCLUDED.best_time_to_visit, notes = EXCLUDED.notes, travel_tips = EXCLUDED.travel_tips, specialties = EXCLUDED.specialties, thumbnail_url = EXCLUDED.thumbnail_url, gallery_urls = EXCLUDED.gallery_urls, website_url = EXCLUDED.website_url;\n`);
  }

  // 4. Reviews
  if (reviews.length > 0) {
    parts.push(`-- 4. NHẬT KÝ TRẢI NGHIỆM & ĐÁNH GIÁ (travel_reviews_logs)`);
    parts.push(`INSERT INTO public.travel_reviews_logs (id, user_id, user_email, user_name, location_id, visited_at, rating, actual_expense, review_text, captured_photos, weather, companion) VALUES`);
    const revRows = reviews.map((r) => {
      const id = escapeSqlString(r.id);
      const uid = r.userId ? escapeSqlString(r.userId) : 'NULL';
      const uemail = r.userEmail ? escapeSqlString(r.userEmail) : 'NULL';
      const uname = r.userName ? escapeSqlString(r.userName) : 'NULL';
      const locId = escapeSqlString(r.locationId);
      const visited = r.visitedAt ? escapeSqlString(r.visitedAt) : 'NOW()';
      const rating = Number(r.rating) || 5;
      const expense = Number(r.actualExpense) || 0;
      const text = escapeSqlString(r.reviewText || '');
      const photos = escapeSqlString(JSON.stringify(r.capturedPhotos || [])) + '::jsonb';
      const weather = escapeSqlString(r.weather || '');
      const comp = escapeSqlString(r.companion || '');
      return `  (${id}, ${uid}, ${uemail}, ${uname}, ${locId}, ${visited}, ${rating}, ${expense}, ${text}, ${photos}, ${weather}, ${comp})`;
    });
    parts.push(revRows.join(',\n'));
    parts.push(`ON CONFLICT (id) DO UPDATE SET rating = EXCLUDED.rating, actual_expense = EXCLUDED.actual_expense, review_text = EXCLUDED.review_text, captured_photos = EXCLUDED.captured_photos;\n`);
  }

  // 5. Expenses
  if (expenses.length > 0) {
    parts.push(`-- 5. SỔ CHI TIÊU DU LỊCH (travel_expenses)`);
    parts.push(`INSERT INTO public.travel_expenses (id, user_id, user_email, user_name, trip_id, location_id, title, category, amount, payment_method, receipt_url, notes) VALUES`);
    const expRows = expenses.map((e) => {
      const id = escapeSqlString(e.id);
      const uid = e.userId ? escapeSqlString(e.userId) : 'NULL';
      const uemail = e.userEmail ? escapeSqlString(e.userEmail) : 'NULL';
      const uname = e.userName ? escapeSqlString(e.userName) : 'NULL';
      const tripId = e.tripId ? escapeSqlString(e.tripId) : 'NULL';
      const locId = e.locationId ? escapeSqlString(e.locationId) : 'NULL';
      const title = escapeSqlString(e.title || 'Chi phí');
      const cat = escapeSqlString(e.category || 'food');
      const amount = Number(e.amount) || 0;
      const method = escapeSqlString(e.paymentMethod || 'cash');
      const receipt = escapeSqlString(e.receiptUrl || '');
      const notes = escapeSqlString(e.notes || '');
      return `  (${id}, ${uid}, ${uemail}, ${uname}, ${tripId}, ${locId}, ${title}, ${cat}, ${amount}, ${method}, ${receipt}, ${notes})`;
    });
    parts.push(expRows.join(',\n'));
    parts.push(`ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, amount = EXCLUDED.amount, payment_method = EXCLUDED.payment_method, notes = EXCLUDED.notes;\n`);
  }

  // 6. Trips
  if (trips.length > 0) {
    parts.push(`-- 6. LỊCH TRÌNH CHUYẾN ĐI (travel_trips)`);
    parts.push(`INSERT INTO public.travel_trips (id, user_id, user_email, user_name, title, description, start_date, end_date, budget, cover_image, status, total_distance_km, total_expenses) VALUES`);
    const tripRows = trips.map((t) => {
      const id = escapeSqlString(t.id);
      const uid = t.userId ? escapeSqlString(t.userId) : 'NULL';
      const uemail = t.userEmail ? escapeSqlString(t.userEmail) : 'NULL';
      const uname = t.userName ? escapeSqlString(t.userName) : 'NULL';
      const title = escapeSqlString(t.title || 'Chuyến đi');
      const desc = escapeSqlString(t.description || '');
      const sdate = t.startDate ? escapeSqlString(t.startDate) : 'NULL';
      const edate = t.endDate ? escapeSqlString(t.endDate) : 'NULL';
      const budget = Number(t.budget) || 0;
      const cover = escapeSqlString(t.coverImage || '');
      const status = escapeSqlString(t.status || 'planning');
      const dist = Number(t.totalDistanceKm) || 0;
      const exp = Number(t.totalExpenses) || 0;
      return `  (${id}, ${uid}, ${uemail}, ${uname}, ${title}, ${desc}, ${sdate}, ${edate}, ${budget}, ${cover}, ${status}, ${dist}, ${exp})`;
    });
    parts.push(tripRows.join(',\n'));
    parts.push(`ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, budget = EXCLUDED.budget, cover_image = EXCLUDED.cover_image, status = EXCLUDED.status;\n`);
  }

  return parts.join('\n');
}

/**
 * Result of parsing JSON input (supports all formats)
 */
export interface ParsedJsonResult {
  places: TravelPlace[];
  cities: TravelCity[];
  reviews: TravelReviewLog[];
  expenses: TravelExpense[];
  trips: TravelTrip[];
  formatDetected: 'relational_database' | 'sql_view_array' | 'legacy_array' | 'custom_object';
  summary: {
    placesCount: number;
    citiesCount: number;
    reviewsCount: number;
    expensesCount: number;
    tripsCount: number;
  };
}

/**
 * Parses single item into a unified TravelPlace object with support for both
 * SQL snake_case columns and legacy camelCase fields
 */
function parseSinglePlaceItem(
  item: any,
  idx: number,
  cityMap: Map<string, string>,
  detailMap?: Map<string, any>
): TravelPlace {
  const id = String(item.id || `place-${Date.now()}-${idx}`);
  const name = String(item.name || 'Địa điểm');

  // Coords: support lat/lng directly (SQL) or coordinates { lat, lng } (UI)
  const rawLat = item.lat !== undefined ? item.lat : (item.coordinates?.lat !== undefined ? item.coordinates.lat : item.latitude);
  const rawLng = item.lng !== undefined ? item.lng : (item.coordinates?.lng !== undefined ? item.coordinates.lng : item.longitude);
  const parsedLat = Number(rawLat);
  const parsedLng = Number(rawLng);
  const lat = !isNaN(parsedLat) && parsedLat !== 0 ? parsedLat : 16.0544;
  const lng = !isNaN(parsedLng) && parsedLng !== 0 ? parsedLng : 108.2022;

  // City mapping
  const cityIdRaw = item.city_id || item.cityId || item.city || null;
  const cityId = cityIdRaw && String(cityIdRaw).trim() !== '' ? String(cityIdRaw).trim() : undefined;
  const cityName = item.city_name || item.cityName || (cityId ? cityMap.get(cityId) : '') || '';

  // Group mapping
  const group = normalizeServiceGroup(item.group_id || item.group || item.groupId);

  // Associated details (if relational JSON)
  const detail = detailMap?.get(id) || {};

  // Gallery URLs: support array or JSON string
  let galleryUrls: string[] = [];
  const rawGallery = item.gallery_urls ?? item.galleryUrls ?? detail.gallery_urls ?? detail.galleryUrls;
  if (Array.isArray(rawGallery)) {
    galleryUrls = rawGallery.map(String);
  } else if (typeof rawGallery === 'string' && rawGallery.trim()) {
    try {
      const parsed = JSON.parse(rawGallery);
      if (Array.isArray(parsed)) galleryUrls = parsed.map(String);
      else galleryUrls = [rawGallery];
    } catch {
      galleryUrls = [rawGallery];
    }
  }

  const rawRating = item.rating ?? detail.rating;
  const rating = rawRating !== undefined && !isNaN(Number(rawRating)) ? Number(rawRating) : 4.8;

  return {
    id,
    name,
    group,
    city_id: cityId,
    cityName,
    category: String(item.category || 'Địa điểm'),
    coordinates: { lat, lng },
    address: String(item.address || ''),
    phone: item.phone ? String(item.phone) : '',
    contact: item.contact ? String(item.contact) : '',
    checked: Boolean(item.checked),
    visitedAt: item.visited_at || item.visitedAt || (item.checked ? new Date().toISOString() : null),
    isFavorite: Boolean(item.is_favorite ?? item.isFavorite ?? false),
    isDeleted: Boolean(item.is_deleted ?? item.isDeleted ?? false),
    rating,
    priceRange: String(item.price_range || item.priceRange || detail.price_range || detail.priceRange || ''),
    openingHours: String(item.opening_hours || item.openingHours || detail.opening_hours || detail.openingHours || ''),
    bestTimeToVisit: String(item.best_time_to_visit || item.bestTimeToVisit || detail.best_time_to_visit || detail.bestTimeToVisit || ''),
    notes: String(item.notes || detail.notes || ''),
    travelTips: String(item.travel_tips || item.travelTips || detail.travel_tips || detail.travelTips || ''),
    specialties: String(item.specialties || detail.specialties || ''),
    thumbnailUrl: String(item.thumbnail_url || item.thumbnailUrl || detail.thumbnail_url || detail.thumbnailUrl || ''),
    galleryUrls,
    website: String(item.website_url || item.website || detail.website_url || detail.website || ''),
    distanceKm: Number(item.distance_km || item.distanceKm || 0),
    reviewsCount: Number(item.reviews_count || item.reviewsCount || 0),
    created_at: item.created_at || detail.created_at || new Date().toISOString(),
    updated_at: item.updated_at || detail.updated_at || new Date().toISOString(),
  };
}

/**
 * Intelligent JSON Parser that understands:
 *  1. Relational Database Backup with tables: travel_locations + travel_location_details, cities, reviews, expenses, trips
 *  2. Flat Unified Array with SQL columns (travel_places_view style)
 *  3. Flat Unified Array with UI camelCase columns
 *  4. Package object with places, cities, reviews, expenses, trips
 */
export function parseSynchronizedJson(
  rawJson: string,
  existingCities: TravelCity[] = DEFAULT_CITIES
): ParsedJsonResult {
  const parsed = JSON.parse(rawJson);

  // Setup city map
  const cityMap = new Map<string, string>();
  DEFAULT_CITIES.forEach((c) => cityMap.set(c.id, c.name));
  existingCities.forEach((c) => cityMap.set(c.id, c.name));

  let extractedPlaces: TravelPlace[] = [];
  let extractedCities: TravelCity[] = [];
  let extractedReviews: TravelReviewLog[] = [];
  let extractedExpenses: TravelExpense[] = [];
  let extractedTrips: TravelTrip[] = [];
  let formatDetected: ParsedJsonResult['formatDetected'] = 'legacy_array';

  // Case 1: Relational Database format with tables object
  const tables = parsed.tables || parsed;
  const hasRelationalLocations = Array.isArray(tables.travel_locations) || Array.isArray(tables.locations);
  const hasRelationalDetails = Array.isArray(tables.travel_location_details) || Array.isArray(tables.location_details);

  if (hasRelationalLocations) {
    formatDetected = 'relational_database';
    const rawLocations = tables.travel_locations || tables.locations || [];
    const rawDetails = tables.travel_location_details || tables.location_details || [];

    // Build details lookup map
    const detailMap = new Map<string, any>();
    rawDetails.forEach((d: any) => {
      const locId = String(d.location_id || d.locationId || d.id || '');
      if (locId) detailMap.set(locId, d);
    });

    // Extract cities if present
    const rawCities = tables.travel_cities || tables.cities || [];
    if (Array.isArray(rawCities)) {
      extractedCities = rawCities.map((c: any) => ({
        id: String(c.id),
        name: String(c.name || 'Tỉnh / Thành'),
        code: c.code ? String(c.code) : '',
        lat: Number(c.lat) || 16.0544,
        lng: Number(c.lng) || 108.2022,
        sort_order: Number(c.sort_order || 99),
      }));
      extractedCities.forEach((c) => cityMap.set(c.id, c.name));
    }

    // Assemble places
    extractedPlaces = rawLocations.map((loc: any, idx: number) =>
      parseSinglePlaceItem(loc, idx, cityMap, detailMap)
    );

    // Extract reviews if present
    const rawReviews = tables.travel_reviews_logs || tables.reviews || [];
    if (Array.isArray(rawReviews)) {
      extractedReviews = rawReviews.map((r: any, idx: number) => ({
        id: String(r.id || `rev-${Date.now()}-${idx}`),
        userId: r.user_id || r.userId || undefined,
        userEmail: r.user_email || r.userEmail || undefined,
        userName: r.user_name || r.userName || undefined,
        locationId: String(r.location_id || r.locationId || ''),
        visitedAt: String(r.visited_at || r.visitedAt || new Date().toISOString()),
        rating: Number(r.rating) || 5,
        actualExpense: Number(r.actual_expense || r.actualExpense) || 0,
        reviewText: String(r.review_text || r.reviewText || ''),
        capturedPhotos: Array.isArray(r.captured_photos)
          ? r.captured_photos
          : Array.isArray(r.capturedPhotos)
          ? r.capturedPhotos
          : [],
        weather: r.weather ? String(r.weather) : '',
        companion: r.companion ? String(r.companion) : '',
        createdAt: String(r.created_at || r.createdAt || new Date().toISOString()),
      }));
    }

    // Extract expenses if present
    const rawExpenses = tables.travel_expenses || tables.expenses || [];
    if (Array.isArray(rawExpenses)) {
      extractedExpenses = rawExpenses.map((e: any, idx: number) => ({
        id: String(e.id || `exp-${Date.now()}-${idx}`),
        userId: e.user_id || e.userId || undefined,
        userEmail: e.user_email || e.userEmail || undefined,
        userName: e.user_name || e.userName || undefined,
        tripId: e.trip_id || e.tripId || undefined,
        locationId: e.location_id || e.locationId || undefined,
        title: String(e.title || 'Chi phí'),
        category: (e.category || 'food') as any,
        amount: Number(e.amount) || 0,
        paymentMethod: (e.payment_method || e.paymentMethod || 'cash') as any,
        receiptUrl: e.receipt_url || e.receiptUrl || undefined,
        notes: e.notes ? String(e.notes) : undefined,
        createdAt: String(e.created_at || e.createdAt || new Date().toISOString()),
      }));
    }

    // Extract trips if present
    const rawTrips = tables.travel_trips || tables.trips || [];
    if (Array.isArray(rawTrips)) {
      extractedTrips = rawTrips.map((t: any, idx: number) => ({
        id: String(t.id || `trip-${Date.now()}-${idx}`),
        userId: t.user_id || t.userId || undefined,
        userEmail: t.user_email || t.userEmail || undefined,
        userName: t.user_name || t.userName || undefined,
        title: String(t.title || 'Chuyến đi'),
        description: t.description ? String(t.description) : undefined,
        startDate: t.start_date || t.startDate || undefined,
        endDate: t.end_date || t.endDate || undefined,
        budget: Number(t.budget) || 0,
        coverImage: t.cover_image || t.coverImage || undefined,
        status: (t.status || 'planning') as any,
        totalDistanceKm: Number(t.total_distance_km || t.totalDistanceKm) || 0,
        totalExpenses: Number(t.total_expenses || t.totalExpenses) || 0,
        createdAt: String(t.created_at || t.createdAt || new Date().toISOString()),
        updatedAt: String(t.updated_at || t.updatedAt || new Date().toISOString()),
      }));
    }
  }
  // Case 2: Package object with `places` array
  else if (!Array.isArray(parsed) && Array.isArray(parsed.places)) {
    formatDetected = 'custom_object';

    // Extract cities if present
    if (Array.isArray(parsed.cities)) {
      extractedCities = parsed.cities.map((c: any) => ({
        id: String(c.id),
        name: String(c.name || 'Tỉnh / Thành'),
        code: c.code ? String(c.code) : '',
        lat: Number(c.lat) || 16.0544,
        lng: Number(c.lng) || 108.2022,
        sort_order: Number(c.sort_order || 99),
      }));
      extractedCities.forEach((c) => cityMap.set(c.id, c.name));
    }

    extractedPlaces = parsed.places.map((p: any, idx: number) =>
      parseSinglePlaceItem(p, idx, cityMap)
    );

    if (Array.isArray(parsed.reviews)) {
      extractedReviews = parsed.reviews;
    }
    if (Array.isArray(parsed.expenses)) {
      extractedExpenses = parsed.expenses;
    }
    if (Array.isArray(parsed.trips)) {
      extractedTrips = parsed.trips;
    }
  }
  // Case 3: Flat array of places [...]
  else if (Array.isArray(parsed)) {
    // Check if it's SQL View format (has group_id or city_id or price_range)
    const isSqlView = parsed.some((p: any) => p && (p.group_id !== undefined || p.city_id !== undefined || p.price_range !== undefined));
    formatDetected = isSqlView ? 'sql_view_array' : 'legacy_array';

    extractedPlaces = parsed.map((item: any, idx: number) =>
      parseSinglePlaceItem(item, idx, cityMap)
    );
  } else {
    throw new Error('Định dạng JSON không được hỗ trợ. Vui lòng cung cấp mảng danh sách [ ... ] hoặc tệp sao lưu CSDL { tables: ... }');
  }

  return {
    places: extractedPlaces,
    cities: extractedCities,
    reviews: extractedReviews,
    expenses: extractedExpenses,
    trips: extractedTrips,
    formatDetected,
    summary: {
      placesCount: extractedPlaces.length,
      citiesCount: extractedCities.length,
      reviewsCount: extractedReviews.length,
      expensesCount: extractedExpenses.length,
      tripsCount: extractedTrips.length,
    },
  };
}
