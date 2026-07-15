import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Tone, PlaybackMethod } from './types';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Play a WAV buffer through the system audio output.
 * Writes to a temp file, plays it, then cleans up.
 */
export async function playBuffer(
  buffer: Buffer,
  method: PlaybackMethod = 'auto'
): Promise<void> {
  const tempFile = join(tmpdir(), `vibe-notify-${Date.now()}.wav`);

  try {
    writeFileSync(tempFile, buffer);
    const platform = process.platform;

    if (method === 'powershell' || (method === 'auto' && platform === 'win32')) {
      await playWithPowerShell(tempFile);
    } else if (method === 'afplay' || (method === 'auto' && platform === 'darwin')) {
      await playWithAfplay(tempFile);
    } else if (method === 'aplay' || (method === 'auto' && platform === 'linux')) {
      await playWithLinux(tempFile);
    } else if (method === 'native') {
      // "native" means try whatever the platform supports but don't use powershell/afplay/aplay
      // On Windows this falls through to the beep fallback
      throw new Error('Native method not supported for WAV playback');
    } else {
      // Cross-platform fallback: try PowerShell even on non-Windows (WSL, etc.)
      try {
        await playWithPowerShell(tempFile);
      } catch {
        await playWithLinux(tempFile);
      }
    }
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Temp file cleanup is best-effort
    }
  }
}

/**
 * Play a custom audio file (WAV) directly.
 */
export async function playFile(
  filePath: string,
  method: PlaybackMethod = 'auto'
): Promise<void> {
  const platform = process.platform;

  if (method === 'powershell' || (method === 'auto' && platform === 'win32')) {
    await playWithPowerShell(filePath);
  } else if (method === 'afplay' || (method === 'auto' && platform === 'darwin')) {
    await playWithAfplay(filePath);
  } else if (method === 'aplay' || (method === 'auto' && platform === 'linux')) {
    await playWithLinux(filePath);
  } else {
    await playWithPowerShell(filePath);
  }
}

/**
 * Fallback: play tones using system beep (no WAV generation needed).
 * Uses [System.Console]::Beep on Windows, terminal BEL on Unix.
 */
export async function fallbackBeep(tones: Tone[]): Promise<void> {
  const platform = process.platform;

  for (const tone of tones) {
    if (platform === 'win32') {
      await execPromise('powershell', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `[System.Console]::Beep(${tone.frequency}, ${Math.round(tone.duration * 1000)})`,
      ]);
    } else {
      // Terminal bell character
      process.stderr.write('\x07');
      await delay(tone.duration * 1000);
    }

    if (tone.gap && tone.gap > 0) {
      await delay(tone.gap * 1000);
    }
  }
}

// ── Platform-specific players ──────────────────────────────────────────────

async function playWithPowerShell(filePath: string): Promise<void> {
  const escaped = filePath.replace(/'/g, "''");
  await execPromise('powershell', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    `$p = New-Object System.Media.SoundPlayer('${escaped}'); $p.PlaySync()`,
  ]);
}

async function playWithAfplay(filePath: string): Promise<void> {
  await execPromise('afplay', [filePath]);
}

async function playWithLinux(filePath: string): Promise<void> {
  // Try PulseAudio first, fallback to ALSA
  try {
    await execPromise('paplay', [filePath]);
  } catch {
    try {
      await execPromise('aplay', [filePath]);
    } catch {
      // Last resort: try ffplay if available
      await execPromise('ffplay', ['-nodisp', '-autoexit', '-loglevel', 'quiet', filePath]);
    }
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────

function execPromise(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'ignore',
      windowsHide: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
