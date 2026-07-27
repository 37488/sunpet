import type { AppSettings } from './types';

export const defaultSettings: AppSettings = {
  language: 'zh-CN',
  petId: 'starlit-mira',
  chatFrequencyMinutes: 3,
  launchAtStartup: false,
  clockEnabled: true,
  musicEnabled: false,
  voiceEnabled: false,
  volume: 0.4,
  translation: {
    enabled: true,
    provider: 'baidu',
    sourceLanguage: 'auto',
    targetLanguage: 'zh',
    triggerMode: 'ctrl-long-press',
    shortcut: 'CommandOrControl+Alt+T',
    ctrlLongPressMs: 650,
    baidu: {
      appId: '',
      secretKey: '',
    },
    openaiCompatible: {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4.1-mini',
    },
  },
  petPosition: { x: 120, y: 160 },
  alarms: [],
};
