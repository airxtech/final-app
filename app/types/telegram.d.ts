export interface TelegramUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }
  
  export interface WebAppInitData {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
  }
  
  // This is what Telegram's WebApp actually exposes
  export interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    setBackgroundColor: (color: string) => void;
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
    };
  }
  
  // This is the actual structure we get from window.Telegram.WebApp
  export interface ExtendedTelegramWebApp extends TelegramWebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
  }
  
  declare global {
    interface Window {
      Telegram?: {
        WebApp: ExtendedTelegramWebApp;
      };
    }
  }