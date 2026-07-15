#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseArgs, showHelp, listSounds } from './cli';
import { loadConfig, initConfig, getConfigPath } from './config';
import { buildPatternBuffer, getPatternByName } from './beep';
import { playBuffer, playFile, fallbackBeep } from './player';

// Read version from package.json
let VERSION = '0.1.0';
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  VERSION = pkg.version || VERSION;
} catch { /* use default */ }

async function main(): Promise<void> {
  const cli = parseArgs(process.argv.slice(2));

  // ── Info actions (no sound played) ───────────────────────────────────

  switch (cli.action) {
    case 'help':
      showHelp();
      return;

    case 'list':
      listSounds();
      return;

    case 'config':
      console.log(getConfigPath());
      return;

    case 'init': {
      const path = initConfig();
      console.log(`Config created at: ${path}`);
      return;
    }

    case 'version':
      console.log(`vibe-notify v${VERSION}`);
      return;

    case 'play':
      // Continue below
      break;
  }

  // ── Play sound ───────────────────────────────────────────────────────

  const config = loadConfig();
  const soundName = cli.soundName || config.sound;

  // Validate sound name
  if (soundName !== 'custom' && !getPatternByName(soundName)) {
    console.error(`Unknown sound: "${soundName}"`);
    console.error(`Use --list to see available sounds.`);
    process.exit(1);
  }

  // ── Custom file playback ─────────────────────────────────────────────

  if (soundName === 'custom') {
    if (!config.customFile) {
      console.error(
        'Sound is set to "custom" but no customFile is configured.'
      );
      console.error(
        `Set "customFile" in ${getConfigPath()} to a .wav or .mp3 file path.`
      );
      process.exit(1);
    }

    if (!existsSync(config.customFile)) {
      console.error(`Custom file not found: ${config.customFile}`);
      process.exit(1);
    }

    try {
      await playFile(config.customFile, config.playback.method);
    } catch (err: any) {
      console.error(`Failed to play custom file: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // ── Built-in pattern playback ────────────────────────────────────────

  const pattern = getPatternByName(soundName);
  const buffer = buildPatternBuffer(soundName, config.volume);

  try {
    if (buffer) {
      await playBuffer(buffer, config.playback.method);
    } else if (pattern) {
      await fallbackBeep(pattern.tones);
    }
  } catch {
    // WAV failed — try system beep as last resort
    if (pattern) {
      try { await fallbackBeep(pattern.tones); } catch { /* both failed, exit silently */ }
    }
  }
}

main().catch((err) => {
  console.error('vibe-notify error:', err.message);
  process.exit(1);
});
