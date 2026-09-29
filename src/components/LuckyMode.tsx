import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Sliders, ArrowLeft, Type, Wand2, RefreshCw, Eye, Check, Upload, Rocket, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { VideoProjectState, ProceduralMoodStyle } from '../types';
import { FONT_OPTIONS, BACKGROUND_PRESETS, LOCALIZED_DEFAULT_TEXTS } from '../data/presets';
import { MUSIC_PRESETS } from '../utils/audioGenerator';
import { renderCanvasFrame, particleEngine } from '../utils/canvasRenderer';
import { splitTextIntoSegments } from '../utils/textSplitter';
import { FullscreenPlayer } from './FullscreenPlayer';
import { LuckyModeTour } from './LuckyModeTour';
import { ResetConfirmModal } from './ResetConfirmModal';
import { useLanguage } from '../context/LanguageContext';

interface LuckyModeProps {
  baseState: VideoProjectState;
  onUpdateBaseState: (updates: Partial<VideoProjectState>) => void;
  onSelectExpert: () => void;
  onTransferToExpert: (state: VideoProjectState) => void;
  onReturnToLanding: () => void;
  bgMediaElement: HTMLImageElement | HTMLVideoElement | null;
  onOpenUploadModal?: () => void;
  onResetProject?: () => void;
}

const ANIMATION_STYLES = [
  'typewriter',
  'words',
  'fade',
  'slide',
  'zoom',
  'fall',
  'blur',
  'swarm',
  'glitch',
  'bounce',
  'curves',
  'assemble',
  'disperse',
  'tumble',
  'wave',
  'stomp',
] as const;
const PROCEDURAL_MOODS: ProceduralMoodStyle[] = [
  'cosmic',
  'cyberpunk',
  'ember',
  'nature',
  'gold',
  'fluid',
  'equalizer',
  'shapes',
  'emojis',
];

// Balanced and diverse effect archetypes so that "Мерцание (Glow)" is NOT oversaturated
const EFFECT_ARCHETYPES = [
  // 0: Clean Minimalist (No glow, no sparkles - pure crisp typography with deep shadow)
  { glow: false, sparkle: false, fire: false, neon: false, shadow: true, particles: false },
  // 1: Cyberpunk Neon & Glitch (Electric neon edge with particles, no flickering glow)
  { glow: false, sparkle: false, fire: false, neon: true, shadow: true, particles: true },
  // 2: Golden Sparkles & Stardust (Stars & sparkles without plain glow)
  { glow: false, sparkle: true, fire: false, neon: false, shadow: true, particles: true },
  // 3: Fiery Ember & Blaze (Rising flames & embers)
  { glow: false, sparkle: false, fire: true, neon: false, shadow: true, particles: true },
  // 4: Subtle Soft Pulse (Soft aura, only on 1 variation at most)
  { glow: true, sparkle: false, fire: false, neon: false, shadow: true, particles: false },
  // 5: Cosmic Magic (Sparkles & particles)
  { glow: false, sparkle: true, fire: false, neon: false, shadow: true, particles: true },
];

// Rich palette of diverse contrasting text colors for Lucky variations (no more monochromatic orange!)
const LUCKY_TEXT_COLORS = [
  '#FFFFFF', // Crisp Pure White
  '#FDE047', // Warm Gold / Sunlight Yellow
  '#38BDF8', // Electric Sky Blue
  '#4ADE80', // Emerald Green
  '#F43F5E', // Vivid Coral Rose
  '#C084FC', // Neon Cyber Lavender
  '#FB923C', // Warm Sunset Amber
  '#22D3EE', // Bright Turquoise Cyan
  '#F472B6', // Neon Flamingo Pink
  '#E2E8F0', // Ice Platinum Silver
  '#FEF08A', // Soft Butter Cream
];

const LUCKY_NEON_COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#facc15', '#3b82f6', '#10b981'];

// Pool of floating themes without solid backgrounds for Eye Mode
export const EYE_MODE_OVERLAY_THEMES = [
  'flying-balloons',      // 🎈 Воздушные шары
  'flying-hearts',        // ❤️ Красные сердца
  'flying-questions',     // ❓ Знаки вопроса
  'flying-exclamations',  // ❗ Восклицания
  'flying-kisses',        // 💋 Поцелуи
  'flying-currency',      // 💵 Валюты $, €, ¥, ₽
  'anecdote',             // 😂 Смеющиеся смайлики
  'music',                // 🎵 Летающие ноты
  'winter',               // ❄️ Снежинки
  'autumn',               // 🍁 Осенние листья
  'stary-sky',            // ✨ Звездное небо
  'disco',                // 📊 Диско эквалайзер
  'lasers',               // ⚡ Неоновые лучи
  'gradient-smoke',       // 💨 Радужный дым
  'ai-procedural-equalizer', // 🎶 Спектр и эквалайзеры
  'ai-procedural-shapes',    // 📐 Динамическая геометрия
  'ai-procedural-emojis',    // 🥳 Эмодзи вселенная
  'ai-procedural-cosmic',    // 🌌 Космос и магия
  'ai-procedural-ember',     // 🔥 Огонь и искры
  'ai-procedural-cyberpunk', // ⚡ Неоновые кибер-линии
  'ai-procedural-nature',    // 🌸 Лепестки сакуры и волны авроры
  'ai-procedural-gold',      // ✨ Золотые боке и искры
  'ai-procedural-fluid',     // 🫧 Плавающие цветные капли
];

