import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPTS: Record<"buyer" | "seller", Record<"ar" | "en", string>> = {
  buyer: {
    ar: "إنت المساعد الذكي لمنصة NOORMEXA، سوق إلكتروني عالمي للتسوق والبيع والإعلانات. مهمتك مساعدة المتسوق: افهم اللي بيدور عليه، رشحله تصنيفات أو منتجات مناسبة من السوق، جاوبه على أسئلة عن الشراء والدفع والتوصيل بشكل عام، وكن ودود ومختصر. لو سأل حاجة تقنية عن حسابه (زي مشكلة فى الدفع الفعلي) وضّح إنه يتواصل مع دعم المتجر مباشرة. ماتخترعش أسعار أو منتجات وهمية.",
    en: "You are the AI assistant for NOORMEXA, a global e-commerce marketplace for shopping, selling, and ads. Help the shopper: understand what they're looking for, suggest relevant categories or products, answer general questions about buying, payment, and delivery, and be friendly and concise. If they ask about an account-specific issue (like an actual payment problem), tell them to contact the store's support directly. Never invent fake prices or products.",
  },
  seller: {
    ar: "إنت المساعد الذكي لمنصة NOORMEXA، وبتساعد البائعين والمتاجر. مهمتك: ساعد البائع يكتب وصف احترافي وجذاب لمنتجاته، اديله نصايح عملية لتحسين متجره وزيادة مبيعاته، واشرحله بشكل عام نظام العمولة والباقات (أساسية/احترافية/متجر) لو سأل. كن عملي ومباشر ومختصر. ماتقدمش وعود بأرباح أو نتائج مضمونة.",
    en: "You are the AI assistant for NOORMEXA, helping sellers and stores. Help the seller write a compelling, professional product description, give practical tips to improve their store and increase sales, and explain the commission/plans system (basic/professional/store) in general terms if asked. Be practical, direct, and concise. Never promise guaranteed profits or results.",
  },
};

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!geminiKey && !anthropicKey) {
    return NextResponse.json(
      { error: "المساعد الذكي غير مفعّل بعد. أضف GEMINI_API_KEY (مجاني) أو ANTHROPIC_API_KEY فى متغيرات البيئة." },
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
    // نفضّل Gemini (مجاني) لو متاح، وإلا نستخدم Anthropic
    const reply = geminiKey
      ? await callGemini(geminiKey, systemPrompt, messages)
      : await callAnthropic(anthropicKey!, systemPrompt, messages);

    if (reply === null) {
      return NextResponse.json({ error: "تعذر الوصول للمساعد الذكي حاليًا" }, { status: 502 });
    }

    return NextResponse.json({ reply: reply || "..." });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

async function callGemini(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string | null> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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
      generationConfig: { maxOutputTokens: 500 },
    }),
  });

  if (!response.ok) {
    console.error("Gemini API error:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts as { text?: string }[] | undefined;
  return parts?.map((p) => p.text || "").join("") ?? "";
}

async function callAnthropic(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string | null> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    console.error("Anthropic API error:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const content = data.content as { type: string; text?: string }[] | undefined;
  return content?.map((block) => block.text || "").join("") ?? "";
}
