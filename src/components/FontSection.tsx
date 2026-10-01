import React, { useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, MoveVertical, MoveHorizontal, Type, Palette, Check } from 'lucide-react';
import { FONT_OPTIONS } from '../data/presets';
import { VideoProjectState } from '../types';
import { ColorPickerModal } from './ColorPickerModal';
import { useLanguage } from '../context/LanguageContext';

const COLOR_SWATCHES = [
  { label: 'Белый', value: '#ffffff' },
  { label: 'Желтый', value: '#facc15' },
  { label: 'Неон циан', value: '#06b6d4' },
  { label: 'Розовый', value: '#f43f5e' },
  { label: 'Фиолетовый', value: '#c084fc' },
  { label: 'Мятный', value: '#34d399' },
  { label: 'Оранжевый', value: '#fb923c' },
  { label: 'Черный', value: '#09090b' },
];

interface FontSectionProps {
  state: VideoProjectState;
  onChange: (patch: Partial<VideoProjectState>) => void;
}

export const FontSection: React.FC<FontSectionProps> = ({ state, onChange }) => {
  const { t } = useLanguage();
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [isStrokeColorPickerOpen, setIsStrokeColorPickerOpen] = useState(false);
  const [isTextBgColorPickerOpen, setIsTextBgColorPickerOpen] = useState(false);

  return (
    <div data-tour="font-audio" className="bg-[#16161D] border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center border border-purple-500/30">
            2
          </span>
          {t('fontSectionTitle', 'Шрифт и оформление')}
        </h2>
        <span className="text-xs text-zinc-400 font-medium">20+ {t('fonts', 'шрифтов')}</span>
      </div>

      {/* Primary Position, Size, Opacity & Color Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-[#0F0F12]/90 border border-white/10 rounded-xl p-3.5 shadow-sm">
        {/* Height Position (Положение по вертикали Y) */}
        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <MoveVertical className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('verticalY', 'Высота (Y)')}</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {typeof state.textPositionY === 'number' ? state.textPositionY : 50}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">{t('posTop', 'Верх')}</span>
            <input
              type="range"
              min="15"
              max="85"
              step="1"
              value={typeof state.textPositionY === 'number' ? state.textPositionY : 50}
              onChange={(e) =>
                onChange({ textPositionY: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              title={t('verticalY', 'Положение текста по высоте')}
            />
            <span className="text-[10px] text-zinc-500 font-medium">{t('posBottom', 'Низ')}</span>
          </div>
        </div>

        {/* Horizontal Position (Положение по горизонтали X) */}
        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('horizontalX', 'Позиция (X)')}</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {typeof state.textPositionX === 'number' ? state.textPositionX : 50}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">←</span>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={typeof state.textPositionX === 'number' ? state.textPositionX : 50}
              onChange={(e) =>
                onChange({ textPositionX: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              title="Положение текста по горизонтали"
            />
            <span className="text-[10px] text-zinc-500 font-medium">→</span>
          </div>
        </div>

        {/* Font Size (Размер шрифта) */}
        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('fontSize', 'Размер шрифта')}</span>
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="18"
                max="1000"
                value={state.fontSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) onChange({ fontSize: Math.max(10, Math.min(1000, val)) });
                }}
                className="w-14 bg-zinc-800 border border-white/10 rounded px-1.5 py-0.5 text-right font-mono text-[11px] text-purple-300 font-bold focus:outline-none focus:border-purple-400"
              />
              <span className="text-[11px] text-zinc-400 font-mono">px</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">A-</span>
            <input
              type="range"
              min="18"
              max="500"
              step="2"
              value={state.fontSize}
              onChange={(e) =>
                onChange({ fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              title={t('fontSize', 'Размер шрифта')}
            />
            <span className="text-[10px] text-zinc-500 font-medium">A+</span>
          </div>
        </div>

        {/* Text Opacity (Прозрачность текста) */}
        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-purple-400 opacity-60" />
              <span>{t('textOpacityLabel', 'Прозрачность')}</span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {Math.round((state.textOpacity ?? 1.0) * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-medium">5%</span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={state.textOpacity ?? 1.0}
              onChange={(e) =>
                onChange({ textOpacity: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              title="Прозрачность текста"
            />
            <span className="text-[10px] text-zinc-500 font-medium">100%</span>
          </div>
        </div>

        {/* Text Color (Цвет шрифта) */}
        <div className="flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>{t('fontColor', 'Цвет шрифта')}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsTextColorPickerOpen(true)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 bg-zinc-800/80 hover:bg-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95"
                title={t('colorPicker', 'Открыть полный микшер цвета текста')}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0"
                  style={{
                    backgroundColor: state.textColorMode === 'gradient'
                      ? state.textGradientColors?.[0] || state.textColor
                      : state.textColor,
                  }}
                />
                <span className="text-[10px] font-mono text-zinc-300 font-semibold uppercase">
                  {state.textColorMode && state.textColorMode !== 'solid' ? state.textColorMode : state.textColor}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLOR_SWATCHES.map((swatch) => {
              const isSelected =
                state.textColor.toLowerCase() === swatch.value.toLowerCase() &&
                (!state.textColorMode || state.textColorMode === 'solid');
              return (
                <button
                  key={swatch.value}
                  onClick={() => onChange({ textColor: swatch.value, textColorMode: 'solid' })}
                  className={`w-5 h-5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-purple-400 scale-110 border-white z-10'
                      : 'border-white/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.value }}
                  title={t('swatch_' + swatch.value, swatch.label)}
                >
                  {isSelected && (
                    <Check
                      className={`w-3 h-3 ${
                        swatch.value === '#ffffff' || swatch.value === '#facc15'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Text Color Modes Bar (Сплошной, Градиент, Радуга, Хаос) */}
      <div className="bg-[#0F0F12]/90 border border-white/10 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Режим раскраски и спецэффекты цвета</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
            {state.textColorMode || 'solid'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'solid' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              (!state.textColorMode || state.textColorMode === 'solid')
                ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <span>🎨 Сплошной</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'gradient' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.textColorMode === 'gradient'
                ? 'bg-gradient-to-r from-rose-500 to-cyan-500 text-white border-cyan-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <span>🌈 Градиент</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'letter-rainbow' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.textColorMode === 'letter-rainbow'
                ? 'bg-gradient-to-r from-yellow-500 via-emerald-500 to-indigo-500 text-white border-yellow-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title="Каждая буква анимируется своим цветом радуги"
          >
            <span>🔤 Радуга букв</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'word-rainbow' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.textColorMode === 'word-rainbow'
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white border-pink-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title="Каждое слово анимируется своим цветом радуги"
          >
            <span>📝 Радуга слов</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'letter-random' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.textColorMode === 'letter-random'
                ? 'bg-purple-900 text-purple-200 border-purple-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title="Буквы получают случайные неоновые цвета"
          >
            <span>🎲 Хаос букв</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ textColorMode: 'word-random' })}
            className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              state.textColorMode === 'word-random'
                ? 'bg-indigo-900 text-indigo-200 border-indigo-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title="Слова получают случайные яркие цвета"
          >
            <span>🔀 Хаос слов</span>
          </button>
        </div>

        {/* Gradient Settings controls if Gradient mode is active */}
        {state.textColorMode === 'gradient' && (
          <div className="pt-2 border-t border-white/10 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-semibold">Градиентные цвета (Цвет 1 и Цвет 2):</span>
              <button
                type="button"
                onClick={() => setIsTextColorPickerOpen(true)}
                className="text-[11px] text-purple-300 hover:text-white underline cursor-pointer"
              >
                Настроить в Микшере →
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 bg-black/40 p-2 rounded-lg border border-white/10">
              {/* Color 1 */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Цвет 1:</span>
                <input
                  type="color"
                  value={state.textGradientColors?.[0] || '#f43f5e'}
                  onChange={(e) =>
                    onChange({
                      textGradientColors: [
                        e.target.value,
                        state.textGradientColors?.[1] || '#38bdf8',
                      ],
                    })
                  }
                  className="w-7 h-7 rounded-md border-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[10px] text-zinc-300 uppercase">
                  {state.textGradientColors?.[0] || '#f43f5e'}
                </span>
              </div>

              {/* Color 2 */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Цвет 2:</span>
                <input
                  type="color"
                  value={state.textGradientColors?.[1] || '#38bdf8'}
                  onChange={(e) =>
                    onChange({
                      textGradientColors: [
                        state.textGradientColors?.[0] || '#f43f5e',
                        e.target.value,
                      ],
                    })
                  }
                  className="w-7 h-7 rounded-md border-0 bg-transparent cursor-pointer"
                />
                <span className="font-mono text-[10px] text-zinc-300 uppercase">
                  {state.textGradientColors?.[1] || '#38bdf8'}
                </span>
              </div>

              {/* Angle */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Угол:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={state.textGradientAngle ?? 45}
                  onChange={(e) =>
                    onChange({ textGradientAngle: parseInt(e.target.value, 10) })
                  }
                  className="w-20 accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
                <span className="font-mono text-[10px] text-purple-300 font-bold w-7 text-right">
                  {state.textGradientAngle ?? 45}°
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Font Cards Grid - 1.5 rows visible with scroll */}
      <div
        id="font-picker-block"
        className="scroll-mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[160px] sm:max-h-[170px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent rounded-xl transition-all duration-300"
      >
        {FONT_OPTIONS.map((font) => {
          const isSelected = state.fontFamily === font.family;
          const fontKey = font.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
          return (
            <button
              key={font.id}
              onClick={() => onChange({ fontFamily: font.family })}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-1 group cursor-pointer ${
                isSelected
                  ? 'border-purple-400 bg-purple-500/15 shadow-sm ring-1 ring-purple-400/50'
                  : 'border-white/10 bg-[#0F0F12]/60 hover:bg-[#0F0F12] hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-white">
                  {t('font_name_' + fontKey, font.name)}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                  {t('font_cat_' + fontKey, font.category)}
                </span>
              </div>
              <div
                className="text-base sm:text-lg text-white font-bold truncate mt-1 drop-shadow-sm"
                style={{ fontFamily: font.family }}
              >
                {t('font_sample_' + fontKey, font.sampleText)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Stroke & Formatting Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
        {/* Stroke Checkbox */}
        <div className="bg-[#0F0F12]/80 border border-white/10 rounded-xl p-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
            <input
              type="checkbox"
              checked={state.strokeEnabled}
              onChange={(e) => onChange({ strokeEnabled: e.target.checked })}
              className="w-4 h-4 rounded accent-purple-500 bg-zinc-800 border-zinc-700 cursor-pointer"
            />
            <span>{t('stroke', 'Контурная обводка текста')}</span>
          </label>

          {state.strokeEnabled && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStrokeColorPickerOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/20 bg-zinc-800/80 hover:bg-zinc-700 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                title={t('strokeColor', 'Цвет обводки')}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0"
                  style={{ backgroundColor: state.strokeColor }}
                />
                <span className="text-[10px] font-mono text-zinc-300 font-semibold uppercase">
                  {state.strokeColor}
                </span>
              </button>
              <div className="flex-1">
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={state.strokeWidth}
                  onChange={(e) =>
                    onChange({ strokeWidth: parseInt(e.target.value) })
                  }
                  className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {state.strokeWidth}px
              </span>
            </div>
          )}
        </div>

        {/* Uppercase, Alignment & Text Box Plashka / Width */}
        <div className="bg-[#0F0F12]/80 border border-white/10 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={state.isUppercase}
                onChange={(e) => onChange({ isUppercase: e.target.checked })}
                className="w-4 h-4 rounded accent-purple-500 bg-zinc-800 border-zinc-700 cursor-pointer"
              />
              <span>{t('uppercase', 'ЗАГЛАВНЫЕ')}</span>
            </label>

            <div className="flex items-center gap-1 bg-[#16161D] border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => onChange({ textAlign: 'left' })}
                className={`p-1.5 rounded ${
                  state.textAlign === 'left'
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={t('alignLeft', 'По левому краю')}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChange({ textAlign: 'center' })}
                className={`p-1.5 rounded ${
                  state.textAlign === 'center'
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={t('alignCenter', 'По центру')}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChange({ textAlign: 'right' })}
                className={`p-1.5 rounded ${
                  state.textAlign === 'right'
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={t('alignRight', 'По правому краю')}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Background Plashka & Max Width Settings */}
          <div className="pt-2 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-300">
                <input
                  type="checkbox"
                  checked={Boolean(state.textBgEnabled)}
                  onChange={(e) => onChange({ textBgEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-500 bg-zinc-800 border-zinc-700 cursor-pointer"
                />
                <span>{t('fontBg', 'Фон под текст')}</span>
              </label>

              {/* Box Max-Width slider */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400 text-[11px]">Ширина блока:</span>
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={state.textMaxWidthPercent ?? 85}
                  onChange={(e) => onChange({ textMaxWidthPercent: parseInt(e.target.value, 10) })}
                  className="w-16 accent-blue-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  title="Ширина прямоугольника текста"
                />
                <span className="text-[10px] font-mono text-zinc-300 w-6 text-right">
                  {state.textMaxWidthPercent ?? 85}%
                </span>
              </div>
            </div>

            {state.textBgEnabled && (
              <div className="p-2.5 rounded-lg bg-black/40 border border-blue-500/30 space-y-2 animate-in fade-in duration-150">
                {/* Plashka Colors & Custom Color */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-zinc-300 font-medium">Цвет плашки:</span>
                  <div className="flex items-center gap-1">
                    {['#0070f3', '#000000', '#ffffff', '#eab308', '#dc2626', '#10b981', '#a855f7'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onChange({ textBgColor: c })}
                        className={`w-5 h-5 rounded-md border transition-transform cursor-pointer ${
                          (state.textBgColor || '#0070f3').toLowerCase() === c.toLowerCase()
                            ? 'scale-110 ring-2 ring-blue-400 border-white'
                            : 'border-white/20 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsTextBgColorPickerOpen(true)}
                      className="w-5 h-5 rounded-md bg-gradient-to-tr from-rose-500 via-purple-500 to-cyan-400 p-0.5 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform border border-white/30"
                      title={t('bgColorPicker', 'Микшер цвета фона')}
                    >
                      <Palette className="w-3 h-3 text-white drop-shadow" />
                    </button>
                  </div>
                </div>

                {/* Plashka Opacity Slider */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-zinc-300 font-medium">Прозрачность плашки:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={state.textBgOpacity ?? 0.85}
                    onChange={(e) => onChange({ textBgOpacity: parseFloat(e.target.value) })}
                    className="w-28 accent-blue-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300 w-8 text-right">
                    {Math.round((state.textBgOpacity ?? 0.85) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Color Picker Modals */}
      <ColorPickerModal
        isOpen={isTextColorPickerOpen}
        onClose={() => setIsTextColorPickerOpen(false)}
        color={state.textColor}
        onChange={(newColor) => onChange({ textColor: newColor })}
        title={t('textColorPicker', 'Микшер цвета текста')}
        textColorMode={state.textColorMode || 'solid'}
        textGradientColors={state.textGradientColors || ['#f43f5e', '#38bdf8']}
        textGradientAngle={state.textGradientAngle ?? 45}
        onColorModeChange={(mode) => onChange({ textColorMode: mode })}
        onGradientColorsChange={(colors) => onChange({ textGradientColors: colors })}
        onGradientAngleChange={(angle) => onChange({ textGradientAngle: angle })}
      />

      <ColorPickerModal
        isOpen={isStrokeColorPickerOpen}
        onClose={() => setIsStrokeColorPickerOpen(false)}
        color={state.strokeColor}
        onChange={(newColor) => onChange({ strokeColor: newColor })}
        title={t('strokeColorPicker', 'Микшер цвета обводки')}
      />

      <ColorPickerModal
        isOpen={isTextBgColorPickerOpen}
        onClose={() => setIsTextBgColorPickerOpen(false)}
        color={state.textBgColor || '#0070f3'}
        onChange={(newColor) => onChange({ textBgColor: newColor })}
        title={t('bgColorPicker', 'Микшер цвета фона')}
      />
    </div>
  );
};
