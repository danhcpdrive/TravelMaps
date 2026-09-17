import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  loginUser,
  registerUser,
  switchRole,
  getRoleBadge,
  logoutUser,
} from '../lib/auth';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  Sparkles,
  Shield,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChanged: (user: UserProfile) => void;
  promptMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  promptMessage,
}) => {
  const [mode, setMode] = useState<'switch' | 'login' | 'register'>('switch');

  // Login & Register Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentRole = currentUser?.role || 'viewer';

  // Quick 1-click switch
  const handleQuickSwitch = (role: UserRole) => {
    if (role === 'viewer') {
      const guest = logoutUser();
      onUserChanged(guest);
    } else {
      const user = switchRole(role);
      onUserChanged(user);
    }
    onClose();
  };

  // Submit login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        setSuccess(`Đăng nhập thành công! Chào mừng ${res.user.name}`);
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Submit register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser(name, email, password, 'user');
      if (res.error) {
        setError(res.error);
      } else if (res.user) {
        setSuccess(`Đăng ký thành công tài khoản Thành Viên!`);
        setTimeout(() => {
          onUserChanged(res.user!);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Tài Khoản & Phân Quyền
              </h2>
              <p className="text-xs text-slate-500">
                Chuyển đổi vai trò nhanh hoặc đăng nhập tài khoản
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

        {/* Prompt Alert if opened by restricted action */}
        {promptMessage && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          
          {/* Nav Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setMode('switch');
                setError('');
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'switch' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              ⚡ Chuyển Quyền Nhanh (1-Click)
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer ${
                mode !== 'switch' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              🔑 Đăng Nhập / Đăng Ký
            </button>
          </div>

          {/* Mode 1: Quick 1-Click Role Switch */}
          {mode === 'switch' && (
            <div className="space-y-2.5">
              
              {/* Option 1: Viewer (Khách) */}
              <div
                onClick={() => handleQuickSwitch('viewer')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  currentRole === 'viewer'
                    ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                    👁️
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">Khách Xem (Không cần đăng nhập)</span>
                      {currentRole === 'viewer' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                          Đang kích hoạt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chế độ khách vãng lai tự do tra cứu bản đồ, không cần tài khoản và không can thiệp database.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                >
                  Chọn
                </button>
              </div>

              {/* Option 2: User (Thành viên) */}
              <div
                onClick={() => handleQuickSwitch('user')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  currentRole === 'user'
                    ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-lg shrink-0">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">Thành Viên (User)</span>
                      {currentRole === 'user' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                          Đang kích hoạt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Được thêm địa điểm mới, tạo lịch trình, ghi chép chi tiêu & viết nhật ký.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                >
                  Chọn
                </button>
              </div>

              {/* Option 3: Admin (Quản trị viên) */}
              <div
                onClick={() => handleQuickSwitch('admin')}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  currentRole === 'admin'
                    ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-lg shrink-0">
                    ⭐
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">Quản Trị Viên (Admin)</span>
                      {currentRole === 'admin' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">
                          Đang kích hoạt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toàn quyền hệ thống, duyệt báo cáo sai sót, xem SQL DB & Import dữ liệu.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
                >
                  Chọn
                </button>
              </div>

            </div>
          )}

          {/* Mode 2: Login or Register */}
          {mode !== 'switch' && (
            <div className="space-y-3.5">
              
              {/* Error or Success notification */}
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="user@travelmaps.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Auto-fill buttons */}
                {mode === 'login' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Tài khoản mẫu:</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                        🔒 Bảo mật Bcrypt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@travelmaps.vn');
                          setPassword('admin123');
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
                      >
                        ⭐ Admin (admin123)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('user@travelmaps.vn');
                          setPassword('user123');
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
                      >
                        👤 Thành Viên (user123)
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}</span>
                </button>
              </form>

              {/* Toggle Login / Register */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-xs text-teal-700 hover:underline font-semibold"
                >
                  {mode === 'login'
                    ? 'Chưa có tài khoản? Bấm vào đây để Đăng ký'
                    : 'Đã có tài khoản? Bấm vào đây để Đăng nhập'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
