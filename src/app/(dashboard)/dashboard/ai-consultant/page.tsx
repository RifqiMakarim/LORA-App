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
  Users 
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="space-y-6 pb-6 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* 1. Header Banner Selaras Dashboard LORA */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>LORA Business Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-outfit font-black text-slate-900 tracking-tight">
            AI Business Consultant
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Conversational BI Real-Time berbasis konteks data 360° toko &amp; event DIY-Jateng
          </p>
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
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          title="Reset Percakapan"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* 2. Quick Prompt Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              disabled={isStreaming}
              onClick={() => handleSendMessage(item.prompt)}
              className="p-3.5 bg-white border border-slate-200/90 hover:border-terracotta hover:bg-amber-50/20 rounded-2xl text-left transition-all text-xs group shadow-xs flex flex-col justify-between gap-2 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-amber-50 text-terracotta rounded-xl group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-terracotta transition-colors" />
              </div>
              <span className="font-bold text-slate-900 line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
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
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
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
          <div className="flex items-center gap-2 text-xs text-terracotta font-semibold animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI Consultant sedang menganalisis data &amp; merumuskan rekomendasi...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Chat Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="flex items-center gap-2 bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm"
      >
        <input 
          type="text"
          placeholder="Tanyakan analisis keuangan, rekomendasi stok ROP, atau event daerah..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isStreaming}
          className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isStreaming}
          className="p-3 bg-terracotta hover:bg-terracotta-hover disabled:opacity-40 text-white rounded-2xl shadow-md shadow-terracotta/25 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
