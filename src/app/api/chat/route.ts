import { NextRequest, NextResponse } from "next/server";
import { generateAosaResponse, type AgentAction } from "@/lib/aosaAgent";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPTS: Record<"buyer" | "seller", Record<"ar" | "en", string>> = {
  buyer: {
    ar: `أنت "أوسا (AOSA)"، الرفيقة الذكية الاحترافية لمنصة NOORMEXA للتجارة الإلكترونية والتسوق الذكي (السعودية، مصر، الإمارات، والخليج).
مهمتك:
- مساعدة المتسوق في استكشاف وشراء المنتجات عبر التصنيفات الرئيسية: الإلكترونيات الذكية، أزياء فاخرة، عطور وساعات، مستلزمات المنزل، الرياضة، والسيارات.
- توضيح خيارات الدفع المتاحة: مدى (Mada)، بطاقات فيزا/ماستركارد، باي موب (Paymob)، سترايب (Stripe)، أبل باي، وتمارا / تابي للدفع الآجل، والدفع عند الاستلام.
- توضيح سياسة الشحن والتوصيل السريع (توصيل فوري نفس اليوم في المدن الرئيسية، أو 1-3 أيام مع أسطول نورمكسا، سمسا، أرامكس).
- توضيح ضمان الأصالة الذهبي وإمكانية الإرجاع والاستبدال السهل خلال 14 يوماً.
- أسلوبك ودود، راقٍ، مهني، مرح ولبق باللغة العربية.
- لا تخترع أسعاراً محددة لمنتجات غير موجودة، بل دل المتسوق على تصفح الأقسام أو البحث في شريط البحث العلوي.`,
    en: `You are AOSA, the smart and professional AI shopping companion for NOORMEXA e-commerce platform across the Middle East and worldwide (KSA, UAE, Egypt, Gulf).
Your mission:
- Help shoppers explore products across main categories: Electronics, Luxury Fashion, Perfumes & Watches, Home & Living, Sports, and Automotive.
- Explain accepted payment methods: Mada, Visa/Mastercard, Paymob, Stripe, Apple Pay, Tamara/Tabby BNPL, and Cash on Delivery.
- Explain shipping and logistics: Same-day express in major cities, 1-3 business days across KSA and GCC via NOORMEXA Fleet, SMSA, and Aramex.
- Explain the 100% Authenticity Guarantee and hassle-free 14-day return policy.
- Keep your tone polite, cheerful, concise, and helpful.`,
  },
  seller: {
    ar: `أنت "أوسا (AOSA)"، المستشارة التجارية الذكية لنورميكسا والمخصصة لمساعدة التجار والبائعين وأصحاب المتاجر على منصة NOORMEXA.
مهمتك:
- مساعدة التاجر في صياغة عناوين وأوصاف تسويقية احترافية وجذابة لمنتجاته لزيادة نسبة الشراء (Conversion Rate).
- تقديم نصائح عملية في تسعير المنتجات، تحسين الصور، إدارة المخزون، وتحسين تقييم المتجر.
- توضيح باقات التجار ونظام العمولات التنافسي (الباقة المجانية، الباقة الاحترافية، وباقة الشركات المعتمدة).
- إرشاد التاجر حول كيفية إطلاق حملات إعلانية ممولة داخل المنصة (ريلز فيديو ترويجي، بانرات رئيسية، ومنتجات مميزة).
- أسلوبك خبير بالتجارة الإلكترونية، محفز، مباشر وعملي.`,
    en: `You are AOSA, the smart commerce and merchant advisor for NOORMEXA.
Your mission:
- Assist sellers in writing high-converting product titles, bullet points, and compelling descriptions.
- Provide actionable e-commerce strategies for pricing, photography, inventory management, and customer ratings.
- Explain merchant tiers, commissions, and seller features (Free, Pro, and Enterprise Flagship).
- Guide merchants on launching high-impact sponsored campaigns (sponsored reels, homepage hero banners, featured deals).`,
  },
};

// Candidate models in prioritized order (fast, resilient models first)
const GEMINI_MODELS_CASCADE = [
  process.env.GEMINI_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
].filter(Boolean) as string[];

// In-memory key validity tracking to prevent repeated failing network calls on known invalid keys
const invalidKeyCache = new Map<string, { timestamp: number; reason: string }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function isKeyMarkedInvalid(key: string): { invalid: boolean; reason?: string } {
  const cached = invalidKeyCache.get(key);
  if (!cached) return { invalid: false };
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    invalidKeyCache.delete(key);
    return { invalid: false };
  }
  return { invalid: true, reason: cached.reason };
}

