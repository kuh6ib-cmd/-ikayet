import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  TrendingDown,
  BrainCircuit,
  Layers,
  Table,
  Sparkles,
  Bot,
  Filter,
  Car,
  FileSpreadsheet,
  ChevronDown,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  BarChart3,
} from "lucide-react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { MetricCards } from "./components/MetricCards";
import { OverviewChartsSection } from "./components/OverviewChartsSection";
import { ChronicDefectsPanel } from "./components/ChronicDefectsPanel";
import { FinancialAuditPanel } from "./components/FinancialAuditPanel";
import { SemanticNlpPanel } from "./components/SemanticNlpPanel";
import { FleetAndEngineMatrix } from "./components/FleetAndEngineMatrix";
import { ComplaintsTable } from "./components/ComplaintsTable";
import { AiExecutiveReportModal } from "./components/AiExecutiveReportModal";
import { AiChatAssistant } from "./components/AiChatAssistant";
import { ComplaintDetailModal } from "./components/ComplaintDetailModal";
import { DataImportModal } from "./components/DataImportModal";
import { mockAutomotiveComplaints } from "./data/mockAutomotiveData";
import { ComplaintItem, FilterState } from "./types";
import {
  calculateKPIs,
  filterComplaints,
  exportToExcel,
} from "./utils/analytics";
import { normalizeComplaintDataset } from "./utils/textNormalizer";

