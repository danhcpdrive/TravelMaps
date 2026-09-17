import bcrypt from 'bcryptjs';
import { UserProfile, UserRole } from '../types';
import {
  fetchUsersFromSupabase,
  upsertUserToSupabase,
  updateUserAvatarInSupabase,
  getSupabaseClient,
  loadLocalUsers,
  saveLocalUsers,
} from './supabase';

const AUTH_USER_KEY = 'travelmaps_current_user_session_v3';

/**
 * Hàm băm mật khẩu bảo mật sử dụng Bcrypt (salt round = 10)
 */
export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, 10);
}

/**
 * Hàm kiểm tra so khớp mật khẩu (Hỗ trợ mã băm Bcrypt chuẩn và chuyển tiếp an toàn)
 */
export function verifyPassword(plainPass: string, storedHashOrPlain?: string): boolean {
  if (!storedHashOrPlain || !plainPass) return false;
  try {
    if (
      storedHashOrPlain.startsWith('$2a$') ||
      storedHashOrPlain.startsWith('$2b$') ||
      storedHashOrPlain.startsWith('$2y$')
    ) {
      if (bcrypt.compareSync(plainPass, storedHashOrPlain)) {
        return true;
      }
    }
  } catch (e) {
    console.warn('bcrypt compare error:', e);
  }
  if (storedHashOrPlain === plainPass) return true;
  return false;
}

