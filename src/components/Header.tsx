import React from "react";
import {
  FileSpreadsheet,
  Upload,
  RotateCcw,
  Sparkles,
  Bot,
  Cpu,
  Wand2,
} from "lucide-react";

interface HeaderProps {
  totalCount: number;
  filteredCount: number;
  onOpenReportModal: () => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  onNormalizeData: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  filteredCount,
  onOpenReportModal,
  onOpenImportModal,
  onExportExcel,
  onResetData,
  onNormalizeData,
  onToggleChat,
  isChatOpen,
}) => {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
      {/* Marka ve Başlık */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
          <Cpu className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              YAPAY ZEKA ŞİKAYET ANALİSTİ
            </h1>
            <span className="hidden sm:inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wide border border-indigo-100">
              Kurumsal v2.4
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 tracking-wide">
            Otomotiv Satış Sonrası & Servis Arıza Denetim Motoru
          </span>
        </div>
      </div>

      {/* Canlı Veri Durumu ve Aksiyon Butonları */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Canlı Senkron Durumu */}
        <div className="hidden md:flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-600">
            Canlı Veri Akışı: <strong className="text-slate-800 font-semibold">{filteredCount}</strong> / {totalCount} Dosya
          </span>
        </div>

        {/* Stratejik Rapor Al Butonu */}
        <button
          id="btn-executive-report"
          onClick={onOpenReportModal}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
          <span>Stratejik Rapor Al</span>
        </button>

        {/* Yapay Zeka Asistanı Butonu */}
        <button
          id="btn-toggle-ai-chat"
          onClick={onToggleChat}
          className={`flex h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            isChatOpen
              ? "bg-slate-900 text-white shadow-xs"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Bot className="h-3.5 w-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Analiste Sor</span>
        </button>

        {/* Verileri Normalize Et */}
        <button
          id="btn-normalize-data"
          onClick={onNormalizeData}
          title="Tüm yazılı verileri, K&L sütunlarını ve marka/model/filo isimlerini otomatik normalize et"
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
        >
          <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Verileri Normalize Et</span>
        </button>

        {/* Excel İndir */}
        <button
          id="btn-export-excel"
          onClick={onExportExcel}
          title="Excel Raporu İndir"
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Excel İndir</span>
        </button>

        {/* Veri Yükle */}
        <button
          id="btn-import-data"
          onClick={onOpenImportModal}
          title="Özel Veri Yükle"
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 text-indigo-600" />
          <span>Veri Yükle</span>
        </button>

        {/* Veriyi Sıfırla */}
        <button
          id="btn-reset-data"
          onClick={onResetData}
          title="Veriyi Sıfırla"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Kullanıcı Rozeti */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-700 uppercase shadow-2xs">
          YZ
        </div>
      </div>
    </header>
  );
};
