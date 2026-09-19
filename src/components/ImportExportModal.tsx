import React, { useState, useMemo } from 'react';
import {
  TravelPlace,
  TravelCity,
  TravelReviewLog,
  TravelExpense,
  TravelTrip,
} from '../types';
import {
  Upload,
  Download,
  Database,
  FileJson,
  Check,
  Copy,
  AlertCircle,
  X,
  Trash2,
  Building,
  MapPin,
  FileText,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Layers,
  Code,
} from 'lucide-react';
import { parseSqlScript, ParsedSqlResult } from '../lib/sqlParser';
import {
  saveLocalReviews,
  saveLocalExpenses,
  saveLocalTrips,
} from '../lib/supabase';
import {
  formatPlacesToSqlViewJson,
  formatToRelationalDatabaseJson,
  generateSqlScriptFromData,
  parseSynchronizedJson,
  ParsedJsonResult,
} from '../lib/jsonSyncUtils';
import { DEFAULT_CITIES } from '../lib/geoUtils';

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
  cities?: TravelCity[];
  reviews?: TravelReviewLog[];
  expenses?: TravelExpense[];
  trips?: TravelTrip[];
  onImport: (importedPlaces: TravelPlace[], extraData?: ExtraImportData) => Promise<void> | void;
  onClearAll?: () => void;
}

