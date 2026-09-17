import React, { useState } from 'react';
import { TravelExpense, ExpenseCategory, TravelPlace, TravelTrip, UserProfile } from '../types';
import {
  X,
  Coins,
  Plus,
  Trash2,
  PieChart,
  Calendar,
  CreditCard,
  Banknote,
  Utensils,
  Ticket,
  Car,
  Hotel,
  ShoppingBag,
  User,
} from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: TravelExpense[];
  trips: TravelTrip[];
  places: TravelPlace[];
  currentUser?: UserProfile | null;
  onSaveExpense: (expense: TravelExpense) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; icon: any; color: string }> = {
  food: { label: 'Ăn uống', icon: Utensils, color: 'text-amber-600 bg-amber-50' },
  ticket: { label: 'Vé tham quan', icon: Ticket, color: 'text-blue-600 bg-blue-50' },
  transport: { label: 'Di chuyển / Xăng', icon: Car, color: 'text-teal-600 bg-teal-50' },
  hotel: { label: 'Khách sạn / Lưu trú', icon: Hotel, color: 'text-purple-600 bg-purple-50' },
  shopping: { label: 'Mua sắm / Quà', icon: ShoppingBag, color: 'text-rose-600 bg-rose-50' },
  other: { label: 'Chi phí khác', icon: Coins, color: 'text-slate-600 bg-slate-50' },
};

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenses,
  trips,
  places,
  currentUser,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [tripId, setTripId] = useState<string>(trips[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên khoản chi!');
      return;
    }

    const newExp: TravelExpense = {
      id: `exp-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.name,
      tripId: tripId || undefined,
      title: title.trim(),
      category,
      amount: Number(amount) || 0,
      paymentMethod,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExp);
    setIsAdding(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Sổ Chi Tiêu Du Lịch (travel_expenses)
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser?.role === 'admin'
                  ? 'Chế độ Quản Trị: Quản lý và thống kê toàn bộ chi phí hệ thống'
                  : `Sổ chi tiêu riêng tư của ${currentUser?.name || currentUser?.email || 'bạn'} (Bảo mật theo tài khoản)`}
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

        {/* Total Summary Banner */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] text-emerald-200 uppercase font-semibold">
              Tổng Chi Phí Đã Ghi Nhận
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold">
              {totalAmount.toLocaleString('vi-VN')} <span className="text-sm font-normal">VND</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Xem Danh Sách' : 'Ghi Khoản Chi'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
          {isAdding ? (
            /* Add Expense Form */
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border">
              <h3 className="font-bold text-slate-900 text-xs">Thêm Khoản Chi Tiêu Mới</h3>
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Khoản Chi *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Vé Cáp treo Bà Nà Hills, Bánh mì Phượng..."
                  className="w-full px-3 py-2 bg-white border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Tiền (VND) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân Loại Chi Tiêu</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border rounded-xl"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gắn Vào Chuyến Đi</label>
                  <select
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border rounded-xl"
                  >
                    <option value="">Chi tiêu tự do (Không theo chuyến)</option>
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình Thức Thanh Toán</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border rounded-xl"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                    <option value="card">Thẻ tín dụng / Visa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Thêm</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú hóa đơn hoặc người thanh toán..."
                  className="w-full px-3 py-2 bg-white border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Lưu Khoản Chi
                </button>
              </div>
            </form>
          ) : (
            /* Expenses List */
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Coins className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {currentUser?.name
                      ? `Tài khoản ${currentUser.name} chưa ghi nhận khoản chi nào.`
                      : 'Chưa có khoản chi nào được lưu.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Khoản chi được bảo mật theo tài khoản cá nhân. Bấm &quot;Ghi Khoản Chi&quot; để thêm!
                  </p>
                </div>
              ) : (
                expenses.map((exp) => {
                  const catMeta = CATEGORY_MAP[exp.category] || CATEGORY_MAP.food;
                  const Icon = catMeta.icon;
                  return (
                    <div
                      key={exp.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${catMeta.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-slate-900 truncate">{exp.title}</p>
                            {currentUser?.role === 'admin' && (exp.userName || exp.userEmail) && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium inline-flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                {exp.userName || exp.userEmail}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{catMeta.label}</span>
                            <span>•</span>
                            <span>{new Date(exp.createdAt).toLocaleDateString('vi-VN')}</span>
                            {exp.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate">{exp.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-xs text-slate-900">
                          {Number(exp.amount).toLocaleString('vi-VN')} đ
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
