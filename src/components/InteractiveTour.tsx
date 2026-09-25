import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Video,
  Pin,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioMixer } from '../utils/audioMixer';

export const TOUR_STORAGE_KEY = 'ttmix_tour_dismissed_v1';

export interface TourStep {
  id: string;
  selector: string;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiresWorkspace?: boolean;
  requiresFullscreen?: boolean;
}

interface InteractiveTourProps {
  isFullscreenOpen: boolean;
  onOpenFullscreen: () => void;
  onCloseFullscreen: () => void;
  forceOpenTour?: boolean;
  onCloseForceOpen?: () => void;
  onSetTourAudio?: () => void;
  isPinned?: boolean;
  onSetPinned?: (pinned: boolean) => void;
  currentVolume?: number;
  onTourActiveChange?: (active: boolean) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isFullscreenOpen,
  onOpenFullscreen,
  onCloseFullscreen,
  forceOpenTour = false,
  onCloseForceOpen,
  onSetTourAudio,
  isPinned,
  onSetPinned,
  currentVolume = 0.7,
  onTourActiveChange,
}) => {
  const { t } = useLanguage();

  // Welcome modal state (shown on initial load if not previously dismissed)
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // When tour or welcome modal is active, duck music to 10% quiet background volume, and restore full user volume (100%) when tour closes
  useEffect(() => {
    const isShowingHelp = isTourActive || isWelcomeOpen;
    if (onTourActiveChange) {
      onTourActiveChange(isShowingHelp);
    }
    if (isShowingHelp) {
      try {
        audioMixer.setVolumeMultiplier(0.10);
      } catch {}
    } else {
      try {
        audioMixer.setVolumeMultiplier(1.0);
      } catch {}
    }
    return () => {
      try {
        audioMixer.setVolumeMultiplier(1.0);
      } catch {}
    };
  }, [isTourActive, isWelcomeOpen, onTourActiveChange]);

  // 16 Structured Sequential Steps matching user's exact requirements
  const STEPS: TourStep[] = [
    // 1. Pin / Mode Switch (highlights pin button on right side menu)
    {
      id: 'pin-btn',
      selector: '[data-tour="pin-btn"]',
      titleKey: 'tourStep1_title',
      defaultTitle: 'Кнопка «Булавка» (Закрепить)',
      descKey: 'tourStep1_desc',
      defaultDesc:
        'Кнопка «Булавка» — главный переключатель режима: нижняя кнопка в боковом меню превью закрепляет плеер на весь экран или возвращает в обычный вид рабочей области.',
      placement: 'left',
    },
    // 2. Aspect Ratio Switcher (top center)
    {
      id: 'aspect-ratio',
      selector: '[data-tour="aspect-ratio"]',
      titleKey: 'tourStep2_title',
      defaultTitle: 'Формат видео 9:16 / 16:9 / 1:1',
      descKey: 'tourStep2_desc',
      defaultDesc:
        'Мгновенно переключайте пропорции: вертикальный 9:16 для Reels, TikTok и Shorts, классический 16:9 для YouTube или квадрат 1:1 для постов.',
      placement: 'bottom',
    },
    // 3. Clean Screen Mode & Tap Gesture (highlights the Eye button in top right corner)
    {
      id: 'clean-screen',
      selector: '[data-tour="clean-screen"]',
      titleKey: 'tourStep3_title',
      defaultTitle: 'Режим «Чистый экран»',
      descKey: 'tourStep3_desc',
      defaultDesc:
        'Кнопка «Глаз» скрывает все кнопки и панели для чистого просмотра. Короткое касание экрана (клик или тап в любую точку) делает то же самое — мгновенно скрывает или возвращает элементы управления!',
      placement: 'bottom',
    },
    // 4. Interactive Canvas Text & Gestures (center canvas)
    {
      id: 'canvas-stage',
      selector: '[data-tour="canvas-stage"]',
      titleKey: 'tourStep4_title',
      defaultTitle: 'Интерактивный текст на холсте',
      descKey: 'tourStep4_desc',
      defaultDesc:
        'Перетаскивайте текст пальцем или мышью в любую область экрана! Нажмите на текст или зажмите его, чтобы открыть быстрое меню настройки шрифта, размера и цвета.',
      placement: 'center',
    },
    // 5. Playback Controls (Play, From Start, Volume in ONE tab) - placed ABOVE dock
    {
      id: 'playback-controls',
      selector: '[data-tour="playback-controls"]',
      titleKey: 'tourStep5_title',
      defaultTitle: 'Воспроизведение, «С начала» и звук',
      descKey: 'tourStep5_desc',
      defaultDesc:
        'Управляйте просмотром в одной панели: пауза/старт, кнопка перезапуска ролика с самого начала (|◀) и включение/выключение звука (долгий тап для громкости).',
      placement: 'top',
    },
    // 6. Workspace: Animated Procedural Backgrounds Section (Themes: Космос, Неон, Огонь...)
    {
      id: 'bg-presets-area',
      selector: '[data-tour="bg-presets-area"]',
      titleKey: 'tourStep6_title',
      defaultTitle: 'Анимированные процедурные фоны',
      descKey: 'tourStep6_desc',
      defaultDesc:
        'Создавайте уникальные анимированные фоны — Космос, Неон, Огонь, Частицы, Пергамент — или настраивайте свой цвет и градиент.',
      placement: 'top',
    },
    // 7. Workspace: Quick Generator Buttons in dock
    {
      id: 'generator-buttons',
      selector: '[data-tour="generator-buttons"]',
      titleKey: 'tourStep7_title',
      defaultTitle: 'Кнопки быстрой генерации',
      descKey: 'tourStep7_desc',
      defaultDesc:
        'Кнопки для генерации (и перегенерации на лету) уникальных фонов, музыки и анимированного текста в один клик.',
      placement: 'top',
    },
    // 8. Workspace: Reset Project to Default Settings (header)
    {
      id: 'reset-btn',
      selector: '[data-tour="reset-btn"]',
      titleKey: 'tourStep8_title',
      defaultTitle: 'Сброс до стартового состояния',
      descKey: 'tourStep8_desc',
      defaultDesc:
        'Кнопка сброса проекта возвращает все настройки и текст к исходному базовому состоянию в один клик.',
      placement: 'bottom',
    },
    // 9. Workspace: Upload Media (header)
    {
      id: 'upload-btn',
      selector: '[data-tour="upload-btn"]',
      titleKey: 'tourStep9_title',
      defaultTitle: 'Загрузка своего видео и фото',
      descKey: 'tourStep9_desc',
      defaultDesc:
        'Загружайте собственные видеоклипы, фотографии или аудиозаписи для наложения анимированного текста.',
      placement: 'bottom',
    },
    // 10. Workspace: Help & Language Switcher in ONE tab (header right)
    {
      id: 'header-help-lang',
      selector: '[data-tour="header-help-lang"]',
      titleKey: 'tourStep10_title',
      defaultTitle: 'Языки и вызов справки',
      descKey: 'tourStep10_desc',
      defaultDesc:
        'Переключайте язык интерфейса (RU, EN, ES, DE, ZH, JA) и повторно открывайте этот обучающий тур в любой момент.',
      placement: 'bottom',
    },
    // 11. Workspace: Right Side Tools Menu Button (справого бока первая сверху)
    {
      id: 'right-tools-menu-btn',
      selector: '[data-tour="right-tools-menu-btn"]',
      titleKey: 'tourStep11_title',
      defaultTitle: 'Кнопка «Меню инструментов»',
      descKey: 'tourStep11_desc',
      defaultDesc:
        'Верхняя кнопка в правой панели превью: открывает быстрое меню для моментального перехода к любому из 8 разделов настройки.',
      placement: 'left',
    },
    // 12. Workspace: Templates Catalog
    {
      id: 'catalog-feature',
      selector: '[data-tour="catalog-feature"]',
      titleKey: 'tourStep12_title',
      defaultTitle: 'Каталог готовых шаблонов',
      descKey: 'tourStep12_desc',
      defaultDesc:
        'Вы можете выбрать любой готовый шаблон из каталога и свободно использовать его в проекте, легко редактируя текст, фон, шрифты и анимацию под ваши идеи!',
      placement: 'top',
    },
    // 13. Fullscreen Recording Studio: FixTxt & FixVid Duration Sync
    {
      id: 'timing-dock',
      selector: '[data-tour="fixtxt-btn"], [data-tour="timing-dock"]',
      titleKey: 'tourStep13_title',
      defaultTitle: 'Синхронизация длительности (ФиксТхт / ФиксВид)',
      descKey: 'tourStep13_desc',
      defaultDesc:
        'В окне записи видео кнопка «ФиксТхт» автоматически рассчитывает время под естественное чтение вашего текста, а «ФиксВид» синхронизирует хронометраж ролика с длиной видеофайла.',
      placement: 'top',
      requiresFullscreen: true,
    },
    // 14. Fullscreen Recording Studio: Record & Capture WebM
    {
      id: 'record-btn',
      selector: '[data-tour="record-btn"]',
      titleKey: 'tourStep14_title',
      defaultTitle: 'Запись и захват видео WebM / MP4',
      descKey: 'tourStep14_desc',
      defaultDesc:
        'Записывайте анимированный ролик со звуком прямо в браузере в 1 клик! Готовый файл сразу доступен для скачивания на телефон или компьютер.',
      placement: 'top',
      requiresFullscreen: true,
    },
    // 15. Workspace: Save & Load Presets in ONE tab
    {
      id: 'presets-feature',
      selector: '[data-tour="presets-feature"]',
      titleKey: 'tourStep15_title',
      defaultTitle: 'Сохранение и загрузка пресетов',
      descKey: 'tourStep15_desc',
      defaultDesc:
        'Сохраняйте удачные комбинации анимации, шрифтов и фона в файлы шаблонов (.json) и легко загружайте сохраненные пресеты обратно в проект в любое время.',
      placement: 'left',
    },
    // 16. Final: Ready to create
    {
      id: 'tour-finish',
      selector: '',
      titleKey: 'tourStep16_title',
      defaultTitle: 'Всё готово к творчеству! 🚀',
      descKey: 'tourStep16_desc',
      defaultDesc:
        'Теперь вы знаете все секреты и возможности TtMix! Создавайте эффектные вирусные видео с динамичным текстом за считанные секунды прямо сейчас.',
      placement: 'center',
    },
  ];

  const stepIndexRef = useRef<number>(currentStepIndex);
  stepIndexRef.current = currentStepIndex;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const settleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // If user requests to open tour manually via Help button
  useEffect(() => {
    if (forceOpenTour) {
      setIsWelcomeOpen(true);
      setIsTourActive(false);
      setCurrentStepIndex(0);
    }
  }, [forceOpenTour]);

  // Synchronized, race-condition-free target rect measurement and smooth scroll
  useEffect(() => {
    if (!isTourActive) {
      setTargetRect(null);
      return;
    }

    const targetIndex = currentStepIndex;
    const step = STEPS[targetIndex];
    if (!step || !step.selector) {
      setTargetRect(null);
      return;
    }

    // Cancel any previous pending timers immediately
    if (timerRef.current) clearTimeout(timerRef.current);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

    const measureAndScroll = (retryCount = 0) => {
      if (stepIndexRef.current !== targetIndex) return;

      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        }

        // Auto-scroll into view smoothly if needed
        if (step.id === 'bg-presets-area') {
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = currentScroll + rect.bottom - window.innerHeight + 16;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        } else if (
          step.id === 'pin-btn' ||
          step.id === 'aspect-ratio' ||
          step.id === 'clean-screen' ||
          step.id === 'canvas-stage' ||
          step.id === 'playback-controls'
        ) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (
          rect.top < 50 ||
          rect.bottom > window.innerHeight - 30 ||
          rect.left < 10 ||
          rect.right > window.innerWidth - 10
        ) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Re-measure ONCE after smooth scroll settles
        settleTimerRef.current = setTimeout(() => {
          if (stepIndexRef.current !== targetIndex) return;
          const updatedEl = document.querySelector(step.selector) as HTMLElement | null;
          if (updatedEl) {
            const updatedRect = updatedEl.getBoundingClientRect();
            if (updatedRect.width > 0 && updatedRect.height > 0) {
              setTargetRect(updatedRect);
            }
          }
        }, 340);
      } else if (retryCount < 5) {
        // Retry for portal / modal rendering (e.g. fullscreen recorder mounting)
        timerRef.current = setTimeout(() => {
          measureAndScroll(retryCount + 1);
        }, 70);
      }
    };

    // Run measurement after next frame to let React apply DOM updates
    timerRef.current = setTimeout(() => {
      measureAndScroll(0);
    }, 40);

    const handleWindowResize = () => {
      if (stepIndexRef.current !== targetIndex) return;
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isTourActive, currentStepIndex, isFullscreenOpen, STEPS]);

  // Handle switching steps during the tour
  const handleGoToStep = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= STEPS.length) return;

    const targetStep = STEPS[newIndex];
    if (targetStep.requiresFullscreen) {
      if (!isFullscreenOpen) {
        onOpenFullscreen();
      }
    } else {
      if (isFullscreenOpen) {
        onCloseFullscreen();
      }
    }

    // When switching to workspace tools (e.g. step 6 bg-presets-area, 8 reset, 9 upload, 10 help/lang), unpin preview if pinned
    if (
      targetStep.id === 'bg-presets-area' ||
      targetStep.id === 'reset-btn' ||
      targetStep.id === 'upload-btn' ||
      targetStep.id === 'header-help-lang'
    ) {
      if (onSetPinned) {
        onSetPinned(false);
      }
    }

    setCurrentStepIndex(newIndex);
  };

  const handleStartTour = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } catch {}
    }
    setIsWelcomeOpen(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);
    if (isFullscreenOpen) {
      onCloseFullscreen();
    }
    if (onSetPinned) {
      onSetPinned(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipTour = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } catch {}
    }
    setIsWelcomeOpen(false);
    setIsTourActive(false);
    if (isFullscreenOpen) {
      onCloseFullscreen();
    }
    if (onSetPinned) {
      onSetPinned(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onCloseForceOpen) onCloseForceOpen();
  };

  const handleFinishTour = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      } catch {}
    }
    setIsTourActive(false);
    setIsWelcomeOpen(false);
    if (isFullscreenOpen) {
      onCloseFullscreen();
    }
    if (onSetPinned) {
      onSetPinned(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onCloseForceOpen) onCloseForceOpen();
  };

  // Keyboard navigation for tour
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIndex < STEPS.length - 1) {
          handleGoToStep(currentStepIndex + 1);
        } else {
          handleFinishTour();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handleGoToStep(currentStepIndex - 1);
        }
      } else if (e.key === 'Escape') {
        handleSkipTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, currentStepIndex]);

  // Guaranteed non-overlapping dialogue positioning with strict viewport clamping
  const getBubblePositionStyle = (
    step: TourStep,
    rect: DOMRect | null
  ): React.CSSProperties => {
    const bubbleWidth = Math.min(window.innerWidth - 24, 380);

    if (!rect || step.placement === 'center' || step.id === 'tour-finish') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999992,
        maxWidth: 'calc(100vw - 24px)',
        width: `${bubbleWidth}px`,
      };
    }

    const margin = 10;
    const estimatedCardHeight = 200;
    const bottomNavHeight = 124; // Reserved height for static bottom navigation buttons (buttons at bottom: 68-76px + height 44px + safe margin)

    // Compute horizontal center clamped strictly within screen bounds
    const targetCenterX = rect.left + rect.width / 2;
    let computedLeft = targetCenterX - bubbleWidth / 2;
    computedLeft = Math.max(12, Math.min(window.innerWidth - bubbleWidth - 12, computedLeft));

    // Special case for step 3: Clean Screen eye button in top right
    if (step.id === 'clean-screen') {
      const topPos = Math.max(8, rect.bottom + margin);
      // Ensure bottom of card doesn't exceed screen height above static bottom nav
      if (topPos + estimatedCardHeight > window.innerHeight - bottomNavHeight) {
        return {
          position: 'fixed',
          bottom: `${bottomNavHeight + 8}px`,
          left: `${computedLeft}px`,
          width: `${bubbleWidth}px`,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 99999992,
        };
      }
      return {
        position: 'fixed',
        top: `${topPos}px`,
        left: `${computedLeft}px`,
        width: `${bubbleWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 99999992,
      };
    }

    // If target is in lower half of screen OR placement is top: place ABOVE target
    if (step.placement === 'top' || rect.top > window.innerHeight * 0.48) {
      const bottomPos = Math.max(bottomNavHeight + 8, window.innerHeight - rect.top + margin);
      // Guard against running off the top of the viewport
      if (window.innerHeight - bottomPos < 60) {
        return {
          position: 'fixed',
          top: '12px',
          left: `${computedLeft}px`,
          width: `${bubbleWidth}px`,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 99999992,
        };
      }
      return {
        position: 'fixed',
        bottom: `${bottomPos}px`,
        left: `${computedLeft}px`,
        width: `${bubbleWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 99999992,
      };
    } else {
      // Place BELOW target
      const topPos = Math.max(8, rect.bottom + margin);
      // Guard against running off the bottom of the viewport
      if (topPos + estimatedCardHeight > window.innerHeight - bottomNavHeight) {
        return {
          position: 'fixed',
          bottom: `${bottomNavHeight + 8}px`,
          left: `${computedLeft}px`,
          width: `${bubbleWidth}px`,
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 99999992,
        };
      }

      return {
        position: 'fixed',
        top: `${topPos}px`,
        left: `${computedLeft}px`,
        width: `${bubbleWidth}px`,
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 99999992,
      };
    }
  };

  const currentStep = STEPS[currentStepIndex];

  return createPortal(
    <>
      {/* 1. Initial Welcome Board: "Как это работает?" (Compact, 100% Fits on any screen) */}
      {isWelcomeOpen && (
        <div
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div
            className="w-full max-w-sm bg-[#161622]/98 border border-purple-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl shadow-purple-950/60 text-white relative animate-in zoom-in-95 duration-150 flex flex-col gap-2.5 sm:gap-3 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleSkipTour}
              className="absolute top-3 right-3 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={t('close', 'Закрыть')}
              aria-label={t('close', 'Закрыть')}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Header with Glowing Icon */}
            <div className="flex items-center gap-2.5 sm:gap-3 pr-6">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/40 border border-purple-400/40 shrink-0">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5 leading-tight">
                  <span>{t('tourWelcomeTitle', 'Как это работает?')}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-purple-300 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('tourWelcomeSubtitle', 'Экспресс-тур займет всего 1 минуту!')}</span>
                </p>
              </div>
            </div>

            {/* Description Body */}
            <p className="text-[11px] sm:text-xs text-zinc-300 leading-snug font-normal">
              {t(
                'tourWelcomeDesc',
                'Интерактивный редактор для создания эффектных коротких видео с анимированным текстом. Хотите за 1 минуту узнать все ключевые кнопки, жесты и возможности создания роликов?'
              )}
            </p>

            {/* Highlights Mini Cards */}
            <div className="space-y-1.5 py-0.5">
              <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <Pin className="w-3 h-3 text-purple-300" />
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-200 leading-tight">
                  <strong className="text-white font-semibold">{t('tourHl1_title', 'Полноэкранный кино-режим:')}</strong>{' '}
                  {t('tourHl1_desc', 'перетаскивание текста жестами и чистый экран в 1 клик')}
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0 border border-pink-500/30">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-200 leading-tight">
                  <strong className="text-white font-semibold">{t('tourHl2_title', 'Генерация фона и музыки:')}</strong>{' '}
                  {t('tourHl2_desc', 'процедурные видеофоны, мелодии и стили текста')}
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Video className="w-3 h-3" />
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-200 leading-tight">
                  <strong className="text-white font-semibold">{t('tourHl3_title', 'Шаблоны и видеозахват:')}</strong>{' '}
                  {t('tourHl3_desc', 'каталог готовых пресетов и мгновенная запись WebM/MP4')}
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleStartTour}
                className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.01] active:scale-95 border border-white/10 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse group-hover:rotate-12 transition-transform" />
                <span>{t('tourBtnSee', 'Начать тур (1 мин) ✨')}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipTour}
                className="py-2.5 sm:py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                {t('tourBtnSkip', 'Пропустить')}
              </button>
            </div>

            {/* Checkbox: "Больше не показывать" */}
            <label className="flex items-center gap-1.5 pt-0.5 cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors mx-auto">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-500"
              />
              <span>{t('tourDontShowAgain', 'Больше не показывать')}</span>
            </label>
          </div>
        </div>
      )}

      {/* 2. Interactive Spotlight & Speech Bubble Tour Mode */}
      {isTourActive && (
        <div className="fixed inset-0 z-[99999990] pointer-events-none select-none">
          {/* Dimmed backdrop overlay - BLOCKS touch/clicks from dismissing tour or passing through */}
          <div
            className="fixed inset-0 bg-black/65 pointer-events-auto transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          {/* Highlight Box over Targeted Element */}
          {targetRect && (
            <div
              className="fixed rounded-2xl border-2 border-purple-400 ring-4 ring-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.7),inset_0_0_20px_rgba(168,85,247,0.25)] pointer-events-none"
              style={{
                top: `${Math.max(0, targetRect.top - 6)}px`,
                left: `${Math.max(0, targetRect.left - 6)}px`,
                width: `${targetRect.width + 12}px`,
                height: `${targetRect.height + 12}px`,
                zIndex: 99999995,
                transition: 'top 0.32s cubic-bezier(0.16, 1, 0.3, 1), left 0.32s cubic-bezier(0.16, 1, 0.3, 1), width 0.32s cubic-bezier(0.16, 1, 0.3, 1), height 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out',
                willChange: 'top, left, width, height',
              }}
            />
          )}

          {/* Speech Bubble Dialogue Window */}
          <div
            style={{
              ...getBubblePositionStyle(currentStep, targetRect),
              transition: 'top 0.32s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.32s cubic-bezier(0.16, 1, 0.3, 1), left 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out',
              willChange: 'top, bottom, left, transform',
            }}
            className="pointer-events-auto"
          >
            <div
              key={currentStep.id}
              className="relative bg-[#181828]/98 backdrop-blur-2xl border border-purple-400/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl shadow-purple-950/80 text-white flex flex-col justify-between gap-2 max-h-[calc(100dvh-24px)] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Header: Step Badge & Title & Close (Sticky Top) */}
              <div className="flex items-start justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] sm:text-xs font-mono font-bold shrink-0">
                    {currentStepIndex + 1} / {STEPS.length}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
                    <span className="truncate">{t(currentStep.titleKey, currentStep.defaultTitle)}</span>
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title={t('close', 'Закрыть')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Speech Bubble Description (Scrollable body if needed) */}
              <div className="overflow-y-auto max-h-[35vh] sm:max-h-[45vh] pr-0.5 scrollbar-thin scrollbar-thumb-purple-500/30">
                <p className="text-xs sm:text-[13px] text-zinc-200 leading-relaxed font-normal">
                  {t(currentStep.descKey, currentStep.defaultDesc)}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Static Ergonomic Navigation Buttons (Minimalist transparent square buttons placed above function dock on the right) */}
          <div
            style={{ zIndex: 100000000 }}
            className="fixed bottom-[68px] sm:bottom-[76px] right-3 sm:right-6 flex items-center gap-2 z-[100000000] pointer-events-none select-none"
          >
            {/* Back Button (Gray, transparent without solid background) */}
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={() => handleGoToStep(currentStepIndex - 1)}
                className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/45 hover:bg-white/10 active:scale-90 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:border-white/40 backdrop-blur-md shadow-xl"
                title={t('tourBack', 'Назад')}
                aria-label={t('tourBack', 'Назад')}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next / Finish Button (Green, transparent without solid background) */}
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => handleGoToStep(currentStepIndex + 1)}
                className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 active:scale-90 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-all cursor-pointer border border-emerald-500/40 hover:border-emerald-400/80 backdrop-blur-md shadow-xl shadow-emerald-950/40 hover:scale-105"
                title={t('tourNext', 'Далее')}
                aria-label={t('tourNext', 'Далее')}
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishTour}
                className="pointer-events-auto px-3.5 h-10 sm:h-11 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 active:scale-90 text-emerald-300 hover:text-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/60 hover:border-emerald-300 backdrop-blur-md shadow-xl shadow-emerald-950/50 hover:scale-105"
                title={t('tourFinish', 'Попробовать самому! 🚀')}
                aria-label={t('tourFinish', 'Попробовать самому!')}
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span className="hidden xs:inline">Готово</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
