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
  private synthSourceNode: AudioBufferSourceNode | null = null;
  private synthGainNode: GainNode | null = null;
  private fileSourceNode: AudioBufferSourceNode | null = null;
  private fileGainNode: GainNode | null = null;
  private recordDestination: MediaStreamAudioDestinationNode | null = null;

  private cachedSynthBuffer: AudioBuffer | null = null;
  private cachedPresetId: string | null = null;
  private cachedSeed: number | undefined = undefined;

  private cachedFileBuffer: AudioBuffer | null = null;
  private cachedAudioUrl: string | null = null;

  private playingPresetId: string | null = null;
  private playingSeed: number | null = null;
  private playingFileUrl: string | null = null;

  private isPlaying = false;
  private isMuted = false;
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
    if (audioState.sourceType === 'none') {
      return null;
    }

    this.resume();

    // 1. If custom uploaded audio
    if (audioState.sourceType === 'file' && audioState.audioUrl) {
      if (this.cachedFileBuffer && this.cachedAudioUrl === audioState.audioUrl) {
        return this.cachedFileBuffer;
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
          this.cachedFileBuffer = decoded;
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

    // 2. If video sound source, decode audio from video background URL
    if (audioState.sourceType === 'video') {
      const targetUrl = audioState.audioUrl || bgVideoUrl;
      if (targetUrl) {
        const decoded = await this.prepareBackgroundVideoAudioBuffer(targetUrl);
        if (decoded) {
          this.cachedVideoBuffer = decoded;
          this.cachedVideoUrl = targetUrl;
          return decoded;
        }
      }
      return null;
    }

    // 3. If procedural generator preset
    if (audioState.sourceType === 'generator') {
      const currentSeed = audioState.seed ?? 1337;
      const presetId = audioState.presetId || 'lofi-chill';
      if (
        this.cachedSynthBuffer &&
        this.cachedPresetId === presetId &&
        this.cachedSeed === currentSeed
      ) {
        return this.cachedSynthBuffer;
      }
      try {
        const buffer = await generateProceduralTrack(
          presetId,
          Math.max(10, totalDuration + 2),
          currentSeed
        );
        this.cachedSynthBuffer = buffer;
        this.cachedPresetId = presetId;
        this.cachedSeed = currentSeed;
        return buffer;
      } catch (err) {
        console.error('Error generating procedural track:', err);
        return null;
      }
    }

    return null;
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
      : 0.8;

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

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }

    // 1. Handle procedural synth music (Web Audio Buffer)
    if (isSynthActive) {
      const rawSynthVol = Number.isFinite(synthVolume) ? Math.max(0.01, Math.min(1, synthVolume)) : 0.7;
      this.currentBaseVolume = rawSynthVol;
      const safeSynthVol = Math.max(0.0001, Math.min(1, rawSynthVol * this.volumeMultiplier));

      if (!this.synthGainNode) {
        this.synthGainNode = ctx.createGain();
        this.synthGainNode.connect(ctx.destination);
        if (this.recordDestination) {
          try {
            this.synthGainNode.connect(this.recordDestination);
          } catch {}
        }
      }
      this.synthGainNode.gain.setValueAtTime(safeSynthVol, ctx.currentTime);

      const targetPresetId = audioState.presetId || 'lofi-chill';
      const targetSeed = audioState.seed ?? 1337;
      const canKeepCurrentSynth =
        this.synthSourceNode &&
        this.playingPresetId === targetPresetId &&
        this.playingSeed === targetSeed &&
        offsetSeconds > 0;

      if (!canKeepCurrentSynth) {
        const synthConfig: AudioState = {
          ...audioState,
          sourceType: 'generator',
          audioUrl: null,
          volume: rawSynthVol,
          musicVolume: rawSynthVol,
        };

        const synthBuffer = await this.prepareAudioBuffer(synthConfig, totalDuration, bgVideoUrl);
        if (synthBuffer) {
          if (this.synthSourceNode) {
            try {
              this.synthSourceNode.stop();
              this.synthSourceNode.disconnect();
            } catch {}
            this.synthSourceNode = null;
          }

          this.synthSourceNode = ctx.createBufferSource();
          this.synthSourceNode.buffer = synthBuffer;
          this.synthSourceNode.loop = audioState.loop ?? true;
          this.synthSourceNode.connect(this.synthGainNode!);

          const nonNegativeOffset = Number.isFinite(offsetSeconds) ? Math.max(0, offsetSeconds) : 0;
          const safeOffset = synthBuffer.duration > 0 ? nonNegativeOffset % synthBuffer.duration : 0;
          const clampedOffset = Math.max(0, Math.min(Math.max(0, synthBuffer.duration - 0.001), safeOffset));

          try {
            this.synthSourceNode.start(0, clampedOffset);
            this.playingPresetId = targetPresetId;
            this.playingSeed = targetSeed;
          } catch (err) {
            console.warn('Synth BufferSourceNode start failed:', err);
          }
        }
      }
    } else {
      if (this.synthSourceNode) {
        try {
          this.synthSourceNode.stop();
          this.synthSourceNode.disconnect();
        } catch {}
        this.synthSourceNode = null;
      }
      this.playingPresetId = null;
      this.playingSeed = null;
    }

    // 2. Handle user-uploaded audio file (Web Audio Buffer)
    if (isFileActive && audioState.audioUrl) {
      const rawFileVol = Number.isFinite(fileVolume) ? Math.max(0.01, Math.min(1, fileVolume)) : 0.8;
      this.currentFileVolume = rawFileVol;
      const safeFileVol = Math.max(0.0001, Math.min(1, rawFileVol * this.volumeMultiplier));

      if (!this.fileGainNode) {
        this.fileGainNode = ctx.createGain();
        this.fileGainNode.connect(ctx.destination);
        if (this.recordDestination) {
          try {
            this.fileGainNode.connect(this.recordDestination);
          } catch {}
        }
      }
      this.fileGainNode.gain.setValueAtTime(safeFileVol, ctx.currentTime);

      const canKeepCurrentFile =
        this.fileSourceNode &&
        this.playingFileUrl === audioState.audioUrl &&
        offsetSeconds > 0;

      if (!canKeepCurrentFile) {
        const fileConfig: AudioState = {
          ...audioState,
          sourceType: 'file',
          audioUrl: audioState.audioUrl,
          fileVolume: rawFileVol,
        };

        const fileBuffer = await this.prepareAudioBuffer(fileConfig, totalDuration, bgVideoUrl);
        if (fileBuffer) {
          if (this.fileSourceNode) {
            try {
              this.fileSourceNode.stop();
              this.fileSourceNode.disconnect();
            } catch {}
            this.fileSourceNode = null;
          }

          this.fileSourceNode = ctx.createBufferSource();
          this.fileSourceNode.buffer = fileBuffer;
          this.fileSourceNode.loop = audioState.loop ?? true;
          this.fileSourceNode.connect(this.fileGainNode!);

          const dur = fileBuffer.duration || audioState.audioDuration || totalDuration;
          const nonNegativeOffset = Number.isFinite(offsetSeconds) ? Math.max(0, offsetSeconds) : 0;
          const safeOffset = dur > 0 ? nonNegativeOffset % dur : 0;
          const clampedOffset = Math.max(0, Math.min(Math.max(0, dur - 0.001), safeOffset));

          try {
            this.fileSourceNode.start(0, clampedOffset);
            this.playingFileUrl = audioState.audioUrl;
          } catch (err) {
            console.warn('File BufferSourceNode start failed:', err);
          }
        }
      }
    } else {
      if (this.fileSourceNode) {
        try {
          this.fileSourceNode.stop();
          this.fileSourceNode.disconnect();
        } catch {}
        this.fileSourceNode = null;
      }
      this.playingFileUrl = null;
    }

    this.isPlaying = isSynthActive || isFileActive;
  }

  /**
   * Attach/detach a MediaStreamAudioDestinationNode for live video capture recording
   */
  public setRecordingDestination(dest: MediaStreamAudioDestinationNode | null) {
    if (this.recordDestination) {
      if (this.synthGainNode) {
        try { this.synthGainNode.disconnect(this.recordDestination); } catch {}
      }
      if (this.fileGainNode) {
        try { this.fileGainNode.disconnect(this.recordDestination); } catch {}
      }
    }
    this.recordDestination = dest;
    if (this.recordDestination) {
      if (this.synthGainNode) {
        try { this.synthGainNode.connect(this.recordDestination); } catch {}
      }
      if (this.fileGainNode) {
        try { this.fileGainNode.connect(this.recordDestination); } catch {}
      }
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
    this.cachedSynthBuffer = null;
    this.cachedPresetId = null;
    this.cachedSeed = undefined;
    this.cachedFileBuffer = null;
    this.cachedAudioUrl = null;
    this.cachedVideoBuffer = null;
    this.cachedVideoUrl = null;
  }

  /**
   * Stop preview audio
   */
  public stop() {
    this.playingPresetId = null;
    this.playingSeed = null;
    this.playingFileUrl = null;

    if (this.synthSourceNode) {
      try {
        this.synthSourceNode.stop();
        this.synthSourceNode.disconnect();
      } catch {
        // already stopped
      }
      this.synthSourceNode = null;
    }
    if (this.synthGainNode) {
      try {
        this.synthGainNode.disconnect();
      } catch {}
      this.synthGainNode = null;
    }

    if (this.fileSourceNode) {
      try {
        this.fileSourceNode.stop();
        this.fileSourceNode.disconnect();
      } catch {
        // already stopped
      }
      this.fileSourceNode = null;
    }
    if (this.fileGainNode) {
      try {
        this.fileGainNode.disconnect();
      } catch {}
      this.fileGainNode = null;
    }

    this.isPlaying = false;
  }

  /**
   * Update live preview volume for synth/generator
   */
  public setVolume(volume: number) {
    this.currentBaseVolume = Math.max(0, Math.min(1, volume));
    const effectiveVol = Math.max(0, Math.min(1, this.currentBaseVolume * this.volumeMultiplier));
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setValueAtTime(effectiveVol, this.audioCtx.currentTime);
    }
  }

  /**
   * Update live preview volume for custom audio file
   */
  public setFileVolume(volume: number) {
    this.currentFileVolume = Math.max(0, Math.min(1, volume));
    const effectiveVol = Math.max(0, Math.min(1, this.currentFileVolume * this.volumeMultiplier));
    if (this.fileGainNode && this.audioCtx) {
      this.fileGainNode.gain.setValueAtTime(effectiveVol, this.audioCtx.currentTime);
    }
  }

  /**
   * Set dynamic volume multiplier (e.g. 0.10 for 10% quiet background during interactive help tour)
   */
  public setVolumeMultiplier(multiplier: number) {
    this.volumeMultiplier = Math.max(0, Math.min(1, multiplier));
    const effectiveSynthVol = Math.max(0, Math.min(1, this.currentBaseVolume * this.volumeMultiplier));
    if (this.synthGainNode && this.audioCtx) {
      this.synthGainNode.gain.setValueAtTime(effectiveSynthVol, this.audioCtx.currentTime);
    }
    const effectiveFileVol = Math.max(0, Math.min(1, this.currentFileVolume * this.volumeMultiplier));
    if (this.fileGainNode && this.audioCtx) {
      this.fileGainNode.gain.setValueAtTime(effectiveFileVol, this.audioCtx.currentTime);
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
    : 0.8;

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
        { ...audioState, sourceType: 'generator', audioUrl: null },
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

