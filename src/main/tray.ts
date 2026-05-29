import { Menu, Tray, app, nativeImage } from 'electron';

function createSunpetIcon() {
  const size = 16;
  const center = (size - 1) / 2;
  // Build a tiny BGRA bitmap directly; Windows tray icons are more reliable with bitmap data than SVG data URLs.
  const pixels = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x - center, y - center);
      const offset = (y * size + x) * 4;

      if (distance > 7.3) {
        pixels[offset + 3] = 0;
      } else if (distance > 6.2) {
        pixels[offset] = 0;
        pixels[offset + 1] = 75;
        pixels[offset + 2] = 122;
        pixels[offset + 3] = 255;
      } else {
        pixels[offset] = 61;
        pixels[offset + 1] = 215;
        pixels[offset + 2] = 255;
        pixels[offset + 3] = 255;
      }
    }
  }

  const draw = (x: number, y: number, b: number, g: number, r: number) => {
    const offset = (y * size + x) * 4;
    pixels[offset] = b;
    pixels[offset + 1] = g;
    pixels[offset + 2] = r;
    pixels[offset + 3] = 255;
  };

  // Simple original face details drawn over the circular sun body.
  draw(5, 6, 0, 26, 36);
  draw(10, 6, 0, 26, 36);
  for (let x = 5; x <= 10; x += 1) draw(x, 10, 0, 26, 36);
  draw(4, 9, 0, 26, 36);
  draw(11, 9, 0, 26, 36);

  return nativeImage.createFromBitmap(pixels, { width: size, height: size });
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
