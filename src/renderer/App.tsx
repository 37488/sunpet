import { useEffect, useRef, useState } from 'react';
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
  const composingAlarmLabels = useRef(new Set<string>());
  const hideSpeechTimer = useRef<number | undefined>(undefined);
  const recentDialogueIds = useRef<string[]>([]);
  const clickBurst = useRef<{ count: number; lastAt: number; resetTimer?: number }>({ count: 0, lastAt: 0 });
  const musicEnabledRef = useRef(defaultSettings.musicEnabled);
  const voiceSettingsRef = useRef({
    enabled: defaultSettings.voiceEnabled,
    language: defaultSettings.language,
    volume: defaultSettings.volume,
  });

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

  const say = (text: string, nextMood: PetMood = 'neutral', nextState: PetState = 'talking', persistent = false) => {
    window.clearTimeout(hideSpeechTimer.current);
    setActiveAlarm(null);
    setSpeech(text);
    setMood(nextMood);
    setState(nextState);
    speakText(text);
    if (!persistent) {
      // Normal chat should be temporary; persistent events such as alarms must be user-dismissed.
      hideSpeechTimer.current = window.setTimeout(clearSpeech, 4200);
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
    hideSpeechTimer.current = window.setTimeout(clearSpeech, 4200);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hideSpeechTimer.current);
      window.clearTimeout(clickBurst.current.resetTimer);
      stopVoice();
      offSettings();
      offClock();
      offAlarm();
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
