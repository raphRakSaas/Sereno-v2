import { inject, provideAppInitializer } from '@angular/core';
import { AppStore } from '../store/app.store';

export function provideSerenoStore() {
  return provideAppInitializer(async () => {
    const appStore = inject(AppStore);
    await appStore.initialize();
  });
}
