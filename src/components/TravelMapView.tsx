import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TravelPlace } from '../types';
import { SERVICE_GROUPS_MAP } from '../lib/geoUtils';
import {
  Layers,
  Compass,
  Navigation,
  ChevronDown,
  Check,
} from 'lucide-react';

interface TravelMapViewProps {
  places: TravelPlace[];
  selectedPlace: TravelPlace | null;
  onSelectPlace: (place: TravelPlace) => void;
  onToggleChecked: (id: string, currentChecked: boolean) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  onOpenDetailModal: (place: TravelPlace) => void;
  userLocation: { lat: number; lng: number; timestamp?: number } | null;
  onGetUserLocation?: () => void;
}

export const TravelMapView: React.FC<TravelMapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  onToggleChecked,
  onToggleFavorite,
  onOpenDetailModal,
  userLocation,
  onGetUserLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapTileStyle, setMapTileStyle] = useState<'google_streets' | 'google_satellite' | 'google_hybrid' | 'osm'>('google_streets');
  const [activeLayer, setActiveLayer] = useState<L.TileLayer | null>(null);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  // Close layer dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setIsLayerMenuOpen(false);
      }
    };
    if (isLayerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLayerMenuOpen]);

  const layerOptions = [
    { id: 'google_streets', label: 'Đường phố', sub: 'Street', icon: '🗺️' },
    { id: 'google_satellite', label: 'Vệ tinh', sub: 'Satellite', icon: '🛰️' },
    { id: 'google_hybrid', label: 'Lai', sub: 'Hybrid', icon: '🌐' },
  ] as const;

  const currentLayer = layerOptions.find((l) => l.id === mapTileStyle) || layerOptions[0];

  // Maintain fresh callbacks ref
  const callbacksRef = useRef({ onToggleChecked, onToggleFavorite, onOpenDetailModal, onSelectPlace });
  useEffect(() => {
    callbacksRef.current = { onToggleChecked, onToggleFavorite, onOpenDetailModal, onSelectPlace };
  });

  // Initialize Leaflet Map with Google Maps Tile Providers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Da Nang / Central Vietnam
      let defaultLat = 16.0544;
      let defaultLng = 108.2022;

      if (selectedPlace?.coordinates) {
        const latVal = Number(selectedPlace.coordinates.lat);
        const lngVal = Number(selectedPlace.coordinates.lng);
        if (!isNaN(latVal) && latVal !== 0) {
          defaultLat = latVal;
        }
        if (!isNaN(lngVal) && lngVal !== 0) {
          defaultLng = lngVal;
        }
      }

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 6,
        zoomControl: false,
      });

      // Add zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove current tile layer if exists
    if (activeLayer) {
      map.removeLayer(activeLayer);
    }

    // Google Maps Tile URLs
    let tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Streets
    if (mapTileStyle === 'google_satellite') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
    } else if (mapTileStyle === 'google_hybrid') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    } else if (mapTileStyle === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a> | Travel Maps',
    });

    newLayer.addTo(map);
    setActiveLayer(newLayer);

    // Add ResizeObserver to auto-update map dimensions on container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [mapTileStyle]);

  // Handle markers rendering & updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => (m as L.Marker).remove());
    markersRef.current = {};

    // Render new markers
    places.forEach((place) => {
      try {
        const pLat = Number(place?.coordinates?.lat);
        const pLng = Number(place?.coordinates?.lng);
        if (isNaN(pLat) || isNaN(pLng) || pLat === 0 || pLng === 0) return;

        const isSelected = selectedPlace?.id === place.id;
        const isChecked = place.checked;
        const groupMeta = SERVICE_GROUPS_MAP[place.group] || SERVICE_GROUPS_MAP.du_lich;
        const pinColor = groupMeta.markerColor;

      // Group SVG Icon
      let iconInner = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      if (place.group === 'an_uong') {
        iconInner = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
      } else if (place.group === 'dich_vu') {
        iconInner = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path><path d="M9 7h1"></path><path d="M9 11h1"></path><path d="M9 15h1"></path><path d="M14 7h1"></path><path d="M14 11h1"></path><path d="M14 15h1"></path></svg>`;
      } else if (place.group === 'giai_tri') {
        iconInner = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path></svg>`;
      }

      // Custom marker HTML icon with group color & visited/favorite indicators
      const iconHtml = `
        <div class="relative group cursor-pointer transform transition duration-200 hover:scale-115">
          <div style="background-color: ${pinColor};" class="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
            isSelected ? 'ring-4 ring-amber-400 scale-110 z-30' : 'z-10'
          }">
            ${iconInner}
          </div>
          <div style="background-color: ${pinColor};" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"></div>
          
          ${
            isChecked
              ? `<div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border border-white rounded-full flex items-center justify-center text-[9px] text-white font-bold shadow-xs">✓</div>`
              : ''
          }
          ${
            place.isFavorite && !isChecked
              ? `<div class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[9px] text-white shadow-xs">❤</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-travel-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([pLat, pLng], {
        icon: customIcon,
      }).addTo(map);

      // Create rich Popup content container
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 min-w-[280px] max-w-[340px] font-sans text-slate-900';

      const visitedTimeStr = place.visitedAt
        ? new Date(place.visitedAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null;

      popupDiv.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${groupMeta.badgeBg}">
                  ${groupMeta.label}
                </span>
                <span class="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700">
                  ${place.category}
                </span>
              </div>
              <h3 class="font-bold text-sm text-slate-900 leading-tight mt-1 break-words whitespace-normal">${place.name}</h3>
            </div>
            ${
              place.rating
                ? `<div class="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                    <span>★</span><span>${place.rating}</span>
                   </div>`
                : ''
            }
          </div>

          <p class="text-xs text-slate-600 break-words whitespace-normal leading-relaxed">📍 ${place.address || 'Chưa có địa chỉ cụ thể'}</p>

          ${
            place.openingHours || place.priceRange
              ? `<div class="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded flex-wrap">
                  ${place.openingHours ? `<span>⏰ ${place.openingHours}</span>` : ''}
                  ${place.priceRange ? `<span class="font-medium text-emerald-700">💵 ${place.priceRange}</span>` : ''}
                 </div>`
              : ''
          }

          ${
            place.notes
              ? `<div class="text-[11px] text-slate-700 bg-teal-50/70 px-2 py-1 rounded border border-teal-100 whitespace-pre-line break-words">💡 <i>${place.notes}</i></div>`
              : ''
          }

          ${
            place.distanceKm !== undefined && place.distanceKm > 0
              ? `<div class="text-[11px] text-blue-600 font-semibold">🧭 Cách bạn: ${place.distanceKm} km</div>`
              : ''
          }

          ${
            place.checked && visitedTimeStr
              ? `<div class="text-[10px] text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded">✓ Đã ghé thăm: ${visitedTimeStr}</div>`
              : ''
          }

          <!-- Direct Check-in Toggle Button -->
          <button 
            type="button"
            data-action="toggle-check"
            data-id="${place.id}"
            data-checked="${place.checked}"
            class="js-popup-btn w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              place.checked
                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
            }">
            ${
              place.checked
                ? '<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Đã ghé thăm'
                : '<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg> Đánh dấu đã đến'
            }
          </button>

          <div class="pt-1 flex items-center gap-1.5 border-t border-slate-100">
            <button 
              type="button"
              data-action="view-detail"
              data-id="${place.id}"
              class="js-popup-btn flex-1 py-1.5 px-2 text-center text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition cursor-pointer">
              Chi tiết & Đánh giá
            </button>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #ffffff !important;"
              class="py-1.5 px-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1 shadow-xs border border-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              <span>Chỉ đường</span>
            </a>
          </div>
        </div>
      `;

      // Prevent Leaflet map from absorbing button clicks inside popup
      L.DomEvent.disableClickPropagation(popupDiv);
      L.DomEvent.disableScrollPropagation(popupDiv);

      popupDiv.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('.js-popup-btn') as HTMLElement | null;
        if (!btn) return;

        e.stopPropagation();
        e.preventDefault();

        const action = btn.getAttribute('data-action');
        const placeId = btn.getAttribute('data-id');
        const isChecked = btn.getAttribute('data-checked') === 'true';

        if (action === 'toggle-check' && placeId) {
          callbacksRef.current.onToggleChecked(placeId, isChecked);
        } else if (action === 'view-detail' && placeId) {
          const targetPlace = places.find((item) => item.id === placeId);
          if (targetPlace) {
            callbacksRef.current.onOpenDetailModal(targetPlace);
          }
        }
      });

      marker.bindPopup(popupDiv, { maxWidth: 310 });

      // Event listeners inside popup
      marker.on('popupopen', () => {
        callbacksRef.current.onSelectPlace(place);
      });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersRef.current[place.id] = marker;
      } catch (err) {
        console.error("Error rendering marker for place:", place?.id, err);
      }
    });

    // User location marker
    if (userLocation) {
      const uLat = Number(userLocation.lat);
      const uLng = Number(userLocation.lng);

      if (!isNaN(uLat) && uLat !== 0 && !isNaN(uLng) && uLng !== 0) {
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
              <div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md z-20"></div>
            </div>
          `,
          className: 'user-location-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        try {
          userMarkerRef.current = L.marker([uLat, uLng], {
            icon: userIcon,
            zIndexOffset: 1000,
          }).addTo(map);
        } catch (err) {
          console.error("Error adding user location marker:", err);
        }
      }
    }
  }, [places, selectedPlace?.id, userLocation]);

  // Fly & Zoom to user location whenever location is received or refreshed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const uLat = Number(userLocation.lat);
    const uLng = Number(userLocation.lng);
    if (isNaN(uLat) || uLat === 0 || isNaN(uLng) || uLng === 0) return;

    const size = map.getSize();
    if (size.x === 0 || size.y === 0) {
      // Map is hidden, just setView without animation to prevent math crash
      map.setView([uLat, uLng], 16);
      return;
    }

    try {
      map.flyTo([uLat, uLng], 16, {
        animate: true,
        duration: 1.2,
      });
    } catch (err) {
      console.error("Error in userLocation flyTo:", err);
    }
  }, [userLocation?.lat, userLocation?.lng, userLocation?.timestamp]);

  // Center map and automatically zoom in when a place is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    const sLat = Number(selectedPlace.coordinates?.lat);
    const sLng = Number(selectedPlace.coordinates?.lng);
    if (isNaN(sLat) || sLat === 0 || isNaN(sLng) || sLng === 0) return;

    // We use setTimeout to ensure that if the user is on mobile and the tab just switched
    // from 'list' to 'map', the DOM has time to update the display from 'none' to 'block'
    // and the ResizeObserver has time to call invalidateSize(). This guarantees the map
    // flies to the exact center of the screen.
    const timeoutId = setTimeout(() => {
      // Re-check map in case it was unmounted
      if (!mapInstanceRef.current) return;
      
      const currentZoom = Number(map.getZoom()) || 6;
      const targetZoom = Math.max(currentZoom, 15);

      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        // Map is still hidden, just setView without animation to prevent math crash
        map.setView([sLat, sLng], targetZoom);
      } else {
        try {
          map.flyTo([sLat, sLng], targetZoom, {
            animate: true,
            duration: 1.0,
          });
        } catch (err) {
          console.error("Error in selectedPlace flyTo:", err);
        }
      }

      const marker = markersRef.current[selectedPlace.id];
      if (marker) {
        marker.openPopup();
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [selectedPlace?.id, selectedPlace?.coordinates?.lat, selectedPlace?.coordinates?.lng]);

  // Fit all markers in viewport
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || !places || places.length === 0) return;

    const validLatLngs: L.LatLng[] = [];
    places.forEach((p) => {
      const lat = Number(p.coordinates?.lat);
      const lng = Number(p.coordinates?.lng);
      if (!isNaN(lat) && lat !== 0 && !isNaN(lng) && lng !== 0) {
        try {
          validLatLngs.push(L.latLng(lat, lng));
        } catch (e) {
          console.error("Invalid LatLng skipped in handleFitBounds:", lat, lng, e);
        }
      }
    });

    if (validLatLngs.length === 0) return;

    const size = map.getSize();
    if (size.x <= 100 || size.y <= 100) {
      // Map is too small or hidden, do not fit bounds
      return;
    }

    try {
      const bounds = L.latLngBounds(validLatLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch (e) {
      console.error("Failed to fitBounds:", e);
    }
  };

  // Center user location on button click
  const handleCenterUser = () => {
    if (onGetUserLocation) {
      onGetUserLocation();
    } else if (userLocation && mapInstanceRef.current) {
      const uLat = Number(userLocation.lat);
      const uLng = Number(userLocation.lng);
      if (!isNaN(uLat) && uLat !== 0 && !isNaN(uLng) && uLng !== 0) {
        const size = mapInstanceRef.current.getSize();
        if (size.x === 0 || size.y === 0) {
          mapInstanceRef.current.setView([uLat, uLng], 16);
        } else {
          try {
            mapInstanceRef.current.flyTo([uLat, uLng], 16, {
              animate: true,
              duration: 1.2,
            });
          } catch (err) {
            console.error("Error in handleCenterUser flyTo:", err);
          }
        }
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col">
      {/* Map Header / Ultra Compact Layer Switcher Dropdown */}
      <div ref={layerMenuRef} className="absolute top-3 left-3 z-20">
        <button
          type="button"
          onClick={() => setIsLayerMenuOpen((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold shadow-md transition-all cursor-pointer select-none active:scale-95 ${
            isLayerMenuOpen
              ? 'bg-white text-teal-800 border-teal-400 ring-2 ring-teal-500/20 shadow-lg'
              : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200/90 backdrop-blur-md'
          }`}
          title="Đổi kiểu bản đồ hiển thị"
        >
          <Layers className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>{currentLayer.icon}</span>
          <span className="font-bold text-slate-900">{currentLayer.label}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLayerMenuOpen ? 'rotate-180 text-teal-600' : ''}`} />
        </button>

        {/* Dropdown Options */}
        {isLayerMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl py-1 z-30 animate-fadeIn divide-y divide-slate-100">
            {layerOptions.map((opt) => {
              const isSelected = mapTileStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setMapTileStyle(opt.id);
                    setIsLayerMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/90 text-teal-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{opt.icon}</span>
                    <div>
                      <span className="block text-slate-900">{opt.label}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">({opt.sub})</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Action Floating Buttons */}
      <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-4 z-20 flex flex-col space-y-2">
        <button
          type="button"
          onClick={handleCenterUser}
          title="Zoom tới vị trí GPS của tôi"
          className="p-3 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl sm:rounded-xl shadow-xl border border-blue-500/40 transition flex items-center justify-center cursor-pointer group active:scale-95"
        >
          <Navigation className="w-5 h-5 text-white group-hover:scale-110 transition duration-200" />
        </button>

        <button
          type="button"
          onClick={handleFitBounds}
          title="Xem toàn bộ các địa điểm du lịch & dịch vụ"
          className="p-3 sm:p-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-2xl sm:rounded-xl shadow-xl border border-slate-200/80 transition flex items-center justify-center backdrop-blur-md cursor-pointer group active:scale-95"
        >
          <Compass className="w-5 h-5 text-teal-600 group-hover:rotate-45 transition duration-300" />
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-10" />
    </div>
  );
};

export { TravelMapView as GoogleMapView };
