import { ComplaintItem, FaultCategory, RootCauseType, SeverityLevel, ComplaintStatus } from "../types";
import { AUTOMOTIVE_CATALOG } from "../data/automotiveCatalog";

/**
 * Türkçe Harf Duyarlı Küçük Harfe Çevirme
 */
export function toTurkishLower(text: string): string {
  if (!text) return "";
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .replace(/Ğ/g, "ğ")
    .replace(/Ü/g, "ü")
    .replace(/Ş/g, "ş")
    .replace(/Ö/g, "ö")
    .replace(/Ç/g, "ç")
    .toLowerCase()
    .trim();
}

/**
 * Türkçe Harf Duyarlı Büyük Harfe Çevirme
 */
export function toTurkishUpper(text: string): string {
  if (!text) return "";
  return text
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .replace(/ğ/g, "Ğ")
    .replace(/ü/g, "Ü")
    .replace(/ş/g, "Ş")
    .replace(/ö/g, "Ö")
    .replace(/ç/g, "Ç")
    .toUpperCase()
    .trim();
}

/**
 * Gereksiz Boşlukları Temizleme (Çift boşluk, tab, satır başı)
 */
export function cleanWhitespace(text: string): string {
  if (!text) return "";
  return text.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Türkçe Başlık Formatına Çevirme (Her kelimenin ilk harfi büyük, bağlaçlar küçük)
 */
export function toTurkishTitleCase(text: string): string {
  if (!text) return "";
  const cleaned = cleanWhitespace(text);
  if (!cleaned) return "";

  const lowerWords = ["ve", "ile", "veya", "için", "de", "da", "ki", "&", "ve/veya"];
  const words = cleaned.split(" ");

  return words
    .map((word, index) => {
      if (!word) return "";
      const lower = toTurkishLower(word);

      // İlk kelime değilse ve bağlaçsa küçük bırak
      if (index > 0 && lowerWords.includes(lower)) {
        return lower;
      }

      // Parantez içi veya özel karakter kontrolü
      if (word.startsWith("(") && word.length > 1) {
        return "(" + toTurkishUpper(word[1]) + toTurkishLower(word.slice(2));
      }
      if (word.includes("/")) {
        return word
          .split("/")
          .map((part) => toTurkishUpper(part.charAt(0)) + toTurkishLower(part.slice(1)))
          .join(" / ");
      }

      return toTurkishUpper(word.charAt(0)) + toTurkishLower(word.slice(1));
    })
    .join(" ");
}

/**
 * 1. Otomotiv Marka İsmi Normalizasyonu
 */
export function normalizeBrand(brand: string): string {
  if (!brand) return "Peugeot";
  const clean = cleanWhitespace(brand);
  const raw = toTurkishLower(clean)
    .replace(/ë/g, "e")
    .replace(/é/g, "e")
    .replace(/š/g, "s")
    .replace(/č/g, "c")
    .replace(/[\._\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (raw.includes("peugeot") || raw.includes("pejo") || raw.includes("peugot") || raw.includes("peujot")) return "Peugeot";
  if (raw.includes("renault") || raw.includes("reno") || raw.includes("renult") || raw.includes("renot")) return "Renault";
  if (raw.includes("volkswagen") || raw.includes("vw") || raw.includes("volksvagen") || raw.includes("vokswagen") || raw.includes("volks")) return "Volkswagen";
  if (raw.includes("fiat") || raw.includes("tofaş") || raw.includes("tofas") || raw.includes("fıat")) return "Fiat";
  if (raw.includes("ford") || raw.includes("fort")) return "Ford";
  if (raw.includes("toyota") || raw.includes("toyata")) return "Toyota";
  if (raw.includes("hyundai") || raw.includes("hundai") || raw.includes("hyundaı") || raw.includes("hunday")) return "Hyundai";
  if (raw.includes("citroen") || raw.includes("sitroen") || raw.includes("citro") || raw.includes("sitro")) return "Citroën";
  if (raw.includes("opel")) return "Opel";
  if (raw.includes("bmw") || raw === "b m w") return "BMW";
  if (raw.includes("mercedes") || raw.includes("merco") || raw === "mb" || raw.includes("benz")) return "Mercedes-Benz";
  if (raw.includes("audi") || raw.includes("audı")) return "Audi";
  if (raw.includes("skoda") || raw.includes("shkoda") || raw.includes("škoda")) return "Skoda";
  if (raw.includes("dacia") || raw.includes("dacıa") || raw.includes("dasya")) return "Dacia";
  if (raw.includes("seat") || raw.includes("se-at")) return "Seat";
  if (raw.includes("volvo")) return "Volvo";
  if (raw.includes("nissan") || raw.includes("nısan")) return "Nissan";
  if (raw.includes("honda")) return "Honda";
  if (raw.includes("kia") || raw.includes("kıa")) return "Kia";
  if (raw.includes("suzuki") || raw.includes("suzukı")) return "Suzuki";
  if (raw.includes("jeep") || raw.includes("cip")) return "Jeep";
  if (raw.includes("mg") || raw === "m g") return "MG";
  if (raw.includes("chery") || raw.includes("çeri")) return "Chery";
  if (raw.includes("cupra")) return "Cupra";
  if (raw.includes("land rover") || raw.includes("landrover") || raw.includes("range rover")) return "Land Rover";
  if (raw.includes("alfa") || raw.includes("romeo")) return "Alfa Romeo";
  if (raw.includes("porsche") || raw.includes("porche")) return "Porsche";
  if (raw.includes("tesla")) return "Tesla";
  if (raw.includes("mini") || raw.includes("cooper")) return "Mini";
  if (raw.includes("mazda")) return "Mazda";
  if (raw.includes("subaru")) return "Subaru";
  if (raw.includes("iveco")) return "Iveco";
  if (raw.includes("isuzu")) return "Isuzu";
  if (raw.includes("mitsubishi") || raw.includes("mitsubisi")) return "Mitsubishi";

  return toTurkishTitleCase(clean);
}

/**
 * 2. Model İsmi Normalizasyonu
 */
export function normalizeModel(model: string, brandHint?: string): string {
  if (!model) return "3008";
  const raw = toTurkishLower(cleanWhitespace(model));

  // Peugeot
  if (raw.includes("3008")) return "3008";
  if (raw.includes("5008")) return "5008";
  if (raw.includes("2008")) return "2008";
  if (raw.includes("208")) return "208";
  if (raw.includes("408")) return "408";
  if (raw.includes("508")) return "508";
  if (raw.includes("rifter")) return "Rifter";
  if (raw.includes("partner")) return "Partner";

  // Renault
  if (raw.includes("megane")) return "Megane IV";
  if (raw.includes("clio")) return "Clio V";
  if (raw.includes("captur")) return "Captur";
  if (raw.includes("austral")) return "Austral";
  if (raw.includes("kadjar")) return "Kadjar";
  if (raw.includes("talisman")) return "Talisman";
  if (raw.includes("express")) return "Express";
  if (raw.includes("kangoo")) return "Kangoo";

  // VW
  if (raw.includes("passat")) return "Passat";
  if (raw.includes("golf")) return "Golf";
  if (raw.includes("tiguan")) return "Tiguan";
  if (raw.includes("polo")) return "Polo";
  if (raw.includes("t-roc") || raw.includes("troc")) return "T-Roc";
  if (raw.includes("taigo")) return "Taigo";
  if (raw.includes("caddy")) return "Caddy";
  if (raw.includes("arteon")) return "Arteon";

  // Fiat
  if (raw.includes("egea") && raw.includes("cross")) return "Egea Cross";
  if (raw.includes("egea") && raw.includes("hb")) return "Egea Hatchback";
  if (raw.includes("egea")) return "Egea Sedan";
  if (raw.includes("500x")) return "500X";
  if (raw.includes("500")) return "500";
  if (raw.includes("doblo")) return "Doblo";
  if (raw.includes("fiorino")) return "Fiorino";

  // Ford
  if (raw.includes("focus")) return "Focus";
  if (raw.includes("puma")) return "Puma";
  if (raw.includes("kuga")) return "Kuga";
  if (raw.includes("courier") || raw.includes("tourneo")) return "Tourneo Courier";
  if (raw.includes("custom") || raw.includes("transit")) return "Transit Custom";
  if (raw.includes("mondeo")) return "Mondeo";

  // Toyota
  if (raw.includes("corolla") && raw.includes("cross")) return "Corolla Cross";
  if (raw.includes("corolla")) return "Corolla";
  if (raw.includes("c-hr") || raw.includes("chr")) return "C-HR";
  if (raw.includes("yaris")) return "Yaris";
  if (raw.includes("rav4") || raw.includes("rav 4")) return "RAV4";
  if (raw.includes("proace")) return "Proace City";

  // Hyundai
  if (raw.includes("tucson")) return "Tucson";
  if (raw.includes("i20")) return "i20";
  if (raw.includes("i10")) return "i10";
  if (raw.includes("bayon")) return "Bayon";
  if (raw.includes("elantra")) return "Elantra";
  if (raw.includes("kona")) return "Kona";
  if (raw.includes("santa fe")) return "Santa Fe";

  // Citroën
  if (raw.includes("c5") || raw.includes("aircross")) return "C5 Aircross";
  if (raw.includes("c3") && raw.includes("aircross")) return "C3 Aircross";
  if (raw.includes("c3")) return "C3";
  if (raw.includes("c4 x") || raw.includes("c4x")) return "C4 X";
  if (raw.includes("c4")) return "C4";
  if (raw.includes("berlingo")) return "Berlingo";

  // Opel
  if (raw.includes("corsa")) return "Corsa";
  if (raw.includes("astra")) return "Astra";
  if (raw.includes("mokka")) return "Mokka";
  if (raw.includes("grandland")) return "Grandland";
  if (raw.includes("crossland")) return "Crossland";
  if (raw.includes("combo")) return "Combo";

  // Dacia
  if (raw.includes("duster")) return "Duster";
  if (raw.includes("sandero")) return "Sandero Stepway";
  if (raw.includes("jogger")) return "Jogger";
  if (raw.includes("spring")) return "Spring";

  // Skoda
  if (raw.includes("superb")) return "Superb";
  if (raw.includes("octavia")) return "Octavia";
  if (raw.includes("kamiq")) return "Kamiq";
  if (raw.includes("karoq")) return "Karoq";
  if (raw.includes("kodiaq")) return "Kodiaq";
  if (raw.includes("fabia")) return "Fabia";

  // BMW / Mercedes / Audi
  if (raw.includes("3 serisi") || raw.includes("320") || raw.includes("3.20")) return "3 Serisi";
  if (raw.includes("5 serisi") || raw.includes("520") || raw.includes("5.20")) return "5 Serisi";
  if (raw.includes("c serisi") || raw.includes("c-serisi") || raw.includes("c200") || raw.includes("c180")) return "C-Serisi";
  if (raw.includes("e serisi") || raw.includes("e-serisi") || raw.includes("e200") || raw.includes("e220")) return "E-Serisi";
  if (raw.includes("a3")) return "A3";
  if (raw.includes("a4")) return "A4";

  return toTurkishTitleCase(model);
}

/**
 * 3. Motor Tipi Normalizasyonu
 */
export function normalizeEngineType(engine: string): string {
  if (!engine) return "1.5 BlueHDi";
  const raw = toTurkishLower(cleanWhitespace(engine));

  if (raw.includes("bluehdi") || raw.includes("blue hdi") || (raw.includes("1.5") && raw.includes("hdi"))) {
    return "1.5 BlueHDi";
  }
  if (raw.includes("puretech") || raw.includes("pure tech")) {
    if (raw.includes("1.6")) return "1.6 PureTech";
    return "1.2 PureTech";
  }
  if (raw.includes("tce")) {
    if (raw.includes("1.0")) return "1.0 TCe";
    return "1.3 TCe";
  }
  if (raw.includes("dci")) {
    if (raw.includes("blue") || raw.includes("1.5")) return "1.5 Blue dCi";
    return "1.5 dCi";
  }
  if (raw.includes("tsi")) {
    if (raw.includes("1.0")) return "1.0 TSI";
    if (raw.includes("1.4")) return "1.4 TSI";
    return "1.5 TSI";
  }
  if (raw.includes("tdi")) {
    if (raw.includes("2.0")) return "2.0 TDI";
    return "1.6 TDI";
  }
  if (raw.includes("multijet") || raw.includes("mjet")) {
    if (raw.includes("1.6")) return "1.6 MultiJet";
    return "1.3 MultiJet";
  }
  if (raw.includes("fire") && !raw.includes("fly")) return "1.4 Fire";
  if (raw.includes("ecoblue") || (raw.includes("1.5") && raw.includes("tdci"))) return "1.5 EcoBlue";
  if (raw.includes("ecoboost")) return "1.0 EcoBoost";
  if (raw.includes("hybrid") || raw.includes("hibrit")) {
    if (raw.includes("1.8")) return "1.8 Hybrid";
    if (raw.includes("2.0")) return "2.0 Hybrid";
    return "1.6 Hybrid";
  }
  if (raw.includes("crdi")) return "1.6 CRDi";
  if (raw.includes("t-gdi") || raw.includes("tgdi")) return "1.6 T-GDI";
  if (raw.includes("ev") || raw.includes("elektrik") || raw.includes("electric")) return "Elektrik EV";

  return toTurkishTitleCase(engine);
}

/**
 * 4. K SÜTUNU: Ana Başlık Normalizasyonu (Arıza Sistem Başlığı)
 * Kesinlikle A sütunundaki işlem kodlarını (SRV-, vb.) içermez!
 */
export function normalizeMainHeader(header: string, fallbackSubject: string = ""): string {
  const clean = cleanWhitespace(header);
  
  // Kod veya boş ise konu veya açıklamadan türet
  if (!clean || clean.startsWith("SRV-") || clean.startsWith("CMP-") || clean.startsWith("KAYIT-") || /^\d+$/.test(clean)) {
    return deriveMainHeaderFromText(fallbackSubject);
  }

  const raw = toTurkishLower(clean);

  // 1. İnsani, Servis İletişimi & Müşteri Hizmetleri / Bilgilendirme Kusurları (Öncelikli)
  if (
    raw.includes("bilgi verilme") ||
    raw.includes("bilgilendirme") ||
    raw.includes("bilgi yok") ||
    raw.includes("bilgi alam") ||
    raw.includes("haber verilme") ||
    raw.includes("habersiz") ||
    raw.includes("onaysız") ||
    raw.includes("onaysiz") ||
    raw.includes("iletişim") ||
    raw.includes("iletisim") ||
    raw.includes("ulaşılam") ||
    raw.includes("ulasilam") ||
    raw.includes("muhatap") ||
    raw.includes("cevap verilme") ||
    raw.includes("geri dönüş") ||
    raw.includes("geri donus") ||
    raw.includes("müşteri") ||
    raw.includes("musteri") ||
    raw.includes("hizmet kalitesi") ||
    raw.includes("ilgisiz") ||
    raw.includes("tavır") ||
    raw.includes("tavir") ||
    raw.includes("davranış") ||
    raw.includes("davranis") ||
    raw.includes("personel") ||
    raw.includes("açıklama yapılma") ||
    raw.includes("aciklama yapilma") ||
    raw.includes("rapor verilme")
  ) {
    return "Servis İletişimi, Bilgilendirme & Müşteri Hizmetleri";
  }

  if (raw.includes("yağ") || raw.includes("yag") || raw.includes("külbütör") || raw.includes("kulbutor") || raw.includes("karter") || (raw.includes("motor") && (raw.includes("sız") || raw.includes("kaçak") || raw.includes("kacak")))) {
    return "Motor & Yağlama Sistemi";
  }
  if (raw.includes("şanzıman") || raw.includes("sanziman") || raw.includes("kavrama") || raw.includes("dsg") || raw.includes("edc") || raw.includes("mekatronik") || raw.includes("vites")) {
    return "Şanzıman & Çift Kavrama";
  }
  if (raw.includes("soğutma") || raw.includes("sogutma") || raw.includes("termostat") || raw.includes("antifriz") || raw.includes("hararet") || raw.includes("radyatör") || raw.includes("radyator")) {
    return "Soğutma & Termostat Sistemi";
  }
  if (raw.includes("triger") || raw.includes("zincir") || raw.includes("eksantrik") || raw.includes("gergi")) {
    return "Triger & Eksantrik Sistemi";
  }
  if (raw.includes("adblue") || raw.includes("dpf") || raw.includes("emisyon") || raw.includes("egzoz") || raw.includes("egzoz") || raw.includes("nox") || raw.includes("partikül") || raw.includes("partikul")) {
    return "Egzoz, DPF & AdBlue Emisyon";
  }
  if (raw.includes("fren") || raw.includes("balata") || raw.includes("disk") || raw.includes("abs") || raw.includes("kaliper")) {
    return "Fren Sistemi & ABS";
  }
  if (raw.includes("süspansiyon") || raw.includes("suspansiyon") || raw.includes("salıncak") || raw.includes("salincak") || raw.includes("amortisör") || raw.includes("amortisor") || raw.includes("yürüyen") || raw.includes("yurur") || raw.includes("rot") || raw.includes("takoz")) {
    return "Süspansiyon & Yürüyen Aksam";
  }
  if (raw.includes("elektrik") || raw.includes("akü") || raw.includes("aku") || raw.includes("alternatör") || raw.includes("alternator") || raw.includes("sensör") || raw.includes("sensor") || raw.includes("beyin") || raw.includes("marş") || raw.includes("mars")) {
    return "Elektrik & Elektronik Sistemler";
  }
  if (raw.includes("klima") || raw.includes("iklimlendirme") || raw.includes("kompresör") || raw.includes("kompresor") || raw.includes("soğutmuyor") || raw.includes("sogutmuyor")) {
    return "Klima & İklimlendirme";
  }
  if (raw.includes("turbo") || raw.includes("intercooler") || raw.includes("emiş") || raw.includes("emis") || raw.includes("wastegate")) {
    return "Turbo & Emiş Sistemi";
  }
  if (raw.includes("enjektör") || raw.includes("enjektor") || raw.includes("yakıt") || raw.includes("yakit") || raw.includes("pompa") || raw.includes("common rail")) {
    return "Yakıt & Enjeksiyon Sistemi";
  }
  if (raw.includes("kaporta") || raw.includes("gövde") || raw.includes("govde") || raw.includes("trim") || raw.includes("boya") || raw.includes("kilit") || raw.includes("cam")) {
    return "Gövde, Trim & Kaporta";
  }
  if (raw.includes("motor") || raw.includes("mekanik")) {
    return "Motor & Mekanik Sistemler";
  }

  return toTurkishTitleCase(clean);
}

/**
 * Metinden Ana Başlık Türetme
 */
function deriveMainHeaderFromText(text: string): string {
  const raw = toTurkishLower(text);
  if (
    raw.includes("bilgi verilme") ||
    raw.includes("bilgilendirme") ||
    raw.includes("bilgi yok") ||
    raw.includes("bilgi alam") ||
    raw.includes("haber verilme") ||
    raw.includes("habersiz") ||
    raw.includes("onaysız") ||
    raw.includes("onaysiz") ||
    raw.includes("iletişim") ||
    raw.includes("iletisim") ||
    raw.includes("ulaşılam") ||
    raw.includes("ulasilam") ||
    raw.includes("muhatap") ||
    raw.includes("cevap verilme") ||
    raw.includes("geri dönüş") ||
    raw.includes("müşteri") ||
    raw.includes("ilgisiz") ||
    raw.includes("tavır") ||
    raw.includes("davranış") ||
    raw.includes("personel")
  ) {
    return "Servis İletişimi, Bilgilendirme & Müşteri Hizmetleri";
  }
  if (raw.includes("yağ") || raw.includes("yag") || raw.includes("külbütör") || raw.includes("karter") || raw.includes("sızıntı")) return "Motor & Yağlama Sistemi";
  if (raw.includes("şanzıman") || raw.includes("kavrama") || raw.includes("dsg") || raw.includes("edc") || raw.includes("vites") || raw.includes("mekatronik")) return "Şanzıman & Çift Kavrama";
  if (raw.includes("termostat") || raw.includes("antifriz") || raw.includes("soğutma") || raw.includes("hararet") || raw.includes("radyatör")) return "Soğutma & Termostat Sistemi";
  if (raw.includes("zincir") || raw.includes("triger") || raw.includes("eksantrik")) return "Triger & Eksantrik Sistemi";
  if (raw.includes("adblue") || raw.includes("dpf") || raw.includes("egzoz") || raw.includes("emisyon") || raw.includes("partikül")) return "Egzoz, DPF & AdBlue Emisyon";
  if (raw.includes("fren") || raw.includes("balata") || raw.includes("disk") || raw.includes("abs")) return "Fren Sistemi & ABS";
  if (raw.includes("salıncak") || raw.includes("amortisör") || raw.includes("süspansiyon") || raw.includes("rot") || raw.includes("lokurtu")) return "Süspansiyon & Yürüyen Aksam";
  if (raw.includes("akü") || raw.includes("elektrik") || raw.includes("sensör") || raw.includes("start-stop") || raw.includes("şarj")) return "Elektrik & Elektronik Sistemler";
  if (raw.includes("klima") || raw.includes("kompresör") || raw.includes("soğutmuyor")) return "Klima & İklimlendirme";
  if (raw.includes("turbo") || raw.includes("intercooler") || raw.includes("hortum")) return "Turbo & Emiş Sistemi";
  if (raw.includes("enjektör") || raw.includes("yakıt") || raw.includes("pompa")) return "Yakıt & Enjeksiyon Sistemi";
  if (raw.includes("kaporta") || raw.includes("boya") || raw.includes("trim") || raw.includes("gövde")) return "Gövde, Trim & Kaporta";
  return "Motor & Mekanik Sistemler";
}

/**
 * 5. L SÜTUNU: Konu / Şikayet Sebebi Normalizasyonu
 */
export function normalizeSubTopic(topic: string, mainHeaderHint?: string): string {
  const clean = cleanWhitespace(topic);
  if (!clean || clean.startsWith("SRV-") || clean.startsWith("CMP-") || clean.startsWith("KAYIT-") || /^\d+$/.test(clean)) {
    return "Genel Arıza Şikayeti";
  }

  const raw = toTurkishLower(clean);

  // İnsani, Servis İletişimi & Müşteri Süreç Konuları
  if (
    raw.includes("hararet") &&
    (raw.includes("bilgi") || raw.includes("haber") || raw.includes("iletisim") || raw.includes("iletişim"))
  ) {
    return "Hararet Yapan Araç Hakkında Bilgi Verilmemesi";
  }
  if (
    raw.includes("bilgi verilme") ||
    raw.includes("bilgilendirme yapılma") ||
    raw.includes("bilgi aktar") ||
    raw.includes("bilgi alam") ||
    raw.includes("haber verilme") ||
    raw.includes("durum bilgisi")
  ) {
    return "Araç Durumu Hakkında Bilgi Verilmemesi & İletişimsizlik";
  }
  if (raw.includes("onaysız") || raw.includes("onaysiz") || raw.includes("habersiz")) {
    return "Onaysız / Habersiz Servis İşlemi & Bilgilendirme Eksikliği";
  }
  if (raw.includes("ulaşılam") || raw.includes("ulasilam") || raw.includes("muhatap") || raw.includes("telefon")) {
    return "Servise Ulaşılamaması & Cevapsız Çağrı";
  }
  if (raw.includes("ilgisiz") || raw.includes("tavır") || raw.includes("tavir") || raw.includes("davranış") || raw.includes("kaba")) {
    return "Personel İlgisizliği & Müşteri Şikayeti";
  }
  if (raw.includes("teslimat gecik") || raw.includes("bekletilme")) {
    return "Teslimat Gecikmesi & Süreç Bilgisi Verilmemesi";
  }

  if (raw.includes("külbütör") || (raw.includes("yağ") && raw.includes("kaçak"))) return "Külbütör Kapağı Yağ Sızıntısı";
  if (raw.includes("eksantrik") || (raw.includes("zincir") && raw.includes("ses"))) return "Eksantrik Zincir Aşınması & Ses";
  if (raw.includes("kavrama") || raw.includes("mekatronik") || (raw.includes("vites") && raw.includes("vuruntu"))) return "Mekatronik Basınç Kaybı & Kavrama Titremesi";
  if (raw.includes("termostat") || (raw.includes("antifriz") && raw.includes("eksilt"))) return "Termostat Flanş Çatlağı & Antifriz Eksiltme";
  if (raw.includes("adblue") || raw.includes("dpf") || raw.includes("partikül")) return "DPF Tıkanıklığı & AdBlue Pompa Arızası";
  if (raw.includes("balata") || raw.includes("fren disk") || raw.includes("fren titreme")) return "Fren Balatası Aşınması & Disk Titreşimi";
  if (raw.includes("salıncak") || raw.includes("amortisör") || raw.includes("lokurtu")) return "Salıncak Burcu Boşluğu & Ses";
  if (raw.includes("akü") || raw.includes("start-stop") || raw.includes("şarj")) return "Akü Şarj Hatası & Sensör Arızası";
  if (raw.includes("klima") || raw.includes("kompresör")) return "Klima Kompresörü Devre Dışı & Gaz Kaçağı";
  if (raw.includes("turbo") && raw.includes("hortum")) return "Turbo Basınç Hortumu Yırtığı";
  if (raw.includes("enjektör") || raw.includes("enjektor")) return "Enjektör Geri Dönüş Kaçağı";

  return toTurkishTitleCase(clean);
}

/**
 * 6. Bildiren Firma (Filo) İsmi Normalizasyonu
 */
export function normalizeFleetCompany(fleet: string): string {
  if (!fleet) return "Hedef Filo";
  const raw = toTurkishLower(cleanWhitespace(fleet));

  if (raw.includes("hedef")) return "Hedef Filo";
  if (raw.includes("leaseplan") || raw.includes("ayvens") || raw.includes("lease plan")) return "LeasePlan / Ayvens";
  if (raw.includes("garanti")) return "Garanti Filo";
  if (raw.includes("intercity") || raw.includes("inter city")) return "Intercity Filo";
  if (raw.includes("borlease")) return "Borlease Filo";
  if (raw.includes("drd") || raw.includes("derindere")) return "DRD Filo Kiralama";
  if (raw.includes("arval") || raw.includes("teb arval")) return "Arval Filo";
  if (raw.includes("otokoç") || raw.includes("otokoc") || raw.includes("avis")) return "Avis & Otokoç Filo";
  if (raw.includes("sixt")) return "Sixt Filo";
  if (raw.includes("garenta")) return "Garenta Filo";
  if (raw.includes("central")) return "Central Rent Filo";
  if (raw.includes("budget")) return "Budget Filo";
  if (raw.includes("trendyol")) return "Trendyol Express Filo";
  if (raw.includes("getir")) return "Getir Lojistik Filo";
  if (raw.includes("teknosa")) return "Teknosa Saha Filosu";
  if (raw.includes("telekom")) return "Türk Telekom Saha Filo";
  if (raw.includes("borusan")) return "Borusan Filo";
  if (raw.includes("özmal") || raw.includes("ozmal") || raw.includes("bireysel")) return "Özmal / Kurumsal Filo";

  return toTurkishTitleCase(fleet);
}

/**
 * 7. Şikayetçi Olunan Servis İsmi Normalizasyonu
 */
export function normalizeServiceName(service: string): string {
  if (!service) return "Maslak Yetkili Servis - İst.";
  const clean = cleanWhitespace(service);
  const raw = toTurkishLower(clean);

  if (raw.includes("maslak")) return "Maslak Yetkili Servis - İst.";
  if (raw.includes("kartal")) return "Kartal Özel Servis - İst.";
  if (raw.includes("çankaya") || raw.includes("cankaya")) return "Çankaya Otomotiv - Ank.";
  if (raw.includes("bornova")) return "Bornova Yetkili Servis - İzm.";
  if (raw.includes("nilüfer") || raw.includes("nilufer")) return "Nilüfer Motorlu Araçlar - Brs.";
  if (raw.includes("akdeniz") || raw.includes("muratpaşa") || raw.includes("muratpasa")) return "Akdeniz Yetkili Servis - Ant.";
  if (raw.includes("seyhan") || raw.includes("çukurova") || raw.includes("cukurova")) return "Çukurova Servis - Adn.";
  if (raw.includes("gebze") || raw.includes("kocaeli")) return "Gebze Sanayi Özel Servis - Kocaeli";

  return toTurkishTitleCase(clean);
}

/**
 * 8. Şehir Normalizasyonu
 */
export function normalizeCity(city: string): string {
  if (!city) return "İstanbul";
  const raw = toTurkishLower(cleanWhitespace(city));

  if (raw.includes("ist") || raw.includes("istanbul")) return "İstanbul";
  if (raw.includes("ank") || raw.includes("ankara")) return "Ankara";
  if (raw.includes("izm") || raw.includes("izmir")) return "İzmir";
  if (raw.includes("brs") || raw.includes("bursa")) return "Bursa";
  if (raw.includes("ant") || raw.includes("antalya")) return "Antalya";
  if (raw.includes("adn") || raw.includes("adana")) return "Adana";
  if (raw.includes("koc") || raw.includes("kocaeli") || raw.includes("izmit")) return "Kocaeli";
  if (raw.includes("esk") || raw.includes("eskişehir")) return "Eskişehir";
  if (raw.includes("gzt") || raw.includes("gaziantep")) return "Gaziantep";
  if (raw.includes("kny") || raw.includes("konya")) return "Konya";
  if (raw.includes("samsun")) return "Samsun";
  if (raw.includes("trabzon")) return "Trabzon";
  if (raw.includes("kayseri")) return "Kayseri";
  if (raw.includes("denizli")) return "Denizli";

  return toTurkishTitleCase(city);
}

/**
 * 9. Plaka Formatı Normalizasyonu (Örn: "34 ABC 123")
 */
export function normalizePlate(plate: string): string {
  if (!plate) return "34 PLK 101";
  const cleaned = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  
  // Türk plakaları standardı: 2 rakam + 1-3 harf + 2-4 rakam
  const match = cleaned.match(/^(\d{2})([A-Z]{1,3})(\d{2,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return plate.trim().toUpperCase();
}

/**
 * 10. Kayıt / Dosya Numarası Normalizasyonu (Örn: "SRV-2024-8801")
 */
export function normalizeRecordNumber(rec: string, index: number = 1): string {
  if (!rec) return `SRV-2024-${8800 + index}`;
  const clean = cleanWhitespace(rec).toUpperCase();
  if (clean.startsWith("SRV-") || clean.startsWith("CMP-") || clean.startsWith("DOSYA-")) {
    return clean;
  }
  return `SRV-${clean}`;
}

/**
 * 11. Tarih Formatı Normalizasyonu (YYYY-MM-DD standardına kesin dönüştürme)
 */
export function normalizeDate(val: any): string {
  if (!val) return "2024-01-01";

  // Date objesi
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Excel sayısal seri tarihi (44927 vb.)
  if (typeof val === "number" && val > 20000 && val < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + val * 86400000);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }

  const str = String(val).trim();
  if (!str) return "2024-01-01";

  // YYYY-MM-DD veya YYYY/MM/DD veya YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // DD.MM.YYYY veya DD/MM/YYYY veya DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // DD.MM.YY veya DD/MM/YY
  const shortDmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);
  if (shortDmyMatch) {
    const day = shortDmyMatch[1].padStart(2, "0");
    const month = shortDmyMatch[2].padStart(2, "0");
    const year = `20${shortDmyMatch[3]}`;
    return `${year}-${month}-${day}`;
  }

  // Türkçe ay isimli tarihler ("14 Şubat 2024" vb.)
  const trLower = toTurkishLower(str);
  const monthsTr: Record<string, string> = {
    ocak: "01",
    subat: "02",
    şubat: "02",
    mart: "03",
    nisan: "04",
    mayis: "05",
    mayıs: "05",
    haziran: "06",
    temmuz: "07",
    agustos: "08",
    ağustos: "08",
    eylul: "09",
    eylül: "09",
    ekim: "10",
    kasim: "11",
    kasım: "11",
    aralik: "12",
    aralık: "12",
  };

  for (const [mName, mNum] of Object.entries(monthsTr)) {
    if (trLower.includes(mName)) {
      const parts = trLower.replace(/,/g, "").split(/\s+/);
      const dayPart = parts.find((p) => /^\d{1,2}$/.test(p));
      const yearPart = parts.find((p) => /^\d{4}$/.test(p));
      if (dayPart && yearPart) {
        return `${yearPart}-${mNum}-${dayPart.padStart(2, "0")}`;
      }
    }
  }

  // Standart Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "2024-01-01";
}

/**
 * 12. Bütün Bir ComplaintItem Kaydını Tamamen Normalize Etme
 */
export function normalizeComplaintItem(item: ComplaintItem, index: number = 0): ComplaintItem {
  const normBrand = normalizeBrand(item.brand);
  const normModel = normalizeModel(item.model, normBrand);
  const normEngine = normalizeEngineType(item.engineType);
  const normFleet = normalizeFleetCompany(item.reportedByCompany || item.fleetCompany);
  const normService = normalizeServiceName(item.complainedService || item.serviceName);
  const normCity = normalizeCity(item.serviceCity);
  const normPlate = normalizePlate(item.plate);
  const normRec = normalizeRecordNumber(item.recordNumber, index);
  const normDate = normalizeDate(item.date);

  // K Sütunu (Ana Başlık) ve L Sütunu (Konu)
  const normMainHeader = normalizeMainHeader(item.mainHeader || "", item.complaintSubject || item.rawComplaintText || "");
  const normSubTopic = normalizeSubTopic(item.subTopic || item.complaintReason || "", normMainHeader);

  const normSubject = cleanWhitespace(item.complaintSubject || `${normMainHeader} - ${normSubTopic}`);
  const normRawText = cleanWhitespace(item.rawComplaintText || `${normMainHeader} sisteminde ${normSubTopic} arızası bildirildi.`);
  const normNotes = cleanWhitespace(item.technicianNotes || "Servis teknisyeni inceleme ve onarım kaydı oluşturuldu.");

  return {
    ...item,
    date: normDate,
    brand: normBrand,
    model: normModel,
    engineType: normEngine,
    fleetCompany: normFleet,
    reportedByCompany: normFleet,
    serviceName: normService,
    complainedService: normService,
    serviceCity: normCity,
    plate: normPlate,
    recordNumber: normRec,
    mainHeader: normMainHeader,
    subTopic: normSubTopic,
    complaintReason: normSubTopic,
    complaintSubject: normSubject,
    rawComplaintText: normRawText,
    technicianNotes: normNotes,
  };
}

/**
 * 13. Bütün Veri Setini Baştan Sona Normalize Etme
 */
export function normalizeComplaintDataset(items: ComplaintItem[]): ComplaintItem[] {
  return items.map((item, idx) => normalizeComplaintItem(item, idx + 1));
}
