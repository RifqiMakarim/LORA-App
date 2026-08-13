'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Maximize2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'assistant',
      content: 'Halo! Saya LORA AI Business Consultant. Ada yang perlu saya analisis dari toko Anda saat ini?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userText = input;
    setInput('');
    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const assistantMsgId = `a-${Date.now()}`;
    setMessages((prev) => [...prev, { id: assistantMsgId, sender: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    } catch (err) {
      console.error('Floating AI widget error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-indigo-900 hover:bg-indigo-950 text-amber-400 shadow-2xl border border-indigo-700 hover:scale-105 transition-all flex items-center gap-2 group"
        title="Buka AI Business Consultant"
      >
        <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold text-white pr-1 hidden sm:inline">AI Consultant</span>
      </button>

      {/* Slide-over Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[90vw] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-indigo-950 text-white flex items-center justify-between border-b border-indigo-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm">LORA AI Consultant</h4>
                <p className="text-[10px] text-indigo-300">Fast BI Advice</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link 
                href="/ai-consultant" 
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                title="Buka Halaman Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser ? 'bg-amber-600 text-white' : 'bg-indigo-900 text-amber-400'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    isUser 
                      ? 'bg-amber-600 text-white rounded-tr-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900"
          >
            <input 
              type="text"
              placeholder="Tanyakan stok, omzet, promo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              className="flex-1 bg-white dark:bg-slate-800 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
