import React, { useState } from 'react';
import { TravelPlace, PlaceReport, ReportReason, UserProfile } from '../types';
import {
  X,
  Flag,
  AlertTriangle,
  MapPin,
  Clock,
  Coins,
  FileWarning,
  CheckCircle2,
  Send,
  HelpCircle,
  Link,
  ShieldAlert,
} from 'lucide-react';

interface ReportPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: TravelPlace | null;
  currentUser: UserProfile | null;
  onSubmitReport: (report: PlaceReport) => Promise<boolean | void>;
}

export const REPORT_REASONS: Array<{
  id: ReportReason;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'wrong_location',
    label: 'Sai vị trí / Tọa độ ghim trên bản đồ',
    description: 'Điểm ghim bản đồ hoặc địa chỉ hiển thị không đúng với thực tế.',
    icon: '📍',
  },
  {
    id: 'closed_down',
    label: 'Đã đóng cửa / Dừng hoạt động',
    description: 'Địa điểm hoặc cơ sở kinh doanh đã đóng cửa vĩnh viễn hoặc tạm ngưng.',
    icon: '🔒',
  },
  {
    id: 'wrong_info',
    label: 'Sai thông tin (Giá cả, Giờ mở cửa, Hotline)',
    description: 'Mức giá, giờ hoạt động, số điện thoại hoặc thực đơn đã thay đổi.',
    icon: '⚠️',
  },
  {
    id: 'spam_fake',
    label: 'Địa điểm rác / Giả mạo / Không tồn tại',
    description: 'Địa điểm ảo, spam quảng cáo hoặc trùng lặp không có thực tế.',
    icon: '🚫',
  },
  {
    id: 'inappropriate',
    label: 'Nội dung hoặc hình ảnh không phù hợp',
    description: 'Hình ảnh, ngôn từ phản cảm hoặc vi phạm chính sách cộng đồng.',
    icon: '🔞',
  },
  {
    id: 'other',
    label: 'Lý do khác',
    description: 'Bất kỳ vấn đề nào khác cần Admin kiểm tra và chỉnh sửa.',
    icon: '📝',
  },
];

export const ReportPlaceModal: React.FC<ReportPlaceModalProps> = ({
  isOpen,
  onClose,
  place,
  currentUser,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('wrong_info');
  const [description, setDescription] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !place) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Vui lòng nhập mô tả chi tiết lý do báo cáo.');
      return;
    }

    setIsSubmitting(true);

    const report: PlaceReport = {
      id: `rep-${Date.now()}`,
      locationId: place.id,
      locationName: place.name,
      locationAddress: place.address,
      reportedByUserId: currentUser?.id || 'guest',
      reportedByUserName: currentUser?.name || 'Khách Thăm Quan',
      reportedByUserEmail: currentUser?.email,
      reason: reason,
      description: description.trim(),
      proofUrl: proofUrl.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await onSubmitReport(report);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDescription('');
        setProofUrl('');
        onClose();
      }, 1500);
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi báo cáo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-red-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Báo Cáo Địa Điểm
              </h2>
              <p className="text-xs text-slate-500">
                Gửi phản hồi cho Ban Quản Trị để kiểm tra, chỉnh sửa hoặc xóa địa điểm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message Banner */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Báo cáo đã được ghi nhận!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Cảm ơn bạn đã đóng góp! Ban quản trị sẽ rà soát và chỉnh sửa thông tin hoặc xóa địa điểm nếu có vi phạm.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              
              {/* Target Place Info Card */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Địa điểm bị báo cáo:</p>
                <p className="text-sm font-bold text-slate-900">{place.name}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{place.address}</span>
                </p>
              </div>

              {/* Submitter info */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Người gửi báo cáo:</span>
                <span className="font-bold text-slate-800">
                  {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Khách Thăm Quan'}
                </span>
              </div>

              {/* Reason Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  Chọn lý do báo cáo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                        reason === r.id
                          ? 'bg-red-50/70 border-red-300 ring-2 ring-red-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.id}
                        checked={reason === r.id}
                        onChange={() => setReason(r.id)}
                        className="mt-1 text-red-600 focus:ring-red-500"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{r.icon}</span>
                          <span>{r.label}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{r.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Mô tả chi tiết vấn đề <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-slate-400 font-normal">Càng chi tiết càng tốt</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vui lòng cung cấp chi tiết: Vị trí đúng ở đâu? Giá mới bao nhiêu? Quán đóng cửa khi nào?..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 resize-none"
                />
              </div>

              {/* Proof URL / Link (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-slate-400" />
                  Link hình ảnh / bài viết minh chứng (tùy chọn)
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... hoặc link thông báo"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
