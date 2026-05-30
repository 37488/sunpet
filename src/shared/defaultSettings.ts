import type { AppSettings } from './types';

export const defaultSettings: AppSettings = {
  language: 'zh-CN',
  petId: 'starlit-mira',
  chatFrequencyMinutes: 3,
  clockEnabled: true,
  musicEnabled: false,
  voiceEnabled: false,
  volume: 0.4,
  petPosition: { x: 120, y: 160 },
  alarms: [],
};
