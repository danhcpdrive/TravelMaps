import {
  TravelPlace,
  TravelCity,
  ServiceGroupInfo,
  ServiceGroup,
  TravelReviewLog,
  TravelExpense,
  TravelTrip,
} from '../types';
import { normalizeServiceGroup } from './supabase';
import { DEFAULT_CITIES } from './geoUtils';

export interface ParsedSqlResult {
  places: TravelPlace[];
  cities: TravelCity[];
  groups: ServiceGroupInfo[];
  reviews: TravelReviewLog[];
  expenses: TravelExpense[];
  trips: TravelTrip[];
  summary: {
    locationsCount: number;
    detailsCount: number;
    citiesCount: number;
    groupsCount: number;
    reviewsCount: number;
    expensesCount: number;
    tripsCount: number;
    totalPlacesAssembled: number;
  };
}

/**
 * Strips SQL single-line and multi-line comments safely without breaking strings.
 */
export function stripSqlComments(sql: string): string {
  let result = '';
  let i = 0;
  const len = sql.length;
  let inString = false;

  while (i < len) {
    const char = sql[i];
    const nextChar = i + 1 < len ? sql[i + 1] : '';

    if (inString) {
      result += char;
      if (char === "'") {
        if (nextChar === "'") {
          result += nextChar;
          i += 2;
          continue;
        } else {
          inString = false;
        }
      }
      i++;
    } else {
      if (char === "'") {
        inString = true;
        result += char;
        i++;
      } else if (char === '-' && nextChar === '-') {
        // Line comment: skip to \n
        i += 2;
        while (i < len && sql[i] !== '\n') {
          i++;
        }
        if (i < len && sql[i] === '\n') {
          result += '\n';
          i++;
        }
      } else if (char === '/' && nextChar === '*') {
        // Block comment: skip to */
        i += 2;
        while (i < len && !(sql[i] === '*' && i + 1 < len && sql[i + 1] === '/')) {
          i++;
        }
        i += 2;
      } else {
        result += char;
        i++;
      }
    }
  }
  return result;
}

/**
 * Splits comma-separated values inside an SQL row tuple e.g. ('val1', 123, NULL, true)
 */
