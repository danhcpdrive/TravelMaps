import React, { useMemo, useState, useRef } from 'react';
import { TravelPlace, FilterOptions, ServiceGroupInfo, TravelCity } from '../types';
import { SERVICE_GROUPS, SERVICE_GROUPS_MAP, DISTANCE_FILTER_OPTIONS } from '../lib/geoUtils';
import { PlaceSvgThumbnail } from './PlaceSvgThumbnail';
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
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Building2,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  RotateCcw,
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
  onToggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
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
  onToggleSidebarCollapse,
  isSidebarCollapsed,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  const activeGroups = groups && groups.length > 0 ? groups : SERVICE_GROUPS;
  const countSource = allPlaces && allPlaces.length > 0 ? allPlaces : places;

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.group && filters.group !== 'all') count++;
    if (filters.cityId && filters.cityId !== 'all') count++;
    if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.searchQuery && filters.searchQuery.trim() !== '') count++;
    return count;
  }, [filters]);

  // Derive activeCities strictly from DB data and sort alphabetically A-Z
  const activeCities = useMemo(() => {
    let list: TravelCity[] = [];
    if (cities && cities.length > 0) {
      list = [...cities];
    } else {
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
      list = Array.from(cityMap.values());
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
  }, [cities, countSource]);

  // Places filtered by all active criteria EXCEPT group
  const nonGroupFilteredPlaces = useMemo(() => {
    let result = [...countSource];

    if (filters.cityId && filters.cityId !== 'all') {
      result = result.filter(
        (p) =>
          p.city_id === filters.cityId ||
          (p.cityName && p.cityName.toLowerCase().includes(filters.cityId.toLowerCase()))
      );
    }

    if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && typeof filters.maxDistanceKm === 'number') {
      const maxRadius = filters.maxDistanceKm;
      result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadius);
    }

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

    if (filters.status === 'visited') {
      result = result.filter((p) => p.checked);
    } else if (filters.status === 'unvisited') {
      result = result.filter((p) => !p.checked);
    } else if (filters.status === 'favorite') {
      result = result.filter((p) => p.isFavorite);
    }

    return result;
  }, [countSource, filters.cityId, filters.maxDistanceKm, filters.searchQuery, filters.status]);

  // Places filtered by all active criteria EXCEPT cityId
  const nonCityFilteredPlaces = useMemo(() => {
    let result = [...countSource];

    if (filters.group && filters.group !== 'all') {
      result = result.filter((p) => p.group === filters.group);
    }

    if (filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && typeof filters.maxDistanceKm === 'number') {
      const maxRadius = filters.maxDistanceKm;
      result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxRadius);
    }

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

  // Auto collapse filters when user scrolls downward in the place list
  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    if (currentScrollTop > lastScrollTopRef.current && currentScrollTop > 40) {
      // Scrolling down -> collapse filter box to give 100% screen to list
      if (isFilterExpanded) {
        setIsFilterExpanded(false);
      }
    }
    lastScrollTopRef.current = currentScrollTop;
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      group: 'all',
      cityId: 'all',
      maxDistanceKm: 'all',
      status: 'all',
      sortBy: 'rating',
    });
  };

  const selectedGroupName = activeGroups.find((g) => g.id === filters.group)?.label;
  const selectedCityName = activeCities.find((c) => c.id === filters.cityId)?.name;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-900 shadow-xs relative">
      
      {/* 1. ULTRA COMPACT TOP SEARCH & FILTER TOGGLE BAR (Fixed Header) */}
      <div className="p-2 sm:p-2.5 bg-white border-b border-slate-200 shrink-0 z-20 space-y-1.5 shadow-2xs">
        
        <div className="flex items-center gap-1.5">
          {/* Quick Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm tên, địa chỉ, món ngon..."
              value={filters.searchQuery || ''}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition shadow-inner"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button with Badge Counter */}
          <button
            type="button"
            onClick={() => setIsFilterExpanded((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border shrink-0 ${
              isFilterExpanded || activeFilterCount > 0
                ? 'bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
            }`}
            title={isFilterExpanded ? 'Thu gọn bộ lọc' : 'Mở rộng bộ lọc chi tiết'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xs:inline">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {isFilterExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Desktop Sidebar Collapse Button */}
          {onToggleSidebarCollapse && (
            <button
              type="button"
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ACTIVE FILTER CHIPS ROW (Horizontally Scrollable) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-[11px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight shrink-0 mr-0.5">
            {places.length} điểm:
          </span>

          {/* All Filter Reset Chip if filters active */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-1.5 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-0.5 shrink-0 transition"
              title="Xóa tất cả các bộ lọc"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Xóa lọc</span>
            </button>
          )}

          {/* Active Group Chip */}
          {filters.group && filters.group !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold flex items-center gap-1 shrink-0">
              <span>{getGroupInfo(filters.group).icon} {selectedGroupName}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ group: 'all' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Active City Chip */}
          {filters.cityId && filters.cityId !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1 shrink-0">
              <span>🏙️ {selectedCityName || filters.cityId}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ cityId: 'all' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Active Radius Chip */}
          {filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold flex items-center gap-1 shrink-0">
              <span>📐 &le;{filters.maxDistanceKm}km</span>
              <button
                type="button"
                onClick={() => onFilterChange({ maxDistanceKm: 'all' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Active Status Chip */}
          {filters.status && filters.status !== 'all' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold flex items-center gap-1 shrink-0">
              <span>
                {filters.status === 'visited' ? '✓ Đã đến' : filters.status === 'unvisited' ? '○ Chưa đến' : '❤️ Yêu thích'}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ status: 'all' })}
                className="hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Sort Indicator */}
          {filters.sortBy && filters.sortBy !== 'rating' && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1 shrink-0">
              <span>
                {filters.sortBy === 'distance' ? '📍 Gần nhất' : filters.sortBy === 'name' ? '🔤 Tên A-Z' : filters.sortBy === 'group' ? '🏷️ Nhóm' : '🕒 Gần đây'}
              </span>
            </span>
          )}
        </div>

      </div>

      {/* 2. COLLAPSIBLE ADVANCED FILTER PANEL (Accordion) */}
      {isFilterExpanded && (
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 sm:p-3 space-y-2.5 animate-fadeIn z-10 shrink-0 max-h-[60vh] overflow-y-auto">
          
          {/* A. Service Group Filter: Scrollable Pills / Tags */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-teal-600" /> Nhóm dịch vụ
              </span>
              {filters.group !== 'all' && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ group: 'all' })}
                  className="text-[10px] text-teal-600 font-bold hover:underline"
                >
                  Chọn tất cả
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => onFilterChange({ group: 'all' })}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                  filters.group === 'all'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
                }`}
              >
                <span>🌟 Tất cả</span>
                <span className={`text-[10px] px-1 rounded-full ${filters.group === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
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
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? `${grp.badgeBg} ring-2 ring-current/30 border-current shadow-xs`
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>{grp.icon}</span>
                    <span>{grp.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-black/10 text-current' : 'bg-slate-100 text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. City Filter Dropdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="city-filter-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-500" /> Tỉnh thành
              </label>
              {filters.cityId && filters.cityId !== 'all' && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ cityId: 'all' })}
                  className="text-[10px] text-teal-600 font-bold hover:underline"
                >
                  Xóa tỉnh thành
                </button>
              )}
            </div>

            <div className="relative">
              <select
                id="city-filter-select"
                value={filters.cityId || 'all'}
                onChange={(e) => onFilterChange({ cityId: e.target.value })}
                className="w-full pl-7 pr-7 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition appearance-none shadow-2xs cursor-pointer"
              >
                <option value="all">🏙️ Toàn quốc ({nonCityFilteredPlaces.length} địa điểm)</option>
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
              <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* C. Quick Filter Controls Grid (Radius, Status, Sort) */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {/* Radius */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5 truncate">Bán kính GPS</label>
              <select
                value={filters.maxDistanceKm || 'all'}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  onFilterChange({ maxDistanceKm: val });
                }}
                className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
              >
                {DISTANCE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5 truncate">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value as any })}
                className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="visited">✓ Đã đến</option>
                <option value="unvisited">○ Chưa đến</option>
                <option value="favorite">❤️ Yêu thích</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-0.5 truncate">Sắp xếp</label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer truncate"
              >
                <option value="rating">⭐ Đánh giá</option>
                <option value="distance">📍 Gần nhất</option>
                <option value="name">🔤 Tên A-Z</option>
                <option value="group">🏷️ Theo nhóm</option>
                <option value="visited">🕒 Gần đây</option>
              </select>
            </div>
          </div>

          {/* GPS banner if radius selected but no GPS */}
          {filters.maxDistanceKm && filters.maxDistanceKm !== 'all' && !userLocation && (
            <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between gap-1.5">
              <span>📍 Chưa bật GPS để đo &le;{filters.maxDistanceKm}km</span>
              {onRequestLocation && (
                <button
                  type="button"
                  onClick={onRequestLocation}
                  className="px-2 py-0.5 bg-amber-600 text-white rounded-md font-bold text-[10px] hover:bg-amber-700 transition shrink-0 cursor-pointer"
                >
                  Bật GPS
                </button>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại bộ lọc</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFilterExpanded(false)}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>Thu gọn</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* 3. PLACES LIST VIEW (Smooth Scrollable Area) */}
      <div
        ref={listContainerRef}
        onScroll={handleListScroll}
        className="flex-1 overflow-y-auto divide-y divide-slate-100 pb-20 lg:pb-6 scroll-smooth"
      >
        {places.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <Compass className="w-9 h-9 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Không tìm thấy địa điểm nào phù hợp.</p>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc để xem tất cả</span>
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
                className={`p-2.5 sm:p-3 transition cursor-pointer relative group flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-teal-50/75 border-l-4 border-l-teal-600'
                    : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                }`}
              >
                {/* Thumbnail Image with SVG Vector Fallback */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 relative shadow-2xs">
                  {place.thumbnailUrl && !imageErrors[place.id] ? (
                    <img
                      src={place.thumbnailUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setImageErrors((prev) => ({ ...prev, [place.id]: true }));
                      }}
                    />
                  ) : (
                    <PlaceSvgThumbnail
                      group={place.group}
                      category={place.category}
                      name={place.name}
                      variant="thumbnail"
                    />
                  )}
                </div>

                {/* Place Info */}
                <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                  
                  {/* Badges & Rating */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded font-bold border ${groupMeta.badgeBg}`}>
                      {groupMeta.icon} {groupMeta.label}
                    </span>
                    {place.rating && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        {place.rating}
                      </span>
                    )}
                  </div>

                  {/* Place Name */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
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
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span className="truncate">{place.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>

                  {/* Price & Distance row */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {place.distanceKm !== undefined && place.distanceKm > 0 ? (
                      <p className="text-[10px] text-blue-800 font-bold flex items-center gap-0.5">
                        <Navigation className="w-2.5 h-2.5 text-blue-600" />
                        <span>Cách: {place.distanceKm} km</span>
                      </p>
                    ) : place.priceRange ? (
                      <p className="text-[10px] text-emerald-700 font-semibold truncate flex items-center gap-0.5">
                        <Coins className="w-2.5 h-2.5" />
                        <span>{place.priceRange}</span>
                      </p>
                    ) : (
                      <span />
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs shrink-0"
                      title="Chỉ đường trên Google Maps"
                    >
                      <Navigation className="w-2.5 h-2.5 text-white" />
                      <span>Chỉ đường</span>
                    </a>
                  </div>
                </div>

                {/* Right Quick Action Icons (Favorite, Check-in, View Detail) */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 space-y-1 pl-1">
                  
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
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${place.isFavorite ? 'fill-rose-500' : ''}`} />
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
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
