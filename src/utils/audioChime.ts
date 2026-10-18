/**
 * Web Audio API synthesizer for meditative singing bowls and celebratory spiritual chimes
 * Uses zero external audio files so it is 100% reliable in all environments.
 */
class SpiritualChimeManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a peaceful Tibetan singing bowl / meditative chime
   */
  playMeditationChime(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Base fundamental + harmonic overtones
      const freqs = [432, 864, 1296];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const volume = (0.2 / (idx + 1));
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.6);
      });
    } catch (e) {
      console.warn('Audio chime unsupported or muted:', e);
    }
  }

  /**
   * Play a gentle affirmation bell for task completion
   */
  playCompletionChime(): void {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(528, now); // 528Hz - frequency of peace & clarity
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);
    } catch (e) {
      console.warn('Audio chime muted:', e);
    }
  }
}

export const spiritualAudio = new SpiritualChimeManager();
