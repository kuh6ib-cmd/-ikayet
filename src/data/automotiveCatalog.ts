export interface VehicleModelSpec {
  model: string;
  engineTypes: string[];
}

export interface BrandCatalog {
  brand: string;
  models: VehicleModelSpec[];
}

export const AUTOMOTIVE_CATALOG: BrandCatalog[] = [
  {
    brand: "Peugeot",
    models: [
      { model: "3008", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "1.6 PureTech", "1.6 Hybrid"] },
      { model: "5008", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "1.6 PureTech"] },
      { model: "2008", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "Elektrik EV"] },
      { model: "208", engineTypes: ["1.2 PureTech", "1.5 BlueHDi", "Elektrik EV"] },
      { model: "408", engineTypes: ["1.2 PureTech", "1.6 Hybrid"] },
      { model: "508", engineTypes: ["1.5 BlueHDi", "1.6 PureTech"] },
      { model: "Rifter", engineTypes: ["1.5 BlueHDi"] },
      { model: "Partner", engineTypes: ["1.5 BlueHDi", "1.6 HDi"] },
    ],
  },
  {
    brand: "Renault",
    models: [
      { model: "Megane IV", engineTypes: ["1.3 TCe", "1.5 Blue dCi", "1.5 dCi", "1.6 16V"] },
      { model: "Clio V", engineTypes: ["1.0 TCe", "1.0 SCe", "1.3 TCe", "1.5 Blue dCi"] },
      { model: "Captur", engineTypes: ["1.3 TCe", "1.0 TCe", "1.6 Hybrid"] },
      { model: "Austral", engineTypes: ["1.3 Mild Hybrid", "1.2 Hybrid"] },
      { model: "Kadjar", engineTypes: ["1.3 TCe", "1.5 dCi", "1.6 dCi"] },
      { model: "Talisman", engineTypes: ["1.6 dCi", "1.3 TCe", "2.0 dCi"] },
      { model: "Express", engineTypes: ["1.5 Blue dCi", "1.3 TCe"] },
      { model: "Kangoo", engineTypes: ["1.5 Blue dCi", "1.3 TCe"] },
    ],
  },
  {
    brand: "Volkswagen",
    models: [
      { model: "Passat", engineTypes: ["1.5 TSI", "1.6 TDI", "2.0 TDI", "1.4 TSI"] },
      { model: "Golf", engineTypes: ["1.0 TSI", "1.5 TSI", "1.6 TDI", "2.0 TSI"] },
      { model: "Tiguan", engineTypes: ["1.5 TSI", "2.0 TDI", "1.4 TSI"] },
      { model: "Polo", engineTypes: ["1.0 TSI", "1.0 MPI", "1.6 TDI"] },
      { model: "T-Roc", engineTypes: ["1.5 TSI", "1.0 TSI"] },
      { model: "Taigo", engineTypes: ["1.0 TSI", "1.5 TSI"] },
      { model: "Caddy", engineTypes: ["2.0 TDI", "1.5 TSI"] },
      { model: "Arteon", engineTypes: ["2.0 TDI", "2.0 TSI"] },
    ],
  },
  {
    brand: "Fiat",
    models: [
      { model: "Egea Sedan", engineTypes: ["1.4 Fire", "1.3 MultiJet", "1.6 MultiJet", "1.5 Hybrid"] },
      { model: "Egea Cross", engineTypes: ["1.4 Fire", "1.6 MultiJet", "1.5 Hybrid", "1.0 FireFly"] },
      { model: "Egea Hatchback", engineTypes: ["1.4 Fire", "1.6 MultiJet", "1.3 MultiJet"] },
      { model: "500", engineTypes: ["1.0 Hybrid", "1.2 Fire", "Elektrik EV"] },
      { model: "500X", engineTypes: ["1.3 MultiJet", "1.6 MultiJet", "1.3 FireFly"] },
      { model: "Doblo", engineTypes: ["1.5 BlueHDi", "1.6 MultiJet", "1.3 MultiJet"] },
      { model: "Fiorino", engineTypes: ["1.3 MultiJet", "1.4 Eko LPG"] },
    ],
  },
  {
    brand: "Ford",
    models: [
      { model: "Focus", engineTypes: ["1.5 EcoBlue", "1.0 EcoBoost", "1.5 Ti-VCT"] },
      { model: "Puma", engineTypes: ["1.0 EcoBoost", "1.0 EcoBoost Mild Hybrid"] },
      { model: "Kuga", engineTypes: ["1.5 EcoBoost", "2.0 EcoBlue", "2.5 Hybrid"] },
      { model: "Tourneo Courier", engineTypes: ["1.5 EcoBlue", "1.5 TDCi", "1.0 EcoBoost"] },
      { model: "Transit Custom", engineTypes: ["2.0 EcoBlue"] },
      { model: "Mondeo", engineTypes: ["1.5 TDCi", "2.0 TDCi", "1.5 EcoBoost"] },
    ],
  },
  {
    brand: "Toyota",
    models: [
      { model: "Corolla", engineTypes: ["1.8 Hybrid", "1.5 Dynamic Force", "1.6 Valvematic"] },
      { model: "Corolla Cross", engineTypes: ["1.8 Hybrid", "2.0 Hybrid"] },
      { model: "C-HR", engineTypes: ["1.8 Hybrid", "2.0 Hybrid", "1.2 Turbo"] },
      { model: "Yaris", engineTypes: ["1.5 Hybrid", "1.5 Benzin", "1.0 Benzin"] },
      { model: "RAV4", engineTypes: ["2.5 Hybrid", "2.0 Benzin"] },
      { model: "Proace City", engineTypes: ["1.5 BlueHDi", "1.5 D-4D"] },
    ],
  },
  {
    brand: "Hyundai",
    models: [
      { model: "Tucson", engineTypes: ["1.6 T-GDI", "1.6 CRDi", "1.6 Hybrid"] },
      { model: "i20", engineTypes: ["1.4 MPI", "1.0 T-GDI", "1.2 MPI"] },
      { model: "i10", engineTypes: ["1.0 MPI", "1.2 MPI"] },
      { model: "Bayon", engineTypes: ["1.4 MPI", "1.0 T-GDI"] },
      { model: "Elantra", engineTypes: ["1.6 MPI"] },
      { model: "Kona", engineTypes: ["1.0 T-GDI", "1.6 Hybrid", "Elektrik EV"] },
      { model: "Santa Fe", engineTypes: ["1.6 Hybrid", "2.2 CRDi"] },
    ],
  },
  {
    brand: "Citroën",
    models: [
      { model: "C5 Aircross", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "1.6 PureTech"] },
      { model: "C3", engineTypes: ["1.2 PureTech", "1.5 BlueHDi"] },
      { model: "C3 Aircross", engineTypes: ["1.2 PureTech", "1.5 BlueHDi"] },
      { model: "C4", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "Elektrik EV"] },
      { model: "C4 X", engineTypes: ["1.5 BlueHDi", "1.2 PureTech", "Elektrik EV"] },
      { model: "Berlingo", engineTypes: ["1.5 BlueHDi"] },
    ],
  },
  {
    brand: "Opel",
    models: [
      { model: "Corsa", engineTypes: ["1.2 PureTech", "1.5 BlueHDi", "Elektrik EV"] },
      { model: "Astra", engineTypes: ["1.2 Turbo", "1.5 BlueHDi"] },
      { model: "Mokka", engineTypes: ["1.2 Turbo", "Elektrik EV"] },
      { model: "Grandland", engineTypes: ["1.5 BlueHDi", "1.2 Turbo", "1.6 Hybrid"] },
      { model: "Crossland", engineTypes: ["1.2 Turbo", "1.5 BlueHDi"] },
      { model: "Combo", engineTypes: ["1.5 BlueHDi"] },
    ],
  },
  {
    brand: "BMW",
    models: [
      { model: "3 Serisi", engineTypes: ["320i 1.6 Turbo", "320d 2.0d", "330i"] },
      { model: "5 Serisi", engineTypes: ["520i", "520d", "530i"] },
      { model: "1 Serisi", engineTypes: ["118i", "116d"] },
      { model: "2 Serisi Gran Coupe", engineTypes: ["218i", "216d"] },
      { model: "X1", engineTypes: ["sDrive18i", "sDrive16d", "xDrive20d"] },
      { model: "X3", engineTypes: ["xDrive20d", "xDrive20i"] },
    ],
  },
  {
    brand: "Mercedes-Benz",
    models: [
      { model: "C-Serisi", engineTypes: ["C200 4MATIC", "C200d", "C180"] },
      { model: "E-Serisi", engineTypes: ["E200d", "E220d", "E180"] },
      { model: "A-Serisi", engineTypes: ["A180", "A200", "A180d"] },
      { model: "CLA", engineTypes: ["CLA 180", "CLA 200", "CLA 180d"] },
      { model: "GLA", engineTypes: ["GLA 200", "GLA 200d"] },
      { model: "GLB", engineTypes: ["GLB 200", "GLB 200d"] },
      { model: "GLC", engineTypes: ["GLC 220d 4MATIC", "GLC 300"] },
    ],
  },
  {
    brand: "Audi",
    models: [
      { model: "A3", engineTypes: ["35 TFSI", "30 TDI", "35 TDI"] },
      { model: "A4", engineTypes: ["40 TDI", "45 TFSI"] },
      { model: "A6", engineTypes: ["40 TDI", "45 TFSI"] },
      { model: "Q2", engineTypes: ["35 TFSI"] },
      { model: "Q3", engineTypes: ["35 TFSI", "40 TDI"] },
    ],
  },
  {
    brand: "Skoda",
    models: [
      { model: "Superb", engineTypes: ["1.5 TSI", "2.0 TDI"] },
      { model: "Octavia", engineTypes: ["1.0 TSI", "1.5 TSI", "2.0 TDI"] },
      { model: "Kamiq", engineTypes: ["1.0 TSI", "1.5 TSI"] },
      { model: "Karoq", engineTypes: ["1.5 TSI"] },
      { model: "Kodiaq", engineTypes: ["1.5 TSI", "2.0 TDI"] },
      { model: "Fabia", engineTypes: ["1.0 TSI", "1.0 MPI"] },
    ],
  },
  {
    brand: "Dacia",
    models: [
      { model: "Duster", engineTypes: ["1.3 TCe", "1.5 dCi", "1.0 ECO-G LPG", "1.6 Hybrid"] },
      { model: "Sandero Stepway", engineTypes: ["1.0 TCe", "1.0 ECO-G LPG"] },
      { model: "Jogger", engineTypes: ["1.0 ECO-G LPG", "1.6 Hybrid"] },
      { model: "Spring", engineTypes: ["Elektrik EV"] },
    ],
  },
];

