# 发布说明

---

## v0.3.0 — 系统通知 & 静音检测

### ✨ 新增功能

| 功能 | 说明 | 贡献者 |
|------|------|--------|
| 系统通知弹窗 | 任务完成时同时显示视觉通知 | — |
| 智能自动模式 | `notify: "auto"` 检测系统静音，仅在无声时显示通知 | — |
| 通知可配置 | `notify: "on"`（始终）、`"off"`（永不）、`"auto"`（智能） | — |

### 🛠️ 变更

| 变更 | 说明 | 贡献者 |
|------|------|--------|
| 新增 `loudness` 依赖 | 可靠的跨平台静音检测，无需原生编译 | — |
| 移除 COM/PowerShell 方案 | 用 `loudness` 替代了脆弱的 Windows 音频检测 | — |

### 📦 安装

```bash
npm install -g vibe-notify       # macOS / Linux
npm install -g vibe-notify       # Windows（无需额外步骤）
npx vibe-notify                  # 无需安装直接运行
```

---

## v0.2.2 — 直接文件路径 & 新音效

### ✨ 新增功能

| 功能 | 说明 | 贡献者 |
|------|------|--------|
| 直接文件路径参数 | `vibe-notify "C:\my-sound.wav"` 直接播放任意文件 | — |
| 村民交易音效 | `MC_Villager_Trade_Ask.wav` / `.mp3` 内置（适合提问钩子） | — |

### 🛠️ 变更

| 变更 | 说明 | 贡献者 |
|------|------|--------|
| CLI 接受文件路径 | 如果参数为存在的文件路径，则直接播放 | — |

### 📦 安装

```bash
npm install -g vibe-notify
```

---

## v0.2.1 — 文档更新

### ✨ 新增功能

| 功能 | 说明 | 贡献者 |
|------|------|--------|
| 格式支持表 | 所有 README 现在展示各平台的 `.wav`/`.mp3` 兼容性 | — |

### 📦 安装

```bash
npm install -g vibe-notify
```

---

## v0.2.0 — 内置默认音效

### ✨ 新增功能

| 功能 | 说明 | 贡献者 |
|------|------|--------|
| 内置默认音效 | `MC_Level_Up_Effect.wav` 随包发布 | — |
| 零配置体验 | `npx vibe-notify` 直接播放 Minecraft 升级音效 | — |
| WAV 默认格式 | `.wav` 在所有平台原生支持，无需 ffmpeg | — |

### 🛠️ 变更

| 变更 | 说明 | 贡献者 |
|------|------|--------|
| 默认配置更新 | `sound` 默认值改为 `"custom"`，回退到内置 `.wav` | — |
| `sounds/` 纳入版本管理 | 音效文件随 npm 包一起发布 | — |

### 🐛 修复

| 修复 | 说明 | 贡献者 |
|------|------|--------|
| Windows `.mp3` 播放 | 添加 ffplay 自动检测（winget 路径、PATH、常用位置） | — |

### 📦 安装

```bash
npm install -g vibe-notify
```

---

## v0.1.2 — 代码精简

### 🛠️ 变更

| 变更 | 说明 | 贡献者 |
|------|------|--------|
| 提取公共调度逻辑 | `playBuffer` 和 `playFile` 现在使用同一平台调度函数 | — |
| 移除冗余包装 | 清理了配置辅助函数 | — |
| 扁平化回退链 | 简化内置音效播放的嵌套 try/catch | — |
| 禁用 source map | CLI 工具无需生产环境调试映射 | — |
| **减少 77 行** | 功能不变，代码更少 | — |

### 📦 安装

```bash
npm install -g vibe-notify
```

---

## v0.1.1 — 国际化

### ✨ 新增功能

| 功能 | 说明 | 贡献者 |
|------|------|--------|
| 中文 README | `README.zh-CN.md` — 完整中文翻译 | — |
| 日本語 README | `README.ja.md` — 完整日语翻译 | — |
| 语言切换栏 | 每个 README 顶部添加语言切换栏 | — |

### 🐛 修复

| 修复 | 说明 | 贡献者 |
|------|------|--------|
| `.gitignore` 清理 | 将 `*.stackdump` 添加到 gitignore | — |
| 缺失 LICENSE | 创建 MIT 许可证文件 | — |
| 项目元数据 | 添加 author、repository、homepage 字段 | — |

### 📦 安装

```bash
# 首次公开发布到 npm！
npm install -g vibe-notify
npx vibe-notify victory
```

### 🔗 链接

- npm: https://www.npmjs.com/package/vibe-notify
- GitHub: https://github.com/GuanT0u/vibe-notify
