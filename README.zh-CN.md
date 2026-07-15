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
  "playback": {
    "method": "auto"
  }
}
```

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

如果已全局安装，将 `"npx", "-y", "vibe-notify"` 替换为 `"vibe-notify"`。在 args 中添加音效名称（如 `"victory"`）可覆盖配置文件中的设置。

## CLI 参考

```
vibe-notify [options] [sound-name]

选项：
  --help, -h       显示帮助
  --list, -l       列出可用音效
  --config, -c     打印配置文件路径
  --init           创建默认配置文件
  --version, -v    显示版本
```

## 工作原理

- **零运行时依赖** — 所有音频均使用纯 Node.js 生成
- 内置音效以 WAV 格式在内存中生成（带包络的正弦波）
- 播放使用系统原生播放器：PowerShell SoundPlayer (Windows)、afplay (macOS)、paplay/aplay (Linux)
- 如果 WAV 播放失败，回退到 `[System.Console]::Beep()` 或终端响铃
- 临时文件在播放后立即清理

## 许可证

MIT
