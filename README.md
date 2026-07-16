# vibe-notify 🔊

[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

Notification sounds for Claude Code sessions. Plays a customizable beep/jingle when Claude finishes responding — so you can step away and still know when your task is done.

## Quick Start

```bash
# Install globally
npm install -g vibe-notify

# Test it
vibe-notify victory

# Set up config
vibe-notify --init
```

Or run without installing:

```bash
npx -y vibe-notify victory
```

## Built-in Sounds

| Sound | Description |
|-------|-------------|
| `short-beep` | Single short beep — quick acknowledgment |
| `double-beep` | Two quick beeps — "something finished" |
| `ascending` | Three rising tones — positive progression |
| `descending` | Three falling tones — winding down |
| `victory` | C-E-G-C arpeggio — celebratory jingle |
| `custom` | Play your own `.wav` file |

List them anytime: `vibe-notify --list`

## Configuration

Config file location (checked in order):
1. **Project-local**: `.vibe-notify.json` in your project root
2. **Global**: `~/.vibe-notify/config.json`

```json
{
  "sound": "ascending",
  "customFile": null,
  "volume": 0.7,
  "notify": "auto",
  "playback": {
    "method": "auto"
  }
}
```

| Key | Values | Description |
|-----|--------|-------------|
| `notify` | `"auto"` / `"on"` / `"off"` | System notification pop-up: smart by mute state, always, or never |

### Custom Sound File

```json
{
  "sound": "custom",
  "customFile": "C:\\Users\\You\\sounds\\done.wav",
  "volume": 1.0
}
```

## Claude Code Hook Setup

Add this to your `.claude/settings.json` (project or global) to auto-play when Claude finishes:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx",
            "args": ["-y", "vibe-notify"],
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

Replace `"npx", "-y", "vibe-notify"` with `"vibe-notify"` if installed globally.

### Question Notifications

Play a different sound when Claude asks you a question:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "AskUserQuestion",
        "hooks": [
          {
            "type": "command",
            "command": "npx",
            "args": ["-y", "vibe-notify", "D:\\codes\\vibe-coding-notify\\sounds\\MC_Villager_Trade_Ask.wav"],
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

## CLI Reference

```
vibe-notify [options] [sound-name | file-path]

Options:
  --help, -h       Show help
  --list, -l       List available sounds
  --config, -c     Print config file path
  --init           Create default config file
  --version, -v    Show version

You can also pass a path to a .wav/.mp3 file directly:
  vibe-notify "C:\my-sounds\alert.wav"
```

## How It Works

- **One runtime dependency** (`loudness`) — for cross-platform mute detection
- Built-in sounds are generated as WAV audio in-memory (sine waves with envelope)
- System notification pop-ups when speakers are muted (`notify: "auto"`)
- Temp files are cleaned up immediately after playback

### File Format Support

| Format | Windows | macOS | Linux |
|--------|---------|-------|-------|
| `.wav` | ✅ Native | ✅ Native | ✅ Native |
| `.mp3` / other | ✅ ffplay¹ | ✅ Native | ✅ ffplay¹ |

¹ Install ffmpeg: `winget install ffmpeg` (Windows) / `sudo apt install ffmpeg` (Linux)

## License

MIT
