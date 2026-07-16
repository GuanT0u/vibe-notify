import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { VibeNotifyConfig } from './types';

// ── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: VibeNotifyConfig = {
  sound: 'custom',
  customFile: null,
  volume: 0.7,
  notify: 'auto',
  playback: {
    method: 'auto',
  },
};

// ── Path resolution ────────────────────────────────────────────────────────

export function getConfigDir(): string {
  return join(homedir(), '.vibe-notify');
}

export function getConfigPath(): string {
  // Project-local config takes priority
  const local = resolve('.vibe-notify.json');
  if (existsSync(local)) {
    return local;
  }
  // Fall back to global config
  return join(getConfigDir(), 'config.json');
}


// ── Load / Save ────────────────────────────────────────────────────────────

export function loadConfig(): VibeNotifyConfig {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch (err) {
    console.error(
      `Warning: Could not read config at ${configPath}. Using defaults.`
    );
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: VibeNotifyConfig): void {
  const configPath = getConfigPath();
  const dir = getConfigDir();

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export function initConfig(): string {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    saveConfig({ ...DEFAULT_CONFIG });
  }
  return configPath;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mergeConfig(
  defaults: VibeNotifyConfig,
  overrides: Partial<VibeNotifyConfig>
): VibeNotifyConfig {
  return {
    ...defaults,
    ...overrides,
    playback: { ...defaults.playback, ...overrides.playback },
  };
}
