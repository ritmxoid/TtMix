import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Sliders, ArrowLeft, Type, Wand2, RefreshCw, Eye, Check, Upload, Rocket, X, AlertTriangle } from 'lucide-react';
import { VideoProjectState, ProceduralMoodStyle } from '../types';
import { FONT_OPTIONS, BACKGROUND_PRESETS, LOCALIZED_DEFAULT_TEXTS } from '../data/presets';
import { MUSIC_PRESETS } from '../utils/audioGenerator';
import { renderCanvasFrame, particleEngine } from '../utils/canvasRenderer';
import { splitTextIntoSegments } from '../utils/textSplitter';
import { FullscreenPlayer } from './FullscreenPlayer';
import { useLanguage } from '../context/LanguageContext';

interface LuckyModeProps {
  baseState: VideoProjectState;
  onUpdateBaseState: (updates: Partial<VideoProjectState>) => void;
  onSelectExpert: () => void;
  onTransferToExpert: (state: VideoProjectState) => void;
  onReturnToLanding: () => void;
  bgMediaElement: HTMLImageElement | HTMLVideoElement | null;
  onOpenUploadModal?: () => void;
}

const ANIMATION_STYLES = ['typewriter', 'words', 'fade', 'slide', 'zoom', 'glitch'] as const;
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

export function generate4Variations(
  baseState: VideoProjectState,
  overrideText?: string,
  overrideAuthor?: string
): VideoProjectState[] {
  const result: VideoProjectState[] = [];

  const hasCustomMediaBg =
    (baseState.bgType === 'video' || baseState.bgType === 'image') && Boolean(baseState.bgMediaUrl);
  const hasCustomAudio =
    baseState.audio?.sourceType === 'file' && Boolean(baseState.audio.audioUrl);

  const activeText = overrideText ?? baseState.rawText;
  const activeAuthor = overrideAuthor ?? baseState.authorText;

  const textModeOptions: ('word' | 'sentence' | 'full')[] = ['word', 'sentence', 'full'];
  const textAlignOptions: ('center' | 'left' | 'right')[] = ['center', 'left', 'right'];

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

    // 12. Completely independent effect profile
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
      ? { ...baseState.audio }
      : {
          enabled: true,
          sourceType: 'generator' as const,
          audioUrl: null,
          audioFileName: null,
          presetId: randomMusic.id,
          seed: Math.floor(Math.random() * 999999) + 1,
          volume: 0.7,
          loop: true,
          audioDuration: 30,
        };

    const varState: VideoProjectState = {
      ...baseState,
      rawText: activeText,
      authorText: activeAuthor,
      textMode,
      speedMultiplier,
      pauseBetweenSeconds,
      bgType: hasCustomMediaBg ? baseState.bgType : 'preset',
      bgPresetId: hasCustomMediaBg ? baseState.bgPresetId : randomPreset.id,
      bgMediaUrl: hasCustomMediaBg ? baseState.bgMediaUrl : null,
      bgMediaType: hasCustomMediaBg ? baseState.bgMediaType : null,
      proceduralMood: randomMood,
      proceduralSeed: Math.floor(Math.random() * 999999) + 1,
      fontFamily: randomFont.family,
      fontSize,
      textColor,
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
  const presetName = presetObj ? presetObj.name : 'Стиль';

  return (
    <div
      onClick={onSelect}
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
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-bold text-white shadow-md">
          <Sparkles className="w-3 h-3 text-cyan-300" />
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
        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-zinc-200 border border-white/15 truncate max-w-[110px]">
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
    if (isExpertDefault) {
      onUpdateBaseState({
        rawText: defaultMatrixText,
        authorText: defaultMatrixAuthor,
      });
      setVariations((prev) =>
        prev.map((v) => ({
          ...v,
          rawText: defaultMatrixText,
          authorText: defaultMatrixAuthor,
        }))
      );
    }
  }, [defaultMatrixText, defaultMatrixAuthor, isExpertDefault, onUpdateBaseState]);

  const [variations, setVariations] = useState<VideoProjectState[]>(() =>
    generate4Variations(baseState, currentActiveText, currentActiveAuthor)
  );
  const [selectedVariation, setSelectedVariation] = useState<VideoProjectState | null>(null);
  const [isTextInputOpen, setIsTextInputOpen] = useState<boolean>(false);
  const [isRocketConfirmOpen, setIsRocketConfirmOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
      setVariations(generate4Variations(baseState, activeT, activeA));
      setIsGenerating(false);
    }, 200);
  }, [baseState, selectedVariation, defaultMatrixText, defaultMatrixAuthor]);

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
          onBackToLuckyGrid={() => setSelectedVariation(null)}
          onOpenTextInput={() => setIsTextInputOpen(true)}
          onOpenRocketConfirm={() => setIsRocketConfirmOpen(true)}
        />
      ) : (
        /* GRID SUBMODE: 4 VARIATIONS */
        <div className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full p-3 sm:p-6">
          {/* Header Bar */}
          <header className="flex items-center justify-between gap-2 py-2 mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReturnToLanding}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title={t('backToStart', 'На главный экран')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                  TtMix
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>{t('luckyModeBtn', 'Мне повезёт!')}</span>
                </span>
              </div>
            </div>

            {/* Upload File Button */}
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                title={t('uploadVideoPhoto', 'Загрузить видео, фото или аудио')}
              >
                <Upload className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden xs:inline">{t('uploadMediaBtn', 'Загрузить файл')}</span>
              </button>
            )}
          </header>

          {/* Banner Button: YOUR TEXT */}
          <div
            onClick={() => setIsTextInputOpen(true)}
            className="group relative w-full mb-5 p-3.5 sm:p-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border-2 border-purple-500/40 hover:border-purple-400 shadow-xl backdrop-blur-xl transition-all cursor-pointer flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <Type className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-purple-300 tracking-wider">
                  <span>{t('yourTextBanner', 'ВАШ ТЕКСТ')}</span>
                  <span className="text-[10px] text-zinc-400 font-normal lowercase">
                    ({t('clickToEdit', 'нажмите для ввода с клавиатуры')})
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-md mt-0.5">
                  "{currentActiveText}"
                </p>
                {currentActiveAuthor && (
                  <p className="text-[11px] text-purple-300/80 truncate">
                    — {currentActiveAuthor}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 shadow-md shadow-purple-600/30 transition-transform group-hover:scale-105"
            >
              {t('edit', 'Изменить')}
            </button>
          </div>

          {/* 2x2 Grid of Variations */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 flex-1 mb-6">
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

          {/* Bottom Center Round Button: GENERATE NEW ✨ */}
          <div className="sticky bottom-4 inset-x-0 flex justify-center items-center z-20 pb-[env(safe-area-inset-bottom,0px)]">
            <button
              type="button"
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-black text-sm sm:text-base tracking-wide uppercase shadow-2xl shadow-cyan-500/40 border-2 border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-5 h-5 text-white ${isGenerating ? 'animate-spin' : 'animate-bounce'}`} />
              <span>{t('generateMoreBtn', 'Сгенерировать еще (✨)')}</span>
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
};
