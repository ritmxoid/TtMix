import React from 'react';
import {
  Music,
  Film,
  FileAudio,
  Volume2,
  VolumeX,
  X,
  Sliders,
} from 'lucide-react';
import { VideoProjectState } from '../types';
import { audioMixer } from '../utils/audioMixer';
import { useLanguage } from '../context/LanguageContext';

interface MultiTrackVolumePopoverProps {
  state: VideoProjectState;
  onChange: (patch: Partial<VideoProjectState>) => void;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute?: () => void;
  bgMediaElement?: HTMLImageElement | HTMLVideoElement | null;
  className?: string;
  align?: 'center' | 'left' | 'right';
}

export const MultiTrackVolumePopover: React.FC<MultiTrackVolumePopoverProps> = ({
  state,
  onChange,
  onClose,
  isMuted,
  onToggleMute,
  bgMediaElement,
  className = '',
  align = 'center',
}) => {
  const { t } = useLanguage();

  // 1. Procedural Synth Melody Track (Always available)
  const isSynthTrack = true;
  const synthVolume =
    typeof state.audio.musicVolume === 'number'
      ? state.audio.musicVolume
      : typeof state.audio.volume === 'number'
      ? state.audio.volume
      : 0.7;
  const isSynthMuted = !state.audio.enabled || isMuted || synthVolume === 0;

  // 2. Video Background Original Sound Track
  const hasVideoTrack = Boolean(
    (state.bgType === 'video' || state.bgMediaType === 'video' || bgMediaElement instanceof HTMLVideoElement) &&
      (Boolean(state.bgMediaUrl) || Boolean(bgMediaElement))
  );
  const videoVolume = state.audio.videoVolume ?? 0.8;
  const isVideoMuted =
    state.audio.videoAudioEnabled === false || isMuted || videoVolume === 0;

  // 3. User Uploaded Audio File / Voiceover Track
  const hasFileTrack = Boolean(
    state.audio.audioUrl &&
      (state.audio.sourceType === 'file' || Boolean(state.audio.audioFileName))
  );
  const fileVolume =
    typeof state.audio.fileVolume === 'number'
      ? state.audio.fileVolume
      : 0.8;
  const isFileMuted =
    state.audio.fileAudioEnabled === false || isMuted || fileVolume === 0;

  // Calculate total active columns
  const activeColumnsCount =
    (isSynthTrack ? 1 : 0) + (hasVideoTrack ? 1 : 0) + (hasFileTrack ? 1 : 0);

  const alignClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <>
      {/* Invisible backdrop to dismiss on click outside */}
      <div
        className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-[0.5px]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Floating Multi-Track Mixer Card - Centered on screen axis above timers */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-[100] bg-black/35 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 rounded-3xl shadow-2xl shadow-black/60 flex flex-col items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150 text-white pointer-events-auto select-none min-w-[130px] ${className}`}
      >
        {/* Header with Title and Track Count */}
        <div className="flex items-center justify-between w-full px-1 border-b border-white/10 pb-1.5 gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-200">
            <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              {activeColumnsCount === 1
                ? t('volumeLabel', 'Громкость')
                : activeColumnsCount === 2
                ? t('mixer2Tracks', 'Микшер (2 дорожки)')
                : t('mixer3Tracks', 'Микшер (3 дорожки)')}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title={t('back', 'Закрыть')}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Track Columns Stack */}
        <div className="flex items-end justify-center gap-3 sm:gap-4.5 pt-1 px-1">
          {/* TRACK 1: 🎵 Procedural Synth Melody */}
          <div className="flex flex-col items-center gap-2 w-16 sm:w-18">
            {/* Top % Badge */}
            <span
              className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md border ${
                isSynthMuted
                  ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                  : 'text-purple-200 bg-purple-950/60 border-purple-500/40'
              }`}
            >
              {isSynthMuted ? 'MUTE' : `${Math.round(synthVolume * 100)}%`}
            </span>

            {/* Vertical Range Slider */}
            <div className="py-1 flex items-center justify-center">
              <input
                type="range"
                min={0}
                max={100}
                value={isSynthMuted ? 0 : Math.round(synthVolume * 100)}
                onChange={(e) => {
                  const rawVal = parseInt(e.target.value, 10);
                  const val = rawVal / 100;
                  const isEnabled = rawVal > 0;
                  audioMixer.setVolume(val);
                  onChange({
                    audio: {
                      ...state.audio,
                      volume: val,
                      musicVolume: val,
                      enabled: isEnabled,
                    },
                  });
                }}
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                className="h-28 sm:h-32 w-2.5 sm:w-3 accent-purple-400 bg-zinc-800/90 rounded-lg cursor-pointer hover:accent-purple-300 transition-all"
                title={t('synthVolume', 'Громкость мелодии')}
              />
            </div>

            {/* Bottom Mute Button & Label */}
            <button
              type="button"
              onClick={() => {
                if (isSynthMuted) {
                  const restored = synthVolume > 0 ? synthVolume : 0.7;
                  audioMixer.setVolume(restored);
                  onChange({
                    audio: {
                      ...state.audio,
                      enabled: true,
                      volume: restored,
                      musicVolume: restored,
                    },
                  });
                } else {
                  audioMixer.setVolume(0);
                  onChange({
                    audio: {
                      ...state.audio,
                      enabled: false,
                      volume: 0,
                      musicVolume: 0,
                    },
                  });
                }
              }}
              className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer active:scale-95 w-full ${
                isSynthMuted
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-950/50'
                  : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
              }`}
              title={isSynthMuted ? t('unmute', 'Включить мелодию') : t('mute', 'Выключить мелодию')}
            >
              <div className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5" />
                {isSynthMuted ? (
                  <VolumeX className="w-3 h-3 text-rose-400" />
                ) : (
                  <Volume2 className="w-3 h-3 text-purple-300" />
                )}
              </div>
              <span className="text-[9px] font-bold truncate max-w-[62px]">
                {t('synthShort', 'Мелодия')}
              </span>
            </button>
          </div>

          {/* TRACK 2: 🎬 Video Background Original Sound (if video attached) */}
          {hasVideoTrack && (
            <div className="flex flex-col items-center gap-2 w-16 sm:w-18 border-l border-white/10 pl-2.5 sm:pl-3">
              {/* Top % Badge */}
              <span
                className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md border ${
                  isVideoMuted
                    ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                    : 'text-emerald-200 bg-emerald-950/60 border-emerald-500/40'
                }`}
              >
                {isVideoMuted ? 'MUTE' : `${Math.round(videoVolume * 100)}%`}
              </span>

              {/* Vertical Range Slider */}
              <div className="py-1 flex items-center justify-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isVideoMuted ? 0 : Math.round(videoVolume * 100)}
                  onChange={(e) => {
                    const rawVal = parseInt(e.target.value, 10);
                    const val = rawVal / 100;
                    if (bgMediaElement instanceof HTMLVideoElement) {
                      bgMediaElement.volume = val;
                      bgMediaElement.muted = val === 0 || isMuted;
                    }
                    onChange({
                      audio: {
                        ...state.audio,
                        videoVolume: val,
                        videoAudioEnabled: val > 0,
                      },
                    });
                  }}
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  className="h-28 sm:h-32 w-2.5 sm:w-3 accent-emerald-400 bg-zinc-800/90 rounded-lg cursor-pointer hover:accent-emerald-300 transition-all"
                  title={t('videoAudioVolume', 'Громкость звука видео')}
                />
              </div>

              {/* Bottom Mute Button & Label */}
              <button
                type="button"
                onClick={() => {
                  if (isVideoMuted) {
                    const restored = videoVolume > 0 ? videoVolume : 0.8;
                    if (bgMediaElement instanceof HTMLVideoElement) {
                      bgMediaElement.volume = restored;
                      bgMediaElement.muted = isMuted;
                    }
                    onChange({
                      audio: {
                        ...state.audio,
                        videoAudioEnabled: true,
                        videoVolume: restored,
                      },
                    });
                  } else {
                    if (bgMediaElement instanceof HTMLVideoElement) {
                      bgMediaElement.muted = true;
                    }
                    onChange({
                      audio: {
                        ...state.audio,
                        videoAudioEnabled: false,
                      },
                    });
                  }
                }}
                className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer active:scale-95 w-full ${
                  isVideoMuted
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-950/50'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                }`}
                title={isVideoMuted ? t('unmute', 'Включить звук видео') : t('mute', 'Выключить звук видео')}
              >
                <div className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5" />
                  {isVideoMuted ? (
                    <VolumeX className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-emerald-300" />
                  )}
                </div>
                <span className="text-[9px] font-bold truncate max-w-[62px]">
                  {t('videoShort', 'Видео')}
                </span>
              </button>
            </div>
          )}

          {/* TRACK 3: 🎙️ User Uploaded Audio File / Voice (if audio file attached) */}
          {hasFileTrack && (
            <div className="flex flex-col items-center gap-2 w-16 sm:w-18 border-l border-white/10 pl-2.5 sm:pl-3">
              {/* Top % Badge */}
              <span
                className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md border ${
                  isFileMuted
                    ? 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                    : 'text-amber-200 bg-amber-950/60 border-amber-500/40'
                }`}
              >
                {isFileMuted ? 'MUTE' : `${Math.round(fileVolume * 100)}%`}
              </span>

              {/* Vertical Range Slider */}
              <div className="py-1 flex items-center justify-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isFileMuted ? 0 : Math.round(fileVolume * 100)}
                  onChange={(e) => {
                    const rawVal = parseInt(e.target.value, 10);
                    const val = rawVal / 100;
                    audioMixer.setFileVolume(val);
                    onChange({
                      audio: {
                        ...state.audio,
                        fileVolume: val,
                        fileAudioEnabled: val > 0,
                      },
                    });
                  }}
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  className="h-28 sm:h-32 w-2.5 sm:w-3 accent-amber-400 bg-zinc-800/90 rounded-lg cursor-pointer hover:accent-amber-300 transition-all"
                  title={t('fileAudioVolume', 'Громкость аудиофайла')}
                />
              </div>

              {/* Bottom Mute Button & Label */}
              <button
                type="button"
                onClick={() => {
                  if (isFileMuted) {
                    const restored = fileVolume > 0 ? fileVolume : 0.8;
                    audioMixer.setFileVolume(restored);
                    onChange({
                      audio: {
                        ...state.audio,
                        fileAudioEnabled: true,
                        fileVolume: restored,
                      },
                    });
                  } else {
                    audioMixer.setFileVolume(0);
                    onChange({
                      audio: {
                        ...state.audio,
                        fileAudioEnabled: false,
                      },
                    });
                  }
                }}
                className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer active:scale-95 w-full ${
                  isFileMuted
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-950/50'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                }`}
                title={isFileMuted ? t('unmute', 'Включить аудиофайл') : t('mute', 'Выключить аудиофайл')}
              >
                <div className="flex items-center gap-1">
                  <FileAudio className="w-3.5 h-3.5" />
                  {isFileMuted ? (
                    <VolumeX className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-amber-300" />
                  )}
                </div>
                <span className="text-[9px] font-bold truncate max-w-[62px]">
                  {t('fileShort', 'Файл/Голос')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