type TabType = 'sql' | 'json_import' | 'json_export';
type ExportFormatType = 'sql_view_json' | 'relational_json' | 'sql_script';

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  places,
  cities = DEFAULT_CITIES,
  reviews = [],
  expenses = [],
  trips = [],
  onImport,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('sql');

  // JSON Import State
  const [jsonText, setJsonText] = useState('');
  const [syncJsonCities, setSyncJsonCities] = useState(true);
  const [syncJsonExtra, setSyncJsonExtra] = useState(true);

  // SQL Import State
  const [sqlText, setSqlText] = useState('');
  const [syncCities, setSyncCities] = useState(true);
  const [syncReviewsExpenses, setSyncReviewsExpenses] = useState(true);

  // Export State
  const [exportFormat, setExportFormat] = useState<ExportFormatType>('sql_view_json');

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
    } catch {
      return null;
    }
  }, [sqlText]);

  // Parsed JSON Results (reactive to jsonText)
  const parsedJson = useMemo<ParsedJsonResult | null>(() => {
    if (!jsonText || !jsonText.trim()) return null;
    try {
      return parseSynchronizedJson(jsonText, cities);
    } catch {
      return null;
    }
  }, [jsonText, cities]);

  // Generated Export Content (reactive to exportFormat, places, cities, etc.)
  const exportData = useMemo(() => {
    if (exportFormat === 'sql_view_json') {
      const records = formatPlacesToSqlViewJson(places, cities);
      return {
        text: JSON.stringify(records, null, 2),
        filename: `travel_places_view_sql_${Date.now()}.json`,
        mime: 'application/json',
        count: records.length,
      };
    } else if (exportFormat === 'relational_json') {
      const backup = formatToRelationalDatabaseJson(places, cities, reviews, expenses, trips);
      return {
        text: JSON.stringify(backup, null, 2),
        filename: `travel_maps_relational_backup_${Date.now()}.json`,
        mime: 'application/json',
        count: backup.summary.locations_count,
      };
    } else {
      const sql = generateSqlScriptFromData(places, cities, reviews, expenses, trips);
      return {
        text: sql,
        filename: `travel_maps_backup_${Date.now()}.sql`,
        mime: 'text/plain',
        count: places.length,
      };
    }
  }, [exportFormat, places, cities, reviews, expenses, trips]);

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // HANDLERS: SQL IMPORT
  // ---------------------------------------------------------------------------
  const handleSqlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessCount(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSqlText(content);
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file SQL. Vui lòng kiểm tra định dạng file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSqlImportSubmit = async () => {
    if (!sqlText || !sqlText.trim()) {
      setErrorMsg('Vui lòng dán câu lệnh SQL hoặc tải file .sql lên.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setProgressMsg('Đang phân tích cú pháp SQL...');

      const result = parseSqlScript(sqlText);

      if (result.places.length === 0 && result.cities.length === 0) {
        setErrorMsg('Không tìm thấy bản ghi travel_locations hoặc travel_cities hợp lệ trong kịch bản SQL.');
        setIsProcessing(false);
        return;
      }

      setProgressMsg(`Đang nhập ${result.places.length} địa điểm vào hệ thống...`);

      if (syncReviewsExpenses) {
        if (result.reviews.length > 0) saveLocalReviews(result.reviews);
        if (result.expenses.length > 0) saveLocalExpenses(result.expenses);
        if (result.trips.length > 0) saveLocalTrips(result.trips);
      }

      await onImport(result.places, {
        cities: syncCities ? result.cities : undefined,
        reviews: syncReviewsExpenses ? result.reviews : undefined,
        expenses: syncReviewsExpenses ? result.expenses : undefined,
        trips: syncReviewsExpenses ? result.trips : undefined,
      });

      setSuccessCount(result.places.length);
      setIsProcessing(false);
      setProgressMsg('');
    } catch (err: any) {
      console.error('SQL Import error:', err);
      setErrorMsg(err.message || 'Lỗi khi phân tích hoặc nhập dữ liệu SQL.');
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  // ---------------------------------------------------------------------------
  // HANDLERS: JSON IMPORT
  // ---------------------------------------------------------------------------
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessCount(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file JSON. Vui lòng kiểm tra lại.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJsonImportSubmit = async () => {
    if (!jsonText || !jsonText.trim()) {
      setErrorMsg('Vui lòng dán chuỗi JSON hoặc tải file .json lên.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      setProgressMsg('Đang đồng bộ cấu trúc dữ liệu JSON với CSDL SQL...');

      const parsed = parseSynchronizedJson(jsonText, cities);

      if (parsed.places.length === 0 && parsed.cities.length === 0) {
        setErrorMsg('Không tìm thấy dữ liệu địa điểm hợp lệ trong file JSON.');
        setIsProcessing(false);
        return;
      }

      setProgressMsg(`Đang nạp ${parsed.places.length} địa điểm đồng bộ vào hệ thống...`);

      if (syncJsonExtra) {
        if (parsed.reviews.length > 0) saveLocalReviews(parsed.reviews);
        if (parsed.expenses.length > 0) saveLocalExpenses(parsed.expenses);
        if (parsed.trips.length > 0) saveLocalTrips(parsed.trips);
      }

      await onImport(parsed.places, {
        cities: syncJsonCities && parsed.cities.length > 0 ? parsed.cities : undefined,
        reviews: syncJsonExtra && parsed.reviews.length > 0 ? parsed.reviews : undefined,
        expenses: syncJsonExtra && parsed.expenses.length > 0 ? parsed.expenses : undefined,
        trips: syncJsonExtra && parsed.trips.length > 0 ? parsed.trips : undefined,
      });

      setSuccessCount(parsed.places.length);
      setIsProcessing(false);
      setProgressMsg('');
    } catch (e: any) {
      console.error('JSON Import failed:', e);
      setErrorMsg(e.message || 'Dữ liệu JSON không hợp lệ hoặc sai cấu trúc.');
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  // ---------------------------------------------------------------------------
  // HANDLERS: EXPORT & COPY
  // ---------------------------------------------------------------------------
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportData.text], { type: exportData.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBadgeText = (format?: string) => {
    switch (format) {
      case 'relational_database':
        return 'CSDL Quan Hệ (travel_locations + travel_location_details)';
      case 'sql_view_array':
        return 'Chuẩn SQL View (travel_places_view)';
      case 'custom_object':
        return 'Gói Sao Lưu CSDL Toàn Diện';
      default:
        return 'Mảng Địa Điểm JSON';
    }
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
                Import & Export Dữ Liệu Đồng Bộ Chuẩn SQL
              </h2>
              <p className="text-[11px] text-slate-500">
                Tương thích 100% giữa JSON, View CSDL và bảng PostgreSQL / Supabase
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
              Kịch bản SQL
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
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-semibold">
              Đồng bộ CSDL
            </span>
          </button>

          {/* Tab 3: Export */}
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
            <span>Export Dữ Liệu (JSON & SQL)</span>
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
                    Bấm để chọn file <span className="text-teal-600 font-bold">.sql</span> từ máy tính hoặc file backup
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
                      Nếu đã kết nối Supabase, bạn cũng có thể mở trực tiếp bảng điều khiển Supabase Dashboard, vào mục <strong>SQL Editor</strong>, dán toàn bộ nội dung file SQL và nhấn <strong>Run</strong> để thực thi toàn bộ DDL & DML cùng lúc.
                    </p>
                    <div className="flex items-center gap-2">
                      {sqlText && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(sqlText)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copied ? 'Đã sao chép SQL!' : 'Sao chép nội dung SQL đang nhập'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: IMPORT JSON (ĐỒNG BỘ CẤU TRÚC VỚI CSDL SQL) */}
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
                    Tự động nhận diện cấu trúc CSDL quan hệ (<code className="text-teal-700 font-mono">travel_locations</code> + <code className="text-teal-700 font-mono">details</code>) hoặc cấu trúc View SQL (<code className="text-teal-700 font-mono">travel_places_view</code>)
                  </p>
                </label>
              </div>

              {/* Paste JSON */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Hoặc dán chuỗi JSON trực tiếp vào đây:
                  </label>
                  {jsonText && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        {jsonText.length.toLocaleString()} ký tự
                      </span>
                      <button
                        type="button"
                        onClick={() => setJsonText('')}
                        className="text-[11px] text-red-500 hover:text-red-700 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setErrorMsg('');
                    setSuccessCount(null);
                  }}
                  placeholder={`Dán JSON mảng địa điểm [ ... ] hoặc file backup CSDL toàn diện { "tables": { "travel_locations": [...], "travel_location_details": [...] } }`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>

              {/* JSON Live Parsing Breakdown */}
              {parsedJson && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Phân Tích Cấu Trúc JSON Hợp Lệ:
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {formatBadgeText(parsedJson.formatDetected)}
                    </span>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" /> Địa điểm
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedJson.summary.placesCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-600" /> Tỉnh / Thành
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedJson.summary.citiesCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        ✍️ Đánh giá
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedJson.summary.reviewsCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        💰 Chi tiêu & Lịch trình
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {parsedJson.summary.expensesCount + parsedJson.summary.tripsCount}
                      </span>
                    </div>
                  </div>

                  {/* Preview Places */}
                  {parsedJson.places.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
                        Xem trước địa điểm nhận diện:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {parsedJson.places.slice(0, 6).map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1"
                          >
                            <span>📍</span>
                            <strong className="font-medium truncate max-w-[140px]">{p.name}</strong>
                            {p.cityName && <span className="text-slate-400 text-[10px]">({p.cityName})</span>}
                          </span>
                        ))}
                        {parsedJson.places.length > 6 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            +{parsedJson.places.length - 6} địa điểm khác...
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
                    {parsedJson.cities.length > 0 && (
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={syncJsonCities}
                          onChange={(e) => setSyncJsonCities(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span>Đồng bộ danh mục tỉnh thành ({parsedJson.cities.length})</span>
                      </label>
                    )}

                    {(parsedJson.reviews.length > 0 || parsedJson.expenses.length > 0 || parsedJson.trips.length > 0) && (
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-700 select-none">
                        <input
                          type="checkbox"
                          checked={syncJsonExtra}
                          onChange={(e) => setSyncJsonExtra(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span>Đồng bộ đánh giá, chi tiêu & lịch trình</span>
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
                    Đã nhập thành công <strong>{successCount}</strong> địa điểm từ JSON vào hệ thống!
                  </span>
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
                    <span>{progressMsg || 'Đang nhập dữ liệu...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {parsedJson && parsedJson.places.length > 0
                        ? `Xác nhận Import ${parsedJson.places.length} Địa Điểm vào Hệ Thống`
                        : 'Xác nhận Import JSON'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: EXPORT DỮ LIỆU ĐỒNG BỘ CHUẨN SQL & JSON */}
          {/* ================================================================= */}
          {activeTab === 'json_export' && (
            <div className="space-y-4">
              
              {/* Format Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Chọn định dạng xuất dữ liệu đồng bộ với CSDL:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: SQL View JSON */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('sql_view_json')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'sql_view_json'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileJson className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold">Chuẩn View SQL (.json)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Mảng JSON đồng bộ chính xác các cột của View <code className="font-mono text-teal-700">travel_places_view</code>
                    </p>
                  </button>

                  {/* Option 2: Relational DB JSON */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('relational_json')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'relational_json'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold">CSDL Quan Hệ (.json)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Tách biệt các bảng CSDL: <code className="font-mono text-teal-700">travel_locations</code>, <code className="font-mono text-teal-700">details</code>, <code className="font-mono text-teal-700">cities</code>...
                    </p>
                  </button>

                  {/* Option 3: SQL Script */}
                  <button
                    type="button"
                    onClick={() => setExportFormat('sql_script')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      exportFormat === 'sql_script'
                        ? 'border-teal-500 bg-teal-50/70 text-teal-950 ring-1 ring-teal-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold">Kịch Bản SQL (.sql)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Câu lệnh <code className="font-mono text-teal-700">INSERT INTO</code> PostgreSQL / Supabase có sẵn <code className="font-mono text-teal-700">ON CONFLICT</code>
                    </p>
                  </button>
                </div>
              </div>

              {/* Data Preview Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Tổng cộng: <strong className="text-slate-800">{exportData.count}</strong> địa điểm ({exportData.filename})
                  </span>
                  <span>{exportData.text.length.toLocaleString()} ký tự</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={9}
                    readOnly
                    value={exportData.text}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopyText(exportData.text)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép vào bộ nhớ đệm!' : 'Sao chép nội dung'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExport}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File ({exportData.filename.endsWith('.sql') ? '.SQL' : '.JSON'})</span>
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
