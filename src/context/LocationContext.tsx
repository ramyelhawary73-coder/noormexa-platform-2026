"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  DetectedLocation,
  DEFAULT_STATIC_LOCATION,
  POPULAR_DELIVERY_DESTINATIONS,
  DeliveryDestinationItem,
  requestUserGpsLocation,
  fetchIpBasedLocation,
  detectUserRegionFromTimezone,
  saveDetectedLocation,
  loadSavedLocation,
  checkGeolocationPermissionState,
  getCityCoordinates,
  CITY_COORDINATES_DB,
} from "@/lib/locationService";
import { useLanguage } from "@/context/LanguageContext";
import { useMarketplace } from "@/context/MarketplaceContext";

export interface LocationFeedback {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

interface LocationContextType {
  location: DetectedLocation;
  isLocating: boolean;
  locatingType: "gps" | "ip" | null;
  permissionState: "granted" | "denied" | "prompt" | "unsupported";
  feedback: LocationFeedback | null;
  clearFeedback: () => void;
  isModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  detectGps: (autoFallbackToIp?: boolean) => Promise<boolean>;
  detectIp: () => Promise<boolean>;
  selectPopularDestination: (item: DeliveryDestinationItem) => void;
  selectCityByName: (cityName: string) => void;
  popularDestinations: DeliveryDestinationItem[];
  cityList: typeof CITY_COORDINATES_DB;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { isAr, language } = useLanguage();
  const { setCurrency, currency } = useMarketplace();

