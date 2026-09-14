import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPTS: Record<"buyer" | "seller", Record<"ar" | "en", string>> = {
  buyer: {
    ar: `أنت "مساعد نورميكسا الذكي" لمنصة NOORMEXA للتجارة الإلكترونية والتسوق الذكي في الشرق الأوسط والعالم (السعودية، مصر، الإمارات، والخليج).
مهمتك:
- مساعدة المتسوق في استكشاف وشراء المنتجات عبر التصنيفات الرئيسية: الإلكترونيات الذكية، أزياء فاخرة، عطور وساعات، مستلزمات المنزل، الرياضة، والسيارات.
- توضيح خيارات الدفع المتاحة: مدى (Mada)، بطاقات فيزا/ماستركارد، باي موب (Paymob)، سترايب (Stripe)، أبل باي، وتمارا / تابي للدفع الآجل، والدفع عند الاستلام.
- توضيح سياسة الشحن والتوصيل السريع (توصيل فوري نفس اليوم في المدن الرئيسية، أو 1-3 أيام مع أسطول نورمكسا، سمسا، أرامكس).
- توضيح ضمان الأصالة الذهبي وإمكانية الإرجاع والاستبدال السهل خلال 14 يوماً.
- أسلوبك ودود، راقٍ، مهني، ومختصر باللغة العربية (أو الإنجليزية إن سأل بالإنجليزية).
- لا تخترع أسعاراً محددة لمنتجات غير موجودة، بل دل المتسوق على تصفح الأقسام أو البحث في شريط البحث العلوي.`,
    en: `You are the NOORMEXA AI Assistant for the NOORMEXA e-commerce platform across the Middle East and worldwide (KSA, UAE, Egypt, Gulf).
Your mission:
- Help shoppers explore products across main categories: Electronics, Luxury Fashion, Perfumes & Watches, Home & Living, Sports, and Automotive.
- Explain accepted payment methods: Mada, Visa/Mastercard, Paymob, Stripe, Apple Pay, Tamara/Tabby BNPL, and Cash on Delivery.
- Explain shipping and logistics: Same-day express in major cities, 1-3 business days across KSA and GCC via NOORMEXA Fleet, SMSA, and Aramex.
- Explain the 100% Authenticity Guarantee and hassle-free 14-day return policy.
- Keep your tone polite, helpful, concise, and professional.
- Do not invent exact arbitrary prices; guide users to browse the catalog or use the search bar.`,
  },
  seller: {
    ar: `أنت "المستشار التجاري الذكي لنورميكسا" والمخصص لمساعدة التجار والبائعين وأصحاب المتاجر على منصة NOORMEXA.
مهمتك:
- مساعدة التاجر في صياغة عناوين وأوصاف تسويقية احترافية وجذابة لمنتجاته لزيادة نسبة الشراء (Conversion Rate).
- تقديم نصائح عملية في تسعير المنتجات، تحسين الصور، إدارة المخزون، وتحسين تقييم المتجر.
- توضيح باقات التجار ونظام العمولات التنافسي (الباقة المجانية، الباقة الاحترافية، وباقة الشركات المعتمدة).
- إرشاد التاجر حول كيفية إطلاق حملات إعلانية ممولة داخل المنصة (ريلز فيديو ترويجي، بانرات رئيسية، ومنتجات مميزة).
- أسلوبك خبير بالتجارة الإلكترونية، محفز، مباشر وعملي، وتجنب الوعود الخيالية أو المبالغ بها.`,
    en: `You are the NOORMEXA Merchant & Seller AI Advisor, dedicated to empowering merchants and store owners on NOORMEXA.
Your mission:
- Assist sellers in writing high-converting product titles, bullet points, and compelling descriptions.
- Provide actionable e-commerce strategies for pricing, photography, inventory management, and customer ratings.
- Explain merchant tiers, commissions, and seller features (Free, Pro, and Enterprise Flagship).
- Guide merchants on launching high-impact sponsored campaigns (sponsored reels, homepage hero banners, featured deals).
- Maintain an expert, inspiring, and concise business tone.`,
  },
};

// Candidate models in prioritized order to ensure 100% uptime with zero single point of failure
const GEMINI_MODELS_CASCADE = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return NextResponse.json(
      { error: "المساعد الذكي غير مفعّل بعد. يرجى توفير مفتاح GEMINI_API_KEY في النظام." },
      { status: 503 }
    );
  }

  let body: { messages?: ChatMessage[]; role?: "buyer" | "seller"; language?: "ar" | "en" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const role = body.role === "seller" ? "seller" : "buyer";
  const language = body.language === "en" ? "en" : "ar";
  const systemPrompt = SYSTEM_PROMPTS[role][language];

  if (messages.length === 0) {
    return NextResponse.json({ error: "لا توجد رسائل" }, { status: 400 });
  }

  try {
    // Prefer Gemini with automatic multi-model cascading fallback
    let result: { text: string | null; debug?: string; modelUsed?: string } = { text: null };

    if (geminiKey) {
      result = await callGeminiWithFallback(geminiKey, systemPrompt, messages);
    }

    // Secondary fallback to Anthropic if Gemini failed or is unavailable
    if (result.text === null && anthropicKey) {
      console.warn("Falling back to Anthropic...");
      result = await callAnthropic(anthropicKey, systemPrompt, messages);
    }

    if (result.text === null) {
      return NextResponse.json(
        {
          error: language === "ar"
            ? "نواجه ضغطاً لحظياً على خوادم الذكاء الاصطناعي، يرجى إعادة المحاولة بعد لحظات."
            : "AI service is momentarily busy, please try again in a moment.",
          debug: result.debug,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: result.text || "...", model: result.modelUsed });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع", debug: String(error) }, { status: 500 });
  }
}

async function callGeminiWithFallback(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{ text: string | null; debug?: string; modelUsed?: string }> {
  let lastError = "";

  // Try each model in the cascade until one succeeds
  for (const model of GEMINI_MODELS_CASCADE) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
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

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts as { text?: string }[] | undefined;
        const text = parts?.map((p) => p.text || "").join("").trim();
        if (text) {
          return { text, modelUsed: model };
        }
      } else {
        const errText = await response.text();
        lastError = `Model ${model} (${response.status}): ${errText.slice(0, 150)}`;
        console.warn(`Gemini cascade fallback from ${model}:`, response.status);
      }
    } catch (e: unknown) {
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
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

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
}
