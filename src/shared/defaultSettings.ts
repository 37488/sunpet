import type { AppSettings } from './types';

export const defaultSettings: AppSettings = {
  language: 'zh-CN',
  chatFrequencyMinutes: 3,
  clockEnabled: true,
  musicEnabled: false,
  volume: 0.4,
  petPosition: { x: 120, y: 160 },
  alarms: [],
};
