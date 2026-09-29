import React, { useState, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Palette, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TextColorMode } from '../types';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: string;
  onChange: (newColor: string) => void;
  title?: string;
  textColorMode?: TextColorMode;
  textGradientColors?: [string, string];
  textGradientAngle?: number;
  onColorModeChange?: (mode: TextColorMode) => void;
  onGradientColorsChange?: (colors: [string, string]) => void;
  onGradientAngleChange?: (angle: number) => void;
}

// Convert Hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num) || cleaned.length !== 6) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = (h % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

const POPULAR_PALETTE = [
  // Яркие чистые цвета
  { label: 'Белый', hex: '#ffffff' },
  { label: 'Желтый', hex: '#facc15' },
  { label: 'Золотой', hex: '#f59e0b' },
  { label: 'Оранжевый', hex: '#f97316' },
  { label: 'Красный', hex: '#ef4444' },
  { label: 'Розовый', hex: '#ec4899' },
  { label: 'Пурпурный', hex: '#a855f7' },
  { label: 'Синий', hex: '#3b82f6' },
  { label: 'Голубой', hex: '#06b6d4' },
  { label: 'Изумрудный', hex: '#10b981' },
  { label: 'Зеленый лайм', hex: '#84cc16' },
  { label: 'Черный', hex: '#000000' },

  // Пастельные и благородные оттенки
  { label: 'Слоновая кость', hex: '#fefce8' },
  { label: 'Бежевый', hex: '#f5efe6' },
  { label: 'Персиковый', hex: '#fed7aa' },
  { label: 'Мятный', hex: '#a7f3d0' },
  { label: 'Небесный', hex: '#bae6fd' },
  { label: 'Лавандовый', hex: '#ddd6fe' },
  { label: 'Графитовый', hex: '#374151' },
  { label: 'Неоновый циан', hex: '#22d3ee' },
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  color,
  onChange,
  title,
  textColorMode,
  textGradientColors,
  textGradientAngle,
  onColorModeChange,
  onGradientColorsChange,
  onGradientAngleChange,
}) => {
  const { t } = useLanguage();
  const modalTitle = title || t('colorPicker', 'Микшер цветов');

  const [initialColor, setInitialColor] = useState(color);
  const [currentColor, setCurrentColor] = useState(color);
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [activeTab, setActiveTab] = useState<'hsl' | 'rgb'>('hsl');
  const [gradientActiveIndex, setGradientActiveIndex] = useState<0 | 1>(0);

  const rgb = hexToRgb(currentColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hexInputId = useId();
  const hueInputId = useId();
  const satInputId = useId();
  const lightInputId = useId();
  const redInputId = useId();
  const greenInputId = useId();
  const blueInputId = useId();

  useEffect(() => {
    if (isOpen) {
      setInitialColor(color);
      if (textColorMode === 'gradient' && textGradientColors) {
        const activeHex = textGradientColors[gradientActiveIndex] || color;
        setCurrentColor(activeHex);
        setHexInput(activeHex.toUpperCase());
      } else {
        setCurrentColor(color);
        setHexInput(color.toUpperCase());
      }
    }
  }, [isOpen, color, textColorMode, textGradientColors, gradientActiveIndex]);

  if (!isOpen) return null;

  const emitColorChange = (hex: string) => {
    setCurrentColor(hex);
    setHexInput(hex.toUpperCase());
    if (textColorMode === 'gradient' && onGradientColorsChange) {
      const c1 = gradientActiveIndex === 0 ? hex : (textGradientColors?.[0] || '#f43f5e');
      const c2 = gradientActiveIndex === 1 ? hex : (textGradientColors?.[1] || '#38bdf8');
      onGradientColorsChange([c1, c2]);
    } else {
      onChange(hex);
    }
  };

  const updateColorFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    emitColorChange(hex);
  };

  const updateColorFromHsl = (h: number, s: number, l: number) => {
    const { r, g, b } = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);
    emitColorChange(hex);
  };

  const handleHexBlur = () => {
    let clean = hexInput.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean) || /^#[0-9A-Fa-f]{3}$/.test(clean)) {
      const { r, g, b } = hexToRgb(clean);
      const normalized = rgbToHex(r, g, b);
      emitColorChange(normalized);
    } else {
      setHexInput(currentColor.toUpperCase());
    }
  };

  const handleSelectPreset = (hex: string) => {
    emitColorChange(hex);
  };

  const handleReset = () => {
    emitColorChange(initialColor);
  };

  return createPortal(
    <div
      id="color-picker-overlay"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto select-none"
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        id="color-picker-dialog"
        className="w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-y-auto bg-[#1a1a24] border border-white/20 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-zinc-100 animate-scale-up pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Palette className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide truncate">{modalTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={t('back', 'Закрыть')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Color Mode Picker Bar (if text color mixer) */}
        {onColorModeChange && (
          <div className="space-y-1.5 p-2 bg-black/40 border border-white/10 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
              {t('colorMode', 'Режим раскраски текста')}
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onColorModeChange('solid')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  (textColorMode || 'solid') === 'solid'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                🎨 Сплошной
              </button>
              <button
                type="button"
                onClick={() => onColorModeChange('gradient')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  textColorMode === 'gradient'
                    ? 'bg-gradient-to-r from-rose-500 to-cyan-500 text-white border-cyan-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                🌈 Градиент
              </button>
              <button
                type="button"
                onClick={() => onColorModeChange('letter-rainbow')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  textColorMode === 'letter-rainbow'
                    ? 'bg-gradient-to-r from-yellow-500 via-emerald-500 to-indigo-500 text-white border-yellow-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                🔤 Радуга букв
              </button>
              <button
                type="button"
                onClick={() => onColorModeChange('word-rainbow')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  textColorMode === 'word-rainbow'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white border-pink-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                📝 Радуга слов
              </button>
              <button
                type="button"
                onClick={() => onColorModeChange('letter-random')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  textColorMode === 'letter-random'
                    ? 'bg-purple-900 text-purple-200 border-purple-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                🎲 Хаос букв
              </button>
              <button
                type="button"
                onClick={() => onColorModeChange('word-random')}
                className={`py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                  textColorMode === 'word-random'
                    ? 'bg-indigo-900 text-indigo-200 border-indigo-400 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                }`}
              >
                🔀 Хаос слов
              </button>
            </div>
          </div>
        )}

        {/* Gradient Settings (Color 1, Color 2, Angle) when Gradient Mode is active */}
        {textColorMode === 'gradient' && (
          <div className="space-y-2 p-2.5 bg-purple-950/40 border border-purple-500/40 rounded-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-200 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {t('gradientSettings', 'Настройка цветов градиента')}
              </span>
              <span className="text-[10px] font-semibold text-cyan-300">
                {gradientActiveIndex === 0 ? 'Настройка Цвет 1' : 'Настройка Цвет 2'}
              </span>
            </div>

            {/* Gradient Stops (Color 1 & Color 2) */}
            <div className="flex items-center justify-around gap-2 bg-black/50 p-2 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setGradientActiveIndex(0)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  gradientActiveIndex === 0
                    ? 'bg-purple-900/80 border-purple-400 ring-2 ring-purple-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/40 shadow-inner shrink-0"
                  style={{ backgroundColor: textGradientColors?.[0] || '#f43f5e' }}
                />
                <span className="text-xs font-bold">Цвет 1</span>
              </button>

              <div className="w-px h-6 bg-white/15" />

              <button
                type="button"
                onClick={() => setGradientActiveIndex(1)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  gradientActiveIndex === 1
                    ? 'bg-cyan-900/80 border-cyan-400 ring-2 ring-cyan-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/40 shadow-inner shrink-0"
                  style={{ backgroundColor: textGradientColors?.[1] || '#38bdf8' }}
                />
                <span className="text-xs font-bold">Цвет 2</span>
              </button>
            </div>

            {/* Angle Slider */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
              <span className="text-[11px] text-zinc-300 font-semibold">Угол градиента:</span>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={textGradientAngle ?? 45}
                onChange={(e) => onGradientAngleChange?.(parseInt(e.target.value, 10))}
                className="w-28 accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono text-cyan-300 font-bold w-10 text-right">
                {textGradientAngle ?? 45}°
              </span>
            </div>
          </div>
        )}

        {/* Current Color Preview & HEX input */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-white/25 shadow-inner shrink-0"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1 space-y-1 min-w-0">
            <label
              htmlFor={hexInputId}
              className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block truncate"
            >
              {t('hexCode', 'HEX-код цвета')}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id={hexInputId}
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={handleHexBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHexBlur();
                }}
                maxLength={7}
                className="w-full font-mono text-xs font-bold uppercase bg-zinc-900/90 border border-white/15 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-400"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          {initialColor.toLowerCase() !== currentColor.toLowerCase() && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[10px] font-semibold flex items-center gap-1 border border-white/10 transition-colors cursor-pointer shrink-0"
              title={t('reset', 'Вернуть исходный цвет')}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('reset', 'Сброс')}</span>
            </button>
          )}
        </div>

        {/* Sliders Modes Toggle */}
        <div className="flex items-center justify-between gap-1 p-0.5 bg-black/30 rounded-lg border border-white/10 text-[10px] sm:text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('hsl')}
            className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center px-1 truncate ${
              activeTab === 'hsl'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('spectrumTab', 'Спектр (Оттенок / Яркость)')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rgb')}
            className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center px-1 truncate ${
              activeTab === 'rgb'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('rgbTab', 'Каналы RGB (R / G / B)')}
          </button>
        </div>

        {/* Interactive Sliders */}
        {activeTab === 'hsl' ? (
          <div className="space-y-2.5 sm:space-y-3 pt-0.5">
            {/* 1. Hue Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={hueInputId}>{t('hue', 'Оттенок (Hue)')}</label>
                <span className="font-mono text-[10px] text-zinc-400">{hsl.h}°</span>
              </div>
              <input
                id={hueInputId}
                type="range"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => updateColorFromHsl(parseInt(e.target.value), hsl.s, hsl.l)}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-none"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
            </div>

            {/* 2. Saturation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={satInputId}>{t('saturation', 'Насыщенность')}</label>
                <span className="font-mono text-[10px] text-zinc-400">{hsl.s}%</span>
              </div>
              <input
                id={satInputId}
                type="range"
                min={0}
                max={100}
                value={hsl.s}
                onChange={(e) => updateColorFromHsl(hsl.h, parseInt(e.target.value), hsl.l)}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-none"
                style={{
                  background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                }}
              />
            </div>

            {/* 3. Lightness Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={lightInputId}>{t('lightness', 'Яркость')}</label>
                <span className="font-mono text-[10px] text-zinc-400">{hsl.l}%</span>
              </div>
              <input
                id={lightInputId}
                type="range"
                min={0}
                max={100}
                value={hsl.l}
                onChange={(e) => updateColorFromHsl(hsl.h, hsl.s, parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer outline-none"
                style={{
                  background: `linear-gradient(to right, #000000 0%, hsl(${hsl.h}, ${hsl.s}%, 50%) 50%, #ffffff 100%)`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-0.5">
            {/* Red Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={redInputId} className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> R
                </label>
                <span className="font-mono text-[10px] text-zinc-400">{rgb.r}</span>
              </div>
              <input
                id={redInputId}
                type="range"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => updateColorFromRgb(parseInt(e.target.value), rgb.g, rgb.b)}
                className="w-full h-2.5 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Green Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={greenInputId} className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> G
                </label>
                <span className="font-mono text-[10px] text-zinc-400">{rgb.g}</span>
              </div>
              <input
                id={greenInputId}
                type="range"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => updateColorFromRgb(rgb.r, parseInt(e.target.value), rgb.b)}
                className="w-full h-2.5 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blue Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-zinc-300">
                <label htmlFor={blueInputId} className="flex items-center gap-1 text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> B
                </label>
                <span className="font-mono text-[10px] text-zinc-400">{rgb.b}</span>
              </div>
              <input
                id={blueInputId}
                type="range"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => updateColorFromRgb(rgb.r, rgb.g, parseInt(e.target.value))}
                className="w-full h-2.5 accent-sky-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Quick Palette Swatches */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
            {t('quickPalette', 'Быстрая палитра')}
          </span>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
            {POPULAR_PALETTE.map((swatch) => {
              const isSelected = currentColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  type="button"
                  key={swatch.hex}
                  onClick={() => handleSelectPreset(swatch.hex)}
                  className={`h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-purple-400 ring-2 ring-purple-500 scale-110 z-10'
                      : 'border-white/20 hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.label}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 drop-shadow ${
                        swatch.hex === '#ffffff' || swatch.hex.startsWith('#fe') || swatch.hex.startsWith('#fa')
                          ? 'text-zinc-900'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-purple-600/30 cursor-pointer active:scale-98"
          >
            {t('done', 'Готово')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
