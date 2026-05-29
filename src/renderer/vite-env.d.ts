/// <reference types="vite/client" />

import type { SunpetApi } from '../shared/types';

declare global {
  interface Window {
    sunpet: SunpetApi & {
      onSettingsVisibility: (callback: (visible: boolean) => void) => () => void;
    };
  }
}
