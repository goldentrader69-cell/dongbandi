import { useEffect, useState } from 'react';
import type { AppState } from '@/types';

const STORAGE_KEY = 'dong-bandi-state-v1';

const defaultState: AppState = {
  members: [],
  expenses: [],
  theme: 'light',
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        return {
          members: parsed.members ?? [],
          expenses: parsed.expenses ?? [],
          theme: parsed.theme ?? 'light',
        };
      }
    } catch {
      // ignore corrupted storage
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  };

  return { state, setState, toggleTheme };
}
