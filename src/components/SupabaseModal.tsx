import React, { useState } from 'react';
import { CREATE_TABLE_SQL } from '../lib/sqlScript';
import {
  X,
  Copy,
  Check,
  Code2,
  Database,
  Terminal,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionUpdated?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(CREATE_TABLE_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Script SQL Cơ Sở Dữ Liệu Đa Bảng</span>
              </h2>
              <p className="text-xs text-slate-500">
                Mã khởi tạo cấu trúc 3 bảng quan hệ (travel_groups, travel_locations, travel_location_details) và 1 View tổng hợp
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

        {/* Modal Body - Focused purely on SQL Script */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
          
          {/* Quick instructions */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-950 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold flex items-center gap-1.5 text-xs text-teal-900">
                <Terminal className="w-4 h-4 text-teal-600" />
                Hướng dẫn thực thi trên Supabase SQL Editor:
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline"
              >
                <span>Mở Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-teal-900/90 pl-1">
              <li>Nhấn nút <strong>"Sao Chép Mã SQL"</strong> ở bên dưới.</li>
              <li>Mở mục <strong>SQL Editor</strong> trong trang quản trị dự án Supabase.</li>
              <li>Bấm <strong>New Query</strong>, dán toàn bộ đoạn mã SQL và nhấn nút <strong>Run</strong>.</li>
            </ol>
          </div>

          {/* SQL Code Block */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-300">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-mono font-bold text-slate-200">schema_and_views.sql</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao Chép'}</span>
              </button>
            </div>

            <pre className="p-4 text-[11px] sm:text-xs font-mono text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed select-all">
              {CREATE_TABLE_SQL}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL / Supabase Ready</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-teal-600" />}
              <span>{copied ? 'Đã copy toàn bộ mã' : 'Copy Toàn Bộ SQL'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export { SupabaseModal as SupabaseSqlModal };
