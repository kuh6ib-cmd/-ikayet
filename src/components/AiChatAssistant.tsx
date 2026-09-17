import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  Loader2,
  Car,
  TrendingDown,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { ComplaintItem } from "../types";

interface AiChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: ComplaintItem[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  isOpen,
  onClose,
  complaints,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Merhaba! Ben Otomotiv Şikayet & Servis Analistinizim. Veri setinizdeki kronik arızalar, servis fatura sapmaları, hatalı teşhisler ve marka/motor analitiği ile ilgili her türlü sorunuzu anında yanıtlayabilirim.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "1.5 BlueHDi motorlarda en sık görülen arıza ve KM aralığı nedir?",
    "Hangi servisler en yüksek fatura sapmasına sahip?",
    "Hatalı arıza tespiti ve montaj kusurları ne kadar mali kayba yol açmış?",
    "Filolardaki en maliyetli 3 kronik problem nedir?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: messageText },
    ];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          contextData: {
            totalComplaints: complaints.length,
            sampleComplaints: complaints.slice(0, 25),
          },
        }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply || "Yanıt oluşturulurken bir sorun oluştu.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Analiz yanıtı oluşturulurken bağlantı hatası oluştu. Lütfen tekrar deneyiniz.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-md h-[560px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">AI Şikayet Analisti</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">Canlı Otomotiv & Servis Danışmanı</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 hover:border-indigo-400 hover:text-indigo-800 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none shadow-xs font-medium"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs whitespace-pre-wrap"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center gap-2 text-xs shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analist yanıt hazırlıyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          id="input-chat-message"
          type="text"
          placeholder="Şikayetler, motorlar veya servisler hakkında sorun..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 text-slate-900"
        />
        <button
          id="btn-send-chat"
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
