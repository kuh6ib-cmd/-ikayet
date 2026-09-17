import React, { useState, useMemo } from "react";
import {
  Layers,
  Car,
  Building,
  Fuel,
  TrendingDown,
  FolderTree,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Flame,
  X,
  ExternalLink,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  Activity,
  Gauge,
  HelpCircle,
  Filter,
} from "lucide-react";
import { ComplaintItem } from "../types";
import {
  normalizeBrand,
  normalizeModel,
  normalizeEngineType,
  normalizeFleetCompany,
  normalizeSubTopic,
  normalizeMainHeader,
  normalizeServiceName,
} from "../utils/textNormalizer";
import { standardizeFaultCategory } from "../utils/analytics";

interface FleetAndEngineMatrixProps {
  complaints: ComplaintItem[];
  onApplyFilter: (field: string, value: string) => void;
}

export interface RiskTarget {
  type: "fleet" | "vehicle" | "engine" | "all";
  name: string;
  brand?: string;
  model?: string;
  engineType?: string;
}

export interface MajorFaultRiskInsight {
  targetType: "fleet" | "vehicle" | "engine" | "all";
  targetName: string;
  targetSubTitle: string;
  totalRecords: number;
  // Major Fault Category
  majorFaultCategory: string;
  majorCategoryCount: number;
  majorCategoryPercentage: number;
  // Top specific defect
  topDefectReason: string;
  topDefectCount: number;
  topDefectPercentage: number;
  // Risk metrics
  projectedRiskScore: number;
  riskLevel: "Kritik" | "Yüksek" | "Orta" | "Düşük";
  riskColor: string;
  riskBadgeBg: string;
  riskBorderColor: string;
  // KM & Financials
  avgKm: number;
  kmSweetSpot: string;
  avgInvoicedCost: number;
  totalInvoicedCost: number;
  totalDifference: number;
  chronicCount: number;
  misdiagnosedCount: number;
  // Category Breakdown
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  // Preventive Strategic Action
  preventiveAction: string;
  actionTag: string;
}

/**
 * Dinamik olarak seçili filo, araç modeli veya motor kırılımında
 * en sık görülen hata türünü (Major Fault Category) ve öngörülen riski hesaplayan fonksiyon
 */
