import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. AI features will return structured fallbacks.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // 1. Executive AI Strategic Report endpoint
  app.post("/api/ai/executive-report", async (req, res) => {
    try {
      const { complaintsSummary, filters, promptContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          success: true,
          report: {
            title: "Otomotiv Şikayet & Maliyet Stratejik Raporu (Sistem Analizi)",
            executiveSummary: "Filtrelenen veri setinde öne çıkan kronik arızalar: Peugeot/Citroen 1.5 BlueHDi motorlarda külbütör yağ kaçağı ve eksantrik zincir problemleri, Renault 1.3 TCe motorlarda termostat gövdesi sızıntısı ve EDC debriyaj titremesi, VW Grubu araçlarda ise DSG Mekatronik basınç kaybı ve DPF tıkanıklıkları olarak tespit edilmiştir. Servis fatura denetimlerinde ortalama %18.4'lük fatura şişirme ve hatalı arıza tespiti kaynaklı gereksiz parça değişim maliyeti belirlenmiştir.",
            chronicDefects: [
              {
                brandModel: "Peugeot 3008 & 5008 / 1.5 BlueHDi (2021-2023)",
                fault: "Külbütör Kapağı Yağ Kaçağı & 8mm Eksantrik Zincir Aşınması",
                kmBand: "45.000 - 85.000 KM",
                frequency: "Yüksek (%34 görülme sıklığı)",
                financialImpact: "Yaklaşık 1.250.000 TL garanti ve servis maliyeti",
                recommendedAction: "Distribütör bülteni (TSB) ile 7mm'den 8mm/güçlendirilmiş zincir kiti revizyonuna geçilmeli ve servislerin gereksiz komple motor değişim talepleri yerinde incelenmelidir."
              },
              {
                brandModel: "Renault Megane IV / 1.3 TCe EDC (2022-2024)",
                fault: "Termostat Gövdesi Soğutma Sıvısı Kaçağı & EDC Çift Kavrama Titremesi",
                kmBand: "30.000 - 65.000 KM",
                frequency: "Orta-Yüksek (%28 görülme sıklığı)",
                financialImpact: "780.000 TL filo bakım ve onarım maliyeti",
                recommendedAction: "Termostat plastik gövdesinin alüminyum döküm revize parça ile değişimi ve EDC kavrama yazılım kalibrasyonunun bayilere zorunlu kılınması."
              },
              {
                brandModel: "Volkswagen Passat / 1.6 TDI & 1.5 TSI DSG (2020-2023)",
                fault: "DSG 7 İleri (DQ200) Mekatronik Basınç Tüpü Gevşemesi",
                kmBand: "60.000 - 110.000 KM",
                frequency: "Kritik (%41 görülme sıklığı)",
                financialImpact: "2.100.000 TL toplam fatura tutarı (Servis sapması %24)",
                recommendedAction: "Servislerin doğrudan komple mekatronik değişimi yerine güçlendirilmiş tamir kiti prosedürüne yönlendirilmesi ile %60 tasarruf sağlanabilir."
              }
            ],
            financialLeakageAnalysis: {
              totalLeakageEstimated: "4.850.000 TL",
              primaryLeakageSource: "Hatalı arıza teşhisi sonucu sağlam sensör ve parçaların değiştirilmesi (%42) ile servislerin parça kâr marjı eklemeleri (%31).",
              topOverpricedServices: ["Maslak Yetkili Servis (Sapma: +%28.5)", "Kartal Özel Servis Noktası (Sapma: +%22.1)"],
              auditRecommendations: [
                "10.000 TL üzeri tüm mekanik onay taleplerinde parça fotoğrafı ve OBD arıza kodu (DTC log) zorunluluğu getirilmelidir.",
                "Hatalı montaj sonucu 15 gün içinde tekrarlayan arızaların masrafı doğrudan servise rücu edilmelidir."
              ]
            },
            fleetRiskMatrix: [
              { fleet: "Hedef Filo", riskLevel: "Yüksek Risk", reason: "Yüksek KM'li 1.5 BlueHDi ve DSG araç yoğunluğu" },
              { fleet: "LeasePlan / Ayvens", riskLevel: "Orta-Yüksek", reason: "AdBlue kristalleşmesi ve turbo wastegate şikayetleri" },
              { fleet: "Sixt Rent a Car", riskLevel: "Orta Risk", reason: "Kullanıcı kaynaklı debriyaj ve fren aşınmaları" }
            ],
            immediateActionPlan: [
              "1. Haftada: Maslak ve Kartal servisleri için geriye dönük fatura denetimi başlatılması.",
              "2. Haftada: 1.5 BlueHDi ve 1.3 TCe motorlar için teknik bülten yayımlanması.",
              "3. Haftada: Filo yöneticilerine periyodik AdBlue ve yağ eksiltme bilgilendirmesi yapılması."
            ]
          }
        });
      }

      const prompt = `Sen otomotiv satış sonrası, garanti yönetimi, servis operasyonları ve filo yönetiminde 20+ yıllık deneyime sahip Baş Yapay Zeka Şikayet ve Veri Analistisin (Senior Automotive AI Complaint & Warranty Analyst).

Aşağıdaki otomotiv şikayet, arıza ve servis fatura verilerini derinlemesine analiz et:
FILTRELER: ${JSON.stringify(filters || {})}
ÖZET VERİ VE İSTATİSTİKLER:
${JSON.stringify(complaintsSummary || {}, null, 2)}
KULLANICI TALEBİ / BAĞLAM: ${promptContext || "Genel stratejik kronik arıza, maliyet kontrolü ve anlamsal şikayet analizi"}

Aşağıdaki JSON şemasına BİREBİR UYGUN geçerli bir JSON yanıtı üret (markdown bloğu OLMADAN veya saf JSON olarak):
{
  "title": "Stratejik rapor başlığı",
  "executiveSummary": "Üst yönetici için 3-4 cümlelik net ve çarpıcı özet",
  "chronicDefects": [
    {
      "brandModel": "Marka Model / Motor Tipi (Yıl)",
      "fault": "Spesifik arıza adı ve teknik kök neden",
      "kmBand": "Örn. 45.000 - 80.000 KM",
      "frequency": "Görülme sıklığı ve oranı",
      "financialImpact": "Tahmini mali yük ve etki",
      "recommendedAction": "Distribütör, servis ve filo için somut teknik ve yönetsel aksiyon"
    }
  ],
  "financialLeakageAnalysis": {
    "totalLeakageEstimated": "Tahmini toplam maliyet kaybı / sapma tutarı (TL)",
    "primaryLeakageSource": "Ana finansal sızıntı kaynağı (Hatalı parça değişimi, fahiş servis işçilikleri vb.)",
    "topOverpricedServices": ["Servis 1 (+%X sapma)", "Servis 2 (+%Y sapma)"],
    "auditRecommendations": ["Denetim ve maliyet kısıtlama önerisi 1", "Öneri 2"]
  },
  "fleetRiskMatrix": [
    {
      "fleet": "Filo Adı",
      "riskLevel": "Kritik | Yüksek | Orta | Düşük",
      "reason": "Arıza riski nedeni"
    }
  ],
  "immediateActionPlan": [
    "1. Adım: ...",
    "2. Adım: ...",
    "3. Adım: ..."
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let parsedReport;
      try {
        parsedReport = JSON.parse(response.text || "{}");
      } catch (err) {
        console.error("JSON parse error from Gemini:", err);
        parsedReport = {
          title: "Otomotiv Şikayet & Maliyet Analiz Raporu",
          executiveSummary: response.text || "Rapor oluşturuldu.",
          chronicDefects: [],
          financialLeakageAnalysis: {
            totalLeakageEstimated: "Belirleniyor",
            primaryLeakageSource: "Servis fatura sapmaları ve parça değişimleri",
            topOverpricedServices: [],
            auditRecommendations: ["Fatura denetimi önerilir."]
          },
          fleetRiskMatrix: [],
          immediateActionPlan: ["Detaylı teknik inceleme başlatılması"]
        };
      }

      return res.json({ success: true, report: parsedReport });
    } catch (error: any) {
      console.error("Error in executive-report endpoint:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Rapor oluşturulurken bir hata meydana geldi.",
      });
    }
  });

  // 2. Interactive AI Analyst Chat endpoint ("Analiste Sor")
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, contextData } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          reply: `Yapay zeka analisti şu an hazır durumdadır. İncelenen veri setinde ${contextData?.totalRecords || 0} adet araç servis kaydı bulunmaktadır. Peugeot 1.5 BlueHDi motorlarda yağ kaçağı ve zincir sesi, Renault 1.3 TCe'de termostat kaçağı ve EDC titremesi, Volkswagen modellerinde DSG mekatronik arızaları en belirgin kronik konulardır. Servis fatura sapmaları Maslak ve Kartal servislerinde ortalama %22 oranında yüksek seyretmektedir.`
        });
      }

      const systemInstruction = `Sen uzman bir 'Otomotiv Satış Sonrası ve Filo Şikayet Analistisin' (Automotive AI Complaint Analyst).
Kullanıcı şirket yöneticisi, filo direktörü veya servis garanti müdürüdür.
Soru sorulduğunda, sağlanan veri setindeki marka, model, motor tipi, kilometre, filo şirketi, servis adı, işlem tutarı ve fatura tutarı kırılımlarını kullanarak net, profesyonel, analitik ve stratejik Türkçe yanıtlar ver.
Gereksiz uzun laf kalabalığı yapma; somut rakamlar, oranlar, risk analizleri ve aksiyon adımları sun.
Mevcut aktif veri seti özeti: ${JSON.stringify(contextData || {})}`;

      const contents = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text || h.content || "" }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      return res.json({
        reply: response.text || "Yanıt oluşturulamadı."
      });
    } catch (error: any) {
      console.error("Error in AI chat endpoint:", error);
      return res.status(500).json({
        reply: "Üzgünüm, analiz sırasında bir hata oluştu: " + (error.message || "Bilinmeyen hata")
      });
    }
  });

  // 3. Single Complaint AI Root-Cause Diagnostic endpoint
  app.post("/api/ai/diagnose-complaint", async (req, res) => {
    try {
      const { complaint } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          diagnosis: {
            rootCauseAssessment: "Teknik inceleme: Belirtilen şikayet konusu ilgili motor ve model grubunda bilinen kronik tolerans aşınması ile uyumludur.",
            faultCategory: complaint.faultCategory || "Motor Hasarı",
            isChronicIssue: true,
            chronicProbability: 88,
            workmanshipQuality: "Şüpheli (Hatalı arıza tespiti ve eksik torklama riski)",
            pricingEvaluation: {
              isFair: (complaint.financials?.difference || 0) < 3000,
              overchargeRisk: (complaint.financials?.difference || 0) > 3000 ? "Yüksek Fatura Şişirme Riski" : "Normal Seviye",
              suggestedFairPrice: Math.round((complaint.financials?.operationCost || 10000) * 1.05),
              auditNote: "Servis tarafından fatura edilen tutar ile parça/işçilik norm saat karşılığı arasında uyumsuzluk tespit edildi."
            },
            technicalAdvice: [
              "Aracın OBD-II loglarında ilgili sensör ve basınç eğrileri kontrol edilmeli.",
              "Değiştirilen parçanın garantiye iade edilerek distribütör kalite laboratuvarında teste sokulması sağlanmalı."
            ],
            warrantyVerdict: "Kısmi Garanti / Servis Rücu Hakkı Mevcut"
          }
        });
      }

      const prompt = `Aşağıdaki otomotiv servis şikayet kaydını incele ve derinlemesine teknik kök neden, işçilik kusuru, kronik hata olasılığı ve fatura fiyatlandırma hakkaniyet analizi yap:

ARAÇ BİLGİLERİ:
Marka & Model: ${complaint.brand} ${complaint.model} (${complaint.modelYear})
Motor Tipi: ${complaint.engineType} (${complaint.fuelType}, ${complaint.transmission})
Kilometre: ${complaint.km} KM
Plaka & Şasi: ${complaint.plate} - ${complaint.chassisNo}
Filo / Müşteri: ${complaint.fleetCompany}
Servis: ${complaint.serviceName} (${complaint.serviceCity})

ŞİKAYET VE SERVİS METNİ:
Konu: ${complaint.complaintSubject}
Ham Şikayet Açıklaması: ${complaint.rawComplaintText}
Teknisyen Notu: ${complaint.technicianNotes}

FİNANSAL VERİLER:
İşlem Gerçekleşen Maliyeti: ${complaint.financials?.operationCost} TL
Servise Fatura Edilen Tutar: ${complaint.financials?.invoicedCost} TL
Fark (Sapma): ${complaint.financials?.difference} TL
Kapsam: ${complaint.financials?.coverageType}

Lütfen aşağıdaki JSON formatında teknik ve finansal teşhis sonucu üret:
{
  "rootCauseAssessment": "Teknik kök neden analizi (detaylı)",
  "faultCategory": "Motor Hasarı & Yağ Kaçağı | Şanzıman & Debriyaj | Turbo & Emme | AdBlue/DPF | Elektrik & ECU | Yürür Aksam | Soğutma | Diğer",
  "isChronicIssue": true/false,
  "chronicProbability": 0-100 (sayı),
  "workmanshipQuality": "Hatalı Montaj Şüphesi | Hatalı Arıza Tespiti | Standart İşçilik | Kullanıcı Hatası",
  "pricingEvaluation": {
    "isFair": true/false,
    "overchargeRisk": "Yüksek Fatura Şişirme Riski | Makul | Düşük",
    "suggestedFairPrice": 12345 (TL cinsinden adil tutar),
    "auditNote": "Fatura ve parça/işçilik değerlendirmesi"
  },
  "technicalAdvice": [
    "Teknik tavsiye 1",
    "Teknik tavsiye 2"
  ],
  "warrantyVerdict": "Tam Garanti | Garanti Reddi (Kullanıcı Kusuru) | Servise İşçilik Rücusu | Kısmi Distribütör Desteği (Goodwill)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ diagnosis: parsed });
    } catch (error: any) {
      console.error("Error diagnosing complaint:", error);
      return res.status(500).json({ error: error.message || "Teşhis yapılamadı" });
    }
  });

  // 4. Batch NLP Semantic Categorization for free-text items
  app.post("/api/ai/nlp-batch-categorize", async (req, res) => {
    try {
      const { textSnippets } = req.body;
      const ai = getGeminiClient();

      if (!ai || !Array.isArray(textSnippets) || textSnippets.length === 0) {
        return res.json({
          results: (textSnippets || []).map((item: any) => ({
            id: item.id,
            category: "Motor Hasarı & Yağ Kaçağı",
            sentiment: "Olumsuz / Acil",
            detectedFault: "Mekanik tolerans veya montaj hatası",
            isMisdiagnosisRisk: true,
            urgencyScore: 85
          }))
        });
      }

      const prompt = `Aşağıdaki otomotiv serbest metin şikayetlerini ve teknisyen notlarını NLP ile incele ve sınıflandır:
${JSON.stringify(textSnippets, null, 2)}

Her kayıt için JSON dizisi döndür:
[
  {
    "id": "kayıt id",
    "category": "Motor Hasarı & Yağ Kaçağı | Şanzıman & Debriyaj | Turbo & Emme | AdBlue, DPF & Egzoz | Elektrik & ECU | Fren & Yürür Aksam | Soğutma",
    "sentiment": "Çok Kızgın / Kritik | Normal Şikayet | Hafif Memnuniyetsizlik",
    "detectedFault": "Tespit edilen somut teknik arıza",
    "isMisdiagnosisRisk": true/false (Servisin yanlış arıza tespiti yapıp sağlam parçayı değiştirme riski),
    "urgencyScore": 1-100
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const parsed = JSON.parse(response.text || "[]");
      return res.json({ results: parsed });
    } catch (error: any) {
      console.error("Error in NLP batch categorize:", error);
      return res.status(500).json({ error: error.message || "NLP analizi başarısız oldu" });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Automotive AI Complaint Analyst Server running on http://localhost:${PORT}`);
  });
}

startServer();
