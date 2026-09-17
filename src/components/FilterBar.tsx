import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  AlertOctagon,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Calendar,
  Building,
  Wrench,
  Car,
  AlertCircle,
  FolderTree,
  FilterX,
  Sparkles,
} from "lucide-react";
import { FilterState, ComplaintItem, FaultCategory } from "../types";
import {
  AUTOMOTIVE_CATALOG,
  getModelsForBrand,
  getEnginesForBrandAndModel,
  COMPLAINT_REASONS,
  RECOGNIZED_FLEETS,
} from "../data/automotiveCatalog";
import {
  normalizeDate,
  normalizeBrand,
  normalizeModel,
  normalizeEngineType,
  normalizeFleetCompany,
  normalizeServiceName,
  normalizeMainHeader,
  normalizeSubTopic,
} from "../utils/textNormalizer";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  complaints: ComplaintItem[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  complaints,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // 1. Markalar: Katalogdaki markalar + veri setindeki markalar (Tekilleştirilmiş & Normalize)
  const allBrands = useMemo(() => {
    const catalogBrands = AUTOMOTIVE_CATALOG.map((b) => normalizeBrand(b.brand));
    const datasetBrands = complaints.map((c) => normalizeBrand(c.brand));
    return Array.from(new Set([...catalogBrands, ...datasetBrands])).filter(Boolean).sort();
  }, [complaints]);

  // 2. KATI KADEMELİ MODEL SEÇİMİ (Cascading Filter):
  // Seçilen markaya ait OLAN modeller (başka hiçbir markanın modeli gelmez!)
  const availableModels = useMemo(() => {
    if (!filters.brand) {
      return Array.from(
        new Set(complaints.map((c) => normalizeModel(c.model, normalizeBrand(c.brand))))
      )
        .filter(Boolean)
        .sort();
    }
    const normSelectedBrand = normalizeBrand(filters.brand);
    const catalogModels = getModelsForBrand(normSelectedBrand);
    const datasetModels = complaints
      .filter((c) => normalizeBrand(c.brand).toLowerCase() === normSelectedBrand.toLowerCase())
      .map((c) => normalizeModel(c.model, normSelectedBrand));
    return Array.from(new Set([...catalogModels, ...datasetModels])).filter(Boolean).sort();
  }, [filters.brand, complaints]);

  // 3. KATI KADEMELİ MOTOR SEÇİMİ:
  const availableEngines = useMemo(() => {
    if (filters.brand && filters.model) {
      const normSelectedBrand = normalizeBrand(filters.brand);
      const normSelectedModel = normalizeModel(filters.model, normSelectedBrand);
      const catalogEngines = getEnginesForBrandAndModel(normSelectedBrand, normSelectedModel);
      const datasetEngines = complaints
        .filter(
          (c) =>
            normalizeBrand(c.brand).toLowerCase() === normSelectedBrand.toLowerCase() &&
            normalizeModel(c.model, normSelectedBrand).toLowerCase() === normSelectedModel.toLowerCase()
        )
        .map((c) => normalizeEngineType(c.engineType));
      return Array.from(new Set([...catalogEngines, ...datasetEngines])).filter(Boolean).sort();
    }
    return Array.from(new Set(complaints.map((c) => normalizeEngineType(c.engineType)))).filter(Boolean).sort();
  }, [filters.brand, filters.model, complaints]);

  // 4. K Sütunu: Ana Başlıklar
  const allMainHeaders = useMemo(() => {
    const headers = complaints
      .map((c) => normalizeMainHeader(c.mainHeader || c.faultCategory, c.complaintSubject))
      .filter((h) => h && !h.startsWith("SRV-") && !h.startsWith("CMP-") && !h.startsWith("KAYIT-") && !/^\d+$/.test(h));
    return Array.from(new Set(headers)).filter(Boolean).sort();
  }, [complaints]);

  // 5. L Sütunu: Konu & Şikayet Sebepleri
  const allReasons = useMemo(() => {
    const recognizedReasons = COMPLAINT_REASONS.map((r) => normalizeSubTopic(r));
    const datasetReasons = complaints
      .map((c) => normalizeSubTopic(c.subTopic || c.complaintReason || c.complaintSubject))
      .filter((r) => r && !r.startsWith("SRV-") && !r.startsWith("CMP-") && !r.startsWith("KAYIT-") && !/^\d+$/.test(r));
    return Array.from(new Set([...recognizedReasons, ...datasetReasons])).filter(Boolean).sort();
  }, [complaints]);

  // 6. Bildiren Firmalar (Filolar)
  const allFleets = useMemo(() => {
    const recognizedFleets = RECOGNIZED_FLEETS.map((f) => normalizeFleetCompany(f));
    const datasetFleets = complaints.map((c) => normalizeFleetCompany(c.reportedByCompany || c.fleetCompany));
    return Array.from(new Set([...recognizedFleets, ...datasetFleets])).filter(Boolean).sort();
  }, [complaints]);

  // 7. Şikayetçi Olunan Servisler
  const allServices = useMemo(() => {
    return Array.from(
      new Set(complaints.map((c) => normalizeServiceName(c.complainedService || c.serviceName)))
    ).filter(Boolean).sort();
  }, [complaints]);

  // 8. Veri Setindeki Gerçek Tarih Aralığı ve Mevcut Yıllar
  const { datasetYears, maxDateInDataset } = useMemo(() => {
    const validDates = complaints
      .map((c) => normalizeDate(c.date))
      .filter((d) => d && d !== "2024-01-01")
      .sort();

    const maxDate = validDates.length > 0
      ? validDates[validDates.length - 1]
      : new Date().toISOString().slice(0, 10);

    const years = (
      Array.from(
        new Set(complaints.map((c) => (c.date ? normalizeDate(c.date).slice(0, 4) : "")))
      ) as string[]
    )
      .filter((y) => Boolean(y && /^\d{4}$/.test(y)))
      .sort();

    return {
      datasetYears: years.length > 0 ? years : ["2024", "2025"],
      maxDateInDataset: maxDate,
    };
  }, [complaints]);

  const updateField = (field: keyof FilterState, value: any) => {
    const updated = {
      ...filters,
      [field]: value,
    };

    // Manuel tarih girildiğinde hazır preset'i custom yap
    if (field === "startDate" || field === "endDate") {
      updated.datePreset = "custom";
    }

    // Marka değiştiğinde modeli ve motoru sıfırla (Başka markanın modeli asla kalmasın)
    if (field === "brand") {
      updated.model = "";
      updated.engineType = "";
    }
    // Model değiştiğinde motoru sıfırla
    if (field === "model") {
      updated.engineType = "";
    }

    onFilterChange(updated);
  };

  const handleDatePreset = (preset: string) => {
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    let start = "";
    let end = "";

    // Veri setinin son tarihi baz alınarak son 30/90/180 gün hesaplanır
    const refDate = maxDateInDataset ? new Date(maxDateInDataset) : new Date();

    if (preset === "30d") {
      const d = new Date(refDate);
      d.setDate(d.getDate() - 30);
      start = formatDate(d);
      end = maxDateInDataset;
    } else if (preset === "90d") {
      const d = new Date(refDate);
      d.setDate(d.getDate() - 90);
      start = formatDate(d);
      end = maxDateInDataset;
    } else if (preset === "180d") {
      const d = new Date(refDate);
      d.setDate(d.getDate() - 180);
      start = formatDate(d);
      end = maxDateInDataset;
    } else if (/^\d{4}$/.test(preset)) {
      start = `${preset}-01-01`;
      end = `${preset}-12-31`;
    } else if (preset === "all") {
      start = "";
      end = "";
    }

    onFilterChange({
      ...filters,
      startDate: start,
      endDate: end,
      datePreset: preset,
    });
  };

  const handleClearDateFilter = () => {
    onFilterChange({
      ...filters,
      startDate: "",
      endDate: "",
      datePreset: "all",
    });
  };

  const handleReset = () => {
    onFilterChange({
      searchQuery: "",
      brand: "",
      model: "",
      modelYear: "",
      engineType: "",
      fleetCompany: "",
      mainHeader: "",
      subTopic: "",
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

  // Aktif filtrelerin dinamik listesi
  const activeFiltersList = useMemo(() => {
    const list: { key: keyof FilterState; label: string; value: string }[] = [];
    if (filters.searchQuery) list.push({ key: "searchQuery", label: "Arama", value: `"${filters.searchQuery}"` });
    if (filters.brand) list.push({ key: "brand", label: "Marka", value: filters.brand });
    if (filters.model) list.push({ key: "model", label: "Model", value: filters.model });
    if (filters.engineType) list.push({ key: "engineType", label: "Motor", value: filters.engineType });
    if (filters.mainHeader) list.push({ key: "mainHeader", label: "Ana Başlık", value: filters.mainHeader });
    if (filters.complaintReason) list.push({ key: "complaintReason", label: "Konu", value: filters.complaintReason });
    if (filters.fleetCompany) list.push({ key: "fleetCompany", label: "Filo", value: filters.fleetCompany });
    if (filters.serviceName) list.push({ key: "serviceName", label: "Servis", value: filters.serviceName });
    if (filters.serviceCity) list.push({ key: "serviceCity", label: "Şehir", value: filters.serviceCity });
    if (filters.faultCategory) list.push({ key: "faultCategory", label: "Kategori", value: filters.faultCategory });
    if (filters.kmRange) list.push({ key: "kmRange", label: "KM", value: filters.kmRange });
    if (filters.startDate || filters.endDate) {
      list.push({ key: "startDate", label: "Tarih", value: `${filters.startDate || "Başlangıç"} / ${filters.endDate || "Bitiş"}` });
    } else if (filters.datePreset && filters.datePreset !== "all") {
      const presetName =
        filters.datePreset === "30d"
          ? "Son 30 Gün"
          : filters.datePreset === "90d"
          ? "Son 3 Ay"
          : filters.datePreset === "180d"
          ? "Son 6 Ay"
          : `${filters.datePreset} Yılı`;
      list.push({ key: "datePreset", label: "Tarih", value: presetName });
    }
    if (filters.onlyChronicRisks) list.push({ key: "onlyChronicRisks", label: "Filtre", value: "Kronik Riskler" });
    if (filters.onlyFinancialDisputes) list.push({ key: "onlyFinancialDisputes", label: "Filtre", value: "Fark İtirazları" });
    return list;
  }, [filters]);

  const hasActiveFilters = activeFiltersList.length > 0;

  const removeSingleFilter = (key: keyof FilterState) => {
    if (key === "onlyChronicRisks" || key === "onlyFinancialDisputes") {
      updateField(key, false);
    } else if (key === "startDate" || key === "endDate" || key === "datePreset") {
      handleClearDateFilter();
    } else if (key === "brand") {
      updateField("brand", "");
    } else {
      updateField(key, "");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-4">
      {/* 1. Üst Satır: Arama Çubuğu + Hızlı Butonlar + En Sağda Şık 'Filtreleri Temizle' Butonu */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Arama Kutusu */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-global-search"
            type="text"
            placeholder="Plaka, Şasi No, Bildiren Firma, K Sütunu (Ana Başlık), L Sütunu (Konu), Servis Ara..."
            value={filters.searchQuery}
            onChange={(e) => updateField("searchQuery", e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateField("searchQuery", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hızlı Aksiyon Butonları & En Sağdaki Şık 'Filtreleri Temizle' Butonu */}
        <div className="flex items-center flex-wrap gap-2 justify-between lg:justify-end">
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-filter-chronic"
              onClick={() => updateField("onlyChronicRisks", !filters.onlyChronicRisks)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                filters.onlyChronicRisks
                  ? "bg-rose-50 border-rose-300 text-rose-700 shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              <span>Sadece Kronik Riskler</span>
            </button>

            <button
              id="btn-filter-disputes"
              onClick={() => updateField("onlyFinancialDisputes", !filters.onlyFinancialDisputes)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                filters.onlyFinancialDisputes
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Geri Ödenen Tutarlar</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isExpanded ? "Filtreleri Daralt" : "Ayrıntılı Filtreler"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* EN SAĞDAKİ ŞIK 'FİLTRELERİ TEMİZLE' BUTONU */}
          <button
            id="btn-clear-all-filters"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shadow-xs select-none ${
              hasActiveFilters
                ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/20 hover:shadow-md active:scale-95 cursor-pointer ring-2 ring-rose-500/30"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
            }`}
            title={
              hasActiveFilters
                ? `Tüm aktif filtreleri (${activeFiltersList.length}) temizle ve orijinal veri setine dön`
                : "Uygulanmış herhangi bir filtre bulunmuyor (Orijinal Veri Seti Aktif)"
            }
          >
            <RotateCcw
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                hasActiveFilters ? "text-white group-hover:-rotate-90" : "text-slate-400"
              }`}
            />
            <span className="tracking-tight">Filtreleri Temizle</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black bg-white text-rose-700 shadow-2xs">
                {activeFiltersList.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Aktif Filtreler Rozet Şeridi (Kullanıcı hangi filtrelerin uygulandığını net görür ve tek tıkla silebilir) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <FilterX className="w-3 h-3 text-rose-500" />
            <span>Aktif Filtreler ({activeFiltersList.length}):</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFiltersList.map((f, idx) => (
              <span
                key={`${f.key}-${idx}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 hover:border-indigo-300 transition"
              >
                <span className="text-indigo-500 font-bold">{f.label}:</span>
                <span className="max-w-[150px] truncate">{f.value}</span>
                <button
                  onClick={() => removeSingleFilter(f.key)}
                  className="p-0.5 hover:bg-indigo-200 rounded text-indigo-700 hover:text-indigo-900 transition cursor-pointer"
                  title={`${f.label} filtresini kaldır`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1 cursor-pointer"
            >
              Hepsini Temizle
            </button>
          </div>
        </div>
      )}

      {/* 2. TARİH ARALIĞI FİLTRASYONU (Hızlı Butonlar + Takvim) */}
      <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tarih Aralığı:</span>
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { id: "all", label: "Tüm Zamanlar" },
              { id: "30d", label: "Son 30 Gün" },
              { id: "90d", label: "Son 3 Ay" },
              { id: "180d", label: "Son 6 Ay" },
              ...datasetYears.map((y) => ({ id: y, label: `${y} Yılı` })),
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleDatePreset(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                  filters.datePreset === p.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Özel Tarih Seçiciler */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Başlangıç:</span>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Bitiş:</span>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          {(filters.startDate || filters.endDate) && (
            <button
              onClick={handleClearDateFilter}
              title="Tarih Filtresini Temizle"
              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer text-[11px] font-semibold flex items-center gap-1 px-1.5"
            >
              <X className="w-3 h-3" />
              <span>Tarihi Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. AYRINTILI KADEMELİ FİLTRE IZGARASI (Cascading Brand -> Model -> Engine + K Sütunu + L Sütunu + Bildiren Firma + Servis) */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* 1. Araç Markası */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Araç Markası</span>
              {filters.brand && (
                <span className="text-[10px] text-indigo-600 font-semibold">Seçildi</span>
              )}
            </label>
            <div className="relative">
              <select
                id="select-brand"
                value={filters.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                className={`w-full appearance-none rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none pr-7 border ${
                  filters.brand
                    ? "bg-indigo-50/50 border-indigo-300 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="">Tüm Markalar ({allBrands.length})</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Araç Modeli (KATI KADEMELİ) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Araç Modeli</span>
              {filters.brand && (
                <span className="text-[10px] text-slate-400">({availableModels.length})</span>
              )}
            </label>
            <div className="relative">
              <select
                id="select-model"
                value={filters.model}
                onChange={(e) => updateField("model", e.target.value)}
                disabled={!filters.brand && availableModels.length === 0}
                className={`w-full appearance-none rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none pr-7 border ${
                  filters.model
                    ? "bg-indigo-50/50 border-indigo-300 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="">
                  {filters.brand
                    ? `${filters.brand} Modelleri`
                    : "Önce Marka Seçiniz"}
                </option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Motor Tipi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Motor Tipi
            </label>
            <div className="relative">
              <select
                id="select-engine"
                value={filters.engineType}
                onChange={(e) => updateField("engineType", e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 pr-7"
              >
                <option value="">Tüm Motorlar</option>
                {availableEngines.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. K SÜTUNU: Ana Başlık */}
          <div>
            <label className="block text-[11px] font-bold text-indigo-950 mb-1 flex items-center gap-1">
              <FolderTree className="w-3 h-3 text-indigo-600" />
              <span>K Sütunu: Ana Başlık</span>
            </label>
            <div className="relative">
              <select
                id="select-main-header"
                value={filters.mainHeader || ""}
                onChange={(e) => updateField("mainHeader", e.target.value)}
                className={`w-full appearance-none rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none pr-7 border ${
                  filters.mainHeader
                    ? "bg-indigo-50/70 border-indigo-400 text-indigo-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <option value="">Tüm Ana Başlıklar ({allMainHeaders.length})</option>
                {allMainHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. L SÜTUNU: Konu & Şikayet Sebebi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              L Sütunu: Konu
            </label>
            <div className="relative">
              <select
                id="select-reason"
                value={filters.complaintReason}
                onChange={(e) => updateField("complaintReason", e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 pr-7"
              >
                <option value="">Tüm Konular ({allReasons.length})</option>
                {allReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 6. Bildiren Firma (Filo) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Bildiren Firma
            </label>
            <div className="relative">
              <select
                id="select-fleet"
                value={filters.fleetCompany}
                onChange={(e) => updateField("fleetCompany", e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 pr-7"
              >
                <option value="">Tüm Bildiren Firmalar ({allFleets.length})</option>
                {allFleets.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. Şikayetçi Olunan Servis */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Servis
            </label>
            <div className="relative">
              <select
                id="select-service"
                value={filters.serviceName}
                onChange={(e) => updateField("serviceName", e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 pr-7"
              >
                <option value="">Tüm Servisler ({allServices.length})</option>
                {allServices.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
