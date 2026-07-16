import { spawn } from 'child_process';
import loudness from 'loudness';

/**
 * Check if system audio is muted/zero-volume.
 * Uses the 'loudness' package — native APIs on all platforms.
 */
export async function checkMuted(): Promise<boolean> {
  try {
    return await loudness.getMuted();
  } catch {
    return false;
  }
}

/**
 * Send a system notification toast/popup.
 * Uses platform-native notification APIs.
 */
export async function sendNotification(title: string, body: string): Promise<void> {
  const platform = process.platform;

  try {
    if (platform === 'win32') {
      await execPromise('powershell', [
        '-NoProfile', '-NonInteractive', '-Command',
        `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null;
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText01);
        $texts = $template.GetElementsByTagName('text');
        $texts.Item(0).AppendChild($template.CreateTextNode('${escapePS(body)}')) | Out-Null;
        $toast = New-Object Windows.UI.Notifications.ToastNotification($template);
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('vibe-notify').Show($toast);`,
      ]);
    } else if (platform === 'darwin') {
      await execPromise('osascript', [
        '-e', `display notification "${escapeApple(body)}" with title "${escapeApple(title)}"`,
      ]);
    } else {
      // Linux — try notify-send
      await execPromise('notify-send', ['--app-name=vibe-notify', title, body]);
    }
  } catch {
    // Notification failed silently — not critical
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────

function execPromise(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'ignore', windowsHide: true });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

function escapePS(s: string): string {
  return s.replace(/'/g, "''").replace(/"/g, '\\"');
}

function escapeApple(s: string): string {
  return s.replace(/"/g, '\\"');
}
