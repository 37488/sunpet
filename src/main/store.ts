import Store from 'electron-store';
import { defaultSettings } from '../shared/defaultSettings';
import type { AppSettings } from '../shared/types';

type StoreShape = {
  settings: AppSettings;
};

const store = new Store<StoreShape>({
  defaults: {
    settings: defaultSettings,
  },
});

export function getSettings(): AppSettings {
  return { ...defaultSettings, ...store.get('settings') };
}

export function saveSettings(settings: AppSettings): AppSettings {
  const next = { ...defaultSettings, ...settings };
  store.set('settings', next);
  return next;
}
