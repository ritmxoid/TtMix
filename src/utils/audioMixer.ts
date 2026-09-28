// Audio Mixer & Player for synchronous preview and video recording integration
import { AudioState } from '../types';
import { generateProceduralTrack } from './audioGenerator';

function decodeAudioDataSafely(ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const bufCopy = buffer.slice(0);
      const res = ctx.decodeAudioData(
        bufCopy,
        (decoded) => resolve(decoded),
        (err) => reject(err)
      );
      if (res && typeof res.then === 'function') {
        res.then(resolve).catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}

class AudioMixer {
  private audioCtx: AudioContext | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private recordDestination: MediaStreamAudioDestinationNode | null = null;
  private cachedBuffer: AudioBuffer | null = null;
  private cachedPresetId: string | null = null;
  private cachedSeed: number | undefined = undefined;
  private cachedAudioUrl: string | null = null;
  private isPlaying = false;
  private isMuted = false;
  private startTime = 0;
  private pausedOffset = 0;
  private volumeMultiplier = 1.0;
  private currentBaseVolume = 0.7;
  private currentFileVolume = 0.8;

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public resume(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  private cachedVideoUrl: string | null = null;
  private cachedVideoBuffer: AudioBuffer | null = null;
  private inFlightAudioUrl: string | null = null;
  private inFlightAudioPromise: Promise<AudioBuffer | null> | null = null;

  public getAudioContext(): AudioContext {
    return this.getContext();
  }

  /**
   * Pre-loads and decodes the audio track from a video URL (e.g. uploaded video background)
   */
  public async prepareBackgroundVideoAudioBuffer(videoUrl: string): Promise<AudioBuffer | null> {
    if (!videoUrl) return null;
    if (this.cachedVideoBuffer && this.cachedVideoUrl === videoUrl) {
      return this.cachedVideoBuffer;
    }
    try {
      const response = await fetch(videoUrl);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getContext();
      const decoded = await decodeAudioDataSafely(ctx, arrayBuffer);
      this.cachedVideoBuffer = decoded;
      this.cachedVideoUrl = videoUrl;
      return decoded;
    } catch (err) {
      console.warn('Video background has no decodable audio track or audio decoding failed:', err);
      return null;
    }
  }

  /**
   * Pre-load or generate AudioBuffer for state
   */
  public async prepareAudioBuffer(
    audioState: AudioState,
    totalDuration: number,
    bgVideoUrl?: string
  ): Promise<AudioBuffer | null> {
    if (!audioState.enabled || audioState.sourceType === 'none') {
      this.cachedBuffer = null;
      return null;
    }

    this.resume();

    // If custom uploaded audio
    if ((audioState.sourceType === 'file' || Boolean(audioState.audioUrl)) && audioState.audioUrl) {
      if (this.cachedBuffer && this.cachedAudioUrl === audioState.audioUrl) {
        return this.cachedBuffer;
      }
      if (this.inFlightAudioPromise && this.inFlightAudioUrl === audioState.audioUrl) {
        return this.inFlightAudioPromise;
      }

      this.inFlightAudioUrl = audioState.audioUrl;
      this.inFlightAudioPromise = (async () => {
        try {
          const response = await fetch(audioState.audioUrl!);
          if (!response.ok) {
            throw new Error(`HTTP error fetching audio: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const ctx = this.getContext();
          const decoded = await decodeAudioDataSafely(ctx, arrayBuffer);
          this.cachedBuffer = decoded;
          this.cachedAudioUrl = audioState.audioUrl;
          return decoded;
        } catch (err) {
          console.error('Error decoding audio file:', err);
          return null;
        } finally {
          this.inFlightAudioPromise = null;
          this.inFlightAudioUrl = null;
        }
      })();

      return this.inFlightAudioPromise;
    }

    // If video sound source, decode audio from video background URL
    if (audioState.sourceType === 'video') {
      const targetUrl = audioState.audioUrl || bgVideoUrl;
      if (targetUrl) {
        const decoded = await this.prepareBackgroundVideoAudioBuffer(targetUrl);
        if (decoded) {
          this.cachedBuffer = decoded;
          this.cachedAudioUrl = targetUrl;
          return decoded;
        }
      }
      this.cachedBuffer = null;
      return null;
    }

    // If procedural generator preset
    if (audioState.sourceType === 'generator') {
      const currentSeed = audioState.seed ?? 1337;
      if (
        this.cachedBuffer &&
        this.cachedPresetId === audioState.presetId &&
        this.cachedSeed === currentSeed
      ) {
        return this.cachedBuffer;
      }
      try {
        const buffer = await generateProceduralTrack(
          audioState.presetId,
          Math.max(10, totalDuration + 2),
          currentSeed
        );
        this.cachedBuffer = buffer;
        this.cachedPresetId = audioState.presetId;
        this.cachedSeed = currentSeed;
        return buffer;
      } catch (err) {
        console.error('Error generating procedural track:', err);
        return null;
      }
    }

    return null;
  }

  private fileAudioElement: HTMLAudioElement | null = null;

  private ensureFileAudioElement(): HTMLAudioElement {
    if (!this.fileAudioElement) {
      let el = document.getElementById('typemixer-audio-el') as HTMLAudioElement | null;
      if (!el) {
        el = document.createElement('audio');
        el.id = 'typemixer-audio-el';
        el.preload = 'auto';
        el.setAttribute('playsinline', '');
        el.setAttribute('webkit-playsinline', '');
        document.body.appendChild(el);
      }
      this.fileAudioElement = el;
    }
    return this.fileAudioElement;
  }

  /**
   * Start or resume playback in sync with video preview
   */
  public async play(
    audioState: AudioState,
    totalDuration: number,
    offsetSeconds = 0,
    bgVideoUrl?: string
  ) {
    if (this.isMuted) {
      this.stop();
      return;
    }

    const synthVolume = typeof audioState.musicVolume === 'number'
      ? audioState.musicVolume
      : typeof audioState.volume === 'number'
      ? audioState.volume
      : 0.7;

    const fileVolume = typeof audioState.fileVolume === 'number'
      ? audioState.fileVolume
      : (audioState.sourceType === 'file' ? synthVolume : 0.8);

    const isSynthActive =
      audioState.enabled &&
      synthVolume > 0;

    const isFileActive =
      Boolean(audioState.audioUrl) &&
      audioState.fileAudioEnabled !== false &&
      fileVolume > 0;

    if (!isSynthActive && !isFileActive) {
      this.stop();
      return;
    }

    // 1. Handle user-uploaded audio file (HTMLAudioElement)
    if (isFileActive && audioState.audioUrl) {
      const safeFileVol = Math.max(0.001, Math.min(1, fileVolume * this.volumeMultiplier));
      const audioEl = this.ensureFileAudioElement();
      audioEl.volume = safeFileVol;
      audioEl.loop = audioState.loop ?? true;

      const isCurrentSrc = audioEl.src === audioState.audioUrl;
      if (!isCurrentSrc) {
        audioEl.src = audioState.audioUrl;
        audioEl.load();
      }

      const dur = audioEl.duration || audioState.audioDuration || totalDuration;
      const nonNegativeOffset = Number.isFinite(offsetSeconds) ? Math.max(0, offsetSeconds) : 0;
      if (Number.isFinite(dur) && dur > 0) {
        const safeOffset = nonNegativeOffset % dur;
        if (Math.abs(audioEl.currentTime - safeOffset) > 0.3) {
          try {
            audioEl.currentTime = Math.max(0, safeOffset);
          } catch {}
        }
      }

      if (audioEl.paused) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
    } else {
      if (this.fileAudioElement && !this.fileAudioElement.paused) {
        try {
          this.fileAudioElement.pause();
        } catch {}
      }
    }

    // 2. Handle procedural synth music (Web Audio Buffer)
    if (isSynthActive) {
      const rawVolume = Number.isFinite(synthVolume) ? Math.max(0.01, Math.min(1, synthVolume)) : 0.7;
      this.currentBaseVolume = rawVolume;
      const safeVolume = Math.max(0.001, Math.min(1, rawVolume * this.volumeMultiplier));

      const synthConfig = { ...audioState, sourceType: 'generator' as const };
      const buffer = await this.prepareAudioBuffer(synthConfig, totalDuration, bgVideoUrl);
      if (buffer) {
        if (this.currentSourceNode) {
          try {
            this.currentSourceNode.stop();
            this.currentSourceNode.disconnect();
          } catch {}
          this.currentSourceNode = null;
        }

        const ctx = this.getContext();
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch {}
        }
        this.gainNode = ctx.createGain();
        this.gainNode.gain.setValueAtTime(safeVolume, ctx.currentTime);
        this.gainNode.connect(ctx.destination);
        if (this.recordDestination) {
          try {
            this.gainNode.connect(this.recordDestination);
          } catch (err) {
            console.warn('Error connecting gain to recordDestination:', err);
          }
        }

        this.currentSourceNode = ctx.createBufferSource();
        this.currentSourceNode.buffer = buffer;
        this.currentSourceNode.loop = audioState.loop;
        this.currentSourceNode.connect(this.gainNode);

        const nonNegativeOffset = Number.isFinite(offsetSeconds) ? Math.max(0, offsetSeconds) : 0;
        const safeOffset = buffer.duration > 0 ? nonNegativeOffset % buffer.duration : 0;
        const clampedOffset = Math.max(0, Math.min(Math.max(0, buffer.duration - 0.001), safeOffset));

        try {
          this.currentSourceNode.start(0, clampedOffset);
        } catch (err) {
          console.warn('AudioBufferSourceNode start failed:', err);
        }
        this.startTime = ctx.currentTime - clampedOffset;
      }
    } else {
      if (this.currentSourceNode) {
        try {
          this.currentSourceNode.stop();
          this.currentSourceNode.disconnect();
        } catch {}
        this.currentSourceNode = null;
      }
    }

    this.isPlaying = isFileActive || isSynthActive;
  }

  /**
   * Attach/detach a MediaStreamAudioDestinationNode for live video capture recording
   */
  public setRecordingDestination(dest: MediaStreamAudioDestinationNode | null) {
    if (this.recordDestination && this.gainNode) {
      try {
        this.gainNode.disconnect(this.recordDestination);
      } catch {}
    }
    this.recordDestination = dest;
    if (this.recordDestination && this.gainNode) {
      try {
        this.gainNode.connect(this.recordDestination);
      } catch {}
    }
  }

  public getRecordingDestination(): MediaStreamAudioDestinationNode | null {
    return this.recordDestination;
  }

  /**
   * Stop preview audio and clear cached buffers
   */
  public clearCache() {
    this.stop();
    if (this.fileAudioElement) {
      try {
        this.fileAudioElement.pause();
        this.fileAudioElement.src = '';
      } catch {}
    }
    this.cachedBuffer = null;
    this.cachedAudioUrl = null;
    this.cachedPresetId = null;
    this.cachedSeed = undefined;
    this.cachedVideoBuffer = null;
    this.cachedVideoUrl = null;
  }

  /**
   * Stop preview audio
   */
  public stop() {
    if (this.fileAudioElement && !this.fileAudioElement.paused) {
      try {
        this.fileAudioElement.pause();
      } catch {}
    }
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // already stopped
      }
      this.currentSourceNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  /**
   * Update live preview volume for synth/generator
   */
  public setVolume(volume: number) {
    this.currentBaseVolume = Math.max(0, Math.min(1, volume));
    const effectiveVol = Math.max(0, Math.min(1, this.currentBaseVolume * this.volumeMultiplier));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(effectiveVol, this.audioCtx.currentTime);
    }
  }

  /**
   * Update live preview volume for custom audio file
   */
  public setFileVolume(volume: number) {
    this.currentFileVolume = Math.max(0, Math.min(1, volume));
    const effectiveVol = Math.max(0, Math.min(1, this.currentFileVolume * this.volumeMultiplier));
    if (this.fileAudioElement) {
      this.fileAudioElement.volume = effectiveVol;
    }
  }

  /**
   * Set dynamic volume multiplier (e.g. 0.10 for 10% quiet background during interactive help tour)
   */
  public setVolumeMultiplier(multiplier: number) {
    this.volumeMultiplier = Math.max(0, Math.min(1, multiplier));
    const effectiveSynthVol = Math.max(0, Math.min(1, this.currentBaseVolume * this.volumeMultiplier));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(effectiveSynthVol, this.audioCtx.currentTime);
    }
    const effectiveFileVol = Math.max(0, Math.min(1, this.currentFileVolume * this.volumeMultiplier));
    if (this.fileAudioElement) {
      this.fileAudioElement.volume = effectiveFileVol;
    }
  }

  public getVolumeMultiplier(): number {
    return this.volumeMultiplier;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Create an Audio MediaStreamDestination for mixing during video export
   */
  public createExportAudioNode(
    audioState: AudioState,
    buffer: AudioBuffer,
    ctx: AudioContext | OfflineAudioContext
  ): { sourceNode: AudioBufferSourceNode; gainNode: GainNode } {
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.loop = audioState.loop;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(audioState.volume, 0);

    sourceNode.connect(gainNode);
    return { sourceNode, gainNode };
  }
}

export const audioMixer = new AudioMixer();

/**
 * Mixes up to three AudioBuffers together with individual volumes using OfflineAudioContext.
 * Loops sources to targetDuration if needed.
 */
export async function mixAudioBuffers(
  buffer1: AudioBuffer | null,
  vol1: number,
  buffer2: AudioBuffer | null,
  vol2: number,
  durationSeconds: number,
  buffer3: AudioBuffer | null = null,
  vol3: number = 0
): Promise<AudioBuffer | null> {
  const validVol1 = Math.max(0, Math.min(1, Number.isFinite(vol1) ? vol1 : 0));
  const validVol2 = Math.max(0, Math.min(1, Number.isFinite(vol2) ? vol2 : 0));
  const validVol3 = Math.max(0, Math.min(1, Number.isFinite(vol3) ? vol3 : 0));

  const activeTracks: { buffer: AudioBuffer; vol: number }[] = [];
  if (buffer1 && validVol1 > 0.001) activeTracks.push({ buffer: buffer1, vol: validVol1 });
  if (buffer2 && validVol2 > 0.001) activeTracks.push({ buffer: buffer2, vol: validVol2 });
  if (buffer3 && validVol3 > 0.001) activeTracks.push({ buffer: buffer3, vol: validVol3 });

  if (activeTracks.length === 0) return null;

  if (activeTracks.length === 1) {
    return renderBufferWithGain(activeTracks[0].buffer, activeTracks[0].vol, durationSeconds);
  }

  const sampleRate = activeTracks[0].buffer.sampleRate || 44100;
  const numberOfChannels = Math.min(
    2,
    Math.max(...activeTracks.map((t) => t.buffer.numberOfChannels))
  );
  const totalLength = Math.max(1, Math.ceil(durationSeconds * sampleRate));

  const OfflineCtxClass =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtxClass(numberOfChannels, totalLength, sampleRate);

  for (const track of activeTracks) {
    const src = offlineCtx.createBufferSource();
    src.buffer = track.buffer;
    src.loop = true;
    const gain = offlineCtx.createGain();
    gain.gain.setValueAtTime(track.vol, 0);
    src.connect(gain);
    gain.connect(offlineCtx.destination);
    src.start(0);
  }

  return await offlineCtx.startRendering();
}

async function renderBufferWithGain(
  buffer: AudioBuffer,
  volume: number,
  durationSeconds: number
): Promise<AudioBuffer> {
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = Math.min(2, buffer.numberOfChannels);
  const totalLength = Math.max(1, Math.ceil(durationSeconds * sampleRate));

  const OfflineCtxClass =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtxClass(numberOfChannels, totalLength, sampleRate);

  const src = offlineCtx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const gain = offlineCtx.createGain();
  gain.gain.setValueAtTime(volume, 0);
  src.connect(gain);
  gain.connect(offlineCtx.destination);
  src.start(0);
  return await offlineCtx.startRendering();
}

/**
 * Prepares a mixed AudioBuffer combining background video audio, procedural synth music,
 * and user uploaded audio file for synchronous capture or export.
 */
export async function prepareDualAudioTrack(
  audioState: AudioState,
  bgMediaUrl: string | null | undefined,
  isBgVideo: boolean,
  durationSeconds: number
): Promise<AudioBuffer | null> {
  const isVideoAudioActive =
    isBgVideo &&
    !!bgMediaUrl &&
    audioState.videoAudioEnabled !== false &&
    (audioState.videoVolume ?? 0.8) > 0;

  const synthVol = typeof audioState.musicVolume === 'number'
    ? audioState.musicVolume
    : typeof audioState.volume === 'number'
    ? audioState.volume
    : 0.7;

  const isSynthActive =
    audioState.enabled &&
    synthVol > 0;

  const fileVol = typeof audioState.fileVolume === 'number'
    ? audioState.fileVolume
    : (audioState.sourceType === 'file' ? synthVol : 0.8);

  const isFileActive =
    Boolean(audioState.audioUrl) &&
    audioState.fileAudioEnabled !== false &&
    fileVol > 0;

  let videoBuffer: AudioBuffer | null = null;
  if (isVideoAudioActive && bgMediaUrl) {
    try {
      videoBuffer = await audioMixer.prepareBackgroundVideoAudioBuffer(bgMediaUrl);
    } catch (err) {
      console.warn('Could not extract video audio:', err);
    }
  }

  let synthBuffer: AudioBuffer | null = null;
  if (isSynthActive) {
    try {
      synthBuffer = await audioMixer.prepareAudioBuffer(
        { ...audioState, sourceType: 'generator' },
        durationSeconds,
        bgMediaUrl || undefined
      );
    } catch (err) {
      console.warn('Could not prepare synth buffer:', err);
    }
  }

  let fileBuffer: AudioBuffer | null = null;
  if (isFileActive && audioState.audioUrl) {
    try {
      fileBuffer = await audioMixer.prepareAudioBuffer(
        { ...audioState, sourceType: 'file' },
        durationSeconds,
        bgMediaUrl || undefined
      );
    } catch (err) {
      console.warn('Could not prepare file audio buffer:', err);
    }
  }

  const vidVol = audioState.videoVolume ?? 0.8;

  return await mixAudioBuffers(
    videoBuffer,
    vidVol,
    synthBuffer,
    synthVol,
    durationSeconds,
    fileBuffer,
    fileVol
  );
}

