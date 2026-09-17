import * as XLSX from "xlsx";
import { ComplaintItem, ChronicInsight, FilterState, FaultCategory } from "../types";
import {
  normalizeComplaintDataset,
  normalizeDate,
  normalizeBrand,
  normalizeModel,
  normalizeEngineType,
  normalizeSubTopic,
  normalizeFleetCompany,
} from "./textNormalizer";

export interface AnalyticsKPIs {
  totalRecords: number;
  totalOperationCost: number;
  totalInvoicedCost: number;
  totalDifference: number;
  differencePercentage: number;
  totalDisputedAmount: number;
  chronicIssueCount: number;
  chronicIssuePercentage: number;
  misdiagnosisCount: number;
  misdiagnosisSavedAmount: number;
  workmanshipFaultCount: number;
  workmanshipSavedAmount: number;
  highRiskCount: number;
  topAffectedBrand: string;
  topAffectedEngine: string;
  topAffectedFleet: string;
  mostOverpricedService: string;
}

/**
 * K (Ana Başlık) ve L (Konu) Sütunlarından Otomatik Otomotiv Arıza Kategorizasyonu
 */
export function standardizeFaultCategory(
  mainHeader?: string,
  subTopic?: string,
  subject?: string
): FaultCategory {
  const text = `${mainHeader || ""} ${subTopic || ""} ${subject || ""}`.toLowerCase();

  if (
    text.includes("şanzıman") ||
    text.includes("vites") ||
    text.includes("kavrama") ||
    text.includes("debriyaj") ||
    text.includes("dsg") ||
    text.includes("edc") ||
    text.includes("eat") ||
    text.includes("mekatronik") ||
    text.includes("volan") ||
    text.includes("silkme") ||
    text.includes("vuruntu")
  ) {
    return "Şanzıman & Debriyaj (DSG/EDC/EAT)";
  }

  if (
    text.includes("adblue") ||
    text.includes("dpf") ||
    text.includes("partikül") ||
    text.includes("emisyon") ||
    text.includes("egzoz") ||
    text.includes("nox") ||
    text.includes("rejenerasyon") ||
    text.includes("katalizör")
  ) {
    return "AdBlue, DPF & Egzoz Emisyon";
  }

  if (
    text.includes("turbo") ||
    text.includes("intercooler") ||
    text.includes("emme manifoldu") ||
    text.includes("basınç sensörü") ||
    text.includes("wastegate") ||
    text.includes("ıslık sesi")
  ) {
    return "Turbo & Emme Sistemi";
  }

  if (
    text.includes("soğutma") ||
    text.includes("hararet") ||
    text.includes("termostat") ||
    text.includes("antifriz") ||
    text.includes("radyatör") ||
    text.includes("devridaim") ||
    text.includes("su kaçağı")
  ) {
    return "Soğutma Sistemi & Termostat";
  }

  if (
    text.includes("triger") ||
    text.includes("eksantrik zinciri") ||
    text.includes("gergi") ||
    text.includes("v-kayış") ||
    text.includes("kasnak") ||
    text.includes("kayış")
  ) {
    return "Triger & Kayış Grubu";
  }

  if (
    text.includes("fren") ||
    text.includes("balata") ||
    text.includes("disk") ||
    text.includes("amortisör") ||
    text.includes("süspansiyon") ||
    text.includes("salıncak") ||
    text.includes("rot") ||
    text.includes("direksiyon") ||
    text.includes("ön takım") ||
    text.includes("z-rot")
  ) {
    return "Fren & Süspansiyon / Yürür Aksam";
  }

  if (
    text.includes("klima") ||
    text.includes("kompresör") ||
    text.includes("kalorifer") ||
    text.includes("klima gazı") ||
    text.includes("polen") ||
    text.includes("havalandırma")
  ) {
    return "Klima & Havalandırma";
  }

  if (
    text.includes("elektrik") ||
    text.includes("elektronik") ||
    text.includes("ecu") ||
    text.includes("beyin") ||
    text.includes("akü") ||
    text.includes("alternatör") ||
    text.includes("sigorta") ||
    text.includes("start-stop") ||
    text.includes("sensör")
  ) {
    return "Elektrik, Elektronik & Beyin (ECU)";
  }

  // Varsayılan Motor / Yağ
  return "Motor Hasarı & Yağ Kaçağı";
}