function markKeyInvalid(key: string, reason: string) {
  invalidKeyCache.set(key, { timestamp: Date.now(), reason });
}

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const isKeyMissing = !geminiKey || geminiKey === "undefined" || geminiKey.length < 8;
  const { invalid: isKeyInvalid, reason } = geminiKey ? isKeyMarkedInvalid(geminiKey) : { invalid: false };

  const isReadOnly = isKeyMissing || isKeyInvalid;

  return NextResponse.json({
    status: "healthy",
    mode: isReadOnly ? "read_only" : "live_ai",
    isReadOnly,
    provider: isReadOnly ? "aosa-core" : "google-gemini",
    keyConfigured: !isKeyMissing,
    keyValid: !isKeyInvalid,
    readOnlyReason: isKeyMissing ? "missing_key" : isKeyInvalid ? (reason || "invalid_key") : null,
    models: GEMINI_MODELS_CASCADE,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  let body: { messages?: ChatMessage[]; role?: "buyer" | "seller"; language?: "ar" | "en" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const role = body.role === "seller" ? "seller" : "buyer";
  const language = body.language === "en" ? "en" : "ar";
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "";

  if (messages.length === 0) {
    return NextResponse.json({ error: "لا توجد رسائل" }, { status: 400 });
  }

  const isGeminiMissing = !geminiKey || geminiKey === "undefined" || geminiKey.length < 8;
  const isGeminiCachedInvalid = geminiKey ? isKeyMarkedInvalid(geminiKey).invalid : false;

  // 1. If Google API key is missing or previously identified as invalid:
  // Immediately serve from AOSA Smart Read-Only Core with zero network latency
  if (isGeminiMissing || isGeminiCachedInvalid) {
    const reason = isGeminiMissing ? "missing_key" : "invalid_key";
    console.warn(`[AOSA] Operating in Smart Read-Only Mode (Reason: ${reason}).`);
    const aosaFallback = generateAosaResponse(lastUserMsg, role, language, reason);
    return NextResponse.json({
      reply: aosaFallback.reply,
      actions: aosaFallback.actions,
      model: "aosa-agent-core",
      isReadOnly: true,
      readOnlyReason: reason,
    });
  }

  // Pre-generate AOSA local intelligence fallback
  const aosaFallback = generateAosaResponse(lastUserMsg, role, language);
  const systemPrompt = SYSTEM_PROMPTS[role][language];

  try {
    let result: {
      text: string | null;
      debug?: string;
      modelUsed?: string;
      isKeyInvalid?: boolean;
      invalidReason?: string;
    } = { text: null };

    // 2. Try Google Gemini with multi-model cascade & early exit on invalid key
    result = await callGeminiWithFallback(geminiKey, systemPrompt, messages);

    // If Google API reported invalid key, switch directly to Read-Only mode without retrying
    if (result.isKeyInvalid) {
      console.warn("[AOSA] Google API Key is invalid. Switching smoothly to Smart Read-Only Mode.");
      const readOnlyFallback = generateAosaResponse(lastUserMsg, role, language, "invalid_key");
      return NextResponse.json({
        reply: readOnlyFallback.reply,
        actions: readOnlyFallback.actions,
        model: "aosa-agent-core",
        isReadOnly: true,
        readOnlyReason: "invalid_key",
      });
    }

    // 3. Secondary fallback to Anthropic if Gemini had transient network/demand errors
    if (result.text === null && anthropicKey) {
      console.warn("[AOSA] Gemini service unavailable, calling Anthropic fallback...");
      result = await callAnthropic(anthropicKey, systemPrompt, messages);
    }

    // 4. Autonomous Read-Only Fallback: If external AI is unreachable, NEVER fail to the user!
    if (result.text === null) {
      console.warn("[AOSA] External AI endpoints unreachable. AOSA Smart Read-Only Core engaged.");
      const readOnlyFallback = generateAosaResponse(lastUserMsg, role, language, "network_fallback");
      return NextResponse.json({
        reply: readOnlyFallback.reply,
        actions: readOnlyFallback.actions,
        model: "aosa-agent-core",
        isReadOnly: true,
        readOnlyReason: "network_fallback",
      });
    }

    // Live AI Success
    const actions = deriveActionsFromQuery(lastUserMsg, role, language, aosaFallback.actions);
    return NextResponse.json({
      reply: result.text || aosaFallback.reply,
      actions,
      model: result.modelUsed || "gemini",
      isReadOnly: false,
      readOnlyReason: null,
    });
  } catch (error) {
    console.error("[AOSA] Chat route exception, falling back to AOSA Core:", error);
    const readOnlyFallback = generateAosaResponse(lastUserMsg, role, language, "network_fallback");
    return NextResponse.json({
      reply: readOnlyFallback.reply,
      actions: readOnlyFallback.actions,
      model: "aosa-agent-core",
      isReadOnly: true,
      readOnlyReason: "network_fallback",
    });
  }
}

function deriveActionsFromQuery(
  q: string,
  role: "buyer" | "seller",
  lang: "ar" | "en",
  fallbackActions?: AgentAction[]
): AgentAction[] {
  const lower = q.toLowerCase();
  if (lower.includes("شحن") || lower.includes("تتبع") || lower.includes("طلب") || lower.includes("track")) {
    return [
      { label: lang === "ar" ? "تتبع طلباتي 📦" : "Track Orders 📦", href: "/orders" },
      { label: lang === "ar" ? "تصفح السوق 🛍️" : "Marketplace 🛍️", href: "/marketplace" },
    ];
  }
  if (lower.includes("دفع") || lower.includes("سلة") || lower.includes("pay") || lower.includes("cart")) {
    return [
      { label: lang === "ar" ? "سلة التسوق 🛒" : "Cart 🛒", href: "/cart" },
      { label: lang === "ar" ? "إتمام الشراء 💳" : "Checkout 💳", href: "/checkout" },
    ];
  }
  if (role === "seller" || lower.includes("متجر") || lower.includes("بائع") || lower.includes("store")) {
    return [
      { label: lang === "ar" ? "لوحة التاجر 🏪" : "Seller Dashboard 🏪", href: "/seller/dashboard" },
      { label: lang === "ar" ? "فتح متجر جديد 🚀" : "Open Store 🚀", href: "/seller/register" },
    ];
  }
  return fallbackActions || [
    { label: lang === "ar" ? "تصفح الأقسام 🛍️" : "Browse Catalog 🛍️", href: "/marketplace" },
  ];
}

async function callGeminiWithFallback(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{
  text: string | null;
  debug?: string;
  modelUsed?: string;
  isKeyInvalid?: boolean;
  invalidReason?: string;
}> {
  let lastError = "";

  for (const model of GEMINI_MODELS_CASCADE) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s strict timeout

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.7,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts as { text?: string }[] | undefined;
        const text = parts?.map((p) => p.text || "").join("").trim();
        if (text) {
          return { text, modelUsed: model, isKeyInvalid: false };
        }
      } else {
        const errText = await response.text();
        lastError = `Model ${model} (${response.status}): ${errText.slice(0, 120)}`;
        console.warn(`[AOSA] Gemini response error on ${model}:`, response.status);

        // Detect if API key itself is invalid or unauthorized
        const isKeyInvalid =
          errText.includes("API_KEY_INVALID") ||
          errText.includes("API key not valid") ||
          errText.includes("PERMISSION_DENIED") ||
          errText.includes("CONSUMER_INVALID") ||
          errText.includes("API_KEY_EXPIRED") ||
          errText.includes("UNAUTHENTICATED") ||
          (response.status === 400 && errText.includes("API key"));

        if (isKeyInvalid) {
          markKeyInvalid(apiKey, "invalid_key");
          console.warn("[AOSA] Key marked as invalid. Halting cascade immediately.");
          return {
            text: null,
            isKeyInvalid: true,
            invalidReason: "invalid_key",
            debug: lastError,
          };
        }
      }
    } catch (e: unknown) {
      clearTimeout(timeoutId);
      const errMsg = e instanceof Error ? e.message : String(e);
      lastError = `Exception with ${model}: ${errMsg}`;
      console.warn(`[AOSA] Gemini network exception on ${model}:`, errMsg);
    }
  }

  return { text: null, debug: lastError, isKeyInvalid: false };
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{ text: string | null; debug?: string; modelUsed?: string }> {
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        max_tokens: 600,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return { text: null, debug: `Anthropic ${response.status}: ${errText.slice(0, 200)}` };
    }

    const data = await response.json();
    const content = data.content as { type: string; text?: string }[] | undefined;
    return {
      text: content?.map((block) => block.text || "").join("") ?? "",
      modelUsed: `anthropic:${model}`,
    };
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    return { text: null, debug: String(e) };
  }
}

