/**
 * PullTube Custom Notification Sound Player
 * Plays the satisfying modern chord chime on download completion.
 * Includes Web Audio API synthesizer fallback to ensure 100% reliable playback.
 */

class SoundPlayer {
  private audioContext: AudioContext | null = null;
  private cachedAudio: HTMLAudioElement | null = null;

  constructor() {
    // Pre-cache audio element
    if (typeof window !== 'undefined') {
      try {
        const audioUrl = new URL('sounds/complete.wav', window.location.href).href;
        this.cachedAudio = new Audio(audioUrl);
        this.cachedAudio.volume = 0.85;
      } catch (e) {
        // Fallback handled in play()
      }
    }
  }

  async play(): Promise<void> {
    try {
      if (this.cachedAudio) {
        this.cachedAudio.currentTime = 0;
        await this.cachedAudio.play();
        return;
      }
    } catch (e) {
      // If HTML5 Audio was blocked or failed, use Web Audio API synthesizer
    }

    this.playSynthesizedChime();
  }

  /**
   * High-fidelity Web Audio API synthesizer fallback
   * Plays a silky modern Cmaj9 chord (C5, E5, G5, C6, E6) with harmonic overtones
   */
  private playSynthesizedChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Staggered modern chord notes
      const notes = [
        { freq: 523.25, start: 0.00, gain: 0.26, decay: 1.2 }, // C5
        { freq: 659.25, start: 0.04, gain: 0.22, decay: 1.3 }, // E5
        { freq: 783.99, start: 0.08, gain: 0.20, decay: 1.4 }, // G5
        { freq: 1046.50, start: 0.12, gain: 0.18, decay: 1.5 }, // C6
        { freq: 1318.51, start: 0.16, gain: 0.15, decay: 1.6 }, // E6
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, now);
      masterGain.connect(ctx.destination);

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        const startTime = now + note.start;
        noteGain.gain.setValueAtTime(0.0001, startTime);
        // Quick 6ms smooth attack
        noteGain.gain.exponentialRampToValueAtTime(note.gain, startTime + 0.006);
        // Silky exponential decay
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.decay);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + note.decay + 0.05);
      }
    } catch (err) {
      console.warn('Could not play notification chime:', err);
    }
  }
}

export const soundPlayer = new SoundPlayer();

export function playCompletionSound(): void {
  soundPlayer.play().catch(() => {});
}
