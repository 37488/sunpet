import { Menu, Tray, app, nativeImage } from 'electron';
import path from 'path';

function createSunpetIcon() {
  const iconPath = app.isPackaged ? path.join(process.resourcesPath, 'icon.ico') : path.join(app.getAppPath(), 'build/icon.ico');
  return nativeImage.createFromPath(iconPath);
}

export function createTray(onShowSettings: () => void, onQuit: () => void) {
  const tray = new Tray(createSunpetIcon());
  tray.setToolTip('Sunpet');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '设置', click: onShowSettings },
      { type: 'separator' },
      { label: '退出', click: onQuit },
    ])
  );
  tray.on('double-click', onShowSettings);
  app.on('before-quit', () => tray.destroy());
  return tray;
}
