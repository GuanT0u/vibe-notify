#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { parseArgs, showHelp, listSounds } from './cli';
import { loadConfig, initConfig, getConfigFilePath } from './config';
import { buildPatternBuffer, getPatternByName } from './beep';
import { playBuffer, playFile, fallbackBeep } from './player';

// Read version from package.json
let VERSION = '0.1.0';
try {
  // When running from dist/, package.json is one level up
  const pkg = JSON.parse(readFileSync(__dirname + '/../package.json', 'utf-8'));
  VERSION = pkg.version || VERSION;
} catch {
  // Fallback version
}

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
      console.log(getConfigFilePath());
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
        `Set "customFile" in ${getConfigFilePath()} to a .wav file path.`
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

  const buffer = buildPatternBuffer(soundName, config.volume);

  if (buffer) {
    try {
      await playBuffer(buffer, config.playback.method);
    } catch (err: any) {
      // WAV playback failed — try fallback beep
      const pattern = getPatternByName(soundName);
      if (pattern) {
        try {
          await fallbackBeep(pattern.tones);
        } catch {
          // Both methods failed — non-fatal, just warn
          console.error(`Could not play sound: ${err.message}`);
        }
      }
    }
  } else {
    // Buffer generation failed — fallback to system beep
    const pattern = getPatternByName(soundName);
    if (pattern) {
      await fallbackBeep(pattern.tones);
    }
  }
}

main().catch((err) => {
  console.error('vibe-notify error:', err.message);
  process.exit(1);
});
