import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { audioMixer } from '../utils/audioMixer';
import { useLanguage } from '../context/LanguageContext';

interface LuckyModeTourProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVariation: any;
  onSelectVariation: (v: any) => void;
  onCloseVariation: () => void;
  variations: any[];
  onStepChange?: (stepIdx: number) => void;
}

interface StepConfig {
  step: number;
  targetSelector: string | null;
  text: string;
  secondaryText?: string;
  view?: 'grid' | 'fullscreen';
  isQuestion?: boolean;
  isFinal?: boolean;
}

const TOUR_STEPS: StepConfig[] = [
  {
    step: 0,
    targetSelector: null,
    text: 'Хочешь понять меня\nза 30 секунд?',
    isQuestion: true,
  },
  {
    step: 1,
    targetSelector: '[data-tour="lucky-btn-text"]',
    text: 'Сюда напиши\nсвой текст!',
    view: 'grid',
  },
  {
    step: 2,
    targetSelector: '[data-tour="lucky-btn-upload"]',
    text: 'Сюда добавь свое\nфото, видео или аудио!',
    view: 'grid',
  },
  {
    step: 3,
    targetSelector: '[data-tour="lucky-btn-mix"]',
    text: 'Жми, чтобы создать\nбесконечное число вариантов!',
    secondaryText: 'Жми долго, если загрузил\nфото/видео и любишь сюрпризы!',
    view: 'grid',
  },
  {
    step: 4,
    targetSelector: '[data-tour="lucky-card-0"]',
    text: 'Кликни на\nпонравившийся!',
    view: 'grid',
  },
  {
    step: 5,
    targetSelector: '[data-tour="fullscreen-btn-text"]',
    text: 'Измени свой текст!',
    view: 'fullscreen',
  },
  {
    step: 6,
    targetSelector: '[data-tour="fullscreen-btn-rocket"]',
    text: 'Отправь вариант на глубокое редактирование если ты уже эксперт',
    view: 'fullscreen',
  },
  {
    step: 7,
    targetSelector: '[data-tour="fullscreen-btn-record"]',
    text: 'Сделай запись видео!',
    view: 'fullscreen',
  },
  {
    step: 8,
    targetSelector: '[data-tour="fullscreen-btn-music"]',
    text: 'Сгенерируй музыку быстрым нажатием\nили отрегулируй громкость долгим!',
    view: 'fullscreen',
  },
  {
    step: 9,
    targetSelector: '[data-tour="aspect-ratio"]',
    text: 'Выбери ориентацию видео:\n9:16, 16:9 или 1:1!',
    view: 'fullscreen',
  },
  {
    step: 10,
    targetSelector: '[data-tour="fullscreen-btn-back"]',
    text: 'Вернись в\nMix - генератор!',
    view: 'fullscreen',
  },
  {
    step: 11,
    targetSelector: null,
    text: 'Двигай пальцем\nтекст по полю!',
    view: 'fullscreen',
  },
  {
    step: 12,
    targetSelector: '[data-tour="text-properties-panel"]',
    text: 'Долго жми пальцем по полю\nдля вызова панели настройки текста!',
    view: 'fullscreen',
  },
  {
    step: 13,
    targetSelector: null,
    text: 'Всё!',
    isFinal: true,
  },
];

