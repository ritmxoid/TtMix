import React, { useEffect, useRef } from 'react';
import { Sliders, Sparkles, Wand2 } from 'lucide-react';
import { getDimensionsForAspect, particleEngine, renderCanvasFrame } from '../utils/canvasRenderer';
import { VideoProjectState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StartLandingProps {
  onSelectExpert: () => void;
  onSelectLucky: () => void;
}

const LANDING_BG_STATE: VideoProjectState = {
  bgType: 'preset',
  bgMediaUrl: null,
  bgMediaType: null,
  bgPresetId: 'ai-procedural-cosmic',
  proceduralMood: 'cosmic',
  proceduralSeed: 1337,
  bgOverlayOpacity: 0.15,
  audio: {
    enabled: false,
    sourceType: 'none',
    audioUrl: null,
    audioFileName: null,
    presetId: 'lofi-chill',
    volume: 0,
    loop: true,
    audioDuration: 0,
  },
  rawText: '',
  authorText: '',
  textMode: 'sentence',
  fontFamily: "'Amatic SC', cursive",
  fontSize: 128,
  textColor: '#ffffff',
  strokeEnabled: false,
  strokeColor: '#000000',
  strokeWidth: 6,
  textAlign: 'center',
  textPosition: 'center',
  textPositionY: 50,
  textPositionX: 50,
  isUppercase: false,
  animationStyle: 'typewriter',
  effects: {
    glow: true,
    sparkle: false,
    fire: false,
    neon: false,
    shadow: true,
    particles: true,
  },
  neonColor: '#a855f7',
  speedMultiplier: 1.0,
  pauseBetweenSeconds: 0.8,
  aspectRatio: '9:16',
};

export const StartLanding: React.FC<StartLandingProps> = ({
  onSelectExpert,
  onSelectLucky,
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animFrameId: number;
    let startTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          const now = performance.now();
          const currentTime = (now - startTime) / 1000;
          const dims = { width: canvas.width, height: canvas.height };

          renderCanvasFrame({
            ctx,
            dimensions: dims,
            state: LANDING_BG_STATE,
            bgMediaElement: null,
            currentTime,
            targetDuration: 10,
          });
        }
      }
      animFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Background Animated Canvas */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
      />

      {/* Main Glass Center Card - 100% Transparent to show all stars and comets */}
      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center p-6 sm:p-10 rounded-3xl bg-transparent border border-white/20 shadow-2xl shadow-purple-950/20 transition-all">
        {/* Glowing App Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs font-semibold tracking-wider uppercase mb-5 shadow-lg shadow-purple-500/10 animate-pulse">
          <Wand2 className="w-3.5 h-3.5 text-purple-300" />
          <span>TtMix v1.1 • {t('appTaglineBadge', 'Аниматор Текста')}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300 tracking-tight leading-none mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          TtMix
        </h1>

        <p className="text-sm sm:text-base text-zinc-100 font-medium max-w-md mb-8 sm:mb-10 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {t('startModeSubtitle', 'Создавайте стильные анимированные ролики с цитатами за считанные секунды')}
        </p>

        {/* Matrix Pill Buttons (Horizontal Layout - Transparent Glass) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Red Pill: EXPERT */}
          <button
            type="button"
            onClick={onSelectExpert}
            className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-rose-950/20 hover:bg-rose-900/35 border-2 border-rose-500/50 hover:border-rose-400 text-rose-100 shadow-xl shadow-rose-950/30 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="text-lg font-extrabold uppercase tracking-wide text-white group-hover:text-rose-200 drop-shadow">
              {t('expertModeBtn', 'ЭКСПЕРТ')}
            </span>
            <span className="text-[11px] text-rose-200/90 mt-1 font-medium leading-tight drop-shadow">
              {t('expertModeSub', 'Полный редактор со всеми возможностями')}
            </span>
            <div className="absolute -inset-0.5 rounded-2xl bg-rose-500/10 opacity-0 group-hover:opacity-100 blur transition-opacity pointer-events-none" />
          </button>

          {/* Blue Pill: I'M FEELING LUCKY */}
          <button
            type="button"
            onClick={onSelectLucky}
            className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-sky-950/25 hover:bg-sky-900/40 border-2 border-sky-400/60 hover:border-sky-300 text-sky-100 shadow-xl shadow-sky-950/40 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-inner">
              <Sparkles className="w-6 h-6 text-sky-300 animate-spin-slow" />
            </div>
            <span className="text-lg font-extrabold uppercase tracking-wide text-white group-hover:text-sky-200 drop-shadow">
              {t('luckyModeBtn', 'МНЕ ПОВЕЗЁТ!')}
            </span>
            <span className="text-[11px] text-sky-200/90 mt-1 font-medium leading-tight drop-shadow">
              {t('luckyModeSub', 'Генерация 4 стилей в 1 клик ✨')}
            </span>
            <div className="absolute -inset-0.5 rounded-2xl bg-sky-500/15 opacity-0 group-hover:opacity-100 blur transition-opacity pointer-events-none" />
          </button>
        </div>
      </div>
    </div>
  );
};
