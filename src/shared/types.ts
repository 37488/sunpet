export type PetMood = 'neutral' | 'happy' | 'sleepy' | 'excited' | 'annoyed';

export type PetState = 'idle' | 'talking' | 'dragged' | 'alarm' | 'music';

export type PetId = 'sunny-sprout' | 'moon-bun' | 'starlit-mira';

export type DialogueTrigger = 'idle' | 'click' | 'clock' | 'alarm' | 'music' | 'drag';

export type DialogueClickLevel = 'single' | 'repeat' | 'many';

export type Alarm = {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
};

export type TranslationProvider = 'baidu' | 'openai-compatible';

export type TranslationTriggerMode = 'ctrl-long-press' | 'shortcut';

export type TranslationSettings = {
  enabled: boolean;
  provider: TranslationProvider;
  sourceLanguage: 'auto' | string;
  targetLanguage: string;
  triggerMode: TranslationTriggerMode;
  shortcut: string;
  ctrlLongPressMs: number;
  baidu: {
    appId: string;
    secretKey: string;
  };
  openaiCompatible: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
};

export type AppSettings = {
  language: 'zh-CN' | 'en-US';
  petId: PetId;
  chatFrequencyMinutes: number;
  clockEnabled: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  volume: number;
  translation: TranslationSettings;
  petPosition: { x: number; y: number };
  alarms: Alarm[];
};

export type PetMoveDelta = {
  x: number;
  y: number;
};

export type DialogueLine = {
  id: string;
  trigger: DialogueTrigger[];
  petId?: PetId;
  clickLevel?: DialogueClickLevel;
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

export type TranslationResultPayload = {
  sourceText: string;
  translatedText: string;
  provider: TranslationProvider;
};

export type TranslationErrorPayload = {
  message: string;
};

export type SunpetApi = {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<AppSettings>;
  setPetPosition: (position: AppSettings['petPosition']) => Promise<AppSettings>;
  movePetBy: (delta: PetMoveDelta) => Promise<AppSettings | undefined>;
  setMousePassthrough: (enabled: boolean) => void;
  showSettings: () => Promise<void>;
  hideSettings: () => Promise<void>;
  closeApp: () => Promise<void>;
  onClock: (callback: (payload: ClockPayload) => void) => () => void;
  onAlarm: (callback: (payload: AlarmPayload) => void) => () => void;
  onTranslationResult: (callback: (payload: TranslationResultPayload) => void) => () => void;
  onTranslationError: (callback: (payload: TranslationErrorPayload) => void) => () => void;
};