/**
 * Verilen markaya ait olan modelleri getirir.
 * Başka bir markanın modelini ASLA getirmez.
 */
export function getModelsForBrand(brandName: string): string[] {
  if (!brandName) {
    return [];
  }
  const cleanSearch = brandName
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ğ/g, "ğ")
    .replace(/Ü/g, "ü")
    .replace(/Ş/g, "ş")
    .replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç")
    .replace(/ë/g, "e")
    .toLowerCase()
    .trim();

  const brandEntry = AUTOMOTIVE_CATALOG.find((b) => {
    const cleanB = b.brand
      .replace(/İ/g, "i")
      .replace(/I/g, "ı")
      .replace(/Ğ/g, "ğ")
      .replace(/Ü/g, "ü")
      .replace(/Ş/g, "ş")
      .replace(/Ö/g, "ö")
      .replace(/Ç/g, "ç")
      .replace(/ë/g, "e")
      .toLowerCase()
      .trim();
    return cleanB === cleanSearch || cleanB.includes(cleanSearch) || cleanSearch.includes(cleanB);
  });

  if (!brandEntry) return [];
  return brandEntry.models.map((m) => m.model).sort();
}

/**
 * Verilen marka ve modele ait olan motor tiplerini getirir.
 */
export function getEnginesForBrandAndModel(brandName: string, modelName: string): string[] {
  if (!brandName || !modelName) return [];
  const cleanSearchBrand = brandName
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ğ/g, "ğ")
    .replace(/Ü/g, "ü")
    .replace(/Ş/g, "ş")
    .replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç")
    .replace(/ë/g, "e")
    .toLowerCase()
    .trim();

  const brandEntry = AUTOMOTIVE_CATALOG.find((b) => {
    const cleanB = b.brand
      .replace(/İ/g, "i")
      .replace(/I/g, "ı")
      .replace(/Ğ/g, "ğ")
      .replace(/Ü/g, "ü")
      .replace(/Ş/g, "ş")
      .replace(/Ö/g, "ö")
      .replace(/Ç/g, "ç")
      .replace(/ë/g, "e")
      .toLowerCase()
      .trim();
    return cleanB === cleanSearchBrand || cleanB.includes(cleanSearchBrand) || cleanSearchBrand.includes(cleanB);
  });

  if (!brandEntry) return [];

  const cleanSearchModel = modelName.toLowerCase().replace(/[\s_\-]/g, "").trim();
  const modelEntry = brandEntry.models.find((m) => {
    const cleanM = m.model.toLowerCase().replace(/[\s_\-]/g, "").trim();
    return cleanM === cleanSearchModel || cleanM.includes(cleanSearchModel) || cleanSearchModel.includes(cleanM);
  });

  if (!modelEntry) return [];
  return modelEntry.engineTypes;
}

