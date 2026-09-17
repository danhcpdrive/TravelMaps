import React, { useState, useMemo } from 'react';
import {
  TravelTrip,
  TravelPlace,
  TravelExpense,
  TravelReviewLog,
  UserProfile,
  TripStop,
} from '../types';
import {
  X,
  Printer,
  Copy,
  Check,
  Calendar,
  MapPin,
  Coins,
  Share2,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  Car,
  Utensils,
  Hotel,
  Ticket,
  ChevronDown,
} from 'lucide-react';
import { SERVICE_GROUPS_MAP } from '../lib/geoUtils';

interface TravelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TravelTrip[];
  places: TravelPlace[];
  expenses: TravelExpense[];
  reviews?: TravelReviewLog[];
  currentUser: UserProfile | null;
  onSelectPlaceOnMap?: (place: TravelPlace) => void;
}

export const TravelReportModal: React.FC<TravelReportModalProps> = ({
  isOpen,
  onClose,
  trips,
  places,
  expenses,
  reviews = [],
  currentUser,
  onSelectPlaceOnMap,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips.length > 0 ? trips[0].id : 'all'
  );
  const [copied, setCopied] = useState(false);

  // Active Trip or null for all
  const currentTrip = useMemo(() => {
    if (selectedTripId === 'all') return null;
    return trips.find((t) => t.id === selectedTripId) || trips[0] || null;
  }, [trips, selectedTripId]);

  // Places belonging to this trip
  const tripPlaces = useMemo(() => {
    if (!currentTrip || !currentTrip.stops || currentTrip.stops.length === 0) {
      // If no stops or "all" selected, show visited / favorite places
      return places.filter((p) => p.checked || p.isFavorite);
    }
    const stopLocationIds = new Set(currentTrip.stops.map((s) => s.locationId));
    return places.filter((p) => stopLocationIds.has(p.id));
  }, [currentTrip, places]);

  // Expenses for this trip or total
  const tripExpenses = useMemo(() => {
    if (!currentTrip || selectedTripId === 'all') {
      return expenses;
    }
    return expenses.filter(
      (e) => e.tripId === currentTrip.id || tripPlaces.some((p) => p.id === e.locationId)
    );
  }, [expenses, currentTrip, selectedTripId, tripPlaces]);

  // Total expenses amount
  const totalExpenseAmount = useMemo(() => {
    return tripExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [tripExpenses]);

  // Expenses categorized
  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {
      food: 0,
      ticket: 0,
      hotel: 0,
      transport: 0,
      shopping: 0,
      other: 0,
    };
    tripExpenses.forEach((e) => {
      const c = e.category || 'other';
      cats[c] = (cats[c] || 0) + (Number(e.amount) || 0);
    });
    return cats;
  }, [tripExpenses]);

  // Group stops by dayNumber
  const stopsByDay = useMemo(() => {
    if (!currentTrip || !currentTrip.stops) return {};
    const grouped: Record<number, TripStop[]> = {};
    const sorted = [...currentTrip.stops].sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });

    sorted.forEach((stop) => {
      if (!grouped[stop.dayNumber]) grouped[stop.dayNumber] = [];
      grouped[stop.dayNumber].push(stop);
    });

    return grouped;
  }, [currentTrip]);

  if (!isOpen) return null;

  // Format currency VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Generate clean shareable text summary for Zalo/Facebook/Notes
  const generateShareText = () => {
    const tripTitle = currentTrip ? currentTrip.title : 'Báo Cáo Lịch Trình & Chi Tiêu Du Lịch';
    const dates = currentTrip?.startDate
      ? `${currentTrip.startDate} - ${currentTrip.endDate || 'Hiện tại'}`
      : 'Tổng hợp hành trình';

    let text = `🌟 BÁO CÁO LỊCH TRÌNH & CHI TIÊU DU LỊCH 🌟\n`;
    text += `📍 Chuyến đi: ${tripTitle}\n`;
    text += `📅 Thời gian: ${dates}\n`;
    text += `👥 Người chia sẻ: ${currentUser?.name || 'Thành viên Travel Maps'}\n`;
    text += `💰 Tổng chi phí: ${formatCurrency(totalExpenseAmount)}\n`;
    if (currentTrip?.budget) {
      text += `🎯 Ngân sách dự kiến: ${formatCurrency(currentTrip.budget)}\n`;
    }
    text += `----------------------------------------\n\n`;

    if (Object.keys(stopsByDay).length > 0) {
      text += `📋 LỊCH TRÌNH CHI TIẾT THEO NGÀY:\n`;
      (Object.entries(stopsByDay) as [string, TripStop[]][]).forEach(([day, stops]) => {
        text += `\n🗓️ NGÀY ${day}:\n`;
        stops.forEach((s, idx) => {
          const place = places.find((p) => p.id === s.locationId) || s.location;
          const placeExpenses = tripExpenses
            .filter((e) => e.locationId === s.locationId)
            .reduce((sum, e) => sum + e.amount, 0);

          text += `  ${idx + 1}. [${s.visitTime || 'Ghé thăm'}] ${place?.name || 'Điểm đến'}\n`;
          if (place?.address) text += `     📍 Đ/c: ${place.address}\n`;
          if (place?.specialties) text += `     ✨ Trải nghiệm/Đặc sản: ${place.specialties}\n`;
          if (s.stopNotes) text += `     📝 Ghi chú: ${s.stopNotes}\n`;
          if (placeExpenses > 0) {
            text += `     💵 Chi phí tại điểm: ${formatCurrency(placeExpenses)}\n`;
          }
        });
      });
      text += `\n----------------------------------------\n`;
    }

    text += `\n💳 PHÂN BỔ CHI TIÊU CHÍNH:\n`;
    text += `🍜 Ăn uống: ${formatCurrency(expensesByCategory.food)}\n`;
    text += `🎫 Vé tham quan: ${formatCurrency(expensesByCategory.ticket)}\n`;
    text += `🏨 Khách sạn/Lưu trú: ${formatCurrency(expensesByCategory.hotel)}\n`;
    text += `🚗 Đi lại/Xăng xe: ${formatCurrency(expensesByCategory.transport)}\n`;
    text += `🛍️ Mua sắm & Khác: ${formatCurrency(expensesByCategory.shopping + expensesByCategory.other)}\n\n`;

    text += `💡 Lời khuyên: Lịch trình được tổng hợp từ Travel Maps. Bạn có thể tham khảo trực tiếp trên hệ thống!\n`;
    return text;
  };

  const handleCopyShare = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Báo Cáo Lịch Trình & Chi Tiêu Chuyến Đi
              </h2>
              <p className="text-xs text-slate-500">
                Tổng hợp lịch trình, địa điểm dừng chân và chi phí để dễ dàng chia sẻ và tham khảo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyShare}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="Sao chép toàn bộ báo cáo tóm tắt để gửi Zalo / Messenger"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép chia sẻ'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="In ra giấy hoặc lưu thành file PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In / Xuất PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-900">
          
          {/* Trip Selector Toolbar */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold text-slate-700">Chọn chuyến đi báo cáo:</span>
            </div>

            <div className="flex-1 max-w-sm">
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    🗺️ {t.title} ({t.startDate ? `${t.startDate}` : 'Lịch trình'})
                  </option>
                ))}
                <option value="all">🌟 Toàn bộ địa điểm đã ghé & Tất cả chi tiêu</option>
              </select>
            </div>
          </div>

          {/* 1. Trip Hero Overview Card */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-teal-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-600 text-white">
                  {currentTrip?.status === 'completed'
                    ? 'Đã hoàn thành'
                    : currentTrip?.status === 'ongoing'
                    ? 'Đang diễn ra'
                    : 'Kế hoạch chuyến đi'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {currentTrip ? currentTrip.title : 'Tổng Hợp Tất Cả Địa Điểm & Chi Phí Du Lịch'}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {currentTrip?.startDate
                      ? `${currentTrip.startDate} ➔ ${currentTrip.endDate || 'Kết thúc'}`
                      : 'Lịch trình du lịch'}
                  </span>
                  <span>•</span>
                  <span>Người tạo: <strong>{currentUser?.name || 'Thành viên Travel Maps'}</strong></span>
                </p>
              </div>

              {/* Expense Total Box */}
              <div className="bg-white p-3 rounded-xl border border-teal-200 shadow-xs text-right shrink-0">
                <span className="text-[10px] font-semibold text-slate-500 block uppercase">Tổng chi phí thực tế</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600">
                  {formatCurrency(totalExpenseAmount)}
                </span>
                {currentTrip?.budget && (
                  <p className="text-[10px] text-slate-500">
                    Ngân sách: {formatCurrency(currentTrip.budget)}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-100">
              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                <span className="text-[11px] text-slate-500 block">Số điểm dừng (Stops)</span>
                <span className="text-base font-bold text-slate-800">
                  {currentTrip?.stops?.length || tripPlaces.length} địa điểm
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                <span className="text-[11px] text-slate-500 block">Số ngày hành trình</span>
                <span className="text-base font-bold text-slate-800">
                  {Object.keys(stopsByDay).length || 1} Ngày
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                <span className="text-[11px] text-slate-500 block">Số khoản chi tiêu</span>
                <span className="text-base font-bold text-slate-800">
                  {tripExpenses.length} khoản
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
                <span className="text-[11px] text-slate-500 block">Chi phí trung bình/ngày</span>
                <span className="text-base font-bold text-slate-800">
                  {formatCurrency(
                    totalExpenseAmount / Math.max(1, Object.keys(stopsByDay).length || 1)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Day-by-day Itinerary Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Lịch Trình Từng Ngày & Các Địa Điểm Ghé Thăm</span>
              </h3>
              <span className="text-xs text-slate-500">
                {Object.keys(stopsByDay).length > 0 ? `${Object.keys(stopsByDay).length} Ngày tham quan` : ''}
              </span>
            </div>

            {Object.keys(stopsByDay).length > 0 ? (
              <div className="space-y-4">
                {(Object.entries(stopsByDay) as [string, TripStop[]][]).map(([day, stops]) => {
                  return (
                    <div
                      key={day}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-teal-700 uppercase bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                          🗓️ Ngày {day} ({stops.length} điểm ghé thăm)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Khoản chi: {formatCurrency(
                            stops.reduce((daySum, st) => {
                              return (
                                daySum +
                                tripExpenses
                                  .filter((e) => e.locationId === st.locationId)
                                  .reduce((s, e) => s + e.amount, 0)
                              );
                            }, 0)
                          )}
                        </span>
                      </div>

                      {/* Stops Timeline */}
                      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 pl-8">
                        {stops.map((stop, idx) => {
                          const place =
                            places.find((p) => p.id === stop.locationId) || stop.location;
                          const placeExpenses = tripExpenses.filter(
                            (e) => e.locationId === stop.locationId
                          );
                          const totalPlaceExpense = placeExpenses.reduce((s, e) => s + e.amount, 0);
                          const groupMeta = place
                            ? SERVICE_GROUPS_MAP[place.group] || SERVICE_GROUPS_MAP.du_lich
                            : SERVICE_GROUPS_MAP.du_lich;

                          return (
                            <div key={stop.id || idx} className="relative group">
                              {/* Step circle marker */}
                              <div className="absolute -left-8 top-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                {idx + 1}
                              </div>

                              <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 transition">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {stop.visitTime && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded flex items-center gap-0.5">
                                          <Clock className="w-2.5 h-2.5" />
                                          {stop.visitTime}
                                        </span>
                                      )}
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${groupMeta.badgeBg}`}>
                                        {groupMeta.icon} {groupMeta.label}
                                      </span>
                                      <h4 className="text-xs font-bold text-slate-900">
                                        {place?.name || 'Điểm đến du lịch'}
                                      </h4>
                                    </div>

                                    {place?.address && (
                                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{place.address}</span>
                                      </p>
                                    )}
                                  </div>

                                  {/* Expense at place */}
                                  {totalPlaceExpense > 0 && (
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                      💵 {formatCurrency(totalPlaceExpense)}
                                    </span>
                                  )}
                                </div>

                                {/* Specialties & Tips */}
                                {(place?.specialties || stop.stopNotes) && (
                                  <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
                                    {place?.specialties && (
                                      <p className="flex items-center gap-1 text-amber-800 font-medium">
                                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                                        <span>Đặc sản / Trải nghiệm: {place.specialties}</span>
                                      </p>
                                    )}
                                    {stop.stopNotes && (
                                      <p className="text-slate-500 italic">
                                        Ghi chú: {stop.stopNotes}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback if no stops exist in trip yet: list places */
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center space-y-2">
                <Info className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Chuyến đi này chưa được phân bổ điểm dừng theo ngày. Dưới đây là danh sách các địa điểm nổi bật liên quan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                  {tripPlaces.map((p) => (
                    <div key={p.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Expense Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Bảng Kê Chi Tiêu Tại Các Địa Điểm & Danh Mục</span>
            </h3>

            {/* Category summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                <Utensils className="w-4 h-4 text-amber-600 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-600 block">Ẩm thực / Ăn uống</span>
                <span className="text-xs font-bold text-amber-900">
                  {formatCurrency(expensesByCategory.food)}
                </span>
              </div>

              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-center">
                <Ticket className="w-4 h-4 text-blue-600 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-600 block">Vé & Tham quan</span>
                <span className="text-xs font-bold text-blue-900">
                  {formatCurrency(expensesByCategory.ticket)}
                </span>
              </div>

              <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-center">
                <Hotel className="w-4 h-4 text-indigo-600 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-600 block">Khách sạn / Lưu trú</span>
                <span className="text-xs font-bold text-indigo-900">
                  {formatCurrency(expensesByCategory.hotel)}
                </span>
              </div>

              <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200 text-center">
                <Car className="w-4 h-4 text-teal-600 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-600 block">Di chuyển & Xăng</span>
                <span className="text-xs font-bold text-teal-900">
                  {formatCurrency(expensesByCategory.transport)}
                </span>
              </div>

              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                <Sparkles className="w-4 h-4 text-slate-600 mx-auto mb-0.5" />
                <span className="text-[10px] text-slate-600 block">Mua sắm & Khác</span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(expensesByCategory.shopping + expensesByCategory.other)}
                </span>
              </div>
            </div>

            {/* Expense Item List */}
            {tripExpenses.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-2.5">Khoản chi</th>
                        <th className="p-2.5">Gắn với địa điểm</th>
                        <th className="p-2.5">Phân loại</th>
                        <th className="p-2.5 text-right">Số tiền (VND)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tripExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5 font-medium text-slate-900">{exp.title}</td>
                          <td className="p-2.5 text-slate-600">
                            {exp.locationName ||
                              places.find((p) => p.id === exp.locationId)?.name ||
                              'Chi tiêu chung'}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {exp.category === 'food'
                                ? 'Ẩm thực'
                                : exp.category === 'ticket'
                                ? 'Vé tham quan'
                                : exp.category === 'hotel'
                                ? 'Lưu trú'
                                : exp.category === 'transport'
                                ? 'Di chuyển'
                                : 'Khác'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-bold text-emerald-600">
                            {formatCurrency(exp.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có bản ghi chi tiêu nào.</p>
            )}
          </div>

          {/* 4. Tips & Notes for Sharing */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5 text-xs text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ghi Chú & Lời Khuyên Cho Người Tham Khảo:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>Lịch trình đã được tính toán lộ trình tối ưu và các điểm ăn uống ngon tại địa phương.</li>
              <li>Bạn có thể sao chép nhanh tóm tắt bằng nút <strong>"Sao chép chia sẻ"</strong> để gửi qua Zalo/Facebook.</li>
              <li>Sử dụng chức năng <strong>"In / Xuất PDF"</strong> để lưu một bản tài liệu lưu động khi không có kết nối mạng.</li>
            </ul>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Báo cáo chuẩn hóa hệ thống Travel Maps • Dành cho Thành Viên & Quản Trị Viên
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
