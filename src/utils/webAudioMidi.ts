export type NoteDurationType = 'full' | 'half' | 'quarter' | 'eighth';

export interface SongNote {
  melody: number; // Hz (0 = rest)
  bass: number;   // Hz (0 = rest)
  duration: NoteDurationType;
}

/**
 * Robust, synchronous Web Audio API Synthesizer & Sound Effects Engine.
 * 
 * Complies with strict browser autoplay policies:
 * 1. Synchronous instantiation & resume directly inside user gesture event frames.
 * 2. Silent buffer source unlock trick to force audio hardware activation.
 * 3. Linear ramp envelopes to prevent exponential zero-crossing errors.
 * 4. Master gain routing (osc -> noteGain -> masterGain -> destination).
 * 5. Single-use oscillator node lifecycle.
 */
class WebAudioMidiSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMasterMuted: boolean = false;
  private noteTimeoutId: any = null;
  private currentStep: number = 0;
  private masterGain: GainNode | null = null;
  private activeOscs: OscillatorNode[] = [];
  private outEl: HTMLAudioElement | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;

  // Aloof plodding tempo: 80 BPM
  private readonly BPM = 80;

  // The iconic 19-note Kazumi Totaka Easter egg song ("Totaka's Song" / K.K. Song)
  // Characterized by an aloof, plodding stroll with quirky offbeat phrasing and staccato footsteps
  private songNotes: SongNote[] = [
    // Phrase 1: C - C - D - E - D - C - G
    { melody: 523.25, bass: 130.81, duration: 'quarter' }, // C5 / C3 (plodding step 1)
    { melody: 523.25, bass: 0,      duration: 'eighth' },  // C5
    { melody: 587.33, bass: 98.00,  duration: 'eighth' },  // D5 / G2 (plodding step 2)
    { melody: 659.25, bass: 0,      duration: 'quarter' }, // E5
    { melody: 587.33, bass: 0,      duration: 'eighth' },  // D5
    { melody: 523.25, bass: 130.81, duration: 'eighth' },  // C5 / C3
    { melody: 392.00, bass: 0,      duration: 'quarter' }, // G4

    // Phrase 2: E - C - G - E - C - G (The aloof descending triad repetitions)
    { melody: 659.25, bass: 98.00,  duration: 'quarter' }, // E5 / G2
    { melody: 523.25, bass: 0,      duration: 'quarter' }, // C5
    { melody: 392.00, bass: 130.81, duration: 'quarter' }, // G4 / C3
    { melody: 659.25, bass: 0,      duration: 'quarter' }, // E5
    { melody: 523.25, bass: 98.00,  duration: 'quarter' }, // C5 / G2
    { melody: 392.00, bass: 0,      duration: 'quarter' }, // G4

    // Phrase 3: D - E - C - D - B - C (The quirky turnaround & resolve)
    { melody: 587.33, bass: 130.81, duration: 'quarter' }, // D5 / C3
    { melody: 659.25, bass: 0,      duration: 'quarter' }, // E5
    { melody: 523.25, bass: 98.00,  duration: 'quarter' }, // C5 / G2
    { melody: 587.33, bass: 0,      duration: 'quarter' }, // D5
    { melody: 493.88, bass: 98.00,  duration: 'quarter' }, // B4 / G2
    { melody: 523.25, bass: 130.81, duration: 'half' },    // C5 / C3 (held resolve)

    // Aloof comical rest before the loop repeats
    { melody: 0,      bass: 0,      duration: 'quarter' }, // (Rest)
  ];

  public hasContext(): boolean {
    return this.ctx !== null;
  }

  /**
   * Initializes or resumes the AudioContext SYNCHRONOUSLY within a user interaction.
   * Routes output through an HTMLAudioElement via createMediaStreamDestination() so
   * iOS Safari upgrades the audio session from ambient to media playback.
   */
  public ensureAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMasterMuted ? 0 : 0.42;

        try {
          if (typeof this.ctx.createMediaStreamDestination === 'function') {
            const dest = this.ctx.createMediaStreamDestination();
            this.mediaStreamDest = dest;
            this.masterGain.connect(dest);
            this.outEl = new Audio();
            (this.outEl as any).srcObject = dest.stream;
            this.outEl.setAttribute('playsinline', '');
            this.outEl.setAttribute('webkit-playsinline', '');
          } else {
            this.masterGain.connect(this.ctx.destination);
          }
        } catch (err) {
          console.warn('MediaStreamDestination fallback to ctx.destination:', err);
          this.masterGain.connect(this.ctx.destination);
        }
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          console.log(this.ctx?.state);
        }).catch(() => {});
      } else {
        console.log(this.ctx.state);
      }

      // Activate playback session on iOS Safari directly within the user gesture
      if (this.outEl) {
        this.outEl.play().catch(() => {});
      }

      // Hardware wake-up trigger: play an instant 1-sample silent buffer directly in the user gesture
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch (e) {}

      return this.ctx;
    } catch (e) {
      console.warn('AudioContext init error:', e);
      return null;
    }
  }

  public setMasterMute(muted: boolean) {
    this.isMasterMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.42;
    }
    if (this.outEl) {
      this.outEl.muted = muted;
      if (!muted) {
        this.outEl.play().catch(() => {});
      }
    }
  }

  public getMasterMute(): boolean {
    return this.isMasterMuted;
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

  /**
   * Starts playing the retro MIDI loop immediately.
   */
  public startMidi() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;

    // Unmute master gain
    this.setMasterMute(false);

    // Play an immediate opening synth note directly
    this.playTone(523.25, 130.81, 0.45);

    // Schedule next note
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
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscs = [];
  }

  public toggleMidi(): boolean {
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

  private playTone(melody: number, bass: number, durationSec: number) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = Math.max(this.ctx.currentTime, 0) + 0.02;

      // Aloof melody voice (clean, detached staccato square/pulse)
      if (melody > 0) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Staccato articulation for aloof Totaka feel
        const melodySoundLength = Math.min(0.26, durationSec * 0.72);

        osc.type = 'square';
        osc.frequency.setValueAtTime(melody, now);

        // Punchy attack and fast aloof decay
        noteGain.gain.setValueAtTime(0.16, now);
        noteGain.gain.linearRampToValueAtTime(0.005, now + melodySoundLength);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + melodySoundLength + 0.02);
        this.activeOscs.push(osc);
      }

      // Plodding bass voice (short, detached acoustic footstep "bop")
      if (bass > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        const bassLength = Math.min(0.18, durationSec * 0.5);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bass, now);

        bassGain.gain.setValueAtTime(0.26, now);
        bassGain.gain.linearRampToValueAtTime(0.01, now + bassLength);

        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);

        bassOsc.start(now);
        bassOsc.stop(now + bassLength + 0.03);
        this.activeOscs.push(bassOsc);
      }
    } catch (e) {
      console.warn('Tone playback error:', e);
    }
  }

  private scheduleNextNote() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const currentNote = this.songNotes[this.currentStep % this.songNotes.length];
    const durationSec = this.getDurationSeconds(currentNote.duration);

    this.playTone(currentNote.melody, currentNote.bass, durationSec);

    // Clean up terminated oscs
    if (this.activeOscs.length > 20) {
      this.activeOscs = this.activeOscs.slice(-10);
    }

    // Advance step
    this.currentStep++;

    // Schedule next note
    const durationMs = durationSec * 1000;
    this.noteTimeoutId = setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }

  /**
   * Loud, obnoxious "action canceled / forbidden" buzzer sound.
   */
  public playBuzzerSound() {
    if (this.isMasterMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = Math.max(ctx.currentTime, 0) + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.4);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.41);
    } catch (e) {}
  }

  /**
   * Chat sound effect: cheerful two-tone chime for incoming message from Todd.
   */
  public playChatReceiveSound() {
    if (this.isMasterMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = Math.max(ctx.currentTime, 0) + 0.01;
      [587.33, 880].forEach((freq, idx) => {
        const t = now + idx * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch (e) {}
  }

  /**
   * Chat sound effect: outgoing snappy pop for user message.
   */
  public playChatSendSound() {
    if (this.isMasterMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = Math.max(ctx.currentTime, 0) + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  /**
   * Popup modal swoosh.
   */
  public playPopupSwoosh() {
    if (this.isMasterMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = Math.max(ctx.currentTime, 0) + 0.01;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

export const webMidi = new WebAudioMidiSynthesizer();
