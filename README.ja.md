# vibe-notify 🔊

Claude Code セッションの通知音。Claude の応答が完了したときにカスタマイズ可能なビープ音/ジングルを再生します。席を離れていてもタスクの完了がわかります。

## クイックスタート

```bash
# グローバルにインストール
npm install -g vibe-notify

# テスト
vibe-notify victory

# 設定ファイルを作成
vibe-notify --init
```

インストールなしでも実行できます：

```bash
npx -y vibe-notify victory
```

## 内蔵サウンド

| サウンド | 説明 |
|-------|-------------|
| `short-beep` | 短いビープ音 — クイック確認 |
| `double-beep` | 2回の短いビープ音 — 「処理が完了しました」 |
| `ascending` | 3つの上昇音 — ポジティブな進行 |
| `descending` | 3つの下降音 — タスク完了、落ち着く |
| `victory` | C-E-G-C アルペジオ — 勝利のジングル |
| `custom` | 自分の `.wav` ファイルを再生 |

いつでも一覧表示：`vibe-notify --list`

## 設定

設定ファイルの場所（優先順）：
1. **プロジェクトローカル**：プロジェクトルートの `.vibe-notify.json`
2. **グローバル**：`~/.vibe-notify/config.json`

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

### カスタムサウンドファイル

```json
{
  "sound": "custom",
  "customFile": "C:\\Users\\You\\sounds\\done.wav",
  "volume": 1.0
}
```

## Claude Code フック設定

Claude の応答完了時に自動再生するには、`.claude/settings.json`（プロジェクトまたはグローバル）に以下を追加します：

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

グローバルインストールしている場合は `"npx", "-y", "vibe-notify"` を `"vibe-notify"` に置き換えてください。args にサウンド名（例：`"victory"`）を追加すると設定ファイルの設定を上書きできます。

## CLI リファレンス

```
vibe-notify [options] [sound-name]

オプション：
  --help, -h       ヘルプを表示
  --list, -l       利用可能なサウンドを一覧表示
  --config, -c     設定ファイルのパスを表示
  --init           デフォルト設定ファイルを作成
  --version, -v    バージョンを表示
```

## 仕組み

- **ランタイム依存ゼロ** — すべてのサウンド生成は純粋な Node.js で行います
- 内蔵サウンドは WAV オーディオとしてメモリ上で生成（エンベロープ付き正弦波）
- 再生にはネイティブシステムプレイヤーを使用：PowerShell SoundPlayer (Windows)、afplay (macOS)、paplay/aplay (Linux)
- WAV 再生に失敗した場合は `[System.Console]::Beep()` または端末ベルにフォールバック
- 一時ファイルは再生後すぐにクリーンアップ

## ライセンス

MIT
