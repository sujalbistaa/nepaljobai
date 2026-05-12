'use client';

/**
 * Lightweight client store. Right now: only language preference.
 * No external library — just a tiny event emitter wrapped in a hook.
 * We add Zustand later if state grows.
 */

import { useEffect, useState } from 'react';
import type { Lang } from './constants';

const KEY = 'nepaljobai.lang';
type Listener = (l: Lang) => void;
const listeners = new Set<Listener>();

function getInitial(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(KEY);
  return stored === 'ne' || stored === 'en' ? stored : 'en';
}

export function setLang(l: Lang) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, l);
    document.documentElement.setAttribute('lang', l);
  }
  listeners.forEach((fn) => fn(l));
}

// ── Guru chat open/close ──────────────────────────────────────────────────────
type ChatListener = (open: boolean) => void;
const chatListeners = new Set<ChatListener>();
let _chatOpen = false;

export function openGuruChat()  { _chatOpen = true;  chatListeners.forEach(fn => fn(true)); }
export function closeGuruChat() { _chatOpen = false; chatListeners.forEach(fn => fn(false)); }
export function toggleGuruChat() { _chatOpen ? closeGuruChat() : openGuruChat(); }

export function useGuruChat() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(_chatOpen);
    const fn: ChatListener = (open) => setIsOpen(open);
    chatListeners.add(fn);
    return () => { chatListeners.delete(fn); };
  }, []);

  return { isOpen, open: openGuruChat, close: closeGuruChat, toggle: toggleGuruChat };
}

// ─────────────────────────────────────────────────────────────────────────────
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLocal] = useState<Lang>('en');

  useEffect(() => {
    const initial = getInitial();
    setLocal(initial);
    document.documentElement.setAttribute('lang', initial);

    const fn: Listener = (l) => setLocal(l);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return [lang, setLang];
}