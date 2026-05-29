import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { createTray } from './tray';
import { getSettings, saveSettings } from './store';
import { startScheduler, stopScheduler } from './scheduler';
import type { AppSettings } from '../shared/types';

let petWindow: BrowserWindow | null = null;
let settingsVisible = false;

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

function createPetWindow() {
  const settings = getSettings();
  const display = screen.getPrimaryDisplay().workArea;
  const x = Math.min(Math.max(settings.petPosition.x, display.x), display.x + display.width - 280);
  const y = Math.min(Math.max(settings.petPosition.y, display.y), display.y + display.height - 260);

  petWindow = new BrowserWindow({
    width: 280,
    height: 260,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.setAlwaysOnTop(true, 'screen-saver');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (devServerUrl) {
    void petWindow.loadURL(devServerUrl);
    petWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void petWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  petWindow.on('moved', () => {
    if (!petWindow) return;
    const [windowX, windowY] = petWindow.getPosition();
    saveSettings({ ...getSettings(), petPosition: { x: windowX, y: windowY } });
  });

  petWindow.on('closed', () => {
    petWindow = null;
  });
}

function sendSettingsVisibility() {
  petWindow?.webContents.send('settings:visibility', settingsVisible);
}

app.whenReady().then(() => {
  createPetWindow();
  createTray(
    () => {
      settingsVisible = true;
      sendSettingsVisibility();
    },
    () => app.quit()
  );
  startScheduler(() => petWindow);

  ipcMain.handle('settings:get', () => getSettings());
  ipcMain.handle('settings:save', (_event, settings: AppSettings) => saveSettings(settings));
  ipcMain.handle('pet:position', (_event, position: AppSettings['petPosition']) => {
    return saveSettings({ ...getSettings(), petPosition: position });
  });
  ipcMain.handle('settings:show', () => {
    settingsVisible = true;
    sendSettingsVisibility();
  });
  ipcMain.handle('settings:hide', () => {
    settingsVisible = false;
    sendSettingsVisibility();
  });
  ipcMain.handle('app:close', () => app.quit());
});

app.on('window-all-closed', () => {
  // Keep the tray app alive if the pet window is ever closed directly.
});

app.on('before-quit', () => {
  stopScheduler();
});
