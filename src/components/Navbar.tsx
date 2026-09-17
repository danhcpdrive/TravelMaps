import React from 'react';
import {
  Compass,
  Upload,
  Plus,
  Navigation,
  RefreshCw,
  Code2,
  Calendar,
  MessageSquare,
  Coins,
  User,
  Flag,
  LogIn,
  Share2,
  Users,
} from 'lucide-react';
import { SupabaseConfigStatus, UserProfile } from '../types';
import { getRoleBadge } from '../lib/auth';

interface NavbarProps {
  totalCount: number;
  visitedCount: number;
  favoriteCount: number;
  filteredCount: number;
  tripsCount?: number;
  reviewsCount?: number;
  pendingReportsCount?: number;
  currentUser: UserProfile | null;
  supabaseStatus: SupabaseConfigStatus | null;
  isLoading: boolean;
  onRefreshData: () => void;
  onOpenImportExport: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAddModal: () => void;
  onOpenTripModal: () => void;
  onOpenReviewModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenTravelReportModal: () => void;
  onOpenAuthModal: () => void;
  onOpenUserProfileModal?: () => void;
  onOpenAdminUserModal?: () => void;
  onOpenAdminReportModal?: () => void;
  onGetUserLocation: () => void;
  hasUserLocation: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  visitedCount,
  favoriteCount,
  filteredCount,
  tripsCount = 0,
  reviewsCount = 0,
  pendingReportsCount = 0,
  currentUser,
  supabaseStatus,
  isLoading,
  onRefreshData,
  onOpenImportExport,
  onOpenSupabaseModal,
  onOpenAddModal,
  onOpenTripModal,
  onOpenReviewModal,
  onOpenExpenseModal,
  onOpenTravelReportModal,
  onOpenAuthModal,
  onOpenUserProfileModal,
  onOpenAdminUserModal,
  onOpenAdminReportModal,
  onGetUserLocation,
  hasUserLocation,
}) => {
  const role = currentUser?.role || 'viewer';
  const isViewer = role === 'viewer';
  const isUser = role === 'user';
  const isAdmin = role === 'admin';
  const canAdd = isUser || isAdmin;
  const roleMeta = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        
        {/* TOP ROW: Brand (Left) and Essential Utilities / Account / Add (Right) */}
        <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2 min-h-[50px]">
          
          {/* BRAND LOGO & TITLE: Always shrink-0 so it NEVER gets obscured or squeezed */}
          <div className="flex items-center space-x-2.5 shrink-0 select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Travel Maps
                </span>
                {(isAdmin || isUser) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200 shrink-0">
                    {isAdmin ? 'Admin' : 'Thành Viên'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block leading-tight">
                {isAdmin
                  ? 'Quản trị hệ thống, Báo cáo & Cơ sở dữ liệu'
                  : isUser
                  ? 'Khám phá địa điểm, Lịch trình & Chi tiêu'
                  : 'Bản đồ du lịch & Điểm đến hấp dẫn'}
              </p>
            </div>
          </div>

          {/* DESKTOP MIDDLE MODULE BUTTONS (hidden on mobile, rendered cleanly on md+) */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar min-w-0 flex-1 justify-center px-2">
            {(isUser || isAdmin) && (
              <div className="flex items-center gap-1.5 shrink-0 text-xs">
                
                {/* 1. Trips / Lịch Trình */}
                <button
                  type="button"
                  onClick={onOpenTripModal}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title="Quản lý Lịch trình chuyến đi"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Lịch Trình ({tripsCount})</span>
                </button>

                {/* 2. Expenses / Chi Tiêu */}
                <button
                  type="button"
                  onClick={onOpenExpenseModal}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title="Sổ chi tiêu du lịch"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chi Tiêu</span>
                </button>

                {/* 3. Reviews / Nhật Ký */}
                <button
                  type="button"
                  onClick={onOpenReviewModal}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title="Nhật ký check-in & Đánh giá"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nhật Ký ({reviewsCount})</span>
                </button>

                {/* 4. Travel Report / Báo Cáo */}
                <button
                  type="button"
                  onClick={onOpenTravelReportModal}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title="Báo cáo Lịch trình, Chi tiêu & Chia sẻ"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Báo Cáo</span>
                </button>

                {/* 5. Admin Reports / Report (Sửa từ Duyệt) */}
                {isAdmin && onOpenAdminReportModal && (
                  <button
                    type="button"
                    onClick={onOpenAdminReportModal}
                    className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0 text-xs"
                    title="Duyệt báo cáo sai sót (Admin)"
                  >
                    <Flag className="w-3.5 h-3.5 text-red-600" />
                    <span>Report ({pendingReportsCount})</span>
                  </button>
                )}

              </div>
            )}
          </div>

          {/* RIGHT SIDE UTILITIES & ACCOUNT: Compact & Always accessible */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* GPS User Location Toggle */}
            <button
              type="button"
              onClick={onGetUserLocation}
              title="Vị trí của tôi (GPS)"
              className={`p-1.5 rounded-lg transition border shrink-0 cursor-pointer ${
                hasUserLocation
                  ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Navigation className={`w-4 h-4 ${hasUserLocation ? 'animate-pulse text-blue-600' : 'text-slate-500'}`} />
            </button>

            {/* Sync / Refresh */}
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isLoading}
              title="Tải lại dữ liệu"
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Account / Profile / Role Buttons */}
            {isViewer ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Đăng nhập tài khoản Thành Viên"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 shrink-0">
                {/* Profile / Hồ Sơ */}
                {onOpenUserProfileModal && (
                  <button
                    type="button"
                    onClick={onOpenUserProfileModal}
                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                    title="Trang quản lý hồ sơ cá nhân"
                  >
                    <User className="w-4 h-4 text-teal-600" />
                  </button>
                )}

                {/* Quản Lý User (Admin) */}
                {isAdmin && onOpenAdminUserModal && (
                  <button
                    type="button"
                    onClick={onOpenAdminUserModal}
                    className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                    title="Quản lý danh sách người dùng & phân quyền (Admin)"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                  </button>
                )}

                {/* SQL DB (Admin) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onOpenSupabaseModal}
                    title="Xem mã Script SQL Database (Admin)"
                    className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Code2 className="w-4 h-4 text-teal-600" />
                  </button>
                )}

                {/* Import / Backup (Admin) - Icon only */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onOpenImportExport}
                    title="Import & Export Dữ liệu (SQL / JSON) (Admin)"
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  title="Chuyển quyền hoặc Đăng xuất"
                >
                  <div className="w-4 h-4 rounded-full overflow-hidden bg-teal-100 border border-teal-200 shrink-0 flex items-center justify-center text-[10px] text-teal-800">
                    {currentUser?.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-teal-700" />
                    )}
                  </div>
                  <span className="truncate max-w-[50px] sm:max-w-[70px] hidden md:inline">{currentUser?.name}</span>
                  {roleMeta && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${roleMeta.badgeBg}`}>
                      {roleMeta.icon}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Add Place Button (Chỉ User và Admin mới có) */}
            {canAdd && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                title="Thêm địa điểm du lịch mới"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Thêm địa điểm</span>
              </button>
            )}

          </div>

        </div>

        {/* MOBILE SUB-ROW: Dedicated Module Scrollable Toolbar (only visible on mobile < md) */}
        {(isUser || isAdmin) && (
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 border-t border-slate-100 text-xs">
            {/* 1. Lịch Trình */}
            <button
              type="button"
              onClick={onOpenTripModal}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3 h-3 text-teal-600" />
              <span>Lịch Trình ({tripsCount})</span>
            </button>

            {/* 2. Chi Tiêu */}
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Coins className="w-3 h-3 text-emerald-600" />
              <span>Chi Tiêu</span>
            </button>

            {/* 3. Nhật Ký */}
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3 h-3 text-amber-600" />
              <span>Nhật Ký ({reviewsCount})</span>
            </button>

            {/* 4. Báo Cáo */}
            <button
              type="button"
              onClick={onOpenTravelReportModal}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3 h-3 text-indigo-600" />
              <span>Báo Cáo</span>
            </button>

            {/* 5. Report (Admin) */}
            {isAdmin && onOpenAdminReportModal && (
              <button
                type="button"
                onClick={onOpenAdminReportModal}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <Flag className="w-3 h-3 text-red-600" />
                <span>Report ({pendingReportsCount})</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