/**
 * Standart Şikayet Sebepleri Listesi
 */
export const COMPLAINT_REASONS = [
  "Külbütör Kapağı Yağ Sızıntısı",
  "Mekatronik Basınç Kaybı & Kavrama Titremesi",
  "Termostat Flanş Çatlağı & Antifriz Eksiltme",
  "DPF Tıkanıklığı & AdBlue Pompa Arızası",
  "Eksantrik Zincir Aşınması & Ses",
  "Fren Balatası Aşınması & Disk Titreşimi",
  "Salıncak Burcu Boşluğu & Ses",
  "Klima Kompresörü Devre Dışı & Gaz Kaçağı",
  "Akü Şarj Hatası & Sensör Arızası",
  "Turbo Basınç Hortumu Yırtığı",
  "Enjektör Geri Dönüş Kaçağı",
  "Direksiyon Sertleşmesi / Açı Sensörü Arızası",
  "Aşırı Motor Yağı Tüketimi (1.4 Fire)",
  "Şanzıman Vites Boşa Düşmesi (DSG/EDC)",
];

/**
 * Tanınan Başlıca Filo ve Bildiren Firmalar (Normalize edilmiş formatta)
 */
export const RECOGNIZED_FLEETS = [
  "Hedef Filo",
  "LeasePlan / Ayvens",
  "Garanti Filo",
  "Borlease Filo",
  "Intercity Filo",
  "DRD Filo Kiralama",
  "Sixt Filo",
  "Arval Filo",
  "Avis & Otokoç Filo",
  "Garenta Filo",
  "Central Rent Filo",
  "Budget Filo",
  "Trendyol Express Filo",
  "Getir Lojistik Filo",
  "Teknosa Saha Filosu",
  "Türk Telekom Saha Filo",
  "Borusan Filo",
  "Özmal / Kurumsal Filo",
];
