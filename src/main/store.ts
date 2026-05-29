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
  // Merge defaults on read so newly added settings get sane values for existing users.
  return { ...defaultSettings, ...store.get('settings') };
}

export function saveSettings(settings: AppSettings): AppSettings {
  // Save the normalized shape back to disk to keep persisted data aligned with current defaults.
  const next = { ...defaultSettings, ...settings };
  store.set('settings', next);
  return next;
}
