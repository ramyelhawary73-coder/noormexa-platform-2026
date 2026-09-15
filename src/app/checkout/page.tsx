"use client";

import { useEffect, useState, useSyncExternalStore, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  CreditCard,
  Lock,
  Package,
  Printer,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wallet,
  Zap,
  LocateFixed,
  AlertTriangle,
  MapPin,
  Search,
  UserCheck,
  Navigation,
} from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import { requestUserGpsLocation } from "@/lib/locationService";
import {
  COUNTRIES_DATA,
  getCountryByName,
  getCountryByCode,
  findNearestDivisionAndCity,
  findNearestCountryDivisionAndCity,
  matchMoroccanDivisionAndCity,
  MOROCCAN_POSTAL_CODES,
} from "@/data/regionsData";
import InteractiveMapPicker from "@/components/location/InteractiveMapPicker";
import type { PaymentGatewayKey, ShippingAddress, Order } from "@/types/marketplace";
import ProductImage from "@/components/ProductImage";

type Language = "ar" | "en";
const LANGUAGE_KEY = "noormexa-language";

const copy = {
  ar: {
    title: "الدفع الآمن وإتمام الطلب",
    subtitle: "أدخل بيانات الشحن الدولية واختر وسيلة الدفع المناسبة لإصدار الفاتورة الرسمية",
    shippingSection: "1. بيانات العميل وعنوان الشحن",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني للإشعار وتتبع الطلب",
    phone: "رقم الهاتف / واتساب",
    country: "الدولة",
    city: "المدينة / الإمارة",
    address: "العنوان بالتفصيل (اسم الشارع، البناية، الشقة)",
    postalCode: "الرمز البريدي (اختياري)",
    notes: "ملاحظات خاصة بمندوب الشحن (اختياري)",
    speedSection: "2. سرعة وطريقة الشحن",
    standardSpeed: "الشحن القياسي المعتمد (3-5 أيام عمل)",
    prioritySpeed: "الشحن السريع ذو الأولوية (Priority Express 24-48 ساعة)",
    paymentSection: "3. اختيار بوابة الدفع الآمنة",
    orderSummary: "ملخص الطلب والفاتورة",
    itemsCount: "منتجات",
    subtotal: "المجموع الفرعي",
    discount: "الخصم المطبق",
    shipping: "تكلفة الشحن",
    vat: "ضريبة القيمة المضافة",
    grandTotal: "المبلغ الإجمالي المطلوب",
    confirmOrder: "تأكيد الطلب وإصدار الفاتورة الفورية",
    processing: "جاري معالجة الطلب الآمن...",
    successTitle: "تم تأكيد طلبك بنجاح!",
    successSubtitle: "تم تسجيل الطلب وتعيين رقم تتبع للشحنة وفاتورة إلكترونية رسمية.",
    orderNumber: "رقم الطلب المرجعي:",
    trackingNumber: "رقم تتبع الشحنة:",
    carrier: "شركة الشحن:",
    trackOrderBtn: "تتبع حالة شحنتك الآن",
    printInvoice: "طباعة الفاتورة الإلكترونية",
    backToMarket: "العودة للتسوق",
  },
  en: {
    title: "Secure International Checkout",
    subtitle: "Provide international shipping details and select your preferred payment gateway",
    shippingSection: "1. Customer & Shipping Address",
    fullName: "Full Name",
    email: "Email for Order Notifications",
    phone: "Phone / WhatsApp Number",
    country: "Country",
    city: "City / State",
    address: "Detailed Street Address & Apartment",
    postalCode: "Postal Code (Optional)",
    notes: "Delivery Instructions (Optional)",
    speedSection: "2. Shipping Speed & Logistics",
    standardSpeed: "Standard International Delivery (3-5 Business Days)",
    prioritySpeed: "Priority Express Dispatch (24-48 Hours Delivery)",
    paymentSection: "3. Secure Payment Gateway Selection",
    orderSummary: "Order & Invoice Summary",
    itemsCount: "items",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping Cost",
    vat: "Value Added Tax (VAT)",
    grandTotal: "Grand Total Due",
    confirmOrder: "Confirm Order & Generate Invoice",
    processing: "Processing secure order...",
    successTitle: "Order Confirmed Successfully!",
    successSubtitle: "Your order has been placed with official tracking code and digital tax invoice.",
    orderNumber: "Order Reference:",
    trackingNumber: "Tracking Code:",
    carrier: "Logistics Carrier:",
    trackOrderBtn: "Track Order Status Live",
    printInvoice: "Print Official Invoice",
    backToMarket: "Return to Marketplace",
  },
} as const;

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") return "ar";
  return window.localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function subscribeToLanguage(callback: () => void) {
  window.addEventListener("noormexa-language-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("noormexa-language-change", callback);
    window.removeEventListener("storage", callback);
  };
}

function useNoormexaLanguage() {
  return useSyncExternalStore<Language>(subscribeToLanguage, getLanguageSnapshot, () => "ar");
}

