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

// Candidate models in prioritized order
const GEMINI_MODELS_CASCADE = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

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

  // Pre-generate AOSA local intelligence fallback
  const aosaFallback = generateAosaResponse(lastUserMsg, role, language);

  // If no cloud AI keys exist, immediately use AOSA Agent Core
  if (!geminiKey && !anthropicKey) {
    return NextResponse.json({
      reply: aosaFallback.reply,
      actions: aosaFallback.actions,
      model: "aosa-agent-core",
    });
  }

  const systemPrompt = SYSTEM_PROMPTS[role][language];

  try {
    let result: { text: string | null; debug?: string; modelUsed?: string } = { text: null };

    // 1. Try Google Gemini with multi-model cascade & timeout protection
    if (geminiKey) {
      result = await callGeminiWithFallback(geminiKey, systemPrompt, messages);
    }

    // 2. Secondary fallback to Anthropic if Gemini failed
    if (result.text === null && anthropicKey) {
      console.warn("Gemini cascade failed, calling Anthropic...");
      result = await callAnthropic(anthropicKey, systemPrompt, messages);
    }

    // 3. Autonomous Fallback: If both fail, NEVER fail to the user!
    // Hand over smoothly to AOSA Autonomous Agent Core
    if (result.text === null) {
      console.warn("External AI endpoints failed/delayed. AOSA local core engaged seamlessly.");
      return NextResponse.json({
        reply: aosaFallback.reply,
        actions: aosaFallback.actions,
        model: "aosa-agent-core",
      });
    }

    // Derive contextual actions for the user
    const actions = deriveActionsFromQuery(lastUserMsg, role, language, aosaFallback.actions);

    return NextResponse.json({
      reply: result.text || aosaFallback.reply,
      actions,
      model: result.modelUsed || "aosa-agent",
    });
  } catch (error) {
    console.error("Chat route error, falling back to AOSA Core:", error);
    return NextResponse.json({
      reply: aosaFallback.reply,
      actions: aosaFallback.actions,
      model: "aosa-agent-core",
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
): Promise<{ text: string | null; debug?: string; modelUsed?: string }> {
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
          return { text, modelUsed: model };
        }
      } else {
        const errText = await response.text();
        lastError = `Model ${model} (${response.status}): ${errText.slice(0, 120)}`;
        console.warn(`Gemini cascade fallback from ${model}:`, response.status);
      }
    } catch (e: unknown) {
      clearTimeout(timeoutId);
      const errMsg = e instanceof Error ? e.message : String(e);
      lastError = `Exception with ${model}: ${errMsg}`;
      console.warn(`Gemini network exception on ${model}:`, errMsg);
    }
  }

  return { text: null, debug: lastError };
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

