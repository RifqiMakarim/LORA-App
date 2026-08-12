'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  RefreshCw, 
  HelpCircle, 
  ShoppingBag, 
  AlertTriangle, 
  TrendingUp, 
  Users 
} from 'lucide-react';

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
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-900 text-amber-400 rounded-2xl shadow-md border border-indigo-700">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              AI Business Consultant
            </h1>
            <p className="text-xs text-slate-500">
              Conversational BI Real-Time berbasis konteks data 360° toko & event DIY-Jateng.
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
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Reset Percakapan"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              disabled={isStreaming}
              onClick={() => handleSendMessage(item.prompt)}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:border-amber-500 dark:hover:border-amber-500 transition-all text-xs group shadow-sm flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <Sparkles className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-amber-500" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isUser 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-indigo-900 text-amber-400 border border-indigo-700'
              }`}>
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-amber-600 text-white rounded-tr-xs shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-800'
              }`}>
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-amber-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 italic animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>AI Consultant sedang berpikir & menyusun rekomendasi...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <input 
          type="text"
          placeholder="Tanyakan analisis keuangan, rekomendasi stok, atau event DIY-Jateng..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isStreaming}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isStreaming}
          className="p-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
