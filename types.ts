declare global {
    interface Window {
      Telegram?: {
        WebApp?: {
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
        };
      };
    }
  }
  
  export {};