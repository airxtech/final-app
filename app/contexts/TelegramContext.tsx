'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { TelegramUser, ExtendedTelegramWebApp } from '../types/telegram'

interface TelegramContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Check if we're in the browser and Telegram WebApp is available
        if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
          throw new Error('Telegram WebApp is not available');
        }

        const webApp = window.Telegram.WebApp as ExtendedTelegramWebApp;
        webApp.ready();
        console.log('WebApp Data:', webApp.initDataUnsafe); // Debug log

        // Validate the authentication
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: webApp.initData,
          }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const userData = webApp.initDataUnsafe?.user;
        console.log('User Data:', userData); // Debug log

        if (userData) {
          setUser(userData);
          
          // Initialize user in database
          const dbResponse = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: userData.id,
              firstName: userData.first_name,
              lastName: userData.last_name,
              username: userData.username,
            }),
          });

          const dbData = await dbResponse.json();
          console.log('DB Response:', dbData); // Debug log
        }
      } catch (err) {
        console.error('Telegram initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isLoading, error }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}