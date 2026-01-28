// Simple synth sound manager using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private globalVolume: number = 0.3; // Increased base volume

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private init() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.3, startTime: number = 0) {
    if (!this.enabled || !this.ctx) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    // Envelope
    const effectiveVol = vol * 2.5; // BOOST VOLUME
    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(effectiveVol, this.ctx.currentTime + startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // New noise generator for rocks
  playNoise(duration: number) {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Louder noise
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
  }

  playMatch(combo: number) {
    if (!this.enabled || !this.ctx) return;
    this.init();
    const baseFreq = 523.25 + (combo * 50);
    this.playTone(baseFreq, 'sine', 0.4, 0.2);
  }

  playSwap() {
    this.playTone(300, 'triangle', 0.1, 0.15);
  }

  playBeam() {
      this.playTone(880, 'sawtooth', 0.1, 0.1);
      this.playTone(1760, 'sine', 0.2, 0.1, 0.1);
  }

  playWin() {
    // Victory Melody
    const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.3, 0.2, i * 0.2);
    });
  }

  playLose() {
    [400, 350, 300].forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.6, 0.2, i * 0.3);
    });
  }
  
  playCaptureSuccess() {
      // Happy jingle
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        this.playTone(freq, 'sine', 0.15, 0.2, i * 0.1);
      });
      this.playTone(1046.50, 'square', 0.4, 0.2, 0.4);
  }

  playShake() {
      this.playTone(150, 'sawtooth', 0.1, 0.1);
  }

  playRockBreak() {
      this.playNoise(0.3);
  }

  playIceBreak() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      [2000, 2500, 3000].forEach((freq, i) => {
          this.playTone(freq, 'sine', 0.1, 0.1, i * 0.05);
      });
  }

  playThrow() {
      if (!this.enabled || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
  }

  playButton() {
      this.playTone(800, 'sine', 0.05, 0.2);
  }
}

export const soundManager = new SoundManager();