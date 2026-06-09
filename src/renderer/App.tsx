import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { defaultSettings } from '../shared/defaultSettings';
import type { Alarm, AppSettings, DialogueClickLevel, PetMood, PetState } from '../shared/types';
import { pickDialogue } from './dialogues';
import { PetAvatar, petDefinitions } from './pets';

function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function makeAlarm(): Alarm {
  return {
    id: crypto.randomUUID(),
    time: formatTime(new Date(Date.now() + 5 * 60 * 1000)),
    label: '提醒',
    enabled: true,
  };
}

function pickSystemVoice(language: AppSettings['language']) {
  const voices = window.speechSynthesis.getVoices();
  const languagePrefix = language.split('-')[0];
  return voices.find((voice) => voice.lang === language) ?? voices.find((voice) => voice.lang.startsWith(languagePrefix)) ?? null;
}

function clipSpeech(text: string, maxLength = 220) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function acceleratorFromKeyboardEvent(event: KeyboardEvent<HTMLInputElement>) {
  const ignoredKeys = new Set(['Alt', 'Control', 'Meta', 'Shift', 'Tab', 'CapsLock']);
  if (ignoredKeys.has(event.key)) return '';

  const modifiers = [
    event.ctrlKey ? 'Control' : '',
    event.altKey ? 'Alt' : '',
    event.shiftKey ? 'Shift' : '',
    event.metaKey ? 'Meta' : '',
  ].filter(Boolean);
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  if (!modifiers.length || key === 'Process') return '';
  return [...modifiers, key].join('+');
}

