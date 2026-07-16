# Release Notes

---

## v0.3.0 — System Notifications & Mute Detection

### ✨ What's New

| Feature | Description | By |
|---------|-------------|-----|
| System notification pop-ups | Visual alerts alongside sound when a task completes | — |
| Smart auto mode | `notify: "auto"` detects system mute and shows notification only when silent | — |
| Configurable notify | `notify: "on"` (always), `"off"` (never), `"auto"` (smart) | — |

### 🛠️ Changes

| Change | Description | By |
|--------|-------------|-----|
| `loudness` dependency | Reliable cross-platform mute detection, no native build required | — |
| Removed COM/PowerShell hacks | Replaced fragile Windows audio detection with `loudness` | — |

### 📦 Installation

```bash
npm install -g vibe-notify       # macOS / Linux
npm install -g vibe-notify       # Windows (no extra steps)
npx vibe-notify                  # Run without installing
```

---

## v0.2.2 — Direct File Path & New Sound

### ✨ What's New

| Feature | Description | By |
|---------|-------------|-----|
| Direct file path argument | `vibe-notify "C:\my-sound.wav"` plays any file immediately | — |
| Villager Trade sound | `MC_Villager_Trade_Ask.wav` / `.mp3` bundled (great for question hooks) | — |

### 🛠️ Changes

| Change | Description | By |
|--------|-------------|-----|
| CLI accepts file paths | If the argument is an existing file, it is played directly | — |

### 📦 Installation

```bash
npm install -g vibe-notify
```

---

## v0.2.1 — Documentation Update

### ✨ What's New

| Feature | Description | By |
|---------|-------------|-----|
| Format support table | All READMEs now show `.wav`/`.mp3` compatibility per platform | — |

### 📦 Installation

```bash
npm install -g vibe-notify
```

---

## v0.2.0 — Bundled Default Sound

### ✨ What's New

| Feature | Description | By |
|---------|-------------|-----|
| Bundled default sound | `MC_Level_Up_Effect.wav` shipped with the package | — |
| Zero-config experience | `npx vibe-notify` plays the Minecraft level-up sound out of the box | — |
| WAV default | `.wav` works natively on all platforms, no ffmpeg needed | — |

### 🛠️ Changes

| Change | Description | By |
|--------|-------------|-----|
| Default config updated | `sound` defaults to `"custom"`, falls back to bundled `.wav` | — |
| `sounds/` tracked in git | Sound files now shipped in the npm package | — |

### 🐛 Fixes

| Fix | Description | By |
|-----|-------------|-----|
| Windows `.mp3` playback | Added ffplay auto-detection (winget path, PATH, common locations) | — |

### 📦 Installation

```bash
npm install -g vibe-notify
```

---

## v0.1.2 — Code Simplification

### 🛠️ Changes

| Change | Description | By |
|--------|-------------|-----|
| Shared dispatch extraction | `playBuffer` and `playFile` now use one platform dispatch function | — |
| Removed redundant wrappers | Cleaned up config helpers | — |
| Flattened fallback chains | Simplified nested try/catch in built-in pattern playback | — |
| Disabled source maps | CLI tool doesn't need debug maps in production | — |
| **-77 lines** | Same functionality, less code | — |

### 📦 Installation

```bash
npm install -g vibe-notify
```

---

## v0.1.1 — Internationalization

### ✨ What's New

| Feature | Description | By |
|---------|-------------|-----|
| 中文 README | `README.zh-CN.md` — full Chinese translation | — |
| 日本語 README | `README.ja.md` — full Japanese translation | — |
| Language switcher | Language bar at the top of each README | — |

### 🐛 Fixes

| Fix | Description | By |
|-----|-------------|-----|
| `.gitignore` cleanup | Added `*.stackdump` to gitignore | — |
| Missing LICENSE | Created MIT license file | — |
| Project metadata | Added author, repository, homepage fields | — |

### 📦 Installation

```bash
# First public release on npm!
npm install -g vibe-notify
npx vibe-notify victory
```

### 🔗 Links

- npm: https://www.npmjs.com/package/vibe-notify
- GitHub: https://github.com/GuanT0u/vibe-notify
