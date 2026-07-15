import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, extname } from 'path';
import { Tone, PlaybackMethod } from './types';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Play a WAV buffer through the system audio output.
 * Writes to a temp file, plays it, then cleans up.
 */
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
    await dispatchPlay(tempFile, method);
  } finally {
    try { unlinkSync(tempFile); } catch { /* best-effort */ }
  }
}

/**
 * Play a custom audio file directly.
 * Supports .wav, .mp3, and any format the system can play.
 */
export async function playFile(
  filePath: string,
  method: PlaybackMethod = 'auto'
): Promise<void> {
  await dispatchPlay(filePath, method);
}

// ── Platform dispatch ─────────────────────────────────────────────────────

async function dispatchPlay(filePath: string, method: PlaybackMethod): Promise<void> {
  const platform = process.platform;
  const isWav = extname(filePath).toLowerCase() === '.wav';

  // Determine the target platform
  const target = resolvePlatform(method, platform);

  if (target === 'win32') {
    await (isWav ? playWithPowerShell(filePath) : playWithWindowsMedia(filePath));
  } else if (target === 'darwin') {
    await playWithAfplay(filePath);
  } else if (target === 'linux') {
    await playWithLinux(filePath);
  } else {
    throw new Error(`Unsupported platform: ${target}`);
  }
}

function resolvePlatform(method: PlaybackMethod, platform: string): string {
  if (method === 'powershell') return 'win32';
  if (method === 'afplay') return 'darwin';
  if (method === 'aplay') return 'linux';
  if (method === 'auto') return platform;
  return platform; // native or unknown → use current platform
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

/**
 * Play any audio format (mp3, wma, etc.) using ffplay.
 * Requires ffmpeg: `winget install ffmpeg`
 * Searches common install locations automatically.
 */
async function playWithWindowsMedia(filePath: string): Promise<void> {
  const ffplayPath = findFfplay();
  if (!ffplayPath) {
    throw new Error(
      'ffplay not found. Install ffmpeg to play .mp3 files:\n' +
      '  winget install ffmpeg\n' +
      'Or use a .wav file instead (plays natively).'
    );
  }
  await execPromise(ffplayPath, ['-nodisp', '-autoexit', '-loglevel', 'quiet', filePath]);
}

function findFfplay(): string | null {
  // Check common locations
  const candidates = [
    'ffplay', // In PATH
    ...scanWingetFfmpeg(),
    // Common manual install locations
    'C:\\ffmpeg\\bin\\ffplay.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffplay.exe',
  ];

  for (const candidate of candidates) {
    // For bare command name, just trust PATH (spawn will find it)
    if (candidate === 'ffplay') {
      try {
        require('child_process').execSync('where ffplay', { stdio: 'ignore' });
        return 'ffplay';
      } catch { continue; }
    }
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function scanWingetFfmpeg(): string[] {
  try {
    const wingetBase = process.env.LOCALAPPDATA + '\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe';
    if (!existsSync(wingetBase)) return [];
    const dirs = readdirSync(wingetBase).filter((d: string) => d.startsWith('ffmpeg-'));
    // Use most recent version first
    dirs.sort().reverse();
    return dirs.map((d: string) => wingetBase + '\\' + d + '\\bin\\ffplay.exe');
  } catch {
    return [];
  }
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
