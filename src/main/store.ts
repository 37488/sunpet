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
  const saved = store.get('settings');
  return {
    ...defaultSettings,
    ...saved,
    translation: {
      ...defaultSettings.translation,
      ...saved.translation,
      baidu: {
        ...defaultSettings.translation.baidu,
        ...saved.translation?.baidu,
      },
      openaiCompatible: {
        ...defaultSettings.translation.openaiCompatible,
        ...saved.translation?.openaiCompatible,
      },
    },
  };
}

export function saveSettings(settings: AppSettings): AppSettings {
  // Save the normalized shape back to disk to keep persisted data aligned with current defaults.
  const next = {
    ...defaultSettings,
    ...settings,
    translation: {
      ...defaultSettings.translation,
      ...settings.translation,
      baidu: {
        ...defaultSettings.translation.baidu,
        ...settings.translation.baidu,
      },
      openaiCompatible: {
        ...defaultSettings.translation.openaiCompatible,
        ...settings.translation.openaiCompatible,
      },
    },
  };
  store.set('settings', next);
  return next;
}