export default function CheckoutPage() {
  const router = useRouter();
  const language = useNoormexaLanguage();
  const text = copy[language];

  const {
    cartItems,
    cartSubtotal,
    calculatedDiscount,
    calculatedShipping,
    calculatedVat,
    calculatedGrandTotal,
    formatPrice,
    setCurrency,
    currency: currentCurrency,
    settings,
    createOrder,
  } = useMarketplace();

  const { location: globalLocation } = useLocation();
  const { user, profile } = useAuth();

  // Form State
  const [shippingSpeed, setShippingSpeed] = useState<"standard" | "priority">("standard");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayKey>("applePayMada");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Address search & GPS states
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [selectedCityOption, setSelectedCityOption] = useState<string>("");
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsFeedback, setGpsFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Initialize address cleanly with NO hardcoded developer data
  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("noormexa_saved_shipping_address");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            fullName: parsed.fullName || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            country: parsed.country || "المملكة العربية السعودية",
            state: parsed.state || parsed.region || "منطقة الرياض",
            region: parsed.region || parsed.state || "منطقة الرياض",
            city: parsed.city || "الرياض",
            address: parsed.address || "",
            postalCode: parsed.postalCode || "",
            notes: parsed.notes || "",
          };
        }
      } catch {}
    }
    return {
      fullName: "",
      email: "",
      phone: "",
      country: "المملكة العربية السعودية",
      state: "منطقة الرياض",
      region: "منطقة الرياض",
      city: "الرياض",
      address: "",
      postalCode: "",
      notes: "",
    };
  });

  // Auto-populate customer information dynamically from authenticated user / profile
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || (!user && !profile)) return;

      setAddress((prev) => {
        const updated = { ...prev };
        const userEmail = user?.email || "";
        const meta = (user?.user_metadata || {}) as Record<string, unknown>;
        const userName =
          (profile?.full_name as string) ||
          (meta.full_name as string) ||
          (userEmail ? userEmail.split("@")[0] : "");
        const userPhone =
          (profile?.phone as string) ||
          (meta.phone as string) ||
          "";

        let changed = false;
        if (!updated.email && userEmail) {
          updated.email = userEmail;
          changed = true;
        }
        if (!updated.fullName && userName) {
          updated.fullName = userName;
          changed = true;
        }
        if (!updated.phone && userPhone) {
          updated.phone = userPhone;
          changed = true;
        }
        return changed ? updated : prev;
      });
    });

    return () => {
      active = false;
    };
  }, [user, profile]);

  // Sync detected country & city if address city is still default
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || !globalLocation) return;

      const isMorocco =
        globalLocation.countryCode === "MA" ||
        globalLocation.countryAr?.includes("المغرب") ||
        globalLocation.countryEn?.toLowerCase().includes("morocco") ||
        (globalLocation.lat && globalLocation.lng && globalLocation.lat >= 20.5 && globalLocation.lat <= 36.2 && globalLocation.lng >= -17.5 && globalLocation.lng <= -1.0);

      if (isMorocco) {
        setAddress((prev) => {
          if (!prev.city || prev.city === "الرياض" || prev.country === "المملكة العربية السعودية") {
            let matchedDiv = null;
            let matchedCity = null;

            if (globalLocation.lat && globalLocation.lng) {
              const nearest = findNearestDivisionAndCity("MA", globalLocation.lat, globalLocation.lng);
              if (nearest) {
                matchedDiv = nearest.division;
                matchedCity = nearest.city;
              }
            }

            if (!matchedDiv || !matchedCity) {
              const textMatch =
                matchMoroccanDivisionAndCity(globalLocation.cityAr) ||
                matchMoroccanDivisionAndCity(globalLocation.cityEn);
              if (textMatch) {
                matchedDiv = textMatch.division;
                matchedCity = textMatch.city;
              }
            }

            if (!matchedDiv) {
              const morocco = getCountryByCode("MA");
              matchedDiv = morocco?.divisions[0] || null;
              matchedCity = matchedDiv?.cities[0] || null;
            }

            if (matchedDiv) {
              setSelectedRegionId(matchedDiv.id);
            }
            const cityName = language === "ar"
              ? (matchedCity?.nameAr || globalLocation.cityAr || "الدار البيضاء")
              : (matchedCity?.nameEn || globalLocation.cityEn || "Casablanca");
            setSelectedCityOption(cityName);

            const divName = language === "ar"
              ? (matchedDiv?.nameAr || "جهة الدار البيضاء - سطات")
              : (matchedDiv?.nameEn || "Casablanca-Settat");

            const postal = globalLocation.postalCode || (matchedCity?.id ? MOROCCAN_POSTAL_CODES[matchedCity.id] : "") || "20000";

            return {
              ...prev,
              country: "المملكة المغربية",
              state: divName,
              region: divName,
              city: cityName,
              postalCode: postal,
            };
          }
          return prev;
        });

        try {
          setCurrency("MAD");
        } catch {}
        return;
      }

      setAddress((prev) => {
        if (!prev.city || prev.city === "الرياض") {
          const cName = globalLocation.countryAr || prev.country;
          const countryData = getCountryByName(cName) || getCountryByCode(globalLocation.countryCode);
          let divName = globalLocation.state || globalLocation.regionAr || "";
          if (countryData && countryData.divisions && countryData.divisions.length > 0) {
            const firstDiv = countryData.divisions[0];
            setSelectedRegionId(firstDiv.id);
            divName = language === "ar" ? firstDiv.nameAr : firstDiv.nameEn;
          }
          return {
            ...prev,
            country: cName,
            state: divName || prev.state,
            region: divName || prev.region,
            city: globalLocation.cityAr || prev.city,
          };
        }
        return prev;
      });
    });

    return () => {
      active = false;
    };
  }, [globalLocation, language, setCurrency]);

  // Non-blocking high-speed GPS Geolocation auto-fill & Reverse Geocoding for Country, State, and City
  const handleGpsAutoFill = useCallback(async (silent: boolean = false) => {
    setIsLocatingGps(true);
    if (!silent) setGpsFeedback(null);

    try {
      const result = await requestUserGpsLocation(language);
      setIsLocatingGps(false);

      if (result.success && result.location) {
        const loc = result.location;
        const accuracyText = loc.accuracyMeters ? `(±${Math.round(loc.accuracyMeters)}م)` : "";

        // Record coordinates for UI display
        setGpsCoordinates({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracyMeters,
        });

        // 1. Resolve Country
        let matchedCountry =
          getCountryByCode(loc.countryCode) ||
          getCountryByName(loc.countryAr) ||
          getCountryByName(loc.countryEn) ||
          COUNTRIES_DATA.find((c) =>
            c.code.toUpperCase() === loc.countryCode?.toUpperCase() ||
            c.nameAr === loc.countryAr ||
            c.nameEn.toLowerCase() === loc.countryEn?.toLowerCase() ||
            loc.countryAr?.includes(c.nameAr) ||
            c.nameAr.includes(loc.countryAr || "")
          );

        const spatialMatch = loc.lat && loc.lng ? findNearestCountryDivisionAndCity(loc.lat, loc.lng) : null;
        if (!matchedCountry && spatialMatch?.country) {
          matchedCountry = spatialMatch.country;
        }

        const isMoroccoLocation =
          loc.countryCode === "MA" ||
          loc.countryAr?.includes("المغرب") ||
          loc.countryEn?.toLowerCase().includes("morocco") ||
          (loc.lat >= 20.5 && loc.lat <= 36.2 && loc.lng >= -17.5 && loc.lng <= -1.0) ||
          matchMoroccanDivisionAndCity(loc.cityAr) !== null ||
          matchMoroccanDivisionAndCity(loc.cityEn) !== null;

        if (isMoroccoLocation) {
          matchedCountry = getCountryByCode("MA") || COUNTRIES_DATA[0];
        } else if (!matchedCountry) {
          matchedCountry = COUNTRIES_DATA[0];
        }

        const resolvedCountryName = language === "ar" ? matchedCountry.nameAr : matchedCountry.nameEn;

        // 2. Resolve State / Administrative Division
        let resolvedDivision = null;
        let resolvedCity = null;

        if (matchedCountry.code === "MA") {
          if (loc.lat && loc.lng) {
            const nearest = findNearestDivisionAndCity("MA", loc.lat, loc.lng);
            if (nearest) {
              resolvedDivision = nearest.division;
              resolvedCity = nearest.city;
            }
          }

          if (!resolvedDivision || !resolvedCity) {
            const textMatch =
              matchMoroccanDivisionAndCity(loc.cityAr) ||
              matchMoroccanDivisionAndCity(loc.cityEn) ||
              matchMoroccanDivisionAndCity(loc.state) ||
              matchMoroccanDivisionAndCity(loc.regionAr) ||
              matchMoroccanDivisionAndCity(loc.regionEn) ||
              matchMoroccanDivisionAndCity(loc.formattedAddress);
            if (textMatch) {
              resolvedDivision = textMatch.division;
              resolvedCity = textMatch.city;
            }
          }

          if (!resolvedDivision) {
            const moroccoData = getCountryByCode("MA");
            resolvedDivision = moroccoData?.divisions[0] || null;
            resolvedCity = resolvedDivision?.cities[0] || null;
          }
        } else {
          // Other countries
          if (matchedCountry.divisions && matchedCountry.divisions.length > 0) {
            if (spatialMatch && spatialMatch.country.code === matchedCountry.code) {
              resolvedDivision = spatialMatch.division;
              resolvedCity = spatialMatch.city;
            } else if (loc.lat && loc.lng) {
              const nearest = findNearestDivisionAndCity(matchedCountry.code, loc.lat, loc.lng);
              if (nearest) {
                resolvedDivision = nearest.division;
                resolvedCity = nearest.city;
              }
            }

            if (!resolvedDivision && (loc.state || loc.regionAr || loc.regionEn)) {
              const stateQuery = (loc.state || loc.regionAr || loc.regionEn || "").toLowerCase();
              resolvedDivision = matchedCountry.divisions.find(
                (d) =>
                  d.nameAr.includes(stateQuery) ||
                  stateQuery.includes(d.nameAr) ||
                  d.nameEn.toLowerCase().includes(stateQuery) ||
                  stateQuery.includes(d.nameEn.toLowerCase())
              ) || null;
            }
          }
        }

        if (!resolvedDivision && matchedCountry.divisions && matchedCountry.divisions.length > 0) {
          resolvedDivision = matchedCountry.divisions[0];
        }

        // 3. Resolve City
        if (resolvedDivision && (!resolvedCity || !resolvedCity.nameAr)) {
          const cityQuery = (loc.cityAr || loc.cityEn || "").toLowerCase();
          if (cityQuery && resolvedDivision.cities && resolvedDivision.cities.length > 0) {
            resolvedCity = resolvedDivision.cities.find(
              (c) =>
                c.nameAr.includes(cityQuery) ||
                cityQuery.includes(c.nameAr) ||
                c.nameEn.toLowerCase().includes(cityQuery) ||
                cityQuery.includes(c.nameEn.toLowerCase())
            ) || resolvedDivision.cities[0];
          } else if (resolvedDivision.cities && resolvedDivision.cities.length > 0) {
            resolvedCity = resolvedDivision.cities[0];
          }
        }

        const resolvedDivisionName = resolvedDivision
          ? (language === "ar" ? resolvedDivision.nameAr : resolvedDivision.nameEn)
          : (loc.state || loc.regionAr || loc.regionEn || "");

        const resolvedCityName = resolvedCity
          ? (language === "ar" ? resolvedCity.nameAr : resolvedCity.nameEn)
          : (loc.cityAr || loc.cityEn || (language === "ar" ? "الدار البيضاء" : "Casablanca"));

        const resolvedPostalCode =
          loc.postalCode ||
          (resolvedCity?.id && MOROCCAN_POSTAL_CODES[resolvedCity.id]) ||
          (matchedCountry.code === "MA" ? "20000" : (matchedCountry.code === "SA" ? "12214" : "")) ||
          "";

        // Construct detailed street address
        let resolvedAddress = loc.formattedAddress || "";
        if (!resolvedAddress) {
          const parts = [loc.street, loc.district, resolvedCityName, resolvedDivisionName, resolvedCountryName].filter(Boolean);
          resolvedAddress = parts.length > 0 ? parts.join("، ") : `${resolvedCityName}، ${resolvedDivisionName}، ${resolvedCountryName}`;
        }

        // Automatically set cascading dropdown state
        if (resolvedDivision) {
          setSelectedRegionId(resolvedDivision.id);
        }
        setSelectedCityOption(resolvedCityName);

        // Update shipping address state with Country, State, City, and Street
        setAddress((prev) => ({
          ...prev,
          country: resolvedCountryName,
          state: resolvedDivisionName,
          region: resolvedDivisionName,
          city: resolvedCityName,
          address: resolvedAddress,
          postalCode: resolvedPostalCode || prev.postalCode,
        }));

        // Activate matching country currency
        if (matchedCountry.currency && matchedCountry.currency !== currentCurrency) {
          try {
            setCurrency(matchedCountry.currency);
          } catch {}
        }

        setGpsFeedback({
          type: "success",
          message:
            language === "ar"
              ? `📍 تم التحديد العكسي للموقع (Reverse Geocoding) بنجاح: [${resolvedCountryName}] › [${resolvedDivisionName}] › [${resolvedCityName}] ${accuracyText}`
              : `📍 Reverse Geocoded: [${resolvedCountryName}] › [${resolvedDivisionName}] › [${resolvedCityName}] ${accuracyText}`,
        });
      } else {
        if (!silent) {
          setGpsFeedback({
            type: result.isPermissionDenied ? "warning" : "error",
            message:
              (language === "ar" ? result.errorMessageAr : result.errorMessageEn) ||
              (language === "ar"
                ? "تعذر استقبال إشارة GPS بدقة، يرجى كتابة العنوان أو البحث عنه بالخريطة."
                : "Could not acquire GPS signal. You can type or search on map."),
          });
        }
      }
    } catch {
      setIsLocatingGps(false);
      if (!silent) {
        setGpsFeedback({
          type: "error",
          message:
            language === "ar"
              ? "حدث خطأ غير متوقع أثناء تحديد الموقع."
              : "Unexpected error during geolocation.",
        });
      }
    }
  }, [language, currentCurrency, setCurrency]);

  // One-time silent check if browser geolocation permission is already granted
  useEffect(() => {
    let active = true;
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((status) => {
        if (active && status.state === "granted") {
          const saved = window.localStorage.getItem("noormexa_saved_shipping_address");
          if (!saved) {
            handleGpsAutoFill(true);
          }
        }
      }).catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [handleGpsAutoFill]);

  // Google Maps / Geocoding Search by text/district/street
  const handleAddressSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = addressSearchQuery.trim();
    if (!query) return;

    setIsSearchingAddress(true);
    setGpsFeedback(null);

    try {
      const res = await fetch(`/api/geocode?query=${encodeURIComponent(query)}&locale=${language}`);
      setIsSearchingAddress(false);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.formattedAddress) {
          const isMorocco =
            data.countryCode === "MA" ||
            data.country?.includes("المغرب") ||
            (data.lat && data.lng && data.lat >= 20.5 && data.lat <= 36.2 && data.lng >= -17.5 && data.lng <= -1.0) ||
            matchMoroccanDivisionAndCity(data.formattedAddress) !== null ||
            matchMoroccanDivisionAndCity(query) !== null;

          if (isMorocco) {
            let matchedDiv = null;
            let matchedCity = null;

            if (data.lat && data.lng) {
              const nearest = findNearestDivisionAndCity("MA", data.lat, data.lng);
              if (nearest) {
                matchedDiv = nearest.division;
                matchedCity = nearest.city;
              }
            }

            if (!matchedDiv || !matchedCity) {
              const match = matchMoroccanDivisionAndCity(query) || matchMoroccanDivisionAndCity(data.formattedAddress);
              if (match) {
                matchedDiv = match.division;
                matchedCity = match.city;
              }
            }

            if (matchedDiv) {
              setSelectedRegionId(matchedDiv.id);
              const cName = language === "ar" ? matchedCity?.nameAr : matchedCity?.nameEn;
              if (cName) {
                setSelectedCityOption(cName);
                setAddress((prev) => ({
                  ...prev,
                  country: "المملكة المغربية",
                  city: cName,
                  address: data.formattedAddress,
                  postalCode: (matchedCity?.id ? MOROCCAN_POSTAL_CODES[matchedCity.id] : "") || prev.postalCode,
                }));
              }
            } else {
              setAddress((prev) => ({
                ...prev,
                country: "المملكة المغربية",
                address: data.formattedAddress,
              }));
            }

            try { setCurrency("MAD"); } catch {}
          } else {
            setAddress((prev) => ({
              ...prev,
              address: data.formattedAddress,
            }));
          }

          setShowAddressSearch(false);
          setAddressSearchQuery("");
          setGpsFeedback({
            type: "success",
            message:
              language === "ar"
                ? `تم العثور على العنوان وتحديده: ${data.formattedAddress}`
                : `Address located: ${data.formattedAddress}`,
          });
          return;
        }
      }

      setGpsFeedback({
        type: "warning",
        message:
          language === "ar"
            ? "لم نتمكن من العثور على هذا العنوان بدقة، يرجى كتابته يدوياً في خانة العنوان."
            : "Could not find this exact location. Please type it in the address field.",
      });
    } catch {
      setIsSearchingAddress(false);
      setGpsFeedback({
        type: "error",
        message:
          language === "ar"
            ? "تعذر الاتصال بخدمة الخرائط حالياً."
            : "Could not reach map search service.",
      });
    }
  };

  const availableGateways = Object.values(settings.gateways).filter((g) => g.enabled);

  // Resolve country data and divisions for cascading region/city picker
  const currentCountryData = useMemo(() => {
    return (
      getCountryByName(address.country) ||
      COUNTRIES_DATA.find(
        (c) =>
          c.nameAr === address.country ||
          c.nameEn.toLowerCase() === address.country.toLowerCase() ||
          address.country.includes(c.nameAr) ||
          c.code === address.country
      ) ||
      null
    );
  }, [address.country]);

  const availableDivisions = useMemo(() => {
    return currentCountryData?.divisions || [];
  }, [currentCountryData]);

  const currentDivision = useMemo(() => {
    return (
      availableDivisions.find((d) => d.id === selectedRegionId) ||
      availableDivisions[0] ||
      null
    );
  }, [availableDivisions, selectedRegionId]);

  const availableCities = useMemo(() => {
    return currentDivision?.cities || [];
  }, [currentDivision]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));

    if (field === "country") {
      const match =
        getCountryByName(value) ||
        COUNTRIES_DATA.find(
          (c) =>
            c.nameAr === value ||
            c.nameEn.toLowerCase() === value.toLowerCase() ||
            value.includes(c.nameAr) ||
            c.code === value
        );

      if (match) {
        if (match.currency && match.currency !== currentCurrency) {
          try {
            setCurrency(match.currency);
          } catch {}
        }
        if (match.divisions && match.divisions.length > 0) {
          const firstDiv = match.divisions[0];
          setSelectedRegionId(firstDiv.id);
          const divName = language === "ar" ? firstDiv.nameAr : firstDiv.nameEn;
          if (firstDiv.cities && firstDiv.cities.length > 0) {
            const cityName = language === "ar" ? firstDiv.cities[0].nameAr : firstDiv.cities[0].nameEn;
            setAddress((prev) => ({ ...prev, state: divName, region: divName, city: cityName }));
            setSelectedCityOption(cityName);
          } else {
            setAddress((prev) => ({ ...prev, state: divName, region: divName }));
          }
        } else {
          setAddress((prev) => ({ ...prev, state: "", region: "" }));
        }
      } else if (value.includes("المغرب") || value.toLowerCase().includes("morocco")) {
        try { setCurrency("MAD"); } catch {}
      } else if (value.includes("مصر") || value.toLowerCase().includes("egypt")) {
        try { setCurrency("EGP"); } catch {}
      } else if (value.includes("السعودية") || value.toLowerCase().includes("saudi")) {
        try { setCurrency("SAR"); } catch {}
      } else if (value.includes("الإمارات") || value.toLowerCase().includes("emirates") || value.toLowerCase().includes("uae")) {
        try { setCurrency("AED"); } catch {}
      } else if (value.includes("الكويت") || value.toLowerCase().includes("kuwait")) {
        try { setCurrency("KWD"); } catch {}
      } else if (value.includes("قطر") || value.toLowerCase().includes("qatar")) {
        try { setCurrency("QAR"); } catch {}
      }
    }
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 && !completedOrder) {
      router.push("/cart");
      return;
    }

    const fallbackState = currentDivision
      ? (language === "ar" ? currentDivision.nameAr : currentDivision.nameEn)
      : "";
    const finalAddress: ShippingAddress = {
      ...address,
      state: address.state || fallbackState,
      region: address.region || address.state || fallbackState,
    };

    // Save shipping address for user future sessions
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("noormexa_saved_shipping_address", JSON.stringify(finalAddress));
      }
    } catch {}

    setIsProcessing(true);
    setTimeout(() => {
      const res = createOrder(finalAddress, selectedGateway, shippingSpeed);
      setIsProcessing(false);
      if (res.order) {
        setCompletedOrder(res.order);
      }
    }, 1200);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // If order is completed, display the Luxury Confirmation & Invoice Screen
  if (completedOrder) {
    return (
      <main className="noormexa-main py-10 md:py-16">
        <div className="noormexa-container max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
          {/* Success Banner */}
          <div className="text-center p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Check size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{text.successTitle}</h1>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">{text.successSubtitle}</p>

            <div className="p-4 rounded-2xl bg-surface-soft border border-line grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-start">
              <div>
                <span className="text-muted block text-[10px]">{text.orderNumber}</span>
                <span className="font-mono font-bold text-foreground">{completedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">{text.trackingNumber}</span>
                <span className="font-mono font-bold text-gold">{completedOrder.trackingNumber}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px]">{text.carrier}</span>
                <span className="font-bold text-foreground">{completedOrder.carrier}</span>
              </div>
            </div>
          </div>

          {/* Official Invoice Card */}
          <div className="p-8 rounded-3xl bg-surface border border-line shadow-sm space-y-6 print:border-none print:shadow-none">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-lg font-black text-gold tracking-widest font-sans">NOORMEXA</span>
                <span className="block text-[10px] text-muted">فاتورة إلكترونية ضريبية معتمدة</span>
              </div>
              <div className="text-end text-xs text-muted">
                <span>التاريخ: {new Date(completedOrder.created_at).toLocaleDateString("ar-EG")}</span>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-soft border border-line space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">بيانات العميل المستلم:</span>
                <p className="font-bold text-foreground">{completedOrder.shipping_info.fullName}</p>
                <p className="text-muted">{completedOrder.shipping_info.phone}</p>
                <p className="text-muted">{completedOrder.shipping_info.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-soft border border-line space-y-1">
                <span className="text-[10px] font-bold text-muted uppercase">عنوان التوصيل:</span>
                <p className="font-bold text-foreground">{completedOrder.shipping_info.country} - {completedOrder.shipping_info.city}</p>
                <p className="text-muted">{completedOrder.shipping_info.address}</p>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="border border-line rounded-2xl overflow-hidden text-xs">
              <div className="bg-surface-soft p-3 font-bold text-foreground border-b border-line flex justify-between">
                <span>المنتج والوصف</span>
                <span>المجموع</span>
              </div>
              <div className="divide-y divide-line">
                {completedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{it.product_name}</p>
                      {it.selected_variants_label && (
                        <p className="text-[10px] text-muted">{it.selected_variants_label}</p>
                      )}
                      <p className="text-[11px] text-muted">
                        الكمية: {it.quantity} × {formatPrice(it.unit_price)}
                      </p>
                    </div>
                    <span className="font-bold text-foreground text-gold">
                      {formatPrice(it.unit_price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Financial Total */}
            <div className="p-4 rounded-2xl bg-surface-soft border border-line space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-foreground">{formatPrice(completedOrder.subtotal)}</span>
              </div>
              {completedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>الخصم المطبق:</span>
                  <span>-{formatPrice(completedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>تكلفة الشحن ({completedOrder.shipping_speed === "priority" ? "أولوية سريعة" : "شحن قياسي"}):</span>
                <span className="font-bold text-foreground">{formatPrice(completedOrder.shipping_cost)}</span>
              </div>
              {completedOrder.vat_amount > 0 && (
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (14% VAT):</span>
                  <span className="font-bold text-foreground">{formatPrice(completedOrder.vat_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-foreground border-t border-line pt-2">
                <span>الإجمالي النهائي المدفوع:</span>
                <span className="text-gold">{formatPrice(completedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 print:hidden">
              <Link
                href={`/shipping?track=${completedOrder.trackingNumber}`}
                className="flex-1 py-3 px-4 rounded-xl bg-gold text-navy hover:bg-gold-strong font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center"
              >
                <Truck size={15} />
                <span>{text.trackOrderBtn} ({completedOrder.carrier || "Global Logistics Hub"})</span>
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-5 rounded-xl bg-surface border border-line text-foreground hover:border-gold font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Printer size={15} />
                <span>{text.printInvoice}</span>
              </button>

              <Link
                href="/marketplace"
                className="py-3 px-5 rounded-xl bg-surface border border-line text-muted hover:text-foreground font-bold text-xs flex items-center gap-2 transition-all"
              >
                <span>{text.backToMarket}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <main className="noormexa-main py-16 text-center">
        <div className="noormexa-container max-w-md mx-auto space-y-4">
          <Package size={48} className="mx-auto text-muted" />
          <h2 className="text-xl font-bold text-foreground">السلة فارغة</h2>
          <p className="text-xs text-muted">يرجى إضافة منتجات إلى السلة للمتابعة إلى صفحة الدفع.</p>
          <Link href="/marketplace" className="inline-block px-6 py-2.5 bg-gold text-navy font-bold rounded-full text-xs">
            الذهاب إلى السوق
          </Link>
        </div>
      </main>
    );
  }

  const shippingCost = calculatedShipping(shippingSpeed);
  const grandTotal = calculatedGrandTotal(shippingSpeed);

  return (
    <main className="noormexa-main py-8 md:py-12">
      <div className="noormexa-container space-y-8">
        {/* Header */}
        <div className="border-b border-line pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {text.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">{text.subtitle}</p>
        </div>

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer & Address */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <Truck size={17} className="text-gold" />
                    <span>{text.shippingSection}</span>
                  </h2>
                  {user && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 text-gold text-[11px] font-semibold border border-gold/20">
                      <UserCheck size={12} />
                      <span className="max-w-[200px] truncate">{user.email}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Interactive Map Pin Button */}
                  <button
                    type="button"
                    onClick={() => setShowInteractiveMap((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/30 text-amber-800 dark:text-gold font-bold text-xs transition-all cursor-pointer"
                    title={language === "ar" ? "تثبيت الدبوس بدقة على الخريطة التفاعلية" : "Drop pin on interactive map"}
                  >
                    <Navigation size={13} className="text-gold" />
                    <span>{language === "ar" ? "تثبيت بالخريطة" : "Pin on Map"}</span>
                  </button>

                  {/* Map Search Action Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddressSearch((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-bold text-xs transition-all cursor-pointer"
                    title={language === "ar" ? "البحث بالخريطة وتعبئة العنوان" : "Search address on map"}
                  >
                    <MapPin size={13} className="text-sky-500" />
                    <span>{language === "ar" ? "البحث بالاسم" : "Search Map"}</span>
                  </button>

                  {/* GPS Auto-Fill Action Button */}
                  <button
                    type="button"
                    onClick={() => handleGpsAutoFill(false)}
                    disabled={isLocatingGps}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                    title={language === "ar" ? "تحديد الموقع وتعبئة العنوان تلقائياً عبر GPS" : "Detect and auto-fill address via GPS"}
                  >
                    <LocateFixed size={14} className={isLocatingGps ? "animate-spin text-orange-500" : "text-orange-500"} />
                    <span>
                      {isLocatingGps
                        ? language === "ar" ? "جاري التقاط GPS..." : "Detecting GPS..."
                        : language === "ar" ? "تحديد عبر GPS" : "Auto-fill GPS"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Inline Interactive Map Picker */}
              {showInteractiveMap && (
                <div className="p-3 sm:p-4 rounded-3xl bg-surface-soft border border-gold/40 space-y-3 animate-in fade-in shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation size={15} className="text-gold" />
                      <span className="text-xs font-bold text-foreground">
                        {language === "ar"
                          ? "تثبيت الدبوس وتحديد موقع التوصيل بدقة عالية"
                          : "Interactive Map Pinning & Logistics Hub Resolution"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowInteractiveMap(false)}
                      className="px-2.5 py-1 rounded-xl bg-surface border border-line hover:border-gold text-xs font-bold text-muted hover:text-foreground cursor-pointer"
                    >
                      ✕ {language === "ar" ? "إغلاق الخريطة" : "Close"}
                    </button>
                  </div>

                  <InteractiveMapPicker
                    onLocationConfirmed={(loc) => {
                      const isMoroccoLocation =
                        loc.countryCode === "MA" ||
                        loc.countryAr?.includes("المغرب") ||
                        loc.countryEn?.toLowerCase().includes("morocco") ||
                        (loc.lat && loc.lng && loc.lat >= 20.5 && loc.lat <= 36.2 && loc.lng >= -17.5 && loc.lng <= -1.0) ||
                        matchMoroccanDivisionAndCity(loc.cityAr) !== null;

                      if (isMoroccoLocation) {
                        let resolvedDivision = null;
                        let resolvedCity = null;

                        if (loc.lat && loc.lng) {
                          const nearest = findNearestDivisionAndCity("MA", loc.lat, loc.lng);
                          if (nearest) {
                            resolvedDivision = nearest.division;
                            resolvedCity = nearest.city;
                          }
                        }

                        if (!resolvedDivision || !resolvedCity) {
                          const textMatch =
                            matchMoroccanDivisionAndCity(loc.cityAr) ||
                            matchMoroccanDivisionAndCity(loc.formattedAddress);
                          if (textMatch) {
                            resolvedDivision = textMatch.division;
                            resolvedCity = textMatch.city;
                          }
                        }

                        const resolvedCityName = language === "ar"
                          ? (resolvedCity?.nameAr || loc.cityAr || "الدار البيضاء")
                          : (resolvedCity?.nameEn || loc.cityEn || "Casablanca");

                        const resolvedDivisionName = language === "ar"
                          ? (resolvedDivision?.nameAr || "جهة الدار البيضاء - سطات")
                          : (resolvedDivision?.nameEn || "Casablanca-Settat");

                        const resolvedStreet =
                          loc.formattedAddress ||
                          `${loc.street ? loc.street + "، " : ""}${loc.district ? loc.district + "، " : ""}${resolvedCityName}`;

                        if (resolvedDivision) {
                          setSelectedRegionId(resolvedDivision.id);
                        }
                        setSelectedCityOption(resolvedCityName);

                        setAddress((prev) => ({
                          ...prev,
                          country: "المملكة المغربية",
                          state: resolvedDivisionName,
                          region: resolvedDivisionName,
                          city: resolvedCityName,
                          address: resolvedStreet,
                          postalCode: loc.postalCode || (resolvedCity?.id ? MOROCCAN_POSTAL_CODES[resolvedCity.id] : "") || prev.postalCode,
                        }));

                        try { setCurrency("MAD"); } catch {}

                        setShowInteractiveMap(false);
                        setGpsFeedback({
                          type: "success",
                          message: language === "ar"
                            ? `🇲🇦 تم تثبيت موقعك بالخريطة بنجاح: ${resolvedDivisionName} - ${resolvedCityName} وتم تحديث العملة إلى MAD`
                            : `🇲🇦 Map location confirmed: ${resolvedDivisionName} - ${resolvedCityName} - Currency updated to MAD`,
                        });
                        return;
                      }

                      const spatial = loc.lat && loc.lng ? findNearestCountryDivisionAndCity(loc.lat, loc.lng) : null;
                      const targetCountry = getCountryByName(loc.countryAr || loc.countryEn) || getCountryByCode(loc.countryCode) || spatial?.country || COUNTRIES_DATA[0];
                      const targetDivision = spatial?.division || (targetCountry.divisions ? targetCountry.divisions[0] : null);
                      const targetCity = spatial?.city || (targetDivision?.cities ? targetDivision.cities[0] : null);

                      const cName = language === "ar" ? targetCountry.nameAr : targetCountry.nameEn;
                      const dName = targetDivision ? (language === "ar" ? targetDivision.nameAr : targetDivision.nameEn) : (loc.regionAr || loc.state || "");
                      const cityName = targetCity ? (language === "ar" ? targetCity.nameAr : targetCity.nameEn) : (loc.cityAr || loc.cityEn || "");

                      if (targetDivision) {
                        setSelectedRegionId(targetDivision.id);
                      }
                      setSelectedCityOption(cityName);

                      const resolvedStreet = loc.formattedAddress || `${loc.street ? loc.street + "، " : ""}${loc.district ? loc.district + "، " : ""}${cityName}`;
                      setAddress((prev) => ({
                        ...prev,
                        country: cName,
                        state: dName,
                        region: dName,
                        city: cityName,
                        address: resolvedStreet,
                        postalCode: loc.postalCode || prev.postalCode,
                      }));

                      if (loc.currency && loc.currency !== currentCurrency) {
                        try { setCurrency(loc.currency); } catch {}
                      }

                      setShowInteractiveMap(false);
                      setGpsFeedback({
                        type: "success",
                        message: language === "ar"
                          ? `تم تثبيت الموقع بالخريطة بنجاح: ${cityName} (${dName ? dName + " - " : ""}${cName})`
                          : `Pinned on map: ${cityName} (${dName ? dName + " - " : ""}${cName})`,
                      });
                    }}
                  />
                </div>
              )}

              {/* Map Address Search Bar */}
              {showAddressSearch && (
                <div className="p-3.5 rounded-2xl bg-surface-soft border border-sky-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin size={13} className="text-sky-500" />
                      <span>{language === "ar" ? "البحث عن العنوان عبر خرائط جوجل والمنظومة الجغرافية" : "Search address via Google Maps"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddressSearch(false)}
                      className="text-muted hover:text-foreground text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={addressSearchQuery}
                      onChange={(e) => setAddressSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddressSearch();
                        }
                      }}
                      placeholder={language === "ar" ? "اكتب اسم الحي أو الشارع أو المعلم (مثال: برج المملكة، حي العليا الرياض، المعادي)..." : "Type district, street, or landmark (e.g. Al Olaya Riyadh)..."}
                      className="flex-1 p-2.5 rounded-xl bg-surface border border-line text-xs text-foreground focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddressSearch()}
                      disabled={isSearchingAddress || !addressSearchQuery.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isSearchingAddress ? (
                        <span className="animate-spin text-xs">⏳</span>
                      ) : (
                        <Search size={14} />
                      )}
                      <span>{language === "ar" ? "بحث وتعبئة" : "Search"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time GPS/Map Detection Feedback Banner */}
              {gpsFeedback && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                    gpsFeedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : gpsFeedback.type === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                      : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {gpsFeedback.type === "success" ? (
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{gpsFeedback.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGpsFeedback(null)}
                    className="text-muted hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Dedicated Browser GPS Reverse Geocoding Card */}
              <div className="p-4 rounded-2xl bg-surface-soft/90 border border-gold/40 shadow-sm space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold/15 text-gold shrink-0">
                      <LocateFixed size={20} className={isLocatingGps ? "animate-spin text-gold" : "text-gold"} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                        <span>{language === "ar" ? "التقاط وتعبئة الموقع الجغرافي (GPS Reverse Geocoding)" : "GPS Reverse Geocoding Auto-Fill"}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          {language === "ar" ? "الدولة • الولاية/المحافظة • المدينة" : "Country • State • City"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-muted">
                        {language === "ar"
                          ? "التقاط إحداثيات GPS تلقائياً من المتصفح وتعبئة حقول الدولة، الولاية/المحافظة، والمدينة وعنوان التوصيل بدقة"
                          : "Detect browser GPS coordinates to auto-populate Country, State, City, and Street address with high precision"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGpsAutoFill(false)}
                    disabled={isLocatingGps}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <LocateFixed size={15} className={isLocatingGps ? "animate-spin" : ""} />
                    <span>
                      {isLocatingGps
                        ? (language === "ar" ? "جاري التقاط GPS وفك التشفير..." : "Resolving GPS...")
                        : (language === "ar" ? "📍 تعبئة العنوان تلقائياً بالـ GPS" : "📍 Auto-Fill via GPS")}
                    </span>
                  </button>
                </div>

                {/* Active Coordinates & Resolved Hierarchy Display */}
                {gpsCoordinates && (
                  <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-muted">{language === "ar" ? "الإحداثيات الملتقطة:" : "Detected Coordinates:"}</span>
                      <span className="bg-surface px-2 py-0.5 rounded-lg border border-line font-bold text-foreground">
                        {gpsCoordinates.lat.toFixed(5)}, {gpsCoordinates.lng.toFixed(5)}
                      </span>
                      {gpsCoordinates.accuracy && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          (±{Math.round(gpsCoordinates.accuracy)}م)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-700 dark:text-gold">
                      <span>{address.country}</span>
                      <span>›</span>
                      <span>{address.state || currentDivision?.nameAr || currentDivision?.nameEn}</span>
                      <span>›</span>
                      <span>{address.city}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.fullName} *</label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    placeholder={language === "ar" ? "الاسم الكامل للمستلم" : "Recipient full name"}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.email} *</label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    placeholder="name@example.com"
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.phone} *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    placeholder="+966 5X XXX XXXX"
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground flex items-center justify-between">
                    <span>{text.country} *</span>
                    {currentCountryData?.currency && (
                      <span className="text-[10px] text-amber-600 dark:text-gold font-bold">
                        {language === "ar" ? `العملة المعتمدة: ${currentCountryData.currency}` : `Active: ${currentCountryData.currency}`}
                      </span>
                    )}
                  </label>
                  <select
                    value={address.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-bold text-xs"
                  >
                    {COUNTRIES_DATA.map((c) => (
                      <option key={c.code} value={language === "ar" ? c.nameAr : c.nameEn}>
                        {c.flag} {language === "ar" ? c.nameAr : c.nameEn} ({c.code} - {c.currency})
                      </option>
                    ))}
                    <option value="الولايات المتحدة / أوروبا">🌐 الولايات المتحدة / أوروبا / دولي (Global - USD $)</option>
                  </select>
                </div>

                {/* Cascading Administrative Division / State / Region */}
                {availableDivisions.length > 0 ? (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>
                          {language === "ar"
                            ? `الولاية / ${currentCountryData?.divisionLabelAr || "المحافظة / الجهة"} (State)`
                            : `State / ${currentCountryData?.divisionLabelEn || "Province / Region"}`} *
                        </span>
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {availableDivisions.length} {language === "ar" ? "مسجلة" : "divisions"}
                      </span>
                    </label>
                    <select
                      value={selectedRegionId || (currentDivision?.id ?? "")}
                      onChange={(e) => {
                        const divId = e.target.value;
                        setSelectedRegionId(divId);
                        const chosenDiv = availableDivisions.find((d) => d.id === divId);
                        const divName = chosenDiv ? (language === "ar" ? chosenDiv.nameAr : chosenDiv.nameEn) : "";
                        const cityName = chosenDiv && chosenDiv.cities.length > 0
                          ? (language === "ar" ? chosenDiv.cities[0].nameAr : chosenDiv.cities[0].nameEn)
                          : "";
                        setAddress((prev) => ({
                          ...prev,
                          state: divName,
                          region: divName,
                          ...(cityName ? { city: cityName } : {}),
                        }));
                        if (cityName) {
                          setSelectedCityOption(cityName);
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-bold text-xs"
                    >
                      {availableDivisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {language === "ar" ? div.nameAr : div.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">
                      {language === "ar" ? "الولاية / المحافظة (State / Province) *" : "State / Province *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={address.state || ""}
                      placeholder={language === "ar" ? "اكتب اسم الولاية أو المقاطعة..." : "State/Region"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddress((prev) => ({ ...prev, state: val, region: val }));
                      }}
                      className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold text-xs"
                    />
                  </div>
                )}

                {/* Cascading City Selection */}
                {availableCities.length > 0 ? (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground flex items-center justify-between">
                      <span>{text.city} *</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {language === "ar" ? "مغطاة بمحطات التوصيل" : "Logistics Hub active"}
                      </span>
                    </label>
                    <select
                      value={selectedCityOption || address.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedCityOption(val);
                        if (val !== "other") {
                          setAddress((prev) => ({ ...prev, city: val }));
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold font-bold text-xs"
                    >
                      {availableCities.map((city) => {
                        const cityName = language === "ar" ? city.nameAr : city.nameEn;
                        return (
                          <option key={city.id} value={cityName}>
                            {cityName}
                          </option>
                        );
                      })}
                      <option value="other">
                        {language === "ar" ? "✍️ مدينة أو جماعة ترابية أخرى (إدخال يدوي)" : "✍️ Other City / Municipality (manual entry)"}
                      </option>
                    </select>

                    {(selectedCityOption === "other" ||
                      !availableCities.some((c) => (language === "ar" ? c.nameAr : c.nameEn) === address.city)) && (
                      <input
                        type="text"
                        required
                        value={address.city}
                        placeholder={language === "ar" ? "اكتب اسم مدينتك أو جماعتك..." : "Type custom city name..."}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full p-2.5 mt-1.5 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold text-xs"
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">{text.city} *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      placeholder={language === "ar" ? "الدار البيضاء، الرباط، الرياض، القاهرة..." : "City"}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-foreground">{text.postalCode}</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    placeholder={address.country?.includes("المغرب") ? "20000" : "12214"}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.address} *</label>
                  <input
                    type="text"
                    required
                    value={address.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder={language === "ar" ? "رقم المبنى، اسم الشارع، الحي، رقم الشقة..." : "Building number, Street name, District..."}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-foreground">{text.notes}</label>
                  <input
                    type="text"
                    value={address.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder={language === "ar" ? "ملاحظات المندوب لتسهيل الاستلام (اختياري)..." : "Delivery instructions (optional)..."}
                    className="w-full p-3 rounded-xl bg-surface-soft border border-line focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shipping Speed Selector */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <Zap size={17} className="text-gold" />
                <span>{text.speedSection}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShippingSpeed("standard")}
                  className={`p-4 rounded-2xl border text-start transition-all ${
                    shippingSpeed === "standard"
                      ? "bg-gold-soft border-gold text-foreground shadow-sm"
                      : "bg-surface-soft border-line hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{text.standardSpeed}</span>
                    {shippingSpeed === "standard" && <Check size={16} className="text-gold-strong" />}
                  </div>
                  <p className="text-[11px] text-muted mt-1">تسليم اعتيادي مأمون خلال 3-5 أيام</p>
                  <span className="font-black text-xs text-gold mt-2 block">
                    {calculatedShipping("standard") === 0 ? "مجاناً" : formatPrice(calculatedShipping("standard"))}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingSpeed("priority")}
                  className={`p-4 rounded-2xl border text-start transition-all ${
                    shippingSpeed === "priority"
                      ? "bg-gold-soft border-gold text-foreground shadow-sm"
                      : "bg-surface-soft border-line hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} className="text-gold" />
                      <span>{text.prioritySpeed}</span>
                    </span>
                    {shippingSpeed === "priority" && <Check size={16} className="text-gold-strong" />}
                  </div>
                  <p className="text-[11px] text-muted mt-1">معالجة فورية وأولوية شحن طيران خلال 24-48 ساعة</p>
                  <span className="font-black text-xs text-gold mt-2 block">
                    {formatPrice(calculatedShipping("priority"))}
                  </span>
                </button>
              </div>
            </div>

            {/* Section 3: Payment Gateways Selector */}
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2 border-b border-line pb-3">
                <CreditCard size={17} className="text-gold" />
                <span>{text.paymentSection}</span>
              </h2>

              <div className="space-y-3">
                {availableGateways.map((gw) => {
                  const active = selectedGateway === gw.key;
                  return (
                    <button
                      key={gw.key}
                      type="button"
                      onClick={() => setSelectedGateway(gw.key)}
                      className={`w-full p-4 rounded-2xl border text-start flex items-center justify-between gap-3 transition-all ${
                        active
                          ? "bg-amber-500 text-white border-amber-600 shadow-md scale-101 dark:bg-navy dark:text-gold dark:border-gold"
                          : "bg-surface-soft border-line text-foreground hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          active
                            ? "bg-white/20 text-white border-white/30 dark:bg-surface dark:border-line dark:text-gold"
                            : "bg-surface border border-line text-amber-600 dark:text-gold"
                        }`}>
                          {gw.key === "applePayMada" ? (
                            <Smartphone size={18} />
                          ) : gw.key === "stripe" ? (
                            <CreditCard size={18} />
                          ) : gw.key === "tabbyTamara" ? (
                            <Sparkles size={18} />
                          ) : gw.key === "paypal" ? (
                            <Wallet size={18} />
                          ) : (
                            <Banknote size={18} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm">
                              {language === "ar" ? gw.nameAr : gw.nameEn}
                            </span>
                            {gw.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                active
                                  ? "bg-white/25 text-white dark:bg-gold-soft dark:text-gold-strong"
                                  : "bg-amber-500/10 text-amber-800 dark:bg-gold-soft dark:text-gold-strong"
                              }`}>
                                {gw.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                            active ? "text-white/90 dark:text-gold/80" : "text-muted"
                          }`}>
                            {language === "ar" ? gw.descriptionAr : gw.descriptionEn}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        active ? "border-white bg-white text-amber-600 dark:border-gold dark:bg-gold dark:text-navy" : "border-line"
                      }`}>
                        {active && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Submit (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-line shadow-sm space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-foreground flex items-center justify-between border-b border-line pb-3">
                <span>{text.orderSummary}</span>
                <span className="text-xs text-muted font-normal">
                  ({cartItems.length} {text.itemsCount})
                </span>
              </h2>

              {/* Items Compact Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pe-1 divide-y divide-line/60">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-soft border border-line shrink-0 relative">
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate max-w-[170px]">
                        <p className="font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 text-xs text-muted border-t border-line pt-4">
                <div className="flex justify-between">
                  <span>{text.subtotal}</span>
                  <span className="font-bold text-foreground">{formatPrice(cartSubtotal)}</span>
                </div>

                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{text.discount}</span>
                    <span>-{formatPrice(calculatedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{text.shipping}</span>
                  <span className="font-bold text-foreground">
                    {shippingCost === 0 ? "مجاناً" : formatPrice(shippingCost)}
                  </span>
                </div>

                {calculatedVat > 0 && (
                  <div className="flex justify-between">
                    <span>{text.vat} (14%)</span>
                    <span className="font-bold text-foreground">{formatPrice(calculatedVat)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-foreground border-t border-line pt-3">
                  <span>{text.grandTotal}</span>
                  <span className="text-gold text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Confirm Order Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gold text-navy hover:bg-gold-strong font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  <Lock size={16} />
                  <span>{isProcessing ? text.processing : text.confirmOrder}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
                  <ShieldCheck size={14} className="text-gold" />
                  <span>شهادة أمان تشفير المعاملات SSL 256-bit</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Sticky Confirm Order Bar (Fixed above bottom nav with safe area) */}
      <div className="sm:hidden fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] inset-x-0 z-35 bg-surface/95 dark:bg-[#0b1322]/95 backdrop-blur-xl border-t border-line px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-muted block leading-tight">{text.grandTotal}</span>
          <span className="text-base font-black text-gold truncate block">
            {formatPrice(grandTotal)}
          </span>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
          className="h-11 px-5 rounded-xl bg-gold text-navy hover:bg-gold-strong flex items-center justify-center gap-2 text-xs font-black shadow-md active:scale-95 disabled:opacity-60 shrink-0 cursor-pointer"
        >
          <Lock size={15} />
          <span>{isProcessing ? text.processing : text.confirmOrder}</span>
        </button>
      </div>
    </main>
  );
}
