# Sunpet

Sunpet is a first-pass Windows desktop pet prototype inspired by small offline interactive toys. It uses Electron, React, and TypeScript.

## Current MVP

- Transparent always-on-top desktop pet window
- Click and drag interactions
- Random idle chatter with weighted dialogue lines
- System tray menu
- Settings panel
- Hourly time announcements
- Local one-shot daily alarm checks
- Chinese and English text switching
- Simple built-in CSS character animation

## Development

Install dependencies:

```bash
npm install
```

Run in development:

```bash
npm run dev
```

Build production files:

```bash
npm run build
```

Create Windows packages:

```bash
npm run package
```

## Notes

The MVP intentionally avoids copyrighted character assets, online services, AI dialogue, and real room-temperature sensing. Those should be added later only after the original character identity and privacy model are clear.
