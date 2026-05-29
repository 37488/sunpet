import type { BrowserWindow } from 'electron';
import { getSettings } from './store';
import type { AlarmPayload, ClockPayload } from '../shared/types';

let timer: NodeJS.Timeout | undefined;
let lastClockKey = '';
// Avoid repeating the same clock/alarm event while the scheduler polls every second.
const firedAlarmKeys = new Set<string>();

function clockPhrase(hour: number, minute: number) {
  const pretty = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  if (Math.random() < 0.18) {
    return `现在大概是 ${pretty}。等等，我这次应该没看错吧？`;
  }
  return `现在是 ${pretty}。`;
}

export function startScheduler(windowProvider: () => BrowserWindow | null) {
  stopScheduler();
  timer = setInterval(() => {
    const target = windowProvider();
    if (!target || target.isDestroyed()) return;

    const settings = getSettings();
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // This uses local wall-clock date semantics; alarms intentionally repeat daily.
    const dateKey = now.toISOString().slice(0, 10);

    if (settings.clockEnabled && minute === 0) {
      const key = `${dateKey}-${hour}`;
      if (key !== lastClockKey) {
        lastClockKey = key;
        const payload: ClockPayload = { hour, minute, phrase: clockPhrase(hour, minute) };
        target.webContents.send('clock:tick', payload);
      }
    }

    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    for (const alarm of settings.alarms) {
      // Include the minute in the key so an enabled alarm can fire again on the next day.
      const key = `${dateKey}-${alarm.id}-${time}`;
      if (alarm.enabled && alarm.time === time && !firedAlarmKeys.has(key)) {
        firedAlarmKeys.add(key);
        const payload: AlarmPayload = { id: alarm.id, label: alarm.label, time: alarm.time };
        target.webContents.send('alarm:ring', payload);
      }
    }
  }, 1000);
}

export function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}
