import { Menu, Tray, app, nativeImage } from 'electron';

export function createTray(onShowSettings: () => void, onQuit: () => void) {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYklEQVR4AWNkoBAwUqifYdQABob/2BgYGLAJiBkZGf8B8SgGJtgIEOMwA+PHj//RNHgGJgYGSgYkwQpygNQApA2EKWQFoBqA2kCYA2kBqAagGkBqAagGoGgAAJ8DD6mHjADhAAAAAElFTkSuQmCC'
  );
  const tray = new Tray(icon);
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