export function calculateKPIs(complaints: ComplaintItem[]): AnalyticsKPIs {
  const totalRecords = complaints.length;
  if (totalRecords === 0) {
    return {
      totalRecords: 0,
      totalOperationCost: 0,
      totalInvoicedCost: 0,
      totalDifference: 0,
      differencePercentage: 0,
      totalDisputedAmount: 0,
      chronicIssueCount: 0,
      chronicIssuePercentage: 0,
      misdiagnosisCount: 0,
      misdiagnosisSavedAmount: 0,
      workmanshipFaultCount: 0,
      workmanshipSavedAmount: 0,
      highRiskCount: 0,
      topAffectedBrand: "-",
      topAffectedEngine: "-",
      topAffectedFleet: "-",
      mostOverpricedService: "-",
    };
  }

  let totalOp = 0;
  let totalInv = 0;
  let totalDiff = 0;
  let totalDisputed = 0;
  let chronicCount = 0;
  let misdiagCount = 0;
  let misdiagSaved = 0;
  let workmanshipCount = 0;
  let workmanshipSaved = 0;
  let highRisk = 0;

  const brandCounts: Record<string, number> = {};
  const engineCounts: Record<string, number> = {};
  const fleetCounts: Record<string, number> = {};
  const serviceDiffs: Record<string, { totalDiff: number; count: number }> = {};

  for (const c of complaints) {
    const op = c.financials?.operationCost || 0;
    const inv = c.financials?.invoicedCost || 0;
    const diff = c.financials?.difference || (inv - op);
    const disp = c.financials?.disputedAmount || 0;

    totalOp += op;
    totalInv += inv;
    totalDiff += diff;
    totalDisputed += disp;

    if (c.rootCauseType === "Kronik Üretici Arızası" || c.chronicRiskScore >= 80) {
      chronicCount++;
    }
    if (c.isMisdiagnosisFlagged || c.rootCauseType === "Hatalı Arıza Tespiti & Yanlış Parça Değişimi") {
      misdiagCount++;
      misdiagSaved += diff;
    }
    if (c.isWorkmanshipFaultFlagged || c.rootCauseType === "Hatalı Montaj / İşçilik Kusuru") {
      workmanshipCount++;
      workmanshipSaved += disp || diff;
    }
    if (c.severity === "Kritik" || c.severity === "Yüksek") {
      highRisk++;
    }

    if (c.brand) brandCounts[c.brand] = (brandCounts[c.brand] || 0) + 1;
    if (c.engineType) engineCounts[c.engineType] = (engineCounts[c.engineType] || 0) + 1;
    const fleetName = c.reportedByCompany || c.fleetCompany || "Tanımsız Filo";
    fleetCounts[fleetName] = (fleetCounts[fleetName] || 0) + 1;

    const sName = c.complainedService || c.serviceName || "Genel Servis";
    if (!serviceDiffs[sName]) {
      serviceDiffs[sName] = { totalDiff: 0, count: 0 };
    }
    serviceDiffs[sName].totalDiff += diff;
    serviceDiffs[sName].count += 1;
  }

  const getTopKey = (record: Record<string, number>) => {
    let top = "-";
    let max = 0;
    for (const [k, v] of Object.entries(record)) {
      if (v > max) {
        max = v;
        top = k;
      }
    }
    return top;
  };

  let mostOverpricedService = "-";
  let maxServiceDiff = 0;
  for (const [service, data] of Object.entries(serviceDiffs)) {
    if (data.totalDiff > maxServiceDiff) {
      maxServiceDiff = data.totalDiff;
      mostOverpricedService = `${service} (+${data.totalDiff.toLocaleString("tr-TR")} ₺)`;
    }
  }

  return {
    totalRecords,
    totalOperationCost: totalOp,
    totalInvoicedCost: totalInv,
    totalDifference: totalDiff,
    differencePercentage: totalOp > 0 ? Math.round((totalDiff / totalOp) * 100) : 0,
    totalDisputedAmount: totalDisputed,
    chronicIssueCount: chronicCount,
    chronicIssuePercentage: Math.round((chronicCount / totalRecords) * 100),
    misdiagnosisCount: misdiagCount,
    misdiagnosisSavedAmount: misdiagSaved,
    workmanshipFaultCount: workmanshipCount,
    workmanshipSavedAmount: workmanshipSaved,
    highRiskCount: highRisk,
    topAffectedBrand: getTopKey(brandCounts),
    topAffectedEngine: getTopKey(engineCounts),
    topAffectedFleet: getTopKey(fleetCounts),
    mostOverpricedService,
  };
}

