import React, { useState } from 'react';
import { TravelPlace } from '../types';
import { X, Upload, Download, Copy, Check, FileJson, AlertCircle, Trash2 } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: TravelPlace[];
  onImport: (importedPlaces: TravelPlace[]) => void;
  onClearAll?: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  places,
  onImport,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  // Validate and Submit Import
  const handleImportSubmit = () => {
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

      // Check format
      const validPlaces: TravelPlace[] = parsed.map((item: any, idx: number) => {
        const id = item.id || `place-${Date.now()}-${idx}`;
        const name = item.name || 'Địa điểm chưa tên';
        const lat = item.coordinates?.lat !== undefined ? Number(item.coordinates.lat) : item.lat || 16.0544;
        const lng = item.coordinates?.lng !== undefined ? Number(item.coordinates.lng) : item.lng || 108.2022;

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
          notes: item.notes || '',
          checked: Boolean(item.checked),
          isFavorite: Boolean(item.isFavorite || item.is_favorite),
          visitedAt: item.visitedAt || item.visited_at || null,
          distanceKm: item.distanceKm || 0,
        };
      });

      onImport(validPlaces);
      setSuccessCount(validPlaces.length);
      setJsonText('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(`Lỗi định dạng JSON: ${err.message}`);
    }
  };

  // Export JSON Download
  const handleExportDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(places, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `travel_maps_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy Export JSON
  const handleCopyExport = () => {
    navigator.clipboard.writeText(JSON.stringify(places, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold">Import & Export Dữ liệu JSON Địa Điểm</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('import');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'import'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import JSON Địa Điểm
          </button>

          <button
            onClick={() => {
              setActiveTab('export');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'export'
                ? 'border-teal-600 text-teal-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Danh Sách ({places.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {activeTab === 'import' ? (
            <div className="space-y-4">
              
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl p-6 text-center bg-slate-50 transition group cursor-pointer">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-file-input"
                />
                <label htmlFor="json-file-input" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-600 mx-auto transition" />
                  <p className="text-xs font-semibold text-slate-700">
                    Bấm để chọn file <span className="text-teal-600 font-bold">.json</span> từ máy tính
                  </p>
                  <p className="text-[11px] text-slate-500">Định dạng hỗ trợ mảng đối tượng địa điểm du lịch, ăn uống, dịch vụ</p>
                </label>
              </div>

              {/* Or paste text */}
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
                onClick={handleImportSubmit}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Xác nhận Import Dữ liệu
              </button>
            </div>
          ) : (
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
                  onClick={handleCopyExport}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                </button>

                <button
                  onClick={handleExportDownload}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải File .JSON</span>
                </button>
              </div>
            </div>
          )}

          {onClearAll && (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Xóa toàn bộ dữ liệu hiện có để nạp lại từ đầu</span>
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
