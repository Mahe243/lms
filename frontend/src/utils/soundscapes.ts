// Web Audio API ambient soundscape engine
// Generates binaural beats, gentle rain, cafe hum, and pink noise purely in the browser.

export type SoundscapeType = 'none' | 'binaural_40hz' | 'library_rain' | 'coffeehouse' | 'pink_noise';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = 'none';
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }

  public stop() {
    if (this.ctx) {
      // Disconnect all active nodes
      this.activeNodes.forEach(item => {
        if (typeof item === 'number') {
          window.clearInterval(item);
        } else {
          try {
            (item as AudioScheduledSourceNode).stop?.();
            item.disconnect();
          } catch {
            // Ignore if already stopped
          }
        }
      });
      this.activeNodes = [];
    }
    this.currentType = 'none';
  }

  public play(type: SoundscapeType) {
    this.stop();
    if (type === 'none') return;

    this.initContext();
    if (!this.ctx) return;

    this.currentType = type;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'binaural_40hz') {
      this.startBinaural40Hz();
    } else if (type === 'library_rain') {
      this.startRain();
    } else if (type === 'coffeehouse') {
      this.startCoffeehouse();
    } else if (type === 'pink_noise') {
      this.startPinkNoise();
    }
  }

  private startBinaural40Hz() {
    if (!this.ctx || !this.gainNode) return;
    // 40Hz Gamma frequency difference: Left = 200Hz, Right = 240Hz
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    const pannerLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pannerLeft && pannerRight) {
      pannerLeft.pan.setValueAtTime(-1, this.ctx.currentTime);
      pannerRight.pan.setValueAtTime(1, this.ctx.currentTime);
      oscLeft.connect(pannerLeft).connect(this.gainNode);
      oscRight.connect(pannerRight).connect(this.gainNode);
      this.activeNodes.push(pannerLeft, pannerRight);
    } else {
      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(this.gainNode);
      this.activeNodes.push(merger);
    }

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight);
  }

  private startRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain hitting skylight
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  private startCoffeehouse() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // Warm sub-bass rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(58, this.ctx.currentTime);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noise.connect(filter).connect(this.gainNode);
    osc.connect(oscGain).connect(this.gainNode);

    noise.start();
    osc.start();
    this.activeNodes.push(noise, filter, osc, oscGain);
  }

  private startPinkNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.1;
      b2 = 0.85 * b2 + white * 0.2;
      output[i] = (b0 + b1 + b2) * 0.06;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    source.connect(this.gainNode);
    source.start();
    this.activeNodes.push(source);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
