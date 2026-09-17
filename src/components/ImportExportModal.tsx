import React, { useState, useMemo } from 'react';
import {
  TravelPlace,
  TravelCity,
  TravelReviewLog,
  TravelExpense,
  TravelTrip,
} from '../types';
import {
  X,
  Upload,
  Download,
  Copy,
  Check,
  FileJson,
  Database,
  AlertCircle,
  Trash2,
  Sparkles,
  CheckCircle2,
  MapPin,
  Building,
  ArrowRight,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { parseSqlScript, ParsedSqlResult } from '../lib/sqlParser';
import {
  saveLocalCities,
  saveLocalGroups,
  saveLocalReviews,
  saveLocalExpenses,
  saveLocalTrips,
  getSupabaseClient,
} from '../lib/supabase';
import sqlSampleRaw from '../../sqlsample.sql?raw';

export interface ExtraImportData {
  cities?: TravelCity[];
  reviews?: TravelReviewLog[];
  expenses?: TravelExpense[];
  trips?: TravelTrip[];
}

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: TravelPlace[];
  onImport: (importedPlaces: TravelPlace[], extraData?: ExtraImportData) => Promise<void> | void;
  onClearAll?: () => void;
}

type TabType = 'sql' | 'json_import' | 'json_export';

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  places,
  onImport,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sql');

  // JSON State
  const [jsonText, setJsonText] = useState('');

  // SQL State
  const [sqlText, setSqlText] = useState('');
  const [syncCities, setSyncCities] = useState(true);
  const [syncReviewsExpenses, setSyncReviewsExpenses] = useState(true);

  // Common UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSqlEditorTip, setShowSqlEditorTip] = useState(false);

  // Parsed SQL Results (reactive to sqlText)
  const parsedSql = useMemo<ParsedSqlResult | null>(() => {
    if (!sqlText || !sqlText.trim()) return null;
    try {
      return parseSqlScript(sqlText);
    } catch (e) {
      return null;
    }
  }, [sqlText]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // JSON IMPORT HANDLERS
  // ---------------------------------------------------------------------------
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg('');
      setSuccessCount(null);
    };
    reader.readAsText(file);
  };

  const handleJsonImportSubmit = async () => {
    setErrorMsg('');
    setSuccessCount(null);

    if (!jsonText.trim()) {
      setErrorMsg('Vui lòng dán nội dung JSON hoặc chọn file JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setErrorMsg('Dữ liệu JSON phải là một mảng danh sách [ ... ].');
        return;
      }

      if (parsed.length === 0) {
        setErrorMsg('Mảng JSON rỗng.');
        return;
      }

      const validPlaces: TravelPlace[] = parsed.map((item: any, idx: number) => {
        const id = item.id || `place-${Date.now()}-${idx}`;
        const name = item.name || 'Địa điểm chưa tên';
        const rawLat = item.coordinates?.lat !== undefined ? item.coordinates.lat : item.lat;
        const rawLng = item.coordinates?.lng !== undefined ? item.coordinates.lng : item.lng;
        const parsedLat = Number(rawLat);
        const parsedLng = Number(rawLng);
        const lat = !isNaN(parsedLat) && parsedLat !== 0 ? parsedLat : 16.0544;
        const lng = !isNaN(parsedLng) && parsedLng !== 0 ? parsedLng : 108.2022;

        return {
          id,
          name,
          group: item.group || 'du_lich',
          category: item.category || 'Địa điểm',
          coordinates: { lat, lng },
          address: item.address || '',
          contact: item.contact || '',
          phone: item.phone || '',
          rating: item.rating ? Number(item.rating) : 4.8,
          priceRange: item.priceRange || item.price_range || '',
          openingHours: item.openingHours || item.opening_hours || '',
          bestTimeToVisit: item.bestTimeToVisit || item.best_time_to_visit || '',
          notes: item.notes || '',
          travelTips: item.travelTips || item.travel_tips || '',
          specialties: item.specialties || '',
          thumbnailUrl: item.thumbnailUrl || item.thumbnail_url || '',
          galleryUrls: Array.isArray(item.galleryUrls)
            ? item.galleryUrls
            : Array.isArray(item.gallery_urls)
            ? item.gallery_urls
            : [],
          website: item.website || item.website_url || '',
          checked: Boolean(item.checked),
          isFavorite: Boolean(item.isFavorite || item.is_favorite),
          visitedAt: item.visitedAt || item.visited_at || null,
          distanceKm: item.distanceKm || 0,
        };
      });

      setIsProcessing(true);
      await onImport(validPlaces);
      setIsProcessing(false);
      setSuccessCount(validPlaces.length);
      setJsonText('');

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(`Lỗi định dạng JSON: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // SQL IMPORT HANDLERS
  // ---------------------------------------------------------------------------
  const handleSqlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSqlText(content);
      setErrorMsg('');
      setSuccessCount(null);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleSql = () => {
    setSqlText(sqlSampleRaw);
    setErrorMsg('');
    setSuccessCount(null);
  };

  const handleSqlImportSubmit = async () => {
    setErrorMsg('');
    setSuccessCount(null);

    if (!sqlText.trim()) {
      setErrorMsg('Vui lòng chọn file .sql hoặc dán câu lệnh SQL.');
      return;
    }

    if (!parsedSql || parsedSql.places.length === 0) {
      setErrorMsg('Không tìm thấy câu lệnh INSERT INTO travel_locations hợp lệ trong mã SQL.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgressMsg(`Đang xử lý ${parsedSql.places.length} địa điểm và dữ liệu liên quan...`);

      // 1. Sync Cities if selected
      if (syncCities && parsedSql.cities.length > 0) {
        saveLocalCities(parsedSql.cities);
        const sb = getSupabaseClient();
        if (sb) {
          try {
            await sb.from('travel_cities').upsert(
              parsedSql.cities.map((c) => ({
                id: c.id,
                name: c.name,
                code: c.code || '',
                lat: c.lat || 0,
                lng: c.lng || 0,
                sort_order: c.sort_order || 0,
              }))
            );
          } catch (e) {
            console.warn('Supabase cities sync warning:', e);
          }
        }
      }

      // 2. Sync Groups if present
      if (parsedSql.groups.length > 0) {
        saveLocalGroups(parsedSql.groups);
      }

      // 3. Sync Reviews & Expenses if selected
      if (syncReviewsExpenses) {
        if (parsedSql.reviews.length > 0) {
          saveLocalReviews(parsedSql.reviews);
        }
        if (parsedSql.expenses.length > 0) {
          saveLocalExpenses(parsedSql.expenses);
        }
        if (parsedSql.trips.length > 0) {
          saveLocalTrips(parsedSql.trips);
        }
      }

      // 4. Pass places and extra data to App
      await onImport(parsedSql.places, {
        cities: syncCities ? parsedSql.cities : undefined,
        reviews: syncReviewsExpenses ? parsedSql.reviews : undefined,
        expenses: syncReviewsExpenses ? parsedSql.expenses : undefined,
        trips: syncReviewsExpenses ? parsedSql.trips : undefined,
      });

      setIsProcessing(false);
      setSuccessCount(parsedSql.places.length);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(`Lỗi trong quá trình Import SQL: ${err.message}`);
    }
  };

  // ---------------------------------------------------------------------------
  // EXPORT JSON HANDLERS
  // ---------------------------------------------------------------------------
  const handleExportDownload = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(places, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `travel_maps_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              {activeTab === 'sql' ? (
                <Database className="w-4 h-4" />
              ) : activeTab === 'json_import' ? (
                <Upload className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Import & Export Dữ Liệu Địa Điểm
              </h2>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ nạp file SQL sao lưu (sqlsample.sql) hoặc file JSON địa điểm du lịch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-2 pt-2 gap-1 overflow-x-auto">
          {/* Tab 1: Import SQL */}
          <button
            onClick={() => {
              setActiveTab('sql');
              setErrorMsg('');
              setSuccessCount(null);
            }}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-t-xl border-t border-x transition cursor-pointer shrink-0 ${
              activeTab === 'sql'
                ? 'bg-white border-slate-200 text-teal-700 shadow-2xs border-b-white -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
            }`}
          >
            <Database className="w-4 h-4 text-teal-600" />
            <span>Import SQL (.sql)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-100 text-teal-700 font-semibold">
              Khuyên dùng
            </span>
          </button>

          {/* Tab 2: Import JSON */}
          <button
            onClick={() => {
              setActiveTab('json_import');
              setErrorMsg('');
              setSuccessCount(null);
            }}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-t-xl border-t border-x transition cursor-pointer shrink-0 ${
              activeTab === 'json_import'
                ? 'bg-white border-slate-200 text-teal-700 shadow-2xs border-b-white -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
            }`}
          >
            <FileJson className="w-4 h-4 text-teal-600" />
            <span>Import JSON (.json)</span>
          </button>

          {/* Tab 3: Export JSON */}
          <button
            onClick={() => {
              setActiveTab('json_export');
              setErrorMsg('');
              setSuccessCount(null);
            }}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 rounded-t-xl border-t border-x transition cursor-pointer shrink-0 ${
              activeTab === 'json_export'
                ? 'bg-white border-slate-200 text-teal-700 shadow-2xs border-b-white -mb-[1px]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
            }`}
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Dữ Liệu</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-semibold">
              {places.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* ================================================================= */}
          {/* TAB 1: IMPORT SQL */}
          {/* ================================================================= */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              
              {/* Quick Actions Header */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-200/80">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-xs font-semibold text-teal-900">
                    Nạp nhanh bộ dữ liệu mẫu chuẩn có sẵn:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleSql}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>⚡ Nạp file sqlsample.sql (100+ địa điểm, 63 tỉnh thành)</span>
                </button>
              </div>

              {/* File Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 text-center bg-slate-50 transition group cursor-pointer">
                <input
                  type="file"
                  accept=".sql,text/plain"
                  onChange={handleSqlFileUpload}
                  className="hidden"
                  id="sql-file-input"
                />
                <label htmlFor="sql-file-input" className="cursor-pointer space-y-1.5 block">
                  <Database className="w-7 h-7 text-slate-400 group-hover:text-teal-600 mx-auto transition" />
                  <p className="text-xs font-semibold text-slate-700">
                    Bấm để chọn file <span className="text-teal-600 font-bold">.sql</span> từ máy tính (sqlsample.sql hoặc file backup)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ tự động phân tích các bảng <code className="font-mono text-teal-700">travel_locations</code>, <code className="font-mono text-teal-700">travel_location_details</code>, <code className="font-mono text-teal-700">travel_cities</code>...
                  </p>
                </label>
              </div>

              {/* Textarea for SQL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Nội dung câu lệnh SQL INSERT:
                  </label>
                  {sqlText && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {sqlText.length.toLocaleString()} ký tự
                      </span>
                      <button
                        type="button"
                        onClick={() => setSqlText('')}
                        className="text-[11px] text-red-500 hover:text-red-700 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={sqlText}
                  onChange={(e) => {
                    setSqlText(e.target.value);
                    setErrorMsg('');
                    setSuccessCount(null);
                  }}
                  placeholder="Dán câu lệnh INSERT INTO travel_locations (...) VALUES (...) hoặc chọn file .sql ở trên..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* Parsing Results Breakdown */}
              {parsedSql && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Kết Quả Phân Tích Cú Pháp SQL:
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      Sẵn sàng Import
                    </span>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" /> Địa điểm
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedSql.summary.totalPlacesAssembled}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-600" /> Tỉnh / Thành
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedSql.summary.citiesCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-amber-600" /> Nhóm Dịch Vụ
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedSql.summary.groupsCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        ✍️ Đánh giá & Chi tiêu
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedSql.summary.reviewsCount + parsedSql.summary.expensesCount}
                      </span>
                    </div>
                  </div>

                  {/* Preview first places */}
                  {parsedSql.places.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
                        Xem trước địa điểm tiêu biểu:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {parsedSql.places.slice(0, 6).map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1"
                          >
                            <span>📍</span>
                            <strong className="font-medium truncate max-w-[140px]">{p.name}</strong>
                            {p.cityName && <span className="text-slate-400 text-[10px]">({p.cityName})</span>}
                          </span>
                        ))}
                        {parsedSql.places.length > 6 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            +{parsedSql.places.length - 6} địa điểm khác...
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                    {parsedSql.cities.length > 0 && (
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={syncCities}
                          onChange={(e) => setSyncCities(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span>Đồng bộ danh mục 63 tỉnh thành ({parsedSql.cities.length})</span>
                      </label>
                    )}

                    {(parsedSql.reviews.length > 0 || parsedSql.expenses.length > 0) && (
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={syncReviewsExpenses}
                          onChange={(e) => setSyncReviewsExpenses(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span>Đồng bộ nhật ký đánh giá & sổ chi tiêu</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successCount !== null && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Đã nhập thành công <strong>{successCount}</strong> địa điểm từ SQL vào hệ thống!
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSqlImportSubmit}
                disabled={isProcessing || !sqlText.trim()}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{progressMsg || 'Đang thực hiện import...'}</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>
                      {parsedSql && parsedSql.places.length > 0
                        ? `Xác nhận Import ${parsedSql.places.length} Địa Điểm vào Hệ Thống`
                        : 'Xác nhận Import Dữ Liệu SQL'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>

              {/* Supabase Direct Execution Tip */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSqlEditorTip(!showSqlEditorTip)}
                  className="text-[11px] text-slate-500 hover:text-teal-700 flex items-center gap-1 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Bạn muốn chạy trực tiếp trên Supabase SQL Editor?</span>
                </button>

                {showSqlEditorTip && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-700 text-xs space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-600">
                      Nếu đã kết nối Supabase, bạn cũng có thể mở trực tiếp bảng điều khiển Supabase Dashboard, vào mục <strong>SQL Editor</strong>, dán toàn bộ nội dung file <code className="font-mono text-teal-700">sqlsample.sql</code> và nhấn <strong>Run</strong> để nạp toàn bộ DDL & DML cùng lúc.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(sqlText || sqlSampleRaw)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copied ? 'Đã sao chép SQL!' : 'Sao chép toàn bộ SQL'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: IMPORT JSON */}
          {/* ================================================================= */}
          {activeTab === 'json_import' && (
            <div className="space-y-4">
              
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-5 text-center bg-slate-50 transition group cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFileUpload}
                  className="hidden"
                  id="json-file-input"
                />
                <label htmlFor="json-file-input" className="cursor-pointer space-y-1.5 block">
                  <Upload className="w-7 h-7 text-slate-400 group-hover:text-teal-600 mx-auto transition" />
                  <p className="text-xs font-semibold text-slate-700">
                    Bấm để chọn file <span className="text-teal-600 font-bold">.json</span> từ máy tính
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Định dạng hỗ trợ mảng đối tượng địa điểm du lịch, ăn uống, dịch vụ
                  </p>
                </label>
              </div>

              {/* Paste JSON */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hoặc dán chuỗi JSON trực tiếp vào đây:
                </label>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`[\n  {\n    "id": "place-01",\n    "name": "Bánh Mì Phượng Hội An",\n    "group": "an_uong",\n    "category": "Đặc sản ẩm thực",\n    "coordinates": {\n      "lat": 15.8794,\n      "lng": 108.3328\n    },\n    "address": "2B Phan Châu Trinh, Hội An",\n    "rating": 4.8,\n    "priceRange": "30.000đ - 65.000đ",\n    "checked": false\n  }\n]`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successCount !== null && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>Đã nhập thành công {successCount} địa điểm vào hệ thống!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleJsonImportSubmit}
                disabled={isProcessing || !jsonText.trim()}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang nhập dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Xác nhận Import JSON</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: EXPORT JSON */}
          {/* ================================================================= */}
          {activeTab === 'json_export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Xuất toàn bộ <strong className="text-slate-900">{places.length}</strong> địa điểm du lịch & ẩm thực thành file chuẩn JSON để lưu trữ hoặc chia sẻ.
              </p>

              <div className="relative">
                <textarea
                  rows={10}
                  readOnly
                  value={JSON.stringify(places, null, 2)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopyText(JSON.stringify(places, null, 2))}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportDownload}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File .JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* Clear Data Danger Zone */}
          {onClearAll && (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Xóa toàn bộ dữ liệu địa điểm hiện có để nạp lại từ đầu
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tất cả địa điểm hiện có?')) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả dữ liệu</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
