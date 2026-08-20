'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  ChevronDown 
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: 'Kesehatan & Omzet Bisnis',
    prompt: 'Bagaimana kondisi finansial, omzet 30 hari, dan kesehatan bisnis saya bulan ini?',
  },
  {
    icon: AlertTriangle,
    label: 'Restock Stok ROP',
    prompt: 'Produk apa saja yang berisiko kehabisan stok menjelang event kebudayaan terdekat?',
  },
  {
    icon: Users,
    label: 'Strategi Pelanggan At Risk',
    prompt: 'Bagaimana saran langkah menangani segmen pelanggan At Risk yang sudah lama tidak belanja?',
  },
  {
    icon: ShoppingBag,
    label: 'Rekomendasi Event Daerah',
    prompt: 'Apa agenda event lokal DIY-Jateng terdekat dan bagaimana persiapan promosi produk saya?',
  },
];

export default function AiConsultantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: 'Sugeng tinemu! Saya adalah **LORA AI Business Consultant**. Saya telah menganalisis data keuangan, stok inventori, segmen pelanggan RFM, dan kalender event DIY-Jateng toko Anda. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isStreaming) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsStreaming(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (!response.body) {
        throw new Error('No response body stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMsgId 
              ? { ...msg, content: msg.content + chunkText } 
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Error streaming AI response:', err);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMsgId 
            ? { ...msg, content: 'Mohon maaf, terjadi kendala koneksi ke server AI Consultant. Silakan coba lagi.' } 
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-7.5rem)] min-h-[580px] gap-3 pb-2">
      {/* 1. Header Banner Selaras Dashboard LORA (Compact & Modern) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-6 sm:py-3.5 shadow-xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-terracotta shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-terracotta" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-outfit font-black text-slate-900 tracking-tight leading-none">
                AI Business Consultant
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
              Analisis Penjualan, Stok ROP, Segmen Pelanggan &amp; Event DIY-Jateng
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setMessages([{
              id: 'welcome-msg',
              sender: 'assistant',
              content: 'Percakapan telah direset. Silakan ajukan pertanyaan bisnis baru!',
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            }]);
          }}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Reset Percakapan"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* 2. Quick Prompt Chips (Sleek Horizontal Scroll Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" /> Saran Cepat:
        </span>
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              disabled={isStreaming}
              onClick={() => handleSendMessage(item.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50/80 border border-slate-200/90 hover:border-amber-300 text-slate-700 hover:text-amber-950 rounded-xl text-xs font-semibold transition-all shadow-2xs whitespace-nowrap shrink-0 group cursor-pointer disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-terracotta group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Chat Container with Floating Input */}
      <div className="relative flex-1 flex flex-col min-h-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Messages List Area */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-28 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser 
                    ? 'bg-gradient-to-tr from-terracotta to-amber-500 text-white font-bold text-xs' 
                    : 'bg-slate-900 text-amber-400 border border-slate-800'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-terracotta text-white rounded-tr-xs shadow-md font-medium' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                  <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-amber-200' : 'text-slate-400 font-mono'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-terracotta font-semibold animate-pulse py-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI Consultant sedang menganalisis data &amp; merumuskan rekomendasi...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ambient Gradient Mask at Bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/85 to-transparent z-10" />

        {/* Floating Scroll to Bottom Jump Button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 sm:bottom-24 right-4 sm:right-6 z-30 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-1.5 text-xs font-semibold cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Pesan Terbaru</span>
          </button>
        )}

        {/* 4. Floating Chat Input Bar (Always Accessible & Elevated) */}
        <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 pl-3 sm:pl-4 rounded-2xl sm:rounded-3xl border border-slate-300/80 hover:border-terracotta/50 focus-within:border-terracotta shadow-xl shadow-slate-900/8 focus-within:ring-4 focus-within:ring-amber-500/15 transition-all"
          >
            <input 
              type="text"
              placeholder="Tanyakan analisis keuangan, rekomendasi stok ROP, atau event daerah..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isStreaming}
              className="flex-1 bg-transparent py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isStreaming}
              className="p-2.5 sm:p-3 bg-terracotta hover:bg-terracotta-hover disabled:opacity-40 text-white rounded-xl sm:rounded-2xl shadow-md shadow-terracotta/25 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
