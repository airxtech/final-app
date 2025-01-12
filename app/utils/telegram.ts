import type { TelegramWebApp } from '@/types/telegram';

export const getTelegramUser = () => {
  const webApp = window?.Telegram?.WebApp as TelegramWebApp;
  return webApp?.initDataUnsafe?.user?.id;
};

export const openTelegramLink = (url: string) => {
  const webApp = window?.Telegram?.WebApp as TelegramWebApp;
  webApp?.openLink?.(url);
};