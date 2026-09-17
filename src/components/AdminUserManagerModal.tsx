import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  getRegisteredUsers,
  getRoleBadge,
  updateUserRoleInDb,
  adminResetUserPassword,
  deleteUserInDb,
  registerUser,
} from '../lib/auth';
import { fetchUsersFromSupabase } from '../lib/supabase';
import {
  X,
  Users,
  Search,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Key,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminUserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const AdminUserManagerModal: React.FC<AdminUserManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<Array<UserProfile & { password?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add new user sub-modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newConfirmPass, setNewConfirmPass] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [showAddPass, setShowAddPass] = useState(false);

  // Reset password sub-modal
  const [resetTargetUser, setResetTargetUser] = useState<(UserProfile & { password?: string }) | null>(null);
  const [resetPassInput, setResetPassInput] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);

  // Delete confirm target
  const [deleteTargetUser, setDeleteTargetUser] = useState<(UserProfile & { password?: string }) | null>(null);

  const loadUsersData = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchUsersFromSupabase();
      setUsers(fetched);
    } catch (e) {
      setUsers(getRegisteredUsers());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsersData();
    }
  }, [isOpen]);

  if (!isOpen || currentUser?.role !== 'admin') return null;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalMembers = users.filter((u) => u.role === 'user').length;

  // Handle role change
  const handleRoleChange = async (user: UserProfile, targetRole: UserRole) => {
    if (user.id === currentUser.id) {
      setStatusMessage({ type: 'error', text: 'Bạn không thể tự giáng cấp tài khoản Admin đang đăng nhập!' });
      return;
    }

    try {
      await updateUserRoleInDb(user.id, user.email, targetRole);
      setStatusMessage({
        type: 'success',
        text: `Đã cập nhật vai trò của ${user.name} thành ${targetRole === 'admin' ? 'Quản Trị Viên (Admin)' : 'Thành Viên (User)'}`,
      });
      loadUsersData();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Cập nhật vai trò thất bại.' });
    }
  };

  // Handle create user by Admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== newConfirmPass) {
      setStatusMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(newName, newEmail, newPass, newRole);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Đã tạo tài khoản ${newRole === 'admin' ? 'Admin' : 'Thành Viên'} cho ${newName}!`,
        });
        setIsAddUserOpen(false);
        setNewName('');
        setNewEmail('');
        setNewPass('');
        setNewConfirmPass('');
        loadUsersData();
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Tạo tài khoản mới thất bại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password by Admin
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetPassInput) return;

    try {
      const res = await adminResetUserPassword(resetTargetUser.id, resetTargetUser.email, resetPassInput);
      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Đã đặt lại mật khẩu cho tài khoản ${resetTargetUser.name}!`,
        });
        setResetTargetUser(null);
        setResetPassInput('');
        loadUsersData();
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Đặt lại mật khẩu thất bại.' });
    }
  };

  // Handle Delete User
  const handleConfirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    if (deleteTargetUser.id === currentUser.id) {
      setStatusMessage({ type: 'error', text: 'Bạn không thể xóa tài khoản Admin đang đăng nhập!' });
      setDeleteTargetUser(null);
      return;
    }

    try {
      await deleteUserInDb(deleteTargetUser.id, deleteTargetUser.email);
      setStatusMessage({
        type: 'success',
        text: `Đã xóa tài khoản ${deleteTargetUser.name} khỏi hệ thống!`,
      });
      setDeleteTargetUser(null);
      loadUsersData();
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Xóa tài khoản thất bại.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-purple-900 text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold border border-purple-500 shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Quản Lý Người Dùng & Phân Quyền (Admin)
              </h2>
              <p className="text-xs text-purple-200">
                Xem danh sách, phân quyền Admin/Thành Viên & quản lý tài khoản
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            
            {/* Stats summary */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
                👥 Tất cả: <strong className="text-slate-900">{users.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 shadow-2xs">
                ⭐ Admin: <strong>{totalAdmins}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 shadow-2xs">
                👤 Thành Viên: <strong>{totalMembers}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={loadUsersData}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
                <span className="hidden sm:inline">Tải lại</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm Người Dùng</span>
              </button>
            </div>

          </div>

          {/* Search bar & Role Filters */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-200 rounded-xl text-xs font-bold text-slate-600 shrink-0">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  roleFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  roleFilter === 'admin' ? 'bg-purple-600 text-white shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                ⭐ Admin
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('user')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  roleFilter === 'user' ? 'bg-teal-600 text-white shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                👤 Thành Viên
              </button>
            </div>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between gap-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* User Table List */}
        <div className="p-4 overflow-y-auto flex-1">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">Không tìm thấy người dùng nào phù hợp.</p>
              <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc lọc theo vai trò khác.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Người dùng</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Vai trò</th>
                    <th className="p-3">Ngày tạo</th>
                    <th className="p-3 text-right">Thao tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const isSelf = user.id === currentUser.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        
                        {/* Name & Avatar */}
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                              <img
                                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{user.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                                    Tôi
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {user.id.substring(0, 12)}...</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3 text-slate-700 font-mono text-[11px]">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border text-[11px] ${badge.badgeBg}`}>
                            <span>{badge.icon}</span>
                            <span>{user.role === 'admin' ? 'Admin' : 'Thành Viên'}</span>
                          </span>
                        </td>

                        {/* Created At */}
                        <td className="p-3 text-slate-500 text-[11px]">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : 'Chưa rõ'}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            {/* Role Toggle Button */}
                            {user.role === 'admin' ? (
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleRoleChange(user, 'user')}
                                title={isSelf ? 'Không thể giáng cấp bản thân' : 'Giáng cấp xuống Thành Viên'}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition ${
                                  isSelf
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 cursor-pointer'
                                }`}
                              >
                                ⬇️ Giáng xuống User
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(user, 'admin')}
                                title="Nâng quyền lên Quản Trị Viên (Admin)"
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                ⬆️ Nâng lên Admin
                              </button>
                            )}

                            {/* Reset Password */}
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetUser(user);
                                setResetPassInput('');
                              }}
                              title="Đặt lại mật khẩu cho người dùng này"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 transition cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setDeleteTargetUser(user)}
                              title={isSelf ? 'Không thể xóa tài khoản bản thân' : 'Xóa tài khoản người dùng'}
                              className={`p-1.5 rounded-lg border transition ${
                                isSelf
                                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                  : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border-slate-200 hover:border-red-200 cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            Dữ liệu người dùng được lưu trữ an toàn trong bảng <code className="font-bold text-slate-700">travel_users</code> (Supabase DB).
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* Sub-modal: Admin Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-purple-300" />
                <h3 className="font-bold text-sm">Thêm Người Dùng Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo</label>
                <div className="relative">
                  <input
                    type={showAddPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showAddPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newConfirmPass}
                  onChange={(e) => setNewConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vai trò khởi tạo</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                >
                  <option value="user">👤 Thành Viên (User)</option>
                  <option value="admin">⭐ Quản Trị Viên (Admin)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Tạo Người Dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Admin Reset Password */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="px-4 py-3 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-200" />
                <h3 className="font-bold text-sm">Đặt Lại Mật Khẩu</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetTargetUser(null)}
                className="text-amber-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminResetPassword} className="p-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Đặt lại mật khẩu cho tài khoản: <strong className="text-slate-900">{resetTargetUser.name}</strong> ({resetTargetUser.email})
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showResetPass ? 'text' : 'password'}
                    required
                    placeholder="Mật khẩu mới ít nhất 4 ký tự..."
                    value={resetPassInput}
                    onChange={(e) => setResetPassInput(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPass(!showResetPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showResetPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Delete Confirm */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="px-4 py-3 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-200" />
                <h3 className="font-bold text-sm">Xác Nhận Xóa Tài Khoản</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="text-red-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong className="text-red-700">{deleteTargetUser.name}</strong> ({deleteTargetUser.email})?
              </p>
              <p className="text-[11px] text-slate-500 bg-red-50 p-2 rounded-lg border border-red-200">
                ⚠️ Thao tác này sẽ gỡ bỏ tài khoản khỏi Database Supabase và Local Storage.
              </p>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetUser(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                >
                  Xác Nhận Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
