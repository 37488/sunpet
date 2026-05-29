import { contextBridge, ipcRenderer } from 'electron';
import type { AlarmPayload, AppSettings, ClockPayload, SunpetApi } from '../shared/types';

const api: SunpetApi & { onSettingsVisibility: (callback: (visible: boolean) => void) => () => void } = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('settings:save', settings),
  setPetPosition: (position: AppSettings['petPosition']) => ipcRenderer.invoke('pet:position', position),
  showSettings: () => ipcRenderer.invoke('settings:show'),
  hideSettings: () => ipcRenderer.invoke('settings:hide'),
  closeApp: () => ipcRenderer.invoke('app:close'),
  onClock: (callback: (payload: ClockPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: ClockPayload) => callback(payload);
    ipcRenderer.on('clock:tick', listener);
    return () => ipcRenderer.off('clock:tick', listener);
  },
  onAlarm: (callback: (payload: AlarmPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: AlarmPayload) => callback(payload);
    ipcRenderer.on('alarm:ring', listener);
    return () => ipcRenderer.off('alarm:ring', listener);
  },
  onSettingsVisibility: (callback: (visible: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, visible: boolean) => callback(visible);
    ipcRenderer.on('settings:visibility', listener);
    return () => ipcRenderer.off('settings:visibility', listener);
  },
};

contextBridge.exposeInMainWorld('sunpet', api);
