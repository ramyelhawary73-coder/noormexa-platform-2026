"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Send, Store as StoreIcon, User, X, RotateCcw } from "lucide-react";
import { useNoormexaLanguage } from "@/lib/useLanguage";
import AosaAvatar from "@/components/AosaAvatar";
import { generateAosaResponse, type AgentAction } from "@/lib/aosaAgent";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: AgentAction[];
};
type Mode = "buyer" | "seller";

const copy = {
  ar: {
    title: "أوسا (AOSA)",
    slogan: "رفيقتكِ الذكية للتسوق وإدارة تجارتكِ",
    statusBadgeLive: "متصلة بالذكاء السحابي 🟢",
    statusBadgeReadOnly: "وضع القراءة والاستفسار الذكي 🟡",
    readOnlyBanner: "AOSA تعمل في وضع القراءة والاستفسار المستقل: الكتالوج والشحن والدفع متاح 100%",
    statusBadge: "متصلة الآن 🟢",
    buyerMode: "متسوق",
    sellerMode: "بائع / تاجر",
    placeholder: "اسألي أوسا عن أي شيء في المنصة...",
    send: "إرسال",
    intro: "أهلاً بك! أنا أوسا (AOSA)، رفيقتكِ الذكية في NOORMEXA ✨ جاهزة لمساعدتك في استكشاف أفضل المنتجات، خيارات الدفع والتقسيط، الشحن السريع لنفس اليوم، أو إطلاق متجرك ومضاعفة مبيعاتك!",
    clear: "محادثة جديدة",
    thinking: "أوسا تصيغ لك الرد المناسب...",
    suggestionsTitle: "أسئلة شائعة مقترحة:",
    buyerSuggestions: [
      "كيف يعمل الشحن السريع والتوصيل؟",
      "ما هي طرق الدفع وخيارات التقسيط المتاحة؟",
      "ما هي سياسة الضمان الذهبي والاسترجاع؟",
      "رشحي لي أفضل المنتجات والخصومات الحالية.",
    ],
    sellerSuggestions: [
      "كيف أفتح متجر جديد وأبدأ البيع في نورمكسا؟",
      "ساعديني في كتابة وصف تسويقي احترافي لمنتجي.",
      "ما هي باقات التجار ونظام العمولات؟",
      "كيف أطلق فيديو ريلز تسويقي لزيادة المبيعات؟",
    ],
  },
  en: {
    title: "AOSA Agent",
    slogan: "Your Smart Shopping & Commerce Companion",
    statusBadgeLive: "Cloud AI Live 🟢",
    statusBadgeReadOnly: "Smart Read-Only Mode 🟡",
    readOnlyBanner: "AOSA operating in Smart Read-Only Mode: Catalog, delivery & payments 100% active",
    statusBadge: "Online & Ready 🟢",
    buyerMode: "Shopper",
    sellerMode: "Seller / Merchant",
    placeholder: "Ask AOSA anything about NOORMEXA...",
    send: "Send",
    intro: "Welcome! I am AOSA, your smart shopping & commerce companion on NOORMEXA ✨ Ready to help you discover deals, flexible payments & installments, same-day delivery, or launching and growing your store!",
    clear: "New Chat",
    thinking: "AOSA is preparing your answer...",
    suggestionsTitle: "Suggested Quick Questions:",
    buyerSuggestions: [
      "How does express delivery and shipping work?",
      "What are the supported payment & installment methods?",
      "What is the 100% authenticity guarantee & return policy?",
      "Suggest the best trending categories & deals.",
    ],
    sellerSuggestions: [
      "How do I open a new store and start selling?",
      "Help me write a compelling product description.",
      "What are the merchant tiers and commission rates?",
      "How do I launch promotional reels to boost sales?",
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
    userMode ??
    (pathname?.startsWith("/dashboard") || pathname?.startsWith("/seller") || pathname?.startsWith("/admin")
      ? "seller"
      : "buyer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [, setReadOnlyReason] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Proactively check connection status & operational mode on mount
  useEffect(() => {
    let ignore = false;
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data && typeof data.isReadOnly === "boolean") {
          setIsReadOnly(data.isReadOnly);
          if (data.readOnlyReason) setReadOnlyReason(data.readOnlyReason);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsReadOnly(true);
          setReadOnlyReason("network_fallback");
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

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

      if (res.ok) {
        const data = await res.json();
        if (typeof data.isReadOnly === "boolean") {
          setIsReadOnly(data.isReadOnly);
          setReadOnlyReason(data.readOnlyReason || null);
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, actions: data.actions },
        ]);
      } else {
        // Zero-failure fallback: If server returns error, AOSA Local Core answers immediately in read-only mode
        setIsReadOnly(true);
        setReadOnlyReason("network_fallback");
        const fallback = generateAosaResponse(value, mode, language, "network_fallback");
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fallback.reply, actions: fallback.actions },
        ]);
      }
    } catch {
      // Offline / network exception fallback: AOSA answers immediately in read-only mode
      setIsReadOnly(true);
      setReadOnlyReason("network_fallback");
      const fallback = generateAosaResponse(value, mode, language, "network_fallback");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallback.reply, actions: fallback.actions },
      ]);
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
          {/* Mobile Drag/Pull Indicator Bar (Visible on mobile screens) */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-navy">
            <div className="w-10 h-1 rounded-full bg-white/30" />
          </div>

          {/* Header with AOSA Avatar & Professional Slogan */}
          <div className="noormexa-ai-panel-header">
            <div className="flex items-center gap-2.5 min-w-0">
              <AosaAvatar size={42} showOnlineBadge={true} badgeStatus={isReadOnly ? "readonly" : "online"} />
              <div className="flex flex-col min-w-0">
                <span className="font-black text-sm text-white tracking-wide truncate">{text.title}</span>
                <span className="text-[11px] text-amber-300/90 font-medium line-clamp-1">
                  {text.slogan}
                </span>
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold mt-0.5 ${
                    isReadOnly ? "text-amber-300" : "text-emerald-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${
                      isReadOnly ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  {isReadOnly ? text.statusBadgeReadOnly : text.statusBadgeLive}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="noormexa-icon-button hover:text-amber-400 transition-colors p-2 cursor-pointer"
                  onClick={handleClear}
                  title={text.clear}
                  aria-label={text.clear}
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                type="button"
                className="noormexa-icon-button hover:text-red-400 transition-colors p-2 cursor-pointer active:scale-95"
                onClick={() => setOpen(false)}
                aria-label="close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mode switch */}
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

          {/* Read-Only Mode Banner */}
          {isReadOnly && (
            <div className="mx-3.5 my-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-center gap-2 font-medium leading-relaxed shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
              <span>{text.readOnlyBanner}</span>
            </div>
          )}

          {/* Messages list */}
          <div className="noormexa-ai-messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <AosaAvatar size={32} showOnlineBadge={false} className="mt-1 flex-shrink-0" />
                  <div className="noormexa-ai-bubble leading-relaxed text-xs">
                    {text.intro}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-line/60">
                  <span className="text-[11px] font-bold text-muted block px-1">
                    {text.suggestionsTitle}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(s)}
                        disabled={sending}
                        className="text-start text-xs p-2.5 rounded-xl bg-surface-soft hover:bg-amber-500/10 border border-line hover:border-amber-500/40 text-foreground transition-all cursor-pointer font-medium"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              if (message.role === "user") {
                return (
                  <div key={index} className="noormexa-ai-bubble noormexa-ai-bubble-user text-xs leading-relaxed">
                    {message.content}
                  </div>
                );
              }

              return (
                <div key={index} className="flex items-start gap-2 max-w-[95%] self-start">
                  <AosaAvatar size={28} showOnlineBadge={false} className="mt-1 flex-shrink-0" />
                  <div className="flex flex-col gap-2 w-full">
                    <div className="noormexa-ai-bubble text-xs leading-relaxed whitespace-pre-line">
                      {message.content}
                    </div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {message.actions.map((action, aIdx) => (
                          <Link
                            key={aIdx}
                            href={action.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start gap-2 self-start">
                <AosaAvatar size={28} showOnlineBadge={false} className="mt-1 flex-shrink-0 animate-pulse" />
                <div className="noormexa-ai-bubble noormexa-ai-thinking flex items-center gap-2 text-xs">
                  <span className="animate-spin text-amber-500 text-sm">✨</span>
                  <span>{text.thinking}</span>
                </div>
              </div>
            )}
          </div>

          {/* Input field */}
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
              className="hover:text-amber-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) displaying AOSA Avatar */}
      <button
        type="button"
        className="noormexa-ai-fab group transition-transform hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        aria-label={text.title}
        title={isReadOnly ? `${text.title} - ${text.statusBadgeReadOnly}` : `${text.title} - ${text.statusBadgeLive}`}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <AosaAvatar size={48} showOnlineBadge={true} badgeStatus={isReadOnly ? "readonly" : "online"} />
        )}
      </button>
    </div>
  );
}

