import React, { useState } from "react";
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
import {
  PieChart as PieIcon,
  BarChart3,
  Building,
  Wrench,
  AlertCircle,
  TrendingUp,
  FileText,
  Layers,
  FolderTree,
  ChevronRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ComplaintItem } from "../types";
import {
  getComplaintReasonDistribution,
  getFleetCompanyDistribution,
  getComplainedServiceDistribution,
  getMainAndSubTopicCategorization,
} from "../utils/analytics";

interface OverviewChartsSectionProps {
  complaints: ComplaintItem[];
  onSelectReason?: (reason: string) => void;
  onSelectFleet?: (fleet: string) => void;
  onSelectService?: (service: string) => void;
  onSelectMainHeader?: (mainHeader: string) => void;
}

export const OverviewChartsSection: React.FC<OverviewChartsSectionProps> = ({
  complaints,
  onSelectReason,
  onSelectFleet,
  onSelectService,
  onSelectMainHeader,
}) => {
  const [activeView, setActiveView] = useState<"tree" | "reasons" | "fleets" | "services">("tree");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const reasonData = getComplaintReasonDistribution(complaints);
  const fleetData = getFleetCompanyDistribution(complaints);
  const serviceData = getComplainedServiceDistribution(complaints);
  const categoryTree = getMainAndSubTopicCategorization(complaints);

  const COLORS = [
    "#4f46e5",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#3b82f6",
    "#64748b",
    "#14b8a6",
  ];

  // Reasons Top 8 Bar Chart Data
  const topReasonsBar = reasonData.slice(0, 8).map((r) => ({
    name: r.name.length > 22 ? r.name.slice(0, 20) + "..." : r.name,
    fullName: r.name,
    count: r.count,
    cost: Math.round(r.totalCost / 1000),
    diff: Math.round(r.totalDifference / 1000),
  }));

  // Fleets Top 8 Bar Chart Data
  const topFleetsBar = fleetData.slice(0, 8).map((f) => ({
    name: f.fleetName.length > 18 ? f.fleetName.slice(0, 16) + "..." : f.fleetName,
    fullName: f.fleetName,
    count: f.count,
    cost: Math.round(f.totalCost / 1000),
    highRisk: f.highRiskCount,
  }));

  // Services Top 8 Bar Chart Data
  const topServicesBar = serviceData.slice(0, 8).map((s) => ({
    name: s.serviceName.length > 20 ? s.serviceName.slice(0, 18) + "..." : s.serviceName,
    fullName: s.serviceName,
    count: s.count,
    diff: Math.round(s.totalDifference / 1000),
  }));

  return (
    <div className="space-y-4">
      {/* 4'lü Görünüm Seçici Sekmesi ve Daraltma Kontrolü */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between lg:justify-start gap-3 w-full lg:w-auto">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Şikayet Sebepleri ve Dağılım Analizi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              K (Ana Başlık) ve L (Konu) ağacı, bildiren filolar ve yetkili/özel servis dağılımları
            </p>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <span>{isCollapsed ? "Genişlet" : "Daralt"}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isCollapsed && (
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 gap-1">
              <button
                onClick={() => setActiveView("tree")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === "tree"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Kategori Ağacı ({categoryTree.length})</span>
              </button>

              <button
                onClick={() => setActiveView("reasons")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === "reasons"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Şikayet Sebepleri ({reasonData.length})</span>
              </button>

              <button
                onClick={() => setActiveView("fleets")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === "fleets"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bildiren Filolar ({fleetData.length})</span>
              </button>

              <button
                onClick={() => setActiveView("services")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeView === "services"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Şikayetçi Olunan Servisler ({serviceData.length})</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0 border border-slate-200"
          >
            <span>{isCollapsed ? "Bölümü Genişlet" : "Bölümü Daralt"}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Daraltılmış İpuçları Çizgisi */}
      {isCollapsed && (
        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
              <span>{categoryTree.length} Ana Kategori</span>
            </span>
            <span className="text-slate-400">•</span>
            <span>{reasonData.length} Farklı Şikayet Sebebi</span>
            <span className="text-slate-400">•</span>
            <span>{fleetData.length} Bildiren Filo Şirketi</span>
            <span className="text-slate-400">•</span>
            <span>{serviceData.length} Şikayetçi Olunan Servis</span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer flex items-center gap-1"
          >
            <span>Grafikleri Aç</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* İçerikler (isCollapsed değilken gösterilir) */}
      {!isCollapsed && (
        <div className="space-y-6">

      {/* 0. K VE L SÜTUNLARI HİYERARŞİK KATEGORİZASYON AĞACI */}
      {activeView === "tree" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span>Ana Başlık ve Konu Kategorizasyon Dağılımı</span>
              </h4>
              <p className="text-[11px] text-indigo-800 mt-0.5">
                Ana dosyadan aktarılan tüm şikayet başlıkları ve konuları incelenmiş, teknik kategorilere ve alt konulara ayrıştırılmıştır.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
              Toplam {complaints.length} Dosya Kategorize Edildi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTree.map((group, idx) => (
              <div
                key={group.mainHeader + idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
              >
                <div>
                  {/* Kart Başlığı: K Sütunu (Ana Başlık) */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          K Sütunu: Ana Başlık
                        </span>
                        <h5
                          onClick={() => onSelectMainHeader && onSelectMainHeader(group.mainHeader)}
                          className="font-bold text-slate-900 text-xs truncate hover:text-indigo-600 cursor-pointer"
                        >
                          {group.mainHeader}
                        </h5>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[11px] rounded shrink-0">
                      {group.totalCount} Dosya
                    </span>
                  </div>

                  {/* L Sütunları (Konu / Alt Şikayet Sebepleri) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      L Sütunu: Konu & Şikayet Sebepleri
                    </span>
                    {group.topics.map((t) => (
                      <div
                        key={t.topic}
                        onClick={() => onSelectReason && onSelectReason(t.topic)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition cursor-pointer text-xs group"
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate text-[11px] group-hover:text-indigo-950">
                            {t.topic}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900 text-[11px] block">{t.count} Araç</span>
                          {t.riskCount > 0 && (
                            <span className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 justify-end">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              {t.riskCount} Risk
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alt Toplam Maliyet */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Toplam Fatura:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {group.totalCost.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. ŞİKAYET SEBEPLERİ GRAFİKLERİ */}
      {activeView === "reasons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Sol 2 Kolon: Sebepler Bar Grafiği */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  En Sık Bildirilen Şikayet Sebepleri (Frekans & Maliyet)
                </h4>
                <p className="text-xs text-slate-400">Şikayet sayısı ve toplam fatura tutarı (bin TL)</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                İlk 8 Sebep
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topReasonsBar} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#475569" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-900 text-white p-3 text-xs shadow-xl border border-slate-700">
                            <p className="font-bold text-indigo-300">{d.fullName}</p>
                            <div className="mt-2 space-y-1 border-t border-slate-800 pt-1.5">
                              <p>Toplam Dosya: <strong>{d.count} Adet</strong></p>
                              <p className="text-amber-300">Toplam Fatura: <strong>{(d.cost * 1000).toLocaleString("tr-TR")} ₺</strong></p>
                              <p className="text-rose-400">Fatura Sapması: <strong>+{(d.diff * 1000).toLocaleString("tr-TR")} ₺</strong></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onSelectReason && onSelectReason(data.fullName)}
                    cursor="pointer"
                  >
                    {topReasonsBar.map((_entry, index) => (
                      <Cell key={`cell-reason-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sağ 1 Kolon: Sebepler Pasta Grafiği */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="font-bold text-slate-900 text-sm">Şikayet Sebebi Oranları</h4>
                <PieIcon className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topReasonsBar}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {topReasonsBar.map((_entry, index) => (
                        <Cell key={`pie-reason-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, _name, item: any) => [
                        `${val} Dosya (%${Math.round((Number(val) / complaints.length) * 100)})`,
                        item.payload.fullName,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
              {topReasonsBar.slice(0, 4).map((r, i) => (
                <div key={r.fullName} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="truncate">{r.fullName}</span>
                  </div>
                  <strong className="text-slate-900 font-mono">{r.count} Dosya</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. BİLDİREN FİRMALAR / FİLO İSİMLERİ GRAFİKLERİ */}
      {activeView === "fleets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Sol 2 Kolon: Filolar Bar Grafiği */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Bildiren Firma / Filo Şirketi Şikayet Dağılımı
                </h4>
                <p className="text-xs text-slate-400">
                  Hangi filo şirketinden ne kadar şikayet dosyası bildirildi?
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                Bildiren Firmalar
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFleetsBar} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#475569" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-900 text-white p-3 text-xs shadow-xl border border-slate-700">
                            <p className="font-bold text-indigo-300">{d.fullName}</p>
                            <div className="mt-2 space-y-1 border-t border-slate-800 pt-1.5">
                              <p>Bildirilen Şikayet: <strong>{d.count} Araç</strong></p>
                              <p className="text-rose-400">Kritik Riskli: <strong>{d.highRisk} Dosya</strong></p>
                              <p className="text-amber-300">Toplam Masraf: <strong>{(d.cost * 1000).toLocaleString("tr-TR")} ₺</strong></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onSelectFleet && onSelectFleet(data.fullName)}
                    cursor="pointer"
                  >
                    {topFleetsBar.map((_entry, index) => (
                      <Cell key={`cell-fleet-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sağ 1 Kolon: Filo Listesi & Hızlı Filtre */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="font-bold text-slate-900 text-sm">Filo Hacim Sıralaması</h4>
                <span className="text-xs text-slate-400 font-semibold">{fleetData.length} Firma</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fleetData.map((f, i) => (
                  <div
                    key={f.fleetName}
                    onClick={() => onSelectFleet && onSelectFleet(f.fleetName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[170px]">
                      <span className="w-5 h-5 rounded bg-white font-bold text-slate-500 flex items-center justify-center text-[10px] border border-slate-200">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{f.fleetName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-700 block">{f.count} Dosya</span>
                      <span className="text-[10px] text-slate-400">₺{(f.totalCost / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ŞİKAYETÇİ OLUNAN SERVİSLER GRAFİĞİ */}
      {activeView === "services" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Sol 2 Kolon: Servisler Bar Grafiği */}
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Şikayetçi Olunan Servisler & Geri Ödenen Tutar
                </h4>
                <p className="text-xs text-slate-400">
                  En yüksek geri ödenen / itiraz edilen tutar ve şikayet alan servis noktaları
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Geri Ödeme Sıralaması
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesBar} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#475569" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-900 text-white p-3 text-xs shadow-xl border border-slate-700">
                            <p className="font-bold text-emerald-300">{d.fullName}</p>
                            <div className="mt-2 space-y-1 border-t border-slate-800 pt-1.5">
                              <p>Şikayet Sayısı: <strong>{d.count} Dosya</strong></p>
                              <p className="text-emerald-400">Geri Ödenen Tutar: <strong>+{(d.diff * 1000).toLocaleString("tr-TR")} ₺</strong></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="diff"
                    name="Geri Ödenen Tutar (Bin TL)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    onClick={(data) => onSelectService && onSelectService(data.fullName)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sağ 1 Kolon: Servis Listesi */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="font-bold text-slate-900 text-sm">En Yüksek Geri Ödemeli Servisler</h4>
                <span className="text-xs text-slate-400 font-semibold">{serviceData.length} Servis</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {serviceData.slice(0, 8).map((s, i) => (
                  <div
                    key={s.serviceName}
                    onClick={() => onSelectService && onSelectService(s.serviceName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[170px]">
                      <span className="w-5 h-5 rounded bg-white font-bold text-slate-500 flex items-center justify-center text-[10px] border border-slate-200">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{s.serviceName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">+{s.totalDifference.toLocaleString("tr-TR")} ₺</span>
                      <span className="text-[10px] text-slate-400">{s.count} Dosya</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