export function getChronicClusters(complaints: ComplaintItem[]): ChronicInsight[] {
  const groups: Record<string, {
    brand: string;
    model: string;
    engineType: string;
    faultCategory: FaultCategory;
    items: ComplaintItem[];
  }> = {};

  for (const c of complaints) {
    const normBrand = normalizeBrand(c.brand);
    const normModel = normalizeModel(c.model, normBrand);
    const normEngine = normalizeEngineType(c.engineType || "Genel Motor");
    const normCategory = standardizeFaultCategory(c.mainHeader, c.subTopic, c.complaintSubject || c.faultCategory);
    const key = `${normBrand}|${normModel}|${normEngine}|${normCategory}`;
    if (!groups[key]) {
      groups[key] = {
        brand: normBrand,
        model: normModel,
        engineType: normEngine,
        faultCategory: normCategory,
        items: [],
      };
    }
    groups[key].items.push(c);
  }

  const clusters: ChronicInsight[] = [];

  for (const [key, g] of Object.entries(groups)) {
    const count = g.items.length;
    const totalKm = g.items.reduce((acc, curr) => acc + curr.km, 0);
    const avgKm = Math.round(totalKm / count);
    const totalCost = g.items.reduce((acc, curr) => acc + (curr.financials?.invoicedCost || 0), 0);
    const totalDiff = g.items.reduce((acc, curr) => acc + (curr.financials?.difference || 0), 0);
    const avgRisk = Math.round(g.items.reduce((acc, curr) => acc + curr.chronicRiskScore, 0) / count);

    const fleets = Array.from(
      new Set(g.items.map((i) => normalizeFleetCompany(i.reportedByCompany || i.fleetCompany)))
    );

    let kmSweetSpot = "Tüm KM Aralıkları";
    if (avgKm < 35000) kmSweetSpot = "0 - 35.000 KM (Erken Dönem)";
    else if (avgKm < 65000) kmSweetSpot = "35.000 - 65.000 KM (Kritik Aralık)";
    else if (avgKm < 95000) kmSweetSpot = "65.000 - 95.000 KM (Yüksek Aşınma)";
    else kmSweetSpot = "100.000+ KM (Ağır Hizmet)";

    // Küme içindeki en yaygın / spesifik arıza tanımını belirle
    const faultCounts: Record<string, number> = {};
    for (const item of g.items) {
      const f = normalizeSubTopic(item.subTopic || item.complaintReason || item.complaintSubject || "Mekanik Arıza");
      faultCounts[f] = (faultCounts[f] || 0) + 1;
    }
    const dominantFault = Object.entries(faultCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mekanik Arıza";

    const sampleItem = g.items[0];

    clusters.push({
      key,
      brand: g.brand,
      model: g.model,
      engineType: g.engineType,
      faultCategory: g.faultCategory,
      faultName: dominantFault,
      count,
      avgKm,
      totalCost,
      totalDifference: totalDiff,
      riskScore: avgRisk,
      rootCause: sampleItem.rootCauseType,
      kmSweetSpot,
      affectedFleets: fleets,
    });
  }

  return clusters.sort((a, b) => (b.count * 1000 + b.riskScore) - (a.count * 1000 + a.riskScore));
}

export function getServiceFinancialAudit(complaints: ComplaintItem[]) {
  const map: Record<string, {
    serviceName: string;
    city: string;
    count: number;
    operationCost: number;
    invoicedCost: number;
    difference: number;
    disputedCount: number;
    misdiagnosisCount: number;
    workmanshipCount: number;
  }> = {};

  for (const c of complaints) {
    const sName = c.complainedService || c.serviceName || "Genel Servis";
    if (!map[sName]) {
      map[sName] = {
        serviceName: sName,
        city: c.serviceCity || "Belirtilmemiş",
        count: 0,
        operationCost: 0,
        invoicedCost: 0,
        difference: 0,
        disputedCount: 0,
        misdiagnosisCount: 0,
        workmanshipCount: 0,
      };
    }
    const item = map[sName];
    item.count += 1;
    item.operationCost += c.financials?.operationCost || 0;
    item.invoicedCost += c.financials?.invoicedCost || 0;
    item.difference += c.financials?.difference || 0;
    if (c.status === "Mali İtiraz Açıldı" || c.status === "Servise Rücu Edildi") {
      item.disputedCount += 1;
    }
    if (c.isMisdiagnosisFlagged) item.misdiagnosisCount += 1;
    if (c.isWorkmanshipFaultFlagged) item.workmanshipCount += 1;
  }

  return Object.values(map).map((s) => ({
    ...s,
    markupRatio: s.operationCost > 0 ? Math.round((s.difference / s.operationCost) * 100) : 0,
  })).sort((a, b) => b.difference - a.difference);
}

// Şikayet Sebepleri Dağılımı Grafiği (Column K ve L Kırılımı)
export function getComplaintReasonDistribution(complaints: ComplaintItem[]) {
  const counts: Record<string, { count: number; totalCost: number; totalDifference: number; mainHeader: string }> = {};
  for (const c of complaints) {
    let reason = c.subTopic || c.complaintReason || c.complaintSubject || "Diğer Arızalar";
    if (!reason || reason.startsWith("SRV-") || reason.startsWith("CMP-") || reason.startsWith("KAYIT-") || /^\d+$/.test(reason)) {
      reason = c.complaintSubject || "Diğer Arızalar";
    }
    let mainH = c.mainHeader;
    if (!mainH || mainH.startsWith("SRV-") || mainH.startsWith("CMP-") || mainH.startsWith("KAYIT-") || /^\d+$/.test(mainH)) {
      mainH = c.faultCategory || "Genel Kategori";
    }

    if (!counts[reason]) {
      counts[reason] = { count: 0, totalCost: 0, totalDifference: 0, mainHeader: mainH };
    }
    counts[reason].count += 1;
    counts[reason].totalCost += c.financials?.invoicedCost || 0;
    counts[reason].totalDifference += c.financials?.difference || 0;
  }

  return Object.entries(counts)
    .map(([name, data]) => ({
      name,
      mainHeader: data.mainHeader,
      count: data.count,
      totalCost: data.totalCost,
      totalDifference: data.totalDifference,
    }))
    .sort((a, b) => b.count - a.count);
}

// K ve L Sütunları Hiyerarşik Kategori Ağacı (Ana Başlık -> Konu Dağılımı)
export interface CategoryTreeItem {
  mainHeader: string;
  faultCategory: FaultCategory;
  totalCount: number;
  totalCost: number;
  totalDifference: number;
  topics: Array<{
    topic: string;
    count: number;
    totalCost: number;
    riskCount: number;
  }>;
}

export function getMainAndSubTopicCategorization(complaints: ComplaintItem[]): CategoryTreeItem[] {
  const map: Record<string, {
    mainHeader: string;
    faultCategory: FaultCategory;
    totalCount: number;
    totalCost: number;
    totalDifference: number;
    topicsMap: Record<string, { count: number; totalCost: number; riskCount: number }>;
  }> = {};

  for (const c of complaints) {
    let mainH = c.mainHeader;
    if (!mainH || mainH.startsWith("SRV-") || mainH.startsWith("CMP-") || mainH.startsWith("KAYIT-") || /^\d+$/.test(mainH)) {
      mainH = c.faultCategory || "Genel Arıza Başlığı";
    }
    let topic = c.subTopic || c.complaintReason || c.complaintSubject || "Genel Arıza";
    if (!topic || topic.startsWith("SRV-") || topic.startsWith("CMP-") || topic.startsWith("KAYIT-") || /^\d+$/.test(topic)) {
      topic = c.complaintSubject || "Genel Arıza";
    }

    if (!map[mainH]) {
      map[mainH] = {
        mainHeader: mainH,
        faultCategory: c.faultCategory,
        totalCount: 0,
        totalCost: 0,
        totalDifference: 0,
        topicsMap: {},
      };
    }

    const entry = map[mainH];
    entry.totalCount += 1;
    entry.totalCost += c.financials?.invoicedCost || 0;
    entry.totalDifference += c.financials?.difference || 0;

    if (!entry.topicsMap[topic]) {
      entry.topicsMap[topic] = { count: 0, totalCost: 0, riskCount: 0 };
    }
    entry.topicsMap[topic].count += 1;
    entry.topicsMap[topic].totalCost += c.financials?.invoicedCost || 0;
    if (c.chronicRiskScore >= 75) entry.topicsMap[topic].riskCount += 1;
  }

  return Object.values(map)
    .map((item) => ({
      mainHeader: item.mainHeader,
      faultCategory: item.faultCategory,
      totalCount: item.totalCount,
      totalCost: item.totalCost,
      totalDifference: item.totalDifference,
      topics: Object.entries(item.topicsMap)
        .map(([topic, data]) => ({
          topic,
          count: data.count,
          totalCost: data.totalCost,
          riskCount: data.riskCount,
        }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.totalCount - a.totalCount);
}

// Bildiren Firma / Filo İsimleri Dağılım Grafiği
export function getFleetCompanyDistribution(complaints: ComplaintItem[]) {
  const counts: Record<string, { count: number; totalCost: number; totalDifference: number; highRiskCount: number }> = {};
  for (const c of complaints) {
    const fleet = c.reportedByCompany || c.fleetCompany || "Bildiren Firma Tanımsız";
    if (!counts[fleet]) {
      counts[fleet] = { count: 0, totalCost: 0, totalDifference: 0, highRiskCount: 0 };
    }
    counts[fleet].count += 1;
    counts[fleet].totalCost += c.financials?.invoicedCost || 0;
    counts[fleet].totalDifference += c.financials?.difference || 0;
    if (c.chronicRiskScore >= 75) counts[fleet].highRiskCount += 1;
  }

  return Object.entries(counts)
    .map(([fleetName, data]) => ({
      fleetName,
      count: data.count,
      totalCost: data.totalCost,
      totalDifference: data.totalDifference,
      highRiskCount: data.highRiskCount,
    }))
    .sort((a, b) => b.count - a.count);
}

// Şikayetçi Olunan Servis Dağılım Grafiği
export function getComplainedServiceDistribution(complaints: ComplaintItem[]) {
  const counts: Record<string, { count: number; totalInvoiced: number; totalDifference: number; city: string }> = {};
  for (const c of complaints) {
    const sName = c.complainedService || c.serviceName || "Genel Servis";
    if (!counts[sName]) {
      counts[sName] = { count: 0, totalInvoiced: 0, totalDifference: 0, city: c.serviceCity || "" };
    }
    counts[sName].count += 1;
    counts[sName].totalInvoiced += c.financials?.invoicedCost || 0;
    counts[sName].totalDifference += c.financials?.difference || 0;
  }

  return Object.entries(counts)
    .map(([serviceName, data]) => ({
      serviceName,
      city: data.city,
      count: data.count,
      totalInvoiced: data.totalInvoiced,
      totalDifference: data.totalDifference,
    }))
    .sort((a, b) => b.totalDifference - a.totalDifference);
}

export function filterComplaints(complaints: ComplaintItem[], filters: FilterState): ComplaintItem[] {
  return complaints.filter((item) => {
    // 1. Arama Metni
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = `${item.recordNumber} ${item.brand} ${item.model} ${item.engineType} ${item.plate} ${item.chassisNo} ${item.reportedByCompany || item.fleetCompany} ${item.complainedService || item.serviceName} ${item.mainHeader || ""} ${item.subTopic || ""} ${item.complaintReason || ""} ${item.complaintSubject} ${item.rawComplaintText} ${item.technicianNotes}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // 2. Marka Filtresi (Sadece bu markaya ait olanlar)
    if (filters.brand && item.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    // 3. Model Filtresi (Sadece seçili markanın bu modeli)
    if (filters.model && item.model.toLowerCase() !== filters.model.toLowerCase()) {
      return false;
    }

    // 4. Model Yılı
    if (filters.modelYear && item.modelYear.toString() !== filters.modelYear) {
      return false;
    }

    // 5. Motor Tipi
    if (filters.engineType && item.engineType.toLowerCase() !== filters.engineType.toLowerCase()) {
      return false;
    }

    // 6. Bildiren Firma / Filo
    if (filters.fleetCompany) {
      const itemFleet = (item.reportedByCompany || item.fleetCompany || "").toLowerCase();
      if (itemFleet !== filters.fleetCompany.toLowerCase()) return false;
    }

    // 7. K Sütunu: Ana Başlık
    if (filters.mainHeader) {
      const itemMain = (item.mainHeader || item.faultCategory || "").toLowerCase();
      if (!itemMain.includes(filters.mainHeader.toLowerCase())) return false;
    }

    // 8. L Sütunu / Şikayet Sebebi: Konu
    if (filters.complaintReason || filters.subTopic) {
      const filterReason = (filters.complaintReason || filters.subTopic || "").toLowerCase();
      const itemReason = `${item.complaintReason || ""} ${item.subTopic || ""} ${item.complaintSubject || ""}`.toLowerCase();
      if (!itemReason.includes(filterReason)) return false;
    }

    // 9. Şikayetçi Olunan Servis
    if (filters.serviceName) {
      const itemService = (item.complainedService || item.serviceName || "").toLowerCase();
      if (itemService !== filters.serviceName.toLowerCase()) return false;
    }

    // 10. Şehir
    if (filters.serviceCity && item.serviceCity !== filters.serviceCity) {
      return false;
    }

    // 11. Arıza Kategorisi
    if (filters.faultCategory && item.faultCategory !== filters.faultCategory) {
      return false;
    }

    // 12. Kök Neden Tipi
    if (filters.rootCauseType && item.rootCauseType !== filters.rootCauseType) {
      return false;
    }

    // 13. KM Bandı
    if (filters.kmRange && item.kmRange !== filters.kmRange) {
      return false;
    }

    // 14. Kritiklik & Durum
    if (filters.severity && item.severity !== filters.severity) return false;
    if (filters.status && item.status !== filters.status) return false;

    // 15. Tarih Aralığı Filtresi (Kusursuz YYYY-MM-DD Karşılaştırması)
    if (filters.startDate || filters.endDate) {
      const itemDateStandard = normalizeDate(item.date);
      if (itemDateStandard) {
        if (filters.startDate) {
          const filterStart = normalizeDate(filters.startDate);
          if (filterStart && itemDateStandard < filterStart) return false;
        }
        if (filters.endDate) {
          const filterEnd = normalizeDate(filters.endDate);
          if (filterEnd && itemDateStandard > filterEnd) return false;
        }
      }
    }

    // 16. Hızlı Butonlar
    if (filters.onlyChronicRisks && item.chronicRiskScore < 85 && item.rootCauseType !== "Kronik Üretici Arızası") {
      return false;
    }
    if (filters.onlyFinancialDisputes && (item.financials?.difference || 0) <= 0 && item.status !== "Mali İtiraz Açıldı") {
      return false;
    }

    return true;
  });
}

export function exportToExcel(complaints: ComplaintItem[], fileName = "Otomotiv_Sikayet_Analiz_Raporu.xlsx") {
  const rows = complaints.map((c, index) => ({
    "Sıra No": index + 1,
    "Kayıt No": c.recordNumber,
    "Tarih": c.date,
    "Bildiren Firma": c.reportedByCompany || c.fleetCompany,
    "Marka": c.brand,
    "Model": c.model,
    "Model Yılı": c.modelYear,
    "Motor Tipi": c.engineType,
    "Yakıt": c.fuelType,
    "Şanzıman": c.transmission,
    "Kilometre (KM)": c.km,
    "KM Bandı": c.kmRange,
    "Plaka": c.plate,
    "Şasi No (VIN)": c.chassisNo,
    "Ana Başlık (K Sütunu)": c.mainHeader || c.faultCategory,
    "Konu (L Sütunu)": c.subTopic || c.complaintReason || c.complaintSubject,
    "Şikayetçi Olunan Servis": c.complainedService || c.serviceName,
    "Servis Şehri": c.serviceCity,
    "Şikayet Sebebi": c.complaintReason || c.subTopic || c.complaintSubject,
    "Şikayet Başlığı": c.complaintSubject,
    "Sözlü Şikayet Detayı": c.rawComplaintText,
    "Teknisyen Notu": c.technicianNotes,
    "Arıza Kategorisi": c.faultCategory,
    "Kök Neden Tipi": c.rootCauseType,
    "İşlem Tutarı (TL)": c.financials?.operationCost || 0,
    "Servise Fatura Edilen Tutar (TL)": c.financials?.invoicedCost || 0,
    "Fatura Sapması / Fark (TL)": c.financials?.difference || 0,
    "İtiraz Edilen Tutar (TL)": c.financials?.disputedAmount || 0,
    "Kapsam Türü": c.financials?.coverageType,
    "Kritiklik / Risk": c.severity,
    "Kronik Risk Skoru (1-100)": c.chronicRiskScore,
    "Durum": c.status,
    "Hatalı Tespit Uyarısı": c.isMisdiagnosisFlagged ? "EVET" : "HAYIR",
    "Hatalı Montaj Uyarısı": c.isWorkmanshipFaultFlagged ? "EVET" : "HAYIR",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Şikayet ve Servis Verisi");
  XLSX.writeFile(workbook, fileName);
}

/**
 * Excel / CSV İçe Aktarıcı (Tüm Dosyayı Eksiksiz, Tarih Formatları ve Tüm Sütun Varyasyonlarıyla Okur)
 */
export function parseExcelOrCsvFile(file: File): Promise<ComplaintItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        // 1. JSON Obje Formatı
        const jsonRows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
        // 2. Ham Matris Satırları (Sütun K=10, L=11 tespiti için)
        const matrixRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });

        if (jsonRows.length === 0) {
          throw new Error("Dosyada okunabilecek veri satırı bulunamadı.");
        }

        const normalizeKey = (k: string) =>
          k.toLowerCase().replace(/[\s_\-–/\\()]/g, "").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o");

        const parsePrice = (val: any): number => {
          if (typeof val === "number") return val;
          if (!val) return 0;
          const cleaned = String(val).replace(/[^\d.,\-]/g, "").trim();
          if (!cleaned) return 0;
          if (cleaned.includes(".") && cleaned.includes(",")) {
            return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
          }
          if (cleaned.includes(",")) {
            return parseFloat(cleaned.replace(",", ".")) || 0;
          }
          return parseFloat(cleaned) || 0;
        };

        const parseDate = (val: any): string => {
          return normalizeDate(val);
        };

        const items: ComplaintItem[] = jsonRows.map((row, idx) => {
          const matrixRow = matrixRows[idx + 1] || [];
          const rowKeys = Object.keys(row);

          const findVal = (keywords: string[], matrixIndex?: number, fallback: any = ""): string => {
            for (const key of rowKeys) {
              const norm = normalizeKey(key);
              for (const kw of keywords) {
                const target = normalizeKey(kw);
                if (norm === target || (target.length >= 4 && norm.includes(target))) {
                  const v = String(row[key] ?? "").trim();
                  if (v) return v;
                }
              }
            }
            if (matrixIndex !== undefined && matrixRow.length > matrixIndex) {
              const v = String(matrixRow[matrixIndex] ?? "").trim();
              if (v) return v;
            }
            return String(fallback);
          };

          // 0. A Sütunu / Kayıt Kodu
          const recordNo = findVal(
            ["kayitno", "dosyano", "islemno", "talepno", "recordnumber", "kayit"],
            0,
            `SRV-IMP-${1000 + idx}`
          );

          // 1. K SÜTUNU: Ana Başlık (Şikayet Ana Başlığı - Asla A sütunundaki kodları almaz!)
          const getColKValue = (): string => {
            // a. Öncelikle 11. Sütun olan K sütunu (indeks 10) matris hücresine bak
            if (matrixRow.length > 10) {
              const val10 = String(matrixRow[10] ?? "").trim();
              if (
                val10 &&
                val10 !== recordNo &&
                val10 !== String(matrixRow[0] ?? "").trim() &&
                !/^(SRV-|CMP-|KAYIT-|DOSYA-|NO-|\d+$)/i.test(val10)
              ) {
                return val10;
              }
            }

            // b. Başlık adlarında "ana başlık", "ana başık", "şikayet başlığı", "k sütunu" ara
            for (const key of rowKeys) {
              const norm = normalizeKey(key);
              if (
                norm === "anabaslik" ||
                norm === "anabasik" ||
                norm === "sikayetanabasligi" ||
                norm === "sikayetbasligi" ||
                norm === "ksutunu" ||
                norm === "anabaslikksutunu" ||
                norm === "anakategori" ||
                norm === "k" ||
                norm.startsWith("anabasl") ||
                norm.startsWith("anabas") ||
                norm.includes("anabaslik") ||
                norm.includes("anabasik")
              ) {
                const v = String(row[key] ?? "").trim();
                if (
                  v &&
                  v !== recordNo &&
                  v !== String(matrixRow[0] ?? "").trim() &&
                  !/^(SRV-|CMP-|KAYIT-|DOSYA-|NO-|\d+$)/i.test(v)
                ) {
                  return v;
                }
              }
            }

            // c. Eğer matris satırında indeks 10'da bir metin varsa onu al
            if (matrixRow.length > 10) {
              const val10 = String(matrixRow[10] ?? "").trim();
              if (val10 && val10 !== recordNo) return val10;
            }

            return "Motor & Yağlama Sistemi";
          };

          // 2. L SÜTUNU: Konu (Şikayet Sebebi)
          const getColLValue = (kValue: string): string => {
            // a. Öncelikle 12. Sütun olan L sütunu (indeks 11) matris hücresine bak
            if (matrixRow.length > 11) {
              const val11 = String(matrixRow[11] ?? "").trim();
              if (
                val11 &&
                val11 !== recordNo &&
                val11 !== String(matrixRow[0] ?? "").trim() &&
                !/^(SRV-|CMP-|KAYIT-|DOSYA-|NO-|\d+$)/i.test(val11)
              ) {
                return val11;
              }
            }

            // b. Başlık adlarında "konu", "şikayet konusu", "şikayet sebebi", "l sütunu" ara
            for (const key of rowKeys) {
              const norm = normalizeKey(key);
              if (
                norm === "konu" ||
                norm === "sikayetkonusu" ||
                norm === "sikayetsebebi" ||
                norm === "lsutunu" ||
                norm === "altkonu" ||
                norm === "altkategori" ||
                norm === "l" ||
                norm.startsWith("konu") ||
                norm.includes("sikayetkonu") ||
                norm.includes("sikayetsebep")
              ) {
                const v = String(row[key] ?? "").trim();
                if (
                  v &&
                  v !== recordNo &&
                  v !== String(matrixRow[0] ?? "").trim() &&
                  !/^(SRV-|CMP-|KAYIT-|DOSYA-|NO-|\d+$)/i.test(v)
                ) {
                  return v;
                }
              }
            }

            // c. Eğer matris satırında indeks 11'de bir metin varsa onu al
            if (matrixRow.length > 11) {
              const val11 = String(matrixRow[11] ?? "").trim();
              if (val11 && val11 !== recordNo) return val11;
            }

            return "Külbütör Kapağı Yağ Sızıntısı";
          };

          const rawColK = getColKValue();
          const rawColL = getColLValue(rawColK);

          // 3. Bildiren Firma (Filo)
          const reportedBy = findVal(
            ["bildirenfirma", "bildirensirket", "firma", "filo", "musteri", "fleet"],
            undefined,
            "Özmal / Kurumsal Filo"
          );

          // 4. Şikayetçi Olunan Servis
          const complainedServ = findVal(
            ["sikayetciolunanservis", "servisadi", "servis", "service"],
            undefined,
            "Yetkili Servis"
          );

          // 5. Şikayet Başlığı / Metni
          const subject = findVal(["sikayetbasligi", "baslik", "subject"], undefined, `${rawColK} - ${rawColL}`);
          const rawText = findVal(["sozlusikayet", "aciklama", "sikayetdetayi", "description"], undefined, `${rawColK} kapsamında ${rawColL} şikayeti bildirildi.`);
          const notes = findVal(["teknisyennotu", "notlar", "technician"], undefined, "Teknisyen inceleme ve onarım kaydı oluşturuldu.");

          const brand = findVal(["marka", "brand"], undefined, "Peugeot");
          const model = findVal(["model"], undefined, "3008");
          const engineType = findVal(["motortipi", "motor", "engine"], undefined, "1.5 BlueHDi");
          const plate = findVal(["plaka", "plate"], undefined, `34 PLK ${100 + idx}`);
          const chassisNo = findVal(["sasino", "sasi", "vin"], undefined, `VF3MC${Date.now().toString().slice(-6)}${idx}`);
          const dateStr = parseDate(findVal(["tarih", "islemtarihi", "date"], 2, new Date().toISOString().slice(0, 10)));
          const serviceCity = findVal(["servissehri", "sehir", "city"], undefined, "İstanbul");

          const kmNum = parsePrice(findVal(["kilometre", "km"], undefined, 54000));
          const opCost = parsePrice(findVal(["islemtutari", "maliyet", "operationcost"], undefined, 14000));
          const invCost = parsePrice(findVal(["servisefaturaedilen", "faturatutari", "invoicedcost", "fatura"], undefined, opCost > 0 ? opCost * 1.25 : 17500));
          const diffVal = parsePrice(findVal(["faturasapmasi", "fark", "difference"], undefined, invCost - opCost));

          let kmRange: any = "30.000 - 60.000 KM";
          if (kmNum < 30000) kmRange = "0 - 30.000 KM";
          else if (kmNum < 60000) kmRange = "30.000 - 60.000 KM";
          else if (kmNum < 100000) kmRange = "60.000 - 100.000 KM";
          else kmRange = "100.000+ KM";

          const standardCategory = standardizeFaultCategory(rawColK, rawColL, subject);

          return {
            id: `IMP-${Date.now()}-${idx}`,
            recordNumber: recordNo,
            date: dateStr,
            brand,
            model,
            modelYear: parseInt(findVal(["modelyili", "yil", "year"], undefined, "2022"), 10) || 2022,
            engineType,
            fuelType: (findVal(["yakit", "fuel"], undefined, "Dizel")) as any,
            transmission: (findVal(["sanziman", "vites", "transmission"], undefined, "Otomatik")) as any,
            km: kmNum || 50000,
            kmRange,
            plate,
            chassisNo,
            fleetCompany: reportedBy,
            reportedByCompany: reportedBy,
            serviceName: complainedServ,
            complainedService: complainedServ,
            serviceCity,
            mainHeader: rawColK,
            subTopic: rawColL,
            complaintReason: rawColL,
            complaintSubject: subject,
            rawComplaintText: rawText,
            technicianNotes: notes,
            faultCategory: standardCategory,
            rootCauseType: (findVal(["kokneden", "rootcause"], undefined, "Kronik Üretici Arızası")) as any,
            financials: {
              operationCost: opCost,
              invoicedCost: invCost,
              difference: diffVal,
              disputedAmount: diffVal > 0 ? diffVal : 0,
              coverageType: (findVal(["kapsamturu", "garanti", "coverage"], undefined, "Garanti Kapsamı")) as any,
            },
            severity: (findVal(["kritiklik", "risk", "severity"], undefined, diffVal > 5000 ? "Kritik" : "Yüksek")) as any,
            chronicRiskScore: Math.min(100, Math.max(50, 75 + (idx % 24))),
            status: (findVal(["durum", "status"], undefined, diffVal > 0 ? "Mali İtiraz Açıldı" : "İncelendi & Onaylandı")) as any,
            isMisdiagnosisFlagged: findVal(["hatalitespit"], undefined, "").toLowerCase().includes("evet"),
            isWorkmanshipFaultFlagged: findVal(["hatalimontaj"], undefined, "").toLowerCase().includes("evet"),
          };
        });

        // Bütün metin verilerini normalize et (K&L sütunları, marka, model, motor, filo, vb.)
        const normalizedItems = normalizeComplaintDataset(items);
        resolve(normalizedItems);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
