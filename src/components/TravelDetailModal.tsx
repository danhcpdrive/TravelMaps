import React, { useState, useEffect } from 'react';
import { TravelPlace, UserProfile } from '../types';
import { SERVICE_GROUPS_MAP, formatCoordinate } from '../lib/geoUtils';
import { PlaceSvgThumbnail } from './PlaceSvgThumbnail';
import {
  X,
  MapPin,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Circle,
  ExternalLink,
  Navigation,
  Calendar,
  Edit,
  Trash2,
  Heart,
  Star,
  Clock,
  Coins,
  Sparkles,
  Lightbulb,
  Sun,
  Globe,
  Maximize2,
  Tag,
  Compass,
  MessageSquare,
  Flag,
  Lock,
} from 'lucide-react';

interface TravelDetailModalProps {
  place: TravelPlace | null;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onToggleChecked: (id: string, currentChecked: boolean) => void;
  onToggleFavorite: (id: string, currentFavorite: boolean) => void;
  onEditPlace: (place: TravelPlace) => void;
  onDeletePlace: (id: string) => void;
  onOpenReviewModal?: (place: TravelPlace) => void;
  onOpenExpenseModal?: (place: TravelPlace) => void;
  onOpenTripModal?: () => void;
  onOpenReportModal?: (place: TravelPlace) => void;
  onRequireAuth?: (message: string) => void;
  onViewOnMap?: (place: TravelPlace) => void;
}

