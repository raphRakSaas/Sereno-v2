import {
  detectPwaBrowser,
  detectPwaPlatform,
  isServiceWorkerSupported,
  isStandaloneDisplayMode,
} from './pwa-platform';
import { getPwaInstallGuide } from './pwa-install-guides';

describe('detectPwaPlatform', () => {
  it('should detect iOS devices', () => {
    expect(detectPwaPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
  });

  it('should detect Android devices', () => {
    expect(detectPwaPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 7)')).toBe('android');
  });
});

describe('detectPwaBrowser', () => {
  it('should detect Safari on iPhone', () => {
    expect(
      detectPwaBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'),
    ).toBe('safari-ios');
  });

  it('should detect Chrome on iPhone', () => {
    expect(detectPwaBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) CriOS/120.0.0.0')).toBe(
      'chrome-ios',
    );
  });

  it('should detect Samsung Internet', () => {
    expect(detectPwaBrowser('Mozilla/5.0 (Linux; Android 14) SamsungBrowser/24.0 Chrome/117.0.0.0')).toBe(
      'samsung-internet',
    );
  });
});

describe('getPwaInstallGuide', () => {
  it('should return Safari iOS steps', () => {
    const guide = getPwaInstallGuide('safari-ios');
    expect(guide.browserLabel).toContain('Safari');
    expect(guide.steps.length).toBeGreaterThanOrEqual(2);
  });
});

describe('isStandaloneDisplayMode', () => {
  it('should return false when window is unavailable', () => {
    expect(isStandaloneDisplayMode()).toBe(false);
  });
});

describe('isServiceWorkerSupported', () => {
  it('should return false when window is unavailable', () => {
    expect(isServiceWorkerSupported()).toBe(false);
  });
});