export default function App() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>(() => normalizeComplaintDataset(mockAutomotiveComplaints));
  const [notification, setNotification] = useState<string | null>(null);

  // Active view tab (Table, Chronic, Financial, Charts, NLP, Matrix)
  const [activeTab, setActiveTab] = useState<"table" | "chronic" | "financial" | "charts" | "nlp" | "matrix">("table");

  // Show / hide executive KPI metric cards
  const [showMetrics, setShowMetrics] = useState(true);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    brand: "",
    model: "",
    modelYear: "",
    engineType: "",
    fleetCompany: "",
    complaintReason: "",
    serviceName: "",
    serviceCity: "",
    faultCategory: "",
    rootCauseType: "",
    kmRange: "",
    severity: "",
    status: "",
    startDate: "",
    endDate: "",
    datePreset: "all",
    onlyChronicRisks: false,
    onlyFinancialDisputes: false,
  });

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  // Filtered dataset
  const filteredComplaints = useMemo(() => {
    return filterComplaints(complaints, filters);
  }, [complaints, filters]);

  // KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(filteredComplaints);
  }, [filteredComplaints]);

  const handleResetData = () => {
    setComplaints(normalizeComplaintDataset(mockAutomotiveComplaints));
    setNotification("Veri seti başlangıç fabrika ayarlarına döndürüldü ve tamamen normalize edildi.");
    setTimeout(() => setNotification(null), 4000);
    setFilters({
      searchQuery: "",
      brand: "",
      model: "",
      modelYear: "",
      engineType: "",
      fleetCompany: "",
      complaintReason: "",
      serviceName: "",
      serviceCity: "",
      faultCategory: "",
      rootCauseType: "",
      kmRange: "",
      severity: "",
      status: "",
      startDate: "",
      endDate: "",
      datePreset: "all",
      onlyChronicRisks: false,
      onlyFinancialDisputes: false,
    });
  };

  const handleNormalizeData = () => {
    setComplaints((prev) => normalizeComplaintDataset(prev));
    setNotification(`Başarılı: ${complaints.length} adet kaydın tüm metin verileri (K&L sütunları, marka, model, motor, filo ve servis isimleri) Türkçe standartlarına göre normalize edildi.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredComplaints, "Otomotiv_Sikayet_ve_Servis_Analiz_Raporu.xlsx");
  };

  const handleSelectCluster = (brand: string, model: string, engineType: string) => {
    setFilters((prev) => ({
      ...prev,
      brand,
      model,
      engineType,
    }));
    setActiveTab("table");
  };

  const handleFilterService = (serviceName: string) => {
    setFilters((prev) => ({
      ...prev,
      serviceName,
    }));
    setActiveTab("table");
  };

  const handleApplyMatrixFilter = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setActiveTab("table");
  };

  const handleDiagnoseComplaint = (item: ComplaintItem) => {
    setSelectedComplaint(item);
  };

  // Hızlı Grafik Tıklama Filtreleyicileri
  const handleSelectReasonFromChart = (reason: string) => {
    setFilters((prev) => ({
      ...prev,
      complaintReason: reason,
    }));
    setActiveTab("table");
  };

  const handleSelectFleetFromChart = (fleet: string) => {
    setFilters((prev) => ({
      ...prev,
      fleetCompany: fleet,
    }));
    setActiveTab("table");
  };

  const handleSelectServiceFromChart = (service: string) => {
    setFilters((prev) => ({
      ...prev,
      serviceName: service,
    }));
    setActiveTab("table");
  };

  const handleSelectMainHeaderFromChart = (mainHeader: string) => {
    setFilters((prev) => ({
      ...prev,
      mainHeader,
    }));
    setActiveTab("table");
  };

  const tabs = [
    {
      id: "table",
      title: "Tüm Şikayet Dosyaları",
      subtitle: "Detaylı Liste & AI Teşhis Masası",
      icon: Table,
      badge: `${filteredComplaints.length} Dosya`,
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
    },
    {
      id: "chronic",
      title: "Kronik Arıza & Risk Tespiti",
      subtitle: "Tekrarlayan Arıza Kümeleri & KM",
      icon: ShieldAlert,
      badge: `${kpis.chronicIssueCount} Risk`,
      badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      id: "financial",
      title: "Geri Ödeme & Mali Denetim",
      subtitle: "İade / Fazlalık & Servis Kıyaslama",
      icon: TrendingDown,
      badge: `+₺${(kpis.totalDifference / 1000).toFixed(0)}k`,
      badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      id: "charts",
      title: "Grafikler & Dağılım Analizi",
      subtitle: "Kategori Ağacı, Filo & Servisler",
      icon: BarChart3,
      badge: "Grafikler",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      id: "nlp",
      title: "Sözlü Şikayet NLP Analizi",
      subtitle: "Serbest Metin & Hatalı Teşhis",
      icon: BrainCircuit,
      badge: "%98.4 Güven",
      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "matrix",
      title: "Araç, Motor & Filo Matrisi",
      subtitle: "Çapraz Kırılım ve Performans",
      icon: Layers,
      badge: "Çapraz",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* 1. Ferah Üst Header */}
      <Header
        totalCount={complaints.length}
        filteredCount={filteredComplaints.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        onNormalizeData={handleNormalizeData}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* 2. Bildirim Toast / Banner */}
      {notification && (
        <div className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 shadow-md flex items-center justify-between transition-all">
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Ana Gövde (Kompakt ve İhtiyaç Odaklı Düzen) */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        
        {/* Üst Kompakt Özet Şeridi & Kartları Göster/Gizle Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Sistem Özeti:</span>
            </span>
            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-semibold">
              📁 {filteredComplaints.length} Aktif Dosya
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
              💰 +₺{(kpis.totalDifference / 1000).toFixed(1)}k Geri Alınan
            </span>
            <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md font-semibold">
              ⚠️ {kpis.chronicIssueCount} Kronik Risk
            </span>
          </div>

          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer self-start sm:self-auto"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showMetrics ? "Özet Kartları Gizle" : "Özet Kartları Göster"}</span>
            {showMetrics ? <ChevronDown className="w-3.5 h-3.5 rotate-180 transition" /> : <ChevronDown className="w-3.5 h-3.5 transition" />}
          </button>
        </div>

        {/* 4 Ana Yönetici KPI Kartı (İsteğe bağlı açılır/kapanır) */}
        {showMetrics && (
          <section className="animate-fadeIn">
            <MetricCards kpis={kpis} />
          </section>
        )}

        {/* Filtreleme Paneli */}
        <section>
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            complaints={complaints}
          />
        </section>

        {/* İhtiyaç Odaklı Temiz Sekme Menüsü (Tüm Modüller 1 Tık Uzaklıkta) */}
        <section className="bg-white rounded-xl shadow-2xs border border-slate-200 p-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col text-left p-2.5 sm:p-3 rounded-lg transition-all cursor-pointer border ${
                    isActive
                      ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs"
                      : "bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className={`text-xs font-bold truncate ${isActive ? "text-indigo-900" : "text-slate-800"}`}>
                      {tab.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5 text-[11px]">
                    <span className="text-slate-400 text-[10px] truncate mr-1">{tab.subtitle}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${tab.badgeStyle}`}>
                      {tab.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Seçili Aktif Modül İçeriği (Yalnızca tıklanan görünüm tek başına yüklenir) */}
        <main className="transition-all duration-200">
          {activeTab === "table" && (
            <ComplaintsTable
              complaints={filteredComplaints}
              onSelectComplaint={(item) => setSelectedComplaint(item)}
              onDiagnoseComplaint={handleDiagnoseComplaint}
            />
          )}

          {activeTab === "chronic" && (
            <ChronicDefectsPanel
              complaints={filteredComplaints}
              onSelectCluster={handleSelectCluster}
              onDiagnoseItem={handleDiagnoseComplaint}
            />
          )}

          {activeTab === "financial" && (
            <FinancialAuditPanel
              complaints={filteredComplaints}
              kpis={kpis}
              onFilterService={handleFilterService}
            />
          )}

          {activeTab === "charts" && (
            <OverviewChartsSection
              complaints={filteredComplaints}
              onSelectReason={handleSelectReasonFromChart}
              onSelectFleet={handleSelectFleetFromChart}
              onSelectService={handleSelectServiceFromChart}
              onSelectMainHeader={handleSelectMainHeaderFromChart}
            />
          )}

          {activeTab === "nlp" && (
            <SemanticNlpPanel
              complaints={filteredComplaints}
              onDiagnoseItem={handleDiagnoseComplaint}
            />
          )}

          {activeTab === "matrix" && (
            <FleetAndEngineMatrix
              complaints={filteredComplaints}
              onApplyFilter={handleApplyMatrixFilter}
            />
          )}
        </main>
      </div>

      {/* Modallar ve Canlı Asistan */}
      {isReportModalOpen && (
        <AiExecutiveReportModal
          complaints={filteredComplaints}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {isImportModalOpen && (
        <DataImportModal
          onClose={() => setIsImportModalOpen(false)}
          onDataImported={(newItems) => setComplaints(newItems)}
          sampleItems={mockAutomotiveComplaints}
        />
      )}

      {selectedComplaint && (
        <ComplaintDetailModal
          item={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}

      <AiChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        complaints={filteredComplaints}
      />
    </div>
  );
}
