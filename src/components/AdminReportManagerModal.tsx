import React, { useState, useMemo } from 'react';
import { PlaceReport, ReportStatus, ReportReason, TravelPlace, UserProfile } from '../types';
import { REPORT_REASONS } from './ReportPlaceModal';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  MapPin,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Eye,
  FileText,
  Sparkles,
} from 'lucide-react';

interface AdminReportManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: PlaceReport[];
  places: TravelPlace[];
  currentUser: UserProfile | null;
  onUpdateReportStatus: (reportId: string, status: ReportStatus, adminNote?: string) => Promise<void>;
  onDeleteReport: (reportId: string) => Promise<void>;
  onEditPlace: (place: TravelPlace) => void;
  onDeletePlace: (placeId: string) => Promise<void>;
  onSelectPlaceOnMap?: (place: TravelPlace) => void;
}

export const AdminReportManagerModal: React.FC<AdminReportManagerModalProps> = ({
  isOpen,
  onClose,
  reports,
  places,
  currentUser,
  onUpdateReportStatus,
  onDeleteReport,
  onEditPlace,
  onDeletePlace,
  onSelectPlaceOnMap,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Stats
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const dismissed = reports.filter((r) => r.status === 'dismissed').length;
    return { total, pending, resolved, dismissed };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = r.locationName.toLowerCase().includes(query);
        const matchDesc = r.description.toLowerCase().includes(query);
        const matchReporter = r.reportedByUserName.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchReporter) return false;
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const getReasonMeta = (reasonId: ReportReason) => {
    return REPORT_REASONS.find((r) => r.id === reasonId) || {
      id: 'other',
      label: 'Lý do khác',
      icon: '📝',
    };
  };

  const handleResolve = async (reportId: string, note?: string) => {
    await onUpdateReportStatus(reportId, 'resolved', note || 'Admin đã kiểm tra và xử lý thành công.');
    setEditingNoteId(null);
  };

  const handleDismiss = async (reportId: string, note?: string) => {
    await onUpdateReportStatus(reportId, 'dismissed', note || 'Báo cáo không chính xác hoặc không đủ căn cứ.');
    setEditingNoteId(null);
  };

  const handleDeletePlaceWithReport = async (report: PlaceReport) => {
    if (
      confirm(
        `XÁC NHẬN XÓA ĐỊA ĐIỂM: Bạn có chắc chắn muốn xóa vĩnh viễn địa điểm "${report.locationName}" khỏi hệ thống?`
      )
    ) {
      await onDeletePlace(report.locationId);
      await onUpdateReportStatus(report.id, 'resolved', 'Admin đã xóa địa điểm vi phạm khỏi hệ thống.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Trung Tâm Quản Lý Báo Cáo Địa Điểm
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                  Dành riêng cho Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kiểm duyệt phản hồi từ người dùng: Sửa thông tin sai lệch, xóa địa điểm rác/vi phạm hoặc bác bỏ
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

        {/* Stats Dashboard Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-100/70 border-b border-slate-200 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white border-slate-300 shadow-xs ring-2 ring-slate-400/20'
                : 'bg-white/60 border-slate-200 hover:bg-white'
            }`}
          >
            <p className="text-[11px] font-bold text-slate-500">Tất cả báo cáo</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{stats.total}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-50 border-amber-300 shadow-xs ring-2 ring-amber-400/20 text-amber-900'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Chờ xử lý
            </p>
            <p className="text-base sm:text-lg font-bold text-amber-900 mt-0.5">{stats.pending}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-emerald-50 border-emerald-300 shadow-xs ring-2 ring-emerald-400/20 text-emerald-900'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Đã giải quyết
            </p>
            <p className="text-base sm:text-lg font-bold text-emerald-900 mt-0.5">{stats.resolved}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('dismissed')}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'dismissed'
                ? 'bg-slate-100 border-slate-300 shadow-xs ring-2 ring-slate-400/20 text-slate-900'
                : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
            }`}
          >
            <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Đã bỏ qua
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-700 mt-0.5">{stats.dismissed}</p>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:px-4 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên địa điểm, người báo cáo hoặc nội dung..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">Hiển thị:</span>
            <span className="text-xs font-bold text-slate-800">{filteredReports.length} báo cáo</span>
          </div>
        </div>

        {/* Scrollable Report List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 bg-slate-50/50">
          {filteredReports.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">Không có báo cáo nào trong danh mục này</p>
              <p className="text-xs text-slate-400">Tất cả địa điểm đang ở trạng thái an toàn & chính xác.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const reasonMeta = getReasonMeta(report.reason);
              const targetPlace = places.find((p) => p.id === report.locationId);
              const isPending = report.status === 'pending';
              const isResolved = report.status === 'resolved';
              const isDismissed = report.status === 'dismissed';

              return (
                <div
                  key={report.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs bg-white ${
                    isPending
                      ? 'border-amber-200 ring-1 ring-amber-400/20'
                      : isResolved
                      ? 'border-emerald-200'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  {/* Top Row: Target Place & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {report.locationName}
                        </span>
                        {!targetPlace && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            (Địa điểm đã bị xóa)
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isResolved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {isResolved && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isDismissed && <XCircle className="w-3 h-3 text-slate-500" />}
                          <span>
                            {isPending
                              ? 'Đang chờ xử lý'
                              : isResolved
                              ? 'Đã giải quyết'
                              : 'Đã bỏ qua'}
                          </span>
                        </span>
                      </div>

                      {report.locationAddress && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{report.locationAddress}</span>
                        </p>
                      )}
                    </div>

                    {/* View on Map Shortcut */}
                    {targetPlace && onSelectPlaceOnMap && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectPlaceOnMap(targetPlace);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer self-start sm:self-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Xem trên bản đồ</span>
                      </button>
                    )}
                  </div>

                  {/* Middle Row: Reason & User Description */}
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold flex items-center gap-1">
                        <span>{reasonMeta.icon}</span>
                        <span>{reasonMeta.label}</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        Nội dung phản ánh từ người dùng:
                      </p>
                      <p className="text-slate-800 leading-relaxed text-xs">{report.description}</p>
                    </div>

                    {report.proofUrl && (
                      <div className="text-[11px] text-teal-700">
                        <a
                          href={report.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem bằng chứng / link minh họa: {report.proofUrl}</span>
                        </a>
                      </div>
                    )}

                    {/* Reporter Info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        Người báo cáo: <strong className="text-slate-700">{report.reportedByUserName}</strong>
                        {report.reportedByUserEmail && ` (${report.reportedByUserEmail})`}
                      </span>
                      <span>
                        {new Date(report.createdAt).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {/* Admin Note display (if resolved) */}
                    {report.adminNote && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900">
                        <strong>Ghi chú xử lý của Admin:</strong> {report.adminNote}
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Admin Action Toolbar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    
                    {/* Direct place modification actions */}
                    <div className="flex items-center gap-2">
                      {targetPlace && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditPlace(targetPlace);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          title="Sửa lại thông tin, vị trí, giờ mở cửa, giá cả cho đúng"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa địa điểm này</span>
                        </button>
                      )}

                      {targetPlace && (
                        <button
                          type="button"
                          onClick={() => handleDeletePlaceWithReport(report)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          title="Xóa vĩnh viễn địa điểm vi phạm này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa địa điểm vi phạm</span>
                        </button>
                      )}
                    </div>

                    {/* Status Toggle buttons */}
                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDismiss(report.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Bác bỏ (Bỏ qua)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResolve(report.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Duyệt & Đã xử lý</span>
                          </button>
                        </>
                      )}

                      {!isPending && (
                        <button
                          type="button"
                          onClick={() => onUpdateReportStatus(report.id, 'pending')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                        >
                          Mở lại báo cáo
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Xóa bản ghi báo cáo này?')) {
                            await onDeleteReport(report.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Xóa bản ghi báo cáo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Admin có quyền cập nhật tọa độ hoặc gỡ bỏ địa điểm để đảm bảo dữ liệu luôn chính xác.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