export const TravelDetailModal: React.FC<TravelDetailModalProps> = ({
  place,
  currentUser = null,
  onClose,
  onToggleChecked,
  onToggleFavorite,
  onEditPlace,
  onDeletePlace,
  onOpenReviewModal,
  onOpenExpenseModal,
  onOpenTripModal,
  onOpenReportModal,
  onRequireAuth,
  onViewOnMap,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    setIsImageError(false);
  }, [place?.id]);

  if (!place) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = !currentUser || currentUser.role === 'viewer';
  const isUser = currentUser?.role === 'user' || isAdmin;

  const placeLat = Number(place.coordinates?.lat ?? (place as any).lat ?? 16.0544);
  const placeLng = Number(place.coordinates?.lng ?? (place as any).lng ?? 108.2022);

  const handleActionWithAuthCheck = (callback: () => void, actionName: string) => {
    if (isViewer) {
      if (onRequireAuth) {
        onRequireAuth(`Bạn đang duyệt ở chế độ Khách xem (chỉ có quyền xem). Vui lòng Đăng Nhập hoặc Đăng Ký để ${actionName}!`);
      }
      return;
    }
    callback();
  };

  const groupMeta = SERVICE_GROUPS_MAP[place.group] || SERVICE_GROUPS_MAP.du_lich;

  const visitedDateStr = place.visitedAt
    ? new Date(place.visitedAt).toLocaleString('vi-VN', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : null;

  const gallery = place.galleryUrls && place.galleryUrls.length > 0 ? place.galleryUrls : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] flex flex-col">
        
        {/* Top Header Banner: Real Image or High Quality SVG Vector Banner */}
        {place.thumbnailUrl && !isImageError ? (
          <div className="relative h-48 sm:h-56 w-full bg-slate-100 overflow-hidden group">
            <img
              src={place.thumbnailUrl}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
              onError={() => setIsImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Quick full-view button */}
            <button
              type="button"
              onClick={() => setSelectedImage(place.thumbnailUrl || null)}
              className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Xem ảnh lớn</span>
            </button>

            {/* Close & Favorite Floating */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleActionWithAuthCheck(
                    () => onToggleFavorite(place.id, !!place.isFavorite),
                    'lưu địa điểm vào danh sách yêu thích'
                  );
                }}
                className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  place.isFavorite
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white'
                }`}
                title={place.isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart className={`w-4 h-4 ${place.isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 transition cursor-pointer backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Title inside Banner */}
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md border ${groupMeta.badgeBg}`}>
                  {groupMeta.icon} {groupMeta.label}
                </span>
                {place.rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    {place.rating} / 5.0
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-md">{place.name}</h2>
            </div>
          </div>
        ) : (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <PlaceSvgThumbnail
              group={place.group}
              category={place.category}
              name={place.name}
              variant="banner"
              className="w-full h-full"
            />

            {/* Close & Favorite Floating */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => {
                  handleActionWithAuthCheck(
                    () => onToggleFavorite(place.id, !!place.isFavorite),
                    'lưu địa điểm vào danh sách yêu thích'
                  );
                }}
                className={`p-2 rounded-xl backdrop-blur-md transition cursor-pointer ${
                  place.isFavorite
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:text-rose-500 hover:bg-white'
                }`}
                title={place.isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart className={`w-4 h-4 ${place.isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 transition cursor-pointer backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Title inside SVG Banner */}
            <div className="absolute bottom-3 left-4 right-4 text-white z-20">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-md border ${groupMeta.badgeBg}`}>
                  {groupMeta.icon} {groupMeta.label}
                </span>
                {place.rating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    {place.rating} / 5.0
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-md">{place.name}</h2>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto text-sm">
          
          {/* Check-in Banner & Quick Actions */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
              place.checked
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  place.checked ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {place.checked ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm">
                  {place.checked ? 'Đã ghé thăm & check-in' : 'Chưa ghé thăm địa điểm này'}
                </p>
                {place.checked && visitedDateStr && (
                  <p className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {visitedDateStr}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleActionWithAuthCheck(
                  () => onToggleChecked(place.id, place.checked),
                  'đánh dấu check-in địa điểm'
                );
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ml-2 ${
                place.checked
                  ? 'bg-white hover:bg-slate-100 text-teal-700 border border-teal-300'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {place.checked ? 'Bỏ check-in' : 'Check-in'}
            </button>
          </div>

          {/* Action Shortcuts: Review, Expense, Trip Planner, Report (Chỉ dành cho User và Admin) */}
          {isUser ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenReviewModal) {
                    onClose();
                    onOpenReviewModal(place);
                  }
                }}
                className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Viết Cảm Nhận</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenExpenseModal) {
                    onClose();
                    onOpenExpenseModal(place);
                  }
                }}
                className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Ghi Khoản Chi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenTripModal) {
                    onClose();
                    onOpenTripModal();
                  }
                }}
                className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 hover:bg-teal-100 text-teal-900 text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Thêm Lịch Trình</span>
              </button>

              {/* Báo Cáo Địa Điểm Button */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenReportModal) {
                    onClose();
                    onOpenReportModal(place);
                  }
                }}
                className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 hover:bg-red-100 text-red-900 text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer"
                title="Báo cáo sai vị trí, sai thông tin, đóng cửa hoặc địa điểm rác"
              >
                <Flag className="w-4 h-4 text-red-600" />
                <span>Báo Cáo Sai</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Bạn đang ở chế độ xem. Đăng nhập để viết đánh giá, ghi chi tiêu & lên lịch trình.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onRequireAuth) {
                    onRequireAuth('Vui lòng Đăng Nhập để sử dụng tính năng đánh giá, ghi chi tiêu và lên lịch trình!');
                  }
                }}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 ml-2"
              >
                Đăng Nhập
              </button>
            </div>
          )}

          {/* Specialties / Highlights */}
          {place.specialties && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Món ngon đặc sản & Trải nghiệm nổi bật:</span>
              </div>
              <p className="text-xs sm:text-sm pl-5 font-medium leading-relaxed">{place.specialties}</p>
            </div>
          )}

          {/* Location & GPS */}
          <div className="space-y-1.5">
            <div className="flex items-start space-x-2 text-slate-700">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-xs text-slate-900">{place.address || 'Chưa cập nhật địa chỉ cụ thể'}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Tọa độ: {formatCoordinate(placeLat)}, {formatCoordinate(placeLng)}
                </p>
              </div>
            </div>

            {/* External Maps Link */}
            <div className="flex items-center space-x-2 pl-6 pt-1 flex-wrap gap-2">
              {onViewOnMap && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOnMap(place);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Xem & Zoom vị trí trên bản đồ</span>
                </button>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Chỉ đường Google Maps</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>

              {place.distanceKm !== undefined && (
                <span className="inline-flex items-center space-x-1 text-xs text-blue-800 font-bold bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
                  <Navigation className="w-3 h-3 text-blue-600" />
                  <span>Cách bạn: {place.distanceKm} km</span>
                </span>
              )}
            </div>
          </div>

          {/* Key Attributes Grid (Price, Opening Hours, Best Time, Website) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {place.priceRange && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Mức giá tham khảo</p>
                  <p className="text-slate-900 font-semibold text-xs mt-0.5">{place.priceRange}</p>
                </div>
              </div>
            )}

            {place.openingHours && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Giờ mở cửa</p>
                  <p className="text-slate-900 font-semibold text-xs mt-0.5">{place.openingHours}</p>
                </div>
              </div>
            )}

            {place.bestTimeToVisit && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Thời điểm lý tưởng nhất</p>
                  <p className="text-slate-900 font-semibold text-xs mt-0.5">{place.bestTimeToVisit}</p>
                </div>
              </div>
            )}

            {place.websiteUrl && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500">Trang chủ / Fanpage</p>
                  <a
                    href={place.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 hover:text-teal-900 font-semibold text-xs mt-0.5 truncate block hover:underline"
                  >
                    {place.websiteUrl}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {place.tags && place.tags.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
                <Tag className="w-3.5 h-3.5" />
                <span>Thẻ gắn kèm:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Description */}
          {place.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Mô tả chi tiết:</span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm whitespace-pre-line leading-relaxed pl-5">
                {place.notes}
              </p>
            </div>
          )}

          {/* Travel Tips */}
          {place.travelTips && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Kinh nghiệm & Lưu ý bỏ túi:</span>
              </div>
              <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed pl-5 text-emerald-900/90 font-medium">
                {place.travelTips}
              </p>
            </div>
          )}

          {/* Photo Gallery (if multiple images) */}
          {gallery.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Bộ sưu tập hình ảnh ({gallery.length}):</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {gallery.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(url)}
                    className="h-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition cursor-pointer relative group bg-slate-100"
                  >
                    <img
                      src={url}
                      alt={`${place.name} - ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
              <User className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-500">Người liên hệ / Quản lý</p>
                <p className="text-slate-900 font-medium text-xs mt-0.5">{place.contact || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5">
              <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-slate-500">Hotline đặt dịch vụ</p>
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="text-teal-700 font-bold text-xs mt-0.5 hover:underline block">
                    {place.phone}
                  </a>
                ) : (
                  <p className="text-slate-400 text-xs mt-0.5">Chưa có số hotline</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (confirm(`ADMIN: Bạn có chắc chắn muốn xóa địa điểm "${place.name}" khỏi cơ sở dữ liệu?`)) {
                    onDeletePlace(place.id);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Xóa địa điểm này (Quyền Quản Trị Viên)"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa (Admin)</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Chỉnh sửa: Chỉ hiển thị cho User và Admin */}
            {isUser && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditPlace(place);
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 shadow-xs cursor-pointer"
              >
                <Edit className="w-4 h-4 text-amber-600" />
                <span>Chỉnh sửa</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Image Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="mt-3 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs font-medium backdrop-blur-md transition"
            >
              Nhấn ra ngoài hoặc bấm đây để đóng
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export { TravelDetailModal as PlaceDetailModal };
