'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, GraduationCap, Sparkles } from 'lucide-react';
import { useGuruChat, useLang } from '@/lib/store';
import { cn } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'नमस्ते! म **Guru** हुँ — तपाईंको career advisor। Kathmandu को job market, skills, salary, र career planning बारे जे पनि सोध्नुस्! 🙏\n\nHi! I\'m **Guru** — your career advisor for Nepal\'s job market. Ask me anything!',
};

const SUGGESTIONS = [
  { en: 'What skills are in demand?', ne: 'कुन skills माग छ?' },
  { en: 'Salary ranges in Kathmandu', ne: 'KTM मा तलब कति?' },
  { en: 'How to prepare for interviews?', ne: 'Interview को तयारी कसरी?' },
];

// Minimal markdown: **bold** and `code`
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={i} className="mono bg-black/10 px-1 rounded-sm text-[0.8em]">
          {part.slice(1, -1)}
        </code>
      );
    return <span key={i}>{part}</span>;
  });
}

export function GuruChat() {
  const { isOpen, close } = useGuruChat();
  const [lang] = useLang();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const isFirstMessage = messages.length === 1; // only the welcome msg

  // Auto-scroll + focus
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history excluding the static welcome message
      const history = [...messages, userMsg]
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error('api_error');
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: lang === 'ne'
          ? 'माफ गर्नुस्, केही गलत भयो। फेरि प्रयास गर्नुस्।'
          : 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lang]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1     }}
          exit={{   opacity: 0, y: 16,  scale: 0.97  }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[500] flex flex-col rounded-xl overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper)]"
          style={{ width: 360, height: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 flex items-center gap-3 px-4 py-3"
            style={{ background: 'linear-gradient(135deg, #15a0bc 0%, #064e61 100%)' }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <GraduationCap size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-semibold leading-tight">
                Guru lai Sodham
              </p>
              <p className="text-white/55 text-[10px] mono mt-px">
                गुरुलाई सोध्नुस् · Career advisor
              </p>
            </div>
            <button
              onClick={close}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
              aria-label="Close chat"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[82%] px-3 py-2 text-[13px] leading-relaxed rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                      : 'bg-[var(--color-paper-2)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded-bl-sm',
                  )}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {renderContent(line)}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-paper-2)] border border-[var(--color-rule)] rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce"
                      style={{ animationDelay: `${i * 0.14}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick suggestion chips — only before first user message */}
            {isFirstMessage && !loading && (
              <div className="flex flex-col gap-1.5 mt-1">
                <p className="mono text-[9px] tracking-widest uppercase text-[var(--color-muted)] px-1">
                  {lang === 'ne' ? 'छिटो प्रश्नहरू' : 'Quick questions'}
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.en}
                    onClick={() => send(lang === 'ne' ? s.ne : s.en)}
                    className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-rule-2)] text-[var(--color-muted)] text-[12px] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    <Sparkles size={10} />
                    {lang === 'ne' ? s.ne : s.en}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input ── */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-[var(--color-rule)] bg-[var(--color-paper)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'ne' ? 'केही सोध्नुस्...' : 'Ask anything about jobs in Nepal…'}
              className="flex-1 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-full px-3.5 py-2 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center disabled:opacity-35 hover:bg-[var(--color-accent-deep)] transition-colors shrink-0"
              aria-label="Send"
            >
              <Send size={13} className="text-white translate-x-px" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
