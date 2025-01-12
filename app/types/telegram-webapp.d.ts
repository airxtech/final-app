interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface WebAppMainButton {
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
}

interface WebAppInitData {
  query_id?: string
  user?: TelegramUser
  receiver?: TelegramUser
  start_param?: string
  auth_date?: string
  hash?: string
}

interface WebApp {
  initData: string
  initDataUnsafe: WebAppInitData
  version: string
  platform: string
  colorScheme: string
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
    secondary_bg_color: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  MainButton: WebAppMainButton
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  sendData: (data: any) => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
  showPopup: (params: any, callback?: () => void) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  requestWriteAccess: (callback?: (access_granted: boolean) => void) => void
  requestContact: (callback?: (shared: boolean) => void) => void
  HapticFeedback: {
    impactOccurred: (style: string) => void
    notificationOccurred: (type: string) => void
    selectionChanged: () => void
  }
  isVersionAtLeast: (version: string) => boolean
  setHeaderColor: (color: string) => void
  showScanQrPopup: (params: any, callback?: (text: string) => void) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (callback?: (text: string) => void) => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}