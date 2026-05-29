export type PetMood = 'neutral' | 'happy' | 'sleepy' | 'excited' | 'annoyed';

export type PetState = 'idle' | 'talking' | 'dragged' | 'alarm' | 'music';

export type PetId = 'sunny-sprout' | 'moon-bun' | 'starlit-mira';

export type DialogueTrigger = 'idle' | 'click' | 'clock' | 'alarm' | 'music' | 'drag';

export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

export type AppSettings = {
  language: 'zh-CN' | 'en-US';
  petId: PetId;
  chatFrequencyMinutes: number;
  clockEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  petPosition: { x: number; y: number };
  alarms: Alarm[];
};

export type DialogueLine = {
  id: string;
  trigger: DialogueTrigger[];
  text: Record<AppSettings['language'], string>;
  mood: PetMood;
  weight: number;
};

export type ClockPayload = {
  hour: number;
  minute: number;
  phrase: string;
};

export type AlarmPayload = {
  id: string;
  label: string;
  time: string;
};

export type SunpetApi = {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<AppSettings>;
  setPetPosition: (position: AppSettings['petPosition']) => Promise<AppSettings>;
  showSettings: () => Promise<void>;
  hideSettings: () => Promise<void>;
  closeApp: () => Promise<void>;
  onClock: (callback: (payload: ClockPayload) => void) => () => void;
  onAlarm: (callback: (payload: AlarmPayload) => void) => () => void;
};
