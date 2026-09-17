import React, { useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { ComplaintItem } from "../types";
import { parseExcelOrCsvFile, exportToExcel } from "../utils/analytics";

interface DataImportModalProps {
  onClose: () => void;
  onDataImported: (items: ComplaintItem[]) => void;
  sampleItems: ComplaintItem[];
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  onClose,
  onDataImported,
  sampleItems,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccessCount(null);
    }
  };

  const handleProcessUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const items = await parseExcelOrCsvFile(file);
      if (items.length === 0) {
        throw new Error("Dosyada geçerli şikayet satırı bulunamadı.");
      }
      setSuccessCount(items.length);
      setTimeout(() => {
        onDataImported(items);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Dosya formatı okunamadı. Lütfen geçerli bir Excel veya CSV dosyası yükleyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    exportToExcel(sampleItems.slice(0, 5), "Ornek_Sikayet_Veri_Sablonu.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Excel / CSV Şikayet Verisi Yükle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            Kendi kurumsal otomotiv servis şikayet tablonuzu yükleyerek yapay zeka kronik arıza, maliyet kontrolü ve analitik modellerini kendi veriniz üzerinde çalıştırabilirsiniz.
          </p>

          {/* Desteklenen Sütunlar Bilgilendirme */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-1">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Otomatik Tanınan Sütun Başlıkları:</span>
            </div>
            <ul className="text-[11px] text-indigo-900 list-disc list-inside space-y-0.5 font-medium">
              <li><strong>Bildiren Firma</strong> (Filo şirketi / müşteri adı)</li>
              <li><strong>Şikayet Sebebi</strong> (Arıza / şikayet nedeni)</li>
              <li><strong>Şikayetçi Olunan Servis</strong> (Yetkili / özel servis)</li>
              <li><strong>Tarih, Marka, Model, Motor, Kilometre, Fatura Tutarı</strong></li>
            </ul>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-50/60 transition cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">
              {file ? file.name : "Excel (.xlsx) veya .csv dosyasını buraya sürükleyin ya da seçin"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tüm kurumsal filo ve servis tabloları desteklenir.
            </p>
          </div>

          {/* Sample template button */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-slate-900">Format Şablonu</div>
              <div className="text-[11px] text-slate-500">Sütun başlıklarını görmek için örnek şablonu indirin.</div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Şablon İndir</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successCount} adet şikayet kaydı başarıyla yüklendi! Veri seti güncelleniyor...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            İptal
          </button>
          <button
            onClick={handleProcessUpload}
            disabled={!file || loading}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Yükleniyor...</span>
              </>
            ) : (
              <span>Veriyi İçe Aktar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
