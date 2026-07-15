import { CliAction } from './types';
import { PATTERNS } from './beep';

// ── Public API ─────────────────────────────────────────────────────────────

export function parseArgs(argv: string[]): CliAction {
  const args = argv.slice(); // copy

  if (args.length === 0) {
    return { action: 'play' }; // Play configured sound
  }

  const first = args[0];

  // Handle flags
  switch (first) {
    case '--help':
    case '-h':
      return { action: 'help' };

    case '--list':
    case '-l':
      return { action: 'list' };

    case '--config':
    case '-c':
      return { action: 'config' };

    case '--init':
      return { action: 'init' };

    case '--version':
    case '-v':
      return { action: 'version' };
  }

  // Anything else is treated as a sound name
  return { action: 'play', soundName: first };
}

// ── Display helpers ────────────────────────────────────────────────────────

export function showHelp(): void {
  console.log(`vibe-notify — Notification sounds for Claude Code

Usage:
  vibe-notify [options] [sound-name]

Options:
  --help, -h       Show this help message
  --list, -l       List available built-in sounds
  --config, -c     Print the config file path
  --init           Create a default config file at ~/.vibe-notify/config.json
  --version, -v    Show version number

Arguments:
  sound-name       Play a specific sound (overrides config file):
                   ${PATTERNS.map((p) => p.name).join(', ')}

  If no sound-name is given, plays the sound from the config file.

Examples:
  vibe-notify victory          Play the victory jingle
  vibe-notify --list           See all available sounds
  vibe-notify --init           Set up your config file

Config file: ~/.vibe-notify/config.json (or .vibe-notify.json in project root)
Claude Code hook: Add to .claude/settings.json → hooks.Stop
`);
}

export function listSounds(): void {
  console.log('Available built-in sounds:\n');
  for (const pattern of PATTERNS) {
    console.log(`  ${pattern.name.padEnd(14)} ${pattern.description}`);
  }
  console.log(`\n  ${'custom'.padEnd(14)} Play a custom .wav file (set "customFile" in config)`);
  console.log(`\nUse "vibe-notify <name>" to play one, or set "sound" in your config file.`);
}
