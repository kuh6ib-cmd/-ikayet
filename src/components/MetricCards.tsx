import React from "react";
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Car,
  BadgeAlert,
  BrainCircuit,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { AnalyticsKPIs } from "../utils/analytics";

interface MetricCardsProps {
  kpis: AnalyticsKPIs;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* 1. Toplam İncelenen Şikayet */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            İncelenen Şikayet
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.totalRecords.toLocaleString("tr-TR")}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sistemde taranan toplam servis dosyası
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>En Çok Şikayet:</span>
          <strong className="text-slate-900 font-semibold">{kpis.topAffectedBrand}</strong>
        </div>
      </div>

      {/* 2. Geri Ödenen Tutar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Geri Ödenen Tutar
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            +₺{(kpis.totalDifference / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Servis faturalarından geri alınan / talep edilen tutar
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>İtiraz Edilen / Askıda:</span>
          <strong className="text-slate-900 font-semibold">₺{(kpis.totalDisputedAmount / 1000).toFixed(0)}k</strong>
        </div>
      </div>

      {/* 3. Kronik Arıza Kümeleri */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Kronik Arıza Kümeleri
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {kpis.chronicIssueCount} Küme
          </div>
          <p className="text-xs text-amber-800 font-semibold mt-1">
            Araç havuzunun %{kpis.chronicIssuePercentage}'inde tekrarlayan hata
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Kritik Motor Ünitesi:</span>
          <strong className="text-slate-900 font-semibold">{kpis.topAffectedEngine}</strong>
        </div>
      </div>

      {/* 4. Yapay Zeka Tasarrufu */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
            AI Teşhis & Kurtarılan Bütçe
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-3xl font-black text-indigo-950 tracking-tight">
            ₺{((kpis.misdiagnosisSavedAmount + kpis.workmanshipSavedAmount) / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-1">
            Hatalı teşhis ve montaj kusurları bloke edildi
          </p>
        </div>

        <div className="pt-3 border-t border-indigo-200/60 flex items-center justify-between text-xs text-indigo-950 font-medium">
          <span>{kpis.misdiagnosisCount} Yanlış Parça</span>
          <span>{kpis.workmanshipFaultCount} İşçilik Rücu</span>
        </div>
      </div>
    </div>
  );
};
