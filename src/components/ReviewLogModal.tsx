import React, { useState } from 'react';
import { TravelReviewLog, TravelPlace, UserProfile } from '../types';
import {
  X,
  Star,
  Camera,
  Coins,
  Sun,
  Users,
  MessageSquare,
  Sparkles,
  Plus,
  MapPin,
  Calendar,
  User,
  Trash2,
} from 'lucide-react';

interface ReviewLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: TravelReviewLog[];
  places: TravelPlace[];
  selectedPlaceForReview?: TravelPlace | null;
  currentUser?: UserProfile | null;
  onSaveReview: (review: TravelReviewLog) => void;
  onDeleteReview?: (id: string) => void;
}

export const ReviewLogModal: React.FC<ReviewLogModalProps> = ({
  isOpen,
  onClose,
  reviews,
  places,
  selectedPlaceForReview,
  currentUser,
  onSaveReview,
  onDeleteReview,
}) => {
  const [isWriting, setIsWriting] = useState<boolean>(!!selectedPlaceForReview);
  const [formPlaceId, setFormPlaceId] = useState<string>(
    selectedPlaceForReview?.id || places[0]?.id || ''
  );
  const [rating, setRating] = useState<number>(5);
  const [actualExpense, setActualExpense] = useState<number>(100000);
  const [reviewText, setReviewText] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [weather, setWeather] = useState<string>('Nắng đẹp, trời trong');
  const [companion, setCompanion] = useState<string>('Bạn bè');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      alert('Vui lòng nhập cảm nhận hoặc kinh nghiệm của bạn!');
      return;
    }

    const placeObj = places.find((p) => p.id === formPlaceId);

    const newReview: TravelReviewLog = {
      id: Date.now().toString(),
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.name,
      locationId: formPlaceId,
      locationName: placeObj?.name || 'Địa điểm',
      visitedAt: new Date().toISOString(),
      rating,
      actualExpense: Number(actualExpense) || 0,
      reviewText: reviewText.trim(),
      capturedPhotos: photoUrl ? [photoUrl.trim()] : [],
      weather,
      companion,
      createdAt: new Date().toISOString(),
    };

    onSaveReview(newReview);
    setIsWriting(false);
    setReviewText('');
    setPhotoUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Nhật Ký Trải Nghiệm & Check-in (travel_reviews_logs)
              </h2>
              <p className="text-xs text-slate-500">
                Lưu lại cảm nhận thực tế, chi phí thực chi và hình ảnh kỉ niệm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIsWriting(false)}
            className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              !isWriting
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Nhật Ký Đã Lưu ({reviews.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsWriting(true)}
            className={`px-3 py-2 font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              isWriting
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Viết Cảm Nhận Mới</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {isWriting ? (
            /* Write Review Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Địa Điểm *</label>
                <select
                  value={formPlaceId}
                  onChange={(e) => setFormPlaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold text-slate-900"
                >
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Đánh Giá Hài Lòng
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-2 rounded-xl border flex-1 text-center font-bold text-xs transition cursor-pointer ${
                          rating >= s
                            ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {s} ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Chi Phí Thực Chi (VND)
                  </label>
                  <input
                    type="number"
                    value={actualExpense}
                    onChange={(e) => setActualExpense(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-orange-500" />
                    Thời Tiết Lúc Đi
                  </label>
                  <input
                    type="text"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    placeholder="Ví dụ: Nắng đẹp, Mát mẻ, Mưa rào..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Người Đồng Hành
                  </label>
                  <input
                    type="text"
                    value={companion}
                    onChange={(e) => setCompanion(e.target.value)}
                    placeholder="Ví dụ: Đi cùng gia đình, Bạn bè..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cảm Nhận & Kinh Nghiệm Khám Phá *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ về đồ ăn, góc chụp ảnh đẹp, lưu ý cho người đi sau..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  Link Ảnh Tự Chụp (Check-in Photo URL)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriting(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Lưu Nhật Ký
                </button>
              </div>
            </form>
          ) : (
            /* Review Feed */
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Chưa có nhật ký check-in nào. Bấm &quot;Viết Cảm Nhận Mới&quot; để lưu lại kỉ niệm!
                  </p>
                </div>
              ) : (
                reviews.map((rev) => {
                  const placeObj = places.find((p) => p.id === rev.locationId);
                  return (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {rev.locationName || placeObj?.name || 'Địa điểm check-in'}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(rev.visitedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{rev.reviewText}</p>

                      {/* Photo if any */}
                      {rev.capturedPhotos && rev.capturedPhotos.length > 0 && (
                        <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                          <img
                            src={rev.capturedPhotos[0]}
                            alt="Check-in photo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 flex-wrap justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                          {(rev.userName || rev.userEmail) && (
                            <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px]">
                              <User className="w-2.5 h-2.5" />
                              {rev.userName || rev.userEmail}
                            </span>
                          )}
                          {rev.actualExpense !== undefined && rev.actualExpense > 0 && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {rev.actualExpense.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                          {rev.weather && <span>☀️ {rev.weather}</span>}
                          {rev.companion && <span>👥 {rev.companion}</span>}
                        </div>

                        {onDeleteReview && (currentUser?.role === 'admin' || (currentUser?.id && rev.userId === currentUser.id)) && (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(rev.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Xóa nhật ký"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