export function App() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speech, setSpeech] = useState('你好，我是 Sunpet。今天也请把桌面分我一点点。');
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [mood, setMood] = useState<PetMood>('happy');
  const [state, setState] = useState<PetState>('idle');
  const [now, setNow] = useState(formatTime(new Date()));
  const [alarmLabelDrafts, setAlarmLabelDrafts] = useState<Record<string, string>>({});
  const [shortcutDraft, setShortcutDraft] = useState(defaultSettings.translation.shortcut);
  const composingAlarmLabels = useRef(new Set<string>());
  const shortcutEditing = useRef(false);
  const hideSpeechTimer = useRef<number | undefined>(undefined);
  const recentDialogueIds = useRef<string[]>([]);
  const clickBurst = useRef<{ count: number; lastAt: number; resetTimer?: number }>({ count: 0, lastAt: 0 });
  const musicEnabledRef = useRef(defaultSettings.musicEnabled);
  const voiceSettingsRef = useRef({
    enabled: defaultSettings.voiceEnabled,
    language: defaultSettings.language,
    volume: defaultSettings.volume,
  });
  const mousePassthroughRef = useRef(true);

  const stopVoice = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const speakText = (text: string) => {
    const voiceSettings = voiceSettingsRef.current;
    if (!voiceSettings.enabled || !text || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceSettings.language;
    utterance.volume = Math.min(1, Math.max(0, voiceSettings.volume));
    utterance.rate = voiceSettings.language === 'zh-CN' ? 0.95 : 1;
    utterance.pitch = 1.05;
    const voice = pickSystemVoice(voiceSettings.language);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  // Returning to the resting state stops temporary animations such as alarm shaking.
  const clearSpeech = () => {
    stopVoice();
    setSpeech('');
    setActiveAlarm(null);
    setMood('happy');
    setState(musicEnabledRef.current ? 'music' : 'idle');
  };

  const say = (text: string, nextMood: PetMood = 'neutral', nextState: PetState = 'talking', persistent = false, durationMs = 4200) => {
    window.clearTimeout(hideSpeechTimer.current);
    setActiveAlarm(null);
    setSpeech(text);
    setMood(nextMood);
    setState(nextState);
    speakText(text);
    if (!persistent) {
      // Normal chat should be temporary; persistent events such as alarms must be user-dismissed.
      hideSpeechTimer.current = window.setTimeout(clearSpeech, durationMs);
    }
  };

  const rememberDialogue = (id: string) => {
    recentDialogueIds.current = [id, ...recentDialogueIds.current.filter((recentId) => recentId !== id)].slice(0, 5);
  };

  const getClickLevel = (): DialogueClickLevel => {
    const nowMs = Date.now();
    if (nowMs - clickBurst.current.lastAt > 1800) clickBurst.current.count = 0;
    clickBurst.current.count += 1;
    clickBurst.current.lastAt = nowMs;

    window.clearTimeout(clickBurst.current.resetTimer);
    clickBurst.current.resetTimer = window.setTimeout(() => {
      clickBurst.current.count = 0;
    }, 2200);

    if (clickBurst.current.count >= 5) return 'many';
    if (clickBurst.current.count >= 2) return 'repeat';
    return 'single';
  };

  const saveSettings = async (next: AppSettings) => {
    const saved = await window.sunpet.saveSettings(next);
    setSettings(saved);
  };

  useEffect(() => {
    void window.sunpet.getSettings().then((loaded) => {
      setSettings(loaded);
      setShortcutDraft(loaded.translation.shortcut);
      setReady(true);
    });

    const tick = window.setInterval(() => setNow(formatTime(new Date())), 1000);
    const offSettings = window.sunpet.onSettingsVisibility(setSettingsOpen);
    const offClock = window.sunpet.onClock((payload) => {
      say(payload.phrase, 'happy', 'talking');
    });
    const offAlarm = window.sunpet.onAlarm((payload) => {
      window.clearTimeout(hideSpeechTimer.current);
      // Alarm UI is kept separate from normal speech so the cancel button is only shown while ringing.
      setActiveAlarm({ id: payload.id, label: payload.label, time: payload.time, enabled: true });
      setSpeech(`${payload.label || '提醒'} ${payload.time}`);
      setMood('excited');
      setState('alarm');
      speakText(`${payload.label || '提醒'} ${payload.time}`);
    });
    const offTranslationResult = window.sunpet.onTranslationResult((payload) => {
      say(`翻译：${clipSpeech(payload.translatedText)}`, 'happy', 'talking', false, 7800);
    });
    const offTranslationError = window.sunpet.onTranslationError((payload) => {
      say(`翻译失败：${clipSpeech(payload.message, 120)}`, 'annoyed', 'talking', false, 5600);
    });
    hideSpeechTimer.current = window.setTimeout(clearSpeech, 4200);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hideSpeechTimer.current);
      window.clearTimeout(clickBurst.current.resetTimer);
      stopVoice();
      offSettings();
      offClock();
      offAlarm();
      offTranslationResult();
      offTranslationError();
    };
  }, []);

  useEffect(() => {
    const setPassthrough = (enabled: boolean) => {
      if (mousePassthroughRef.current === enabled) return;
      mousePassthroughRef.current = enabled;
      window.sunpet.setMousePassthrough(enabled);
    };

    const updateMousePassthrough = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const isInteractiveUi = Boolean(target?.closest('.pet, .speech, .settings-panel'));
      setPassthrough(!isInteractiveUi);
    };

    const handleMouseLeave = () => setPassthrough(true);

    document.addEventListener('mousemove', updateMousePassthrough);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', updateMousePassthrough);
      document.removeEventListener('mouseleave', handleMouseLeave);
      setPassthrough(true);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Idle dialogue is local and timer-based; changing language or frequency restarts the interval.
    const interval = window.setInterval(() => {
      const picked = pickDialogue('idle', settings.language, { petId: settings.petId, recentIds: recentDialogueIds.current });
      rememberDialogue(picked.id);
      say(picked.text, picked.mood);
    }, Math.max(1, settings.chatFrequencyMinutes) * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [ready, settings.chatFrequencyMinutes, settings.language, settings.petId]);

  useEffect(() => {
    musicEnabledRef.current = settings.musicEnabled;
    if (!speech && !activeAlarm) setState(settings.musicEnabled ? 'music' : 'idle');
  }, [activeAlarm, settings.musicEnabled, speech]);

  useEffect(() => {
    voiceSettingsRef.current = {
      enabled: settings.voiceEnabled,
      language: settings.language,
      volume: settings.volume,
    };
    if (!settings.voiceEnabled) stopVoice();
  }, [settings.language, settings.voiceEnabled, settings.volume]);

  useEffect(() => {
    if (!shortcutEditing.current) setShortcutDraft(settings.translation.shortcut);
  }, [settings.translation.shortcut]);

  const handlePetClick = () => {
    const picked = pickDialogue('click', settings.language, {
      petId: settings.petId,
      clickLevel: getClickLevel(),
      recentIds: recentDialogueIds.current,
    });
    rememberDialogue(picked.id);
    say(picked.text, picked.mood);
  };

  const handleDragStart = () => {
    const picked = pickDialogue('drag', settings.language, { petId: settings.petId, recentIds: recentDialogueIds.current });
    rememberDialogue(picked.id);
    say(picked.text, picked.mood, 'dragged');
  };

  const handlePetDragStart = () => {
    if (activeAlarm) return;
    const picked = pickDialogue('drag', settings.language, { petId: settings.petId, recentIds: recentDialogueIds.current });
    rememberDialogue(picked.id);
    window.clearTimeout(hideSpeechTimer.current);
    setSpeech(picked.text);
    setMood(picked.mood);
    setState('dragged');
    speakText(picked.text);
  };

  const handlePetDragEnd = () => {
    if (activeAlarm) return;
    setState(musicEnabledRef.current ? 'music' : 'idle');
    hideSpeechTimer.current = window.setTimeout(clearSpeech, 1600);
  };

  const handlePetContextMenu = () => {
    void window.sunpet.showSettings();
  };

  const addAlarm = () => {
    void saveSettings({ ...settings, alarms: [...settings.alarms, makeAlarm()] });
  };

  const updateAlarm = (alarm: Alarm) => {
    // Replace a single alarm object to keep the renderer state immutable before persisting.
    void saveSettings({ ...settings, alarms: settings.alarms.map((item) => (item.id === alarm.id ? alarm : item)) });
  };

  const updateAlarmLabelDraft = (id: string, label: string) => {
    setAlarmLabelDrafts((drafts) => ({ ...drafts, [id]: label }));
  };

  const commitAlarmLabel = (alarm: Alarm, label = alarmLabelDrafts[alarm.id] ?? alarm.label) => {
    setAlarmLabelDrafts((drafts) => {
      const next = { ...drafts };
      delete next[alarm.id];
      return next;
    });
    if (label !== alarm.label) updateAlarm({ ...alarm, label });
  };

  const removeAlarm = (id: string) => {
    void saveSettings({ ...settings, alarms: settings.alarms.filter((alarm) => alarm.id !== id) });
  };

  const saveTranslation = (translation: Partial<AppSettings['translation']>) => {
    void saveSettings({ ...settings, translation: { ...settings.translation, ...translation } });
  };

  const commitShortcutDraft = (shortcut = shortcutDraft) => {
    const nextShortcut = shortcut.trim() || defaultSettings.translation.shortcut;
    setShortcutDraft(nextShortcut);
    saveTranslation({ shortcut: nextShortcut });
  };

  const handleShortcutKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitShortcutDraft();
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setShortcutDraft(settings.translation.shortcut);
      event.currentTarget.blur();
      return;
    }

    const shortcut = acceleratorFromKeyboardEvent(event);
    if (!shortcut) return;
    event.preventDefault();
    setShortcutDraft(shortcut);
    commitShortcutDraft(shortcut);
  };

  if (!ready) return null;

  return (
    <main className="app">
      {speech && (
        <section className={`speech speech-${state}`}>
          <p>{speech}</p>
          <span>{now}</span>
          {activeAlarm && <button onClick={clearSpeech}>取消</button>}
        </section>
      )}

      <PetAvatar
        petId={settings.petId}
        mood={mood}
        state={state}
        onClick={handlePetClick}
        onContextMenu={handlePetContextMenu}
        onDoubleClick={handleDragStart}
        onDragEnd={handlePetDragEnd}
        onDragStart={handlePetDragStart}
      />

      {settingsOpen && (
        <aside className="settings-panel">
          <header>
            <strong>Sunpet 设置</strong>
            <button onClick={() => window.sunpet.hideSettings()}>关闭</button>
          </header>

          <label>
            语言
            <select value={settings.language} onChange={(event) => void saveSettings({ ...settings, language: event.target.value as AppSettings['language'] })}>
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
            </select>
          </label>

          <label>
            宠物形象
            <select value={settings.petId} onChange={(event) => void saveSettings({ ...settings, petId: event.target.value as AppSettings['petId'] })}>
              {petDefinitions.map((pet) => (
                <option value={pet.id} key={pet.id}>
                  {pet.name[settings.language]}
                </option>
              ))}
            </select>
          </label>

          <label>
            闲聊间隔（分钟）
            <input
              type="number"
              min="1"
              max="60"
              value={settings.chatFrequencyMinutes}
              onChange={(event) => void saveSettings({ ...settings, chatFrequencyMinutes: Number(event.target.value) })}
            />
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={settings.clockEnabled} onChange={(event) => void saveSettings({ ...settings, clockEnabled: event.target.checked })} />
            整点报时
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={settings.musicEnabled} onChange={(event) => void saveSettings({ ...settings, musicEnabled: event.target.checked })} />
            音乐模式
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={settings.voiceEnabled} onChange={(event) => void saveSettings({ ...settings, voiceEnabled: event.target.checked })} />
            语音朗读
          </label>

          <section className="settings-section">
            <header>
              <strong>划词翻译</strong>
            </header>

            <label className="checkbox-row">
              <input type="checkbox" checked={settings.translation.enabled} onChange={(event) => saveTranslation({ enabled: event.target.checked })} />
              启用翻译
            </label>

            <label>
              触发方式
              <select
                value={settings.translation.triggerMode}
                onChange={(event) => saveTranslation({ triggerMode: event.target.value as AppSettings['translation']['triggerMode'] })}
              >
                <option value="ctrl-long-press">长按 Ctrl</option>
                <option value="shortcut">组合快捷键</option>
              </select>
            </label>

            {settings.translation.triggerMode === 'shortcut' && (
              <label>
                快捷键
                <input
                  value={shortcutDraft}
                  placeholder="CommandOrControl+Alt+T"
                  onFocus={() => {
                    shortcutEditing.current = true;
                  }}
                  onBlur={() => {
                    shortcutEditing.current = false;
                    commitShortcutDraft();
                  }}
                  onChange={(event) => setShortcutDraft(event.target.value)}
                  onKeyDown={handleShortcutKeyDown}
                />
              </label>
            )}

            <label>
              源语言
              <select value={settings.translation.sourceLanguage} onChange={(event) => saveTranslation({ sourceLanguage: event.target.value })}>
                <option value="auto">自动检测</option>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </label>

            <label>
              目标语言
              <select value={settings.translation.targetLanguage} onChange={(event) => saveTranslation({ targetLanguage: event.target.value })}>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </label>

            <label>
              翻译来源
              <select value={settings.translation.provider} onChange={(event) => saveTranslation({ provider: event.target.value as AppSettings['translation']['provider'] })}>
                <option value="baidu">百度翻译</option>
                <option value="openai-compatible">OpenAI-compatible</option>
              </select>
            </label>

            {settings.translation.provider === 'baidu' && (
              <>
                <label>
                  百度 appId
                  <input
                    value={settings.translation.baidu.appId}
                    onChange={(event) => saveTranslation({ baidu: { ...settings.translation.baidu, appId: event.target.value } })}
                  />
                </label>
                <label>
                  百度 secretKey
                  <input
                    type="password"
                    value={settings.translation.baidu.secretKey}
                    onChange={(event) => saveTranslation({ baidu: { ...settings.translation.baidu, secretKey: event.target.value } })}
                  />
                </label>
              </>
            )}

            {settings.translation.provider === 'openai-compatible' && (
              <>
                <label>
                  Base URL
                  <input
                    value={settings.translation.openaiCompatible.baseUrl}
                    onChange={(event) =>
                      saveTranslation({ openaiCompatible: { ...settings.translation.openaiCompatible, baseUrl: event.target.value } })
                    }
                  />
                </label>
                <label>
                  API Key
                  <input
                    type="password"
                    value={settings.translation.openaiCompatible.apiKey}
                    onChange={(event) =>
                      saveTranslation({ openaiCompatible: { ...settings.translation.openaiCompatible, apiKey: event.target.value } })
                    }
                  />
                </label>
                <label>
                  Model
                  <input
                    value={settings.translation.openaiCompatible.model}
                    onChange={(event) =>
                      saveTranslation({ openaiCompatible: { ...settings.translation.openaiCompatible, model: event.target.value } })
                    }
                  />
                </label>
              </>
            )}
          </section>

          <section className="alarms">
            <header>
              <strong>闹钟</strong>
              <button onClick={addAlarm}>新增</button>
            </header>
            {settings.alarms.length === 0 && <p>暂无闹钟。新增一个，Sunpet 会准时嚷嚷。</p>}
            {settings.alarms.map((alarm) => (
              <div className="alarm-row" key={alarm.id}>
                <input type="time" value={alarm.time} onChange={(event) => updateAlarm({ ...alarm, time: event.target.value })} />
                <input
                  value={alarmLabelDrafts[alarm.id] ?? alarm.label}
                  onChange={(event) => {
                    updateAlarmLabelDraft(alarm.id, event.target.value);
                    if (!composingAlarmLabels.current.has(alarm.id)) commitAlarmLabel(alarm, event.target.value);
                  }}
                  onCompositionStart={() => composingAlarmLabels.current.add(alarm.id)}
                  onCompositionEnd={(event) => {
                    composingAlarmLabels.current.delete(alarm.id);
                    commitAlarmLabel(alarm, event.currentTarget.value);
                  }}
                  onBlur={() => commitAlarmLabel(alarm)}
                />
                <input type="checkbox" checked={alarm.enabled} onChange={(event) => updateAlarm({ ...alarm, enabled: event.target.checked })} />
                <button onClick={() => removeAlarm(alarm.id)}>删</button>
              </div>
            ))}
          </section>
        </aside>
      )}
    </main>
  );
}
