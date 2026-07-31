export type PwaPlatform = 'ios' | 'android' | 'desktop' | 'unknown';

export type PwaBrowser =
  | 'safari-ios'
  | 'chrome-ios'
  | 'firefox-ios'
  | 'edge-ios'
  | 'safari-desktop'
  | 'chrome-desktop'
  | 'edge-desktop'
  | 'firefox-desktop'
  | 'samsung-internet'
  | 'chrome-android'
  | 'firefox-android'
  | 'unknown';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function detectPwaPlatform(userAgent: string): PwaPlatform {
  const normalizedAgent = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(normalizedAgent)) {
    return 'ios';
  }

  if (/android/.test(normalizedAgent)) {
    return 'android';
  }

  if (/windows|macintosh|linux/.test(normalizedAgent)) {
    return 'desktop';
  }

  return 'unknown';
}

export function detectPwaBrowser(userAgent: string): PwaBrowser {
  const normalizedAgent = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(normalizedAgent);
  const isAndroid = /android/.test(normalizedAgent);

  if (isIos) {
    if (/crios/.test(normalizedAgent)) {
      return 'chrome-ios';
    }

    if (/fxios/.test(normalizedAgent)) {
      return 'firefox-ios';
    }

    if (/edgios/.test(normalizedAgent)) {
      return 'edge-ios';
    }

    return 'safari-ios';
  }

  if (isAndroid) {
    if (/samsungbrowser/.test(normalizedAgent)) {
      return 'samsung-internet';
    }

    if (/firefox/.test(normalizedAgent)) {
      return 'firefox-android';
    }

    return 'chrome-android';
  }

  if (/edg\//.test(normalizedAgent)) {
    return 'edge-desktop';
  }

  if (/firefox/.test(normalizedAgent)) {
    return 'firefox-desktop';
  }

  if (/chrome/.test(normalizedAgent)) {
    return 'chrome-desktop';
  }

  if (/safari/.test(normalizedAgent)) {
    return 'safari-desktop';
  }

  return 'unknown';
}

export function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function needsManualInstallGuide(platform: PwaPlatform, canNativeInstall: boolean): boolean {
  return platform === 'ios' || !canNativeInstall;
}
