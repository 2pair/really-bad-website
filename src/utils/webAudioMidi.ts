export type NoteDurationType = 'full' | 'half' | 'quarter' | 'eighth';

export interface SongNote {
  melody: number; // Hz (0 = rest)
  bass: number;   // Hz (0 = rest)
  duration: NoteDurationType;
}

/**
 * Robust Web Audio API Synthesizer & Sound Effects Engine.
 * Features a long retro multi-measure opus at a slow tempo (66 BPM)
 * with a distinct blend of full (whole), half, quarter, and eighth notes.
 */
class WebAudioMidiSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private noteTimeoutId: any = null;
  private currentStep: number = 0;
  private masterGain: GainNode | null = null;
  private activeOscs: OscillatorNode[] = [];

  // Slow tempo: 66 BPM (1 beat = ~909ms)
  private readonly BPM = 66;

  // Rich 44-measure retro synth composition featuring full, half, quarter, and eighth notes
  private songNotes: SongNote[] = [
    // Measure 1-4: Grand Opening Theme (Full & Half Notes)
    { melody: 523.25, bass: 130.81, duration: 'full' },    // C5 / C3 (4 beats)
    { melody: 659.25, bass: 130.81, duration: 'half' },    // E5 / C3 (2 beats)
    { melody: 783.99, bass: 196.00, duration: 'quarter' }, // G5 / G3 (1 beat)
    { melody: 880.00, bass: 220.00, duration: 'quarter' }, // A5 / A3 (1 beat)

    // Measure 5-8: Melodic Steps & Eighth-Note Flourishes
    { melody: 783.99, bass: 196.00, duration: 'eighth' },  // G5 (0.5 beats)
    { melody: 659.25, bass: 164.81, duration: 'eighth' },  // E5 (0.5 beats)
    { melody: 587.33, bass: 146.83, duration: 'quarter' }, // D5 (1 beat)
    { melody: 523.25, bass: 130.81, duration: 'half' },    // C5 (2 beats)
    { melody: 587.33, bass: 196.00, duration: 'quarter' }, // D5 (1 beat)
    { melody: 659.25, bass: 130.81, duration: 'quarter' }, // E5 (1 beat)

    // Measure 9-12: Gentle Melancholy Half & Full Suspension
    { melody: 783.99, bass: 164.81, duration: 'half' },    // G5 (2 beats)
    { melody: 659.25, bass: 220.00, duration: 'eighth' },  // E5 (0.5 beats)
    { melody: 587.33, bass: 174.61, duration: 'eighth' },  // D5 (0.5 beats)
    { melody: 523.25, bass: 174.61, duration: 'quarter' }, // C5 (1 beat)
    { melody: 587.33, bass: 196.00, duration: 'full' },    // D5 (4 beats - full sustain)

    // Measure 13-16: Rising Arc to Emotional Apex
    { melody: 659.25, bass: 220.00, duration: 'half' },    // E5 (2 beats)
    { melody: 880.00, bass: 220.00, duration: 'quarter' }, // A5 (1 beat)
    { melody: 987.77, bass: 164.81, duration: 'quarter' }, // B5 (1 beat)
    { melody: 1046.50, bass: 174.61, duration: 'full' },  // C6 / F3 (4 beats - dramatic full peak)

    // Measure 17-20: Cascading Descent
    { melody: 987.77, bass: 196.00, duration: 'quarter' }, // B5 (1 beat)
    { melody: 880.00, bass: 174.61, duration: 'quarter' }, // A5 (1 beat)
    { melody: 783.99, bass: 164.81, duration: 'half' },    // G5 (2 beats)
    { melody: 659.25, bass: 130.81, duration: 'eighth' },  // E5 (0.5 beats)
    { melody: 783.99, bass: 130.81, duration: 'eighth' },  // G5 (0.5 beats)
    { melody: 880.00, bass: 146.83, duration: 'quarter' }, // A5 (1 beat)

    // Measure 21-24: Thoughtful Bridge
    { melody: 783.99, bass: 164.81, duration: 'quarter' }, // G5 (1 beat)
    { melody: 659.25, bass: 174.61, duration: 'half' },    // E5 (2 beats)
    { melody: 587.33, bass: 196.00, duration: 'quarter' }, // D5 (1 beat)
    { melody: 523.25, bass: 130.81, duration: 'half' },    // C5 (2 beats)
    { melody: 0,      bass: 196.00, duration: 'quarter' }, // Rest (1 beat)

    // Measure 25-28: Nostalgic Introspection
    { melody: 392.00, bass: 130.81, duration: 'eighth' },  // G4 (0.5 beats)
    { melody: 440.00, bass: 130.81, duration: 'eighth' },  // A4 (0.5 beats)
    { melody: 523.25, bass: 130.81, duration: 'quarter' }, // C5 (1 beat)
    { melody: 587.33, bass: 146.83, duration: 'quarter' }, // D5 (1 beat)
    { melody: 659.25, bass: 164.81, duration: 'half' },    // E5 (2 beats)
    { melody: 783.99, bass: 196.00, duration: 'half' },    // G5 (2 beats)

    // Measure 29-32: Triumphant Anthem & Turnaround
    { melody: 880.00, bass: 220.00, duration: 'full' },    // A5 (4 beats - full sustain)
    { melody: 783.99, bass: 196.00, duration: 'half' },    // G5 (2 beats)
    { melody: 659.25, bass: 164.81, duration: 'quarter' }, // E5 (1 beat)
    { melody: 587.33, bass: 174.61, duration: 'quarter' }, // D5 (1 beat)
    { melody: 523.25, bass: 196.00, duration: 'eighth' },  // C5 (0.5 beats)
    { melody: 587.33, bass: 196.00, duration: 'eighth' },  // D5 (0.5 beats)
    { melody: 659.25, bass: 196.00, duration: 'half' },    // E5 (2 beats)
    { melody: 523.25, bass: 130.81, duration: 'full' },    // C5 (4 beats - peaceful full resolution)
  ];

  /**
   * Initializes or resumes the AudioContext synchronously within an active user event.
   */
  public ensureAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext error', e);
      return null;
    }
  }

  public resumeContext() {
    return this.ensureAudioContext();
  }

  /**
   * Calculates duration in seconds for each note type based on 66 BPM.
   */
  private getDurationSeconds(duration: NoteDurationType): number {
    const beatSeconds = 60 / this.BPM; // ~0.909 seconds per beat
    switch (duration) {
      case 'full':
        return beatSeconds * 4; // ~3.64 seconds
      case 'half':
        return beatSeconds * 2; // ~1.82 seconds
      case 'quarter':
        return beatSeconds * 1; // ~0.91 seconds
      case 'eighth':
        return beatSeconds * 0.5; // ~0.45 seconds
    }
  }

  public startMidi() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;

    // Play gentle opening chime
    this.playImmediateTone(523.25, 0.25);

    // Start scheduling notes sequentially
    this.scheduleNextNote();
  }

  public stopMidi() {
    this.isPlaying = false;
    if (this.noteTimeoutId) {
      clearTimeout(this.noteTimeoutId);
      this.noteTimeoutId = null;
    }
    // Stop any active oscillators
    this.activeOscs.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.activeOscs = [];
  }

  public toggleMidi(): boolean {
    const ctx = this.ensureAudioContext();
    if (!ctx) return false;

    if (this.isPlaying) {
      this.stopMidi();
      return false;
    } else {
      this.startMidi();
      return true;
    }
  }

  public isMidiPlaying(): boolean {
    return this.isPlaying;
  }

  private playImmediateTone(freq: number, duration: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private scheduleNextNote() {

    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const currentNote = this.songNotes[this.currentStep % this.songNotes.length];
    const durationSec = this.getDurationSeconds(currentNote.duration);
    const now = this.ctx.currentTime;

    // Melody voice (Square wave with warm filter decay)
    if (currentNote.melody > 0) {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(currentNote.melody, now);

      // Articulation: slight envelope decay across the full duration
      const soundLength = Math.max(0.1, durationSec * 0.92);
      noteGain.gain.setValueAtTime(0.18, now);
      noteGain.gain.exponentialRampToValueAtTime(0.015, now + soundLength);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + soundLength + 0.05);
      this.activeOscs.push(osc);
    }

    // Bass voice (Triangle wave with warm mellow sustain)
    if (currentNote.bass > 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(currentNote.bass, now);

      const bassLength = Math.max(0.12, durationSec * 0.96);
      bassGain.gain.setValueAtTime(0.24, now);
      bassGain.gain.linearRampToValueAtTime(0.02, now + bassLength);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + bassLength + 0.05);
      this.activeOscs.push(bassOsc);
    }

    // Clean up terminated oscs
    if (this.activeOscs.length > 20) {
      this.activeOscs = this.activeOscs.slice(-10);
    }

    // Advance step
    this.currentStep++;

    // Schedule next note precisely when current note ends
    const durationMs = durationSec * 1000;
    this.noteTimeoutId = setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }

  /**
   * Loud, obnoxious "action canceled / forbidden" buzzer sound.
   */
  public playBuzzerSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.41);
  }

  /**
   * Chat sound effect: cheerful two-tone chime for incoming message from Todd.
   */
  public playChatReceiveSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 2-tone melodic notification (587.33Hz D5 -> 880Hz A5)
    [587.33, 880].forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  /**
   * Chat sound effect: outgoing snappy pop for user message.
   */
  public playChatSendSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Popup modal swoosh
   */
  public playPopupSwoosh() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const webMidi = new WebAudioMidiSynthesizer();
