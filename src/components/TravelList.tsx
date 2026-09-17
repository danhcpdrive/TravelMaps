import React, { useMemo } from 'react';
import { TravelPlace, FilterOptions, ServiceGroupInfo, TravelCity } from '../types';
import { SERVICE_GROUPS, SERVICE_GROUPS_MAP, DISTANCE_FILTER_OPTIONS } from '../lib/geoUtils';
import {
  Search,
  CheckCircle2,
  Circle,
  MapPin,
  Navigation,
  Compass,
  Heart,
  Star,
  Coins,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Building2,
  Database,
} from 'lucide-react';

interface TravelListProps {
  places: TravelPlace[];
  allPlaces?: TravelPlace[];
  selectedPlace: TravelPlace | null;
  filters: FilterOptions;
  groups?: ServiceGroupInfo[];
  cities?: TravelCity[];
  userLocation?: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onSelectPlace: (place: TravelPlace) => void;
  onToggleChecked: (id: string, currentChecked: boolean) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  onOpenDetailModal: (place: TravelPlace) => void;
  onEditPlace: (place: TravelPlace) => void;
  onDeletePlace: (id: string) => void;
}

export const TravelList: React.FC<TravelListProps> = ({
  places,
  allPlaces,
  selectedPlace,
  filters,
  groups,
  cities,
  userLocation,
  onRequestLocation,
  onFilterChange,
  onSelectPlace,
  onToggleChecked,
  onToggleFavorite,
  onOpenDetailModal,
}) => {
  const activeGroups = groups && groups.length > 0 ? groups : SERVICE_GROUPS;
  const countSource = allPlaces && allPlaces.length > 0 ? allPlaces : places;

  // Derive activeCities strictly from DB data (travel_cities table or locations in DB)
  const activeCities = useMemo(() => {
    if (cities && cities.length > 0) return cities;
    const cityMap = new Map<string, TravelCity>();
    countSource.forEach((p) => {
      if (p.city_id || p.cityName) {
        const id = p.city_id || p.cityName.toLowerCase().replace(/\s+/g, '_');
        if (!cityMap.has(id)) {
          cityMap.set(id, {
            id,
            name: p.cityName || p.city_id || id,
            sort_order: 0,
          });
        }
      }
    });
    return Array.from(cityMap.values());
  }, [cities, countSource]);

  // Places filtered by all active criteria EXCEPT group (used to calculate Service Group badge counts dynamically)
  const nonGroupFilteredPlaces = useMemo(() => {
    let result = [...countSource];

    // City filter
    if (filters.cityId && filters.cityId !== 'all') {
      result = result.filter(
        (p) =>
          p.city_id === filters.cityId ||
          (p.cityName && p.cityName.toLowerCase().includes(filters.cityId.toLowerCase()))
      );
    }

    // Max Distance Filter
    if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && typeof filters.maxDistanceKm === 'number') {
      const maxRadius = filters.maxDistanceKm;
      result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadius);
    }

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
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

    return result;
  }, [countSource, filters.cityId, filters.maxDistanceKm, filters.searchQuery, filters.status]);

  // Places filtered by all active criteria EXCEPT cityId (used to calculate City dropdown counts dynamically)
  const nonCityFilteredPlaces = useMemo(() => {
    let result = [...countSource];

    // Group filter
    if (filters.group && filters.group !== 'all') {
      result = result.filter((p) => p.group === filters.group);
    }

    // Max Distance Filter
    if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && typeof filters.maxDistanceKm === 'number') {
      const maxRadius = filters.maxDistanceKm;
      result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadius);
    }

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim()) {
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

    return result;
  }, [countSource, filters.group, filters.maxDistanceKm, filters.searchQuery, filters.status]);

  const getGroupInfo = (groupId: string) => {
    const found = activeGroups.find((g) => g.id === groupId);
    if (found) {
      return {
        label: found.label,
        icon: found.icon,
        badgeBg: found.badgeBg,
      };
    }
    const fallback = (SERVICE_GROUPS_MAP as any)[groupId] || SERVICE_GROUPS_MAP.du_lich;
    return {
      label: fallback.label,
      icon: fallback.icon || '📍',
      badgeBg: fallback.badgeBg,
    };
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-900 shadow-xs">
      
      {/* 1. Service Group Filter: Dạng Tag Wrap thuần túy (Không dùng dropdown, không bị cuộn che mất) */}
      <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Phân nhóm dịch vụ
          </span>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            {filters.group === 'all'
              ? `Tất cả (${places.length})`
              : `${activeGroups.find((g) => g.id === filters.group)?.label || 'Đã chọn'} (${places.length})`}
          </span>
        </div>

        {/* Dạng Tags Wrap: flex-wrap tự động xuống dòng, không cuộn ngang, nhìn thấy 100% các nhóm */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange({ group: 'all' })}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
              filters.group === 'all'
                ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-500/25'
                : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
            }`}
          >
            <span>🌟 Tất cả</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filters.group === 'all' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {nonGroupFilteredPlaces.length}
            </span>
          </button>

          {activeGroups.map((grp) => {
            const isSelected = filters.group === grp.id;
            const count = nonGroupFilteredPlaces.filter((p) => p.group === grp.id).length;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => onFilterChange({ group: grp.id })}
                title={grp.description || grp.label}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                  isSelected
                    ? `${grp.badgeBg} ring-2 ring-current/30 border-current font-black`
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
                }`}
              >
                <span>{grp.icon}</span>
                <span>{grp.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/10 text-current' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. City Filter (Dropdown) */}
      <div className="px-2.5 sm:px-3 py-2 bg-slate-100/80 border-b border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="city-filter-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-600" /> Thành phố
          </label>
          {filters.cityId && filters.cityId !== 'all' && (
            <button
              type="button"
              onClick={() => onFilterChange({ cityId: 'all' })}
              className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer"
            >
              Xóa lọc thành phố
            </button>
          )}
        </div>

        {activeCities.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic flex items-center gap-1 py-1">
            <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Chưa có dữ liệu thành phố trong Database (vui lòng chạy <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">sqlsample.sql</code> trong Supabase SQL Editor)</span>
          </div>
        ) : (
          <div className="relative">
            <select
              id="city-filter-select"
              value={filters.cityId || 'all'}
              onChange={(e) => onFilterChange({ cityId: e.target.value })}
              className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">🏙️ Tất cả thành phố ({nonCityFilteredPlaces.length})</option>
              {activeCities.map((city) => {
                const cityCount = nonCityFilteredPlaces.filter(
                  (p) => p.city_id === city.id || (p.cityName && p.cityName.toLowerCase().includes(city.id.toLowerCase()))
                ).length;
                return (
                  <option key={city.id} value={city.id}>
                    🏙️ {city.name} ({cityCount})
                  </option>
                );
              })}
            </select>
            <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 3. Search & Secondary Filters Bar */}
      <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
        
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên địa điểm, đặc sản, địa chỉ..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        {/* Filter Controls Row (Distance Radius, Status, Sort) */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Max Distance Radius Filter (5km, 10km, 15km...) */}
          <select
            value={filters.maxDistanceKm || 'all'}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              onFilterChange({ maxDistanceKm: val });
            }}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            {DISTANCE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                📐 {opt.label}
              </option>
            ))}
          </select>

          {/* Status Filter (Visited / Unvisited / Favorite) */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as any })}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="visited">Đã đến</option>
            <option value="unvisited">Chưa đến</option>
            <option value="favorite">❤️ Yêu thích</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
          >
            <option value="rating">⭐ Đánh giá</option>
            <option value="distance">📍 Gần tôi nhất</option>
            <option value="name">🔤 Tên A-Z</option>
            <option value="group">🏷️ Theo nhóm</option>
            <option value="visited">🕒 Đến gần đây</option>
          </select>
        </div>

        {/* GPS location status / request banner if distance filter is selected */}
        {filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && !userLocation && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between gap-2">
            <span>📍 Chưa bật GPS để lọc bán kính {filters.maxDistanceKm}km</span>
            {onRequestLocation && (
              <button
                type="button"
                onClick={onRequestLocation}
                className="px-2 py-0.5 bg-amber-600 text-white rounded-md font-bold text-[10px] hover:bg-amber-700 transition shrink-0 cursor-pointer"
              >
                Bật GPS ngay
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Places List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pb-24 md:pb-6">
        {places.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Không tìm thấy địa điểm nào phù hợp.</p>
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '', group: 'all', status: 'all' })}
              className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const groupMeta = getGroupInfo(place.group);

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className={`p-3 transition cursor-pointer relative group flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-teal-50/70 border-l-4 border-l-teal-600'
                    : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Thumbnail Image (if available) */}
                {place.thumbnailUrl ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
                    <img
                      src={place.thumbnailUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}

                {/* Place Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  
                  {/* Badges & Rating */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${groupMeta.badgeBg}`}>
                      {groupMeta.icon} {groupMeta.label}
                    </span>
                    {place.rating && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        {place.rating}
                      </span>
                    )}
                  </div>

                  {/* Place Name */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug truncate">
                    {place.name}
                  </h3>

                  {/* Specialties snippet if available */}
                  {place.specialties && (
                    <p className="text-[10px] text-amber-800 font-medium truncate flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      <span className="truncate">{place.specialties}</span>
                    </p>
                  )}

                  {/* Address */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{place.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>

                  {/* Price & Hours row */}
                  {(place.priceRange || place.openingHours) && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 flex-wrap">
                      {place.priceRange && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                          <Coins className="w-2.5 h-2.5" />
                          {place.priceRange}
                        </span>
                      )}
                      {place.openingHours && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {place.openingHours}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Distance & Directions button */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {place.distanceKm !== undefined && place.distanceKm > 0 ? (
                      <p className="text-[10px] text-blue-800 font-bold flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-blue-600" />
                        Cách bạn: {place.distanceKm} km
                      </p>
                    ) : (
                      <span />
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs shrink-0"
                      title="Chỉ đường trên Google Maps"
                    >
                      <Navigation className="w-2.5 h-2.5 text-white" />
                      <span>Chỉ đường</span>
                    </a>
                  </div>
                </div>

                {/* Right Action Icons (Favorite, Check-in, View Detail) */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 space-y-1">
                  
                  {/* Favorite Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(place.id, !!place.isFavorite);
                    }}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      place.isFavorite
                        ? 'text-rose-500 hover:text-rose-600 bg-rose-50'
                        : 'text-slate-300 hover:text-rose-400'
                    }`}
                    title={place.isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <Heart className={`w-4 h-4 ${place.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Check-in / Visited Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleChecked(place.id, place.checked);
                    }}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      place.checked
                        ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                        : 'text-slate-300 hover:text-teal-600'
                    }`}
                    title={place.checked ? 'Đã check-in ghé thăm' : 'Bấm để đánh dấu đã ghé thăm'}
                  >
                    {place.checked ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  {/* Open Detail View */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailModal(place);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Xem chi tiết địa điểm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export { TravelList as PlaceList };
