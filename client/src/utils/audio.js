// Web Audio API Sound Synthesizer for Authentic WhatsApp Audio
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.activeRingtone = null;
    this.activeCallingTone = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMessageSent() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playMessageReceived() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Note 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1); // A5
      gain2.gain.setValueAtTime(0.18, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  startIncomingRingtone() {
    this.stopIncomingRingtone();
    try {
      this.initCtx();
      if (!this.ctx) return () => {};

      let isPlaying = true;
      const notes = [
        { freq: 523.25, time: 0, dur: 0.15 },    // C5
        { freq: 659.25, time: 0.18, dur: 0.15 }, // E5
        { freq: 783.99, time: 0.36, dur: 0.2 },  // G5
        { freq: 1046.50, time: 0.6, dur: 0.3 },  // C6
        { freq: 783.99, time: 1.0, dur: 0.15 },  // G5
        { freq: 1046.50, time: 1.2, dur: 0.4 }   // C6
      ];

      const playPattern = () => {
        if (!isPlaying || !this.ctx) return;
        const start = this.ctx.currentTime;
        notes.forEach(n => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, start + n.time);
          gain.gain.setValueAtTime(0.25, start + n.time);
          gain.gain.exponentialRampToValueAtTime(0.001, start + n.time + n.dur);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start + n.time);
          osc.stop(start + n.time + n.dur);
        });
      };

      playPattern();
      const interval = setInterval(playPattern, 2600);

      this.activeRingtone = () => {
        isPlaying = false;
        clearInterval(interval);
      };
      return this.activeRingtone;
    } catch (e) {
      return () => {};
    }
  }

  stopIncomingRingtone() {
    if (this.activeRingtone) {
      this.activeRingtone();
      this.activeRingtone = null;
    }
  }

  startOutgoingDialTone() {
    this.stopOutgoingDialTone();
    try {
      this.initCtx();
      if (!this.ctx) return () => {};

      let isPlaying = true;
      const playBeep = () => {
        if (!isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      };

      playBeep();
      const interval = setInterval(playBeep, 3500);

      this.activeCallingTone = () => {
        isPlaying = false;
        clearInterval(interval);
      };
      return this.activeCallingTone;
    } catch (e) {
      return () => {};
    }
  }

  stopOutgoingDialTone() {
    if (this.activeCallingTone) {
      this.activeCallingTone();
      this.activeCallingTone = null;
    }
  }
}

export const sounds = new SoundEffects();