function splitTupleValues(tupleStr: string): string[] {
  const values: string[] = [];
  let current = '';
  let inString = false;
  let bracketDepth = 0;

  for (let i = 0; i < tupleStr.length; i++) {
    const char = tupleStr[i];
    const nextChar = i + 1 < tupleStr.length ? tupleStr[i + 1] : '';

    if (inString) {
      current += char;
      if (char === "'") {
        if (nextChar === "'") {
          current += nextChar;
          i++;
        } else {
          inString = false;
        }
      }
    } else {
      if (char === "'") {
        inString = true;
        current += char;
      } else if (char === '[' || char === '{') {
        bracketDepth++;
        current += char;
      } else if (char === ']' || char === '}') {
        bracketDepth = Math.max(0, bracketDepth - 1);
        current += char;
      } else if (char === ',' && bracketDepth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  if (current.trim().length > 0) {
    values.push(current.trim());
  }
  return values;
}

/**
 * Parses individual SQL token into JS types (string, number, boolean, null, json).
 */
function parseSqlToken(token: string): any {
  token = token.trim();
  // Strip Postgres type casts like ::jsonb, ::text, etc.
  token = token.replace(/::[a-zA-Z0-9_]+$/i, '').trim();

  if (/^null$/i.test(token)) return null;
  if (/^true$/i.test(token)) return true;
  if (/^false$/i.test(token)) return false;

  // Postgres ARRAY['val1', 'val2'] or to_jsonb(ARRAY[...])
  if (/^(?:TO_JSONB\s*\(\s*)?ARRAY\s*\[([\s\S]*)\](?:\s*\))?$/i.test(token)) {
    const arrayBodyMatch = token.match(/^(?:TO_JSONB\s*\(\s*)?ARRAY\s*\[([\s\S]*)\](?:\s*\))?$/i);
    if (arrayBodyMatch) {
      const items = splitTupleValues(arrayBodyMatch[1]);
      return items.map(parseSqlToken);
    }
  }

  // Single quoted string
  if (token.startsWith("'") && token.endsWith("'") && token.length >= 2) {
    const unquoted = token.slice(1, -1).replace(/''/g, "'");
    // Attempt parsing JSON string if it looks like array or object
    if ((unquoted.startsWith('[') && unquoted.endsWith(']')) ||
        (unquoted.startsWith('{') && unquoted.endsWith('}'))) {
      try {
        return JSON.parse(unquoted);
      } catch {
        // Ignore and keep as string
      }
    }
    return unquoted;
  }

  // Number
  if (/^-?[0-9]+(\.[0-9]+)?$/.test(token)) {
    return Number(token);
  }

  return token;
}

/**
 * Main parser: Extracts data from INSERT INTO statements in SQL backup or sample files.
 */
export function parseSqlScript(rawSql: string): ParsedSqlResult {
  const cleanSql = stripSqlComments(rawSql);

  const rawLocations: any[] = [];
  const rawDetails: any[] = [];
  const rawCities: any[] = [];
  const rawGroups: any[] = [];
  const rawReviews: any[] = [];
  const rawExpenses: any[] = [];
  const rawTrips: any[] = [];

  // Regex to identify start of INSERT INTO table (columns) VALUES
  const insertRegex = /INSERT\s+INTO\s+(?:public\.)?([a-zA-Z0-9_"`]+)\s*(?:\(([\s\S]*?)\))?\s*VALUES/gi;

  let match: RegExpExecArray | null;
  while ((match = insertRegex.exec(cleanSql)) !== null) {
    const rawTableName = match[1];
    const tableName = rawTableName.replace(/["`]/g, '').split('.').pop()?.toLowerCase() || '';
    const rawCols = match[2] || '';
    const columns = rawCols
      .split(',')
      .map((c) => c.trim().replace(/["`]/g, '').toLowerCase())
      .filter(Boolean);

    // Read the VALUES clause following this match
    let cursor = match.index + match[0].length;
    const len = cleanSql.length;

    // Scan tuples until statement terminator ';' or next command keyword
    while (cursor < len) {
      // Skip whitespace & commas between tuples
      while (cursor < len && /[\s,]/.test(cleanSql[cursor])) {
        cursor++;
      }

      if (cursor >= len) break;

      const char = cleanSql[cursor];
      if (char === ';') {
        cursor++;
        break; // End of INSERT statement
      }

      // Check if another SQL keyword begins (e.g. ON CONFLICT, INSERT, CREATE, etc.)
      const remainingChunk = cleanSql.slice(cursor, cursor + 20).toUpperCase();
      if (
        remainingChunk.startsWith('INSERT ') ||
        remainingChunk.startsWith('CREATE ') ||
        remainingChunk.startsWith('ALTER ') ||
        remainingChunk.startsWith('DROP ') ||
        remainingChunk.startsWith('DELETE ') ||
        remainingChunk.startsWith('UPDATE ')
      ) {
        break;
      }

      if (remainingChunk.startsWith('ON CONFLICT') || remainingChunk.startsWith('ON DUPLICATE')) {
        // Skip until ';'
        while (cursor < len && cleanSql[cursor] !== ';') {
          cursor++;
        }
        if (cursor < len && cleanSql[cursor] === ';') cursor++;
        break;
      }

      // We expect '(' starting a tuple
      if (char === '(') {
        // Scan until matching ')'
        let inString = false;
        let depth = 0;
        const startTuple = cursor + 1;
        let endTuple = -1;

        while (cursor < len) {
          const c = cleanSql[cursor];
          const nextC = cursor + 1 < len ? cleanSql[cursor + 1] : '';

          if (inString) {
            if (c === "'") {
              if (nextC === "'") {
                cursor += 2;
                continue;
              } else {
                inString = false;
              }
            }
            cursor++;
          } else {
            if (c === "'") {
              inString = true;
              cursor++;
            } else if (c === '(') {
              depth++;
              cursor++;
            } else if (c === ')') {
              depth--;
              if (depth === 0) {
                endTuple = cursor;
                cursor++;
                break;
              }
              cursor++;
            } else {
              cursor++;
            }
          }
        }

        if (endTuple !== -1) {
          const tupleBody = cleanSql.slice(startTuple, endTuple);
          const rawValues = splitTupleValues(tupleBody);
          const parsedValues = rawValues.map(parseSqlToken);

          // Build row record
          const row: Record<string, any> = {};
          columns.forEach((col, idx) => {
            row[col] = parsedValues[idx];
          });

          // Route row to appropriate table
          if (tableName === 'travel_locations') {
            rawLocations.push(row);
          } else if (tableName === 'travel_location_details') {
            rawDetails.push(row);
          } else if (tableName === 'travel_cities') {
            rawCities.push(row);
          } else if (tableName === 'travel_groups') {
            rawGroups.push(row);
          } else if (tableName === 'travel_reviews_logs') {
            rawReviews.push(row);
          } else if (tableName === 'travel_expenses') {
            rawExpenses.push(row);
          } else if (tableName === 'travel_trips') {
            rawTrips.push(row);
          }
        }
      } else {
        cursor++;
      }
    }
  }

  // 1. Process Cities
  const parsedCities: TravelCity[] = rawCities.map((c, idx) => ({
    id: String(c.id || `city-${idx}`),
    name: String(c.name || 'Tỉnh / Thành phố'),
    code: c.code ? String(c.code) : '',
    lat: Number(c.lat) || 16.05441235,
    lng: Number(c.lng) || 108.20223841,
    sort_order: Number(c.sort_order ?? c.sortorder ?? idx + 1),
  }));

  // Merge with DEFAULT_CITIES so all standard cities exist
  const cityMapById = new Map<string, TravelCity>();
  DEFAULT_CITIES.forEach((c) => cityMapById.set(c.id, c));
  parsedCities.forEach((c) => cityMapById.set(c.id, c));
  const cities: TravelCity[] = Array.from(cityMapById.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
  );

  const cityMap = new Map<string, string>();
  cities.forEach((c) => cityMap.set(c.id, c.name));

  // 2. Process Groups
  const groups: ServiceGroupInfo[] = rawGroups.map((g) => ({
    id: normalizeServiceGroup(g.id),
    label: String(g.name || g.label || g.id),
    icon: String(g.icon || '📍'),
    badgeBg: String(g.badge_bg || g.badgebg || 'bg-slate-100 text-slate-800 border-slate-300'),
    markerColor: String(g.marker_color || g.markercolor || '#0d9488'),
    description: g.description ? String(g.description) : '',
  }));

  // 3. Process Details Map (key: location_id)
  const detailByLocationId = new Map<string, any>();
  rawDetails.forEach((d) => {
    const locId = String(d.location_id || d.locationid || d.id);
    if (locId) {
      detailByLocationId.set(locId, d);
    }
  });

  // 4. Assemble Travel Places (combining locations + details)
  const places: TravelPlace[] = rawLocations.map((loc, idx) => {
    const id = String(loc.id || `place-sql-${Date.now()}-${idx}`);
    const detail = detailByLocationId.get(id) || {};

    const rawLat = loc.lat ?? loc.latitude;
    const rawLng = loc.lng ?? loc.longitude;
    const lat = Number(rawLat) || 16.05441235;
    const lng = Number(rawLng) || 108.20223841;

    const cityId = loc.city_id || loc.cityid || '';
    const cityName = cityMap.get(cityId) || loc.city_name || loc.cityname || '';

    // Handle gallery URLs safely
    let galleryUrls: string[] = [];
    const rawGallery = detail.gallery_urls ?? detail.galleryurls ?? loc.gallery_urls ?? loc.galleryUrls;
    if (Array.isArray(rawGallery)) {
      galleryUrls = rawGallery.map(String);
    } else if (typeof rawGallery === 'string' && rawGallery.trim()) {
      try {
        const parsed = JSON.parse(rawGallery);
        if (Array.isArray(parsed)) galleryUrls = parsed.map(String);
      } catch {
        galleryUrls = [rawGallery];
      }
    }

    return {
      id,
      name: String(loc.name || 'Địa điểm chưa tên'),
      group: normalizeServiceGroup(loc.group_id || loc.group),
      city_id: cityId,
      cityName,
      category: String(loc.category || 'Địa điểm tham quan'),
      coordinates: { lat, lng },
      address: String(loc.address || ''),
      phone: loc.phone ? String(loc.phone) : '',
      contact: loc.contact ? String(loc.contact) : '',
      checked: Boolean(loc.checked),
      isFavorite: Boolean(loc.is_favorite ?? loc.isfavorite ?? false),
      isDeleted: Boolean(loc.is_deleted ?? loc.isdeleted ?? false),
      visitedAt: loc.visited_at || loc.visitedat || (loc.checked ? new Date().toISOString() : null),

      // Detailed info
      rating: detail.rating !== undefined ? Number(detail.rating) : (loc.rating ? Number(loc.rating) : 4.8),
      priceRange: String(detail.price_range || detail.pricerange || loc.price_range || loc.priceRange || ''),
      openingHours: String(detail.opening_hours || detail.openinghours || loc.opening_hours || loc.openingHours || ''),
      bestTimeToVisit: String(detail.best_time_to_visit || detail.besttimetovisit || loc.best_time_to_visit || ''),
      notes: String(detail.notes || loc.notes || ''),
      travelTips: String(detail.travel_tips || detail.traveltips || loc.travel_tips || ''),
      specialties: String(detail.specialties || loc.specialties || ''),
      thumbnailUrl: String(detail.thumbnail_url || detail.thumbnailurl || loc.thumbnail_url || loc.thumbnailUrl || ''),
      galleryUrls,
      website: String(detail.website_url || detail.websiteurl || loc.website_url || loc.website || ''),
    };
  });

  // 5. Process Reviews
  const reviews: TravelReviewLog[] = rawReviews.map((r, idx) => ({
    id: String(r.id || `rev-${Date.now()}-${idx}`),
    userId: r.user_id ? String(r.user_id) : undefined,
    userEmail: r.user_email ? String(r.user_email) : undefined,
    userName: r.user_name ? String(r.user_name) : undefined,
    locationId: String(r.location_id || r.locationid || ''),
    visitedAt: String(r.visited_at || r.visitedat || new Date().toISOString()),
    rating: Number(r.rating) || 5,
    actualExpense: Number(r.actual_expense || r.actualexpense) || 0,
    reviewText: String(r.review_text || r.reviewtext || ''),
    capturedPhotos: Array.isArray(r.captured_photos)
      ? r.captured_photos
      : typeof r.captured_photos === 'string'
      ? (() => {
          try {
            return JSON.parse(r.captured_photos);
          } catch {
            return [];
          }
        })()
      : [],
    weather: r.weather ? String(r.weather) : '',
    companion: r.companion ? String(r.companion) : '',
    createdAt: String(r.created_at || new Date().toISOString()),
  }));

  // 6. Process Expenses
  const expenses: TravelExpense[] = rawExpenses.map((e, idx) => ({
    id: String(e.id || `exp-${Date.now()}-${idx}`),
    userId: e.user_id ? String(e.user_id) : undefined,
    userEmail: e.user_email ? String(e.user_email) : undefined,
    userName: e.user_name ? String(e.user_name) : undefined,
    tripId: e.trip_id ? String(e.trip_id) : undefined,
    locationId: e.location_id ? String(e.location_id) : undefined,
    title: String(e.title || 'Chi tiêu'),
    category: (e.category as any) || 'food',
    amount: Number(e.amount) || 0,
    paymentMethod: e.payment_method || e.paymentmethod || 'cash',
    receiptUrl: e.receipt_url ? String(e.receipt_url) : undefined,
    notes: e.notes ? String(e.notes) : undefined,
    createdAt: String(e.created_at || new Date().toISOString()),
  }));

  // 7. Process Trips
  const trips: TravelTrip[] = rawTrips.map((t, idx) => ({
    id: String(t.id || `trip-${Date.now()}-${idx}`),
    userId: t.user_id ? String(t.user_id) : undefined,
    userEmail: t.user_email ? String(t.user_email) : undefined,
    userName: t.user_name ? String(t.user_name) : undefined,
    title: String(t.title || 'Chuyến đi'),
    description: t.description ? String(t.description) : '',
    startDate: t.start_date ? String(t.start_date) : undefined,
    endDate: t.end_date ? String(t.end_date) : undefined,
    budget: Number(t.budget) || 0,
    coverImage: t.cover_image ? String(t.cover_image) : undefined,
    status: (t.status as any) || 'planning',
    createdAt: String(t.created_at || new Date().toISOString()),
    updatedAt: String(t.updated_at || new Date().toISOString()),
  }));

  return {
    places,
    cities,
    groups,
    reviews,
    expenses,
    trips,
    summary: {
      locationsCount: rawLocations.length,
      detailsCount: rawDetails.length,
      citiesCount: cities.length,
      groupsCount: groups.length,
      reviewsCount: reviews.length,
      expensesCount: expenses.length,
      tripsCount: trips.length,
      totalPlacesAssembled: places.length,
    },
  };
}
