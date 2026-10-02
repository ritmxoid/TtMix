import React, { useState } from 'react';
import { Check, CheckCheck, Palette, AlignLeft, AlignCenter, AlignRight, Square, Type, RotateCcw } from 'lucide-react';
import { SegmentOverride, VideoProjectState } from '../types';
import { ColorPickerModal } from './ColorPickerModal';
import { useLanguage } from '../context/LanguageContext';

const POPULAR_TEXT_COLORS = [
  '#FFFFFF',
  '#FDE047',
  '#38BDF8',
  '#F43F5E',
  '#C084FC',
  '#34D399',
  '#FB923C',
  '#000000',
];

const POPULAR_BG_COLORS = [
  '#000000',
  '#0070F3',
  '#1E293B',
  '#7C3AED',
  '#DC2626',
  '#059669',
  '#D97706',
  '#FFFFFF',
];

interface TextEditPopupProps {
  state: VideoProjectState;
  onChange: (patch: Partial<VideoProjectState>) => void;
  onClose: () => void;
  activeSegmentIndex?: number;
  activeSegmentText?: string;
}

export const TextEditPopup: React.FC<TextEditPopupProps> = ({
  state,
  onChange,
  onClose,
  activeSegmentIndex,
  activeSegmentText,
}) => {
  const { t } = useLanguage();

  const isSegmentMode =
    state.textMode !== 'full' &&
    typeof activeSegmentIndex === 'number' &&
    activeSegmentIndex >= 0;

  const segOverride: SegmentOverride | undefined = isSegmentMode
    ? state.segmentOverrides?.[activeSegmentIndex]
    : undefined;

  const currentTextBgEnabled = isSegmentMode
    ? (segOverride?.textBgEnabled ?? state.textBgEnabled)
    : state.textBgEnabled;

  const [activeTab, setActiveTab] = useState<'text' | 'bg'>(
    currentTextBgEnabled ? 'bg' : 'text'
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const currentTab = currentTextBgEnabled ? activeTab : 'text';

  // Effective values for sliders & colors
  const baseFontSize = state.fontSize || 42;
  const currentFontSizeScale = segOverride?.fontSizeScale ?? 1.0;
  const currentFontSize = isSegmentMode
    ? Math.round(baseFontSize * currentFontSizeScale)
    : baseFontSize;

  const currentTextColor = isSegmentMode
    ? (segOverride?.textColor || state.textColor || '#ffffff')
    : (state.textColor || '#ffffff');

  const currentTextBgColor = isSegmentMode
    ? (segOverride?.textBgColor || state.textBgColor || '#000000')
    : (state.textBgColor || '#000000');

  const currentTextAlign = isSegmentMode
    ? (segOverride?.textAlign || state.textAlign || 'center')
    : (state.textAlign || 'center');

  const updateSegOverride = (patch: Partial<SegmentOverride>) => {
    if (typeof activeSegmentIndex !== 'number') return;
    const currentOverrides = state.segmentOverrides || {};
    const existing = currentOverrides[activeSegmentIndex] || {};
    onChange({
      segmentOverrides: {
        ...currentOverrides,
        [activeSegmentIndex]: {
          ...existing,
          ...patch,
        },
      },
    });
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    if (isSegmentMode) {
      updateSegOverride({ textAlign: align });
    } else {
      onChange({ textAlign: align });
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    if (isSegmentMode) {
      const scale = Number((newSize / baseFontSize).toFixed(2));
      updateSegOverride({ fontSizeScale: scale });
    } else {
      onChange({ fontSize: newSize });
    }
  };

  const handleToggleBg = () => {
    if (!currentTextBgEnabled) {
      if (isSegmentMode) {
        updateSegOverride({ textBgEnabled: true });
      } else {
        onChange({ textBgEnabled: true });
      }
      setActiveTab('bg');
    } else {
      if (activeTab === 'bg') {
        if (isSegmentMode) {
          updateSegOverride({ textBgEnabled: false });
        } else {
          onChange({ textBgEnabled: false });
        }
        setActiveTab('text');
      } else {
        setActiveTab('bg');
      }
    }
  };

  const currentColors = currentTab === 'bg' ? POPULAR_BG_COLORS : POPULAR_TEXT_COLORS;
  const activeColor = currentTab === 'bg' ? currentTextBgColor : currentTextColor;

  const handleSelectColor = (color: string) => {
    if (currentTab === 'bg') {
      if (isSegmentMode) {
        updateSegOverride({ textBgColor: color });
      } else {
        onChange({ textBgColor: color });
      }
    } else {
      if (isSegmentMode) {
        updateSegOverride({ textColor: color });
      } else {
        onChange({ textColor: color });
      }
    }
  };

  const handleResetSegment = () => {
    if (typeof activeSegmentIndex !== 'number') return;
    const currentOverrides = state.segmentOverrides || {};
    const existing = currentOverrides[activeSegmentIndex];
    if (!existing) return;

    const nextOverrides = { ...currentOverrides };
    const cleaned: SegmentOverride = {};
    if (typeof existing.positionX === 'number') cleaned.positionX = existing.positionX;
    if (typeof existing.positionY === 'number') cleaned.positionY = existing.positionY;
    if (typeof existing.rotation === 'number') cleaned.rotation = existing.rotation;

    if (Object.keys(cleaned).length > 0) {
      nextOverrides[activeSegmentIndex] = cleaned;
    } else {
      delete nextOverrides[activeSegmentIndex];
    }
    onChange({ segmentOverrides: nextOverrides });
  };

  const handleApplyToAll = () => {
    // 1. Clean segment overrides of styling overrides (fontSizeScale, textColor, textBgColor, textBgEnabled)
    // while preserving custom spatial coordinates (positionX, positionY, rotation)
    const nextOverrides: Record<number, SegmentOverride> = {};
    if (state.segmentOverrides) {
      Object.entries(state.segmentOverrides).forEach(([key, override]) => {
        const segIdx = parseInt(key, 10);
        const typedOverride = override as SegmentOverride | undefined;
        const cleaned: SegmentOverride = {};
        if (typeof typedOverride?.positionX === 'number') cleaned.positionX = typedOverride.positionX;
        if (typeof typedOverride?.positionY === 'number') cleaned.positionY = typedOverride.positionY;
        if (typeof typedOverride?.rotation === 'number') cleaned.rotation = typedOverride.rotation;
        if (Object.keys(cleaned).length > 0) {
          nextOverrides[segIdx] = cleaned;
        }
      });
    }

    onChange({
      fontSize: currentFontSize,
      textColor: currentTextColor,
      textBgColor: currentTextBgColor,
      textBgEnabled: currentTextBgEnabled,
      textAlign: currentTextAlign,
      segmentOverrides: nextOverrides,
    });
  };

  return (
    <>
      {/* Backdrop overlay: tapping anywhere closes popup (only active when color picker modal is not open) */}
      {!isPickerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[0.5px] cursor-pointer"
          onPointerDown={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}

      {/* Main floating popup docked directly above the bottom tool buttons */}
      <div
        data-dock="true"
        data-tour="text-properties-panel"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="fixed bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 w-72 sm:w-80 max-w-[94vw] p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl bg-black/45 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/60 z-50 flex flex-col gap-2.5 pointer-events-auto select-none"
      >
        {/* TOP SECTION: Swaps between Text Sliders (Size & Opacity) and Background Sliders (Opacity & Width) */}
        {currentTab === 'text' ? (
          /* Text Mode: Font Size & Text Opacity Sliders */
          <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* Row 1: Font Size */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-purple-300 shrink-0 w-20">
                {t('fontSize', 'Размер (Тт)')}:
              </span>
              <input
                type="range"
                min="18"
                max="500"
                step="2"
                value={currentFontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                className="w-full accent-purple-500 bg-zinc-800/80 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-purple-200 font-bold shrink-0 w-8 text-right">
                {currentFontSize}
              </span>
            </div>
            {/* Row 2: Text Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-purple-300 shrink-0 w-20">
                {t('opacity', 'Прозрачность')}:
              </span>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={state.textOpacity ?? 1}
                onChange={(e) => onChange({ textOpacity: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 bg-zinc-800/80 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-purple-200 font-bold shrink-0 w-8 text-right">
                {Math.round((state.textOpacity ?? 1) * 100)}%
              </span>
            </div>
          </div>
        ) : (
          /* Background Mode: Two compact sliders for Opacity & Width */
          <div className="flex flex-col gap-2 animate-in fade-in duration-150">
            {/* Row 1: Opacity */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-blue-300 shrink-0 w-20">
                {t('opacity', 'Прозрачность')}:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.textBgOpacity ?? 0.85}
                onChange={(e) => onChange({ textBgOpacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 bg-zinc-800/80 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-blue-200 font-bold shrink-0 w-8 text-right">
                {Math.round((state.textBgOpacity ?? 0.85) * 100)}%
              </span>
            </div>
            {/* Row 2: Width */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-blue-300 shrink-0 w-20">
                {t('boxWidth', 'Ширина')}:
              </span>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={state.textMaxWidthPercent ?? 85}
                onChange={(e) => onChange({ textMaxWidthPercent: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-500 bg-zinc-800/80 h-1.5 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-blue-200 font-bold shrink-0 w-8 text-right">
                {state.textMaxWidthPercent ?? 85}%
              </span>
            </div>
          </div>
        )}

        {/* PALETTE ROW: Color Swatches + Color Mixer */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/10">
          {currentColors.map((color) => {
            const isSelected = activeColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                onClick={() => handleSelectColor(color)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-transform flex items-center justify-center cursor-pointer shadow-sm ${
                  isSelected
                    ? currentTab === 'bg'
                      ? 'scale-110 ring-2 ring-blue-400 ring-offset-1 ring-offset-black'
                      : 'scale-110 ring-2 ring-purple-400 ring-offset-1 ring-offset-black'
                    : 'hover:scale-105 opacity-90 hover:opacity-100 border border-white/20'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      color === '#FFFFFF' || color === '#FDE047' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}

          {/* Rainbow Launcher for ColorPickerModal */}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsPickerOpen(true);
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform border border-white/30 shrink-0"
            title={t('colorPaletteMixer', 'Палитра цветов и микшер')}
          >
            <Palette className="w-3.5 h-3.5 text-white drop-shadow" />
          </button>
        </div>

        {/* BOTTOM CONTROLS ROW: Tt Uppercase, Reset (RotateCcw), Apply-to-all (CheckCheck), Background Toggle, Alignment */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/10 select-none">
          {/* 1. T Text tab switch when in bg mode, or Tt Uppercase checkbox in text mode */}
          {currentTab === 'bg' ? (
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-200 bg-purple-950/60 border border-purple-500/50 hover:bg-purple-900/80 transition-all cursor-pointer font-sans shadow-xs"
              title={t('textSettings', 'Настройки текста (Т)')}
            >
              Т
            </button>
          ) : (
            <label
              className="flex items-center gap-1 cursor-pointer text-xs text-zinc-200 hover:text-white transition-colors"
              title={t('uppercase', 'Заглавные')}
            >
              <input
                type="checkbox"
                checked={Boolean(state.isUppercase)}
                onChange={(e) => onChange({ isUppercase: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-500"
              />
              <span className="text-xs font-bold text-purple-200 font-mono select-none">Тт</span>
            </label>
          )}

          {/* 2. Reset Segment button (circular arrow icon) */}
          <button
            type="button"
            onClick={handleResetSegment}
            disabled={!isSegmentMode || !segOverride}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              isSegmentMode && segOverride
                ? 'border-amber-400/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 active:scale-95 shadow-sm'
                : 'border-white/10 bg-white/5 text-zinc-500 hover:text-zinc-400 cursor-default opacity-40'
            }`}
            title={
              isSegmentMode && segOverride
                ? t('resetSegment', 'Сбросить настройки этого фрагмента к общим')
                : t('resetSegmentDisabled', 'Сброс (нет изменений)')
            }
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* 3. Apply to all button (double checkmark icon) */}
          <button
            type="button"
            onClick={handleApplyToAll}
            className="p-1.5 rounded-lg border border-purple-400/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-sm"
            title={t('applyToAll', 'Применить текущие настройки ко всему тексту')}
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>

          {/* 4. Background ("Фон") button */}
          <button
            type="button"
            onClick={handleToggleBg}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              currentTextBgEnabled
                ? currentTab === 'bg'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-sm ring-1 ring-blue-400/50'
                  : 'bg-blue-950/80 text-blue-300 border-blue-500/50 hover:bg-blue-900/80'
                : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:border-white/30'
            }`}
            title={t('toggleFontBg', 'Фон под текст')}
          >
            <Square className="w-3 h-3" />
            <span>{t('fontBg', 'Фон')}</span>
          </button>

          {/* 5. Alignment buttons */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 gap-0.5">
            <button
              type="button"
              onClick={() => handleTextAlignChange('left')}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                currentTextAlign === 'left'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={t('alignLeft', 'По левому краю')}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleTextAlignChange('center')}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                currentTextAlign === 'center' || !currentTextAlign
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={t('alignCenter', 'По центру')}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleTextAlignChange('right')}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                currentTextAlign === 'right'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={t('alignRight', 'По правому краю')}
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Color Picker Mixer Modal */}
      <ColorPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        color={activeColor}
        onChange={(newColor) => handleSelectColor(newColor)}
        title={
          currentTab === 'bg'
            ? t('bgColorPicker', 'Микшер цвета фона')
            : t('textColorPicker', 'Микшер цвета текста')
        }
        textColorMode={currentTab === 'text' ? (state.textColorMode || 'solid') : undefined}
        textGradientColors={currentTab === 'text' ? (state.textGradientColors || ['#f43f5e', '#38bdf8']) : undefined}
        textGradientAngle={currentTab === 'text' ? (state.textGradientAngle ?? 45) : undefined}
        onColorModeChange={currentTab === 'text' ? (mode) => onChange({ textColorMode: mode }) : undefined}
        onGradientColorsChange={currentTab === 'text' ? (colors) => onChange({ textGradientColors: colors }) : undefined}
        onGradientAngleChange={currentTab === 'text' ? (angle) => onChange({ textGradientAngle: angle }) : undefined}
      />
    </>
  );
};
