export type PwaPlatform = 'ios' | 'android' | 'desktop' | 'unknown';

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