export function calculateMajorFaultRisk(
  target: RiskTarget | null,
  complaints: ComplaintItem[]
): MajorFaultRiskInsight | null {
  if (!complaints || complaints.length === 0) return null;

  let filtered = complaints;
  let targetType: "fleet" | "vehicle" | "engine" | "all" = "all";
  let targetName = "Tüm Filo ve Araç Portföyü";
  let targetSubTitle = "Sistem Geneli Çapraz Matris Özeti";

  if (target && target.type === "fleet" && target.name && target.name !== "all") {
    targetType = "fleet";
    targetName = target.name;
    targetSubTitle = "Seçili Filo Şirketi Kırılımı";
    filtered = complaints.filter(
      (c) => normalizeFleetCompany(c.reportedByCompany || c.fleetCompany) === target.name
    );
  } else if (target && target.type === "vehicle" && target.name && target.name !== "all") {
    targetType = "vehicle";
    targetName = target.name;
    targetSubTitle = "Seçili Araç Modeli Kırılımı";
    filtered = complaints.filter((c) => {
      const normBrand = normalizeBrand(c.brand);
      const normModel = normalizeModel(c.model, normBrand);
      return `${normBrand} ${normModel}` === target.name || (target.brand === normBrand && target.model === normModel);
    });
  } else if (target && target.type === "engine" && target.name && target.name !== "all") {
    targetType = "engine";
    targetName = target.name;
    targetSubTitle = "Seçili Motor Ailesi Kırılımı";
    filtered = complaints.filter(
      (c) => normalizeEngineType(c.engineType || "Genel Motor") === target.name
    );
  }

  if (filtered.length === 0) {
    filtered = complaints;
  }

  const totalRecords = filtered.length;
  let totalCost = 0;
  let totalDifference = 0;
  let totalKm = 0;
  let chronicCount = 0;
  let misdiagnosedCount = 0;

  const categoryCounts: Record<string, number> = {};
  const defectCounts: Record<string, number> = {};
  const categorySpecificDefects: Record<string, Record<string, number>> = {};

  for (const item of filtered) {
    totalCost += item.financials?.invoicedCost || 0;
    totalDifference += item.financials?.difference || 0;
    totalKm += item.km || 0;
    if (item.chronicRiskScore >= 70) chronicCount += 1;
    if (item.isMisdiagnosisFlagged) misdiagnosedCount += 1;

    const cat = standardizeFaultCategory(item.mainHeader, item.subTopic, item.complaintSubject || item.faultCategory);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const defect = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Mekanik Arıza");
    defectCounts[defect] = (defectCounts[defect] || 0) + 1;

    if (!categorySpecificDefects[cat]) categorySpecificDefects[cat] = {};
    categorySpecificDefects[cat][defect] = (categorySpecificDefects[cat][defect] || 0) + 1;
  }

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const majorFaultCategory = categoryBreakdown[0]?.category || "Motor Hasarı & Yağ Kaçağı";
  const majorCategoryCount = categoryBreakdown[0]?.count || 0;
  const majorCategoryPercentage = categoryBreakdown[0]?.percentage || 0;

  const categoryDefects = categorySpecificDefects[majorFaultCategory] || defectCounts;
  const sortedDefects = Object.entries(categoryDefects).sort((a, b) => b[1] - a[1]);
  const topDefectReason = sortedDefects[0]?.[0] || Object.entries(defectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mekanik Arıza";
  const topDefectCount = sortedDefects[0]?.[1] || 0;
  const topDefectPercentage = totalRecords > 0 ? Math.round((topDefectCount / totalRecords) * 100) : 0;

  const avgKm = totalRecords > 0 ? Math.round(totalKm / totalRecords) : 0;
  const avgInvoicedCost = totalRecords > 0 ? Math.round(totalCost / totalRecords) : 0;

  let kmSweetSpot = "Tüm KM Aralıkları";
  if (avgKm < 35000) kmSweetSpot = "0 - 35.000 KM (Erken Dönem Arızası)";
  else if (avgKm < 65000) kmSweetSpot = "35.000 - 65.000 KM (Kritik Aşınma Eşiği)";
  else if (avgKm < 100000) kmSweetSpot = "65.000 - 100.000 KM (Yüksek Risk Aralığı)";
  else kmSweetSpot = "100.000+ KM (Ağır Hizmet ve Yaşlanma)";

  const rawRiskSum = filtered.reduce((acc, c) => acc + (c.chronicRiskScore || 50), 0);
  const avgChronicRisk = totalRecords > 0 ? rawRiskSum / totalRecords : 50;
  const dominanceFactor = (majorCategoryPercentage / 100) * 20;
  const projectedRiskScore = Math.min(99, Math.max(15, Math.round(avgChronicRisk * 0.75 + dominanceFactor)));

  let riskLevel: "Kritik" | "Yüksek" | "Orta" | "Düşük" = "Orta";
  let riskColor = "text-indigo-700";
  let riskBadgeBg = "bg-indigo-50 text-indigo-800 border-indigo-200";
  let riskBorderColor = "border-indigo-300";

  if (projectedRiskScore >= 70) {
    riskLevel = "Kritik";
    riskColor = "text-rose-700";
    riskBadgeBg = "bg-rose-50 text-rose-800 border-rose-200";
    riskBorderColor = "border-rose-300";
  } else if (projectedRiskScore >= 45) {
    riskLevel = "Yüksek";
    riskColor = "text-amber-700";
    riskBadgeBg = "bg-amber-50 text-amber-800 border-amber-200";
    riskBorderColor = "border-amber-300";
  } else if (projectedRiskScore >= 25) {
    riskLevel = "Orta";
    riskColor = "text-indigo-700";
    riskBadgeBg = "bg-indigo-50 text-indigo-800 border-indigo-200";
    riskBorderColor = "border-indigo-300";
  } else {
    riskLevel = "Düşük";
    riskColor = "text-emerald-700";
    riskBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    riskBorderColor = "border-emerald-300";
  }

  let preventiveAction = "Bu kırılımdaki araçların periyodik bakımlarında ilgili bileşenlerin diagnostik testten geçirilmesi önerilir.";
  let actionTag = "Proaktif Servis Aksiyonu";

  if (majorFaultCategory.includes("Şanzıman")) {
    preventiveAction = "Filo araçlarında 45.000–65.000 KM aralığında mekatronik basınç testi ve kavrama tolerans kalibrasyonu zorunlu tutulmalı; yetkili servis çift kavrama değişim talepleri garanti ve rücu kapsamında denetlenmelidir.";
    actionTag = "Şanzıman Kalibrasyonu & Basınç Testi";
  } else if (majorFaultCategory.includes("AdBlue") || majorFaultCategory.includes("DPF")) {
    preventiveAction = "Şehir içi yoğun kullanılan dizel filolarda 25.000 KM'de bir DPF rejenerasyon seviyesi ve AdBlue kristalleşme sensörleri kontrol edilmeli; gereksiz SCR pompası değişimleri engellenmelidir.";
    actionTag = "Emisyon & AdBlue Kristalizasyon Kontrolü";
  } else if (majorFaultCategory.includes("Motor") || majorFaultCategory.includes("Yağ")) {
    preventiveAction = "Külbütör kapağı ve karter contası yağ terlemeleri erken safhada tespit edilerek ağır motor hasarı önlenmeli; motor yağı eksiltme toleransları filo sözleşmelerine göre takip edilmelidir.";
    actionTag = "Yağ Kaçağı & Külbütör İncelemesi";
  } else if (majorFaultCategory.includes("Turbo")) {
    preventiveAction = "Turbo wastegate boşluğu ve emme manifoldu kurum birikimi 50.000 KM periyodunda kontrol edilmeli; erken turbo revizyonu maliyetleri düşürülmelidir.";
    actionTag = "Turbo Basınç & Emme Manifoldu";
  } else if (majorFaultCategory.includes("Soğutma") || majorFaultCategory.includes("Termostat")) {
    preventiveAction = "Termostat flanşı ve devridaim su kaçağı kontrolleri periyodik bakım kontrol listesine eklenmeli; hararet kaynaklı silindir kapak deformasyon riski engellenmelidir.";
    actionTag = "Termostat & Devridaim Sızıntı Takibi";
  } else if (majorFaultCategory.includes("Fren") || majorFaultCategory.includes("Süspansiyon")) {
    preventiveAction = "Filo rot ve amortisör üst takoz aşınmaları periyodik muayenelerde incelenmeli; aşırı yıpranan aks körükleri garanti kapsamında değiştirilmelidir.";
    actionTag = "Yürüyen Aksam & Fren Testi";
  } else if (majorFaultCategory.includes("Elektrik") || majorFaultCategory.includes("Elektronik")) {
    preventiveAction = "Akü voltaj dalgalanmaları ve CAN-Bus iletişim hataları diagnostik cihazla taranmalı; haksız beyin değişim talepleri itiraza yönlendirilmelidir.";
    actionTag = "ECU & CAN-Bus Diagnostik Tarama";
  }

  return {
    targetType,
    targetName,
    targetSubTitle,
    totalRecords,
    majorFaultCategory,
    majorCategoryCount,
    majorCategoryPercentage,
    topDefectReason,
    topDefectCount,
    topDefectPercentage,
    projectedRiskScore,
    riskLevel,
    riskColor,
    riskBadgeBg,
    riskBorderColor,
    avgKm,
    kmSweetSpot,
    avgInvoicedCost,
    totalInvoicedCost: totalCost,
    totalDifference,
    chronicCount,
    misdiagnosedCount,
    categoryBreakdown: categoryBreakdown.slice(0, 4),
    preventiveAction,
    actionTag,
  };
}

export interface EngineNode {
  engineType: string;
  items: ComplaintItem[];
  totalCost: number;
  totalDifference: number;
  chronicCount: number;
  topReason: string;
  topReasonPercentage: number;
  reasons: { reason: string; count: number }[];
}

export interface ModelNode {
  modelKey: string;
  brand: string;
  model: string;
  items: ComplaintItem[];
  totalCost: number;
  totalDifference: number;
  chronicCount: number;
  engines: Record<string, EngineNode>;
  topReason: string;
  topReasonPercentage: number;
}

export interface FleetNode {
  fleetName: string;
  items: ComplaintItem[];
  totalCost: number;
  totalDifference: number;
  chronicCount: number;
  models: Record<string, ModelNode>;
  topReason: string;
}

interface SelectionInsight {
  type: "engine" | "model" | "fleet";
  name: string;
  subTitle?: string;
  items: ComplaintItem[];
  totalCount: number;
  totalCost: number;
  totalDifference: number;
  avgKm: number;
  chronicCount: number;
  topReasons: { reason: string; count: number; percentage: number }[];
  topMainHeaders: { header: string; count: number; percentage: number }[];
  topSubTopics: { topic: string; count: number; percentage: number }[];
  topCategories: { category: string; count: number }[];
  topServices: { service: string; count: number }[];
  misdiagnosedCount: number;
}

export const FleetAndEngineMatrix: React.FC<FleetAndEngineMatrixProps> = ({
  complaints,
  onApplyFilter,
}) => {
  const [subTab, setSubTab] = useState<"tree" | "engine" | "model" | "fleet">("tree");
  const [selectedInsight, setSelectedInsight] = useState<SelectionInsight | null>(null);

  // Tree expand/collapse state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAllNodes = () => {
    const all: Record<string, boolean> = {};
    for (const c of complaints) {
      const fleet = c.reportedByCompany || c.fleetCompany || "Özmal / Filo";
      const modelKey = `${c.brand} ${c.model}`;
      const engineKey = c.engineType || "Bilinmeyen Motor";
      all[`fleet_${fleet}`] = true;
      all[`model_${fleet}_${modelKey}`] = true;
      all[`engine_${fleet}_${modelKey}_${engineKey}`] = true;
    }
    setExpandedNodes(all);
  };

  const collapseAllNodes = () => {
    setExpandedNodes({});
  };

  // Helper to compute insights for any filtered subset
  const computeInsight = (
    type: "engine" | "model" | "fleet",
    name: string,
    subTitle: string,
    items: ComplaintItem[]
  ): SelectionInsight => {
    const totalCount = items.length;
    let totalCost = 0;
    let totalDifference = 0;
    let totalKm = 0;
    let chronicCount = 0;
    let misdiagnosedCount = 0;

    const reasonMap: Record<string, number> = {};
    const mainHeaderMap: Record<string, number> = {};
    const subTopicMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    const serviceMap: Record<string, number> = {};

    for (const item of items) {
      totalCost += item.financials?.invoicedCost || 0;
      totalDifference += item.financials?.difference || 0;
      totalKm += item.km || 0;
      if (item.chronicRiskScore >= 70) chronicCount += 1;
      if (item.isMisdiagnosisFlagged) misdiagnosedCount += 1;

      const reason = item.complaintReason || item.complaintSubject || "Genel Arıza";
      reasonMap[reason] = (reasonMap[reason] || 0) + 1;

      const header = item.mainHeader || item.faultCategory || "Belirtilmemiş Başlık";
      mainHeaderMap[header] = (mainHeaderMap[header] || 0) + 1;

      const topic = item.subTopic || item.complaintSubject || "Belirtilmemiş Konu";
      subTopicMap[topic] = (subTopicMap[topic] || 0) + 1;

      const cat = item.faultCategory || "Mekanik";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;

      const srv = item.complainedService || item.serviceName || "Yetkili Servis";
      serviceMap[srv] = (serviceMap[srv] || 0) + 1;
    }

    const topReasons = Object.entries(reasonMap)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topMainHeaders = Object.entries(mainHeaderMap)
      .map(([header, count]) => ({
        header,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topSubTopics = Object.entries(subTopicMap)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topCategories = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topServices = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);

    return {
      type,
      name,
      subTitle,
      items,
      totalCount,
      totalCost,
      totalDifference,
      avgKm: totalCount > 0 ? Math.round(totalKm / totalCount) : 0,
      chronicCount,
      topReasons,
      topMainHeaders,
      topSubTopics,
      topCategories,
      topServices,
      misdiagnosedCount,
    };
  };

  // 1. Hiyerarşik Ağaç Verisi (Filo Gövdesi -> Araç Modelleri -> Motor Tipleri -> Arızalar)
  const treeData = useMemo<FleetNode[]>(() => {
    const fleets: Record<string, FleetNode> = {};

    for (const c of complaints) {
      const fleetName = normalizeFleetCompany(c.reportedByCompany || c.fleetCompany || "Özmal / Kurumsal Filo");
      const normBrand = normalizeBrand(c.brand);
      const normModel = normalizeModel(c.model, normBrand);
      const modelKey = `${normBrand} ${normModel}`;
      const engineKey = normalizeEngineType(c.engineType || "Genel Motor");
      const cost = c.financials?.invoicedCost || 0;
      const diff = c.financials?.difference || 0;
      const isChronic = c.chronicRiskScore >= 70;

      // 1. Filo Seviyesi (Gövde)
      if (!fleets[fleetName]) {
        fleets[fleetName] = {
          fleetName,
          items: [],
          totalCost: 0,
          totalDifference: 0,
          chronicCount: 0,
          models: {},
          topReason: "",
        };
      }
      fleets[fleetName].items.push(c);
      fleets[fleetName].totalCost += cost;
      fleets[fleetName].totalDifference += diff;
      if (isChronic) fleets[fleetName].chronicCount += 1;

      // 2. Model Seviyesi (Dallar)
      if (!fleets[fleetName].models[modelKey]) {
        fleets[fleetName].models[modelKey] = {
          modelKey,
          brand: normBrand,
          model: normModel,
          items: [],
          totalCost: 0,
          totalDifference: 0,
          chronicCount: 0,
          engines: {},
          topReason: "",
          topReasonPercentage: 0,
        };
      }
      fleets[fleetName].models[modelKey].items.push(c);
      fleets[fleetName].models[modelKey].totalCost += cost;
      fleets[fleetName].models[modelKey].totalDifference += diff;
      if (isChronic) fleets[fleetName].models[modelKey].chronicCount += 1;

      // 3. Motor Seviyesi (Alt Dallar)
      if (!fleets[fleetName].models[modelKey].engines[engineKey]) {
        fleets[fleetName].models[modelKey].engines[engineKey] = {
          engineType: engineKey,
          items: [],
          totalCost: 0,
          totalDifference: 0,
          chronicCount: 0,
          topReason: "",
          topReasonPercentage: 0,
          reasons: [],
        };
      }
      fleets[fleetName].models[modelKey].engines[engineKey].items.push(c);
      fleets[fleetName].models[modelKey].engines[engineKey].totalCost += cost;
      fleets[fleetName].models[modelKey].engines[engineKey].totalDifference += diff;
      if (isChronic) fleets[fleetName].models[modelKey].engines[engineKey].chronicCount += 1;
    }

    // Top arızaları hesapla
    for (const f of Object.values(fleets)) {
      const fleetReasons: Record<string, number> = {};
      for (const item of f.items) {
        const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
        fleetReasons[r] = (fleetReasons[r] || 0) + 1;
      }
      f.topReason = Object.entries(fleetReasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "Genel Arıza";

      for (const m of Object.values(f.models)) {
        const modelReasons: Record<string, number> = {};
        for (const item of m.items) {
          const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
          modelReasons[r] = (modelReasons[r] || 0) + 1;
        }
        const sortedM = Object.entries(modelReasons).sort((a, b) => b[1] - a[1]);
        m.topReason = sortedM[0]?.[0] || "Genel Arıza";
        m.topReasonPercentage = m.items.length > 0 ? Math.round(((sortedM[0]?.[1] || 0) / m.items.length) * 100) : 0;

        for (const e of Object.values(m.engines)) {
          const engReasons: Record<string, number> = {};
          for (const item of e.items) {
            const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
            engReasons[r] = (engReasons[r] || 0) + 1;
          }
          const sortedE = Object.entries(engReasons).sort((a, b) => b[1] - a[1]);
          e.topReason = sortedE[0]?.[0] || "Genel Arıza";
          e.topReasonPercentage = e.items.length > 0 ? Math.round(((sortedE[0]?.[1] || 0) / e.items.length) * 100) : 0;
          e.reasons = sortedE.map(([reason, count]) => ({ reason, count }));
        }
      }
    }

    return Object.values(fleets).sort((a, b) => b.items.length - a.items.length);
  }, [complaints]);

  // 2. Motor Kırılımı (Engine Aggregation)
  const engineData = useMemo(() => {
    const data: Record<
      string,
      {
        engineType: string;
        count: number;
        totalCost: number;
        totalDifference: number;
        chronicCount: number;
        brands: Set<string>;
        items: ComplaintItem[];
        topReason: string;
        topReasonCount: number;
        topReasonPercentage: number;
      }
    > = {};

    for (const c of complaints) {
      const eng = normalizeEngineType(c.engineType || "Genel Motor");
      const normBrand = normalizeBrand(c.brand);
      if (!data[eng]) {
        data[eng] = {
          engineType: eng,
          count: 0,
          totalCost: 0,
          totalDifference: 0,
          chronicCount: 0,
          brands: new Set(),
          items: [],
          topReason: "",
          topReasonCount: 0,
          topReasonPercentage: 0,
        };
      }
      data[eng].count += 1;
      data[eng].totalCost += c.financials?.invoicedCost || 0;
      data[eng].totalDifference += c.financials?.difference || 0;
      if (c.chronicRiskScore >= 70) data[eng].chronicCount += 1;
      data[eng].brands.add(normBrand);
      data[eng].items.push(c);
    }

    for (const e of Object.values(data)) {
      const reasons: Record<string, number> = {};
      for (const item of e.items) {
        const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
        reasons[r] = (reasons[r] || 0) + 1;
      }
      const sorted = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        e.topReason = sorted[0][0];
        e.topReasonCount = sorted[0][1];
        e.topReasonPercentage = Math.round((sorted[0][1] / e.count) * 100);
      }
    }

    return Object.values(data).sort((a, b) => b.count - a.count);
  }, [complaints]);

  // 3. Marka & Model Kırılımı (Model Aggregation)
  const modelData = useMemo(() => {
    const data: Record<
      string,
      {
        key: string;
        brand: string;
        model: string;
        count: number;
        totalCost: number;
        totalDifference: number;
        avgKm: number;
        items: ComplaintItem[];
        topReason: string;
        topReasonCount: number;
        topReasonPercentage: number;
        topCategory: string;
      }
    > = {};

    for (const c of complaints) {
      const normBrand = normalizeBrand(c.brand);
      const normModel = normalizeModel(c.model, normBrand);
      const key = `${normBrand} ${normModel}`;
      if (!data[key]) {
        data[key] = {
          key,
          brand: normBrand,
          model: normModel,
          count: 0,
          totalCost: 0,
          totalDifference: 0,
          avgKm: 0,
          items: [],
          topReason: "",
          topReasonCount: 0,
          topReasonPercentage: 0,
          topCategory: normalizeMainHeader(c.mainHeader || c.faultCategory, c.complaintSubject),
        };
      }
      data[key].count += 1;
      data[key].totalCost += c.financials?.invoicedCost || 0;
      data[key].totalDifference += c.financials?.difference || 0;
      data[key].avgKm += c.km;
      data[key].items.push(c);
    }

    for (const m of Object.values(data)) {
      const reasons: Record<string, number> = {};
      for (const item of m.items) {
        const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
        reasons[r] = (reasons[r] || 0) + 1;
      }
      const sorted = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        m.topReason = sorted[0][0];
        m.topReasonCount = sorted[0][1];
        m.topReasonPercentage = Math.round((sorted[0][1] / m.count) * 100);
      }
    }

    return Object.values(data).sort((a, b) => b.count - a.count);
  }, [complaints]);

  // 4. Filo Kırılımı (Fleet Aggregation)
  const fleetData = useMemo(() => {
    const data: Record<
      string,
      {
        fleetName: string;
        count: number;
        totalCost: number;
        totalDifference: number;
        chronicCount: number;
        models: Set<string>;
        items: ComplaintItem[];
        topReason: string;
        topReasonPercentage: number;
      }
    > = {};

    for (const c of complaints) {
      const fleet = normalizeFleetCompany(c.reportedByCompany || c.fleetCompany || "Özmal / Kurumsal Filo");
      const normBrand = normalizeBrand(c.brand);
      const normModel = normalizeModel(c.model, normBrand);
      const modelKey = `${normBrand} ${normModel}`;
      if (!data[fleet]) {
        data[fleet] = {
          fleetName: fleet,
          count: 0,
          totalCost: 0,
          totalDifference: 0,
          chronicCount: 0,
          models: new Set(),
          items: [],
          topReason: "",
          topReasonPercentage: 0,
        };
      }
      data[fleet].count += 1;
      data[fleet].totalCost += c.financials?.invoicedCost || 0;
      data[fleet].totalDifference += c.financials?.difference || 0;
      if (c.chronicRiskScore >= 70) data[fleet].chronicCount += 1;
      data[fleet].models.add(modelKey);
      data[fleet].items.push(c);
    }

    for (const f of Object.values(data)) {
      const reasons: Record<string, number> = {};
      for (const item of f.items) {
        const r = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Genel Arıza");
        reasons[r] = (reasons[r] || 0) + 1;
      }
      const sorted = Object.entries(reasons).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        f.topReason = sorted[0][0];
        f.topReasonPercentage = Math.round((sorted[0][1] / f.count) * 100);
      }
    }

    return Object.values(data).sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Unique fleets and models for interactive target selectors
  const uniqueFleets = useMemo(() => {
    return Array.from(
      new Set(complaints.map((c) => normalizeFleetCompany(c.reportedByCompany || c.fleetCompany || "Özmal / Kurumsal Filo")))
    ).sort();
  }, [complaints]);

  const uniqueModels = useMemo(() => {
    return Array.from(
      new Set(
        complaints.map((c) => {
          const b = normalizeBrand(c.brand);
          const m = normalizeModel(c.model, b);
          return `${b} ${m}`;
        })
      )
    ).sort();
  }, [complaints]);

  // Selected breakdown for dynamic "Öngörülen Risk" card
  const [riskTarget, setRiskTarget] = useState<RiskTarget>({
    type: "all",
    name: "Tüm Filolar ve Modeller",
  });

  // Dynamically compute the Major Fault Category & Predicted Risk
  const riskInsight = useMemo(() => {
    return calculateMajorFaultRisk(riskTarget, complaints);
  }, [riskTarget, complaints]);

  // Handle selection for on-demand top failure breakdown
  const handleSelectEngine = (engineType: string, items: ComplaintItem[]) => {
    const insight = computeInsight("engine", engineType, "Motor Ailesi Arıza ve Sorun Analizi", items);
    setSelectedInsight(insight);
    setRiskTarget({ type: "engine", name: engineType, engineType });
  };

  const handleSelectModel = (brand: string, model: string, items: ComplaintItem[]) => {
    const insight = computeInsight("model", `${brand} ${model}`, `${brand} Marka Araç Modeli Arıza Analizi`, items);
    setSelectedInsight(insight);
    setRiskTarget({ type: "vehicle", name: `${brand} ${model}`, brand, model });
  };

  const handleSelectFleet = (fleetName: string, items: ComplaintItem[]) => {
    const insight = computeInsight("fleet", fleetName, "Filo / Kiralama Şirketi Arıza Dağılımı", items);
    setSelectedInsight(insight);
    setRiskTarget({ type: "fleet", name: fleetName });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Üst Bilgilendirme Bannerı */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wide border border-indigo-200 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Hiyerarşik Filo Ağacı & Çapraz Matris</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Gövdeden Dallara Arıza Tespiti</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Filo, Motor Tipi ve Araç Modeli Çapraz Matrisi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1 leading-relaxed">
            Filoları tek bir gövdeden sayısız dallara (Araç → Motor → En Çok Yaşanan Arızalar) ayrılan ağaç yapısında inceleyin; seçtiğiniz araç veya motorda <strong>en fazla ne sorun yaşandığını</strong> anında teşhis edin.
          </p>
        </div>

        {/* Alt Sekme Seçici */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shrink-0 flex-wrap gap-1">
          <button
            onClick={() => setSubTab("tree")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "tree"
                ? "bg-white text-indigo-700 shadow-2xs border border-indigo-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>🌳 Filo Ağacı ({treeData.length})</span>
          </button>
          <button
            onClick={() => setSubTab("engine")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "engine"
                ? "bg-white text-indigo-700 shadow-2xs border border-indigo-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>⚡ Motor Aileleri</span>
          </button>
          <button
            onClick={() => setSubTab("model")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "model"
                ? "bg-white text-indigo-700 shadow-2xs border border-indigo-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>🚗 Model Kırılımları</span>
          </button>
          <button
            onClick={() => setSubTab("fleet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "fleet"
                ? "bg-white text-indigo-700 shadow-2xs border border-indigo-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>🏢 Filo Tablosu</span>
          </button>
        </div>
      </div>

      {/* SEÇİLEN ARAÇ / MOTOR / FİLO İÇİN "EN FAZLA NE SORUN OLMUŞ" ANALİZ PANOSU (DIAGNOSTIC CARD) */}
      {selectedInsight && (
        <div className="rounded-xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 p-5 sm:p-6 shadow-md animate-fadeIn relative">
          <button
            onClick={() => setSelectedInsight(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer border border-slate-200"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Başlık ve Teşhis Özeti */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-indigo-600 text-white tracking-wider">
                  {selectedInsight.type === "engine"
                    ? "Motor Analizi"
                    : selectedInsight.type === "model"
                    ? "Araç Modeli Analizi"
                    : "Filo Analizi"}
                </span>
                <span className="text-xs text-indigo-900 font-medium">
                  {selectedInsight.subTitle}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <span>{selectedInsight.name}</span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {selectedInsight.totalCount} Toplam Şikayet Dosyası
                </span>
              </h3>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedInsight.type === "engine") {
                    onApplyFilter("engineType", selectedInsight.name);
                  } else if (selectedInsight.type === "model") {
                    const parts = selectedInsight.name.split(" ");
                    onApplyFilter("model", parts.slice(1).join(" ") || selectedInsight.name);
                  } else {
                    onApplyFilter("fleetCompany", selectedInsight.name);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Bu {selectedInsight.type === "engine" ? "Motora" : selectedInsight.type === "model" ? "Modele" : "Filoya"} Ait Dosyaları Aç</span>
              </button>
            </div>
          </div>

          {/* Vurgulu "EN FAZLA YAŞANAN SORUN" Kartı */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Birincil En Çok Yaşanan Sorun */}
            <div className="md:col-span-2 bg-white rounded-xl border border-rose-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>En Fazla Görülen 1. Arıza / Şikayet Sebebi</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    %{selectedInsight.topReasons[0]?.percentage || 0} Oran ({selectedInsight.topReasons[0]?.count || 0} Dosya)
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 mt-2">
                  {selectedInsight.topReasons[0]?.reason || "Veri bulunamadı"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Bu araç/motor grubunda en yoğun bildirilen arıza kök nedeni yukarıdaki sorundur.
                </p>
              </div>

              {/* Diğer Baskın Sorunların İlerleme Çubukları */}
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Tüm Şikayet Sebeplerinin Dağılımı:
                </span>
                {selectedInsight.topReasons.slice(0, 4).map((r, idx) => (
                  <div key={r.reason + idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 truncate pr-2 font-semibold">
                        {idx + 1}. {r.reason}
                      </span>
                      <span className="text-slate-600 font-bold shrink-0">
                        {r.count} Dosya (%{r.percentage})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-rose-500"
                            : idx === 1
                            ? "bg-amber-500"
                            : "bg-indigo-500"
                        }`}
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Mali ve Teknik Metrikler */}
            <div className="space-y-3">
              {/* Toplam Fatura & Geri Ödenen */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mali Bilanço & İadeler
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600">Toplam Fatura:</span>
                  <span className="text-sm font-black text-slate-900">
                    ₺{selectedInsight.totalCost.toLocaleString("tr-TR")}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-emerald-700 font-bold">Geri Alınan Tutar:</span>
                  <span className="text-sm font-black text-emerald-600">
                    +₺{selectedInsight.totalDifference.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* Ortalama KM & Kronik Risk */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Kullanım & Risk Durumu
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-slate-600">Ortalama KM:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedInsight.avgKm.toLocaleString("tr-TR")} KM
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-rose-700 font-bold">Kronik Arıza Vakası:</span>
                  <span className="text-sm font-black text-rose-600">
                    {selectedInsight.chronicCount} Dosya (%{Math.round((selectedInsight.chronicCount / selectedInsight.totalCount) * 100)})
                  </span>
                </div>
              </div>

              {/* Hatalı Teşhis / Kurtarılan */}
              <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-950">
                    {selectedInsight.misdiagnosedCount} Hatalı Teşhis Tespit Edildi
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Gereksiz parça değişimi önlenerek bütçe kurtarıldı.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. GÖRÜNÜM: HİYERARŞİK FİLO AĞACI (GÖVDE -> DALLAR -> ALT DALLAR -> ARIZALAR) */}
      {subTab === "tree" && (
        <div className="space-y-4">
          {/* Ağaç Üst Kontrolleri */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span>Filo Ağacı Hiyerarşisi:</span>
              </span>
              <span className="text-xs text-slate-500">
                (Gövde: <strong>Filo</strong> → Ana Dal: <strong>Araç Modeli</strong> → Alt Dal: <strong>Motor Tipi</strong> → Yaprak: <strong>En Çok Yaşanan Arızalar</strong>)
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={expandAllNodes}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                Tüm Dalları Aç
              </button>
              <button
                onClick={collapseAllNodes}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                Tümünü Kapat
              </button>
            </div>
          </div>

          {/* Ağaç Gövdeleri (Filolar) */}
          <div className="space-y-3">
            {treeData.map((fleet: FleetNode, fIdx: number) => {
              const fleetNodeId = `fleet_${fleet.fleetName}`;
              const isFleetExpanded = expandedNodes[fleetNodeId] ?? false;

              return (
                <div
                  key={fleet.fleetName + fIdx}
                  className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
                >
                  {/* FİLO GÖVDESİ (TRUNK) */}
                  <div
                    onClick={() => toggleNode(fleetNodeId)}
                    className="p-4 bg-slate-50/80 hover:bg-indigo-50/50 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-3 select-none border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                            <span>{fleet.fleetName}</span>
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                            {fleet.items.length} Araç / Dosya
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          En Baskın Sorun: <strong className="text-slate-800 font-semibold">{fleet.topReason}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Toplam Fatura
                        </span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ₺{fleet.totalCost.toLocaleString("tr-TR")}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">
                          Geri Alınan
                        </span>
                        <span className="text-xs font-bold text-emerald-600 font-mono">
                          +₺{fleet.totalDifference.toLocaleString("tr-TR")}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFleet(fleet.fleetName, fleet.items);
                        }}
                        className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                      >
                        En Çok Sorunları İncele
                      </button>

                      <div className="w-6 h-6 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                        {isFleetExpanded ? (
                          <ChevronDown className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FİLO DALLARI: ARAÇ MODELLERİ (LEVEL 1 BRANCHES) */}
                  {isFleetExpanded && (
                    <div className="p-3 sm:p-4 bg-slate-50/40 space-y-2.5 border-l-4 border-indigo-500 ml-4 sm:ml-6 my-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        🌿 {fleet.fleetName} Şirketindeki Araç Modelleri ({Object.keys(fleet.models).length} Model):
                      </span>

                      {Object.values(fleet.models).map((modelNode: ModelNode, mIdx: number) => {
                        const modelNodeId = `model_${fleet.fleetName}_${modelNode.modelKey}`;
                        const isModelExpanded = expandedNodes[modelNodeId] ?? false;

                        return (
                          <div
                            key={modelNode.modelKey + mIdx}
                            className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs"
                          >
                            {/* MODEL DALI BAŞLIĞI */}
                            <div
                              onClick={() => toggleNode(modelNodeId)}
                              className="p-3 hover:bg-indigo-50/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                  <Car className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {modelNode.modelKey}
                                    </h5>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      {modelNode.items.length} Dosya
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                                    En Sık Sorun: <strong>{modelNode.topReason}</strong> (%{modelNode.topReasonPercentage})
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectModel(modelNode.brand, modelNode.model, modelNode.items);
                                  }}
                                  className="px-2 py-1 rounded text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition cursor-pointer"
                                >
                                  Bu Araçta Ne Sorun Olmuş?
                                </button>
                                <div className="w-5 h-5 rounded flex items-center justify-center text-slate-400">
                                  {isModelExpanded ? <ChevronDown className="w-3.5 h-3.5 text-indigo-600" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </div>

                            {/* MODELİN ALT DALLARI: MOTOR TİPLERİ VE ARIZA YAPRAKLARI (LEVEL 2 & 3) */}
                            {isModelExpanded && (
                              <div className="p-3 bg-slate-50/70 border-t border-slate-100 space-y-2 border-l-2 border-blue-400 ml-4 sm:ml-6 my-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                  ⚡ {modelNode.modelKey} Motor Tipleri ve Yaşanan Sorunlar:
                                </span>

                                {Object.values(modelNode.engines).map((engNode: EngineNode, eIdx: number) => {
                                  return (
                                    <div
                                      key={engNode.engineType + eIdx}
                                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-2"
                                    >
                                      {/* Motor Başlığı ve Hızlı Aksiyon */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <Fuel className="w-4 h-4 text-amber-500 shrink-0" />
                                          <h6 className="font-bold text-slate-900 text-xs">
                                            {engNode.engineType}
                                          </h6>
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            {engNode.items.length} Kayıt
                                          </span>
                                        </div>

                                        <button
                                          onClick={() => handleSelectEngine(engNode.engineType, engNode.items)}
                                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer self-start sm:self-auto"
                                        >
                                          Bu Motorda En Çok Ne Sorun Olmuş?
                                        </button>
                                      </div>

                                      {/* YAPRAKLAR: Bu Motor ve Araçta En Fazla Yaşanan Arızaların Listesi */}
                                      <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200/80 space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                                          🍃 Bu Motorda Tespit Edilen Arıza Sebepleri:
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                          {engNode.reasons.slice(0, 3).map((r, rIdx) => (
                                            <div
                                              key={r.reason + rIdx}
                                              className="bg-white p-2 rounded border border-slate-200 text-xs flex items-center justify-between gap-1 shadow-2xs"
                                            >
                                              <span className="font-semibold text-slate-800 truncate" title={r.reason}>
                                                {rIdx + 1}. {r.reason}
                                              </span>
                                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] shrink-0">
                                                {r.count} Dosya
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. GÖRÜNÜM: MOTOR AİLELERİ VE EN FAZLA NE SORUN YAŞANDIĞI TABLOSU */}
      {subTab === "engine" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-500" />
                <span>Motor Aileleri & En Fazla Karşılaşılan Arıza Tespiti</span>
              </h3>
              <p className="text-xs text-slate-500">
                Her motor tipi için en fazla hangi sorunun yaşandığı otomatik ayrıştırılmıştır.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {engineData.length} Farklı Motor Tipi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pt-2">Motor Tipi & Ünite</th>
                  <th className="pb-3 pt-2 text-center">Toplam Dosya</th>
                  <th className="pb-3 pt-2">En Fazla Ne Sorun Olmuş? (1. Kök Neden)</th>
                  <th className="pb-3 pt-2 text-right">Toplam Maliyet</th>
                  <th className="pb-3 pt-2 text-right">Geri Alınan Tutar</th>
                  <th className="pb-3 pt-2 text-center">Risk Oranı</th>
                  <th className="pb-3 pt-2 text-right">Detaylı Teşhis</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {engineData.map((data) => (
                  <tr key={data.engineType} className="hover:bg-slate-50 transition">
                    {/* Motor Tipi */}
                    <td className="py-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span>{data.engineType}</span>
                        <span className="text-slate-400 text-[11px] font-normal block">
                          {Array.from(data.brands).join(", ")}
                        </span>
                      </div>
                    </td>

                    {/* Dosya Sayısı */}
                    <td className="py-4 text-center font-bold text-slate-800 text-sm">
                      {data.count} Dosya
                    </td>

                    {/* EN FAZLA NE SORUN OLMUŞ? */}
                    <td className="py-4 max-w-xs">
                      <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-2">
                        <span className="font-bold text-rose-900 text-xs block truncate" title={data.topReason}>
                          {data.topReason || "Genel Arıza"}
                        </span>
                        <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                          %{data.topReasonPercentage} Oran ({data.topReasonCount} vaka)
                        </span>
                      </div>
                    </td>

                    {/* Fatura */}
                    <td className="py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₺{data.totalCost.toLocaleString("tr-TR")}
                    </td>

                    {/* Geri Alınan */}
                    <td className="py-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      +₺{data.totalDifference.toLocaleString("tr-TR")}
                    </td>

                    {/* Risk Oranı */}
                    <td className="py-4 text-center">
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800">
                        %{Math.round((data.chronicCount / data.count) * 100)} Risk
                      </span>
                    </td>

                    {/* Aksiyon */}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleSelectEngine(data.engineType, data.items)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition border border-indigo-200"
                      >
                        En Çok Sorunları Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. GÖRÜNÜM: ARAÇ MODELİ KIRILIMI VE EN ÇOK NE SORUN YAŞANDIĞI */}
      {subTab === "model" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>Araç Modelleri & En Çok Yaşanan Sorun Analizi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Seçilen her araç modelinde hangi parçanın veya konunun en fazla arıza verdiği listelenmektedir.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {modelData.length} Farklı Araç Modeli
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pt-2">Marka & Model</th>
                  <th className="pb-3 pt-2 text-center">Kayıt Sayısı</th>
                  <th className="pb-3 pt-2">Bu Araçta En Çok Ne Sorun Olmuş?</th>
                  <th className="pb-3 pt-2 text-center">Ortalama Kilometre</th>
                  <th className="pb-3 pt-2 text-right">Toplam Fatura</th>
                  <th className="pb-3 pt-2 text-right">Geri Alınan Tutar</th>
                  <th className="pb-3 pt-2 text-right">İncele</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {modelData.map((data) => (
                  <tr key={data.key} className="hover:bg-slate-50 transition">
                    {/* Marka Model */}
                    <td className="py-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{data.key}</span>
                    </td>

                    {/* Dosya */}
                    <td className="py-4 text-center font-bold text-slate-800 text-sm">
                      {data.count} Kayıt
                    </td>

                    {/* EN ÇOK NE SORUN OLMUŞ? */}
                    <td className="py-4 max-w-xs">
                      <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-2">
                        <span className="font-bold text-rose-900 text-xs block truncate" title={data.topReason}>
                          {data.topReason || "Genel Arıza"}
                        </span>
                        <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
                          %{data.topReasonPercentage} Oran ({data.topReasonCount} vaka)
                        </span>
                      </div>
                    </td>

                    {/* KM */}
                    <td className="py-4 text-center text-slate-700 text-xs font-semibold">
                      {Math.round(data.avgKm / data.count).toLocaleString("tr-TR")} KM
                    </td>

                    {/* Fatura */}
                    <td className="py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₺{data.totalCost.toLocaleString("tr-TR")}
                    </td>

                    {/* Geri Alınan */}
                    <td className="py-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      +₺{data.totalDifference.toLocaleString("tr-TR")}
                    </td>

                    {/* İşlem */}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleSelectModel(data.brand, data.model, data.items)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition border border-indigo-200"
                      >
                        Sorunları Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GÖRÜNÜM: FİLO ŞİRKETLERİ KARŞILAŞTIRMA TABLOSU */}
      {subTab === "fleet" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Filo Şirketleri & Karşılaştırmalı Bilanço</span>
              </h3>
              <p className="text-xs text-slate-500">
                Her kiralama ve filo şirketi için toplam maliyet, geri alınan iadeler ve en çok arızalanan modeller.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {fleetData.length} Bildiren Filo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pt-2">Filo / Kiralama Şirketi</th>
                  <th className="pb-3 pt-2 text-center">Toplam Şikayet</th>
                  <th className="pb-3 pt-2">Filodaki En Baskın Sorun</th>
                  <th className="pb-3 pt-2 text-right">Toplam Servis Maliyeti</th>
                  <th className="pb-3 pt-2 text-right">Geri Alınan Tutar</th>
                  <th className="pb-3 pt-2 text-center">Kronik Arıza Sayısı</th>
                  <th className="pb-3 pt-2 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {fleetData.map((data) => (
                  <tr key={data.fleetName} className="hover:bg-slate-50 transition">
                    {/* Filo */}
                    <td className="py-4 font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{data.fleetName}</span>
                    </td>

                    {/* Şikayet Sayısı */}
                    <td className="py-4 text-center font-bold text-slate-800 text-sm">
                      {data.count} Araç
                    </td>

                    {/* En Baskın Sorun */}
                    <td className="py-4 max-w-xs">
                      <span className="font-semibold text-slate-800 text-xs block truncate" title={data.topReason}>
                        {data.topReason}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                        Modeller: {Array.from(data.models).slice(0, 3).join(", ")}
                      </span>
                    </td>

                    {/* Toplam Maliyet */}
                    <td className="py-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₺{data.totalCost.toLocaleString("tr-TR")}
                    </td>

                    {/* Geri Alınan */}
                    <td className="py-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      +₺{data.totalDifference.toLocaleString("tr-TR")}
                    </td>

                    {/* Kronik Sayısı */}
                    <td className="py-4 text-center">
                      <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-700">
                        {data.chronicCount} Kritik Dosya
                      </span>
                    </td>

                    {/* İşlem */}
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleSelectFleet(data.fleetName, data.items)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition border border-indigo-200"
                      >
                        Filoyu Teşhis Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ÖNGÖRÜLEN RİSK & EN SIK GÖRÜLEN HATA TÜRÜ (MAJOR FAULT CATEGORY) DİNAMİK KARTI (MATRİSİN HEMEN ALTINDA) */}
      {riskInsight && (
        <div
          id="matrix-predicted-risk-card"
          className="rounded-xl border-2 border-indigo-500/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl space-y-4 animate-fadeIn"
        >
          {/* Kart Üst Başlık & Dinamik Seçim Şeridi */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-slate-950" />
                  <span>Öngörülen Risk & Arıza Analizi</span>
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  {riskInsight.targetSubTitle}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>{riskInsight.targetName}</span>
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-900/80 text-indigo-200 border border-indigo-700">
                  {riskInsight.totalRecords} Kayıt Analiz Edildi
                </span>
              </div>
            </div>

            {/* Hızlı Kırılım / Hedef Seçici (Filo veya Araç Seç) */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 font-bold px-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-400" />
                  <span>Kırılım Seç:</span>
                </span>

                {/* Filo Seçici Dropdown */}
                <select
                  value={riskTarget.type === "fleet" ? riskTarget.name : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      setRiskTarget({ type: "fleet", name: val });
                    }
                  }}
                  className="bg-slate-900 text-indigo-200 text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">🏢 Filo Seçin...</option>
                  {uniqueFleets.map((fleet) => (
                    <option key={fleet} value={fleet}>
                      {fleet}
                    </option>
                  ))}
                </select>

                {/* Araç Modeli Seçici Dropdown */}
                <select
                  value={riskTarget.type === "vehicle" ? riskTarget.name : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const parts = val.split(" ");
                      setRiskTarget({
                        type: "vehicle",
                        name: val,
                        brand: parts[0],
                        model: parts.slice(1).join(" "),
                      });
                    }
                  }}
                  className="bg-slate-900 text-indigo-200 text-xs font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">🚗 Araç Modeli Seçin...</option>
                  {uniqueModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Tümü / Sıfırla Butonu */}
                {riskTarget.type !== "all" && (
                  <button
                    onClick={() => setRiskTarget({ type: "all", name: "Tüm Filolar ve Modeller" })}
                    className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold transition cursor-pointer"
                    title="Tüm portföye dön"
                  >
                    Tümü
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3 Sütunlu Kompakt ve Bilgi Yoğun Gösterge Izgarası */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. SÜTUN: MAJOR FAULT CATEGORY (EN SIK GÖRÜLEN HATA TÜRÜ) */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>En Sık Görülen Hata Türü</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-200 border border-indigo-700">
                    Major Category
                  </span>
                </div>

                <h4 className="text-base font-black text-white mt-1.5 leading-snug">
                  {riskInsight.majorFaultCategory}
                </h4>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Kategori Hakimiyeti:</span>
                    <span className="text-amber-400 font-bold">
                      %{riskInsight.majorCategoryPercentage} ({riskInsight.majorCategoryCount} dosya)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${riskInsight.majorCategoryPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-700/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Baskın Kök Neden:
                </span>
                <p className="text-xs font-bold text-rose-300 leading-tight truncate" title={riskInsight.topDefectReason}>
                  {riskInsight.topDefectReason}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Bu kırılımda %{riskInsight.topDefectPercentage} oranında ({riskInsight.topDefectCount} vaka) raporlandı.
                </span>
              </div>
            </div>

            {/* 2. SÜTUN: ÖNGÖRÜLEN RİSK & KM AŞINMA PENCERESİ */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-rose-400" />
                    <span>Öngörülen Risk Düzeyi</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      riskInsight.riskLevel === "Kritik"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                        : riskInsight.riskLevel === "Yüksek"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                    }`}
                  >
                    {riskInsight.riskLevel} Risk
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white font-mono">
                    %{riskInsight.projectedRiskScore}
                  </span>
                  <span className="text-xs text-slate-300 font-medium leading-tight">
                    Kronik Arıza ve Tekrar Riski İndeksi
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Kritik KM Penceresi:</span>
                    <strong className="text-amber-300">{riskInsight.kmSweetSpot}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Ortalama KM:</span>
                    <strong className="text-white">{riskInsight.avgKm.toLocaleString("tr-TR")} KM</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Yüksek Riskli Vaka:</span>
                    <strong className="text-rose-300">{riskInsight.chronicCount} Dosya</strong>
                  </div>
                </div>
              </div>

              {riskInsight.misdiagnosedCount > 0 && (
                <div className="bg-emerald-950/50 border border-emerald-700/60 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hatalı Teşhis Uyarısı:</span>
                  </span>
                  <span className="text-emerald-200 font-bold">{riskInsight.misdiagnosedCount} Dosya</span>
                </div>
              )}
            </div>

            {/* 3. SÜTUN: MALİ TAHMİN & ÖNLEYİCİ AKSİYON TAVSİYESİ */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Önleyici Teşhis Tavsiyesi</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    Mali & Teknik Önlem
                  </span>
                </div>

                <div className="mt-2 bg-indigo-950/70 border border-indigo-700/70 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    ⚡ {riskInsight.actionTag}:
                  </span>
                  <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                    {riskInsight.preventiveAction}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-slate-900/90 rounded-lg px-3 py-2 border border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Ort. Dosya Faturası</span>
                    <span className="text-xs font-bold font-mono text-white">
                      ₺{riskInsight.avgInvoicedCost.toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block font-medium">Kurtarılan / İade Farkı</span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      +₺{riskInsight.totalDifference.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (riskInsight.targetType === "fleet") {
                      onApplyFilter("fleetCompany", riskInsight.targetName);
                    } else if (riskInsight.targetType === "vehicle") {
                      const parts = riskInsight.targetName.split(" ");
                      onApplyFilter("model", parts.slice(1).join(" ") || riskInsight.targetName);
                    } else if (riskInsight.targetType === "engine") {
                      onApplyFilter("engineType", riskInsight.targetName);
                    } else {
                      onApplyFilter("faultCategory", riskInsight.majorFaultCategory);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Bu Kırılımın Dosyalarını Filtrele ({riskInsight.totalRecords})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
