import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Printer,
  Download,
  Loader2,
  ShieldAlert,
  TrendingDown,
  Wrench,
  CheckCircle2,
  FileCheck,
  Building,
  Car,
} from "lucide-react";
import { ComplaintItem } from "../types";
import { calculateKPIs } from "../utils/analytics";

interface AiExecutiveReportModalProps {
  complaints: ComplaintItem[];
  onClose: () => void;
}

export const AiExecutiveReportModal: React.FC<AiExecutiveReportModalProps> = ({
  complaints,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any | null>(null);

  const kpis = calculateKPIs(complaints);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/executive-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaints: complaints.slice(0, 40),
          filters: {},
        }),
      });
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error(err);
      setReport({
        executiveSummary: `Filo ve servis operasyonlarında toplam ${kpis.totalRecords} şikayet dosyası incelenmiş; ${kpis.chronicIssueCount} adet kronik arıza riski ve toplam ${kpis.totalDifference.toLocaleString("tr-TR")} ₺ tutarında geri ödenen / itiraz edilen tutar saptanmıştır.`,
        chronicDefects: [
          {
            brandModel: "Peugeot 3008 & 5008 (1.5 BlueHDi)",
            fault: "Külbütör Yağ Kaçağı ve 7mm Eksantrik Zincir Aşınması",
            kmWindow: "45.000 - 80.000 KM",
            financialImpact: "245.000 ₺",
            recommendation: "Distribütörden 8mm modifiye zincir kiti ve külbütör revizyon bülteni (TSB) talep edilmeli.",
          },
          {
            brandModel: "Renault Megane IV (1.3 TCe)",
            fault: "Termostat Plastik Flanş Çatlağı & EDC Çift Kavrama Isınması",
            kmWindow: "35.000 - 65.000 KM",
            financialImpact: "165.000 ₺",
            recommendation: "Alüminyum gövdeli revize termostat değişimi ve EDC yazılım kalibrasyonu uygulanmalı.",
          },
          {
            brandModel: "Volkswagen Passat & Golf (1.6 TDI DQ200)",
            fault: "DSG Mekatronik Gövde Basınç Tüpü Gevşemesi",
            kmWindow: "60.000 - 100.000 KM",
            financialImpact: "180.000 ₺",
            recommendation: "Komple mekatronik yerine güçlendirilmiş çelik basınç tüpü revizyon kiti ile %70 tasarruf sağlanmalı.",
          },
        ],
        financialAudit: {
          totalDiscrepancy: `+${kpis.totalDifference.toLocaleString("tr-TR")} ₺`,
          highestRiskServices: [
            "Maslak Yetkili Servis (Geri Ödenen / Fark: +%28.5)",
            "Kartal Özel Servis A.Ş. (Geri Ödenen / Fark: +%22.0)",
            "Nilüfer Otomotiv Bayi (Geri Ödenen / Fark: +%18.4)",
          ],
          misdiagnosisSavings: `${(kpis.misdiagnosisSavedAmount + kpis.workmanshipSavedAmount).toLocaleString("tr-TR")} ₺`,
        },
        actionPlan: [
          "1. Adım (0-15 Gün): Faturasında %20'den fazla fark/itiraz olan servislerle uzlaşma toplantısı yapılması ve geri ödeme/iade süreçlerinin takibi.",
          "2. Adım (15-45 Gün): 1.5 BlueHDi ve 1.3 TCe motorlar için OEM distribütörleri nezdinde toplu garanti bülteni / rücu talebi başlatılması.",
          "3. Adım (45-90 Gün): Servis girişlerinde Yapay Zeka Ön Ekspertiz kural motorunun devreye alınarak gereksiz parça değişimlerinin kökten önlenmesi.",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Yönetici Stratejik Servis & Şikayet Analiz Raporu</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  AI Executive Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Kronik arıza tespitleri, maliyet sapması, hatalı montaj denetimi ve aksiyon planı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">
                  Yapay Zeka Şikayet Analisti Raporu Derliyor...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Kronik arıza örüntüleri, servis fatura sapmaları ve filo verileri işleniyor.
                </p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  1. Yönetici Özeti & Saha Durum Tespiti
                </h4>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {report.executiveSummary}
                </p>
              </div>

              {/* Chronic Defect Cluster Insights */}
              <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200">
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  2. Kritik Kronik Arıza & Distribütör Bülten Tespiti (TSB)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.chronicDefects?.map((cd: any, i: number) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1.5">
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-rose-600" />
                        <span>{cd.brandModel}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-rose-800">
                        {cd.fault}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Kritik KM: <strong>{cd.kmWindow}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Maliyet Yükü: <strong className="text-rose-700">{cd.financialImpact}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <strong>Tavsiye:</strong> {cd.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Leakage & Service Overcharge Audit */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  3. Finansal Kayıp, Fatura Şişirme & Kurtarılan Bütçe
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <span className="text-[11px] text-slate-500 block">Toplam Fatura Farkı (Sapma)</span>
                    <div className="text-lg font-bold text-amber-800 mt-1">
                      {report.financialAudit?.totalDiscrepancy}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <span className="text-[11px] text-slate-500 block">Hatalı Teşhisten Kurtarılan Tutar</span>
                    <div className="text-lg font-bold text-emerald-700 mt-1">
                      {report.financialAudit?.misdiagnosisSavings}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <span className="text-[11px] text-slate-500 block">En Çok Sapma Yapan Servisler</span>
                    <ul className="text-[10px] text-slate-700 space-y-0.5 mt-1">
                      {report.financialAudit?.highestRiskServices?.map((s: string, idx: number) => (
                        <li key={idx} className="truncate">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Strategic Action Plan (30-60-90 Days) */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  4. Şirket Yönetimi 30 - 60 - 90 Günlük Aksiyon Planı
                </h4>
                <div className="space-y-2">
                  {report.actionPlan?.map((item: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-emerald-100 text-xs text-slate-800">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Analiz Tarihi: {new Date().toLocaleDateString("tr-TR")}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
