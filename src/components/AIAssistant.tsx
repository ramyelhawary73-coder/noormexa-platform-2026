"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bot, Send, Sparkles, Store as StoreIcon, User, X, RotateCcw } from "lucide-react";
import { useNoormexaLanguage } from "@/lib/useLanguage";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Mode = "buyer" | "seller";

const copy = {
  ar: {
    title: "مساعد NOORMEXA الذكي",
    statusBadge: "Google Gemini 3.6 Flash",
    buyerMode: "متسوق",
    sellerMode: "بائع / تاجر",
    placeholder: "اكتب استفسارك هنا...",
    send: "إرسال",
    intro: "أهلاً بك! أنا مساعد NOORMEXA الذكي. جاهز لمساعدتك في استكشاف المنتجات، خيارات الدفع، تتبع الشحن، أو إطلاق متجرك.",
    clear: "محادثة جديدة",
    error: "حدث خطأ مؤقت، يرجى المحاولة مرة أخرى.",
    notConfigured: "المساعد الذكي غير مفعّل بعد في بيئة التشغيل الحالية.",
    thinking: "جاري التفكير وصياغة الرد...",
    buyerSuggestions: [
      "ما هي طرق الدفع المتاحة في المنصة؟",
      "كيف يعمل الشحن السريع والتوصيل؟",
      "ما هي سياسة الضمان والاسترجاع؟",
      "أريد ترشيحاً لأفضل المنتجات التقنية.",
    ],
    sellerSuggestions: [
      "كيف أبدأ وأفتح متجر جديد في نورمكسا؟",
      "ساعدني في كتابة وصف تسويقي لمنتجي.",
      "ما هي باقات الاشتراك والعمولات للتجار؟",
      "كيف أطلق حملة إعلانات ريلز ممولة؟",
    ],
  },
  en: {
    title: "NOORMEXA AI Assistant",
    statusBadge: "Google Gemini 3.6 Flash",
    buyerMode: "Shopper",
    sellerMode: "Seller / Merchant",
    placeholder: "Ask me anything...",
    send: "Send",
    intro: "Welcome! I am the NOORMEXA AI Assistant. I can help you discover products, payment options, express shipping, or growing your store.",
    clear: "New Chat",
    error: "Something went wrong, please try again.",
    notConfigured: "The AI assistant isn't enabled on this deployment yet.",
    thinking: "Thinking and drafting response...",
    buyerSuggestions: [
      "What payment methods are supported?",
      "How does express delivery work?",
      "What is the return and guarantee policy?",
      "Suggest top trending tech products.",
    ],
    sellerSuggestions: [
      "How do I set up a store on NOORMEXA?",
      "Help me write a compelling product description.",
      "What are the merchant tiers and fees?",
      "How do sponsored reels campaigns work?",
    ],
  },
} as const;

export default function AIAssistant() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [userMode, setUserMode] = useState<Mode | null>(null);
  const mode: Mode =
    userMode ?? (pathname?.startsWith("/dashboard") || pathname?.startsWith("/seller") || pathname?.startsWith("/admin") ? "seller" : "buyer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  const handleSend = async (customPrompt?: string) => {
    const value = (customPrompt ?? input).trim();
    if (!value || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(nextMessages);
    if (!customPrompt) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, role: mode, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        const friendly = res.status === 503 ? text.notConfigured : (data.error || text.error);
        setMessages((prev) => [...prev, { role: "assistant", content: friendly }]);
        if (data.debug) console.error("AI assistant error:", data.debug);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: text.error }]);
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    if (sending) return;
    setMessages([]);
    setInput("");
  };

  const suggestions = mode === "seller" ? text.sellerSuggestions : text.buyerSuggestions;

  return (
    <div className="noormexa-ai-widget">
      {open && (
        <div className="noormexa-ai-panel">
          <div className="noormexa-ai-panel-header">
            <div className="noormexa-ai-panel-title">
              <Sparkles size={18} className="text-gold" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">{text.title}</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {text.statusBadge}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="noormexa-icon-button"
                  onClick={handleClear}
                  title={text.clear}
                  aria-label={text.clear}
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                type="button"
                className="noormexa-icon-button"
                onClick={() => setOpen(false)}
                aria-label="close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="noormexa-ai-mode-switch">
            <button
              type="button"
              className={`noormexa-ai-mode-button${mode === "buyer" ? " noormexa-ai-mode-active" : ""}`}
              onClick={() => setUserMode("buyer")}
            >
              <User size={14} />
              {text.buyerMode}
            </button>
            <button
              type="button"
              className={`noormexa-ai-mode-button${mode === "seller" ? " noormexa-ai-mode-active" : ""}`}
              onClick={() => setUserMode("seller")}
            >
              <StoreIcon size={14} />
              {text.sellerMode}
            </button>
          </div>

          <div className="noormexa-ai-messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="noormexa-ai-intro">{text.intro}</p>
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-muted block">
                    {language === "ar" ? "أسئلة مقترحة سريعة:" : "Suggested quick questions:"}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(s)}
                        disabled={sending}
                        className="text-start text-xs p-2 rounded-xl bg-surface-soft hover:bg-gold/10 border border-line hover:border-gold/30 text-foreground transition-all cursor-pointer"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`noormexa-ai-bubble${message.role === "user" ? " noormexa-ai-bubble-user" : ""}`}
              >
                {message.content}
              </div>
            ))}
            {sending && (
              <div className="noormexa-ai-bubble noormexa-ai-thinking flex items-center gap-2">
                <span className="animate-spin text-gold text-xs">✨</span>
                <span>{text.thinking}</span>
              </div>
            )}
          </div>

          <div className="noormexa-ai-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={text.placeholder}
              disabled={sending}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              aria-label={text.send}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="noormexa-ai-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label={text.title}
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>
    </div>
  );
}
