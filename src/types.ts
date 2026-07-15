/** A single tone in a sound pattern */
export interface Tone {
  /** Frequency in Hz */
  frequency: number;
  /** Duration in seconds */
  duration: number;
  /** Silence after this tone in seconds (optional) */
  gap?: number;
}

/** A named sound pattern composed of tones */
export interface Pattern {
  name: string;
  description: string;
  tones: Tone[];
}

/** Supported playback methods */
export type PlaybackMethod = 'auto' | 'powershell' | 'afplay' | 'aplay' | 'native';

/** Config file shape */
export interface VibeNotifyConfig {
  /** Built-in pattern name, or "custom" for a custom file */
  sound: string;
  /** Absolute path to a .wav file (used when sound === "custom") */
  customFile: string | null;
  /** Volume 0.0–1.0 */
  volume: number;
  /** Playback settings */
  playback: {
    method: PlaybackMethod;
  };
}

/** CLI action after parsing args */
export type CliAction =
  | { action: 'help' }
  | { action: 'list' }
  | { action: 'config' }
  | { action: 'init' }
  | { action: 'version' }
  | { action: 'play'; soundName?: string };