// Khách thăm quan mặc định (Chế độ xem tự do, KHÔNG cần tài khoản / đăng nhập)
export const GUEST_VIEWER_USER: UserProfile = {
  id: 'guest-viewer',
  name: 'Khách Thăm Quan',
  email: '',
  role: 'viewer',
  avatarUrl: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Tài khoản Quản trị viên (Admin Trùm) mặc định của hệ thống
// Mật khẩu: 0918273645 (mã băm Bcrypt salt round 10)
export const DEFAULT_ADMIN_USER: UserProfile & { password: string } = {
  id: '1',
  name: 'Trùm',
  email: 'caophuocdanh@hotmail.com',
  password: '$2b$10$/HY5pREN6kXeyehq8KQtoeZDcvCdQARuAboLwPNLlbmqQSITt6Aay',
  role: 'admin',
  phone: '0901234567',
  avatarUrl: '',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Danh sách tài khoản mẫu
export const DEMO_ACCOUNTS: Array<UserProfile & { password: string }> = [DEFAULT_ADMIN_USER];

// Lấy danh sách tài khoản đã đăng ký trong hệ thống
export function getRegisteredUsers(): Array<UserProfile & { password?: string }> {
  const local = loadLocalUsers();
  const adminIndex = local.findIndex(
    (u) =>
      u.email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() ||
      String(u.id) === String(DEFAULT_ADMIN_USER.id) ||
      u.role === 'admin'
  );
  if (adminIndex === -1) {
    local.unshift({ ...DEFAULT_ADMIN_USER });
    saveLocalUsers(local);
  } else {
    // Luôn đảm bảo mật khẩu mới nhất cho tài khoản Admin
    if (
      local[adminIndex].email.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() &&
      local[adminIndex].password !== DEFAULT_ADMIN_USER.password
    ) {
      local[adminIndex].password = DEFAULT_ADMIN_USER.password;
      saveLocalUsers(local);
    }
  }
  return local || [];
}

/**
 * Cập nhật thông tin Hồ sơ cá nhân (Tên, Ảnh đại diện)
 */
export async function updateUserProfile(
  userId: string | number,
  updates: { name?: string; avatarUrl?: string }
): Promise<{ user?: UserProfile; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'viewer') {
    return { error: 'Bạn cần đăng nhập để cập nhật thông tin hồ sơ.' };
  }

  const cleanName = updates.name?.trim();
  if (updates.name !== undefined && !cleanName) {
    return { error: 'Tên hiển thị không được để trống.' };
  }

  const updatedProfile: UserProfile = {
    ...currentUser,
    name: cleanName || currentUser.name,
    avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser.avatarUrl,
  };

  // Cập nhật session hiện tại
  setCurrentUser(updatedProfile);

  // Cập nhật trong danh sách users (Local & Supabase DB)
  const allUsers = loadLocalUsers();
  const userIdx = allUsers.findIndex(
    (u) => String(u.id) === String(userId) || u.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  let savedPassword = hashPassword('123456');
  if (userIdx >= 0) {
    savedPassword = allUsers[userIdx].password || savedPassword;
    allUsers[userIdx] = {
      ...allUsers[userIdx],
      name: updatedProfile.name,
      avatarUrl: updatedProfile.avatarUrl,
    };
    saveLocalUsers(allUsers);
  }

  // 1. Lưu qua upsert
  await upsertUserToSupabase({
    ...updatedProfile,
    password: savedPassword,
  });

  // 2. Cập nhật trực tiếp avatar_url lên Supabase
  if (updatedProfile.avatarUrl !== undefined) {
    await updateUserAvatarInSupabase(
      currentUser.email || String(currentUser.id),
      updatedProfile.avatarUrl
    );
  }

  return { user: updatedProfile };
}

/**
 * Đổi mật khẩu tài khoản
 */
export async function changeUserPassword(
  userId: string,
  currentPass: string,
  newPass: string,
  confirmNewPass: string
): Promise<{ success?: boolean; error?: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'viewer') {
    return { error: 'Bạn cần đăng nhập để thực hiện đổi mật khẩu.' };
  }

  if (!currentPass) {
    return { error: 'Vui lòng nhập mật khẩu hiện tại.' };
  }
  if (!newPass || newPass.length < 4) {
    return { error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' };
  }
  if (newPass !== confirmNewPass) {
    return { error: 'Mật khẩu mới và mật khẩu xác nhận không trùng khớp.' };
  }

  const allUsers = getRegisteredUsers();
  const matched = allUsers.find(
    (u) => u.id === userId || u.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  if (!matched) {
    return { error: 'Không tìm thấy tài khoản trong hệ thống.' };
  }

  // Xác minh mật khẩu cũ
  const isMatch = verifyPassword(currentPass, matched.password);
  if (!isMatch) {
    return { error: 'Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.' };
  }

  // Mã hóa mật khẩu mới với Bcrypt
  const newHashedPassword = hashPassword(newPass);

  // Lưu vào DB & Local
  await upsertUserToSupabase({
    ...currentUser,
    password: newHashedPassword,
  });

  return { success: true };
}

/**
 * Admin: Đổi vai trò của người dùng (Thành Viên <-> Admin)
 */
export async function updateUserRoleInDb(
  userId: string,
  userEmail: string,
  newRole: UserRole
): Promise<{ success?: boolean; error?: string }> {
  if (String(userId) === '1' || userEmail.toLowerCase() === 'caophuocdanh@hotmail.com') {
    if (newRole !== 'admin') {
      return { error: 'Admin ID:1 không thể giáng xuống làm user' };
    }
  }

  const currentLocal = loadLocalUsers();
  const idx = currentLocal.findIndex(
    (u) => String(u.id) === String(userId) || u.email.toLowerCase() === userEmail.toLowerCase()
  );

  if (idx >= 0) {
    currentLocal[idx].role = newRole;
    saveLocalUsers(currentLocal);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('travel_users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .or(`id.eq.${userId},email.eq.${userEmail.toLowerCase()}`);
    } catch (e) {
      console.warn('Failed to update role in Supabase:', e);
    }
  }

  return { success: true };
}

/**
 * Admin: Đổi mật khẩu người dùng trực tiếp
 */
export async function adminResetUserPassword(
  userId: string,
  userEmail: string,
  newPass: string
): Promise<{ success?: boolean; error?: string }> {
  if (!newPass || newPass.length < 4) {
    return { error: 'Mật khẩu mới phải có ít nhất 4 ký tự.' };
  }

  const hashedPassword = hashPassword(newPass);
  const currentLocal = loadLocalUsers();
  const matched = currentLocal.find(
    (u) => String(u.id) === String(userId) || u.email.toLowerCase() === userEmail.toLowerCase()
  );

  if (matched) {
    matched.password = hashedPassword;
    saveLocalUsers(currentLocal);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('travel_users')
        .update({ password: hashedPassword, updated_at: new Date().toISOString() })
        .or(`id.eq.${userId},email.eq.${userEmail.toLowerCase()}`);
    } catch (e) {
      console.warn('Failed to reset password in Supabase:', e);
    }
  }

  return { success: true };
}

/**
 * Admin: Xóa tài khoản người dùng
 */
export async function deleteUserInDb(
  userId: string,
  userEmail: string
): Promise<{ success?: boolean; error?: string }> {
  if (String(userId) === '1' || userEmail.toLowerCase() === 'caophuocdanh@hotmail.com') {
    return { error: 'Admin ID:1 không thể xóa khỏi hệ thống' };
  }

  const currentLocal = loadLocalUsers();
  const updated = currentLocal.filter(
    (u) => String(u.id) !== String(userId) && u.email.toLowerCase() !== userEmail.toLowerCase()
  );
  saveLocalUsers(updated);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('travel_users')
        .delete()
        .or(`id.eq.${userId},email.eq.${userEmail.toLowerCase()}`);
    } catch (e) {
      console.warn('Failed to delete user in Supabase:', e);
    }
  }

  return { success: true };
}

