import React, { useState, useEffect } from 'react';
import { TravelPlace, ServiceGroup, TravelCity } from '../types';
import { SERVICE_GROUPS, DEFAULT_CITIES } from '../lib/geoUtils';
import {
  X,
  Compass,
  Navigation,
  Star,
  Heart,
  Clock,
  Coins,
  Sparkles,
  Lightbulb,
  Sun,
  Image as ImageIcon,
  Globe,
  MapPin,
  FileText,
} from 'lucide-react';

interface TravelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlace: TravelPlace | null;
  onSave: (place: TravelPlace) => void;
  userLocation: { lat: number; lng: number } | null;
  cities?: TravelCity[];
}

export const TravelFormModal: React.FC<TravelFormModalProps> = ({
  isOpen,
  onClose,
  initialPlace,
  onSave,
  userLocation,
  cities,
}) => {
  const activeCities = cities || [];
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  const [formData, setFormData] = useState<Partial<TravelPlace>>({
    name: '',
    group: 'du_lich',
    category: 'Danh lam thắng cảnh',
    address: '',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    phone: '',
    contact: '',
    rating: 4.8,
    priceRange: 'Miễn phí',
    openingHours: '07:00 - 22:00',
    bestTimeToVisit: '',
    specialties: '',
    travelTips: '',
    thumbnailUrl: '',
    galleryUrls: [],
    website: '',
    notes: '',
    checked: false,
    isFavorite: false,
  });

  const [galleryText, setGalleryText] = useState<string>('');

  useEffect(() => {
    if (initialPlace) {
      setFormData({
        ...initialPlace,
        coordinates: initialPlace.coordinates || { lat: 16.0544, lng: 108.2022 },
      });
      setGalleryText(
        Array.isArray(initialPlace.galleryUrls) ? initialPlace.galleryUrls.join('\n') : ''
      );
    } else {
      setFormData({
        id: `place-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        group: 'du_lich',
        category: 'Danh lam thắng cảnh',
        address: '',
        coordinates: (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number')
          ? {
              lat: Number(userLocation.lat.toFixed(8)),
              lng: Number(userLocation.lng.toFixed(8)),
            }
          : { lat: 16.0544, lng: 108.2022 },
        phone: '',
        contact: '',
        rating: 4.8,
        priceRange: 'Miễn phí',
        openingHours: '07:00 - 22:00',
        bestTimeToVisit: '',
        specialties: '',
        travelTips: '',
        thumbnailUrl: '',
        galleryUrls: [],
        website: '',
        notes: '',
        checked: false,
        isFavorite: false,
        visitedAt: null,
      });
      setGalleryText('');
    }
  }, [initialPlace, isOpen, userLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập tên địa điểm!');
      return;
    }

    const galleryUrlsParsed = galleryText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('http://') || line.startsWith('https://'));

    const selectedCityId = formData.city_id || 'da_nang';
    const matchedCity = activeCities.find((c) => c.id === selectedCityId);

    const placeToSave: TravelPlace = {
      id: formData.id || `place-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: formData.name.trim(),
      group: (formData.group as ServiceGroup) || 'du_lich',
      city_id: selectedCityId,
      cityName: matchedCity?.name || formData.cityName || 'Đà Nẵng',
      category: formData.category?.trim() || 'Địa điểm',
      address: formData.address?.trim() || '',
      coordinates: {
        lat: (() => {
          const val = Number(formData.coordinates?.lat);
          return (!isNaN(val) && val !== 0) ? val : 16.0544;
        })(),
        lng: (() => {
          const val = Number(formData.coordinates?.lng);
          return (!isNaN(val) && val !== 0) ? val : 108.2022;
        })(),
      },
      phone: formData.phone?.trim() || '',
      contact: formData.contact?.trim() || '',
      checked: Boolean(formData.checked),
      isFavorite: Boolean(formData.isFavorite),
      visitedAt: formData.checked ? formData.visitedAt || new Date().toISOString() : null,

      // Details table
      rating: formData.rating ? Number(formData.rating) : 4.8,
      priceRange: formData.priceRange?.trim() || '',
      openingHours: formData.openingHours?.trim() || '',
      bestTimeToVisit: formData.bestTimeToVisit?.trim() || '',
      specialties: formData.specialties?.trim() || '',
      travelTips: formData.travelTips?.trim() || '',
      thumbnailUrl: formData.thumbnailUrl?.trim() || '',
      galleryUrls: galleryUrlsParsed,
      website: formData.website?.trim() || '',
      notes: formData.notes?.trim() || '',
      distanceKm: formData.distanceKm || 0,
    };

    onSave(placeToSave);
    onClose();
  };

  const fillCurrentGps = () => {
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          lat: Number(userLocation.lat.toFixed(8)),
          lng: Number(userLocation.lng.toFixed(8)),
        },
      }));
    } else {
      alert('Chưa lấy được vị trí GPS. Vui lòng bấm "Vị trí của tôi" ở thanh trên cùng trước.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {initialPlace ? 'Chỉnh sửa Thông tin Địa điểm' : 'Thêm Địa điểm Mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation for Tables */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>1. Vị trí & Định danh (table.location)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Chi tiết, Gợi ý & Ảnh (table.info)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          
          {/* TAB 1: BASIC LOCATION INFO (TABLE: travel_locations & travel_groups) */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Service Group Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nhóm Dịch Vụ (travel_groups) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SERVICE_GROUPS.map((grp) => {
                    const isSelected = formData.group === grp.id;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          let defaultCat = 'Danh lam thắng cảnh';
                          if (grp.id === 'an_uong') defaultCat = 'Đặc sản ẩm thực';
                          if (grp.id === 'dich_vu') defaultCat = 'Khách sạn & Resort';
                          if (grp.id === 'giai_tri') defaultCat = 'Công viên & Giải trí';
                          setFormData({ ...formData, group: grp.id, category: defaultCat });
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                          isSelected
                            ? `${grp.badgeBg} border-current ring-2 ring-current shadow-xs`
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{grp.icon}</span>
                        <span>{grp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Thành phố / Tỉnh thành
                </label>
                {activeCities.length > 0 ? (
                  <select
                    value={formData.city_id || activeCities[0]?.id || ''}
                    onChange={(e) => {
                      const selectedCityId = e.target.value;
                      const matchedCity = activeCities.find((c) => c.id === selectedCityId);
                      setFormData({
                        ...formData,
                        city_id: selectedCityId,
                        cityName: matchedCity?.name || selectedCityId,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-sm font-medium"
                  >
                    {activeCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏙️ {c.name} {c.code ? `(${c.code})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.cityName || formData.city_id || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city_id: e.target.value.toLowerCase().trim().replace(/\s+/g, '_'),
                        cityName: e.target.value,
                      })
                    }
                    placeholder="Nhập tên thành phố (ví dụ: Đà Nẵng, Hà Nội...)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-sm font-medium"
                  />
                )}
              </div>

              {/* Place Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên Địa Điểm *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Cầu Vàng Bà Nà Hills, Phở Thìn Lò Đúc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Category & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phân Loại Cụ Thể</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ví dụ: Di tích lịch sử, Cafe view đẹp, Nhà hàng..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số Hotline / Điện Thoại</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0903 xxx xxx / 028 3822 xxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Địa Chỉ Chi Tiết</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Coordinates (Lat, Lng) */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">Tọa độ GPS (WGS84)</label>
                  <button
                    type="button"
                    onClick={fillCurrentGps}
                    className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    Lấy tọa độ hiện tại của bạn
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500">Vĩ độ (Latitude):</span>
                    <input
                      type="number"
                      step="0.00000001"
                      required
                      value={formData.coordinates?.lat ?? 16.0544}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            lat: parseFloat(e.target.value) || 0,
                            lng: formData.coordinates?.lng ?? 108.2022,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500">Kinh độ (Longitude):</span>
                    <input
                      type="number"
                      step="0.00000001"
                      required
                      value={formData.coordinates?.lng ?? 108.2022}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinates: {
                            lat: formData.coordinates?.lat ?? 16.0544,
                            lng: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checked & Favorite Checkboxes */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="form-checked-checkbox"
                    checked={Boolean(formData.checked)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        checked: e.target.checked,
                        visitedAt: e.target.checked ? formData.visitedAt || new Date().toISOString() : null,
                      })
                    }
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 bg-white"
                  />
                  <label htmlFor="form-checked-checkbox" className="text-slate-800 font-medium cursor-pointer">
                    Đã ghé thăm & check-in
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="form-favorite-checkbox"
                    checked={Boolean(formData.isFavorite)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isFavorite: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-300 bg-white"
                  />
                  <label htmlFor="form-favorite-checkbox" className="text-rose-700 font-medium cursor-pointer flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Yêu thích
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RICH DETAILS & MEDIA (TABLE: travel_location_details) */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              
              {/* Specialties / Món ngon nổi bật */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Món Ngon Đặc Sản & Tiện Ích Nổi Bật
                </label>
                <input
                  type="text"
                  value={formData.specialties || ''}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Ví dụ: Phở bò tái lăn, Cà phê kem trứng, View ngắm hoàng hôn, Bàn tay Phật..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Best Time & Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-orange-500" />
                    Thời Điểm Lý Tưởng
                  </label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit || ''}
                    onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                    placeholder="Ví dụ: Hoàng hôn 16:30 - 18:00, Sáng sớm 07:00..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Đánh Giá Sao (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating ?? 4.8}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Price Range & Opening Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Mức Giá / Chi Phí
                  </label>
                  <input
                    type="text"
                    value={formData.priceRange || ''}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    placeholder="Ví dụ: 35.000đ - 65.000đ hoặc Miễn phí"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Giờ Mở Cửa
                  </label>
                  <input
                    type="text"
                    value={formData.openingHours || ''}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="Ví dụ: 06:30 - 22:00 hoặc 24/7"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  URL Hình Ảnh Thumbnail (Ảnh đại diện)
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Gallery URLs (Multi-line) */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  Danh Sách Ảnh Full / Album (Mỗi link một dòng)
                </label>
                <textarea
                  rows={2}
                  value={galleryText}
                  onChange={(e) => setGalleryText(e.target.value)}
                  placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white font-mono text-[11px]"
                />
              </div>

              {/* Travel Tips */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                  Mẹo Bỏ Túi & Gợi Ý Khám Phá (Tips)
                </label>
                <textarea
                  rows={2}
                  value={formData.travelTips || ''}
                  onChange={(e) => setFormData({ ...formData, travelTips: e.target.value })}
                  placeholder="Nên đặt bàn trước, gọi thêm trứng chần, mang áo khoác gió..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Notes & Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  Ghi Chú Chung & Giới Thiệu
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Lịch sử di tích, đặc trưng không gian..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Trang Web / Fanpage Liên Kết
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              {activeTab === 'basic' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-semibold hover:bg-teal-100 transition cursor-pointer"
                >
                  Tiếp tục nhập Chi tiết & Ảnh →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  ← Quay lại Thông tin Vị trí
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition border border-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs transition cursor-pointer"
              >
                Lưu Địa Điểm
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export { TravelFormModal as PlaceFormModal };
