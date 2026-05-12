// audio.js — Web Audio SE playback
// Loads .au (Sun/NeXT) audio files and plays them via AudioContext

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = []; // AudioBuffer[]
    this.enabled = true;
    this.volume = 0; // Default: SE off
    // Restore volume from localStorage
    const saved = localStorage.getItem('suika_se_volume');
    if (saved !== null) this.volume = parseFloat(saved);
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('suika_se_volume', String(this.volume));
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not available');
      this.enabled = false;
    }
  }

  // Resume context (required after user gesture on mobile)
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Load a .au file and decode it
  async loadSE(url) {
    if (!this.ctx) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      // .au format: header then PCM data
      const decoded = this.decodeAU(arrayBuf);
      if (!decoded) return null;
      const audioBuffer = this.ctx.createBuffer(1, decoded.samples.length, decoded.sampleRate);
      audioBuffer.getChannelData(0).set(decoded.samples);
      return audioBuffer;
    } catch (e) {
      return null;
    }
  }

  // Decode Sun/NeXT .au format
  decodeAU(buffer) {
    const view = new DataView(buffer);
    // Magic: .snd (0x2e736e64)
    const magic = view.getUint32(0, false);
    if (magic !== 0x2e736e64) return null;

    const dataOffset = view.getUint32(4, false);
    const dataSize = view.getUint32(8, false);
    const encoding = view.getUint32(12, false);
    const sampleRate = view.getUint32(16, false);
    const channels = view.getUint32(20, false);

    // We support encoding 2 (8-bit linear PCM) and 3 (16-bit linear PCM)
    // and encoding 1 (8-bit mu-law)
    const rawData = new Uint8Array(buffer, dataOffset);
    let samples;

    if (encoding === 1) {
      // mu-law
      samples = new Float32Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        samples[i] = this.mulawDecode(rawData[i]);
      }
    } else if (encoding === 2) {
      // 8-bit linear PCM
      samples = new Float32Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        samples[i] = (rawData[i] - 128) / 128;
      }
    } else if (encoding === 3) {
      // 16-bit linear PCM (big endian)
      const numSamples = Math.floor(rawData.length / 2);
      samples = new Float32Array(numSamples);
      const dv = new DataView(buffer, dataOffset);
      for (let i = 0; i < numSamples; i++) {
        samples[i] = dv.getInt16(i * 2, false) / 32768;
      }
    } else {
      return null;
    }

    // If stereo, mix to mono
    if (channels === 2 && samples.length > 1) {
      const mono = new Float32Array(Math.floor(samples.length / 2));
      for (let i = 0; i < mono.length; i++) {
        mono[i] = (samples[i * 2] + samples[i * 2 + 1]) / 2;
      }
      samples = mono;
    }

    return { samples, sampleRate: sampleRate || 8000 };
  }

  // mu-law to linear conversion
  mulawDecode(mulaw) {
    mulaw = ~mulaw & 0xFF;
    const sign = (mulaw & 0x80) ? -1 : 1;
    const exponent = (mulaw >> 4) & 0x07;
    const mantissa = mulaw & 0x0F;
    const sample = sign * ((mantissa << (exponent + 3)) + (1 << (exponent + 3)) - 132);
    return sample / 32768;
  }

  // Load all SE files
  async loadAll(baseUrl, count, onProgress) {
    if (!this.ctx) return;
    for (let i = 0; i < count; i++) {
      const num = i.toString().padStart(2, '0');
      const buf = await this.loadSE(`${baseUrl}efc_${num}.au`);
      this.buffers.push(buf);
      if (onProgress) onProgress(i + 1, count);
    }
  }

  // Play a sound effect by index
  play(index) {
    if (!this.enabled || !this.ctx || index < 0 || index >= this.buffers.length) return;
    const buffer = this.buffers[index];
    if (!buffer) return;

    this.resume();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = this.volume;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(0);
  }
}
