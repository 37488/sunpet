import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { createTray } from './tray';
import { getSettings, saveSettings } from './store';
import { startScheduler, stopScheduler } from './scheduler';
import type { AppSettings, PetMoveDelta } from '../shared/types';

let petWindow: BrowserWindow | null = null;
let settingsVisible = false;
let mousePassthrough = true;
let positionSaveTimer: NodeJS.Timeout | undefined;

const devServerUrl = process.env.VITE_DEV_SERVER_URL;

function createPetWindow() {
  const settings = getSettings();
  const display = screen.getPrimaryDisplay().workArea;
  // Clamp restored coordinates so the small transparent window cannot reopen off-screen.
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

  // The higher level keeps the pet visible above most normal app windows on Windows.
  petWindow.setAlwaysOnTop(true, 'screen-saver');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.setIgnoreMouseEvents(true, { forward: true });

  if (devServerUrl) {
    void petWindow.loadURL(devServerUrl);
    petWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void petWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  petWindow.on('moved', () => {
    // Persist position from the main process because the renderer cannot read OS window bounds.
    savePetWindowPositionSoon();
  });

  petWindow.on('closed', () => {
    petWindow = null;
  });
}

function sendSettingsVisibility() {
  // Settings live inside the pet renderer; tray and IPC actions only toggle this flag.
  petWindow?.webContents.send('settings:visibility', settingsVisible);
}

function savePetWindowPosition() {
  if (!petWindow) return;
  const [windowX, windowY] = petWindow.getPosition();
  saveSettings({ ...getSettings(), petPosition: { x: windowX, y: windowY } });
}

function savePetWindowPositionSoon() {
  if (positionSaveTimer) clearTimeout(positionSaveTimer);
  positionSaveTimer = setTimeout(savePetWindowPosition, 160);
}

function clampWindowPosition(x: number, y: number) {
  const display = screen.getDisplayMatching({ x, y, width: 280, height: 260 }).workArea;
  return {
    x: Math.min(Math.max(x, display.x), display.x + display.width - 280),
    y: Math.min(Math.max(y, display.y), display.y + display.height - 260),
  };
}

function setMousePassthrough(enabled: boolean) {
  if (!petWindow || petWindow.isDestroyed() || mousePassthrough === enabled) return;
  mousePassthrough = enabled;
  petWindow.setIgnoreMouseEvents(enabled, enabled ? { forward: true } : undefined);
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

  // Keep all Electron and persistence access behind IPC so React stays browser-only.
  ipcMain.handle('settings:get', () => getSettings());
  ipcMain.handle('settings:save', (_event, settings: AppSettings) => saveSettings(settings));
  ipcMain.handle('pet:position', (_event, position: AppSettings['petPosition']) => {
    return saveSettings({ ...getSettings(), petPosition: position });
  });
  ipcMain.handle('pet:move-by', (_event, delta: PetMoveDelta) => {
    if (!petWindow || petWindow.isDestroyed()) return undefined;
    const [windowX, windowY] = petWindow.getPosition();
    const next = clampWindowPosition(windowX + Math.round(delta.x), windowY + Math.round(delta.y));
    petWindow.setPosition(next.x, next.y);
    return { ...getSettings(), petPosition: next };
  });
  ipcMain.on('window:mouse-passthrough', (_event, enabled: boolean) => {
    setMousePassthrough(enabled);
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
  if (positionSaveTimer) clearTimeout(positionSaveTimer);
  savePetWindowPosition();
  stopScheduler();
});