// Lấy thông tin người dùng hiện tại (Mặc định là Khách xem nếu chưa đăng nhập)
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.role) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read user session:', e);
  }

  // Khách xem là trạng thái mặc định không cần đăng nhập
  return GUEST_VIEWER_USER;
}

// Cập nhật người dùng hiện tại
export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user && user.role !== 'viewer') {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to set current user:', e);
  }
}

// Đăng nhập kết nối Cơ Sở Dữ Liệu (Supabase DB + Local Fallback)
export async function loginUser(
  emailOrUsername: string,
  pass: string
): Promise<{ user?: UserProfile; error?: string; isDbConnected?: boolean }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanInput) {
    return { error: 'Vui lòng nhập email hoặc tên đăng nhập admin.' };
  }
  if (!cleanPass) {
    return { error: 'Vui lòng nhập mật khẩu.' };
  }

  // Hỗ trợ nhập "admin" hoặc "admin@travelmaps.vn" tương đương với email admin chính caophuocdanh@hotmail.com
  const isAdminAlias = cleanInput === 'admin' || cleanInput === 'admin@travelmaps.vn';
  const targetEmail = isAdminAlias ? DEFAULT_ADMIN_USER.email.toLowerCase() : cleanInput;

  let dbMatched: any = null;
  let isDb = false;

  // 1. Thử xác thực trực tiếp từ Supabase Database
  const client = getSupabaseClient();
  if (client) {
    try {
      let query = client.from('travel_users').select('*');
      if (isAdminAlias) {
        query = query.or(`email.eq.${targetEmail},role.eq.admin`);
      } else {
        query = query.eq('email', targetEmail);
      }
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        dbMatched = data;
        isDb = true;
      }
    } catch (e) {
      console.warn('Supabase auth query error:', e);
    }
  }

  // 2. Nếu DB chưa có hoặc lỗi, fallback qua danh sách local/demo
  if (!dbMatched) {
    const allUsers = getRegisteredUsers();
    const localMatch = allUsers.find(
      (u) =>
        u.email.toLowerCase() === targetEmail ||
        u.email.toLowerCase() === cleanInput ||
        (isAdminAlias && u.role === 'admin')
    );
    if (localMatch) {
      dbMatched = localMatch;
    }
  }

  // Fallback an toàn cho tài khoản Admin
  if (!dbMatched && (isAdminAlias || targetEmail === DEFAULT_ADMIN_USER.email.toLowerCase())) {
    dbMatched = DEFAULT_ADMIN_USER;
  }

  if (!dbMatched) {
    return {
      error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc chọn Đăng Ký.',
    };
  }

  // 3. Kiểm tra mật khẩu (Hỗ trợ mật khẩu admin 0918273645 và mã hóa Bcrypt)
  const isAdminAccount =
    dbMatched.role === 'admin' ||
    dbMatched.email?.toLowerCase() === DEFAULT_ADMIN_USER.email.toLowerCase() ||
    isAdminAlias;

  const isExactAdminPass = isAdminAccount && cleanPass === '0918273645';
  const isPasswordValid = isExactAdminPass || verifyPassword(cleanPass, dbMatched.password);

  if (!isPasswordValid) {
    return {
      error: 'Mật khẩu không chính xác. Vui lòng kiểm tra và thử lại.',
    };
  }

  const userProfile: UserProfile = {
    id: dbMatched.id || DEFAULT_ADMIN_USER.id,
    name: dbMatched.name || (isAdminAccount ? 'Trùm' : 'Người dùng'),
    email: dbMatched.email || (isAdminAccount ? DEFAULT_ADMIN_USER.email : cleanInput),
    role: (dbMatched.role as UserRole) || (isAdminAccount ? 'admin' : 'user'),
    avatarUrl:
      dbMatched.avatar_url ||
      dbMatched.avatarUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbMatched.name || 'Admin')}`,
    createdAt: dbMatched.created_at || dbMatched.createdAt || new Date().toISOString(),
  };

  setCurrentUser(userProfile);

  // Đồng bộ lại mật khẩu mới cho admin và lưu vào local & Supabase
  const savedPassword = isExactAdminPass
    ? DEFAULT_ADMIN_USER.password
    : dbMatched.password?.startsWith('$2')
    ? dbMatched.password
    : hashPassword(cleanPass);

  upsertUserToSupabase({ ...userProfile, password: savedPassword });

  return { user: userProfile, isDbConnected: isDb };
}

// Đăng ký tài khoản Thành Viên (User) mới lưu trực tiếp vào Database Supabase
export async function registerUser(
  name: string,
  email: string,
  pass: string,
  role: UserRole = 'user',
  avatarUrl?: string
): Promise<{ user?: UserProfile; error?: string; isDbConnected?: boolean }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanName) {
    return { error: 'Vui lòng nhập họ và tên của bạn.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Địa chỉ email không đúng định dạng.' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { error: 'Mật khẩu phải có ít nhất 4 ký tự.' };
  }

  // 1. Kiểm tra tài khoản đã tồn tại trong DB Supabase
  const client = getSupabaseClient();
  let isDb = false;
  if (client) {
    try {
      const { data } = await client
        .from('travel_users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data) {
        return { error: 'Email này đã tồn tại trong Database. Vui lòng chuyển sang tab Đăng Nhập.' };
      }
      isDb = true;
    } catch (e) {}
  }

  // Kiểm tra local
  const allUsers = getRegisteredUsers();
  if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { error: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.' };
  }

  const generatedAvatar =
    avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`;

  // Băm mật khẩu bằng Bcrypt trước khi ghi vào Database
  const hashedPassword = hashPassword(cleanPass);

  const newUser: UserProfile & { password?: string } = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: cleanName,
    email: cleanEmail,
    role: (role === 'admin' ? 'admin' : 'user') as UserRole, // Chỉ hỗ trợ đăng ký tài khoản user/admin
    password: hashedPassword, // Lưu mật khẩu đã mã hóa Bcrypt
    avatarUrl: generatedAvatar,
    createdAt: new Date().toISOString(),
  };

  // Lưu vào Supabase DB & Local storage
  await upsertUserToSupabase(newUser);

  const profile: UserProfile = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatarUrl: newUser.avatarUrl,
    createdAt: newUser.createdAt,
  };

  setCurrentUser(profile);
  return { user: profile, isDbConnected: isDb };
}

