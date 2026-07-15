import { Pattern, Tone } from './types';

// ── WAV constants ──────────────────────────────────────────────────────────
const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8; // 2

// ── Built-in sound patterns ────────────────────────────────────────────────

export const PATTERNS: Pattern[] = [
  {
    name: 'short-beep',
    description: 'A single short beep — quick task-complete acknowledgment',
    tones: [{ frequency: 880, duration: 0.15 }],
  },
  {
    name: 'double-beep',
    description: 'Two quick beeps — "something just finished"',
    tones: [
      { frequency: 660, duration: 0.1, gap: 0.08 },
      { frequency: 880, duration: 0.15 },
    ],
  },
  {
    name: 'ascending',
    description: 'Three rising tones — positive progression',
    tones: [
      { frequency: 400, duration: 0.15, gap: 0.05 },
      { frequency: 600, duration: 0.15, gap: 0.05 },
      { frequency: 800, duration: 0.2 },
    ],
  },
  {
    name: 'descending',
    description: 'Three falling tones — task complete, winding down',
    tones: [
      { frequency: 800, duration: 0.15, gap: 0.05 },
      { frequency: 600, duration: 0.15, gap: 0.05 },
      { frequency: 400, duration: 0.2 },
    ],
  },
  {
    name: 'victory',
    description: 'Victory jingle — C5-E5-G5-C6 arpeggio',
    tones: [
      { frequency: 523.25, duration: 0.12, gap: 0.06 },
      { frequency: 659.25, duration: 0.12, gap: 0.06 },
      { frequency: 783.99, duration: 0.12, gap: 0.06 },
      { frequency: 1046.5, duration: 0.3 },
    ],
  },
];

// ── Pattern lookup ─────────────────────────────────────────────────────────

export function getPatternByName(name: string): Pattern | undefined {
  return PATTERNS.find((p) => p.name === name);
}

// ── WAV generation ─────────────────────────────────────────────────────────

/**
 * Build a complete 16-bit PCM mono WAV buffer from a list of tones.
 * Returns null if the pattern name is not found.
 */
export function buildPatternBuffer(
  patternName: string,
  volume: number = 0.7
): Buffer | null {
  const pattern = getPatternByName(patternName);
  if (!pattern) return null;
  return generateWav(pattern.tones, SAMPLE_RATE, clampVolume(volume));
}

/**
 * Generate a WAV file buffer from an array of Tone objects.
 */
export function generateWav(
  tones: Tone[],
  sampleRate: number,
  volume: number
): Buffer {
  // Calculate total samples needed
  let totalSamples = 0;
  for (const tone of tones) {
    totalSamples += Math.ceil(tone.duration * sampleRate);
    if (tone.gap && tone.gap > 0) {
      totalSamples += Math.ceil(tone.gap * sampleRate);
    }
  }

  const dataSize = totalSamples * BYTES_PER_SAMPLE;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // Write WAV header
  writeWavHeader(buffer, dataSize, sampleRate);

  // Generate audio samples
  const samples = generateSamples(tones, sampleRate, volume, totalSamples);

  // Write 16-bit PCM samples (little-endian)
  let offset = headerSize;
  for (let i = 0; i < totalSamples; i++) {
    // Clamp to 16-bit range
    const sample = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)));
    buffer.writeInt16LE(sample, offset);
    offset += 2;
  }

  return buffer;
}

// ── Internal helpers ───────────────────────────────────────────────────────

function clampVolume(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function writeWavHeader(
  buffer: Buffer,
  dataSize: number,
  sampleRate: number
): void {
  const byteRate = sampleRate * NUM_CHANNELS * BYTES_PER_SAMPLE;
  const blockAlign = NUM_CHANNELS * BYTES_PER_SAMPLE;

  // RIFF header
  buffer.write('RIFF', 0, 'ascii');
  buffer.writeUInt32LE(36 + dataSize, 4); // ChunkSize
  buffer.write('WAVE', 8, 'ascii');

  // fmt sub-chunk
  buffer.write('fmt ', 12, 'ascii');
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM = 16)
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM = 1)
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);

  // data sub-chunk
  buffer.write('data', 36, 'ascii');
  buffer.writeUInt32LE(dataSize, 40);
}

function generateSamples(
  tones: Tone[],
  sampleRate: number,
  volume: number,
  totalSamples: number
): Float32Array {
  const samples = new Float32Array(totalSamples);
  let offset = 0;

  for (const tone of tones) {
    const toneSamples = Math.ceil(tone.duration * sampleRate);
    const attackSamples = Math.ceil(0.01 * sampleRate); // 10ms attack
    const releaseSamples = Math.ceil(0.02 * sampleRate); // 20ms release

    for (let i = 0; i < toneSamples; i++) {
      const t = i / sampleRate;
      let sample = Math.sin(2 * Math.PI * tone.frequency * t) * volume;

      // Apply envelope to prevent clicks
      if (i < attackSamples) {
        sample *= i / attackSamples; // Linear fade-in
      } else if (i >= toneSamples - releaseSamples) {
        sample *= (toneSamples - i) / releaseSamples; // Linear fade-out
      }

      samples[offset + i] = sample;
    }
    offset += toneSamples;

    // Write silence for gap
    if (tone.gap && tone.gap > 0) {
      const gapSamples = Math.ceil(tone.gap * sampleRate);
      offset += gapSamples; // Float32Array is already zero-filled
    }
  }

  return samples;
}