  // Initial state from cache or timezone safely initialized
  const [location, setLocation] = useState<DetectedLocation>(() => {
    if (typeof window !== "undefined") {
      const saved = loadSavedLocation();
      if (saved) return saved;
      const tzLoc = detectUserRegionFromTimezone();
      return tzLoc;
    }
    return DEFAULT_STATIC_LOCATION;
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locatingType, setLocatingType] = useState<"gps" | "ip" | null>(null);
  const [permissionState, setPermissionState] = useState<"granted" | "denied" | "prompt" | "unsupported">("prompt");
  const [feedback, setFeedback] = useState<LocationFeedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check initial browser permission status once mounted
  useEffect(() => {
    checkGeolocationPermissionState().then(setPermissionState).catch(() => {});
  }, []);

  // Listen for storage or external updates
  useEffect(() => {
    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DetectedLocation>;
      if (customEvent.detail) {
        setLocation(customEvent.detail);
      }
    };
    window.addEventListener("noormexa-location-updated", handleLocationUpdate);
    return () => window.removeEventListener("noormexa-location-updated", handleLocationUpdate);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const openLocationModal = useCallback(() => {
    setIsModalOpen(true);
    checkGeolocationPermissionState().then(setPermissionState).catch(() => {});
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // GPS Detection with robust permission handling and automatic IP fallback
  const detectGps = useCallback(
    async (autoFallbackToIp = true): Promise<boolean> => {
      setIsLocating(true);
      setLocatingType("gps");
      setFeedback(null);

      try {
        const result = await requestUserGpsLocation(language);

        if (result.success && result.location) {
          setIsLocating(false);
          setLocatingType(null);
          setLocation(result.location);
          saveDetectedLocation(result.location);
          setPermissionState("granted");

          // Sync platform currency if needed
          if (result.location.currency && result.location.currency !== currency) {
            try {
              setCurrency(result.location.currency);
            } catch {}
          }

          const accuracyText = result.location.accuracyMeters
            ? `(دقة ±${Math.round(result.location.accuracyMeters)} متر)`
            : "";

          setFeedback({
            type: "success",
            title: isAr ? "تم تحديد موقعك بدقة عبر GPS بنجاح" : "GPS Location Detected Successfully",
            message: isAr
              ? `موقعك الحالي: ${result.location.cityAr}، ${result.location.countryAr} ${accuracyText}`
              : `Current location: ${result.location.cityEn}, ${result.location.countryEn} (accuracy: ±${Math.round(result.location.accuracyMeters || 10)}m)`,
          });
          return true;
        }

        // GPS Failed or was Denied
        if (result.isPermissionDenied) {
          setPermissionState("denied");
        }

        if (autoFallbackToIp) {
          // Gracefully fallback to IP Geolocation
          setLocatingType("ip");
          const ipLoc = await fetchIpBasedLocation();
          setIsLocating(false);
          setLocatingType(null);

          if (ipLoc) {
            setLocation(ipLoc);
            saveDetectedLocation(ipLoc);

            if (ipLoc.currency && ipLoc.currency !== currency) {
              try {
                setCurrency(ipLoc.currency);
              } catch {}
            }

            if (result.isPermissionDenied) {
              setFeedback({
                type: "warning",
                title: isAr
                  ? "تم تفعيل التحديد عبر شبكة الإنترنت (IP) تلقائياً"
                  : "Switched to IP-Based Location",
                message: isAr
                  ? `تم حظر إذن GPS — تم تحديد موقعك التقديري تلقائياً عبر شبكة الإنترنت: ${ipLoc.cityAr}، ${ipLoc.countryAr}. يمكنك تغيير المدينة يدوياً في أي وقت.`
                  : `GPS permission was denied — automatically fell back to IP network location: ${ipLoc.cityEn}, ${ipLoc.countryEn}. You can select any city manually anytime.`,
              });
            } else {
              setFeedback({
                type: "info",
                title: isAr
                  ? "تم تحديد الموقع تقريبياً عبر شبكة الإنترنت"
                  : "Location Estimated via IP Network",
                message: isAr
                  ? `تعذر استقبال إشارة GPS — تم الاعتماد على موقع الشبكة: ${ipLoc.cityAr}، ${ipLoc.countryAr}.`
                  : `GPS signal unavailable — defaulted to estimated IP location: ${ipLoc.cityEn}, ${ipLoc.countryEn}.`,
              });
            }
            return true;
          } else {
            // Further fallback to timezone
            const tzLoc = detectUserRegionFromTimezone();
            setLocation(tzLoc);
            saveDetectedLocation(tzLoc);

            setFeedback({
              type: "warning",
              title: isAr ? "تم تعيين المنطقة الافتراضية" : "Regional Default Applied",
              message: isAr
                ? `تعذر الوصول إلى GPS وشبكة الموقع — تم تعيين وجهة التوصيل: ${tzLoc.cityAr}، ${tzLoc.countryAr}.`
                : `Could not access GPS or IP lookup — applied regional fallback: ${tzLoc.cityEn}, ${tzLoc.countryEn}.`,
            });
            return true;
          }
        } else {
          setIsLocating(false);
          setLocatingType(null);

          if (result.isPermissionDenied) {
            setFeedback({
              type: "warning",
              title: isAr ? "إذن الوصول للموقع الجغرافي محظور" : "Location Permission Blocked",
              message:
                (isAr ? result.errorMessageAr : result.errorMessageEn) ||
                (isAr
                  ? "يرجى الضغط على أيقونة القفل أو إعدادات الموقع في المتصفح واختيار 'سماح'."
                  : "Please click the lock icon in your address bar to enable Location Permissions."),
            });
          } else {
            setFeedback({
              type: "error",
              title: isAr ? "تعذر استقبال إشارة GPS" : "GPS Signal Unavailable",
              message:
                (isAr ? result.errorMessageAr : result.errorMessageEn) ||
                (isAr ? "تعذر استقبال إحداثيات GPS. يمكنك اختيار مدينتك يدوياً." : "Could not obtain GPS fix. You can select your city manually."),
            });
          }
          return false;
        }
      } catch (err: unknown) {
        setIsLocating(false);
        setLocatingType(null);
        // Fallback to IP even on unhandled exception
        try {
          const ipLoc = await fetchIpBasedLocation();
          if (ipLoc) {
            setLocation(ipLoc);
            saveDetectedLocation(ipLoc);
            setFeedback({
              type: "info",
              title: isAr ? "تم تحديد الموقع عبر شبكة الإنترنت" : "Location Set via IP",
              message: isAr
                ? `حدث استثناء في GPS، تم التحويل تلقائياً لموقع الشبكة: ${ipLoc.cityAr}، ${ipLoc.countryAr}`
                : `GPS sensor issue, switched to IP location: ${ipLoc.cityEn}, ${ipLoc.countryEn}`,
            });
            return true;
          }
        } catch {}

        const msg = err instanceof Error ? err.message : undefined;
        setFeedback({
          type: "error",
          title: isAr ? "خطأ في تحديد الموقع" : "Location Detection Error",
          message: msg || (isAr ? "حدث خطأ غير متوقع أثناء استشعار الموقع." : "An unexpected error occurred."),
        });
        return false;
      }
    },
    [isAr, language, currency, setCurrency]
  );

  // IP Geolocation fallback detection
  const detectIp = useCallback(async (): Promise<boolean> => {
    setIsLocating(true);
    setLocatingType("ip");
    setFeedback(null);

    try {
      const ipLoc = await fetchIpBasedLocation();
      setIsLocating(false);
      setLocatingType(null);

      if (ipLoc) {
        setLocation(ipLoc);
        saveDetectedLocation(ipLoc);

        if (ipLoc.currency && ipLoc.currency !== currency) {
          try {
            setCurrency(ipLoc.currency);
          } catch {}
        }

        setFeedback({
          type: "info",
          title: isAr ? "تم تحديد الموقع تقريبياً عبر شبكة الإنترنت (IP)" : "Location Estimated via IP Network",
          message: isAr
            ? `المنطقة التقديرية: ${ipLoc.cityAr}، ${ipLoc.countryAr}`
            : `Estimated region: ${ipLoc.cityEn}, ${ipLoc.countryEn}`,
        });
        return true;
      } else {
        // Fallback to timezone
        const tzLoc = detectUserRegionFromTimezone();
        setLocation(tzLoc);
        saveDetectedLocation(tzLoc);

        setFeedback({
          type: "info",
          title: isAr ? "تم تحديد المنطقة عبر إعدادات التوقيت" : "Location Set via Regional Timezone",
          message: isAr
            ? `المنطقة الافتراضية: ${tzLoc.cityAr}، ${tzLoc.countryAr}`
            : `Default region: ${tzLoc.cityEn}, ${tzLoc.countryEn}`,
        });
        return true;
      }
    } catch {
      setIsLocating(false);
      setLocatingType(null);
      const fallback = DEFAULT_STATIC_LOCATION;
      setLocation(fallback);
      saveDetectedLocation(fallback);
      return false;
    }
  }, [isAr, currency, setCurrency]);

  // Select popular destination
  const selectPopularDestination = useCallback(
    (item: DeliveryDestinationItem) => {
      const newLoc: DetectedLocation = {
        lat: item.coords.lat,
        lng: item.coords.lng,
        cityAr: item.cityAr,
        cityEn: item.cityEn,
        countryAr: item.countryAr,
        countryEn: item.countryEn,
        countryCode: item.countryCode,
        currency: item.currency,
        accuracyMeters: 5000,
        source: "city_lookup",
        timestamp: Date.now(),
      };

      setLocation(newLoc);
      saveDetectedLocation(newLoc);

      if (item.currency && item.currency !== currency) {
        try {
          setCurrency(item.currency);
        } catch {}
      }

      setFeedback({
        type: "success",
        title: isAr ? "تم تحديث وجهة التوصيل" : "Delivery Destination Updated",
        message: isAr
          ? `وجهة الشحن الحالية: ${item.cityAr}، ${item.countryAr}`
          : `Selected destination: ${item.cityEn}, ${item.countryEn}`,
      });

      setIsModalOpen(false);
    },
    [isAr, currency, setCurrency]
  );

  // Select city by search string
  const selectCityByName = useCallback(
    (cityName: string) => {
      if (!cityName.trim()) return;
      const coords = getCityCoordinates(cityName);

      // Search matching record in DB
      const matchedInfo = Object.values(CITY_COORDINATES_DB).find(
        (c) =>
          c.cityAr.toLowerCase().includes(cityName.toLowerCase()) ||
          c.cityEn.toLowerCase().includes(cityName.toLowerCase()) ||
          cityName.toLowerCase().includes(c.cityAr.toLowerCase()) ||
          cityName.toLowerCase().includes(c.cityEn.toLowerCase())
      );

      const newLoc: DetectedLocation = {
        lat: coords.lat,
        lng: coords.lng,
        cityAr: matchedInfo?.cityAr || cityName,
        cityEn: matchedInfo?.cityEn || cityName,
        countryAr: matchedInfo?.countryAr || "المملكة العربية السعودية",
        countryEn: matchedInfo?.countryEn || "Saudi Arabia",
        countryCode: matchedInfo?.countryCode || "SA",
        currency: matchedInfo?.currency || "SAR",
        accuracyMeters: 8000,
        source: "city_lookup",
        timestamp: Date.now(),
      };

      setLocation(newLoc);
      saveDetectedLocation(newLoc);

      if (newLoc.currency && newLoc.currency !== currency) {
        try {
          setCurrency(newLoc.currency);
        } catch {}
      }

      setFeedback({
        type: "success",
        title: isAr ? "تم اختيار المدينة" : "City Selected",
        message: isAr
          ? `وجهة التوصيل: ${newLoc.cityAr}، ${newLoc.countryAr}`
          : `Delivery destination: ${newLoc.cityEn}, ${newLoc.countryEn}`,
      });

      setIsModalOpen(false);
    },
    [isAr, currency, setCurrency]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocating,
        locatingType,
        permissionState,
        feedback,
        clearFeedback,
        isModalOpen,
        openLocationModal,
        closeLocationModal,
        detectGps,
        detectIp,
        selectPopularDestination,
        selectCityByName,
        popularDestinations: POPULAR_DELIVERY_DESTINATIONS,
        cityList: CITY_COORDINATES_DB,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
