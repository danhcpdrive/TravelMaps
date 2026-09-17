import React, { useState, useEffect } from 'react';
import {
  TravelTrip,
  TripStop,
  TravelPlace,
  TransportMode,
  UserProfile,
  TravelExpense,
  ExpenseCategory,
} from '../types';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Car,
  Compass,
  Coins,
  User,
  Edit3,
  FileText,
  Receipt,
  Utensils,
  Ticket,
  Hotel,
  ShoppingBag,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Navigation,
} from 'lucide-react';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TravelTrip[];
  places: TravelPlace[];
  expenses?: TravelExpense[];
  currentUser?: UserProfile | null;
  onSaveTrip: (trip: TravelTrip) => void;
  onDeleteTrip: (tripId: string) => void;
  onSaveExpense?: (expense: TravelExpense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onSelectPlaceOnMap?: (place: TravelPlace) => void;
}

const CATEGORY_OPTIONS: { id: ExpenseCategory; label: string; icon: any; color: string }[] = [
  { id: 'ticket', label: 'Vé tham quan', icon: Ticket, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'food', label: 'Ăn uống', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'transport', label: 'Di chuyển / Xăng', icon: Car, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'hotel', label: 'Khách sạn / Trọ', icon: Hotel, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'shopping', label: 'Mua sắm', icon: ShoppingBag, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'other', label: 'Khác', icon: Coins, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: string }[] = [
  { id: 'driving', label: 'Ô tô', icon: '🚗' },
  { id: 'motorcycle', label: 'Xe máy', icon: '🏍️' },
  { id: 'walking', label: 'Đi bộ', icon: '🚶' },
  { id: 'bicycling', label: 'Xe đạp', icon: '🚲' },
  { id: 'transit', label: 'Xe buýt / Công cộng', icon: '🚌' },
];

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  trips,
  places,
  expenses = [],
  currentUser,
  onSaveTrip,
  onDeleteTrip,
  onSaveExpense,
  onDeleteExpense,
  onSelectPlaceOnMap,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [addingStopDay, setAddingStopDay] = useState<number | null>(null);

  // States for individual stop notes editing
  const [editingNotesStopId, setEditingNotesStopId] = useState<string | null>(null);
  const [stopNotesInput, setStopNotesInput] = useState('');
  const [stopVisitTimeInput, setStopVisitTimeInput] = useState('09:00');
  const [stopTransportModeInput, setStopTransportModeInput] = useState<TransportMode>('driving');

  // States for quick expense adding per stop
  const [addingExpenseStopId, setAddingExpenseStopId] = useState<string | null>(null);
  const [viewingExpensesStopId, setViewingExpensesStopId] = useState<string | null>(null);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(100000);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('ticket');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Synchronize selectedTripId when trips list changes
  useEffect(() => {
    if (trips.length > 0) {
      if (!selectedTripId || !trips.some((t) => t.id === selectedTripId)) {
        setSelectedTripId(trips[0].id);
      }
    } else {
      setSelectedTripId('');
    }
  }, [trips, selectedTripId]);

  // Form State for new / edit trip
  const [tripForm, setTripForm] = useState<Partial<TravelTrip>>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    budget: 5000000,
    status: 'planning',
    stops: [],
  });

  if (!isOpen) return null;

  const currentTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Group stops by dayNumber
  const stopsByDay: Record<number, TripStop[]> = {};
  if (currentTrip?.stops) {
    currentTrip.stops.forEach((stop) => {
      const day = stop.dayNumber || 1;
      if (!stopsByDay[day]) stopsByDay[day] = [];
      stopsByDay[day].push(stop);
    });
    // Sort by orderIndex
    Object.keys(stopsByDay).forEach((d) => {
      stopsByDay[Number(d)].sort((a, b) => a.orderIndex - b.orderIndex);
    });
  }

  // Expenses for the entire selected trip
  const tripExpenses = currentTrip ? expenses.filter((e) => e.tripId === currentTrip.id) : [];
  const totalTripExpenses = tripExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleStartCreateTrip = () => {
    setTripForm({
      id: `trip-${Date.now()}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.name,
      title: 'Chuyến Đi Mới Của Tôi',
      description: 'Lịch trình khám phá các địa điểm yêu thích',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      budget: 3000000,
      coverImage:
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
      status: 'planning',
      stops: [],
    });
    setIsEditingTrip(true);
  };

  const handleSaveTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripForm.title?.trim()) {
      alert('Vui lòng nhập tên chuyến đi!');
      return;
    }

    const savedTrip: TravelTrip = {
      id: tripForm.id || `trip-${Date.now()}`,
      userId: tripForm.userId || currentUser?.id,
      userEmail: tripForm.userEmail || currentUser?.email,
      userName: tripForm.userName || currentUser?.name,
      title: tripForm.title.trim(),
      description: tripForm.description?.trim() || '',
      startDate: tripForm.startDate,
      endDate: tripForm.endDate,
      budget: Number(tripForm.budget) || 0,
      coverImage:
        tripForm.coverImage ||
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
      status: tripForm.status || 'planning',
      stops: tripForm.stops || [],
    };

    onSaveTrip(savedTrip);
    setSelectedTripId(savedTrip.id);
    setIsEditingTrip(false);
  };

  const handleAddStop = (locationId: string, dayNumber: number) => {
    if (!currentTrip) return;
    const existingStops = currentTrip.stops || [];
    const newStop: TripStop = {
      id: `stop-${Date.now()}`,
      tripId: currentTrip.id,
      locationId,
      dayNumber,
      visitTime: '09:00',
      orderIndex: existingStops.filter((s) => s.dayNumber === dayNumber).length + 1,
      transportMode: 'driving',
      stopNotes: '',
    };

    const updatedTrip: TravelTrip = {
      ...currentTrip,
      stops: [...existingStops, newStop],
    };
    onSaveTrip(updatedTrip);
    setAddingStopDay(null);
  };

  const handleDeleteStop = (stopId: string) => {
    if (!currentTrip) return;
    const updatedStops = (currentTrip.stops || []).filter((s) => s.id !== stopId);
    onSaveTrip({ ...currentTrip, stops: updatedStops });
  };

  // Open note editor for a specific stop
  const handleStartEditStopNote = (stop: TripStop) => {
    setEditingNotesStopId(stop.id);
    setStopNotesInput(stop.stopNotes || '');
    setStopVisitTimeInput(stop.visitTime || '09:00');
    setStopTransportModeInput(stop.transportMode || 'driving');
  };

  // Save updated notes & details for a specific stop
  const handleSaveStopNote = (stopId: string) => {
    if (!currentTrip) return;
    const updatedStops = (currentTrip.stops || []).map((s) => {
      if (s.id === stopId) {
        return {
          ...s,
          stopNotes: stopNotesInput.trim(),
          visitTime: stopVisitTimeInput || '09:00',
          transportMode: stopTransportModeInput,
        };
      }
      return s;
    });

    onSaveTrip({ ...currentTrip, stops: updatedStops });
    setEditingNotesStopId(null);
  };

  // Open quick expense editor for a specific stop
  const handleStartQuickExpense = (stop: TripStop, placeName: string) => {
    setAddingExpenseStopId(stop.id);
    setExpenseTitle(`Chi phí tại ${placeName}`);
    setExpenseAmount(100000);
    setExpenseCategory('ticket');
    setExpensePaymentMethod('cash');
    setExpenseNotes('');
  };

  // Save quick expense directly associated with this stop and trip
  const handleSaveQuickExpenseSubmit = (
    e: React.FormEvent,
    stop: TripStop,
    placeName: string,
    addAnother = false
  ) => {
    e.preventDefault();
    if (!currentTrip) return;
    if (!expenseTitle.trim()) {
      alert('Vui lòng nhập tên khoản chi!');
      return;
    }
    if (!expenseAmount || expenseAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const newExpense: TravelExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userName: currentUser?.name,
      tripId: currentTrip.id,
      locationId: stop.locationId,
      locationName: placeName,
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: Number(expenseAmount),
      paymentMethod: expensePaymentMethod,
      notes: expenseNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    if (onSaveExpense) {
      onSaveExpense(newExpense);
    }

    if (addAnother) {
      setExpenseTitle('');
      setExpenseAmount(50000);
      setExpenseNotes('');
      setViewingExpensesStopId(stop.id);
    } else {
      setAddingExpenseStopId(null);
      setViewingExpensesStopId(stop.id); // Auto show expense list
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Lập Kế Hoạch & Lịch Trình Chuyến Đi
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser?.role === 'admin'
                  ? `Chế độ Quản Trị Viên: Quản lý và xem lịch trình hệ thống`
                  : `Lịch trình riêng tư của: ${currentUser?.name || currentUser?.email || 'bạn'}`}
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

        {/* Modal Content: Sidebar List + Trip Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left: Trip List Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-200 bg-slate-50/70 p-3 flex flex-col gap-2 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chuyến Đi ({trips.length})
              </span>
              <button
                type="button"
                onClick={handleStartCreateTrip}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo mới</span>
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                Chưa có chuyến đi nào
              </div>
            ) : (
              trips.map((t) => {
                const isSelected = t.id === (currentTrip?.id || '');
                const tripExps = expenses.filter((e) => e.tripId === t.id);
                const tripTotal = tripExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTripId(t.id);
                      setIsEditingTrip(false);
                      setEditingNotesStopId(null);
                      setAddingExpenseStopId(null);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-xs ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {currentUser?.role === 'admin' && (t.userName || t.userEmail) && (
                      <div className="mb-1 text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        <span>{t.userName || t.userEmail}</span>
                      </div>
                    )}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {t.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {t.startDate || 'Chưa đặt'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-teal-700">
                        {t.stops?.length || 0} điểm
                      </span>
                    </div>

                    {tripTotal > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Chi phí:</span>
                        <span className="font-bold text-emerald-700">
                          {tripTotal.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Trip Content / Edit Mode */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
            
            {isEditingTrip ? (
              /* Edit / Create Trip Form */
              <form onSubmit={handleSaveTripSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {tripForm.id ? 'Chỉnh Sửa Thông Tin Chuyến Đi' : 'Tạo Chuyến Đi Mới'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingTrip(false)}
                    className="text-xs text-slate-500 hover:underline cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Chuyến Đi *</label>
                  <input
                    type="text"
                    required
                    value={tripForm.title || ''}
                    onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })}
                    placeholder="Ví dụ: Du lịch Đà Lạt 3 Ngày 2 Đêm..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu</label>
                    <input
                      type="date"
                      value={tripForm.startDate || ''}
                      onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày Kết Thúc</label>
                    <input
                      type="date"
                      value={tripForm.endDate || ''}
                      onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngân Sách Dự Kiến (VND)</label>
                    <input
                      type="number"
                      value={tripForm.budget || 0}
                      onChange={(e) => setTripForm({ ...tripForm, budget: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Trạng Thái</label>
                    <select
                      value={tripForm.status || 'planning'}
                      onChange={(e) => setTripForm({ ...tripForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    >
                      <option value="planning">Đang lên kế hoạch</option>
                      <option value="ongoing">Đang trong chuyến đi</option>
                      <option value="completed">Đã hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mô Tả & Mục Tiêu Chuyến Đi</label>
                  <textarea
                    rows={2}
                    value={tripForm.description || ''}
                    onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                    placeholder="Mục tiêu chuyến đi, trải nghiệm mong muốn..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTrip(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Lưu Lịch Trình
                  </button>
                </div>
              </form>
            ) : currentTrip ? (
              /* Trip Overview & Day-by-Day Stops */
              <div className="space-y-4">
                
                {/* Trip Banner Header */}
                <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-4 text-white space-y-3 relative overflow-hidden shadow-xs">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 uppercase tracking-wider">
                        {currentTrip.status === 'ongoing'
                          ? 'Đang diễn ra'
                          : currentTrip.status === 'completed'
                          ? 'Đã hoàn thành'
                          : 'Đang lên kế hoạch'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTripForm(currentTrip);
                            setIsEditingTrip(true);
                          }}
                          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn xóa lịch trình này?')) {
                              onDeleteTrip(currentTrip.id);
                            }
                          }}
                          className="p-1 text-rose-300 hover:text-rose-100 rounded-lg cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold mt-1">{currentTrip.title}</h3>
                    {currentTrip.description && (
                      <p className="text-xs text-slate-200 line-clamp-2">{currentTrip.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 pt-3 border-t border-white/10 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-teal-300" />
                        {currentTrip.startDate} → {currentTrip.endDate}
                      </span>
                      
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Coins className="w-3.5 h-3.5" />
                        Ngân sách: {currentTrip.budget?.toLocaleString('vi-VN') || 0} đ
                      </span>

                      <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                        <Receipt className="w-3.5 h-3.5" />
                        Đã chi: {totalTripExpenses.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    {/* Budget Progress Bar */}
                    {currentTrip.budget ? (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                          <span>Tiến độ ngân sách</span>
                          <span>
                            {Math.round((totalTripExpenses / currentTrip.budget) * 100)}%
                            {totalTripExpenses > currentTrip.budget && (
                              <span className="text-rose-300 ml-1 font-bold">(Vượt ngân sách)</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              totalTripExpenses > currentTrip.budget ? 'bg-rose-400' : 'bg-teal-400'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((totalTripExpenses / currentTrip.budget) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Day-by-Day Stops Section */}
                <div className="space-y-4">
                  {[1, 2, 3].map((dayNum) => {
                    const stops = stopsByDay[dayNum] || [];
                    return (
                      <div
                        key={dayNum}
                        className="border border-slate-200 rounded-xl bg-slate-50/50 p-3.5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {dayNum}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              Ngày {dayNum} (Lộ trình khám phá)
                            </span>
                            <span className="text-[11px] text-slate-500">
                              • {stops.length} điểm dừng
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setAddingStopDay(addingStopDay === dayNum ? null : dayNum)}
                            className="px-2.5 py-1 bg-white border border-teal-300 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm điểm đến</span>
                          </button>
                        </div>

                        {/* Place Picker if Adding */}
                        {addingStopDay === dayNum && (
                          <div className="p-3 bg-white border border-teal-300 rounded-xl space-y-2 animate-in fade-in duration-150">
                            <p className="text-xs font-bold text-slate-700">
                              Chọn địa điểm từ danh bạ để thêm vào Ngày {dayNum}:
                            </p>
                            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                              {places.map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() => handleAddStop(p.id, dayNum)}
                                  className="py-1.5 px-2 hover:bg-teal-50 rounded-lg cursor-pointer flex items-center justify-between text-xs transition"
                                >
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{p.address}</p>
                                  </div>
                                  <span className="text-teal-600 font-bold shrink-0 ml-2">+ Chọn</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stops Timeline */}
                        {stops.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2 text-center">
                            Chưa có điểm dừng nào cho Ngày {dayNum}. Bấm &quot;Thêm điểm đến&quot; để xếp lịch.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {stops.map((stop, idx) => {
                              const placeObj = places.find((p) => p.id === stop.locationId);
                              const placeName = placeObj?.name || 'Điểm dừng chân';

                              // Find expenses associated with this trip & location
                              const stopExpenses = expenses.filter(
                                (e) => e.tripId === currentTrip.id && e.locationId === stop.locationId
                              );
                              const stopExpenseTotal = stopExpenses.reduce(
                                (sum, e) => sum + (Number(e.amount) || 0),
                                0
                              );

                              const isEditingNote = editingNotesStopId === stop.id;
                              const isAddingExpense = addingExpenseStopId === stop.id;
                              const isViewingExpenses = viewingExpensesStopId === stop.id;

                              return (
                                <div
                                  key={stop.id}
                                  className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs transition hover:border-slate-300"
                                >
                                  {/* Top Stop Header Row */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        {idx + 1}
                                      </div>
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-slate-900 truncate">
                                          {placeName}
                                        </h5>
                                        <p className="text-[10px] text-slate-500 truncate">
                                          {placeObj?.address || 'Địa chỉ địa điểm'}
                                        </p>

                                        {/* Stop Meta Badges */}
                                        <div className="flex items-center gap-1.5 mt-1 text-[10px] flex-wrap">
                                          {stop.visitTime && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                              <Clock className="w-2.5 h-2.5 text-slate-500" />
                                              <span>{stop.visitTime}</span>
                                            </span>
                                          )}

                                          {stop.transportMode && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                                              <span>
                                                {TRANSPORT_MODES.find((m) => m.id === stop.transportMode)?.icon || '🚗'}
                                              </span>
                                              <span>
                                                {TRANSPORT_MODES.find((m) => m.id === stop.transportMode)?.label || 'Di chuyển'}
                                              </span>
                                            </span>
                                          )}

                                          {/* Total Expense Badge */}
                                          {stopExpenseTotal > 0 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setViewingExpensesStopId(isViewingExpenses ? null : stop.id)
                                              }
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition cursor-pointer"
                                              title="Xem danh sách chi phí tại điểm này"
                                            >
                                              <Receipt className="w-2.5 h-2.5 text-emerald-600" />
                                              <span>{stopExpenseTotal.toLocaleString('vi-VN')} đ</span>
                                              <span className="text-[9px] text-emerald-600 font-normal">
                                                ({stopExpenses.length})
                                              </span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* Note Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          isEditingNote
                                            ? setEditingNotesStopId(null)
                                            : handleStartEditStopNote(stop)
                                        }
                                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                                          stop.stopNotes
                                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Nhập / Sửa ghi chú địa điểm"
                                      >
                                        <FileText className="w-3 h-3 text-amber-600" />
                                        <span>{stop.stopNotes ? 'Ghi chú' : '+ Ghi chú'}</span>
                                      </button>

                                      {/* Quick Expense Button */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          isAddingExpense
                                            ? setAddingExpenseStopId(null)
                                            : handleStartQuickExpense(stop, placeName)
                                        }
                                        className="px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
                                        title="Thêm nhanh khoản chi tiêu tại điểm này"
                                      >
                                        <Coins className="w-3 h-3 text-emerald-600" />
                                        <span>+ Chi phí</span>
                                      </button>

                                      {/* View Map */}
                                      {placeObj && onSelectPlaceOnMap && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onSelectPlaceOnMap(placeObj);
                                            onClose();
                                          }}
                                          className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                                          title="Xem trên bản đồ"
                                        >
                                          <MapPin className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Delete Stop */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStop(stop.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition"
                                        title="Xóa điểm đến"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Existing Note Callout Display (If Present & Not Editing) */}
                                  {stop.stopNotes && !isEditingNote && (
                                    <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <span className="font-bold">Ghi chú địa điểm: </span>
                                        <span className="whitespace-pre-wrap">{stop.stopNotes}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditStopNote(stop)}
                                        className="text-[10px] text-amber-700 hover:underline font-semibold shrink-0 cursor-pointer"
                                      >
                                        Sửa
                                      </button>
                                    </div>
                                  )}

                                  {/* Inline Note Editor */}
                                  {isEditingNote && (
                                    <div className="p-3 bg-amber-50/50 border border-amber-300 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-150">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-amber-900 flex items-center gap-1">
                                          <FileText className="w-3.5 h-3.5 text-amber-600" />
                                          Ghi chú & Lưu ý khi ghé thăm địa điểm
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setEditingNotesStopId(null)}
                                          className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                          Đóng
                                        </button>
                                      </div>

                                      <textarea
                                        rows={2}
                                        value={stopNotesInput}
                                        onChange={(e) => setStopNotesInput(e.target.value)}
                                        placeholder="Ví dụ: Mua vé trước trên mạng, đến lúc 8h30 để tránh xếp hàng, nên thử món chè hé..."
                                        className="w-full px-2.5 py-1.5 bg-white border border-amber-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-amber-500"
                                      />

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Giờ ghé thăm dự kiến
                                          </label>
                                          <input
                                            type="time"
                                            value={stopVisitTimeInput}
                                            onChange={(e) => setStopVisitTimeInput(e.target.value)}
                                            className="w-full px-2 py-1 bg-white border rounded-lg text-slate-800 text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Phương tiện di chuyển
                                          </label>
                                          <select
                                            value={stopTransportModeInput}
                                            onChange={(e) =>
                                              setStopTransportModeInput(e.target.value as TransportMode)
                                            }
                                            className="w-full px-2 py-1 bg-white border rounded-lg text-slate-800 text-xs"
                                          >
                                            {TRANSPORT_MODES.map((m) => (
                                              <option key={m.id} value={m.id}>
                                                {m.icon} {m.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="flex justify-end gap-1.5 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingNotesStopId(null)}
                                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveStopNote(stop.id)}
                                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                                        >
                                          Lưu Ghi Chú
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Inline Quick Expense Form */}
                                  {isAddingExpense && (
                                    <form
                                      onSubmit={(e) => handleSaveQuickExpenseSubmit(e, stop, placeName)}
                                      className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-2.5 text-xs animate-in fade-in duration-150"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                                          Thêm chi phí nhanh cho: {placeName}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setAddingExpenseStopId(null)}
                                          className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                          Đóng
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Tên khoản chi *
                                          </label>
                                          <input
                                            type="text"
                                            required
                                            value={expenseTitle}
                                            onChange={(e) => setExpenseTitle(e.target.value)}
                                            placeholder="Ví dụ: Vé vào cổng, Ăn trưa..."
                                            className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Số tiền (VND) *
                                          </label>
                                          <input
                                            type="number"
                                            required
                                            min={1000}
                                            step={1000}
                                            value={expenseAmount}
                                            onChange={(e) => setExpenseAmount(Number(e.target.value))}
                                            className="w-full px-2.5 py-1.5 bg-white border rounded-lg text-emerald-800 font-bold text-sm focus:ring-1 focus:ring-emerald-500"
                                          />
                                        </div>
                                      </div>

                                      {/* Quick Amount Preset Pills */}
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="text-[10px] text-slate-500">Thêm nhanh:</span>
                                        {[50000, 100000, 200000, 500000].map((preset) => (
                                          <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setExpenseAmount(preset)}
                                            className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded hover:bg-emerald-100 transition cursor-pointer"
                                          >
                                            {(preset / 1000).toLocaleString('vi-VN')}k đ
                                          </button>
                                        ))}
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Danh mục
                                          </label>
                                          <select
                                            value={expenseCategory}
                                            onChange={(e) =>
                                              setExpenseCategory(e.target.value as ExpenseCategory)
                                            }
                                            className="w-full px-2 py-1 bg-white border rounded-lg text-slate-800 text-xs"
                                          >
                                            {CATEGORY_OPTIONS.map((c) => (
                                              <option key={c.id} value={c.id}>
                                                {c.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                            Thanh toán
                                          </label>
                                          <select
                                            value={expensePaymentMethod}
                                            onChange={(e) =>
                                              setExpensePaymentMethod(e.target.value as any)
                                            }
                                            className="w-full px-2 py-1 bg-white border rounded-lg text-slate-800 text-xs"
                                          >
                                            <option value="cash">💵 Tiền mặt</option>
                                            <option value="transfer">📱 Chuyển khoản</option>
                                            <option value="card">💳 Thẻ ngân hàng</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-emerald-200/60">
                                        <span className="text-[10px] text-emerald-800 font-medium">
                                          * Một địa điểm có thể lưu nhiều khoản chi khác nhau
                                        </span>
                                        <div className="flex items-center gap-1.5 ml-auto">
                                          <button
                                            type="button"
                                            onClick={() => setAddingExpenseStopId(null)}
                                            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                                          >
                                            Hủy
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => handleSaveQuickExpenseSubmit(e, stop, placeName, true)}
                                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                            title="Lưu khoản chi này và tiếp tục nhập khoản chi tiếp theo"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Lưu & Thêm Khoản Khác</span>
                                          </button>
                                          <button
                                            type="submit"
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Lưu Chi Phí</span>
                                          </button>
                                        </div>
                                      </div>
                                    </form>
                                  )}

                                  {/* Itemized Expenses List for this stop */}
                                  {isViewingExpenses && stopExpenses.length > 0 && (
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs animate-in fade-in duration-150">
                                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                                        <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                                          <Receipt className="w-3 h-3 text-emerald-600" />
                                          Các khoản chi tại địa điểm này ({stopExpenses.length})
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleStartQuickExpense(stop, placeName)}
                                            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                            title="Thêm một khoản chi khác cho địa điểm này"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>+ Thêm khoản chi khác</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setViewingExpensesStopId(null)}
                                            className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                          >
                                            Ẩn
                                          </button>
                                        </div>
                                      </div>

                                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                        {stopExpenses.map((exp) => {
                                          const catObj = CATEGORY_OPTIONS.find((c) => c.id === exp.category);
                                          return (
                                            <div
                                              key={exp.id}
                                              className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[11px] shadow-2xs"
                                            >
                                              <div className="min-w-0 pr-2 flex items-center gap-2">
                                                {catObj && (
                                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0 ${catObj.color}`}>
                                                    {catObj.label}
                                                  </span>
                                                )}
                                                <div className="min-w-0">
                                                  <p className="font-bold text-slate-900 truncate">{exp.title}</p>
                                                  <p className="text-[9px] text-slate-500">
                                                    {new Date(exp.createdAt).toLocaleDateString('vi-VN')} •{' '}
                                                    {exp.paymentMethod === 'cash'
                                                      ? 'Tiền mặt'
                                                      : exp.paymentMethod === 'transfer'
                                                      ? 'Chuyển khoản'
                                                      : 'Thẻ'}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-extrabold text-emerald-700">
                                                  {exp.amount.toLocaleString('vi-VN')} đ
                                                </span>
                                                {onDeleteExpense && (
                                                  <button
                                                    type="button"
                                                    onClick={() => onDeleteExpense(exp.id)}
                                                    className="p-0.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                                    title="Xóa khoản chi này"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-600">Tổng chi tại {placeName}:</span>
                                        <span className="font-extrabold text-emerald-700 text-xs">
                                          {stopExpenseTotal.toLocaleString('vi-VN')} đ
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {trips.length === 0 ? 'Chưa có chuyến đi nào trong tài khoản' : 'Chưa chọn chuyến đi'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {trips.length === 0
                      ? `Lịch trình được lưu trữ riêng tư cho tài khoản ${currentUser?.name || currentUser?.email || 'của bạn'}. Bấm nút bên dưới để tạo chuyến đi đầu tiên!`
                      : 'Chọn một chuyến đi ở thanh bên trái hoặc tạo chuyến đi mới.'}
                  </p>
                </div>
                {trips.length === 0 && (
                  <button
                    type="button"
                    onClick={handleStartCreateTrip}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo chuyến đi đầu tiên</span>
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Đóng Lịch Trình
          </button>
        </div>

      </div>
    </div>
  );
};
