import { createContext, useContext, ReactNode, useState, createElement } from 'react';
import { DateTime } from 'luxon';
import roMessages from './ro';
import enMessages from './en';

const TZ = 'Europe/Bucharest';

export type Locale = 'ro-RO' | 'en';
export type Messages = typeof roMessages;
export type MessageKey = keyof Messages;

const messages: Record<Locale, any> = {
  'ro-RO': roMessages,
  'en': enMessages,
};

export interface I18nContextType {
  locale: Locale;
  t: (key: MessageKey, params?: any) => string;
  now: () => DateTime;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'ro-RO' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = (key: MessageKey, params?: any): string => {
    const message = messages[locale][key];
    
    if (typeof message === 'function') {
      return message(params);
    }
    
    if (typeof message === 'string') {
      // Simple template replacement
      if (params && typeof params === 'object') {
        return Object.keys(params).reduce((text, param) => {
          return text.replace(new RegExp(`{${param}}`, 'g'), String(params[param]));
        }, message);
      }
      return message;
    }
    
    // Fallback to key if message not found
    console.warn(`Missing translation for key: ${String(key)}`);
    return String(key);
  };

  const now = (): DateTime => {
    return DateTime.now().setZone(TZ);
  };

  const value: I18nContextType = {
    locale,
    t,
    now,
    setLocale,
  };

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Export utilities for direct use without hook
export const i18nUtils = {
  formatDate: (iso: string, locale: Locale = 'ro-RO') => {
    return DateTime.fromISO(iso, { zone: TZ })
      .setLocale(locale === 'ro-RO' ? 'ro' : 'en')
      .toLocaleString({ 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
  },
  
  formatTime: (iso: string) => {
    return DateTime.fromISO(iso, { zone: TZ })
      .toLocaleString({ 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
  },
  
  now: () => DateTime.now().setZone(TZ),
};