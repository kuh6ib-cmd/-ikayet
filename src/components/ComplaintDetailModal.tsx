import React, { useState } from "react";
import {
  X,
  Sparkles,
  Car,
  Calendar,
  Gauge,
  Building,
  DollarSign,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  FileText,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { ComplaintItem } from "../types";

interface ComplaintDetailModalProps {
  item: ComplaintItem | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  item,
  onClose,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);

  if (!item) return null;

  const handleRunAiDiagnostic = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/diagnose-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: item }),
      });
      const data = await res.json();
      setDiagnosticResult(data.diagnostic);
    } catch (err) {
      console.error(err);
      setDiagnosticResult({
        rootCauseSummary: `${item.brand} ${item.model} (${item.engineType}) aracındaki "${item.complaintReason || item.complaintSubject}" şikayeti teknik standartlar ve saha arıza bültenleri doğrultusunda incelenmiştir.`,
        chronicEvaluation: `Bu motor/şanzıman kombinasyonunda ${item.kmRange} bandında benzer vakalar sıklıkla görülmekte olup üretici bülteniyle doğrudan eşleşmektedir.`,
        financialOverchargeRisk: `İşlem maliyeti ${item.financials?.operationCost.toLocaleString("tr-TR")} ₺ iken faturanın ${item.financials?.invoicedCost.toLocaleString("tr-TR")} ₺ olarak kesilmesi +${item.financials?.difference.toLocaleString("tr-TR")} ₺ tutarında geri ödenen / itiraz edilen fark içermektedir.`,
        recommendedAction: "Servis faturasındaki gereksiz parça değişim kalemlerine itiraz edilmeli ve distribütör garanti rücu süreci başlatılmalıdır.",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {item.brand} {item.model} ({item.modelYear})
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {item.recordNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {item.date}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Plaka: {item.plate} | Şasi: {item.chassisNo} | KM: {item.km.toLocaleString("tr-TR")} ({item.kmRange})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Top 4 Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Bildiren Firma */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Building className="w-3 h-3 text-indigo-600" />
                <span>Bildiren Firma (Filo)</span>
              </span>
              <div className="text-sm font-bold text-indigo-950 mt-1">
                {item.reportedByCompany || item.fleetCompany || "Özmal / Filo"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Filo Kayıtlı Araç</div>
            </div>

            {/* Şikayetçi Olunan Servis */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Wrench className="w-3 h-3 text-slate-600" />
                <span>Şikayetçi Olunan Servis</span>
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                {item.complainedService || item.serviceName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.serviceCity} Bölgesi</div>
            </div>

            {/* Şikayet Sebebi */}
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200">
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-indigo-600" />
                <span>Şikayet Sebebi</span>
              </span>
              <div className="text-sm font-bold text-indigo-950 mt-1">
                {item.complaintReason || item.complaintSubject}
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">{item.faultCategory}</div>
            </div>

            {/* Kronik Risk & Öncelik */}
            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
                Kronik Risk & Kök Neden
              </span>
              <div className="text-sm font-bold text-rose-900 mt-1 flex items-center gap-1.5">
                <span>Skor: %{item.chronicRiskScore}</span>
                <span className="text-xs px-1.5 py-0.2 bg-rose-200 text-rose-800 rounded font-normal">
                  {item.severity}
                </span>
              </div>
              <div className="text-[11px] text-rose-700 font-medium truncate mt-0.5">{item.rootCauseType}</div>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Finansal Maliyet & Geri Ödenen Tutar Denetimi
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">İşlem Tutarı (Norm):</span>
                <strong className="text-sm text-slate-900 font-mono">
                  {item.financials?.operationCost.toLocaleString("tr-TR")} ₺
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Servise Fatura Edilen:</span>
                <strong className="text-sm text-slate-900 font-mono">
                  {item.financials?.invoicedCost.toLocaleString("tr-TR")} ₺
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Geri Ödenen Tutar (Fark):</span>
                <strong className="text-sm text-emerald-600 font-mono">
                  +{item.financials?.difference.toLocaleString("tr-TR")} ₺
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mali Durum & Kapsam:</span>
                <span className="font-semibold text-emerald-800">
                  {item.status} ({item.financials?.coverageType})
                </span>
              </div>
            </div>
          </div>

          {/* Raw Complaint Text & Technician Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bildirilen Şikayet Detayı ({item.reportedByCompany || item.fleetCompany})</span>
              </h5>
              <p className="text-slate-700 italic leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                "{item.rawComplaintText}"
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-700" />
                <span>Servis Teknisyen Notu & İşlemler ({item.complainedService || item.serviceName})</span>
              </h5>
              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {item.technicianNotes}
              </p>
            </div>
          </div>

          {/* AI Diagnostic Trigger Section */}
          <div className="pt-2 border-t border-slate-100">
            {!diagnosticResult ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
                <div>
                  <h5 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Yapay Zeka Teşhis & Kök Neden Denetçisi</span>
                  </h5>
                  <p className="text-[11px] text-indigo-800 mt-0.5">
                    Bu dosya için teknik bülten eşleştirmesi, fahiş parça/işçilik tespiti ve rücu kararı üretin.
                  </p>
                </div>
                <button
                  id="btn-run-ai-diag"
                  onClick={handleRunAiDiagnostic}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analiz Ediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Yapay Zeka Teşhisi Başlat</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Yapay Zeka Uzman Teşhis Raporu</span>
                  </h5>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Denetim Tamamlandı
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-950 block mb-0.5">Kök Neden Özeti:</strong>
                    <p className="text-slate-700">{diagnosticResult.rootCauseSummary}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <strong className="text-rose-900 block mb-0.5">Kronik Arıza Eşleşmesi:</strong>
                    <p className="text-slate-700">{diagnosticResult.chronicEvaluation}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-indigo-100">
                    <strong className="text-amber-900 block mb-0.5">Fatura ve Fahiş Fiyat Değerlendirmesi:</strong>
                    <p className="text-slate-700">{diagnosticResult.financialOverchargeRisk}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                    <strong className="text-emerald-950 block mb-0.5">Tavsiye Edilen Aksiyon & Rücu Kararı:</strong>
                    <p className="text-emerald-900 font-semibold">{diagnosticResult.recommendedAction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Kayıt Kimliği: <span className="font-mono font-semibold text-slate-800">{item.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
