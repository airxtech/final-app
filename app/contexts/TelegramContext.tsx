'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { TelegramWebApp } from '@/types/telegram';

interface TelegramContextType {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: ReactNode }) {
  // Get user data from Telegram WebApp with proper typing
  const webApp = window?.Telegram?.WebApp as TelegramWebApp;
  const value = { user: webApp?.initDataUnsafe?.user };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}