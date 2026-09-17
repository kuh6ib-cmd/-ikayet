import React from "react";
import {
  TrendingUp,
  Building2,
  DollarSign,
  TrendingDown,
  Scale,
  FileCheck,
  AlertOctagon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ComplaintItem } from "../types";
import { getServiceFinancialAudit, AnalyticsKPIs } from "../utils/analytics";

interface FinancialAuditPanelProps {
  complaints: ComplaintItem[];
  kpis: AnalyticsKPIs;
  onFilterService: (serviceName: string) => void;
}

export const FinancialAuditPanel: React.FC<FinancialAuditPanelProps> = ({
  complaints,
  kpis,
  onFilterService,
}) => {
  const serviceAudits = getServiceFinancialAudit(complaints);

  // Kategori Kırılımı
  const categoryMap: Record<string, { cost: number; diff: number; count: number }> = {};
  for (const c of complaints) {
    const cat = c.faultCategory;
    if (!categoryMap[cat]) {
      categoryMap[cat] = { cost: 0, diff: 0, count: 0 };
    }
    categoryMap[cat].cost += c.financials?.invoicedCost || 0;
    categoryMap[cat].diff += c.financials?.difference || 0;
    categoryMap[cat].count += 1;
  }

  const categoryChartData = Object.entries(categoryMap)
    .map(([name, data]) => ({
      name,
      value: data.cost,
      diff: data.diff,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  const PIE_COLORS = [
    "#4f46e5",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
  ];

  // Servis Karşılaştırma Grafiği
  const serviceBarData = serviceAudits.slice(0, 6).map((s) => ({
    name: s.serviceName.length > 16 ? s.serviceName.slice(0, 14) + ".." : s.serviceName,
    fullName: s.serviceName,
    operationCost: s.operationCost,
    invoicedCost: s.invoicedCost,
    difference: s.difference,
    markupRatio: s.markupRatio,
  }));

  return (
    <div className="space-y-6">
      {/* Üst Bilgilendirme Bannerı */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wide border border-emerald-200">
              Modül 2: Geri Ödeme & Mali Denetim
            </span>
            <span className="text-xs text-slate-400 font-medium">Geri Ödenen Tutar ve Fazlalık İadesi Denetimi</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Gerçekleşen İşlem Maliyetleri vs Fatura Edilen Tutarlar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1 leading-relaxed">
            Servis bazlı norm maliyet farkları tespit edilerek şirketin gereksiz faturalandırma ve parça şişirmelerinin geri ödemesi / iadesi denetlenir.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Ortalama Geri Ödeme / Fazlalık</span>
            <span className="text-2xl font-black text-emerald-600">%{kpis.differencePercentage} Geri Alınan</span>
          </div>
        </div>
      </div>

      {/* 2 Grafik Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik 1: Servis Bazlı Maliyet Kıyaslaması */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Servis Bazlı Geri Ödenen Tutar Karşılaştırması
              </h3>
              <p className="text-xs text-slate-400">
                Norm İşlem Tutarı ile Servisin Kestiği Fatura ve Geri Alınan Tutar (TL)
              </p>
            </div>
            <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              En Yüksek Geri Ödemeli Servisler
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 text-white p-3.5 text-xs shadow-xl border border-slate-700">
                          <p className="font-bold text-emerald-300 text-sm">{d.fullName}</p>
                          <div className="mt-2 space-y-1 border-t border-slate-800 pt-2">
                            <p className="text-slate-300">Norm İşlem Maliyeti: <strong>{d.operationCost.toLocaleString("tr-TR")} ₺</strong></p>
                            <p className="text-slate-200">Fatura Edilen Tutar: <strong>{d.invoicedCost.toLocaleString("tr-TR")} ₺</strong></p>
                            <p className="text-emerald-400 font-semibold">Geri Ödenen Tutar (Fark): <strong>+{d.difference.toLocaleString("tr-TR")} ₺ (+%{d.markupRatio})</strong></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="operationCost" name="Norm İşlem Tutarı" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoicedCost" name="Fatura Edilen Tutar" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Kategori Dağılımı */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Arıza Kategorisi Bazında Maliyet Dağılımı
              </h3>
              <p className="text-xs text-slate-400">
                Finansal yük oluşturan arıza grupları
              </p>
            </div>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              Kategori Dağılımı
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString("tr-TR")} ₺`, "Toplam Maliyet"]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Servis Fiyatlandırma Sıralaması Tablosu */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              Geri Ödenen Tutar & Servis Fiyatlandırma Sıralaması
            </h2>
            <p className="text-xs text-slate-400">
              Hangi yetkili ve özel servisten ne kadar fark / geri ödeme talep edildi?
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
            Toplam Geri Ödenen: +{kpis.totalDifference.toLocaleString("tr-TR")} ₺
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="pb-3 pt-2">Yetkili / Özel Servis</th>
                <th className="pb-3 pt-2 text-center">Dosya Sayısı</th>
                <th className="pb-3 pt-2 text-right">Norm İşlem Tutarı</th>
                <th className="pb-3 pt-2 text-right">Fatura Edilen Tutar</th>
                <th className="pb-3 pt-2 text-right">Geri Ödenen Tutar (Fark)</th>
                <th className="pb-3 pt-2 text-center">İade / Fazlalık Oranı</th>
                <th className="pb-3 pt-2 text-center">Hatalı Teşhis / Montaj</th>
                <th className="pb-3 pt-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {serviceAudits.map((s, idx) => (
                <tr key={s.serviceName} className="hover:bg-slate-50 transition">
                  <td className="py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div>{s.serviceName}</div>
                        <div className="text-xs text-slate-400 font-medium">{s.city}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 text-center font-bold text-slate-800">
                    {s.count} Dosya
                  </td>

                  <td className="py-4 text-right font-medium text-slate-600 font-mono">
                    {s.operationCost.toLocaleString("tr-TR")} ₺
                  </td>

                  <td className="py-4 text-right font-bold text-slate-900 font-mono">
                    {s.invoicedCost.toLocaleString("tr-TR")} ₺
                  </td>

                  <td className="py-4 text-right font-bold text-rose-600 font-mono">
                    +{s.difference.toLocaleString("tr-TR")} ₺
                  </td>

                  <td className="py-4 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                        s.markupRatio > 25
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : s.markupRatio > 15
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      +%{s.markupRatio}
                    </span>
                  </td>

                  <td className="py-4 text-center">
                    {s.misdiagnosisCount > 0 || s.workmanshipCount > 0 ? (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {s.misdiagnosisCount} Hatalı Teşhis, {s.workmanshipCount} Montaj Hatası
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-xs">Temiz</span>
                    )}
                  </td>

                  <td className="py-4 text-right">
                    <button
                      id={`btn-service-filter-${idx}`}
                      onClick={() => onFilterService(s.serviceName)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition border border-indigo-200"
                    >
                      Servisi Filtrele
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