export const LuckyModeTour: React.FC<LuckyModeTourProps> = ({
  isOpen,
  onClose,
  selectedVariation,
  onSelectVariation,
  onCloseVariation,
  variations,
  onStepChange,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [showNoOptions, setShowNoOptions] = useState<boolean>(false);
  const [neverShowChecked, setNeverShowChecked] = useState<boolean>(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const circleRef = useRef<HTMLDivElement>(null);
  const [circleCenter, setCircleCenter] = useState<{ x: number; y: number } | null>(null);

  const currentStep = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];

  // Stable notify parent of step change
  const onStepChangeRef = useRef(onStepChange);
  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    if (onStepChangeRef.current) {
      onStepChangeRef.current(isOpen ? currentStepIdx : -1);
    }
  }, [isOpen, currentStepIdx]);

  // Stable variation switching refs
  const onCloseVariationRef = useRef(onCloseVariation);
  const onSelectVariationRef = useRef(onSelectVariation);
  useEffect(() => {
    onCloseVariationRef.current = onCloseVariation;
    onSelectVariationRef.current = onSelectVariation;
  });

  // Reset step on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIdx(0);
      setShowNoOptions(false);
      setNeverShowChecked(false);
      setActiveCardIdx(0);
    }
  }, [isOpen]);

  const { t } = useLanguage();

  // Step 3 (or steps with secondaryText): Smoothly cycle between primary and secondary message
  const [subTextIdx, setSubTextIdx] = useState<number>(0);
  const [isSubTextFading, setIsSubTextFading] = useState<boolean>(false);
  const rawText =
    subTextIdx === 1 && currentStep.secondaryText
      ? currentStep.secondaryText
      : currentStep.text;
  const translationKey = `luckyTourStep_${currentStepIdx}${subTextIdx === 1 && currentStep.secondaryText ? '_sub' : ''}`;
  const displayedText = t(translationKey, rawText);

  useEffect(() => {
    setSubTextIdx(0);
    setIsSubTextFading(false);
    if (!isOpen || !currentStep.secondaryText) return;

    let timer: number;
    let isMounted = true;

    const scheduleNext = (currentIdx: number) => {
      // First text: 2.9s; second text: 3.6s
      const delay = currentIdx === 0 ? 2900 : 3600;
      timer = window.setTimeout(() => {
        if (!isMounted) return;
        setIsSubTextFading(true);
        timer = window.setTimeout(() => {
          if (!isMounted) return;
          const nextIdx = currentIdx === 0 ? 1 : 0;
          setSubTextIdx(nextIdx);
          setIsSubTextFading(false);
          scheduleNext(nextIdx);
        }, 180);
      }, delay);
    };

    scheduleNext(0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, currentStepIdx, currentStep.secondaryText]);

  // Step 4: Cycle through all 4 cards (0, 1, 2, 3) every 500ms
  useEffect(() => {
    if (!isOpen || currentStepIdx !== 4) return;
    setActiveCardIdx(0);
    const interval = setInterval(() => {
      setActiveCardIdx((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen, currentStepIdx]);

  // Step 5 onwards: Play quiet background music at 10% volume
  useEffect(() => {
    if (isOpen && currentStepIdx >= 5) {
      audioMixer.setVolumeMultiplier(0.10);
      const activeState = selectedVariation || (variations && variations[0]) || null;
      if (activeState) {
        const audioState = activeState.audio || activeState.state?.audio || {
          enabled: true,
          sourceType: 'generator',
          presetId: 'ambient-chill',
          volume: 0.10,
        };
        const duration = activeState.duration || activeState.state?.duration || 15;
        audioMixer.play({ ...audioState, enabled: true, volume: 0.10 }, duration, 0);
      }
    } else if (isOpen && currentStepIdx < 5) {
      audioMixer.setVolumeMultiplier(1.0);
      audioMixer.stop();
    }
  }, [isOpen, currentStepIdx, selectedVariation, variations]);

  // View switching when step changes
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep.view === 'grid') {
      if (selectedVariation) {
        onCloseVariationRef.current();
      }
    } else if (currentStep.view === 'fullscreen') {
      if (!selectedVariation && variations && variations.length > 0) {
        onSelectVariationRef.current(variations[3] || variations[0]);
      }
    }
  }, [currentStepIdx, isOpen, currentStep.view, selectedVariation, variations]);

  // Recalculate positions on step/resize/scroll
  const updatePositions = useCallback(() => {
    if (!isOpen) return;

    // Update Circle center position
    if (circleRef.current) {
      const rect = circleRef.current.getBoundingClientRect();
      setCircleCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // Determine target selector (support cycling step 4)
    let selector = currentStep.targetSelector;
    if (currentStepIdx === 4) {
      selector = `[data-tour="lucky-card-${activeCardIdx}"]`;
    }

    if (selector) {
      const targetEl = document.querySelector(selector);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStepIdx, currentStep.targetSelector, activeCardIdx]);

  useEffect(() => {
    if (!isOpen) return;

    updatePositions();
    const timer = setTimeout(updatePositions, 100);
    const interval = setInterval(updatePositions, 300);

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [isOpen, currentStepIdx, activeCardIdx, updatePositions]);

  if (!isOpen) return null;

  const handleYes = () => {
    setCurrentStepIdx(1);
  };

  const handleNo = () => {
    setShowNoOptions(true);
  };

  const handleNeverShowClose = () => {
    audioMixer.setVolumeMultiplier(1.0);
    audioMixer.stop();
    try {
      localStorage.setItem('lucky_mode_help_never_show', 'true');
    } catch {}
    onCloseVariation();
    onClose();
  };

  const handleJustClose = () => {
    audioMixer.setVolumeMultiplier(1.0);
    audioMixer.stop();
    onCloseVariation();
    onClose();
  };

  const handleNextStep = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 1) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    audioMixer.setVolumeMultiplier(1.0);
    audioMixer.stop();
    if (neverShowChecked) {
      try {
        localStorage.setItem('lucky_mode_help_never_show', 'true');
      } catch {}
    }
    // "После нажатия Все! Должна открываться страничка квартета."
    onCloseVariation();
    onClose();
  };

  // Calculate dotted path coordinates using clean small round dots
  const renderDottedPath = () => {
    if (!circleCenter || !targetRect) return null;

    const x1 = circleCenter.x;
    const y1 = circleCenter.y;
    const x2 = targetRect.left + targetRect.width / 2;
    const y2 = targetRect.top + targetRect.height / 2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);

    // Generate small dotted circles evenly spaced along line
    const stepSpacing = 16;
    const numDots = Math.max(3, Math.floor(distance / stepSpacing));
    const dots = [];

    for (let i = 1; i <= numDots; i++) {
      const t = i / (numDots + 1);
      const cx = x1 + dx * t;
      const cy = y1 + dy * t;

      dots.push(
        <g key={i}>
          {/* Outer cyan glow circle dot */}
          <circle
            cx={cx}
            cy={cy}
            r={3.5}
            fill="#06b6d4"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.9))',
            }}
          />
          {/* Inner white bright center dot */}
          <circle cx={cx} cy={cy} r={2} fill="#ffffff" />
        </g>
      );
    }

    return (
      <g>
        {dots}
        {/* Target Pulsing Destination Marker */}
        <circle
          cx={x2}
          cy={y2}
          r="16"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.5"
          className="animate-ping"
        />
        <circle
          cx={x2}
          cy={y2}
          r="6"
          fill="#22d3ee"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,1))' }}
        />
      </g>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483640] pointer-events-auto bg-black/35 flex items-center justify-center p-4 overflow-hidden select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* SVG Connecting Dotted Circle Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        {renderDottedPath()}
      </svg>

      {/* Target Element Highlight Aura Ring */}
      {targetRect && (
        <div
          style={{
            left: targetRect.left - 6,
            top: targetRect.top - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: Math.abs(targetRect.width - targetRect.height) < 10 ? '9999px' : '20px',
          }}
          className="fixed z-20 border-2 sm:border-3 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.8),inset_0_0_15px_rgba(6,182,212,0.3)] pointer-events-none animate-pulse"
        />
      )}

      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={handleJustClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/20 backdrop-blur-2xl transition-all cursor-pointer active:scale-95 shadow-2xl"
        title="Закрыть"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Central Glassmorphic Circle - Slightly smaller, non-bold larger font */}
      <div
        ref={circleRef}
        className="relative z-30 w-[270px] h-[270px] sm:w-[335px] sm:h-[335px] rounded-full bg-black/75 backdrop-blur-2xl border border-white/20 text-white shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-90 duration-300 pointer-events-auto"
      >
        {/* Step 0: Question Screen */}
        {currentStep.isQuestion && !showNoOptions && (
          <div className="flex flex-col items-center justify-center h-full gap-4 sm:gap-5">
            <h3 className="text-white font-medium text-xl sm:text-2xl leading-snug text-center drop-shadow-[0_2px_12px_rgba(0,0,0,1)] px-2 tracking-tight whitespace-pre-line">
              {currentStep.text}
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleYes}
                className="px-6 sm:px-8 py-2.5 rounded-full bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/40 backdrop-blur-xl font-semibold text-sm sm:text-base shadow-xl shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Да
              </button>
              <button
                type="button"
                onClick={handleNo}
                className="px-5 sm:px-6 py-2.5 rounded-full bg-black/40 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm border border-white/20 backdrop-blur-xl active:scale-95 transition-all cursor-pointer"
              >
                Нет
              </button>
            </div>
          </div>
        )}

        {/* Step 0: "Нет" Clicked Options */}
        {currentStep.isQuestion && showNoOptions && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <span className="text-white font-medium text-lg sm:text-xl text-center drop-shadow-md">
              Больше не показывать?
            </span>

            <div className="flex flex-col gap-2.5 w-full px-2">
              <button
                type="button"
                onClick={handleNeverShowClose}
                className="w-full py-2.5 px-4 rounded-full bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40 backdrop-blur-xl font-semibold text-xs sm:text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Не показывать больше
              </button>
              <button
                type="button"
                onClick={handleJustClose}
                className="w-full py-2 px-4 rounded-full bg-black/40 hover:bg-white/10 text-zinc-300 font-medium text-xs border border-white/20 backdrop-blur-xl active:scale-95 transition-all cursor-pointer"
              >
                Просто закрыть
              </button>
            </div>
          </div>
        )}

        {/* Steps 1 - 11: Interactive Tour Steps */}
        {!currentStep.isQuestion && !currentStep.isFinal && (
          <div className="flex flex-col items-center justify-between h-full py-2">
            {/* Step Counter Indicator */}
            <span className="text-[10px] sm:text-xs font-semibold text-cyan-300 bg-black/50 backdrop-blur-xl border border-white/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Шаг {currentStepIdx} из {TOUR_STEPS.length - 2}
            </span>

            {/* Instruction Text - Larger, Non-Bold, Multi-line pre-line with smooth transition */}
            <div className="my-auto flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] w-full px-1.5">
              <h3
                className={`text-white font-medium text-lg sm:text-2xl leading-snug sm:leading-tight text-center drop-shadow-[0_2px_12px_rgba(0,0,0,1)] tracking-tight whitespace-pre-line transition-all duration-200 ${
                  isSubTextFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {displayedText}
              </h3>

              {/* Sub-text pagination indicators (for 2nd display) */}
              {currentStep.secondaryText && (
                <div className="flex items-center gap-2 mt-2 sm:mt-2.5">
                  <button
                    type="button"
                    onClick={() => setSubTextIdx(0)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      subTextIdx === 0
                        ? 'w-5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    title="1-й показ: Жми..."
                  />
                  <button
                    type="button"
                    onClick={() => setSubTextIdx(1)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      subTextIdx === 1
                        ? 'w-5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                        : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    title="2-й показ: Жми долго..."
                  />
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2.5 mt-auto">
              {currentStepIdx > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/20 backdrop-blur-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  title="Назад"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 sm:py-2.5 rounded-full bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 border border-cyan-400/50 font-semibold text-xs sm:text-sm backdrop-blur-xl shadow-xl shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Step 12: Final Completion Screen */}
        {currentStep.isFinal && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-semibold text-xl shadow-xl">
              ✓
            </div>

            <h3 className="text-white font-medium text-2xl sm:text-3xl text-center drop-shadow-md">
              {currentStep.text}
            </h3>

            <label className="flex items-center gap-2 text-xs sm:text-sm text-zinc-200 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={neverShowChecked}
                onChange={(e) => setNeverShowChecked(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span>Больше не показывать</span>
            </label>

            <button
              type="button"
              onClick={handleFinish}
              className="px-7 py-2.5 rounded-full bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-100 font-semibold text-sm sm:text-base border border-cyan-400/50 backdrop-blur-xl shadow-2xl active:scale-95 transition-all cursor-pointer"
            >
              Понятно!
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
