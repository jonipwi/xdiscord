'use client';

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xdiscord-theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default to dark for Discord-like experience
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme classes and data attributes
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');

    // Add current theme class and data attribute for better iframe support
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);

    // Also apply CSS variables directly for iframe compatibility
    if (theme === 'dark') {
      root.style.setProperty('--discord-bg-primary', '#313338');
      root.style.setProperty('--discord-bg-secondary', '#2b2d31');
      root.style.setProperty('--discord-bg-tertiary', '#1e1f22');
      root.style.setProperty('--discord-text-primary', '#f2f3f5');
      root.style.setProperty('--discord-text-secondary', '#c7ccd1');
      root.style.setProperty('--discord-text-muted', '#8e9297');
      root.style.setProperty('--discord-border-primary', '#1e1f22');
      root.style.setProperty('--discord-border-secondary', '#2b2d31');
    } else {
      root.style.setProperty('--discord-bg-primary', '#ffffff');
      root.style.setProperty('--discord-bg-secondary', '#f2f3f5');
      root.style.setProperty('--discord-bg-tertiary', '#e3e5e8');
      root.style.setProperty('--discord-text-primary', '#060607');
      root.style.setProperty('--discord-text-secondary', '#4e5058');
      root.style.setProperty('--discord-text-muted', '#6d6f78');
      root.style.setProperty('--discord-border-primary', '#e3e5e8');
      root.style.setProperty('--discord-border-secondary', '#c7ccd1');
    }

    // Save to localStorage
    localStorage.setItem('xdiscord-theme', theme);
    // If embedded inside a parent (iframe), notify parent about the theme change so the
    // host page can stay in sync (useful when parent wants to apply matching styles)
    try {
      if (window.parent && window.parent !== window && typeof window.parent.postMessage === 'function') {
        window.parent.postMessage({ type: 'THEME_CHANGED', theme }, '*');
      }
    } catch {
      // ignore cross-origin errors when parent can't be reached
    }
  }, [theme]);

  // Listen for theme messages from a host page (embedded parent). The host can send
  // { type: 'SET_THEME', theme: 'dark' | 'light' } to force the iframe theme.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'SET_THEME' && (data.theme === 'dark' || data.theme === 'light')) {
          setTheme(data.theme);
        }
      } catch {
        // ignore malformed messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};