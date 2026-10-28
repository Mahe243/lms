import confetti from 'canvas-confetti';

// Web Audio API context for zero-dependency sound effects & ambient study sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a realistic firecracker crackle and whistle using Web Audio
 */
export function playFirecrackerSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 1. Initial launch pop / thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // 2. Multi-pop crackle burst (simulating sparklers & festive firecrackers)
    const popCount = 7;
    for (let i = 0; i < popCount; i++) {
      const delay = 0.08 + i * 0.045 + Math.random() * 0.03;
      const crackleTime = now + delay;
      
      const bufferSize = ctx.sampleRate * 0.04;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 800, crackleTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 + Math.random() * 0.15, crackleTime);
      gain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(crackleTime);
      noise.stop(crackleTime + 0.05);
    }
  } catch (err) {
    // Audio might be blocked by browser autoplay policy before user gesture
    console.debug('Audio play skipped', err);
  }
}

/**
 * Fires a gorgeous Diwali Firecracker celebration burst across the screen
 */
export function triggerFirecrackerCelebration() {
  playFirecrackerSound();

  // Burst 1: Central vivid starburst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.65 },
    colors: ['#ff9900', '#ffd700', '#ff0055', '#a855f7', '#00f5d4'],
    startVelocity: 45,
    scalar: 1.2,
    shapes: ['star', 'circle'],
  });

  // Burst 2: Side rockets firing up like Diwali fountains
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.75 },
      colors: ['#ffaa00', '#ffea00', '#ff3366'],
      startVelocity: 55,
      scalar: 1.1,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.75 },
      colors: ['#ffaa00', '#ffea00', '#00ffff'],
      startVelocity: 55,
      scalar: 1.1,
    });
  }, 200);

  // Burst 3: Golden sparkle rain
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#ffd700', '#fff3a8', '#ff9900'],
      ticks: 200,
      gravity: 0.8,
      startVelocity: 25,
      shapes: ['star'],
    });
  }, 450);
}

/**
 * Fires a festive Christmas snow and holly celebration
 */
export function triggerChristmasCelebration() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Pleasant sleigh bell chime chords
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.7);
    });
  } catch (e) {}

  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ef4444', '#10b981', '#ffffff', '#fbbf24'],
    startVelocity: 35,
    shapes: ['circle', 'square'],
  });
}

// ==========================================
// Ambient Study Sound Generator (Web Audio)
// ==========================================
let activeSoundNode: { stop: () => void } | null = null;
let currentSoundType: 'lofi' | 'rain' | 'fire' | null = null;

export function stopAmbientStudySound() {
  if (activeSoundNode) {
    try {
      activeSoundNode.stop();
    } catch (e) {}
    activeSoundNode = null;
    currentSoundType = null;
  }
}

export function getCurrentStudySound(): string | null {
  return currentSoundType;
}

export function startAmbientStudySound(type: 'lofi' | 'rain' | 'fire'): string {
  stopAmbientStudySound();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (type === 'lofi') {
    // Binaural Alpha waves & warm drone (Relaxed, focused flow state)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, now); // Left ear base

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(226, now); // 10Hz binaural alpha frequency

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    masterGain.gain.setValueAtTime(0.08, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    activeSoundNode = {
      stop: () => {
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch (e) {}
        }, 900);
      }
    };
    currentSoundType = 'lofi';
    return 'lofi';
  } else if (type === 'rain') {
    // Soothing Study Rain (filtered pink noise)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);

    activeSoundNode = {
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        setTimeout(() => {
          try { whiteNoise.stop(); } catch (e) {}
        }, 600);
      }
    };
    currentSoundType = 'rain';
    return 'rain';
  } else {
    // Cozy Crackling Fireplace
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.03;
    }

    const fireNoise = ctx.createBufferSource();
    fireNoise.buffer = noiseBuffer;
    fireNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);

    fireNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    fireNoise.start(now);

    // Random pops timer
    const crackleInterval = setInterval(() => {
      if (Math.random() > 0.4 && ctx.state === 'running') {
        const popTime = ctx.currentTime;
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.frequency.setValueAtTime(600 + Math.random() * 900, popTime);
        popGain.gain.setValueAtTime(0.08 + Math.random() * 0.08, popTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.04);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(popTime);
        popOsc.stop(popTime + 0.05);
      }
    }, 180);

    activeSoundNode = {
      stop: () => {
        clearInterval(crackleInterval);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        setTimeout(() => {
          try { fireNoise.stop(); } catch (e) {}
        }, 600);
      }
    };
    currentSoundType = 'fire';
    return 'fire';
  }
}
