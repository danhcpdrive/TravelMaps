import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getRoleBadge, updateUserProfile, changeUserPassword } from '../lib/auth';
import {
  X,
  User,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  Heart,
  Calendar,
  Coins,
  Camera,
  Sparkles,
  Users,
  Code2,
  Upload,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserUpdated: (user: UserProfile) => void;
  onLogout: () => void;
  placesCount?: number;
  visitedCount?: number;
  favoriteCount?: number;
  tripsCount?: number;
  expensesCount?: number;
  onOpenAdminUserModal?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenImportExport?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onLogout,
  placesCount = 0,
  visitedCount = 0,
  favoriteCount = 0,
  tripsCount = 0,
  expensesCount = 0,
  onOpenAdminUserModal,
  onOpenSupabaseModal,
  onOpenImportExport,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  // Edit profile state
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  // Status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const roleMeta = getRoleBadge(currentUser.role);
  const joinedDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa xác định';

  // Submit profile edit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await updateUserProfile(currentUser.id, {
        name,
        avatarUrl,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        setSuccess('Đã cập nhật thông tin hồ sơ thành công!');
        onUserUpdated(res.user);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Submit password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await changeUserPassword(currentUser.id, currentPass, newPass, confirmNewPass);

      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Trang Quản Lý Hồ Sơ
              </h2>
              <p className="text-xs text-slate-500">
                Thông tin cá nhân & cài đặt mật khẩu tài khoản
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Quick Info Banner */}
        <div className="p-4 bg-linear-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 bg-teal-900 shrink-0 shadow-xs">
              <img
                src={avatarUrl || currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute(
                    'src',
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name)}`
                  );
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">{currentUser.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleMeta.badgeBg}`}>
                  {roleMeta.icon} {roleMeta.label}
                </span>
              </div>
              <p className="text-xs text-teal-100/90 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-teal-200" />
                <span>{currentUser.email || 'Chưa cập nhật email'}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-teal-100 shrink-0 hidden sm:block">
            <span>Tham gia: </span>
            <span className="font-bold text-white">{joinedDate}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Admin Quick Tools (Only if Admin) */}
          {currentUser.role === 'admin' && (onOpenAdminUserModal || onOpenSupabaseModal || onOpenImportExport) && (
            <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                Công cụ Quản Trị Hệ Thống (Admin)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {onOpenAdminUserModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminUserModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quản Lý User</span>
                  </button>
                )}

                {onOpenSupabaseModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSupabaseModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Code2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Mã Script SQL</span>
                  </button>
                )}

                {onOpenImportExport && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenImportExport();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Import & Backup</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveTab('info');
                setError('');
                setSuccess('');
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Thông Tin Cá Nhân</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setError('');
                setSuccess('');
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Đổi Mật Khẩu</span>
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Tab 1: Profile Information & Preset Avatars */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              
              {/* Account Stats Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-teal-600 font-bold mb-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{placesCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Địa điểm đã lưu</span>
                </div>

                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{visitedCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Đã ghé thăm</span>
                </div>

                <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-rose-600 font-bold mb-0.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{favoriteCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Yêu thích</span>
                </div>

                <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-indigo-700 font-bold mb-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{tripsCount}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Lịch trình</span>
                </div>
              </div>

              {/* Form edit profile */}
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên hiển thị
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên hiển thị..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ Email (Định danh tài khoản)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={currentUser.email || 'Chưa có email'}
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Email cố định không thể thay đổi sau khi đăng ký.</p>
                </div>

                {/* Preset Avatars Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ảnh đại diện
                  </label>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-slate-500">Chọn mẫu nhanh:</span>
                    <div className="flex items-center gap-1.5">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                            avatarUrl === url
                              ? 'border-teal-600 ring-2 ring-teal-500/30'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setAvatarUrl(
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              name || 'random'
                            )}`
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[10px] text-teal-800 font-bold hover:bg-teal-100 transition"
                      >
                        🎲 Tạo ngẫu nhiên
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh trực tiếp (https://...)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Change Password */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Bảo mật tài khoản</span>
                </div>
                <p className="text-[11px] text-purple-700/90 leading-relaxed">
                  Mật khẩu được mã hóa an toàn hai chiều với chuẩn mã hóa Bcrypt. Đảm bảo mật khẩu mới dễ nhớ nhưng đủ mạnh.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmNewPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Đang cập nhật...' : 'Xác Nhận Đổi Mật Khẩu'}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer with Logout Button */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Đăng Xuất Tài Khoản</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
