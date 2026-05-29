# Sunpet Agent Notes

This file gives future OpenCode sessions the minimum context needed to work on this repository quickly.

## Project Summary

Sunpet is a Windows desktop pet MVP inspired by offline interactive toys. It is intentionally an original character prototype and must not use Nintendo assets, names, music, voices, dialogue, or character likenesses.

Current app shape:

- Transparent always-on-top Electron pet window.
- React-rendered CSS character with speech bubble.
- Click and drag interactions.
- Weighted local idle dialogue.
- Local settings panel.
- Tray menu.
- Hourly clock announcements.
- Local alarm checks.
- Chinese and English text switching.

## Tech Stack

- Electron for the Windows desktop shell.
- React + TypeScript for the renderer UI.
- Vite for renderer dev/build.
- `electron-store` for local persisted settings.
- `electron-builder` for Windows packaging.
- No backend service, account system, database, AI service, TTS, or real sensor integration yet.

## Commands

Install dependencies:

```bash
npm install
```

Run development app:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Run built app entry with Electron:

```bash
npm start
```

Create Windows packages:

```bash
npm run package
```

Electron binary download note:

- `.npmrc` sets `electron_mirror=https://npmmirror.com/mirrors/electron/` because first install may fail or hang on the default Electron binary host in this environment.
- If `npm run dev` prints `Downloading Electron binary...` for too long, run `set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/&& node node_modules\electron\install.js` on Windows.

## Repository Layout

```text
src/
├─ main/
│  ├─ index.ts        Electron app bootstrap, pet window, IPC handlers
│  ├─ scheduler.ts    Hourly clock and alarm timer loop
│  ├─ store.ts        electron-store settings persistence
│  └─ tray.ts         Windows tray menu
├─ preload/
│  └─ index.ts        Safe contextBridge API exposed as window.sunpet
├─ renderer/
│  ├─ App.tsx         Main pet UI, settings panel, interactions
│  ├─ dialogues.ts    Weighted local dialogue lines
│  ├─ main.tsx        React entry
│  ├─ styles.css      CSS-only pet illustration and animation
│  ├─ index.html      Vite renderer HTML entry
│  └─ vite-env.d.ts   Renderer globals and window.sunpet typing
└─ shared/
   ├─ defaultSettings.ts
   └─ types.ts
```

Generated output:

- `dist/` is build output and ignored.
- `release/` is package output and ignored.
- `node_modules/` is ignored.

## Architecture Rules

- Keep OS/Electron APIs in `src/main` or `src/preload`; do not import Electron directly in React components.
- Renderer-to-main calls go through `window.sunpet`, defined in `src/preload/index.ts` and typed in `src/renderer/vite-env.d.ts`.
- Shared data contracts belong in `src/shared/types.ts`.
- Shared defaults belong in `src/shared/defaultSettings.ts`.
- Persist user settings through `src/main/store.ts`; avoid adding ad hoc localStorage usage unless there is a clear reason.
- Scheduler behavior belongs in `src/main/scheduler.ts`; renderer should only display clock/alarm events.
- Keep the first versions offline-first and local-only.

## Current Data Model

`AppSettings` currently contains:

- `language`: `zh-CN` or `en-US`.
- `chatFrequencyMinutes`.
- `clockEnabled`.
- `musicEnabled`.
- `volume`.
- `petPosition`.
- `alarms`.

`Alarm` currently contains:

- `id`.
- `time` in `HH:mm` format.
- `label`.
- `enabled`.

Alarm scheduling is currently a simple local minute match. There is no repeat model beyond effectively checking the same enabled alarm each day.

## UI Notes

- The pet window is 280x260, transparent, frameless, always on top, skipped from taskbar, and visible on all workspaces.
- The pet itself uses `-webkit-app-region: drag` to allow window dragging.
- Interactive child controls use `-webkit-app-region: no-drag`.
- The current character is pure CSS. Replace or extend it with original assets only.
- The settings panel is rendered inside the pet window, not as a separate BrowserWindow.

## Product Constraints

- Do not add copyrighted or lookalike assets from Nintendo or any other IP.
- Prefer original character identity, original dialogue, original audio, and original visual design.
- Keep the default experience low-distraction. Any new active behavior should have frequency controls or disable options.
- Do not make alarms intentionally inaccurate. Joke text is acceptable, but actual alarm triggering must stay reliable.
- Treat real room temperature as unavailable without hardware or an external integration. A pure Windows app cannot sense room temperature by itself.

## Good Next Steps

- Add real BGM and click/alarm sound playback, respecting `volume` and `musicEnabled`.
- Add a do-not-disturb schedule.
- Improve alarm repeat options.
- Add more dialogue metadata such as time-of-day, cooldown, and recently-used suppression.
- Add edge snapping and multi-monitor position clamping.
- Split settings UI into smaller renderer components once it grows.
- Add tests for dialogue selection and scheduler time matching if logic becomes more complex.

## Verification Expectations

For code changes, at minimum run:

```bash
npm run build
```

For Electron behavior changes, also smoke test:

```bash
npm run dev
```

If a GUI smoke test cannot be completed in the environment, say so explicitly in the final response.
