import React from "react";
import {
  AlertTriangle,
  Flame,
  Gauge,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ComplaintItem, ChronicInsight } from "../types";
import { getChronicClusters } from "../utils/analytics";

interface ChronicDefectsPanelProps {
  complaints: ComplaintItem[];
  onSelectCluster: (brand: string, model: string, engineType: string) => void;
  onDiagnoseItem: (item: ComplaintItem) => void;
}

export const ChronicDefectsPanel: React.FC<ChronicDefectsPanelProps> = ({
  complaints,
  onSelectCluster,
  onDiagnoseItem,
}) => {
  const clusters = getChronicClusters(complaints);

  // Grafik verisi: En yüksek frekanslı ilk 6 küme (Arıza / Şikayet Adı + Araç Bilgisi)
  const chartData = clusters.slice(0, 6).map((c) => ({
    faultName: c.faultName,
    shortFaultName: c.faultName.length > 22 ? c.faultName.slice(0, 20) + "..." : c.faultName,
    vehicle: `${c.brand} ${c.model}`,
    brand: c.brand,
    model: c.model,
    engine: c.engineType,
    category: c.faultCategory,
    count: c.count,
    risk: c.riskScore,
    cost: Math.round(c.totalCost / 1000),
  }));

  const COLORS = ["#ef4444", "#f59e0b", "#4f46e5", "#8b5cf6", "#06b6d4", "#64748b"];

  return (
    <div className="space-y-6">
      {/* Üst Bilgilendirme Kartı */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wide border border-indigo-100">
              Modül 1: Kronik Arıza & Risk Matrisi
            </span>
            <span className="text-xs text-slate-400 font-medium">Otomatik Örüntü & Risk Motoru</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Tekrarlayan Arıza Kümeleri & Kilometre Odak Noktası Analizi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1 leading-relaxed">
            Hangi marka ve modelin hangi motor tipiyle hangi kilometre aralığında sürekli aynı arızayı verdiği tespit edilmiş, distribütör teknik servis bültenleri (TSB) ile eşleştirilmiştir.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Tespit Edilen Küme</div>
            <div className="text-xl font-black text-slate-900">{clusters.length} Arıza Grubu</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grafik ve Erken Uyarı Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol 2 Kolon: Frekans ve Maliyet Grafiği */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                En Yüksek Frekanslı Kronik Arıza Kümeleri
              </h3>
              <p className="text-xs text-slate-400">
                En sık tekrarlayan kronik arıza sebepleri ve servis dosya yükü
              </p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                En Yüksek 6 Arıza Kümesi
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortFaultName"
                  tick={{ fontSize: 11, fill: "#334155", fontWeight: 500 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl bg-slate-900 text-white p-3.5 text-xs shadow-xl border border-slate-700 max-w-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Kronik Arıza / Şikayet</div>
                          <p className="font-bold text-white text-sm mt-0.5 leading-snug">{data.faultName}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-indigo-300 font-semibold">
                            <span>{data.vehicle}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-normal">{data.engine}</span>
                          </div>
                          <div className="mt-1">
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {data.category}
                            </span>
                          </div>
                          <div className="mt-2.5 space-y-1 border-t border-slate-800 pt-2">
                            <div className="text-slate-200 flex justify-between">
                              <span>Şikayet Tekrarı:</span>
                              <strong className="text-white">{data.count} Dosya</strong>
                            </div>
                            <div className="text-slate-200 flex justify-between">
                              <span>Toplam Servis Faturası:</span>
                              <strong className="text-amber-300">{(data.cost * 1000).toLocaleString("tr-TR")} ₺</strong>
                            </div>
                            <div className="text-slate-200 flex justify-between">
                              <span>Risk Skoru:</span>
                              <strong className="text-rose-400">%{data.risk}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sağ 1 Kolon: Üretici / Distribütör Erken Uyarıları */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Üretici & Servis Bülteni (TSB) Uyarısı</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">
                Acil İnceleme
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Peugeot 3008 • 1.5 BlueHDi</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                    Kritik
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Külbütör kapak contası & 7mm eksantrik zincir sürtünmesi (35.000 - 70.000 KM).
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Renault Megane IV • 1.3 TCe</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    Yüksek
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Termostat plastik flanş çatlağı & EDC kavrama hararet ikazı (30.000 - 65.000 KM).
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">VW Passat • DQ200 DSG</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    Mekatronik
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hidrolik basınç tüpü gevşemesi ve P17BF arıza kodu (60.000 - 100.000 KM).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Kümeler gerçek servis arıza kayıtlarından hesaplanmaktadır.</span>
          </div>
        </div>
      </div>

      {/* Ana Kronik Arıza Tablosu */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              Kronik Arıza ve Risk Matrisi Tablosu
            </h2>
            <p className="text-xs text-slate-400">
              Araç, motor, arıza bileşeni, frekans ve risk seviyesi kırılımları
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700">
            Toplam {clusters.length} Kronik Arıza Kümesi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th className="pb-3 pt-2">Araç & Model Bilgisi</th>
                <th className="pb-3 pt-2">Arıza Bileşeni & Şikayet Konusu</th>
                <th className="pb-3 pt-2">Kilometre Aralığı</th>
                <th className="pb-3 pt-2 text-right">Dosya Sayısı & Masraf</th>
                <th className="pb-3 pt-2 text-center">Risk Seviyesi</th>
                <th className="pb-3 pt-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {clusters.map((c, idx) => (
                <tr key={c.key} className="hover:bg-slate-50 transition">
                  {/* Model */}
                  <td className="py-4">
                    <div className="font-bold text-slate-900 text-sm">
                      {c.brand} {c.model}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {c.engineType} | {c.affectedFleets.slice(0, 2).join(", ")}
                    </div>
                  </td>

                  {/* Arıza */}
                  <td className="py-4 max-w-xs">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.riskScore >= 90
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : c.riskScore >= 75
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {c.faultCategory}
                    </span>
                    <div className="text-xs text-slate-700 mt-1 font-medium truncate">
                      {c.faultName}
                    </div>
                  </td>

                  {/* KM */}
                  <td className="py-4">
                    <div className="font-semibold text-slate-900">{c.kmSweetSpot}</div>
                    <div className="text-xs text-slate-400">Ortalama {c.avgKm.toLocaleString("tr-TR")} KM</div>
                  </td>

                  {/* Dosya & Masraf */}
                  <td className="py-4 text-right font-mono">
                    <div className="font-bold text-slate-900">{c.count} Dosya</div>
                    <div className="text-xs text-rose-600 font-semibold">{c.totalCost.toLocaleString("tr-TR")} ₺</div>
                  </td>

                  {/* Risk Seviyesi */}
                  <td className="py-4">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex h-2.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.riskScore >= 85
                              ? "bg-rose-500"
                              : c.riskScore >= 70
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${c.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">%{c.riskScore}</span>
                    </div>
                  </td>

                  {/* Aksiyon */}
                  <td className="py-4 text-right">
                    <button
                      id={`btn-filter-cluster-${idx}`}
                      onClick={() => onSelectCluster(c.brand, c.model, c.engineType)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition border border-indigo-200"
                    >
                      Dosyaları İncele
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
