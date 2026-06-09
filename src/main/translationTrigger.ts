import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { globalShortcut } from 'electron';
import type { TranslationSettings } from '../shared/types';

type StopTrigger = () => void;

function encodePowerShell(script: string) {
  return Buffer.from(script, 'utf16le').toString('base64');
}

function startCtrlLongPressWatcher(delayMs: number, onTrigger: () => void): StopTrigger {
  if (process.platform !== 'win32') return () => undefined;

  let processRef: ChildProcessWithoutNullStreams | null = null;
  const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class SunpetKeyboardState {
  [DllImport("user32.dll")]
  public static extern short GetAsyncKeyState(int vKey);
}
"@
$delay = ${Math.max(250, Math.min(3000, Math.round(delayMs)))}
$downAt = $null
$sent = $false
while ($true) {
  $ctrl = ([SunpetKeyboardState]::GetAsyncKeyState(0x11) -band 0x8000) -ne 0
  $alt = ([SunpetKeyboardState]::GetAsyncKeyState(0x12) -band 0x8000) -ne 0
  $shift = ([SunpetKeyboardState]::GetAsyncKeyState(0x10) -band 0x8000) -ne 0
  $winLeft = ([SunpetKeyboardState]::GetAsyncKeyState(0x5B) -band 0x8000) -ne 0
  $winRight = ([SunpetKeyboardState]::GetAsyncKeyState(0x5C) -band 0x8000) -ne 0
  if ($ctrl -and -not $alt -and -not $shift -and -not $winLeft -and -not $winRight) {
    if ($null -eq $downAt) {
      $downAt = [Environment]::TickCount64
      $sent = $false
    } elseif (-not $sent -and ([Environment]::TickCount64 - $downAt) -ge $delay) {
      Write-Output "trigger"
      [Console]::Out.Flush()
      $sent = $true
    }
  } else {
    $downAt = $null
    $sent = $false
  }
  Start-Sleep -Milliseconds 45
}
`;

  processRef = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodePowerShell(script)], {
    windowsHide: true,
  });
  processRef.stdout.on('data', (chunk: Buffer) => {
    const lines = chunk.toString('utf8').split(/\r?\n/);
    if (lines.some((line) => line.trim() === 'trigger')) onTrigger();
  });
  processRef.on('exit', () => {
    processRef = null;
  });

  return () => {
    processRef?.kill();
    processRef = null;
  };
}

function registerShortcut(shortcut: string, onTrigger: () => void): StopTrigger {
  const accelerator = shortcut.trim();
  if (!accelerator) return () => undefined;
  const registered = globalShortcut.register(accelerator, onTrigger);
  if (!registered) {
    console.warn(`Sunpet could not register translation shortcut: ${accelerator}`);
    return () => undefined;
  }
  return () => globalShortcut.unregister(accelerator);
}

export function registerTranslationTrigger(settings: TranslationSettings, onTrigger: () => void): StopTrigger {
  if (!settings.enabled) return () => undefined;
  if (settings.triggerMode === 'shortcut') return registerShortcut(settings.shortcut, onTrigger);
  return startCtrlLongPressWatcher(settings.ctrlLongPressMs, onTrigger);
}
