declare global {
  interface Window {
    Telegram: WebApp;
  }
}

interface WebApp {
  WebApp: {
    ready: () => void;
    expand: () => void;
    close: () => void;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
      };
      auth_date: string;
      hash: string;
    };
  };
}

export {}