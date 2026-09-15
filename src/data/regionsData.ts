import { CurrencyCode } from "@/types/marketplace";

export interface CityItem {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface AdministrativeDivision {
  id: string;
  nameAr: string;
  nameEn: string;
  type: "region" | "governorate" | "state" | "emirate" | "municipality";
  lat: number;
  lng: number;
  cities: CityItem[];
}

export interface CountryRegionData {
  code: string; // ISO 2 (e.g., 'MA', 'EG', 'SA')
  nameAr: string;
  nameEn: string;
  flag: string;
  currency: CurrencyCode;
  divisionLabelAr: string; // "الجهة" | "المحافظة" | "المنطقة" | "الإمارة"
  divisionLabelEn: string; // "Region" | "Governorate" | "Province" | "Emirate"
  defaultCenter: { lat: number; lng: number; zoom: number };
  divisions: AdministrativeDivision[];
}

export const COUNTRIES_DATA: CountryRegionData[] = [
  {
    code: "MA",
    nameAr: "المملكة المغربية",
    nameEn: "Morocco",
    flag: "🇲🇦",
    currency: "MAD",
    divisionLabelAr: "الجهة / الإقليم",
    divisionLabelEn: "Region / Province",
    defaultCenter: { lat: 33.5731, lng: -7.5898, zoom: 7 },
    divisions: [
      {
        id: "ma-casablanca-settat",
        nameAr: "جهة الدار البيضاء - سطات",
        nameEn: "Casablanca-Settat",
        type: "region",
        lat: 33.5731,
        lng: -7.5898,
        cities: [
          { id: "casablanca", nameAr: "الدار البيضاء", nameEn: "Casablanca", lat: 33.5731, lng: -7.5898 },
          { id: "mohammedia", nameAr: "المحمدية", nameEn: "Mohammedia", lat: 33.6866, lng: -7.3828 },
          { id: "settat", nameAr: "سطات", nameEn: "Settat", lat: 33.0010, lng: -7.6166 },
          { id: "eljadida", nameAr: "الجديدة", nameEn: "El Jadida", lat: 33.2549, lng: -8.5060 },
          { id: "berrechid", nameAr: "برشيد", nameEn: "Berrechid", lat: 33.2655, lng: -7.5875 },
          { id: "nouaceur", nameAr: "النواصر", nameEn: "Nouaceur", lat: 33.3644, lng: -7.5811 },
          { id: "mediouna", nameAr: "مديونة", nameEn: "Mediouna", lat: 33.4503, lng: -7.5147 },
          { id: "benslimane", nameAr: "بنسليمان", nameEn: "Benslimane", lat: 33.6144, lng: -7.1214 },
        ],
      },
      {
        id: "ma-rabat-sale-kenitra",
        nameAr: "جهة الرباط - سلا - القنيطرة",
        nameEn: "Rabat-Salé-Kénitra",
        type: "region",
        lat: 34.0209,
        lng: -6.8416,
        cities: [
          { id: "rabat", nameAr: "الرباط (العاصمة)", nameEn: "Rabat", lat: 34.0209, lng: -6.8416 },
          { id: "sale", nameAr: "سلا", nameEn: "Salé", lat: 34.0531, lng: -6.7985 },
          { id: "kenitra", nameAr: "القنيطرة", nameEn: "Kenitra", lat: 34.2610, lng: -6.5802 },
          { id: "temara", nameAr: "تمارة", nameEn: "Temara", lat: 33.9267, lng: -6.9122 },
          { id: "skhirat", nameAr: "الصخيرات", nameEn: "Skhirat", lat: 33.8544, lng: -7.0336 },
          { id: "khemisset", nameAr: "الخميسات", nameEn: "Khemisset", lat: 33.8167, lng: -6.0667 },
          { id: "sidikacem", nameAr: "سيدي قاسم", nameEn: "Sidi Kacem", lat: 34.2167, lng: -5.7000 },
          { id: "sidislimane", nameAr: "سيدي سليمان", nameEn: "Sidi Slimane", lat: 34.2600, lng: -5.9200 },
        ],
      },
      {
        id: "ma-marrakech-safi",
        nameAr: "جهة مراكش - آسفي",
        nameEn: "Marrakech-Safi",
        type: "region",
        lat: 31.6295,
        lng: -7.9811,
        cities: [
          { id: "marrakech", nameAr: "مراكش", nameEn: "Marrakech", lat: 31.6295, lng: -7.9811 },
          { id: "safi", nameAr: "آسفي", nameEn: "Safi", lat: 32.2994, lng: -9.2372 },
          { id: "essaouira", nameAr: "الصويرة", nameEn: "Essaouira", lat: 31.5085, lng: -9.7595 },
          { id: "benguerir", nameAr: "ابن جرير", nameEn: "Benguerir", lat: 32.2333, lng: -7.9500 },
          { id: "elkelâa", nameAr: "قلعة السراغنة", nameEn: "El Kelaa des Sraghna", lat: 32.0500, lng: -7.4000 },
          { id: "chichaoua", nameAr: "شيشاوة", nameEn: "Chichaoua", lat: 31.5333, lng: -8.7667 },
        ],
      },
      {
        id: "ma-tanger-tetouan-alhoceima",
        nameAr: "جهة طنجة - تطوان - الحسيمة",
        nameEn: "Tanger-Tétouan-Al Hoceïma",
        type: "region",
        lat: 35.7595,
        lng: -5.8340,
        cities: [
          { id: "tangier", nameAr: "طنجة", nameEn: "Tangier", lat: 35.7595, lng: -5.8340 },
          { id: "tetouan", nameAr: "تطوان", nameEn: "Tetouan", lat: 35.5889, lng: -5.3626 },
          { id: "alhoceima", nameAr: "الحسيمة", nameEn: "Al Hoceima", lat: 35.2472, lng: -3.9322 },
          { id: "larache", nameAr: "العرائش", nameEn: "Larache", lat: 35.1932, lng: -6.1557 },
          { id: "asilah", nameAr: "أصيلة", nameEn: "Asilah", lat: 35.4650, lng: -6.0342 },
          { id: "chefchaouen", nameAr: "شفشاون", nameEn: "Chefchaouen", lat: 35.1714, lng: -5.2697 },
          { id: "fnideq", nameAr: "الفنيدق", nameEn: "Fnideq", lat: 35.8497, lng: -5.3586 },
          { id: "mdiq", nameAr: "المضيق", nameEn: "M'diq", lat: 35.6858, lng: -5.3253 },
        ],
      },
      {
        id: "ma-fes-meknes",
        nameAr: "جهة فاس - مكناس",
        nameEn: "Fès-Meknès",
        type: "region",
        lat: 34.0331,
        lng: -5.0003,
        cities: [
          { id: "fes", nameAr: "فاس", nameEn: "Fes", lat: 34.0331, lng: -5.0003 },
          { id: "meknes", nameAr: "مكناس", nameEn: "Meknes", lat: 33.8938, lng: -5.5516 },
          { id: "taza", nameAr: "تازة", nameEn: "Taza", lat: 34.2167, lng: -4.0167 },
          { id: "sefrou", nameAr: "صفرو", nameEn: "Sefrou", lat: 33.8317, lng: -4.8281 },
          { id: "ifrane", nameAr: "إفران", nameEn: "Ifrane", lat: 33.5333, lng: -5.1167 },
          { id: "taounate", nameAr: "تاونات", nameEn: "Taounate", lat: 34.5333, lng: -4.6333 },
        ],
      },
      {
        id: "ma-souss-massa",
        nameAr: "جهة سوس - ماسة",
        nameEn: "Souss-Massa",
        type: "region",
        lat: 30.4278,
        lng: -9.5981,
        cities: [
          { id: "agadir", nameAr: "أكادير", nameEn: "Agadir", lat: 30.4278, lng: -9.5981 },
          { id: "inezgane", nameAr: "إنزكان", nameEn: "Inezgane", lat: 30.3556, lng: -9.5392 },
          { id: "aitmelloul", nameAr: "آيت ملول", nameEn: "Ait Melloul", lat: 30.3342, lng: -9.4975 },
          { id: "taroudant", nameAr: "تارودانت", nameEn: "Taroudant", lat: 30.4703, lng: -8.8770 },
          { id: "tiznit", nameAr: "تيزنيت", nameEn: "Tiznit", lat: 29.6974, lng: -9.7316 },
          { id: "tata", nameAr: "طاطا", nameEn: "Tata", lat: 29.7500, lng: -7.9667 },
        ],
      },
      {
        id: "ma-oriental",
        nameAr: "جهة الشرق",
        nameEn: "L'Oriental",
        type: "region",
        lat: 34.6814,
        lng: -1.9086,
        cities: [
          { id: "oujda", nameAr: "وجدة", nameEn: "Oujda", lat: 34.6814, lng: -1.9086 },
          { id: "nador", nameAr: "الناظور", nameEn: "Nador", lat: 35.1667, lng: -2.9333 },
          { id: "berkane", nameAr: "بركان", nameEn: "Berkane", lat: 34.9167, lng: -2.3167 },
          { id: "taourirt", nameAr: "تاوريرت", nameEn: "Taourirt", lat: 34.4167, lng: -2.8833 },
          { id: "guercif", nameAr: "جرسيف", nameEn: "Guercif", lat: 34.2333, lng: -3.3667 },
          { id: "driouch", nameAr: "الدريوش", nameEn: "Driouch", lat: 34.9781, lng: -3.3889 },
        ],
      },
      {
        id: "ma-beni-mellal-khenifra",
        nameAr: "جهة بني ملال - خنيفرة",
        nameEn: "Béni Mellal-Khénifra",
        type: "region",
        lat: 32.3373,
        lng: -6.3498,
        cities: [
          { id: "benimellal", nameAr: "بني ملال", nameEn: "Beni Mellal", lat: 32.3373, lng: -6.3498 },
          { id: "khenifra", nameAr: "خنيفرة", nameEn: "Khenifra", lat: 32.9333, lng: -5.6667 },
          { id: "khouribga", nameAr: "خريبكة", nameEn: "Khouribga", lat: 32.8833, lng: -6.9000 },
          { id: "fquihbensalah", nameAr: "الفقيه بن صالح", nameEn: "Fquih Ben Salah", lat: 32.5000, lng: -6.7000 },
          { id: "azilal", nameAr: "أزيلال", nameEn: "Azilal", lat: 31.9667, lng: -6.5667 },
        ],
      },
      {
        id: "ma-draa-tafilalet",
        nameAr: "جهة درعة - تافيلالت",
        nameEn: "Drâa-Tafilalet",
        type: "region",
        lat: 31.9315,
        lng: -4.4244,
        cities: [
          { id: "errachidia", nameAr: "الرشيدية", nameEn: "Errachidia", lat: 31.9315, lng: -4.4244 },
          { id: "ouarzazate", nameAr: "ورزازات", nameEn: "Ouarzazate", lat: 30.9167, lng: -6.9167 },
          { id: "tinghir", nameAr: "تنغير", nameEn: "Tinghir", lat: 31.5167, lng: -5.5333 },
          { id: "midelt", nameAr: "ميدلت", nameEn: "Midelt", lat: 32.6833, lng: -4.7333 },
          { id: "zagora", nameAr: "زاكورة", nameEn: "Zagora", lat: 30.3333, lng: -5.8333 },
        ],
      },
      {
        id: "ma-laayoune-sakia-el-hamra",
        nameAr: "جهة العيون - الساقية الحمراء",
        nameEn: "Laâyoune-Sakia El Hamra",
        type: "region",
        lat: 27.1253,
        lng: -13.1625,
        cities: [
          { id: "laayoune", nameAr: "العيون", nameEn: "Laayoune", lat: 27.1253, lng: -13.1625 },
          { id: "boujdour", nameAr: "بوجدور", nameEn: "Boujdour", lat: 26.1264, lng: -14.4842 },
          { id: "tarfaya", nameAr: "طرفاية", nameEn: "Tarfaya", lat: 27.9392, lng: -12.9261 },
          { id: "es-semara", nameAr: "السمارة", nameEn: "Es-Semara", lat: 26.7383, lng: -11.6719 },
        ],
      },
      {
        id: "ma-dakhla-oued-ed-dahab",
        nameAr: "جهة الداخلة - وادي الذهب",
        nameEn: "Dakhla-Oued Ed-Dahab",
        type: "region",
        lat: 23.7136,
        lng: -15.9388,
        cities: [
          { id: "dakhla", nameAr: "الداخلة", nameEn: "Dakhla", lat: 23.7136, lng: -15.9388 },
          { id: "aousserd", nameAr: "أوسرد", nameEn: "Aousserd", lat: 22.5564, lng: -14.3314 },
        ],
      },
      {
        id: "ma-guelmim-oued-noun",
        nameAr: "جهة كلميم - واد نون",
        nameEn: "Guelmim-Oued Noun",
        type: "region",
        lat: 28.9868,
        lng: -10.0574,
        cities: [
          { id: "guelmim", nameAr: "كلميم", nameEn: "Guelmim", lat: 28.9868, lng: -10.0574 },
          { id: "tantan", nameAr: "طانطان", nameEn: "Tan-Tan", lat: 28.4381, lng: -11.1031 },
          { id: "sidiifni", nameAr: "سيدي إفني", nameEn: "Sidi Ifni", lat: 29.3797, lng: -10.1731 },
          { id: "assazag", nameAr: "أسا الزاك", nameEn: "Assa-Zag", lat: 28.6081, lng: -9.4264 },
        ],
      },
    ],
  },
  {
    code: "EG",
    nameAr: "جمهورية مصر العربية",
    nameEn: "Egypt",
    flag: "🇪🇬",
    currency: "EGP",
    divisionLabelAr: "المحافظة",
    divisionLabelEn: "Governorate",
    defaultCenter: { lat: 30.0444, lng: 31.2357, zoom: 7 },
    divisions: [
      {
        id: "eg-cairo",
        nameAr: "محافظة القاهرة",
        nameEn: "Cairo",
        type: "governorate",
        lat: 30.0444,
        lng: 31.2357,
        cities: [
          { id: "cairo-nasr-city", nameAr: "مدينة نصر", nameEn: "Nasr City", lat: 30.0566, lng: 31.3301 },
          { id: "cairo-heliopolis", nameAr: "مصر الجديدة", nameEn: "Heliopolis", lat: 30.0890, lng: 31.3285 },
          { id: "cairo-new-cairo", nameAr: "القاهرة الجديدة / التجمع الخامس", nameEn: "New Cairo / 5th Settlement", lat: 30.0263, lng: 31.4968 },
          { id: "cairo-maadi", nameAr: "المعادي", nameEn: "Maadi", lat: 29.9602, lng: 31.2569 },
          { id: "cairo-downtown", nameAr: "وسط البلد / التحرير", nameEn: "Downtown Cairo", lat: 30.0444, lng: 31.2357 },
          { id: "cairo-zギフト", nameAr: "الزمالك", nameEn: "Zamalek", lat: 30.0617, lng: 31.2185 },
          { id: "cairo-rehab", nameAr: "الرحاب ومدينتي", nameEn: "Al Rehab & Madinaty", lat: 30.0619, lng: 31.4939 },
          { id: "cairo-shorouk", nameAr: "مدينة الشروق وبدر", nameEn: "El Shorouk & Badr", lat: 30.1333, lng: 31.6167 },
          { id: "cairo-new-capital", nameAr: "العاصمة الإدارية الجديدة", nameEn: "New Administrative Capital", lat: 30.0131, lng: 31.7500 },
        ],
      },
      {
        id: "eg-giza",
        nameAr: "محافظة الجيزة",
        nameEn: "Giza",
        type: "governorate",
        lat: 30.0131,
        lng: 31.2089,
        cities: [
          { id: "giza-dokki", nameAr: "الدقي والمهندسين", nameEn: "Dokki & Mohandessin", lat: 30.0385, lng: 31.2117 },
          { id: "giza-october", nameAr: "مدينة 6 أكتوبر", nameEn: "6th of October City", lat: 29.9737, lng: 30.9529 },
          { id: "giza-sheikh-zayed", nameAr: "مدينة الشيخ زايد", nameEn: "Sheikh Zayed City", lat: 30.0538, lng: 30.9789 },
          { id: "giza-haram", nameAr: "الهرم وفيصل", nameEn: "Al Haram & Faisal", lat: 29.9972, lng: 31.1444 },
          { id: "giza-agouza", nameAr: "العجوزة", nameEn: "Agouza", lat: 30.0583, lng: 31.2167 },
        ],
      },
      {
        id: "eg-alexandria",
        nameAr: "محافظة الإسكندرية",
        nameEn: "Alexandria",
        type: "governorate",
        lat: 31.2001,
        lng: 29.9187,
        cities: [
          { id: "alex-smouha", nameAr: "سموحة وسيدي جابر", nameEn: "Smouha & Sidi Gaber", lat: 31.2167, lng: 29.9500 },
          { id: "alex-miami", nameAr: "ميامي والمنتزه", nameEn: "Miami & Montaza", lat: 31.2667, lng: 30.0167 },
          { id: "alex-ramleh", nameAr: "محطة الرمل وكفر عبده", nameEn: "Raml & Kafr Abdo", lat: 31.2000, lng: 29.9000 },
          { id: "alex-agami", nameAr: "العجمي والساحل الشمالي", nameEn: "Agami & North Coast", lat: 31.0833, lng: 29.7333 },
          { id: "alex-borg", nameAr: "مدينة برج العرب", nameEn: "Borg El Arab", lat: 30.9167, lng: 29.5333 },
        ],
      },
      {
        id: "eg-dakahlia",
        nameAr: "محافظة الدقهلية",
        nameEn: "Dakahlia",
        type: "governorate",
        lat: 31.0409,
        lng: 31.3785,
        cities: [
          { id: "mansoura", nameAr: "المنصورة", nameEn: "Mansoura", lat: 31.0409, lng: 31.3785 },
          { id: "talkha", nameAr: "طلخا", nameEn: "Talkha", lat: 31.0542, lng: 31.3778 },
          { id: "mitghamr", nameAr: "ميت غمر", nameEn: "Mit Ghamr", lat: 30.7167, lng: 31.2500 },
          { id: "dekernes", nameAr: "دكرنس", nameEn: "Dekernes", lat: 31.0833, lng: 31.6000 },
        ],
      },
      {
        id: "eg-redsea",
        nameAr: "محافظة البحر الأحمر",
        nameEn: "Red Sea",
        type: "governorate",
        lat: 27.2579,
        lng: 33.8116,
        cities: [
          { id: "hurghada", nameAr: "الغردقة", nameEn: "Hurghada", lat: 27.2579, lng: 33.8116 },
          { id: "elgouna", nameAr: "الجونة", nameEn: "El Gouna", lat: 27.3944, lng: 33.6789 },
          { id: "safaga", nameAr: "سفاجا", nameEn: "Safaga", lat: 26.7292, lng: 33.9365 },
          { id: "marsaalam", nameAr: "مرسى علم", nameEn: "Marsa Alam", lat: 25.0631, lng: 34.8906 },
        ],
      },
      {
        id: "eg-south-sinai",
        nameAr: "محافظة جنوب سيناء",
        nameEn: "South Sinai",
        type: "governorate",
        lat: 27.9158,
        lng: 34.3299,
        cities: [
          { id: "sharm", nameAr: "شرم الشيخ", nameEn: "Sharm El Sheikh", lat: 27.9158, lng: 34.3299 },
          { id: "dahab", nameAr: "دهب", nameEn: "Dahab", lat: 28.5097, lng: 34.5131 },
          { id: "nuweiba", nameAr: "نويبع", nameEn: "Nuweiba", lat: 29.0347, lng: 34.6653 },
          { id: "ras-sedr", nameAr: "رأس سدر", nameEn: "Ras Sedr", lat: 29.5892, lng: 32.7167 },
        ],
      },
      {
        id: "eg-portsaid",
        nameAr: "محافظة بورسعيد",
        nameEn: "Port Said",
        type: "governorate",
        lat: 31.2653,
        lng: 32.3019,
        cities: [
          { id: "portsaid-city", nameAr: "مدينة بورسعيد", nameEn: "Port Said City", lat: 31.2653, lng: 32.3019 },
          { id: "portfouad", nameAr: "بورفؤاد", nameEn: "Port Fouad", lat: 31.2500, lng: 32.3167 },
        ],
      },
    ],
  },
  {
    code: "SA",
    nameAr: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "SAR",
    divisionLabelAr: "المنطقة",
    divisionLabelEn: "Region / Province",
    defaultCenter: { lat: 24.7136, lng: 46.6753, zoom: 6 },
    divisions: [
      {
        id: "sa-riyadh",
        nameAr: "منطقة الرياض",
        nameEn: "Riyadh Region",
        type: "region",
        lat: 24.7136,
        lng: 46.6753,
        cities: [
          { id: "riyadh", nameAr: "الرياض (العاصمة)", nameEn: "Riyadh", lat: 24.7136, lng: 46.6753 },
          { id: "kharj", nameAr: "الخرج", nameEn: "Al Kharj", lat: 24.1554, lng: 47.3120 },
          { id: "diriyah", nameAr: "الدرعية", nameEn: "Diriyah", lat: 24.7342, lng: 46.5772 },
          { id: "dawadmi", nameAr: "الدوادمي", nameEn: "Ad Dawadimi", lat: 24.5072, lng: 44.3925 },
          { id: "majmaah", nameAr: "المجمعة", nameEn: "Al Majma'ah", lat: 25.9128, lng: 45.3439 },
        ],
      },
      {
        id: "sa-makkah",
        nameAr: "منطقة مكة المكرمة",
        nameEn: "Makkah Region",
        type: "region",
        lat: 21.3891,
        lng: 39.8579,
        cities: [
          { id: "jeddah", nameAr: "جدة", nameEn: "Jeddah", lat: 21.5433, lng: 39.1728 },
          { id: "makkah", nameAr: "مكة المكرمة", nameEn: "Mecca", lat: 21.3891, lng: 39.8579 },
          { id: "taif", nameAr: "الطائف", nameEn: "Taif", lat: 21.2854, lng: 40.4222 },
          { id: "rabigh", nameAr: "رابغ", nameEn: "Rabigh", lat: 22.7986, lng: 39.0349 },
        ],
      },
      {
        id: "sa-eastern",
        nameAr: "المنطقة الشرقية",
        nameEn: "Eastern Province",
        type: "region",
        lat: 26.4207,
        lng: 50.0888,
        cities: [
          { id: "dammam", nameAr: "الدمام", nameEn: "Dammam", lat: 26.4207, lng: 50.0888 },
          { id: "khobar", nameAr: "الخبر", nameEn: "Al Khobar", lat: 26.2172, lng: 50.1971 },
          { id: "dhahran", nameAr: "الظهران", nameEn: "Dhahran", lat: 26.2361, lng: 50.1111 },
          { id: "jubail", nameAr: "الجبيل", nameEn: "Jubail", lat: 27.0174, lng: 49.6225 },
          { id: "ahsa", nameAr: "الأحساء / الهفوف", nameEn: "Al Ahsa / Hofuf", lat: 25.3800, lng: 49.5853 },
          { id: "qatif", nameAr: "القطيف", nameEn: "Qatif", lat: 26.5652, lng: 50.0089 },
        ],
      },
      {
        id: "sa-madinah",
        nameAr: "منطقة المدينة المنورة",
        nameEn: "Madinah Region",
        type: "region",
        lat: 24.5247,
        lng: 39.5692,
        cities: [
          { id: "medina", nameAr: "المدينة المنورة", nameEn: "Medina", lat: 24.5247, lng: 39.5692 },
          { id: "yanbu", nameAr: "ينبع", nameEn: "Yanbu", lat: 24.0891, lng: 38.0637 },
          { id: "alula", nameAr: "العلا", nameEn: "AlUla", lat: 26.6167, lng: 37.9167 },
        ],
      },
      {
        id: "sa-asir",
        nameAr: "منطقة عسير",
        nameEn: "Asir Region",
        type: "region",
        lat: 18.2164,
        lng: 42.5053,
        cities: [
          { id: "abha", nameAr: "أبها", nameEn: "Abha", lat: 18.2164, lng: 42.5053 },
          { id: "khamis", nameAr: "خميس مشيط", nameEn: "Khamis Mushait", lat: 18.3000, lng: 42.7333 },
        ],
      },
      {
        id: "sa-tabuk",
        nameAr: "منطقة تبوك",
        nameEn: "Tabuk Region",
        type: "region",
        lat: 28.3835,
        lng: 36.5662,
        cities: [
          { id: "tabuk", nameAr: "تبوك", nameEn: "Tabuk", lat: 28.3835, lng: 36.5662 },
          { id: "neom", nameAr: "نيوم", nameEn: "NEOM", lat: 28.0000, lng: 35.0000 },
        ],
      },
    ],
  },
  {
    code: "AE",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    divisionLabelAr: "الإمارة",
    divisionLabelEn: "Emirate",
    defaultCenter: { lat: 25.2048, lng: 55.2708, zoom: 8 },
    divisions: [
      {
        id: "ae-dubai",
        nameAr: "إمارة دبي",
        nameEn: "Dubai",
        type: "emirate",
        lat: 25.2048,
        lng: 55.2708,
        cities: [
          { id: "dubai-downtown", nameAr: "وسط مدينة دبي / برج خليفة", nameEn: "Downtown Dubai", lat: 25.1972, lng: 55.2744 },
          { id: "dubai-marina", nameAr: "دبي مارينا وJBR", nameEn: "Dubai Marina & JBR", lat: 25.0805, lng: 55.1403 },
          { id: "dubai-business-bay", nameAr: "الخليج التجاري", nameEn: "Business Bay", lat: 25.1856, lng: 55.2728 },
          { id: "dubai-jumeirah", nameAr: "جميرا ونخلة جميرا", nameEn: "Jumeirah & Palm Jumeirah", lat: 25.1124, lng: 55.1390 },
          { id: "dubai-deira", nameAr: "ديرة وبر دبي", nameEn: "Deira & Bur Dubai", lat: 25.2697, lng: 55.3094 },
        ],
      },
      {
        id: "ae-abudhabi",
        nameAr: "إمارة أبوظبي",
        nameEn: "Abu Dhabi",
        type: "emirate",
        lat: 24.4539,
        lng: 54.3773,
        cities: [
          { id: "auh-city", nameAr: "مدينة أبوظبي (العاصمة)", nameEn: "Abu Dhabi City", lat: 24.4539, lng: 54.3773 },
          { id: "auh-yas", nameAr: "جزيرة ياس والسعديات", nameEn: "Yas Island & Saadiyat", lat: 24.4859, lng: 54.6067 },
          { id: "alain", nameAr: "مدينة العين", nameEn: "Al Ain", lat: 24.2075, lng: 55.7447 },
        ],
      },
      {
        id: "ae-sharjah",
        nameAr: "إمارة الشارقة",
        nameEn: "Sharjah",
        type: "emirate",
        lat: 25.3463,
        lng: 55.4209,
        cities: [
          { id: "sharjah-city", nameAr: "مدينة الشارقة", nameEn: "Sharjah City", lat: 25.3463, lng: 55.4209 },
          { id: "khorfakkan", nameAr: "خورفكان", nameEn: "Khor Fakkan", lat: 25.3374, lng: 56.3420 },
        ],
      },
    ],
  },
  {
    code: "KW",
    nameAr: "دولة الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    currency: "KWD",
    divisionLabelAr: "المحافظة",
    divisionLabelEn: "Governorate",
    defaultCenter: { lat: 29.3759, lng: 47.9774, zoom: 9 },
    divisions: [
      {
        id: "kw-capital",
        nameAr: "محافظة العاصمة",
        nameEn: "Capital Governorate",
        type: "governorate",
        lat: 29.3759,
        lng: 47.9774,
        cities: [
          { id: "kuwait-city", nameAr: "مدينة الكويت", nameEn: "Kuwait City", lat: 29.3759, lng: 47.9774 },
          { id: "sharq", nameAr: "الشرق والمرقاب", nameEn: "Sharq & Mirqab", lat: 29.3800, lng: 47.9850 },
        ],
      },
      {
        id: "kw-hawally",
        nameAr: "محافظة حولي",
        nameEn: "Hawalli Governorate",
        type: "governorate",
        lat: 29.3328,
        lng: 48.0286,
        cities: [
          { id: "hawally", nameAr: "حولي", nameEn: "Hawalli", lat: 29.3328, lng: 48.0286 },
          { id: "salmiya", nameAr: "السالمية", nameEn: "Salmiya", lat: 29.3344, lng: 48.0772 },
        ],
      },
    ],
  },
  {
    code: "QA",
    nameAr: "دولة قطر",
    nameEn: "Qatar",
    flag: "🇶🇦",
    currency: "QAR",
    divisionLabelAr: "البلدية",
    divisionLabelEn: "Municipality",
    defaultCenter: { lat: 25.2854, lng: 51.5310, zoom: 9 },
    divisions: [
      {
        id: "qa-doha",
        nameAr: "بلدية الدوحة",
        nameEn: "Doha Municipality",
        type: "municipality",
        lat: 25.2854,
        lng: 51.5310,
        cities: [
          { id: "doha", nameAr: "الدوحة", nameEn: "Doha", lat: 25.2854, lng: 51.5310 },
          { id: "pearl", nameAr: "اللؤلؤة والخليج الغربي", nameEn: "The Pearl & West Bay", lat: 25.3711, lng: 51.5511 },
          { id: "lusail", nameAr: "مدينة لوسيل", nameEn: "Lusail City", lat: 25.4194, lng: 51.4939 },
        ],
      },
    ],
  },
];

// Helper functions
export function getCountryByCode(code?: string): CountryRegionData | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return COUNTRIES_DATA.find((c) => c.code === upper);
}

export function getCountryByName(name?: string): CountryRegionData | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  return COUNTRIES_DATA.find(
    (c) =>
      c.nameAr.toLowerCase().includes(clean) ||
      clean.includes(c.nameAr.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(clean) ||
      clean.includes(c.nameEn.toLowerCase()) ||
      (clean.includes("مغرب") && c.code === "MA") ||
      (clean.includes("morocco") && c.code === "MA") ||
      (clean.includes("مصر") && c.code === "EG") ||
      (clean.includes("سعود") && c.code === "SA") ||
      (clean.includes("امارات") && c.code === "AE") ||
      (clean.includes("كويت") && c.code === "KW") ||
      (clean.includes("قطر") && c.code === "QA")
  );
}

export function getDivisionsForCountry(countryCode?: string): AdministrativeDivision[] {
  const country = getCountryByCode(countryCode);
  return country ? country.divisions : [];
}

export function getCitiesForDivision(countryCode?: string, divisionId?: string): CityItem[] {
  const country = getCountryByCode(countryCode);
  if (!country || !divisionId) return [];
  const division = country.divisions.find((d) => d.id === divisionId);
  return division ? division.cities : [];
}
