# vibe-notify 🔊

Claude Code 会话的通知提示音。当 Claude 完成响应时播放可自定义的提示音/铃声 — 让你可以走开也能知道任务已完成。

## 快速开始

```bash
# 全局安装
npm install -g vibe-notify

# 测试一下
vibe-notify victory

# 创建配置文件
vibe-notify --init
```

或者无需安装直接运行：

```bash
npx -y vibe-notify victory
```

## 内置音效

| 音效 | 描述 |
|-------|-------------|
| `short-beep` | 一声短促提示音 — 快速确认 |
| `double-beep` | 两声短促提示音 — "任务完成了" |
| `ascending` | 三声渐高音调 — 正向进展 |
| `descending` | 三声渐低音调 — 任务完成，放松下来 |
| `victory` | C-E-G-C 琶音 — 庆祝胜利 |
| `custom` | 播放你自己的 `.wav` 文件 |

随时查看音效列表：`vibe-notify --list`

## 配置

配置文件位置（按顺序查找）：
1. **项目本地**：项目根目录下的 `.vibe-notify.json`
2. **全局**：`~/.vibe-notify/config.json`

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

| 键 | 值 | 说明 |
|-----|--------|-------------|
| `notify` | `"auto"` / `"on"` / `"off"` | 系统通知弹窗：根据静音状态智能显示、始终显示、或永不显示 |

### 自定义音频文件

```json
{
  "sound": "custom",
  "customFile": "C:\\Users\\You\\sounds\\done.wav",
  "volume": 1.0
}
```

## Claude Code Hook 设置

将以下内容添加到 `.claude/settings.json`（项目或全局），在 Claude 完成响应时自动播放：

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

如果已全局安装，将 `"npx", "-y", "vibe-notify"` 替换为 `"vibe-notify"`。

### 提问通知

当 Claude 向你提问时播放不同音效：

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

## CLI 参考

```
vibe-notify [options] [sound-name]

选项：
  --help, -h       显示帮助
  --list, -l       列出可用音效
  --config, -c     打印配置文件路径
  --init           创建默认配置文件
  --version, -v    显示版本
  --message, -m    自定义通知文本
```

## 工作原理

- **一个运行时依赖** (`loudness`) — 用于跨平台静音检测
- 内置音效以 WAV 格式在内存中生成（带包络的正弦波）
- 扬声器静音时自动弹出系统通知（`notify: "auto"`）
- 临时文件在播放后立即清理

### 文件格式支持

| 格式 | Windows | macOS | Linux |
|--------|---------|-------|-------|
| `.wav` | ✅ 原生 | ✅ 原生 | ✅ 原生 |
| `.mp3` / 其他 | ✅ ffplay¹ | ✅ 原生 | ✅ ffplay¹ |

¹ 安装 ffmpeg：`winget install ffmpeg` (Windows) / `sudo apt install ffmpeg` (Linux)

## 许可证

MIT
