import { NextRequest, NextResponse } from "next/server";

interface GeocodeResult {
  success: boolean;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  region?: string;
  district?: string;
  street?: string;
  postalCode?: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
  source?: "google" | "nominatim" | "bigdatacloud" | "fallback";
  error?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const query = searchParams.get("query");
  const locale = searchParams.get("locale") || "ar";

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Case 1: Reverse Geocoding via coordinates (lat, lng)
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // 1. Try Google Maps Geocoding API if key is available
    if (googleApiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${locale}&key=${googleApiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
        const res = await fetch(googleUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && data.results && data.results.length > 0) {
            const first = data.results[0];
            let city = "";
            let state = "";
            let country = "";
            let countryCode = "";
            let district = "";
            let street = "";
            let streetNumber = "";
            let postalCode = "";

            for (const comp of first.address_components || []) {
              const types: string[] = comp.types || [];
              if (types.includes("country")) {
                country = comp.long_name;
                countryCode = comp.short_name;
              } else if (types.includes("administrative_area_level_1")) {
                state = comp.long_name;
              } else if (types.includes("locality")) {
                city = comp.long_name;
              } else if (!city && (types.includes("administrative_area_level_2") || types.includes("administrative_area_level_1"))) {
                city = comp.long_name;
              } else if (types.includes("sublocality") || types.includes("sublocality_level_1") || types.includes("neighborhood")) {
                district = comp.long_name;
              } else if (types.includes("route")) {
                street = comp.long_name;
              } else if (types.includes("street_number")) {
                streetNumber = comp.long_name;
              } else if (types.includes("postal_code")) {
                postalCode = comp.long_name;
              }
            }

            const cleanStreet = streetNumber ? `${street} ${streetNumber}`.trim() : street;
            const formattedAddress = first.formatted_address || [cleanStreet, district, city, state, country].filter(Boolean).join("، ");

            const result: GeocodeResult = {
              success: true,
              country: country || (locale === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia"),
              countryCode: countryCode || "SA",
              city: city || (locale === "ar" ? "الرياض" : "Riyadh"),
              state: state || "",
              region: state || "",
              district,
              street: cleanStreet,
              postalCode,
              formattedAddress,
              lat,
              lng,
              source: "google",
            };
            return NextResponse.json(result);
          }
        }
      } catch (err) {
        console.warn("Google Maps geocoding error/timeout, falling back:", err);
      }
    }

    // 2. High-speed Server-side Reverse Geocoding Fallback via Nominatim (with custom UA)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${locale === "ar" ? "ar,en" : "en,ar"}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "NOORMEXA-ECommerce/1.0 (https://noormexa.com; contact@noormexa.com)",
            "Accept": "application/json",
          },
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        const country = addr.country || (locale === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia");
        const countryCode = (addr.country_code || "sa").toUpperCase();
        const state = addr.state || addr.region || addr.province || addr.county || "";
        const city = addr.city || addr.town || addr.municipality || state || (locale === "ar" ? "الرياض" : "Riyadh");
        const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || "";
        const street = addr.road || addr.street || addr.pedestrian || "";
        const postalCode = addr.postcode || "";

        const parts = [street, district, city, state].filter(Boolean);
        const formattedAddress = parts.length > 0 ? parts.join("، ") : (data.display_name || city);

        const result: GeocodeResult = {
          success: true,
          country,
          countryCode,
          city,
          state,
          region: state,
          district,
          street,
          postalCode,
          formattedAddress,
          lat,
          lng,
          source: "nominatim",
        };
        return NextResponse.json(result);
      }
    } catch {
      // Ignore Nominatim timeout and move to BigDataCloud
    }

    // 3. Fallback to BigDataCloud Client Reverse Geocode
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${locale}`,
        {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
          },
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const country = data.countryName || (locale === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia");
        const countryCode = (data.countryCode || "SA").toUpperCase();
        const city = data.city || data.locality || (locale === "ar" ? "الرياض" : "Riyadh");
        const district = data.locality || "";
        const postalCode = data.postcode || "";

        const formattedAddress = [district, city, country].filter(Boolean).join("، ");

        const result: GeocodeResult = {
          success: true,
          country,
          countryCode,
          city,
          district,
          street: "",
          postalCode,
          formattedAddress,
          lat,
          lng,
          source: "bigdatacloud",
        };
        return NextResponse.json(result);
      }
    } catch {
      // Final fallback
    }

    // 4. Safe fallback so client NEVER hangs
    return NextResponse.json({
      success: true,
      country: locale === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia",
      countryCode: "SA",
      city: locale === "ar" ? "الرياض" : "Riyadh",
      district: "",
      street: "",
      postalCode: "",
      formattedAddress: locale === "ar" ? "موقع محدد عبر الخريطة (GPS)" : "Location set via Map (GPS)",
      lat,
      lng,
      source: "fallback",
    });
  }

  // Case 2: Query-based Geocoding (search text)
  if (query) {
    if (googleApiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&language=${locale}&key=${googleApiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
        const res = await fetch(googleUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && data.results?.length > 0) {
            const first = data.results[0];
            const loc = first.geometry?.location || {};
            return NextResponse.json({
              success: true,
              formattedAddress: first.formatted_address,
              lat: loc.lat,
              lng: loc.lng,
              source: "google",
            });
          }
        }
      } catch (err) {
        console.warn("Google Maps address query error:", err);
      }
    }

    // OpenStreetMap Nominatim search fallback
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&accept-language=${locale === "ar" ? "ar,en" : "en,ar"}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "NOORMEXA-ECommerce/1.0 (https://noormexa.com; contact@noormexa.com)",
            "Accept": "application/json",
          },
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          return NextResponse.json({
            success: true,
            formattedAddress: first.display_name,
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon),
            source: "nominatim",
          });
        }
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: "Address not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: false, error: "Missing lat/lng or query parameters" },
    { status: 400 }
  );
}
