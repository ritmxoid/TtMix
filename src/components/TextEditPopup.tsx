import React, { useState } from 'react';
import { Check, Palette, AlignLeft, AlignCenter, AlignRight, Square, Type } from 'lucide-react';
import { VideoProjectState } from '../types';
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
}

export const TextEditPopup: React.FC<TextEditPopupProps> = ({ state, onChange, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'text' | 'bg'>(
    state.textBgEnabled ? 'bg' : 'text'
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const currentTab = state.textBgEnabled ? activeTab : 'text';

  const handleToggleBg = () => {
    if (!state.textBgEnabled) {
      onChange({ textBgEnabled: true });
      setActiveTab('bg');
    } else {
      if (activeTab === 'bg') {
        onChange({ textBgEnabled: false });
        setActiveTab('text');
      } else {
        setActiveTab('bg');
      }
    }
  };

  const currentColors = currentTab === 'bg' ? POPULAR_BG_COLORS : POPULAR_TEXT_COLORS;
  const activeColor = currentTab === 'bg' ? (state.textBgColor || '#000000') : (state.textColor || '#ffffff');

  const handleSelectColor = (color: string) => {
    if (currentTab === 'bg') {
      onChange({ textBgColor: color });
    } else {
      onChange({ textColor: color });
    }
  };

  return (
    <>
      {/* Backdrop overlay: tapping anywhere closes popup */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] cursor-pointer"
        onPointerDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Main floating popup docked at bottom */}
      <div
        data-dock="true"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 w-60 sm:w-64 max-w-[92vw] p-2.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/80 z-50 flex flex-col gap-2 pointer-events-auto select-none"
      >
        {/* TOP SECTION: Swaps between Text Size Slider and Background Opacity/Width Sliders */}
        {currentTab === 'text' ? (
          /* Text Mode: TT Icon + Font Size Range Slider */
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center text-purple-300 font-serif font-bold text-sm select-none shrink-0 w-5">
              <span className="tracking-tighter text-sm">Тт</span>
            </div>
            <input
              type="range"
              min="18"
              max="500"
              step="2"
              value={state.fontSize || 42}
              onChange={(e) =>
                onChange({ fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500 bg-zinc-800/70 h-2 rounded-lg cursor-pointer"
            />
          </div>
        ) : (
          /* Background Mode: Two compact sliders for Opacity & Width */
          <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
            {/* Row 1: Opacity */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-blue-300 shrink-0 w-16">
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
            </div>
            {/* Row 2: Width */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-blue-300 shrink-0 w-16">
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
            onClick={() => setIsPickerOpen(true)}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform border border-white/30 shrink-0"
            title={t('colorPaletteMixer', 'Палитра цветов и микшер')}
          >
            <Palette className="w-3.5 h-3.5 text-white drop-shadow" />
          </button>
        </div>

        {/* BOTTOM CONTROLS ROW: Uppercase / Tab toggle, Background Toggle, Alignment */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-white/10 select-none">
          {/* Left: If in 'bg' tab, allow switching back to 'text' mode, or show Uppercase checkbox */}
          {currentTab === 'bg' ? (
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition-all cursor-pointer"
              title={t('textSettings', 'Настройки текста')}
            >
              <Type className="w-3 h-3" />
              <span>{t('textTab', 'Текст')}</span>
            </button>
          ) : (
            <label className="flex items-center gap-1 cursor-pointer text-xs text-zinc-200 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={Boolean(state.isUppercase)}
                onChange={(e) => onChange({ isUppercase: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-500"
              />
              <span className="text-[11px] font-semibold">{t('uppercase', 'Заглавные')}</span>
            </label>
          )}

          {/* Middle: Background ("Фон") button */}
          <button
            type="button"
            onClick={handleToggleBg}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              state.textBgEnabled
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

          {/* Right: Alignment buttons */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 gap-0.5">
            <button
              type="button"
              onClick={() => onChange({ textAlign: 'left' })}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                state.textAlign === 'left'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={t('alignLeft', 'По левому краю')}
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ textAlign: 'center' })}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                state.textAlign === 'center' || !state.textAlign
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title={t('alignCenter', 'По центру')}
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ textAlign: 'right' })}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                state.textAlign === 'right'
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
      />
    </>
  );
};
