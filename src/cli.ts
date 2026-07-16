import { CliAction } from './types';
import { PATTERNS } from './beep';

// ── Public API ─────────────────────────────────────────────────────────────

export function parseArgs(argv: string[]): CliAction {
  let soundName: string | undefined;
  let message: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { action: 'help' };
    if (arg === '--list' || arg === '-l') return { action: 'list' };
    if (arg === '--config' || arg === '-c') return { action: 'config' };
    if (arg === '--init') return { action: 'init' };
    if (arg === '--version' || arg === '-v') return { action: 'version' };
    if ((arg === '--message' || arg === '-m') && i + 1 < argv.length) {
      message = argv[++i];
    } else if (!arg.startsWith('-')) {
      soundName = arg;
    }
  }

  return { action: 'play', soundName, message };
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
  --message, -m    Custom notification message (default: "Task complete!")

Arguments:
  sound-name       Play a specific sound (overrides config file):
                   ${PATTERNS.map((p) => p.name).join(', ')}

  If no sound-name is given, plays the sound from the config file.

Examples:
  vibe-notify victory          Play the victory jingle
  vibe-notify --list           See all available sounds
  vibe-notify -m "Done!"       Custom notification message

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