// Atmospheric semi-transparent color tint options for Eye Mode
export const EYE_MODE_COLOR_TINTS = [
  null, // Оригинальные чистые цвета фото/видео
  'rgba(168, 85, 247, 0.18)', // Кибер-лаванда
  'rgba(6, 182, 212, 0.18)',  // Электрик бирюза
  'rgba(244, 63, 94, 0.16)',  // Коралловый неон
  'rgba(250, 204, 21, 0.15)', // Золотой закат
  'rgba(16, 185, 129, 0.15)', // Изумрудный свет
  'rgba(0, 0, 0, 0.22)',      // Кинематографичный контраст
];

// Animated Blinking Eye Icon Component
export const BlinkingEyeIcon: React.FC<{ className?: string; isGenerating?: boolean }> = ({
  className = 'w-6 h-6',
  isGenerating = false,
}) => {
  const [isBlink, setIsBlink] = useState(false);

  useEffect(() => {
    const triggerBlink = () => {
      setIsBlink(true);
      setTimeout(() => setIsBlink(false), 200);
    };

    const interval = setInterval(() => {
      triggerBlink();
      if (Math.random() > 0.6) {
        setTimeout(triggerBlink, 380);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-full h-full text-cyan-200 transition-all duration-150 origin-center ${
          isGenerating ? 'animate-spin' : isBlink ? 'scale-y-[0.1]' : 'scale-y-100'
        }`}
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3.5" fill="#38bdf8" stroke="#a855f7" strokeWidth="1.5" />
      </svg>
      {/* Radiant pupil sparkle */}
      {!isBlink && !isGenerating && (
        <span className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-cyan-300 pointer-events-none animate-ping" />
      )}
    </div>
  );
};

export function generate4Variations(
  baseState: VideoProjectState,
  overrideText?: string,
  overrideAuthor?: string,
  isEyeMode?: boolean
): VideoProjectState[] {
  const result: VideoProjectState[] = [];

  const hasCustomMediaBg =
    (baseState.bgType === 'video' || baseState.bgType === 'image') && Boolean(baseState.bgMediaUrl);
  const hasCustomAudio =
    (baseState.audio?.sourceType === 'file' || Boolean(baseState.audio?.audioUrl)) &&
    baseState.audio?.fileAudioEnabled !== false &&
    Boolean(baseState.audio?.audioUrl);

  const activeText = overrideText ?? baseState.rawText;
  const activeAuthor = overrideAuthor ?? baseState.authorText;

  const textModeOptions: ('word' | 'sentence' | 'full')[] = ['word', 'sentence', 'full'];
  const textAlignOptions: ('center' | 'left' | 'right')[] = ['center', 'left', 'right'];

  // Shuffle overlay themes so all 4 variations get completely different themes!
  const shuffledOverlays = [...EYE_MODE_OVERLAY_THEMES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 4; i++) {
    // 1. Completely independent font selection
    const randomFont = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)];

    // 2. Completely independent background preset & mood
    const randomPreset = BACKGROUND_PRESETS[Math.floor(Math.random() * BACKGROUND_PRESETS.length)];
    const randomMood = PROCEDURAL_MOODS[Math.floor(Math.random() * PROCEDURAL_MOODS.length)];

    // 3. Completely independent animation style
    const randomAnim = ANIMATION_STYLES[Math.floor(Math.random() * ANIMATION_STYLES.length)];

    // 4. Completely independent music track & seed
    const randomMusic = MUSIC_PRESETS[Math.floor(Math.random() * MUSIC_PRESETS.length)];

    // 5. Completely independent text color & neon color
    const textColor = LUCKY_TEXT_COLORS[Math.floor(Math.random() * LUCKY_TEXT_COLORS.length)];
    const neonColor = LUCKY_NEON_COLORS[Math.floor(Math.random() * LUCKY_NEON_COLORS.length)];

    // 6. Completely independent text display mode (sentence, word, full)
    const textMode = textModeOptions[Math.floor(Math.random() * textModeOptions.length)];

    // 7. Completely independent animation speed (0.7x to 1.6x)
    const speedMultiplier = Math.round((0.7 + Math.random() * 0.9) * 10) / 10;

    // 8. Completely independent pause between phrases (0.3s to 1.1s)
    const pauseBetweenSeconds = Math.round((0.3 + Math.random() * 0.8) * 10) / 10;

    // 9. Completely independent alignment & 2D coordinates (safe 50px/15% zone)
    const textAlign = Math.random() < 0.6 ? 'center' : textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)];
    const textPositionY = Math.floor(20 + Math.random() * 55); // 20% to 75%
    let textPositionX = 50;
    if (textAlign === 'left') {
      textPositionX = 18 + Math.floor(Math.random() * 16);
    } else if (textAlign === 'right') {
      textPositionX = 66 + Math.floor(Math.random() * 16);
    } else {
      textPositionX = 40 + Math.floor(Math.random() * 20);
    }
    const textPositionPreset: 'top' | 'center' | 'bottom' =
      textPositionY < 35 ? 'top' : textPositionY > 65 ? 'bottom' : 'center';

    // 10. Truly dynamic font size tailored to the chosen font
    let fontSize = 85;
    if (['Amatic SC', 'Caveat', 'Neucha', 'Pacifico', 'Comfortaa'].includes(randomFont.name)) {
      fontSize = Math.floor(82 + Math.random() * 52); // 82 - 134
    } else if (['Press Start 2P', 'Rubik Mono One'].includes(randomFont.name)) {
      fontSize = Math.floor(44 + Math.random() * 32); // 44 - 76
    } else {
      fontSize = Math.floor(58 + Math.random() * 46); // 58 - 104
    }

    // 11. Random uppercase & stroke
    const isUppercase = Math.random() > 0.5;
    const strokeEnabled = Math.random() > 0.45;
    const strokeWidth = 2 + Math.floor(Math.random() * 5);
    const strokeColor = '#000000';

    // 12. Text Coloring Mode: Solid, Angle Linear Gradient, Letter Rainbow, Word Rainbow, Letter Random, Word Random
    const colorModeRoll = Math.random();
    let textColorMode:
      | 'solid'
      | 'gradient'
      | 'letter-rainbow'
      | 'word-rainbow'
      | 'letter-random'
      | 'word-random' = 'solid';
    let textGradientColors: [string, string] | undefined = undefined;
    let textGradientAngle: number | undefined = undefined;

    const GRADIENT_PAIRS: [string, string][] = [
      ['#f43f5e', '#38bdf8'], // Rose to Sky Blue
      ['#facc15', '#ec4899'], // Gold to Neon Pink
      ['#06b6d4', '#10b981'], // Cyan to Emerald
      ['#a855f7', '#fb923c'], // Purple to Warm Amber
      ['#38bdf8', '#c084fc'], // Sky to Cyber Lavender
      ['#4ade80', '#facc15'], // Green to Bright Yellow
      ['#ff007a', '#7928ca'], // Electric Magenta to Violet
      ['#00f2fe', '#4facfe'], // Ice Cyan to Royal Blue
    ];
    const GRADIENT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

    if (colorModeRoll < 0.16) {
      textColorMode = 'letter-rainbow';
    } else if (colorModeRoll < 0.32) {
      textColorMode = 'letter-random';
    } else if (colorModeRoll < 0.46) {
      textColorMode = 'word-rainbow';
    } else if (colorModeRoll < 0.60) {
      textColorMode = 'word-random';
    } else if (colorModeRoll < 0.78) {
      textColorMode = 'gradient';
      textGradientColors = GRADIENT_PAIRS[Math.floor(Math.random() * GRADIENT_PAIRS.length)];
      textGradientAngle = GRADIENT_ANGLES[Math.floor(Math.random() * GRADIENT_ANGLES.length)];
    } else {
      textColorMode = 'solid';
    }

    // 13. Completely independent effect profile
    const baseEffects = EFFECT_ARCHETYPES[Math.floor(Math.random() * EFFECT_ARCHETYPES.length)];
    const selectedEffects = {
      ...baseEffects,
      neon: Math.random() < 0.35,
      glow: Math.random() < 0.35,
      sparkle: Math.random() < 0.4,
      fire: Math.random() < 0.25,
      particles: Math.random() < 0.5,
      shadow: true,
    };

    const audioConfig = hasCustomAudio
      ? {
          ...baseState.audio,
          enabled: true,
          sourceType: baseState.audio?.sourceType || 'file',
          audioUrl: baseState.audio.audioUrl,
          audioFileName: baseState.audio.audioFileName,
          audioDuration: baseState.audio.audioDuration,
          fileAudioEnabled: true,
          fileVolume: baseState.audio.fileVolume ?? 0.8,
          presetId: randomMusic.id,
          seed: Math.floor(Math.random() * 999999) + 1,
          volume: baseState.audio.volume ?? 0.7,
          musicVolume: baseState.audio.musicVolume ?? baseState.audio.volume ?? 0.7,
        }
      : {
          enabled: true,
          sourceType: 'generator' as const,
          audioUrl: null,
          audioFileName: null,
          presetId: randomMusic.id,
          seed: Math.floor(Math.random() * 999999) + 1,
          volume: 0.7,
          musicVolume: 0.7,
          fileVolume: 0.8,
          loop: true,
          audioDuration: 30,
        };

    const chosenOverlayTheme = hasCustomMediaBg && isEyeMode
      ? shuffledOverlays[i % shuffledOverlays.length]
      : null;

    const varState: VideoProjectState = {
      ...baseState,
      textBgEnabled: false,
      rawText: activeText,
      authorText: activeAuthor,
      textMode,
      speedMultiplier,
      pauseBetweenSeconds,
      bgType: hasCustomMediaBg ? baseState.bgType : 'preset',
      bgPresetId: hasCustomMediaBg ? baseState.bgPresetId : randomPreset.id,
      bgMediaUrl: hasCustomMediaBg ? baseState.bgMediaUrl : null,
      bgMediaType: hasCustomMediaBg ? baseState.bgMediaType : null,
      mediaOverlayTheme: chosenOverlayTheme,
      mediaColorTint: null,
      proceduralMood: randomMood,
      proceduralSeed: Math.floor(Math.random() * 999999) + 1,
      fontFamily: randomFont.family,
      fontSize,
      textColor,
      textColorMode,
      textGradientColors,
      textGradientAngle,
      neonColor,
      isUppercase,
      textAlign,
      textPosition: textPositionPreset,
      textPositionX,
      textPositionY,
      strokeEnabled,
      strokeColor,
      strokeWidth,
      animationStyle: randomAnim,
      effects: { ...selectedEffects },
      audio: audioConfig,
    };

    result.push(varState);
  }

  return result;
}

// Mini Live Canvas Card for 2x2 Grid
const LuckyCard: React.FC<{
  variation: VideoProjectState;
  index: number;
  onSelect: () => void;
  bgMediaElement?: HTMLImageElement | HTMLVideoElement | null;
}> = ({ variation, index, onSelect, bgMediaElement }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          const now = performance.now();
          const currentTime = ((now - startTime) / 1000) % 12;
          const dims = { width: canvas.width, height: canvas.height };

          renderCanvasFrame({
            ctx,
            dimensions: dims,
            state: variation,
            bgMediaElement: bgMediaElement || null,
            currentTime,
            targetDuration: 12,
          });
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [variation, bgMediaElement]);

  // Find font name for badge
  const fontObj = FONT_OPTIONS.find((f) => f.family === variation.fontFamily);
  const fontName = fontObj ? fontObj.name : 'Шрифт';
  const presetObj = BACKGROUND_PRESETS.find((p) => p.id === variation.bgPresetId);
  const overlayObj = variation.mediaOverlayTheme
    ? BACKGROUND_PRESETS.find((p) => p.id === variation.mediaOverlayTheme)
    : null;
  const presetName = overlayObj ? overlayObj.name : (presetObj ? presetObj.name : 'Стиль');

  return (
    <div
      onClick={onSelect}
      data-tour={`lucky-card-${index}`}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 hover:border-cyan-400/80 bg-zinc-900 shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col aspect-[9/16] w-full max-w-[280px] sm:max-w-[340px] mx-auto select-none"
    >
      {/* Canvas Live Preview - 100% visible, uncropped canvas with exact 9:16 aspect ratio */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          width={540}
          height={960}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Glass Top Badge */}
      <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md border text-[10px] sm:text-xs font-bold shadow-md ${
          variation.mediaOverlayTheme
            ? 'bg-purple-950/80 border-purple-400/50 text-purple-200 shadow-purple-900/40'
            : 'bg-black/65 border-white/15 text-white'
        }`}>
          {variation.mediaOverlayTheme ? (
            <Eye className="w-3 h-3 text-cyan-300 animate-pulse" />
          ) : (
            <Sparkles className="w-3 h-3 text-cyan-300" />
          )}
          <span>Вариант #{index + 1}</span>
        </div>
      </div>

      {/* Hover Overlay CTA */}
      <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-black flex items-center justify-center mb-2 shadow-xl shadow-cyan-500/50 scale-90 group-hover:scale-100 transition-transform">
          <Eye className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase drop-shadow-md">
          Открыть во весь экран
        </span>
      </div>

      {/* Bottom Style Info Pills */}
      <div className="relative z-10 mt-auto p-2 sm:p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-wrap items-center gap-1 pointer-events-none">
        <span className={`px-2 py-0.5 rounded-md backdrop-blur-md text-[9px] sm:text-[10px] font-semibold border truncate max-w-[125px] ${
          variation.mediaOverlayTheme
            ? 'bg-purple-900/60 border-purple-400/50 text-purple-200'
            : 'bg-black/60 border-white/15 text-zinc-200'
        }`}>
          {presetName}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/25 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-cyan-300 border border-cyan-500/40 truncate max-w-[95px]">
          {fontName}
        </span>
      </div>
    </div>
  );
};

// Direct Keyboard Input Modal - Directly opens an auto-focused textarea with no intermediate windows!
const DirectTextInputModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  authorText: string;
  onSave: (text: string, author: string) => void;
}> = ({ isOpen, onClose, rawText, authorText, onSave }) => {
  const { t } = useLanguage();
  const [text, setText] = useState(rawText);
  const [author, setAuthor] = useState(authorText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(rawText);
    setAuthor(authorText);
  }, [rawText, authorText]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onSave(val, author);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthor(val);
    onSave(text, val);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-900/95 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-black text-sm border border-purple-500/30">
              Т
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {t('editTextInputTitle', 'Ввод текста')}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {t('directInputSubtitle', 'Клавиатура открыта, вводите текст')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
            {t('quoteTextLabel', 'Основной текст цитаты')}
          </label>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              rows={4}
              placeholder={t('typeTextPlaceholder', 'Введите ваш текст здесь...')}
              className="w-full p-3.5 rounded-2xl bg-zinc-950/90 border-2 border-purple-500/50 focus:border-purple-400 text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none resize-none shadow-inner transition-colors"
            />
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setText('');
                  onSave('', author);
                  textareaRef.current?.focus();
                }}
                className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
              >
                {t('clear', 'Очистить')}
              </button>
            )}
          </div>
        </div>

        {/* Author Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {t('authorLabel', 'Автор (необязательно)')}
          </label>
          <input
            type="text"
            value={author}
            onChange={handleAuthorChange}
            placeholder={t('authorPlaceholder', '— Автор или источник')}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-white/15 focus:border-purple-400 text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Button: Done */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('done', 'Готово')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const LuckyMode: React.FC<LuckyModeProps> = ({
  baseState,
  onUpdateBaseState,
  onSelectExpert,
  onTransferToExpert,
  onReturnToLanding,
  bgMediaElement,
  onOpenUploadModal,
  onResetProject,
}) => {
  const { t } = useLanguage();

  const defaultMatrixText = t(
    'matrixQuoteText',
    'Примешь синюю таблетку — и сказке конец... Примешь красную — войдешь в страну чудес!'
  );
  const defaultMatrixAuthor = t('matrixQuoteAuthor', 'Морфеус');

  const isExpertDefault =
    !baseState.rawText ||
    !baseState.rawText.trim() ||
    Object.values(LOCALIZED_DEFAULT_TEXTS).includes(baseState.rawText) ||
    baseState.rawText.includes('предел') ||
    baseState.rawText.includes('собственный разум') ||
    baseState.rawText.includes('limit') ||
    baseState.rawText.includes('límite') ||
    baseState.rawText.includes('Grenze') ||
    baseState.rawText.includes('limite') ||
    baseState.rawText.includes('限制') ||
    baseState.rawText.includes('Введи') ||
    baseState.rawText.includes('Type your text') ||
    baseState.rawText.includes('Gib hier');

  const currentActiveText = isExpertDefault ? defaultMatrixText : baseState.rawText;
  const currentActiveAuthor = isExpertDefault ? defaultMatrixAuthor : baseState.authorText;

  // Set default Matrix quote if empty or initial expert placeholder
  useEffect(() => {
    onUpdateBaseState({
      textBgEnabled: false,
      ...(isExpertDefault
        ? {
            rawText: defaultMatrixText,
            authorText: defaultMatrixAuthor,
          }
        : {}),
    });
    setVariations((prev) =>
      prev.map((v) => ({
        ...v,
        textBgEnabled: false,
        ...(isExpertDefault
          ? {
              rawText: defaultMatrixText,
              authorText: defaultMatrixAuthor,
            }
          : {}),
      }))
    );
  }, [defaultMatrixText, defaultMatrixAuthor, isExpertDefault, onUpdateBaseState]);

  const [isEyeMode, setIsEyeMode] = useState<boolean>(false);
  const [isHoldingMix, setIsHoldingMix] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const mixLongPressTimerRef = useRef<number | null>(null);
  const mixHoldIntervalRef = useRef<number | null>(null);
  const isMixLongPressTriggeredRef = useRef<boolean>(false);
  const [eyeModeNotice, setEyeModeNotice] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const handleResetAllInLucky = () => {
    if (onResetProject) {
      onResetProject();
    }
    setEyeModeNotice(t('projectResetNotice', 'Проект сброшен к начальному состоянию 🔄'));
    setTimeout(() => setEyeModeNotice(null), 3000);
  };

  const hasUserMedia = Boolean(
    ((baseState.bgType === 'video' || baseState.bgType === 'image') && baseState.bgMediaUrl) ||
    bgMediaElement
  );

  const clearMixHoldTimers = useCallback(() => {
    if (mixLongPressTimerRef.current) {
      clearTimeout(mixLongPressTimerRef.current);
      mixLongPressTimerRef.current = null;
    }
    if (mixHoldIntervalRef.current) {
      clearInterval(mixHoldIntervalRef.current);
      mixHoldIntervalRef.current = null;
    }
    setIsHoldingMix(false);
    setHoldProgress(0);
  }, []);

  const [variations, setVariations] = useState<VideoProjectState[]>(() =>
    generate4Variations(baseState, currentActiveText, currentActiveAuthor, false)
  );

  const [selectedVariation, setSelectedVariation] = useState<VideoProjectState | null>(null);
  const [isTextInputOpen, setIsTextInputOpen] = useState<boolean>(false);
  const [isRocketConfirmOpen, setIsRocketConfirmOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // When user uploads media, update the variations to incorporate user media
  const prevMediaUrlRef = useRef<string | null>(baseState.bgMediaUrl || null);
  useEffect(() => {
    if (baseState.bgMediaUrl && baseState.bgMediaUrl !== prevMediaUrlRef.current) {
      prevMediaUrlRef.current = baseState.bgMediaUrl;
      const rawT = selectedVariation ? selectedVariation.rawText : baseState.rawText;
      const activeT = rawT || defaultMatrixText;
      const activeA = (selectedVariation ? selectedVariation.authorText : baseState.authorText) || defaultMatrixAuthor;
      setVariations(generate4Variations(baseState, activeT, activeA, isEyeMode));
      if (selectedVariation) {
        setSelectedVariation((prev) =>
          prev
            ? {
                ...prev,
                bgType: baseState.bgType,
                bgMediaUrl: baseState.bgMediaUrl,
                bgMediaType: baseState.bgMediaType,
              }
            : null
        );
      }
    } else if (!baseState.bgMediaUrl && prevMediaUrlRef.current) {
      prevMediaUrlRef.current = null;
      setVariations((prev) =>
        prev.map((v) => ({
          ...v,
          bgType: 'preset',
          bgMediaUrl: null,
          bgMediaType: null,
        }))
      );
      if (selectedVariation) {
        setSelectedVariation((prev) =>
          prev
            ? {
                ...prev,
                bgType: 'preset',
                bgMediaUrl: null,
                bgMediaType: null,
              }
            : null
        );
      }
    }
  }, [baseState.bgMediaUrl, baseState.bgType, isEyeMode, defaultMatrixText, defaultMatrixAuthor, selectedVariation, baseState]);

  // When user uploads custom audio, update all variations and selectedVariation immediately
  const prevAudioUrlRef = useRef<string | null>(baseState.audio?.audioUrl || null);
  useEffect(() => {
    const currentAudioUrl = baseState.audio?.audioUrl || null;
    if (currentAudioUrl && currentAudioUrl !== prevAudioUrlRef.current) {
      prevAudioUrlRef.current = currentAudioUrl;

      // Show toast notification in Lucky Mode
      setEyeModeNotice(
        `🎵 ${t('customAudioLoadedNotice', 'Ваш аудиофайл успешно загружен:')} ${baseState.audio?.audioFileName || 'Аудио'}`
      );
      setTimeout(() => setEyeModeNotice(null), 4000);

      // Propagate uploaded audio to all 4 variations
      setVariations((prev) =>
        prev.map((v) => ({
          ...v,
          audio: {
            ...v.audio,
            ...baseState.audio,
            enabled: true,
            sourceType: baseState.audio?.sourceType || 'file',
            fileAudioEnabled: true,
            audioUrl: currentAudioUrl,
            audioFileName: baseState.audio?.audioFileName,
            audioDuration: baseState.audio?.audioDuration,
            volume: (baseState.audio?.volume ?? v.audio.volume ?? 0.7) > 0 ? (baseState.audio?.volume ?? v.audio.volume ?? 0.7) : 0.7,
            musicVolume: (baseState.audio?.musicVolume ?? v.audio.musicVolume ?? 0.7) > 0 ? (baseState.audio?.musicVolume ?? v.audio.musicVolume ?? 0.7) : 0.7,
            fileVolume: (baseState.audio?.fileVolume ?? 0.8) > 0 ? (baseState.audio?.fileVolume ?? 0.8) : 0.8,
          },
        }))
      );

      // If a variation is currently open in FullscreenPlayer, update it too
      if (selectedVariation) {
        setSelectedVariation((prev) =>
          prev
            ? {
                ...prev,
                audio: {
                  ...prev.audio,
                  ...baseState.audio,
                  enabled: true,
                  sourceType: baseState.audio?.sourceType || 'file',
                  fileAudioEnabled: true,
                  audioUrl: currentAudioUrl,
                  audioFileName: baseState.audio?.audioFileName,
                  audioDuration: baseState.audio?.audioDuration,
                  volume: (baseState.audio?.volume ?? prev.audio.volume ?? 0.7) > 0 ? (baseState.audio?.volume ?? prev.audio.volume ?? 0.7) : 0.7,
                  musicVolume: (baseState.audio?.musicVolume ?? prev.audio.musicVolume ?? 0.7) > 0 ? (baseState.audio?.musicVolume ?? prev.audio.musicVolume ?? 0.7) : 0.7,
                  fileVolume: (baseState.audio?.fileVolume ?? 0.8) > 0 ? (baseState.audio?.fileVolume ?? 0.8) : 0.8,
                },
              }
            : null
        );
      }
    } else if (!currentAudioUrl && prevAudioUrlRef.current) {
      prevAudioUrlRef.current = null;

      // Clear custom audio from all 4 variations
      setVariations((prev) =>
        prev.map((v) => ({
          ...v,
          audio: {
            ...v.audio,
            enabled: false,
            sourceType: 'generator',
            audioUrl: null,
            audioFileName: null,
            audioDuration: 0,
            fileAudioEnabled: false,
          },
        }))
      );

      // If a variation is open in FullscreenPlayer, update it too
      if (selectedVariation) {
        setSelectedVariation((prev) =>
          prev
            ? {
                ...prev,
                audio: {
                  ...prev.audio,
                  enabled: false,
                  sourceType: 'generator',
                  audioUrl: null,
                  audioFileName: null,
                  audioDuration: 0,
                  fileAudioEnabled: false,
                },
              }
            : null
        );
      }
    }
  }, [baseState.audio, selectedVariation, t]);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lucky_mode_help_never_show') !== 'true';
    } catch {
      return true;
    }
  });
  const [tourStepIdx, setTourStepIdx] = useState<number>(-1);

  const handleSelectVariation = useCallback((v: VideoProjectState | null) => {
    setSelectedVariation(v);
  }, []);

  const handleCloseVariation = useCallback(() => {
    setSelectedVariation(null);
  }, []);

  const handleTourStepChange = useCallback((stepIdx: number) => {
    setTourStepIdx(stepIdx);
  }, []);

  const gridPointerStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const handleGridPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, input, textarea, [role="button"]')) return;
    gridPointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleGridPointerUp = (e: React.PointerEvent) => {
    if (gridPointerStartRef.current.time === 0) return;
    const deltaX = e.clientX - gridPointerStartRef.current.x;
    const deltaY = e.clientY - gridPointerStartRef.current.y;
    gridPointerStartRef.current.time = 0;

    // Swipe Right gesture (left to right) to return to main landing page
    if (deltaX > 40 && deltaX > Math.abs(deltaY) * 1.1) {
      onReturnToLanding();
    }
  };

  const handleGenerateNew = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const rawT = selectedVariation ? selectedVariation.rawText : baseState.rawText;
      const isExpert =
        !rawT ||
        !rawT.trim() ||
        Object.values(LOCALIZED_DEFAULT_TEXTS).includes(rawT) ||
        rawT.includes('предел') ||
        rawT.includes('limit');
      const activeT = isExpert ? defaultMatrixText : (rawT || defaultMatrixText);
      const activeA = isExpert
        ? defaultMatrixAuthor
        : ((selectedVariation ? selectedVariation.authorText : baseState.authorText) || defaultMatrixAuthor);
      setVariations(generate4Variations(baseState, activeT, activeA, isEyeMode));
      setIsGenerating(false);
    }, 200);
  }, [baseState, selectedVariation, defaultMatrixText, defaultMatrixAuthor, isEyeMode]);

  const handleMixPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isMixLongPressTriggeredRef.current = false;
    clearMixHoldTimers();

    const HOLD_DURATION = 520; // 520ms for comfortable responsive long-press
    const startTime = Date.now();
    setIsHoldingMix(true);

    mixHoldIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
    }, 25);

    mixLongPressTimerRef.current = window.setTimeout(() => {
      clearMixHoldTimers();
      isMixLongPressTriggeredRef.current = true;

      setIsEyeMode((prev) => {
        const next = !prev;
        if (next) {
          setEyeModeNotice(t('eyeModeActiveNotice', '👁️ Режим «Магический Глаз»: при клике накладываются летающие темы поверх вашего медиа!'));
          setTimeout(() => {
            const rawT = selectedVariation ? selectedVariation.rawText : baseState.rawText;
            const activeT = rawT || defaultMatrixText;
            const activeA = (selectedVariation ? selectedVariation.authorText : baseState.authorText) || defaultMatrixAuthor;
            setVariations(generate4Variations(baseState, activeT, activeA, true));
          }, 60);
        } else {
          setEyeModeNotice(t('eyeModeInactiveNotice', '✨ Режим «Звёздный Микс»: возвращен стандартный режим'));
          setTimeout(() => {
            const rawT = selectedVariation ? selectedVariation.rawText : baseState.rawText;
            const activeT = rawT || defaultMatrixText;
            const activeA = (selectedVariation ? selectedVariation.authorText : baseState.authorText) || defaultMatrixAuthor;
            setVariations(generate4Variations(baseState, activeT, activeA, false));
          }, 60);
        }
        setTimeout(() => setEyeModeNotice(null), 4000);
        return next;
      });

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch {}
      }
    }, HOLD_DURATION);
  };

  const handleMixPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    clearMixHoldTimers();
  };

  const handleMixPointerCancel = (e: React.PointerEvent) => {
    e.stopPropagation();
    clearMixHoldTimers();
  };

  const handleMixClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearMixHoldTimers();
    if (isMixLongPressTriggeredRef.current) {
      setTimeout(() => {
        isMixLongPressTriggeredRef.current = false;
      }, 150);
      return;
    }
    handleGenerateNew();
  };

  // Update base text across all variations if text changes
  const handleSaveText = (newText: string, newAuthor: string) => {
    onUpdateBaseState({ rawText: newText, authorText: newAuthor });
    setVariations((prev) =>
      prev.map((v) => ({
        ...v,
        rawText: newText,
        authorText: newAuthor,
      }))
    );
    if (selectedVariation) {
      setSelectedVariation((prev) =>
        prev
          ? {
              ...prev,
              rawText: newText,
              authorText: newAuthor,
            }
          : null
      );
    }
  };

  const handleTransferToExpert = () => {
    const targetState = selectedVariation || baseState;
    if (onTransferToExpert) {
      onTransferToExpert(targetState);
    } else {
      onUpdateBaseState(targetState);
      onSelectExpert();
    }
    setIsRocketConfirmOpen(false);
    setSelectedVariation(null);
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* FULLSCREEN PREVIEW SUBMODE */}
      {selectedVariation ? (
        <FullscreenPlayer
          isOpen={true}
          onClose={() => setSelectedVariation(null)}
          state={selectedVariation}
          onChange={(updates) => {
            setSelectedVariation((prev) => (prev ? { ...prev, ...updates } : null));
            onUpdateBaseState(updates);
          }}
          bgMediaElement={bgMediaElement}
          isLuckyMode={true}
          isTourActive={isTourOpen}
          tourStepIdx={tourStepIdx}
          onBackToLuckyGrid={() => setSelectedVariation(null)}
          onOpenTextInput={() => setIsTextInputOpen(true)}
          onOpenRocketConfirm={() => setIsRocketConfirmOpen(true)}
        />
      ) : (
        /* GRID SUBMODE: 4 VARIATIONS WITHOUT HEADER (Swipe Right returns to start page) */
        <div
          onPointerDown={handleGridPointerDown}
          onPointerUp={handleGridPointerUp}
          className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full p-2 sm:p-3 pb-20 touch-pan-y"
        >
          {/* 2x2 Grid of 4 Variations */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 items-center my-auto pt-2 sm:pt-3">
            {variations.map((varState, idx) => (
              <LuckyCard
                key={idx}
                variation={varState}
                index={idx}
                onSelect={() => setSelectedVariation(varState)}
                bgMediaElement={bgMediaElement}
              />
            ))}
          </div>

          {/* Reset Button (scrolls along with variations at bottom left below cards, compact red icon without text) */}
          <div className="flex items-center justify-start pt-2 pb-2 px-1">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-full hover:bg-rose-950/40 text-rose-500 hover:text-rose-400 transition-all cursor-pointer active:scale-95 group shrink-0"
              title={t('resetProject', 'Сбросить всё к начальным настройкам')}
              aria-label={t('resetProject', 'Сбросить всё к начальным настройкам')}
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300 text-rose-500" />
            </button>
          </div>

          {/* Unified Transparent Round Bottom Action Bar */}
          <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-30 flex justify-center items-center px-3 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 bg-black/60 backdrop-blur-2xl border border-white/15 p-2 rounded-full shadow-2xl">
              {/* 1. Round Button: [Т] Text Input */}
              <button
                type="button"
                data-tour="lucky-btn-text"
                onClick={() => setIsTextInputOpen(true)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-purple-600/30 backdrop-blur-xl border border-purple-400/30 text-purple-200 font-black text-lg sm:text-xl flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 shrink-0"
                title={t('editTextInputTitle', 'Ввод текста')}
              >
                Т
              </button>

              {/* 2. Center Round Button: [Mix] / [Eye] */}
              <div className="relative">
                {/* Starry Radiance Aura when user video/photo is loaded */}
                {hasUserMedia && !isEyeMode && (
                  <>
                    {/* Animated glowing star halo */}
                    <div className="absolute -inset-2 sm:-inset-2.5 rounded-full bg-gradient-to-r from-amber-400/50 via-cyan-400/50 to-fuchsia-400/50 blur-md animate-pulse pointer-events-none" />
                    
                    {/* Twinkling star particle 1: Top Right */}
                    <span className="absolute -top-1.5 -right-1 text-xs animate-bounce pointer-events-none select-none">✨</span>
                    {/* Twinkling star particle 2: Bottom Left */}
                    <span className="absolute -bottom-1 -left-1 text-[11px] animate-pulse pointer-events-none select-none">⭐</span>
                    {/* Twinkling star particle 3: Top Left subtle twinkle */}
                    <span className="absolute -top-2 -left-1 text-[10px] animate-ping pointer-events-none select-none opacity-75">✦</span>
                  </>
                )}

                {/* Hold progress ring indicator during long-press */}
                {isHoldingMix && (
                  <svg className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] -rotate-90 pointer-events-none z-20">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="46%"
                      fill="none"
                      stroke={isEyeMode ? '#c084fc' : '#facc15'}
                      strokeWidth="3.5"
                      strokeDasharray="290"
                      strokeDashoffset={290 - (290 * holdProgress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-75"
                    />
                  </svg>
                )}

                {/* Center Round Button: [Mix] / [Eye] */}
                <button
                  type="button"
                  data-tour="lucky-btn-mix"
                  onPointerDown={handleMixPointerDown}
                  onPointerUp={handleMixPointerUp}
                  onPointerCancel={handleMixPointerCancel}
                  onPointerLeave={handleMixPointerCancel}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={handleMixClick}
                  disabled={isGenerating}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 group relative z-10 ${
                    isEyeMode
                      ? 'bg-gradient-to-tr from-purple-900/80 via-indigo-900/70 to-cyan-950/80 hover:from-purple-800 hover:to-indigo-800 border-2 border-purple-400 text-purple-200 shadow-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]'
                      : hasUserMedia
                      ? 'bg-black/50 hover:bg-cyan-500/30 backdrop-blur-xl border-2 border-amber-300/90 text-amber-200 shadow-[0_0_20px_rgba(250,204,21,0.55)] group-hover:shadow-[0_0_30px_rgba(250,204,21,0.8)]'
                      : 'bg-black/40 hover:bg-cyan-500/30 backdrop-blur-xl border-2 border-cyan-400/50 text-cyan-200 shadow-cyan-500/30'
                  }`}
                  title={
                    isEyeMode
                      ? t('mixEyeBtnTitle', 'Магический Глаз (клик: микс с темами поверх медиа, долгий клик: вернуть звезды)')
                      : hasUserMedia
                      ? t('mixStarryBtnTitle', 'Звёздный Микс (клик: микс, долгий клик: включить Магический Глаз)')
                      : t('generateMoreBtn', 'Генератор новых квартетов')
                  }
                >
                  {isEyeMode ? (
                    <BlinkingEyeIcon className="w-5 h-5 sm:w-6 sm:h-6" isGenerating={isGenerating} />
                  ) : (
                    <Sparkles
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        hasUserMedia ? 'text-amber-300' : 'text-cyan-300'
                      } ${isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}
                    />
                  )}
                </button>
              </div>

              {/* 3. Round Button: [Upload] User Media Files */}
              {onOpenUploadModal && (
                <button
                  type="button"
                  data-tour="lucky-btn-upload"
                  onClick={onOpenUploadModal}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-cyan-600/30 backdrop-blur-xl border border-cyan-400/30 text-cyan-200 flex items-center justify-center shadow-2xl transition-all cursor-pointer active:scale-95 shrink-0"
                  title={t('uploadVideoPhoto', 'Загрузить медиафайлы')}
                >
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                </button>
              )}
            </div>
          </div>

          {/* Eye Mode Notification Toast */}
          {eyeModeNotice && (
            <div className="fixed bottom-20 sm:bottom-24 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-fade-in">
              <div className="bg-black/90 backdrop-blur-2xl border border-purple-500/50 text-purple-200 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-2xl shadow-purple-500/30 flex items-center gap-2 max-w-md text-center">
                <span>{eyeModeNotice}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Animated Help Tour for Lucky Mode */}
      <LuckyModeTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        selectedVariation={selectedVariation}
        onSelectVariation={handleSelectVariation}
        onCloseVariation={handleCloseVariation}
        variations={variations}
        onStepChange={handleTourStepChange}
      />

      {/* Direct Keyboard Input Modal (opens keyboard immediately without intermediate windows!) */}
      <DirectTextInputModal
        isOpen={isTextInputOpen}
        onClose={() => setIsTextInputOpen(false)}
        rawText={selectedVariation ? selectedVariation.rawText : currentActiveText}
        authorText={selectedVariation ? selectedVariation.authorText : currentActiveAuthor}
        onSave={handleSaveText}
      />

      {/* Rocket Confirm Modal - Transfer to Expert Mode */}
      {isRocketConfirmOpen &&
        createPortal(
          <div className="fixed inset-0 z-[2147483647] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-rose-300" />
              </div>

              <h3 className="text-lg font-black text-white mb-2">
                {t('rocketConfirmTitle', 'Переход в режим Эксперт')}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-medium">
                {t(
                  'rocketConfirmDesc',
                  'Вы действительно хотите перенести этот вариант в экспертную зону для полного редактирования? Обратного пути может не быть!'
                )}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRocketConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {t('cancel', 'Отмена')}
                </button>
                <button
                  type="button"
                  onClick={handleTransferToExpert}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
                >
                  {t('transferToExpertBtn', 'Перенести в Эксперт')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          handleResetAllInLucky();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