// Đăng xuất -> Trở về vai trò Khách Xem (Viewer không cần đăng nhập)
export function logoutUser(): UserProfile {
  setCurrentUser(null);
  return GUEST_VIEWER_USER;
}

// Chuyển đổi nhanh giữa các tài khoản mẫu
export function switchRole(role: UserRole): UserProfile {
  if (role === 'viewer') {
    return logoutUser();
  }
  const current = getCurrentUser();
  const updated: UserProfile = { ...current, role };
  setCurrentUser(updated);
  return updated;
}

// Helper kiểm tra quyền (RBAC)
export function canAddPlace(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'user' || user.role === 'admin';
}

export function canEditPlace(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'user';
}

export function canDeletePlace(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

export function canReportPlace(user: UserProfile | null): boolean {
  // Mọi người kể cả Khách xem đều có thể gửi báo cáo địa điểm sai
  return true;
}

export function canManageReports(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

// Meta UI cho vai trò
export function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin (Quản Trị)',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        color: 'red',
        icon: '👑',
        description: 'Toàn quyền quản trị hệ thống, sửa/xóa địa điểm & xử lý báo cáo vi phạm',
      };
    case 'user':
      return {
        label: 'Thành Viên (User)',
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
        color: 'teal',
        icon: '👤',
        description: 'Thêm địa điểm tùy ý không cần xác minh, review, check-in & gửi báo cáo',
      };
    case 'viewer':
    default:
      return {
        label: 'Khách Xem',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        color: 'slate',
        icon: '👁️',
        description: 'Xem bản đồ tự do không cần đăng nhập, tra cứu thông tin & đo khoảng cách',
      };
  }
}


