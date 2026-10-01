import React, { useState } from 'react';
import {
  Film,
  X,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Upload,
  Sparkles,
  RefreshCw,
  Dices,
  Infinity,
} from 'lucide-react';
import { BACKGROUND_PRESETS } from '../data/presets';
import {
  VideoProjectState,
  ProceduralMoodStyle,
  MatrixDirection,
  MatrixColorTheme,
  FireworksColorTheme,
  FlagsCompositionMode,
  FlagsScaleMode,
  FlagsMotionStyle,
  FlagsEffect,
  FlagsBgStyle,
  CloudsSkyStyle,
} from '../types';
import { WORLD_FLAG_EMOJIS } from '../utils/proceduralBackgrounds';
import { ColorPickerModal } from './ColorPickerModal';
import { useLanguage } from '../context/LanguageContext';
import { trackSelectBgTheme } from '../utils/analytics';

interface BackgroundSectionProps {
  state: VideoProjectState;
  onChange: (patch: Partial<VideoProjectState>) => void;
  onClearBackgroundMedia: () => void;
  fileName: string | null;
  onOpenUploadModal?: () => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
  state,
  onChange,
  onClearBackgroundMedia,
  fileName,
  onOpenUploadModal,
}) => {
  const { t } = useLanguage();
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const isCustomMediaActive =
    (state.bgType === 'video' || state.bgType === 'image') && Boolean(state.bgMediaUrl);

  return (
    <div data-tour="bg-generator" className="bg-[#16161D] border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center border border-purple-500/30">
            3
          </span>
          {t('bgSectionTitle', 'Фон видео')}
        </h2>

        {fileName && (
          <button
            type="button"
            onClick={onClearBackgroundMedia}
            className="text-xs text-zinc-400 hover:text-rose-300 flex items-center gap-1 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            title={t('deleteFile', 'Сбросить прикрепленный файл')}
          >
            <X className="w-3.5 h-3.5" /> {t('deleteFile', 'Сбросить фон')}
          </button>
        )}
      </div>

      {/* Active User Media Status or Quick Upload Prompt */}
      {fileName ? (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {state.bgMediaType === 'image' ? (
              <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Film className="w-4 h-4 text-purple-400 shrink-0" />
            )}
            <span className="text-zinc-200 font-medium truncate max-w-[150px] sm:max-w-[220px]">
              {fileName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="text-[11px] font-semibold text-purple-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg border border-white/10 transition-colors cursor-pointer"
                title={t('replace', 'Заменить текущий фон другим файлом')}
              >
                {t('replace', 'Заменить')}
              </button>
            )}

            {isCustomMediaActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {t('active', 'Активен')}
              </span>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    bgType: state.bgMediaType === 'image' ? 'image' : 'video',
                  })
                }
                className="text-[11px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg border border-purple-500/30 transition-colors cursor-pointer"
              >
                {t('enable', 'Включить')}
              </button>
            )}
          </div>
        </div>
      ) : onOpenUploadModal ? (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/25 via-purple-900/15 to-indigo-950/20 border border-purple-500/25 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Upload className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-zinc-200 font-semibold block text-[11px] sm:text-xs truncate">
                {t('uploadVideoPhoto', 'Свой видеоролик или фото')}
              </span>
              <span className="text-[10px] text-zinc-400 block">
                {t('maxUploadSizeDesc', 'Рекомендуемый размер видео — до 1 ГБ')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-md shadow-purple-600/20 shrink-0 hover:scale-[1.02] active:scale-95"
          >
            {t('uploadShort', 'Загрузить')}
          </button>
        </div>
      ) : null}

      {/* Preset Background Gradients */}
      <div data-tour="bg-presets-area" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            {fileName ? t('gradientThemes', 'Градиентные и анимированные темы:') : t('colorThemes', 'Цветовые и анимированные темы:')}
          </label>
        </div>

        <div className="max-h-[92px] sm:max-h-[92px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent rounded-xl">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected =
                state.bgType === 'preset' && state.bgPresetId === preset.id;
              const isBrightTheme =
                preset.id === 'clean-white' ||
                preset.id === 'notebook-grid' ||
                preset.id === 'notebook-flip';
              const isRegenerable = preset.id.startsWith('ai-procedural-');
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    const isProcedural = preset.id.startsWith('ai-procedural-');
                    const mood = isProcedural
                      ? (preset.id.replace('ai-procedural-', '') as ProceduralMoodStyle)
                      : state.proceduralMood;
                    onChange({
                      bgType: 'preset',
                      bgPresetId: preset.id,
                      proceduralMood: mood,
                    });
                    trackSelectBgTheme({ presetId: preset.id, name: preset.name });
                  }}
                  className={`h-14 rounded-xl border relative overflow-hidden transition-all text-left p-2 flex flex-col justify-end cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-purple-400 ring-2 ring-purple-500/50 scale-[1.02]'
                      : 'border-white/15 hover:border-zinc-400 opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    background:
                      preset.id === 'clean-white'
                        ? (state.bgCustomColor || '#ffffff')
                        : preset.id === 'notebook-flip'
                        ? 'linear-gradient(90deg, #64748b 0%, #64748b 12%, #f8fafc 13%, #ffffff 100%)'
                        : preset.id === 'notebook-grid'
                        ? `repeating-linear-gradient(0deg, ${state.bgCustomColor || '#ffffff'}, ${state.bgCustomColor || '#ffffff'} 11px, #bfdbfe 12px), repeating-linear-gradient(90deg, ${state.bgCustomColor || '#ffffff'}, ${state.bgCustomColor || '#ffffff'} 11px, #bfdbfe 12px)`
                        : preset.id === 'anecdote'
                        ? 'linear-gradient(135deg, #1e0538, #581c87)'
                        : preset.id === 'autumn'
                        ? 'linear-gradient(135deg, #451a03, #b45309)'
                        : preset.id === 'winter'
                        ? 'linear-gradient(135deg, #082f49, #38bdf8)'
                        : preset.id === 'music'
                        ? 'linear-gradient(135deg, #090a1a, #a855f7)'
                        : preset.id === 'disco'
                        ? 'linear-gradient(135deg, #09090f, #ec4899)'
                        : preset.id === 'lasers'
                        ? 'linear-gradient(135deg, #03050a, #06b6d4)'
                        : preset.id === 'old-parchment'
                        ? 'linear-gradient(135deg, #e8d3a7, #c99b5b)'
                        : preset.id === 'flying-questions'
                        ? 'radial-gradient(circle at center, #1e1b4b 0%, #090a1a 100%)'
                        : preset.id === 'flying-exclamations'
                        ? 'linear-gradient(135deg, #450a0a, #7f1d1d)'
                        : preset.id === 'flying-kisses'
                        ? 'linear-gradient(135deg, #500724, #18020a)'
                        : preset.id === 'flying-currency'
                        ? 'linear-gradient(135deg, #022115, #064e3b)'
                        : preset.id === 'cosmic-dark' || preset.id === 'stary-sky'
                        ? 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)'
                        : preset.id === 'flying-hearts'
                        ? 'linear-gradient(135deg, #881337, #e11d48)'
                        : preset.id === 'flying-balloons'
                        ? 'linear-gradient(135deg, #0f172a, #38bdf8)'
                        : `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                  }}
                  title={t('bgPreset_desc_' + preset.id, preset.description)}
                >
                  {isRegenerable && (
                    <span
                      className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/65 backdrop-blur-xs text-purple-300 border border-white/10 flex items-center justify-center pointer-events-none shadow-xs"
                      title={t('proceduralBadge', 'Бесконечные варианты генерации')}
                    >
                      <Infinity className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span
                    className={`text-[10px] sm:text-[10.5px] font-bold leading-tight line-clamp-1 ${
                      isBrightTheme && (!state.bgCustomColor || state.bgCustomColor === '#ffffff' || state.bgCustomColor.startsWith('#f')) ? 'text-zinc-900 font-extrabold' : 'text-white drop-shadow'
                    }`}
                  >
                    {t('bgPreset_name_' + preset.id, preset.name)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matrix Code Digital Rain Controls */}
      {(state.bgPresetId === 'ai-procedural-matrix' || state.proceduralMood === 'matrix') && (
        <div className="bg-gradient-to-b from-emerald-950/40 to-black/60 border border-emerald-500/30 rounded-xl p-3.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                🟢 Матрица: Настройки кода
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const dirs: MatrixDirection[] = [
                  'top-down',
                  'bottom-up',
                  'left-right',
                  'right-left',
                  'edges-to-center',
                  'center-to-edges',
                ];
                const themes: MatrixColorTheme[] = [
                  'classic-green',
                  'cyber-cyan',
                  'neon-purple',
                  'amber-gold',
                  'red-alert',
                  'rainbow',
                  'random-shift',
                ];
                const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                const randomSeed = Math.floor(Math.random() * 1000000);
                onChange({
                  matrixDirection: randomDir,
                  matrixColorTheme: randomTheme,
                  proceduralSeed: randomSeed,
                });
              }}
              className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
              title="Рандомизировать направление, цвета и расположение битов"
            >
              <Dices className="w-3.5 h-3.5" /> Микс матрицы
            </button>
          </div>

          {/* 1. Matrix Direction selector (6 directions) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Направление потока:</span>
              <span className="text-emerald-400 font-mono text-[10px]">
                {state.matrixDirection === 'bottom-up'
                  ? '⬆️ Снизу вверх'
                  : state.matrixDirection === 'left-right'
                  ? '➡️ Слева направо'
                  : state.matrixDirection === 'right-left'
                  ? '⬅️ Справа налево'
                  : state.matrixDirection === 'edges-to-center'
                  ? '🎯 С краев к центру'
                  : state.matrixDirection === 'center-to-edges'
                  ? '💥 От центра к краям'
                  : '⬇️ Сверху вниз'}
              </span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: 'top-down' as MatrixDirection, label: '⬇️ Вниз', title: 'Сверху вниз (Классика)' },
                { id: 'bottom-up' as MatrixDirection, label: '⬆️ Вверх', title: 'Снизу вверх (Антигравитация)' },
                { id: 'left-right' as MatrixDirection, label: '➡️ Вправо', title: 'Слева направо (Кибер-сканер)' },
                { id: 'right-left' as MatrixDirection, label: '⬅️ Влево', title: 'Справа налево (Реверс)' },
                { id: 'edges-to-center' as MatrixDirection, label: '🎯 К центру', title: 'С краев навстречу к центру' },
                { id: 'center-to-edges' as MatrixDirection, label: '💥 Из центра', title: 'От центра к краям экрана' },
              ].map((item) => {
                const isSelected = (state.matrixDirection || 'top-down') === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onChange({ matrixDirection: item.id })}
                    className={`py-1.5 px-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer text-center truncate ${
                      isSelected
                        ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-400/50 scale-[1.02]'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-emerald-500/30 hover:text-white'
                    }`}
                    title={item.title}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Matrix Color Theme selector (7 styles) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Цветовая гамма битов:</span>
              <span className="text-emerald-400 font-mono text-[10px]">
                {state.matrixColorTheme === 'cyber-cyan'
                  ? '🔷 Циан'
                  : state.matrixColorTheme === 'neon-purple'
                  ? '🟣 Пурпур'
                  : state.matrixColorTheme === 'amber-gold'
                  ? '🟠 Янтарный'
                  : state.matrixColorTheme === 'red-alert'
                  ? '🔴 Кибер-красный'
                  : state.matrixColorTheme === 'rainbow'
                  ? '🌈 Радуга'
                  : state.matrixColorTheme === 'random-shift'
                  ? '🎲 Случайный перелив'
                  : '🟢 Зеленый (Matrix)'}
              </span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'classic-green' as MatrixColorTheme, name: 'Зеленый', color: '#00ff66' },
                { id: 'cyber-cyan' as MatrixColorTheme, name: 'Циан', color: '#00f0ff' },
                { id: 'neon-purple' as MatrixColorTheme, name: 'Пурпур', color: '#e879f9' },
                { id: 'amber-gold' as MatrixColorTheme, name: 'Янтарный', color: '#facc15' },
                { id: 'red-alert' as MatrixColorTheme, name: 'Красный', color: '#f43f5e' },
                { id: 'rainbow' as MatrixColorTheme, name: 'Радуга', gradient: 'linear-gradient(135deg, #f43f5e, #facc15, #00ff66, #00f0ff, #e879f9)' },
                { id: 'random-shift' as MatrixColorTheme, name: 'Рандом', gradient: 'radial-gradient(circle, #38bdf8, #a855f7, #ec4899)' },
              ].map((theme) => {
                const isSelected = (state.matrixColorTheme || 'classic-green') === theme.id;
                return (
                  <button
                    type="button"
                    key={theme.id}
                    onClick={() => onChange({ matrixColorTheme: theme.id })}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-sm ring-1 ring-emerald-400/40 scale-[1.03]'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/30 shrink-0 shadow-xs"
                      style={theme.gradient ? { background: theme.gradient } : { backgroundColor: theme.color }}
                    />
                    <span>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-mono">
            💡 Размер битов синхронизирован с размером текста. В центре экрана биты раскодируются в буквы текста.
          </p>
        </div>
      )}

      {/* Fireworks Procedural Generator Controls */}
      {(state.bgPresetId === 'ai-procedural-fireworks' || state.proceduralMood === 'fireworks') && (
        <div className="bg-gradient-to-b from-purple-950/40 via-amber-950/20 to-black/60 border border-amber-500/30 rounded-xl p-3.5 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                🎆 Фейерверки: Настройки салюта
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const themes: FireworksColorTheme[] = [
                  'multicolor',
                  'gold-glitter',
                  'neon-cyber',
                  'crimson-ruby',
                  'cyan-violet',
                  'emerald-lime',
                ];
                const scaleModes: ('mixed' | 'small' | 'medium' | 'giant')[] = ['mixed', 'small', 'medium', 'giant'];
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                const randomScale = scaleModes[Math.floor(Math.random() * scaleModes.length)];
                const randomCount = Math.floor(1 + Math.random() * 29); // 1 to 30!
                const randomSeed = Math.floor(Math.random() * 1000000);
                onChange({
                  fireworksColorTheme: randomTheme,
                  fireworksScaleMode: randomScale,
                  fireworksCount: randomCount,
                  proceduralSeed: randomSeed,
                });
              }}
              className="text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
              title="Рандомизировать количество, масштаб, разновидности салютов и палитру"
            >
              <Dices className="w-3.5 h-3.5" /> Микс салютов
            </button>
          </div>

          {/* 1. Fireworks Count Slider (1 to 30) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Количество салютов одновременно:</span>
              <span className="text-amber-400 font-mono font-bold text-xs">
                {state.fireworksCount ?? 8} {Number(state.fireworksCount ?? 8) === 1 ? 'залп (соло)' : Number(state.fireworksCount ?? 8) === 30 ? 'залпов (гранд финал!)' : 'залпов'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={state.fireworksCount ?? 8}
              onChange={(e) => onChange({ fireworksCount: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            {/* Quick Count Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {[
                { count: 1, label: '1 (Соло)' },
                { count: 5, label: '5 (Шоу)' },
                { count: 10, label: '10 (Салют)' },
                { count: 20, label: '20 (Батарея)' },
                { count: 30, label: '30 (Гранд Финал)' },
              ].map((chip) => {
                const isSelected = (state.fireworksCount ?? 8) === chip.count;
                return (
                  <button
                    type="button"
                    key={chip.count}
                    onClick={() => onChange({ fireworksCount: chip.count })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400 text-white shadow-xs'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Scale Mode: small, medium, giant, mixed */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Масштаб и калибр салютов:</span>
              <span className="text-amber-400 font-mono text-[10px]">
                {state.fireworksScaleMode === 'giant'
                  ? '💥 Очень крупные'
                  : state.fireworksScaleMode === 'small'
                  ? '🎇 Мелкие искры'
                  : state.fireworksScaleMode === 'medium'
                  ? '✨ Средние'
                  : '🎲 От мелких до гигантских'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'mixed' as const, label: '🎲 Разные (от мелких до гигантских)', desc: 'Все калибры сразу' },
                { id: 'giant' as const, label: '💥 Очень крупные', desc: 'Мега-снаряды на весь экран' },
                { id: 'medium' as const, label: '✨ Средние', desc: 'Классический калибр' },
                { id: 'small' as const, label: '🎇 Мелкие', desc: 'Плотная россыпь искр' },
              ].map((scaleOpt) => {
                const isSelected = (state.fireworksScaleMode || 'mixed') === scaleOpt.id;
                return (
                  <button
                    type="button"
                    key={scaleOpt.id}
                    onClick={() => onChange({ fireworksScaleMode: scaleOpt.id })}
                    className={`py-1.5 px-2 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer text-left truncate flex flex-col justify-center ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-amber-500/30 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{scaleOpt.label}</span>
                    <span className="text-[9px] text-zinc-400 font-normal truncate">{scaleOpt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Fireworks Color Theme selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Цветовая гамма салютов:</span>
              <span className="text-amber-400 font-mono text-[10px]">
                {state.fireworksColorTheme === 'gold-glitter'
                  ? '✨ Золотой блеск'
                  : state.fireworksColorTheme === 'neon-cyber'
                  ? '⚡ Неоновый кибер'
                  : state.fireworksColorTheme === 'crimson-ruby'
                  ? '🔴 Рубиновый пламень'
                  : state.fireworksColorTheme === 'cyan-violet'
                  ? '🔷 Циан и Пурпур'
                  : state.fireworksColorTheme === 'emerald-lime'
                  ? '🟢 Изумрудный'
                  : '🌈 Праздничный мультиколор'}
              </span>
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'multicolor' as FireworksColorTheme, name: 'Мультиколор', gradient: 'linear-gradient(135deg, #f43f5e, #fbbf24, #38bdf8, #a855f7)' },
                { id: 'gold-glitter' as FireworksColorTheme, name: 'Золото', color: '#facc15' },
                { id: 'neon-cyber' as FireworksColorTheme, name: 'Кибернеон', gradient: 'linear-gradient(135deg, #ff007f, #00f0ff)' },
                { id: 'crimson-ruby' as FireworksColorTheme, name: 'Рубин', color: '#ef4444' },
                { id: 'cyan-violet' as FireworksColorTheme, name: 'Циан/Пурпур', gradient: 'linear-gradient(135deg, #06b6d4, #a855f7)' },
                { id: 'emerald-lime' as FireworksColorTheme, name: 'Изумруд', color: '#10b981' },
              ].map((theme) => {
                const isSelected = (state.fireworksColorTheme || 'multicolor') === theme.id;
                return (
                  <button
                    type="button"
                    key={theme.id}
                    onClick={() => onChange({ fireworksColorTheme: theme.id })}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/25 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/40 scale-[1.03]'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/30 shrink-0 shadow-xs"
                      style={theme.gradient ? { background: theme.gradient } : { backgroundColor: theme.color }}
                    />
                    <span>{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-mono">
            💡 35+ разновидностей салютов: хризантемы, ивы, камуро, сердце, сатурн, мандала, супернова, драконьи яйца, кометы, водопады и комбо-залпы от 1 до 30 штук одновременно.
          </p>
        </div>
      )}

      {/* Flags Procedural Generator Controls */}
      {(state.bgPresetId === 'ai-procedural-flags' || state.proceduralMood === 'flags' || state.bgPresetId === 'ai-procedural-clouds' || state.proceduralMood === 'clouds') && (
        <div className="bg-gradient-to-b from-blue-950/40 via-indigo-950/25 to-black/60 border border-blue-500/30 rounded-xl p-3.5 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                🚩 Флаги: Настройки флагов стран
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const modes: FlagsCompositionMode[] = ['single', 'duo', 'multi'];
                const scaleModes: FlagsScaleMode[] = ['mixed', 'small', 'medium', 'giant', 'mega-screen'];
                const motionList: FlagsMotionStyle[] = ['drift', 'vortex', 'burst', 'rain', 'zoom-3d', 'wave-banner'];
                const effectList: FlagsEffect[] = ['all-fx', 'cloth-wave', 'glow', 'flicker', 'dissolve', 'morph-transform'];
                const bgList: FlagsBgStyle[] = ['dark-space', 'stadium', 'flag-blur', 'neon-glow', 'cyber-grid', 'vertical-cloth', 'flags-morph'];

                const randomMode = modes[Math.floor(Math.random() * modes.length)];
                const randomScale = scaleModes[Math.floor(Math.random() * scaleModes.length)];
                const randomMotion = motionList[Math.floor(Math.random() * motionList.length)];
                const randomEffect = effectList[Math.floor(Math.random() * effectList.length)];
                const randomBg = bgList[Math.floor(Math.random() * bgList.length)];
                const randomCount = Math.floor(1 + Math.random() * 29); // 1 to 30

                const randomFlag1 = WORLD_FLAG_EMOJIS[Math.floor(Math.random() * WORLD_FLAG_EMOJIS.length)].flag;
                const randomFlag2 = WORLD_FLAG_EMOJIS[Math.floor(Math.random() * WORLD_FLAG_EMOJIS.length)].flag;
                const randomSeed = Math.floor(Math.random() * 1000000);
                const randomGrain = Math.random() > 0.5;

                onChange({
                  flagsMode: randomMode,
                  flagsScaleMode: randomScale,
                  flagsMotion: randomMotion,
                  flagsEffect: randomEffect,
                  flagsBgStyle: randomBg,
                  flagsGrain: randomGrain,
                  flagsCount: randomCount,
                  flagsPrimaryCountry: randomFlag1,
                  flagsSecondaryCountry: randomFlag2,
                  proceduralSeed: randomSeed,
                });
              }}
              className="text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-500/20 hover:bg-blue-500/30 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
              title="Рандомизировать флаги, состав, масштаб, спецэффекты и фон"
            >
              <Dices className="w-3.5 h-3.5" /> Микс флагов
            </button>
          </div>

          {/* 1. Mode Selector: single country, duo countries, multi world mix */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Состав и режим флагов:</span>
              <span className="text-blue-400 font-mono text-[10px]">
                {(state.flagsMode || 'single') === 'single'
                  ? '🚩 Одной страны (1-30 шт.)'
                  : state.flagsMode === 'duo'
                  ? '⚔️ Двух стран (дуэль / союз)'
                  : '🌍 Парад разных стран'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'single' as const, label: '🚩 Одной страны', desc: '1–30 флагов одного государства' },
                { id: 'duo' as const, label: '⚔️ Двух стран', desc: 'Дуэль или альянс 2 стран' },
                { id: 'multi' as const, label: '🌍 Микс стран', desc: 'Международный парад' },
              ].map((m) => {
                const isSelected = (state.flagsMode || 'single') === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => onChange({ flagsMode: m.id })}
                    className={`py-1.5 px-2 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer text-left flex flex-col justify-center ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/50'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{m.label}</span>
                    <span className="text-[9px] text-zinc-400 font-normal truncate">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Country Picker (for single or duo) */}
          {(state.flagsMode || 'single') !== 'multi' && (
            <div className="space-y-2 pt-0.5">
              {/* Primary country */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium">
                    {(state.flagsMode || 'single') === 'duo' ? 'Флаг первой страны:' : 'Выбранная страна:'}
                  </span>
                  <span className="text-blue-300 font-bold flex items-center gap-1">
                    <span className="text-base">{state.flagsPrimaryCountry || '🇷🇺'}</span>
                    <span>{WORLD_FLAG_EMOJIS.find(f => f.flag === (state.flagsPrimaryCountry || '🇷🇺'))?.name || 'Россия'}</span>
                  </span>
                </div>

                {/* Quick Popular Country Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { flag: '🇷🇺', name: 'РФ' },
                    { flag: '🇧🇾', name: 'Беларусь' },
                    { flag: '🇰🇿', name: 'Казахстан' },
                    { flag: '🇺🇸', name: 'США' },
                    { flag: '🇨🇳', name: 'Китай' },
                    { flag: '🇩🇪', name: 'Германия' },
                    { flag: '🇫🇷', name: 'Франция' },
                    { flag: '🇬🇧', name: 'Британия' },
                    { flag: '🇹🇷', name: 'Турция' },
                    { flag: '🇦🇪', name: 'ОАЭ' },
                    { flag: '🇦🇷', name: 'Аргентина' },
                    { flag: '🇧🇷', name: 'Бразилия' },
                    { flag: '🏁', name: 'Финиш' },
                    { flag: '🏴‍☠️', name: 'Пират' },
                    { flag: '🏳️‍🌈', name: 'Радуга' },
                  ].map((item) => {
                    const isSelected = (state.flagsPrimaryCountry || '🇷🇺') === item.flag;
                    return (
                      <button
                        type="button"
                        key={item.flag}
                        onClick={() => onChange({ flagsPrimaryCountry: item.flag })}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs'
                            : 'bg-black/30 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs">{item.flag}</span>
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* All Countries dropdown */}
                <select
                  value={state.flagsPrimaryCountry || '🇷🇺'}
                  onChange={(e) => onChange({ flagsPrimaryCountry: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-white cursor-pointer mt-1"
                >
                  {WORLD_FLAG_EMOJIS.map((item) => (
                    <option key={item.code} value={item.flag}>
                      {item.flag} {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary country when duo mode */}
              {state.flagsMode === 'duo' && (
                <div className="space-y-1 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-medium">Флаг второй страны:</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <span className="text-base">{state.flagsSecondaryCountry || '🇧🇾'}</span>
                      <span>{WORLD_FLAG_EMOJIS.find(f => f.flag === (state.flagsSecondaryCountry || '🇧🇾'))?.name || 'Беларусь'}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { flag: '🇧🇾', name: 'Беларусь' },
                      { flag: '🇷🇺', name: 'РФ' },
                      { flag: '🇰🇿', name: 'Казахстан' },
                      { flag: '🇨🇳', name: 'Китай' },
                      { flag: '🇺🇸', name: 'США' },
                      { flag: '🇩🇪', name: 'Германия' },
                      { flag: '🇦🇷', name: 'Аргентина' },
                      { flag: '🇧🇷', name: 'Бразилия' },
                      { flag: '🏁', name: 'Финиш' },
                    ].map((item) => {
                      const isSelected = (state.flagsSecondaryCountry || '🇧🇾') === item.flag;
                      return (
                        <button
                          type="button"
                          key={item.flag}
                          onClick={() => onChange({ flagsSecondaryCountry: item.flag })}
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-xs'
                              : 'bg-black/30 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs">{item.flag}</span>
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <select
                    value={state.flagsSecondaryCountry || '🇧🇾'}
                    onChange={(e) => onChange({ flagsSecondaryCountry: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-white cursor-pointer mt-1"
                  >
                    {WORLD_FLAG_EMOJIS.map((item) => (
                      <option key={item.code} value={item.flag}>
                        {item.flag} {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 3. Flags Count Slider (1 to 30) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Количество флагов одновременно:</span>
              <span className="text-blue-400 font-mono font-bold text-xs">
                {state.flagsCount ?? ((state.flagsMode || 'single') === 'single' ? 12 : 16)} {Number(state.flagsCount ?? 12) === 1 ? 'флаг' : Number(state.flagsCount ?? 12) >= 20 ? 'флагов (максимум!)' : 'флагов'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={state.flagsCount ?? ((state.flagsMode || 'single') === 'single' ? 12 : 16)}
              onChange={(e) => onChange({ flagsCount: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
            {/* Quick Count Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {[
                { count: 1, label: '1 (Один флаг)' },
                { count: 5, label: '5 (Звено)' },
                { count: 10, label: '10 (Группа)' },
                { count: 20, label: '20 (Эскадра)' },
                { count: 30, label: '30 (Салют флагов)' },
              ].map((chip) => {
                const currentCount = state.flagsCount ?? ((state.flagsMode || 'single') === 'single' ? 12 : 16);
                const isSelected = currentCount === chip.count;
                return (
                  <button
                    type="button"
                    key={chip.count}
                    onClick={() => onChange({ flagsCount: chip.count })}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs'
                        : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Scale Mode Selector (from micro to bigger than screen) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Масштаб и размер флагов:</span>
              <span className="text-blue-400 font-mono text-[10px]">
                {state.flagsScaleMode === 'mega-screen'
                  ? '🌌 Больше экрана'
                  : state.flagsScaleMode === 'giant'
                  ? '💥 Крупные'
                  : state.flagsScaleMode === 'small'
                  ? '🎇 Мелкие'
                  : state.flagsScaleMode === 'medium'
                  ? '✨ Средние'
                  : '🎲 От мелких до больше экрана'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'mixed' as const, label: '🎲 Разные (все калибры)', desc: 'От мелких до больше экрана' },
                { id: 'mega-screen' as const, label: '🌌 Больше экрана (Мега)', desc: 'Гигантские флаги на весь фон' },
                { id: 'giant' as const, label: '💥 Крупные (240–420px)', desc: 'Выразительные флаги' },
                { id: 'medium' as const, label: '✨ Средние (95–170px)', desc: 'Классический размер' },
                { id: 'small' as const, label: '🎇 Мелкие (38–80px)', desc: 'Плотный рой флагов' },
              ].map((scaleOpt) => {
                const isSelected = (state.flagsScaleMode || 'mixed') === scaleOpt.id;
                return (
                  <button
                    type="button"
                    key={scaleOpt.id}
                    onClick={() => onChange({ flagsScaleMode: scaleOpt.id })}
                    className={`py-1.5 px-2 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer text-left flex flex-col justify-center ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-sm ring-1 ring-blue-400/50'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{scaleOpt.label}</span>
                    <span className="text-[9px] text-zinc-400 font-normal truncate">{scaleOpt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Motion Trajectory Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Стиль движения и анимации:</span>
              <span className="text-blue-400 font-mono text-[10px]">
                {state.flagsMotion === 'vortex'
                  ? '🌪️ Вихрь и спираль'
                  : state.flagsMotion === 'burst'
                  ? '💥 Разлёт из центра'
                  : state.flagsMotion === 'rain'
                  ? '🌧️ Дождь флагов'
                  : state.flagsMotion === 'zoom-3d'
                  ? '🚀 3D налёт (Zoom)'
                  : state.flagsMotion === 'wave-banner'
                  ? '🏳️ Развевание знамён'
                  : '🍃 Парение и дрейф'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'drift' as const, label: '🍃 Парение и дрейф' },
                { id: 'vortex' as const, label: '🌪️ Вихрь и спираль' },
                { id: 'burst' as const, label: '💥 Разлёт из центра' },
                { id: 'rain' as const, label: '🌧️ Дождь флагов' },
                { id: 'zoom-3d' as const, label: '🚀 3D налёт (Zoom)' },
                { id: 'wave-banner' as const, label: '🏳️ Развевание знамён' },
              ].map((m) => {
                const isSelected = (state.flagsMotion || 'drift') === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => onChange({ flagsMotion: m.id })}
                    className={`py-1.5 px-2 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer text-left truncate ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs ring-1 ring-blue-400/40'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:border-blue-500/30 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Effects: Glow, Dissolve, Flicker, Cloth Wave, All */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Спецэффекты ткани и оптики:</span>
              <span className="text-blue-400 font-mono text-[10px]">
                {state.flagsEffect === 'cloth-wave'
                  ? '💨 Развевание ткани (ветер)'
                  : state.flagsEffect === 'glow'
                  ? '✨ Сияние и аура'
                  : state.flagsEffect === 'flicker'
                  ? '🎇 Мерцание и искры'
                  : state.flagsEffect === 'dissolve'
                  ? '🌫️ Плавное растворение'
                  : state.flagsEffect === 'morph-transform'
                  ? '🔄 Морфинг и смена флагов'
                  : '🌟 Все спецэффекты сразу'}
              </span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all-fx' as const, label: '🌟 Все эффекты' },
                { id: 'cloth-wave' as const, label: '💨 Развевание ткани' },
                { id: 'glow' as const, label: '✨ Сияние' },
                { id: 'flicker' as const, label: '🎇 Мерцание' },
                { id: 'dissolve' as const, label: '🌫️ Растворение' },
                { id: 'morph-transform' as const, label: '🔄 Морфинг' },
              ].map((eff) => {
                const isSelected = (state.flagsEffect || 'all-fx') === eff.id;
                return (
                  <button
                    type="button"
                    key={eff.id}
                    onClick={() => onChange({ flagsEffect: eff.id })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {eff.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Background Stage Style */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
              <span>Фон подложки:</span>
              <span className="text-blue-400 font-mono text-[10px]">
                {state.flagsBgStyle === 'vertical-cloth'
                  ? '📜 Вертикальный стяг с зерном'
                  : state.flagsBgStyle === 'flags-morph'
                  ? '🔄 Морфинг и растворение флагов'
                  : state.flagsBgStyle === 'stadium'
                  ? '🏟️ Стадион и прожекторы'
                  : state.flagsBgStyle === 'flag-blur'
                  ? '🚩 Размытый флаг на фоне'
                  : state.flagsBgStyle === 'neon-glow'
                  ? '⚡ Неоновое свечение'
                  : state.flagsBgStyle === 'cyber-grid'
                  ? '📐 Кибер-сетка'
                  : '🌌 Тёмный космос'}
              </span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'dark-space' as const, label: '🌌 Тёмный космос' },
                { id: 'vertical-cloth' as const, label: '📜 Стяг с зерном' },
                { id: 'flags-morph' as const, label: '🔄 Смена и растворение' },
                { id: 'stadium' as const, label: '🏟️ Стадион' },
                { id: 'flag-blur' as const, label: '🚩 Размытый флаг' },
                { id: 'neon-glow' as const, label: '⚡ Неон' },
                { id: 'cyber-grid' as const, label: '📐 Кибер-сетка' },
              ].map((bg) => {
                const isSelected = (state.flagsBgStyle || 'dark-space') === bg.id;
                return (
                  <button
                    type="button"
                    key={bg.id}
                    onClick={() => onChange({ flagsBgStyle: bg.id })}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-zinc-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {bg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grain texture toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
              <span>🌾 Кинозерно и текстура ткани:</span>
            </span>
            <button
              type="button"
              onClick={() => onChange({ flagsGrain: !state.flagsGrain })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                state.flagsGrain || state.flagsBgStyle === 'vertical-cloth'
                  ? 'bg-blue-500/30 border-blue-400 text-white shadow-xs'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{state.flagsGrain || state.flagsBgStyle === 'vertical-cloth' ? '✓ Включено' : 'Выключено'}</span>
            </button>
          </div>

          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-mono">
            💡 Летающие флаги стран мира от 1 до 30 штук одновременно. Поддерживаются соло-флаг, дуэль двух государств и мировой парад с развеванием ткани, сиянием и масштабом до больше экрана холста.
          </p>
        </div>
      )}

      {/* Custom Color Selector for Лист and Gradient Backgrounds */}
      {(state.bgPresetId === 'clean-white' || state.bgPresetId === 'notebook-grid' || BACKGROUND_PRESETS.find(p => p.id === state.bgPresetId)?.type === 'gradient') && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-white">
                {state.bgPresetId === 'clean-white' ? t('paperColor', 'Цвет листа:') : state.bgPresetId === 'notebook-grid' ? t('notebookGridColor', 'Цвет бумаги в клетку:') : t('bgColorTint', 'Цвет оттенка фона:')}
              </span>
            </div>
            {state.bgCustomColor && (
              <button
                type="button"
                onClick={() => onChange({ bgCustomColor: undefined })}
                className="text-[10px] text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                {t('reset', 'По умолчанию')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Белый', color: '#ffffff' },
              { label: 'Слоновая кость', color: '#fefce8' },
              { label: 'Бежевый', color: '#f5efe6' },
              { label: 'Мятный', color: '#ecfdf5' },
              { label: 'Розовый', color: '#fff1f2' },
              { label: 'Лаванда', color: '#f5f3ff' },
              { label: 'Небесный', color: '#f0f9ff' },
              { label: 'Лимонный', color: '#fef08a' },
              { label: 'Персик', color: '#ffedd5' },
              { label: 'Тёмный', color: '#18181b' },
            ].map((swatch) => {
              const isActive = (state.bgCustomColor || '#ffffff').toLowerCase() === swatch.color.toLowerCase();
              return (
                <button
                  type="button"
                  key={swatch.color}
                  onClick={() => onChange({ bgCustomColor: swatch.color })}
                  className={`w-6 h-6 rounded-full border transition-all cursor-pointer relative shadow-sm ${
                    isActive
                      ? 'border-purple-500 ring-2 ring-purple-500/50 scale-110'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={t('swatch_' + swatch.color, swatch.label)}
                />
              );
            })}

            {/* Custom Color Mixer Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsColorPickerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-white/15 cursor-pointer text-[11px] text-zinc-200 hover:text-white transition-all shadow-sm active:scale-95 shrink-0"
              title={t('colorPicker', 'Открыть микшер цвета')}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner shrink-0"
                style={{ backgroundColor: state.bgCustomColor || '#ffffff' }}
              />
              <span className="font-mono text-[10px] uppercase font-semibold">
                {state.bgCustomColor || '#ffffff'}
              </span>
              <Palette className="w-3 h-3 text-purple-400 shrink-0" />
            </button>
          </div>

          <ColorPickerModal
            isOpen={isColorPickerOpen}
            onClose={() => setIsColorPickerOpen(false)}
            color={state.bgCustomColor || '#ffffff'}
            onChange={(newColor) => onChange({ bgCustomColor: newColor })}
            title={t('colorMixerTitle', 'Микшер цвета фона')}
          />
        </div>
      )}

      {/* Background Dimming Slider */}
      <div className="pt-2.5 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Sliders className="w-3.5 h-3.5 text-purple-400" /> {t('backgroundDimming', 'Затемнение фона')}
          </span>
        </div>
        <div className="flex items-center gap-3 px-1 py-0.5">
          <div className="flex-1 px-1 sm:px-2">
            <input
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={state.bgOverlayOpacity}
              onChange={(e) =>
                onChange({ bgOverlayOpacity: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-500 bg-zinc-800 h-2.5 rounded-lg cursor-pointer touch-pan-x"
            />
          </div>
          <span className="w-12 text-center py-1 px-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono font-bold text-purple-300 shrink-0 select-none">
            {Math.round(state.bgOverlayOpacity * 100)}%
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 px-1">
          {t('bgDimmingDesc', 'Затемните фон, чтобы белые буквы контрастно читались поверх видео')}
        </p>
      </div>
    </div>
  );
};
