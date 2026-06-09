import { execFile } from 'child_process';
import { clipboard } from 'electron';

function encodePowerShell(script: string) {
  return Buffer.from(script, 'utf16le').toString('base64');
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendCopyShortcut() {
  const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class SunpetInput {
  [DllImport("user32.dll")]
  public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
}
"@
$KEYEVENTF_KEYUP = 0x0002
$VK_CONTROL = 0x11
$VK_C = 0x43
[SunpetInput]::keybd_event($VK_CONTROL, 0, 0, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 35
[SunpetInput]::keybd_event($VK_C, 0, 0, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 35
[SunpetInput]::keybd_event($VK_C, 0, $KEYEVENTF_KEYUP, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 35
[SunpetInput]::keybd_event($VK_CONTROL, 0, $KEYEVENTF_KEYUP, [UIntPtr]::Zero)
`;
  return new Promise<void>((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encodePowerShell(script)], { windowsHide: true }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function readSelectedTextFromForegroundApp() {
  const previousText = clipboard.readText();
  await sendCopyShortcut();

  let selectedText = '';
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await wait(80);
    selectedText = clipboard.readText().trim();
    if (selectedText && selectedText !== previousText.trim()) break;
  }
  if (selectedText === previousText.trim()) return '';
  if (previousText && previousText !== selectedText) {
    // Restore plain text after the foreground app has had time to service Ctrl+C.
    setTimeout(() => clipboard.writeText(previousText), 400);
  }

  return selectedText;
}
