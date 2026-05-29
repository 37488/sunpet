import { useEffect, useRef, useState } from 'react';
import { defaultSettings } from '../shared/defaultSettings';
import type { Alarm, AppSettings, PetMood, PetState } from '../shared/types';
import { pickDialogue } from './dialogues';

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

export function App() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speech, setSpeech] = useState('你好，我是 Sunpet。今天也请把桌面分我一点点。');
  const [mood, setMood] = useState<PetMood>('happy');
  const [state, setState] = useState<PetState>('idle');
  const [now, setNow] = useState(formatTime(new Date()));
  const hideSpeechTimer = useRef<number | undefined>(undefined);

  const say = (text: string, nextMood: PetMood = 'neutral', nextState: PetState = 'talking') => {
    window.clearTimeout(hideSpeechTimer.current);
    setSpeech(text);
    setMood(nextMood);
    setState(nextState);
    hideSpeechTimer.current = window.setTimeout(() => {
      setState('idle');
    }, 4200);
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
      say(`${payload.label || '提醒'} 到了：${payload.time}`, 'excited', 'alarm');
    });

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hideSpeechTimer.current);
      offSettings();
      offClock();
      offAlarm();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const interval = window.setInterval(() => {
      const picked = pickDialogue('idle', settings.language);
      say(picked.text, picked.mood);
    }, Math.max(1, settings.chatFrequencyMinutes) * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [ready, settings.chatFrequencyMinutes, settings.language]);

  const handlePetClick = () => {
    const picked = pickDialogue('click', settings.language);
    say(picked.text, picked.mood);
  };

  const handleDragStart = () => {
    const picked = pickDialogue('drag', settings.language);
    say(picked.text, picked.mood, 'dragged');
  };

  const toggleMusic = () => {
    const next = { ...settings, musicEnabled: !settings.musicEnabled };
    void saveSettings(next);
    const picked = pickDialogue('music', settings.language);
    say(next.musicEnabled ? picked.text : '音乐先暂停。耳朵也需要休息。', 'happy', 'music');
  };

  const addAlarm = () => {
    void saveSettings({ ...settings, alarms: [...settings.alarms, makeAlarm()] });
  };

  const updateAlarm = (alarm: Alarm) => {
    void saveSettings({ ...settings, alarms: settings.alarms.map((item) => (item.id === alarm.id ? alarm : item)) });
  };

  const removeAlarm = (id: string) => {
    void saveSettings({ ...settings, alarms: settings.alarms.filter((alarm) => alarm.id !== id) });
  };

  if (!ready) return null;

  return (
    <main className="app">
      <section className={`speech speech-${state}`}>
        <p>{speech}</p>
        <span>{now}</span>
      </section>

      <button
        className={`pet pet-${mood} pet-state-${state}`}
        aria-label="Sunpet"
        onClick={handlePetClick}
        onMouseDown={handleDragStart}
      >
        <span className="pet-face">
          <span className="eye eye-left" />
          <span className="eye eye-right" />
          <span className="mouth" />
        </span>
        <span className="pet-stem" />
        <span className="pet-leaf" />
      </button>

      <nav className="quick-actions">
        <button onClick={() => window.sunpet.showSettings()}>设置</button>
        <button onClick={toggleMusic}>{settings.musicEnabled ? '暂停' : 'BGM'}</button>
        <button onClick={() => window.sunpet.closeApp()}>退出</button>
      </nav>

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

          <section className="alarms">
            <header>
              <strong>闹钟</strong>
              <button onClick={addAlarm}>新增</button>
            </header>
            {settings.alarms.length === 0 && <p>暂无闹钟。新增一个，Sunpet 会准时嚷嚷。</p>}
            {settings.alarms.map((alarm) => (
              <div className="alarm-row" key={alarm.id}>
                <input type="time" value={alarm.time} onChange={(event) => updateAlarm({ ...alarm, time: event.target.value })} />
                <input value={alarm.label} onChange={(event) => updateAlarm({ ...alarm, label: event.target.value })} />
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
