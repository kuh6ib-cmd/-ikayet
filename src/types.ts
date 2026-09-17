export type FuelType = "Dizel" | "Benzin" | "Hibrit" | "Elektrik" | "LPG";

export type TransmissionType = "Otomatik" | "Manuel";

export type FaultCategory =
  | "Motor Hasarı & Yağ Kaçağı"
  | "Şanzıman & Debriyaj (DSG/EDC/EAT)"
  | "Turbo & Emme Sistemi"
  | "AdBlue, DPF & Egzoz Emisyon"
  | "Elektrik, Elektronik & Beyin (ECU)"
  | "Fren & Süspansiyon / Yürür Aksam"
  | "Soğutma Sistemi & Termostat"
  | "Triger & Kayış Grubu"
  | "Klima & Havalandırma";

export type RootCauseType =
  | "Kronik Üretici Arızası"
  | "Hatalı Montaj / İşçilik Kusuru"
  | "Hatalı Arıza Tespiti & Yanlış Parça Değişimi"
  | "Kullanıcı / Filo Sürüş Hatası"
  | "Periyodik Bakım İhmali"
  | "Normal Aşınma / Yıpranma";

export type SeverityLevel = "Kritik" | "Yüksek" | "Orta" | "Düşük";

export type ComplaintStatus =
  | "İncelendi & Onaylandı"
  | "Mali İtiraz Açıldı"
  | "Ekspertiz / İncelemede"
  | "Reddedildi"
  | "Servise Rücu Edildi";

export interface ComplaintFinancials {
  operationCost: number;       // Gerçekleşen işlem maliyeti (TL)
  invoicedCost: number;        // Servise fatura edilen / istenen tutar (TL)
  difference: number;          // Fatura sapması / fark (TL)
  disputedAmount: number;      // İtiraz konusu / askıdaki tutar (TL)
  coverageType: "Garanti Kapsamı" | "Filo Bakım Sözleşmesi" | "Müşteri Payı" | "İtirazlı / Askıda";
}

export interface ComplaintItem {
  id: string;
  recordNumber: string;         // Örn. "SRV-2024-8912"
  date: string;                 // "2024-03-15"
  brand: string;                // "Peugeot", "Renault", "Volkswagen", "Fiat", "Ford", "BMW", "Mercedes-Benz", "Toyota", "Hyundai", "Citroen", "Opel", vb.
  model: string;                // Markaya ait gerçek model ("3008", "Megane IV", "Passat", "Egea Cross", vb.)
  modelYear: number;            // 2020 - 2024
  engineType: string;           // "1.5 BlueHDi", "1.3 TCe", "1.6 TDI", "1.0 TSI", "1.4 Fire", "1.5 EcoBlue", vb.
  fuelType: FuelType;
  transmission: TransmissionType;
  km: number;                   // 14500, 68200, 112000 vb.
  kmRange: "0 - 30.000 KM" | "30.000 - 60.000 KM" | "60.000 - 100.000 KM" | "100.000+ KM";
  plate: string;                // "34 BSF 912"
  chassisNo: string;            // "VF3MCYHZRMS..."
  
  // Bildiren Firma / Filo (Excel "Bildiren Firma" sütunu)
  fleetCompany: string;         // "Hedef Filo", "LeasePlan / Ayvens", "Garanti Filo", "Borlease", "Intercity", "DRD Filo", "Sixt Filo", "Arval", "Otokoç", "Garenta", "Avis", vb.
  reportedByCompany?: string;   // Excel'deki "Bildiren Firma" alanı ile tam eşleşme
  
  // Şikayetçi Olunan Servis
  serviceName: string;          // "Maslak Yetkili Servis - İst.", "Kartal Özel Servis - İst.", "Çankaya Otomotiv - Ank.", vb.
  complainedService?: string;   // Şikayetçi olunan yetkili/özel servis
  serviceCity: string;          // "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"
  
  // K ve L Sütunu Şikayet Sebepleri & Konu Ayrıştırması
  mainHeader?: string;          // K Sütunu: "Ana Başlık" (örn. "Motor Sistemi", "Şanzıman / Kavrama", "Emisyon & Egzoz")
  subTopic?: string;            // L Sütunu: "Konu" (örn. "Külbütör Yağ Kaçağı", "Kavrama Isınması ve Vuruntu", "AdBlue Pompa Hatası")
  complaintReason?: string;     // Şikayet Sebebi (K & L sütunlarından birleştirilmiş/kategorize edilmiş arıza sebebi)
  complaintSubject: string;     // Serbest metin başlık
  rawComplaintText: string;     // Serbest metin detay
  technicianNotes: string;      // Teknisyen serbest notu
  faultCategory: FaultCategory; // Standartlaştırılmış Ana Kategori
  rootCauseType: RootCauseType;
  financials: ComplaintFinancials;
  severity: SeverityLevel;
  chronicRiskScore: number;     // 1 - 100
  status: ComplaintStatus;
  isMisdiagnosisFlagged?: boolean;
  isWorkmanshipFaultFlagged?: boolean;
}

export interface FilterState {
  searchQuery: string;
  brand: string;
  model: string;
  modelYear: string;
  engineType: string;
  fleetCompany: string;         // Bildiren Firma / Filo
  mainHeader?: string;          // K Sütunu: Ana Başlık
  subTopic?: string;            // L Sütunu: Konu
  complaintReason: string;      // Şikayet Sebebi
  serviceName: string;          // Şikayetçi Olunan Servis
  serviceCity: string;
  faultCategory: string;
  rootCauseType: string;
  kmRange: string;
  severity: string;
  status: string;
  startDate: string;            // "YYYY-MM-DD"
  endDate: string;              // "YYYY-MM-DD"
  datePreset: string;           // "all" | "30d" | "90d" | "180d" | "2024" | "2025"
  onlyChronicRisks: boolean;
  onlyFinancialDisputes: boolean;
}

export interface ChronicInsight {
  key: string;
  brand: string;
  model: string;
  engineType: string;
  faultCategory: FaultCategory;
  faultName: string;
  count: number;
  avgKm: number;
  totalCost: number;
  totalDifference: number;
  riskScore: number;
  rootCause: string;
  kmSweetSpot: string;
  affectedFleets: string[];
}

export interface ExecutiveReportData {
  title: string;
  executiveSummary: string;
  chronicDefects: Array<{
    brandModel: string;
    fault: string;
    kmBand: string;
    frequency: string;
    financialImpact: string;
    recommendation: string;
  }>;
  financialLeakageAnalysis: {
    totalLeakageEstimated: string;
    primaryLeakageSource: string;
    topOverpricedServices: string[];
    auditRecommendations: string[];
  };
  fleetRiskMatrix: Array<{
    fleet: string;
    riskLevel: string;
    reason: string;
  }>;
  immediateActionPlan: string[];
}
