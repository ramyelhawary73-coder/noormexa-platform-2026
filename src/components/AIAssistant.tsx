"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bot, Send, Sparkles, Store as StoreIcon, User, X } from "lucide-react";
import { useNoormexaLanguage } from "@/lib/useLanguage";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Mode = "buyer" | "seller";

const copy = {
  ar: {
    title: "مساعد NOORMEXA",
    buyerMode: "متسوق",
    sellerMode: "بائع",
    placeholder: "اكتب سؤالك هنا...",
    send: "إرسال",
    intro: "أهلًا! أنا مساعد NOORMEXA الذكي. اسألني عن أي منتج، متجر، أو تفاصيل البيع والاشتراك.",
    error: "حصل خطأ، حاول تاني.",
    notConfigured: "المساعد الذكي غير مفعّل بعد على هذه النسخة.",
    thinking: "بيفكر...",
  },
  en: {
    title: "NOORMEXA Assistant",
    buyerMode: "Shopper",
    sellerMode: "Seller",
    placeholder: "Type your question...",
    send: "Send",
    intro: "Hi! I'm the NOORMEXA AI assistant. Ask me about products, stores, or selling and plans.",
    error: "Something went wrong, please try again.",
    notConfigured: "The AI assistant isn't enabled on this deployment yet.",
    thinking: "Thinking...",
  },
} as const;

export default function AIAssistant() {
  const language = useNoormexaLanguage();
  const text = copy[language];
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [userMode, setUserMode] = useState<Mode | null>(null);
  const mode: Mode =
    userMode ?? (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin") ? "seller" : "buyer");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const value = input.trim();
    if (!value || sending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, role: mode, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        const base = res.status === 503 ? text.notConfigured : data.error || text.error;
        const withDebug = data.debug ? `${base}\n\n[Debug]: ${data.debug}` : base;
        setMessages((prev) => [...prev, { role: "assistant", content: withDebug }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: text.error }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="noormexa-ai-widget">
      {open && (
        <div className="noormexa-ai-panel">
          <div className="noormexa-ai-panel-header">
            <div className="noormexa-ai-panel-title">
              <Sparkles size={18} />
              <span>{text.title}</span>
            </div>
            <button type="button" className="noormexa-icon-button" onClick={() => setOpen(false)} aria-label="close">
              <X size={18} />
            </button>
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
            {messages.length === 0 && <p className="noormexa-ai-intro">{text.intro}</p>}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`noormexa-ai-bubble${message.role === "user" ? " noormexa-ai-bubble-user" : ""}`}
              >
                {message.content}
              </div>
            ))}
            {sending && <div className="noormexa-ai-bubble noormexa-ai-thinking">{text.thinking}</div>}
          </div>

          <div className="noormexa-ai-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={text.placeholder}
              disabled={sending}
            />
            <button type="button" onClick={handleSend} disabled={sending || !input.trim()} aria-label={text.send}>
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
