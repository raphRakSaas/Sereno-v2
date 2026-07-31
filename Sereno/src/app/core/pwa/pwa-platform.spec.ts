import {
  detectPwaPlatform,
  isServiceWorkerSupported,
  isStandaloneDisplayMode,
} from './pwa-platform';

describe('detectPwaPlatform', () => {
  it('should detect iOS devices', () => {
    expect(detectPwaPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
  });

  it('should detect Android devices', () => {
    expect(detectPwaPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 7)')).toBe('android');
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
