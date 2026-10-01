import { BACKGROUND_PRESETS } from '../data/presets';
import { VideoProjectState, ProceduralMoodStyle } from '../types';
import { splitTextIntoSegments, getEffectiveSpeed } from './textSplitter';
import { drawProceduralMoodBackground } from './proceduralBackgrounds';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export function getDimensionsForAspect(aspectRatio: string): CanvasDimensions {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1920, height: 1080 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '9:16':
    default:
      return { width: 1080, height: 1920 };
  }
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export const RAINBOW_LETTER_PALETTE = [
  '#f43f5e', // Vivid Rose
  '#fb923c', // Warm Amber
  '#facc15', // Bright Gold
  '#4ade80', // Fresh Emerald
  '#22d3ee', // Electric Cyan
  '#38bdf8', // Sky Blue
  '#818cf8', // Cyber Indigo
  '#c084fc', // Neon Lavender
  '#f472b6', // Flamingo Pink
];

export const CHAOTIC_PALETTES = [
  // Cyber Neon
  ['#00f2fe', '#4facfe', '#ff007f', '#7928ca', '#00ff87', '#60efff', '#f72585', '#7209b7', '#4cc9f0'],
  // Sunset Blaze
  ['#ff4b1f', '#ff9068', '#f7b733', '#fc4a1a', '#f7797d', '#fbd786', '#ff2a5f', '#f5af19', '#e14fad'],
  // Tropical Acid
  ['#f9d423', '#ff4e50', '#00e5ff', '#76ff03', '#ff0055', '#d500f9', '#00b0ff', '#ffeb3b', '#00e676'],
  // Aurora Borealis
  ['#00f5d4', '#7b2cbf', '#9d4edd', '#c77dff', '#ff9e00', '#00bbf9', '#fee440', '#52b788', '#38bdf8'],
  // Fire & Ice
  ['#ff3b30', '#ff9500', '#34c759', '#007aff', '#5856d6', '#af52de', '#5ac8fa', '#ff2d55', '#ffd60a'],
];

export function getChaoticColor(index: number, seed: number = 42): string {
  const palette = CHAOTIC_PALETTES[Math.abs((seed + Math.floor(index / 7)) % CHAOTIC_PALETTES.length)];
  const pickIdx = Math.abs((index * 7 + seed * 3 + (index % 3) * 5) % palette.length);
  return palette[pickIdx];
}

export function createAngleGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  color1: string,
  color2: string
): CanvasGradient {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const halfDiag = Math.sqrt(w * w + h * h) / 2;
  const x0 = cx - Math.cos(rad) * halfDiag;
  const y0 = cy - Math.sin(rad) * halfDiag;
  const x1 = cx + Math.cos(rad) * halfDiag;
  const y1 = cy + Math.sin(rad) * halfDiag;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  return grad;
}

// Particle state for canvas effects
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  life: number;
  maxLife: number;
}

class ParticleEngine {
  sparkles: Particle[] = [];
  fireParticles: Particle[] = [];
  lastTime: number = 0;

  updateAndDrawSparkles(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    time: number
  ) {
    // Generate new sparkles
    if (this.sparkles.length < 35 && bounds.width > 0) {
      const margin = 50;
      this.sparkles.push({
        x: bounds.x - margin + Math.random() * (bounds.width + margin * 2),
        y: bounds.y - margin + Math.random() * (bounds.height + margin * 2),
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 8 + Math.random() * 18,
        alpha: 0.1,
        color: Math.random() > 0.3 ? '#fde047' : '#ffffff',
        rotation: Math.random() * Math.PI,
        life: 0,
        maxLife: 1.2 + Math.random() * 1.5,
      });
    }

    const dt = 0.03;
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.sparkles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += 0.05;

      const progress = p.life / p.maxLife;
      // Fade in and out
      p.alpha = Math.sin(progress * Math.PI) * 0.95;

      // Draw 4-point star sparkle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      const r = p.size;
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const radius = j % 2 === 0 ? r : r * 0.25;
        const angle = (j * Math.PI) / 4;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;
        if (j === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  updateAndDrawFire(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    time: number
  ) {
    if (bounds.width <= 0) return;

    // Spawn fire particles along the bottom baseline of the text
    if (this.fireParticles.length < 60) {
      for (let i = 0; i < 3; i++) {
        const px = bounds.x + Math.random() * bounds.width;
        const py = bounds.y + bounds.height - 10 + (Math.random() - 0.5) * 20;
        this.fireParticles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 45,
          vy: -60 - Math.random() * 90,
          size: 14 + Math.random() * 24,
          alpha: 0.9,
          color: Math.random() > 0.6 ? '#fbbf24' : Math.random() > 0.3 ? '#f97316' : '#ef4444',
          rotation: Math.random() * Math.PI,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.8,
        });
      }
    }

    const dt = 0.03;
    for (let i = this.fireParticles.length - 1; i >= 0; i--) {
      const p = this.fireParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.fireParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt + Math.sin(time * 10 + p.y * 0.05) * 2;
      p.y += p.vy * dt;
      p.size = Math.max(1, p.size * 0.96);

      const progress = p.life / p.maxLife;
      p.alpha = (1 - progress) * 0.85;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  dustParticles: Particle[] = [];
  sparklerParticles: Particle[] = [];
  fireworkParticles: Particle[] = [];
  smokeParticles: Particle[] = [];

  updateAndDrawDust(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    color: string,
    time: number
  ) {
    if (bounds.width <= 0) return;

    if (this.dustParticles.length < 55) {
      const margin = 45;
      this.dustParticles.push({
        x: bounds.x - margin + Math.random() * (bounds.width + margin * 2),
        y: bounds.y - margin + Math.random() * (bounds.height + margin * 2),
        vx: (Math.random() - 0.5) * 22,
        vy: -14 - Math.random() * 26,
        size: 2.5 + Math.random() * 4,
        alpha: 0.2,
        color: Math.random() > 0.4 ? color : '#38bdf8',
        rotation: Math.random() * Math.PI,
        life: 0,
        maxLife: 1.8 + Math.random() * 2.2,
      });
    }

    const dt = 0.03;
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const p = this.dustParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.dustParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt + Math.sin(time * 3.5 + p.y * 0.04) * 0.9;
      p.y += p.vy * dt;

      const progress = p.life / p.maxLife;
      p.alpha = Math.sin(progress * Math.PI) * 0.85;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      // Draw small square pixel dust speck
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  updateAndDrawSparklers(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    time: number
  ) {
    if (bounds.width <= 0) return;

    // Spawn intense crackling sparkler sparks around text contour
    if (this.sparklerParticles.length < 80) {
      for (let s = 0; s < 5; s++) {
        const px = bounds.x + Math.random() * bounds.width;
        const py = bounds.y + Math.random() * bounds.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 160;
        this.sparklerParticles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 3,
          alpha: 1,
          color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.3 ? '#fef08a' : '#f59e0b',
          rotation: Math.random() * Math.PI,
          life: 0,
          maxLife: 0.25 + Math.random() * 0.35,
        });
      }
    }

    const dt = 0.03;
    for (let i = this.sparklerParticles.length - 1; i >= 0; i--) {
      const p = this.sparklerParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.sparklerParticles.splice(i, 1);
        continue;
      }

      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 45 * dt; // gravity

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.lineWidth = Math.max(1, p.size * (1 - progress));
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // Spark tip star
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      ctx.restore();
    }
  }

  updateAndDrawFireworks(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    time: number
  ) {
    if (bounds.width <= 0) return;

    // Periodic fireworks bursts around letters
    if (this.fireworkParticles.length < 75 && Math.random() < 0.35) {
      const burstX = bounds.x + Math.random() * bounds.width;
      const burstY = bounds.y - 10 + Math.random() * (bounds.height * 0.8);
      const palette = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80', '#ffffff'];
      const burstColor = palette[Math.floor(Math.random() * palette.length)];

      const sparkCount = 18;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i * Math.PI * 2) / sparkCount + (Math.random() - 0.5) * 0.3;
        const speed = 40 + Math.random() * 85;
        this.fireworkParticles.push({
          x: burstX,
          y: burstY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 3,
          alpha: 1,
          color: i % 3 === 0 ? '#ffffff' : burstColor,
          rotation: 0,
          life: 0,
          maxLife: 0.6 + Math.random() * 0.5,
        });
      }
    }

    const dt = 0.03;
    for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
      const p = this.fireworkParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.fireworkParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 35 * dt; // gravity
      p.vx *= 0.96; // drag

      const progress = p.life / p.maxLife;
      p.alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * (1 - progress * 0.5)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  updateAndDrawSmoke(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    color: string | undefined,
    time: number
  ) {
    if (bounds.width <= 0) return;

    // Spawn billowing smoke puffs from text baseline
    if (this.smokeParticles.length < 50) {
      for (let s = 0; s < 2; s++) {
        const px = bounds.x + Math.random() * bounds.width;
        const py = bounds.y + bounds.height * 0.75 + (Math.random() - 0.5) * 15;
        const smokePalettes = ['#cbd5e1', '#94a3b8', '#a855f7', '#38bdf8', '#f472b6'];
        const pColor = color || smokePalettes[Math.floor(Math.random() * smokePalettes.length)];
        this.smokeParticles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 20,
          vy: -25 - Math.random() * 35,
          size: 14 + Math.random() * 18,
          alpha: 0.45,
          color: pColor,
          rotation: Math.random() * Math.PI * 2,
          life: 0,
          maxLife: 1.6 + Math.random() * 1.2,
        });
      }
    }

    const dt = 0.03;
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.smokeParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt + Math.sin(time * 2 + p.y * 0.03) * 1.5;
      p.y += p.vy * dt;
      p.rotation += 0.02;
      p.size += 18 * dt; // Smoke expands as it rises

      const progress = p.life / p.maxLife;
      // Soft fade-in then gradual fade-out
      p.alpha = Math.sin(progress * Math.PI) * 0.42;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      const radGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.size);
      radGrad.addColorStop(0, p.color);
      radGrad.addColorStop(0.65, p.color);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  reset() {
    this.sparkles = [];
    this.fireParticles = [];
    this.dustParticles = [];
    this.sparklerParticles = [];
    this.fireworkParticles = [];
    this.smokeParticles = [];
  }
}

export const particleEngine = new ParticleEngine();

export function renderCanvasFrame({
  ctx,
  state,
  currentTime,
  bgMediaElement,
  dimensions,
  targetDuration,
  isDraggingText = false,
}: {
  ctx: CanvasRenderingContext2D;
  state: VideoProjectState;
  currentTime: number;
  bgMediaElement: HTMLImageElement | HTMLVideoElement | null;
  dimensions: CanvasDimensions;
  targetDuration?: number;
  isDraggingText?: boolean;
}) {
  const { width, height } = dimensions;

  // 1. Reset canvas
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 2. Calculate Text Segments & Timeline
  const { segments } = splitTextIntoSegments(
    state.rawText,
    state.textMode,
    state.speedMultiplier,
    state.pauseBetweenSeconds,
    targetDuration,
    state.animationStyle
  );

  // Find active segment for current time
  let activeSegmentIndex = segments.findIndex(
    (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime + 0.15
  );

  // Keep showing final segment if in pause before loop restart
  if (activeSegmentIndex === -1 && segments.length > 0 && currentTime >= segments[segments.length - 1].startTime) {
    activeSegmentIndex = segments.length - 1;
  }

  const activeSegment = activeSegmentIndex >= 0 ? segments[activeSegmentIndex] : null;

  // 3. Draw Background with active segment timing
  drawBackground(
    ctx,
    state,
    bgMediaElement,
    width,
    height,
    currentTime,
    activeSegment,
    activeSegmentIndex,
    segments.length
  );

  // 4. Draw Darkening Overlay (only when mediaOverlayTheme is not active and no custom media without explicit darkening)
  if (state.bgOverlayOpacity > 0 && !state.mediaOverlayTheme && !bgMediaElement) {
    ctx.fillStyle = `rgba(0, 0, 0, ${state.bgOverlayOpacity})`;
    ctx.fillRect(0, 0, width, height);
  }

  if (activeSegment) {
    const isLastSegment = segments.length > 0 && activeSegment === segments[segments.length - 1];

    drawTextSegment({
      ctx,
      segment: activeSegment,
      state,
      currentTime,
      canvasWidth: width,
      canvasHeight: height,
      isLastSegment,
      isDraggingText,
    });
  }

  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  state: VideoProjectState,
  bgMedia: HTMLImageElement | HTMLVideoElement | null,
  width: number,
  height: number,
  time: number,
  activeSegment: any = null,
  activeSegmentIndex: number = 0,
  totalSegmentsCount: number = 1
) {
  if (bgMedia && (state.bgType === 'image' || state.bgType === 'video' || state.bgMediaType === 'image' || state.bgMediaType === 'video')) {
    const isVideo = bgMedia instanceof HTMLVideoElement;
    const mediaWidth = isVideo ? (bgMedia as HTMLVideoElement).videoWidth : (bgMedia as HTMLImageElement).naturalWidth;
    const mediaHeight = isVideo ? (bgMedia as HTMLVideoElement).videoHeight : (bgMedia as HTMLImageElement).naturalHeight;

    if (mediaWidth > 0 && mediaHeight > 0) {
      // Calculate "cover" scale
      const scale = Math.max(width / mediaWidth, height / mediaHeight);
      const drawW = mediaWidth * scale;
      const drawH = mediaHeight * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      try {
        ctx.drawImage(bgMedia, drawX, drawY, drawW, drawH);
      } catch (err) {
        console.warn('Unable to draw background frame:', err);
      }

      // If mediaOverlayTheme is set, overlay the animated floating theme WITHOUT its solid background!
      if (state.mediaOverlayTheme) {
        drawPresetOrOverlayBackground(
          ctx,
          state.mediaOverlayTheme,
          state,
          width,
          height,
          time,
          true,
          activeSegment,
          activeSegmentIndex,
          totalSegmentsCount
        );
      }

      return;
    }
  }

  // Fallback to preset
  const presetId = state.bgPresetId || 'ai-procedural-cosmic';
  drawPresetOrOverlayBackground(
    ctx,
    presetId,
    state,
    width,
    height,
    time,
    false,
    activeSegment,
    activeSegmentIndex,
    totalSegmentsCount
  );
}

function drawPresetOrOverlayBackground(
  ctx: CanvasRenderingContext2D,
  presetId: string,
  state: VideoProjectState,
  width: number,
  height: number,
  time: number,
  skipSolidBg: boolean = false,
  activeSegment: any = null,
  activeSegmentIndex: number = 0,
  totalSegmentsCount: number = 1
) {
  const preset =
    BACKGROUND_PRESETS.find((p) => p.id === presetId) ||
    BACKGROUND_PRESETS[0];

  if (preset.id.startsWith('ai-procedural-') || Boolean(state.proceduralMood && preset.id.includes('procedural'))) {
    const moodStyle =
      (preset.id.startsWith('ai-procedural-')
        ? (preset.id.replace('ai-procedural-', '') as ProceduralMoodStyle)
        : undefined) ||
      state.proceduralMood ||
      'cosmic';
    const seed = state.proceduralSeed || 42;
    drawProceduralMoodBackground(ctx, width, height, time, moodStyle, seed, skipSolidBg, {
      direction: state.matrixDirection,
      colorTheme: state.matrixColorTheme,
      fontSize: state.fontSize,
      rawText: state.rawText,
      activeSegmentText: activeSegment?.text,
      isUppercase: state.isUppercase,
      fireworksColorTheme: state.fireworksColorTheme,
      fireworksCount: state.fireworksCount,
      fireworksScaleMode: state.fireworksScaleMode,
      flagsMode: state.flagsMode,
      flagsCount: state.flagsCount,
      flagsScaleMode: state.flagsScaleMode,
      flagsPrimaryCountry: state.flagsPrimaryCountry,
      flagsSecondaryCountry: state.flagsSecondaryCountry,
      flagsMotion: state.flagsMotion,
      flagsEffect: state.flagsEffect,
      flagsBgStyle: state.flagsBgStyle,
      cloudsStyle: state.cloudsStyle,
      cloudsSpeed: state.cloudsSpeed,
      cloudsFeather: state.cloudsFeather,
    });
    return;
  }

  if (preset.id === 'notebook-flip') {
    // 1. Блокнот с металлической пружиной слева и анимацией перелистывания страницы на каждое предложение/фразу
    // Базовый фон стола (элегантный теплый деревянный/нейтральный стол)
    const deskGrad = ctx.createLinearGradient(0, 0, width, height);
    deskGrad.addColorStop(0, '#1c1917');
    deskGrad.addColorStop(0.5, '#292524');
    deskGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = deskGrad;
    ctx.fillRect(0, 0, width, height);

    // Параметры листа блокнота
    const padMarginX = width * 0.04;
    const padMarginY = height * 0.04;
    const padWidth = width - padMarginX * 2;
    const padHeight = height - padMarginY * 2;
    const springWidth = Math.max(48, width * 0.065);
    const pageX = padMarginX + springWidth * 0.6;
    const pageWidth = padWidth - springWidth * 0.6;

    // Тень под блокнотом
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(pageX, padMarginY, pageWidth, padHeight);
    ctx.restore();

    // Задние страницы блокнота (создают толщину пачки)
    for (let i = 4; i >= 1; i--) {
      ctx.fillStyle = i % 2 === 0 ? '#e2e8f0' : '#cbd5e1';
      ctx.fillRect(pageX + i * 2, padMarginY + i * 2, pageWidth - i * 2, padHeight - i * 2);
    }

    // Базовый статичный лист бумаги
    const drawPageContent = (targetX: number, targetW: number, shadowOpacity: number = 0) => {
      ctx.save();
      // Цвет бумаги
      const paperGrad = ctx.createLinearGradient(targetX, 0, targetX + targetW, 0);
      paperGrad.addColorStop(0, '#f1f5f9');
      paperGrad.addColorStop(0.08, '#ffffff');
      paperGrad.addColorStop(0.95, '#ffffff');
      paperGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = paperGrad;
      ctx.fillRect(targetX, padMarginY, targetW, padHeight);

      // Горизонтальные линейки блокнота
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 1.5;
      const lineStep = 48;
      ctx.beginPath();
      for (let y = padMarginY + 80; y < padMarginY + padHeight - 40; y += lineStep) {
        ctx.moveTo(targetX + 20, y);
        ctx.lineTo(targetX + targetW - 20, y);
      }
      ctx.stroke();

      if (shadowOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.fillRect(targetX, padMarginY, targetW, padHeight);
      }
      ctx.restore();
    };

    // Отрисовываем нижнюю страницу (новую открывающуюся страницу)
    drawPageContent(pageX, pageWidth, 0);

    // Рассчитываем анимацию перелистывания страницы в сторону пружинки (справа налево)
    if (activeSegment) {
      const segStart = activeSegment.startTime;
      const timeSinceStart = time - segStart;
      const flipDuration = 0.55; // 550ms на плавный переворот страницы

      if (timeSinceStart >= 0 && timeSinceStart < flipDuration) {
        const rawProgress = timeSinceStart / flipDuration;
        const progress = easeOutCubic(rawProgress);

        // Правый край листа перемещается справа налево к пружинке (от pageX + pageWidth к pageX)
        const turningPageWidth = (1 - progress) * pageWidth;
        const currentEdgeX = pageX + turningPageWidth;

        if (turningPageWidth > 4) {
          ctx.save();
          // Тень на нижний лист от поднимающейся страницы
          const shadowWidth = Math.min(80, (pageWidth - turningPageWidth) * 0.8 + 25);
          const shadowGrad = ctx.createLinearGradient(currentEdgeX, 0, currentEdgeX + shadowWidth, 0);
          shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${0.45 * (1 - progress)})`);
          shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = shadowGrad;
          ctx.fillRect(currentEdgeX, padMarginY, shadowWidth, padHeight);

          // Верхний перелистывающийся лист (сжимается к пружинке слева)
          drawPageContent(pageX, turningPageWidth, progress * 0.22);

          // Светотень цилиндрического изгиба на самом краю перелистываемого листа
          const curlWidth = Math.min(50, turningPageWidth * 0.45);
          const curlGrad = ctx.createLinearGradient(currentEdgeX - curlWidth, 0, currentEdgeX, 0);
          curlGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          curlGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.85)');
          curlGrad.addColorStop(1, 'rgba(100, 116, 139, 0.4)');
          ctx.fillStyle = curlGrad;
          ctx.fillRect(currentEdgeX - curlWidth, padMarginY, curlWidth, padHeight);

          ctx.restore();
        }
      }
    }

    // Металлическая пружина (спираль) слева поверх страниц
    ctx.save();
    const coilCount = Math.floor(padHeight / 36);
    const coilStep = padHeight / coilCount;

    for (let c = 0; c < coilCount; c++) {
      const cy = padMarginY + c * coilStep + coilStep * 0.5;
      const cx = padMarginX + springWidth * 0.45;
      const rx = springWidth * 0.4;
      const ry = 11;

      // Отверстие в бумаге (пробивка дырокола)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx + rx * 0.55, cy, 6, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Тень кольца пружины
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy + 3, rx, ry, -0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Металлическое блестящее кольцо (хром / серебро)
      const ringGrad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
      ringGrad.addColorStop(0, '#64748b');
      ringGrad.addColorStop(0.3, '#f8fafc');
      ringGrad.addColorStop(0.5, '#cbd5e1');
      ringGrad.addColorStop(0.8, '#475569');
      ringGrad.addColorStop(1, '#94a3b8');

      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, -0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Яркий металлический блик
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx - 3, cy - 2, rx * 0.8, ry * 0.7, -0.3, Math.PI * 0.9, Math.PI * 1.5);
      ctx.stroke();
    }
    ctx.restore();

    // Номер страницы / легкая нумерация внизу справа
    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.font = `600 ${Math.max(16, width * 0.018)}px sans-serif`;
    ctx.textAlign = 'right';
    const pageNum = (activeSegmentIndex >= 0 ? activeSegmentIndex + 1 : 1);
    const totalPages = Math.max(1, totalSegmentsCount);
    ctx.fillText(`Стр. ${pageNum} / ${totalPages}`, padMarginX + padWidth - 30, padMarginY + padHeight - 25);
    ctx.restore();
  } else if (preset.id === 'flying-questions') {
    // 2. Парящие 3D знаки вопроса (?)
    const qGrad = ctx.createLinearGradient(0, 0, 0, height);
    qGrad.addColorStop(0, '#090a1a');
    qGrad.addColorStop(0.5, '#1e1035');
    qGrad.addColorStop(1, '#05030a');
    if (!skipSolidBg) {
      ctx.fillStyle = qGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Сетка парящих знаков
    const count = 24;
    const symbols = ['?', '¿', '?'];
    const colors = ['#c084fc', '#e879f9', '#818cf8', '#38bdf8', '#fb7185'];

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 75 + (i % 6) * 22;
      const size = 32 + (i % 7) * 14;
      const xSway = Math.sin(time * 1.6 + i * 1.9) * 45;
      const x = ((i * 140 + xSway) % (width + 100)) - 50;
      const y = height - ((time * speed + i * 160) % (height + 180));
      const col = colors[i % colors.length];
      const char = symbols[i % symbols.length];
      const rot = Math.sin(time * 1.2 + i) * 0.35;
      const alpha = Math.min(1, Math.max(0.18, Math.sin((y / height) * Math.PI) * 0.9));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${size}px "Montserrat", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 3D объемная тень
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(char, 4, 4);

      // Неоновое свечение
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 20;
      ctx.fillText(char, 0, 0);

      // Блик
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = alpha * 0.65;
      ctx.fillText(char, -1, -1);

      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'flying-exclamations') {
    // 3. Парящие динамичные восклицательные знаки (!)
    const exGrad = ctx.createLinearGradient(0, 0, 0, height);
    exGrad.addColorStop(0, '#1f0606');
    exGrad.addColorStop(0.5, '#450a0a');
    exGrad.addColorStop(1, '#0c0202');
    if (!skipSolidBg) {
      ctx.fillStyle = exGrad;
      ctx.fillRect(0, 0, width, height);
    }

    const count = 26;
    const colors = ['#facc15', '#fbbf24', '#f97316', '#ef4444', '#f43f5e'];

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 95 + (i % 5) * 30;
      const size = 36 + (i % 6) * 16;
      const xSway = Math.sin(time * 2.2 + i * 1.4) * 35;
      const x = ((i * 135 + xSway) % (width + 80)) - 40;
      const y = height - ((time * speed + i * 150) % (height + 200));
      const col = colors[i % colors.length];
      const rot = Math.sin(time * 2.5 + i) * 0.2;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.95));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${size}px "Arial Black", "Montserrat", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Тень
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('!', 3, 5);

      // Огненное сияние
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 24;
      ctx.fillText('!', 0, 0);

      // Яркий центр
      ctx.fillStyle = '#fffbeb';
      ctx.globalAlpha = alpha * 0.75;
      ctx.fillText('!', -1, -1);

      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'flying-kisses') {
    // 4. Парящие поцелуи и смайлики (💋 😘 ✨)
    const kissGrad = ctx.createLinearGradient(0, 0, 0, height);
    kissGrad.addColorStop(0, '#2d0612');
    kissGrad.addColorStop(0.5, '#500724');
    kissGrad.addColorStop(1, '#18020a');
    if (!skipSolidBg) {
      ctx.fillStyle = kissGrad;
      ctx.fillRect(0, 0, width, height);
    }

    const count = 22;
    const kissIcons = ['💋', '😘', '💕', '💋', '💖'];

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 70 + (i % 6) * 20;
      const size = 30 + (i % 5) * 12;
      const xSway = Math.sin(time * 1.4 + i * 1.8) * 50;
      const x = ((i * 155 + xSway) % (width + 80)) - 40;
      const y = height - ((time * speed + i * 170) % (height + 180));
      const icon = kissIcons[i % kissIcons.length];
      const rot = Math.sin(time * 1.8 + i) * 0.3;
      const pulse = 1 + Math.sin(time * 4 + i) * 0.12;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.9));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = alpha;
      ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;
      ctx.fillText(icon, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'flying-currency') {
    // 5. Парящие символы валют: $, €, ¥, ₽ в золотых и изумрудных тонах
    const moneyGrad = ctx.createLinearGradient(0, 0, 0, height);
    moneyGrad.addColorStop(0, '#022115');
    moneyGrad.addColorStop(0.5, '#064e3b');
    moneyGrad.addColorStop(1, '#01140c');
    if (!skipSolidBg) {
      ctx.fillStyle = moneyGrad;
      ctx.fillRect(0, 0, width, height);
    }

    const count = 28;
    const currencies = ['$', '€', '¥', '₽', '$', '£'];
    const moneyColors = ['#fbbf24', '#facc15', '#34d399', '#4ade80', '#eab308'];

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 80 + (i % 6) * 24;
      const size = 34 + (i % 6) * 14;
      const xSway = Math.sin(time * 1.7 + i * 1.6) * 40;
      const x = ((i * 130 + xSway) % (width + 90)) - 45;
      const y = height - ((time * speed + i * 160) % (height + 200));
      const col = moneyColors[i % moneyColors.length];
      const symbol = currencies[i % currencies.length];
      const rot = Math.sin(time * 1.5 + i) * 0.28;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.95));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.font = `900 ${size}px "Montserrat", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Объемная золотая тень
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillText(symbol, 3, 4);

      // Свечение валюты
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 22;
      ctx.fillText(symbol, 0, 0);

      // Глянцевый блик монеты
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillText(symbol, -1, -1);

      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'clean-white') {
    // Лист бумаги с возможностью выбора пользовательского цвета
    const sheetColor = state.bgCustomColor || '#ffffff';
    ctx.fillStyle = sheetColor;
    ctx.fillRect(0, 0, width, height);

    // Легкая виньетка по краям листа для объема
    const paperGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.4,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.85
    );
    paperGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    paperGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (preset.id === 'old-parchment') {
    // 2. Старый свиток / античный пергамент
    // Базовый градиент состаренной пожелтевшей бумаги
    const parchmentGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    parchmentGrad.addColorStop(0, '#f9f4e8');
    parchmentGrad.addColorStop(0.5, '#eddcb5');
    parchmentGrad.addColorStop(0.85, '#d4b47a');
    parchmentGrad.addColorStop(1, '#82592a');
    ctx.fillStyle = parchmentGrad;
    ctx.fillRect(0, 0, width, height);

    // Винтажные волокна и патина
    ctx.save();
    for (let i = 0; i < 35; i++) {
      const px = ((i * 383.7) % width);
      const py = ((i * 541.3) % height);
      const pr = 40 + ((i * 19) % 120);
      const stainGrad = ctx.createRadialGradient(px, py, 5, px, py, pr);
      stainGrad.addColorStop(0, 'rgba(166, 124, 64, 0.12)');
      stainGrad.addColorStop(0.7, 'rgba(191, 149, 90, 0.05)');
      stainGrad.addColorStop(1, 'rgba(191, 149, 90, 0)');
      ctx.fillStyle = stainGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Тонкая обожженная рамка вокруг свитка
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(92, 58, 26, 0.35)';
    ctx.strokeRect(7, 7, width - 14, height - 14);
    ctx.restore();
  } else if (preset.id === 'notebook-grid') {
    // 3. Тетрадный лист в клетку (без красной полоски полей)
    const sheetColor = state.bgCustomColor || '#ffffff';
    ctx.fillStyle = sheetColor;
    ctx.fillRect(0, 0, width, height);

    const gridSize = 40; // Размер клетки

    // Синяя сетка клеток
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.75)'; // Светло-голубые линии
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.restore();
  } else if (preset.id === 'flying-hearts') {
    // 4. Парящие красные сердечки
    // Романтический фон
    const heartBg = ctx.createLinearGradient(0, 0, 0, height);
    heartBg.addColorStop(0, '#26040d');
    heartBg.addColorStop(0.5, '#5c0b20');
    heartBg.addColorStop(1, '#1a0309');
    if (!skipSolidBg) {
      ctx.fillStyle = heartBg;
      ctx.fillRect(0, 0, width, height);
    }

    // Отрисовка поднимающихся сердец
    const count = 28;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 70 + (i % 7) * 25;
      const size = 22 + (i % 5) * 14;
      const xOffset = Math.sin(time * 1.5 + i * 1.7) * 45;
      const x = ((i * 127.3 + xOffset) % (width + 60)) - 30;
      const rawY = height - ((time * speed + i * 140) % (height + 120));
      const y = rawY;
      const alpha = Math.min(1, Math.max(0.15, Math.sin((y / height) * Math.PI) * 0.85));

      ctx.save();
      ctx.translate(x, y);
      const rot = Math.sin(time * 2 + i) * 0.25;
      ctx.rotate(rot);
      ctx.scale(size / 30, size / 30);
      ctx.globalAlpha = alpha;

      // Отрисовка векторного сердца через Bezier-кривые
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.bezierCurveTo(-15, -28, -32, -6, 0, 24);
      ctx.bezierCurveTo(32, -6, 15, -28, 0, -10);
      ctx.closePath();

      const hGrad = ctx.createLinearGradient(0, -20, 0, 24);
      hGrad.addColorStop(0, '#fb7185');
      hGrad.addColorStop(0.5, '#f43f5e');
      hGrad.addColorStop(1, '#be123c');
      ctx.fillStyle = hGrad;
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'flying-balloons') {
    // 5. Летающие праздничные воздушные шарики
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.5, '#1e293b');
    skyGrad.addColorStop(1, '#020617');
    if (!skipSolidBg) {
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
    }

    const balloonColors = ['#f43f5e', '#38bdf8', '#a855f7', '#fbbf24', '#34d399', '#f97316'];
    const balloonCount = 20;

    ctx.save();
    for (let i = 0; i < balloonCount; i++) {
      const speed = 90 + (i % 6) * 30;
      const radiusX = 26 + (i % 4) * 8;
      const radiusY = radiusX * 1.25;
      const xSway = Math.sin(time * 1.8 + i * 2.1) * 35;
      const x = ((i * 180 + xSway) % (width + 80)) - 40;
      const y = height - ((time * speed + i * 210) % (height + 250));
      const col = balloonColors[i % balloonColors.length];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(time * 1.5 + i) * 0.12);

      // Шарик (эллипс)
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.88;
      ctx.fill();

      // Блик на шарике
      ctx.beginPath();
      ctx.ellipse(-radiusX * 0.35, -radiusY * 0.35, radiusX * 0.25, radiusY * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      // Узелок снизу
      ctx.beginPath();
      ctx.moveTo(-5, radiusY);
      ctx.lineTo(5, radiusY);
      ctx.lineTo(0, radiusY + 8);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();

      // Ниточка от шарика
      ctx.beginPath();
      ctx.moveTo(0, radiusY + 8);
      const stringWave = Math.sin(time * 3 + i) * 8;
      ctx.quadraticCurveTo(stringWave, radiusY + 35, 0, radiusY + 65);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'stary-sky') {
    // 6. Звёздное небо с яркими мерцающими звездами и созвездиями
    const nightGrad = ctx.createRadialGradient(
      width / 2,
      height * 0.3,
      100,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    nightGrad.addColorStop(0, '#110e38');
    nightGrad.addColorStop(0.4, '#090821');
    nightGrad.addColorStop(0.8, '#030712');
    nightGrad.addColorStop(1, '#000000');
    if (!skipSolidBg) {
      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    // 70 звезд разной величины и мерцания
    for (let i = 0; i < 70; i++) {
      const sx = (i * 197.3) % width;
      const sy = (i * 311.9) % height;
      const pulse = Math.sin(time * 4 + i * 2.5) * 0.5 + 0.5;
      const isBigStar = i % 7 === 0;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.globalAlpha = 0.3 + pulse * 0.7;

      if (isBigStar) {
        // 4-лучевая сияющая звезда
        const r = 5 + pulse * 4;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, -r * 2);
        ctx.quadraticCurveTo(0, 0, r * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 2);
        ctx.quadraticCurveTo(0, 0, -r * 2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 1.2 + (i % 3) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = i % 4 === 0 ? '#fde047' : i % 3 === 0 ? '#93c5fd' : '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'gradient-smoke') {
    // 7. Разноцветный градиентный дым / неоновые вихри
    if (!skipSolidBg) {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    // Несколько плавающих цветных дымовых центров
    const smokePuffs = [
      { color: 'rgba(168, 85, 247, 0.45)', speed: 0.7, xMult: 0.3, yMult: 0.4, r: width * 0.6 },
      { color: 'rgba(236, 72, 153, 0.4)', speed: 0.9, xMult: 0.7, yMult: 0.3, r: width * 0.55 },
      { color: 'rgba(56, 189, 248, 0.4)', speed: 0.6, xMult: 0.5, yMult: 0.7, r: width * 0.65 },
      { color: 'rgba(34, 197, 94, 0.35)', speed: 0.8, xMult: 0.2, yMult: 0.8, r: width * 0.5 },
      { color: 'rgba(249, 115, 22, 0.35)', speed: 1.1, xMult: 0.8, yMult: 0.6, r: width * 0.55 },
    ];

    smokePuffs.forEach((puff, idx) => {
      const px = width * puff.xMult + Math.sin(time * puff.speed + idx) * (width * 0.25);
      const py = height * puff.yMult + Math.cos(time * puff.speed * 0.8 + idx * 1.5) * (height * 0.2);
      const rad = ctx.createRadialGradient(px, py, 20, px, py, puff.r);
      rad.addColorStop(0, puff.color);
      rad.addColorStop(0.6, puff.color.replace('0.', '0.1'));
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(px, py, puff.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else if (preset.id === 'cosmic-dark') {
    // Cosmic space gradient with twinkling stars
    if (!skipSolidBg) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Subtle star field
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5) % width);
      const sy = ((i * 243.1) % height);
      const twinkle = Math.sin(time * 3 + i) * 0.4 + 0.6;
      ctx.globalAlpha = twinkle * 0.65;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (preset.id === 'anecdote') {
    // 8. Анекдот: Летающие смеющиеся и хохочущие смайлики (😂, 🤣, 😆, 😹, 😜)
    const laughterBg = ctx.createLinearGradient(0, 0, 0, height);
    laughterBg.addColorStop(0, '#1e0538');
    laughterBg.addColorStop(0.5, '#3b0764');
    laughterBg.addColorStop(1, '#110224');
    if (!skipSolidBg) {
      ctx.fillStyle = laughterBg;
      ctx.fillRect(0, 0, width, height);
    }

    const laughEmojis = ['😂', '🤣', '😆', '😹', '😜', '😂', '🤣'];
    const count = 26;

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 75 + (i % 6) * 22;
      const size = 32 + (i % 5) * 14;
      const xSway = Math.sin(time * 2.1 + i * 1.8) * 45;
      const x = ((i * 145 + xSway) % (width + 80)) - 40;
      const y = height - ((time * speed + i * 160) % (height + 220));
      const emoji = laughEmojis[i % laughEmojis.length];
      const rot = Math.sin(time * 3 + i * 1.5) * 0.35;
      const bounce = 1 + Math.sin(time * 6 + i * 2) * 0.14;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.95));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(bounce, bounce);
      ctx.globalAlpha = alpha;
      ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 18;
      ctx.fillText(emoji, 0, 0);

      // Брызги смеха / звездочки
      if (i % 3 === 0) {
        ctx.fillStyle = '#fde047';
        ctx.font = `${Math.round(size * 0.45)}px sans-serif`;
        ctx.fillText('✨', size * 0.6, -size * 0.5);
      }
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'autumn') {
    // 9. Осень: Парящие золотые и багряные осенние листья
    const autumnBg = ctx.createLinearGradient(0, 0, 0, height);
    autumnBg.addColorStop(0, '#2a1104');
    autumnBg.addColorStop(0.5, '#451a03');
    autumnBg.addColorStop(1, '#180701');
    if (!skipSolidBg) {
      ctx.fillStyle = autumnBg;
      ctx.fillRect(0, 0, width, height);
    }

    const leafIcons = ['🍁', '🍂', '🍃'];
    const count = 30;

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 65 + (i % 7) * 24;
      const size = 26 + (i % 5) * 12;
      const xSway = Math.sin(time * 1.4 + i * 2.2) * 65 + Math.cos(time * 0.8 + i) * 30;
      const x = ((i * 135 + xSway) % (width + 80)) - 40;
      const y = ((time * speed + i * 150) % (height + 200)) - 50;
      const icon = leafIcons[i % leafIcons.length];
      const rot = Math.sin(time * 1.8 + i) * 0.6 + (time * 0.4);
      const flipScale = Math.sin(time * 2.5 + i * 1.3);
      const alpha = Math.min(1, Math.max(0.25, Math.sin((y / height) * Math.PI) * 0.95));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(Math.abs(flipScale) * 0.6 + 0.4, 1);
      ctx.globalAlpha = alpha;
      ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillText(icon, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'winter') {
    // 10. Зима: Парящие пушистые снежинки с морозным мерцанием
    const winterBg = ctx.createLinearGradient(0, 0, 0, height);
    winterBg.addColorStop(0, '#031926');
    winterBg.addColorStop(0.5, '#0a2e46');
    winterBg.addColorStop(1, '#020b12');
    if (!skipSolidBg) {
      ctx.fillStyle = winterBg;
      ctx.fillRect(0, 0, width, height);
    }

    const count = 48;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 45 + (i % 6) * 20;
      const size = 10 + (i % 6) * 5;
      const xSway = Math.sin(time * 1.2 + i * 1.7) * 35;
      const x = ((i * 115 + xSway) % (width + 60)) - 30;
      const y = ((time * speed + i * 120) % (height + 150)) - 30;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.9));
      const rot = time * 0.5 + i;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      if (i % 4 === 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#93c5fd';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.6;
        for (let ray = 0; ray < 6; ray++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, size);
          ctx.moveTo(0, size * 0.55);
          ctx.lineTo(size * 0.28, size * 0.8);
          ctx.moveTo(0, size * 0.55);
          ctx.lineTo(-size * 0.28, size * 0.8);
          ctx.stroke();
        }
      } else {
        const rad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 0.5);
        rad.addColorStop(0, '#ffffff');
        rad.addColorStop(0.5, 'rgba(224, 242, 254, 0.8)');
        rad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'music') {
    // 11. Музыка: Летающие светящиеся музыкальные ноты (🎵, 🎶, 🎼, ♪, ♫)
    const musicBg = ctx.createLinearGradient(0, 0, 0, height);
    musicBg.addColorStop(0, '#0a061c');
    musicBg.addColorStop(0.5, '#1e1445');
    musicBg.addColorStop(1, '#05030e');
    if (!skipSolidBg) {
      ctx.fillStyle = musicBg;
      ctx.fillRect(0, 0, width, height);
    }

    // Волновые звуковые линии
    ctx.save();
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      ctx.strokeStyle =
        wave === 0
          ? 'rgba(168, 85, 247, 0.22)'
          : wave === 1
          ? 'rgba(56, 189, 248, 0.18)'
          : 'rgba(236, 72, 153, 0.15)';
      for (let x = 0; x <= width; x += 20) {
        const y = height * (0.35 + wave * 0.18) + Math.sin(x * 0.008 + time * 2.5 + wave * 2) * 45;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    const noteIcons = ['🎵', '🎶', '🎼', '♪', '♫'];
    const colors = ['#c084fc', '#38bdf8', '#f472b6', '#a78bfa', '#facc15'];
    const count = 26;

    ctx.save();
    for (let i = 0; i < count; i++) {
      const speed = 75 + (i % 6) * 22;
      const size = 30 + (i % 5) * 12;
      const xSway = Math.sin(time * 1.8 + i * 1.5) * 40;
      const x = ((i * 135 + xSway) % (width + 80)) - 40;
      const y = height - ((time * speed + i * 160) % (height + 200));
      const icon = noteIcons[i % noteIcons.length];
      const col = colors[i % colors.length];
      const rot = Math.sin(time * 2 + i) * 0.25;
      const pulse = 1 + Math.sin(time * 4 + i) * 0.12;
      const alpha = Math.min(1, Math.max(0.2, Math.sin((y / height) * Math.PI) * 0.95));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = alpha;
      ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = col;
      ctx.shadowBlur = 22;
      ctx.fillText(icon, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  } else if (preset.id === 'disco') {
    // 12. Диско: Неоновый эквалайзер с танцующими полосами
    const discoBg = ctx.createLinearGradient(0, 0, 0, height);
    discoBg.addColorStop(0, '#09090f');
    discoBg.addColorStop(0.5, '#190a2a');
    discoBg.addColorStop(1, '#05020a');
    if (!skipSolidBg) {
      ctx.fillStyle = discoBg;
      ctx.fillRect(0, 0, width, height);
    }

    // Верхние диско-лучи
    ctx.save();
    for (let b = 0; b < 4; b++) {
      const beamX = width * (0.2 + b * 0.2) + Math.sin(time * 1.8 + b) * (width * 0.1);
      const beamGrad = ctx.createRadialGradient(beamX, 0, 10, beamX, height * 0.5, width * 0.35);
      const beamColor = b % 2 === 0 ? 'rgba(236, 72, 153, 0.16)' : 'rgba(6, 182, 212, 0.16)';
      beamGrad.addColorStop(0, beamColor);
      beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // Музыкальный эквалайзер
    const barCount = 28;
    const barWidth = Math.max(6, Math.floor(width / (barCount * 1.4)));
    const gap = Math.max(4, Math.floor(barWidth * 0.35));
    const totalEqWidth = barCount * (barWidth + gap);
    const startX = (width - totalEqWidth) / 2;
    const baseY = height * 0.88;
    const maxBarHeight = height * 0.45;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const freq1 = Math.sin(time * 8 + i * 0.7);
      const freq2 = Math.cos(time * 13 + i * 1.2);
      const freq3 = Math.sin(time * 4 + i * 0.3);
      const normHeight = Math.max(0.08, Math.min(1, freq1 * 0.4 + freq2 * 0.35 + freq3 * 0.25 + 0.55));
      const barH = normHeight * maxBarHeight;
      const bx = startX + i * (barWidth + gap);
      const by = baseY - barH;

      const barGrad = ctx.createLinearGradient(0, baseY, 0, baseY - maxBarHeight);
      barGrad.addColorStop(0, '#06b6d4');
      barGrad.addColorStop(0.4, '#10b981');
      barGrad.addColorStop(0.7, '#facc15');
      barGrad.addColorStop(0.9, '#f43f5e');
      barGrad.addColorStop(1, '#ec4899');

      ctx.fillStyle = barGrad;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillRect(bx, by, barWidth, barH);

      // Пиковый маркер над каждым столбцом
      const peakH = 4;
      const peakOffset = Math.sin(time * 5 + i * 0.5) * 6;
      const peakY = Math.max(baseY - maxBarHeight, by - 8 - Math.max(0, peakOffset));
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fillRect(bx, peakY, barWidth, peakH);

      // Отражение на глянцевом полу
      ctx.globalAlpha = 0.22;
      ctx.fillRect(bx, baseY + 6, barWidth, barH * 0.35);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  } else if (preset.id === 'lasers') {
    // 13. Лучи: Разноцветные лазерные лучи в клубящемся дыму
    if (!skipSolidBg) {
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, width, height);
    }

    // Клубящийся дым
    ctx.save();
    const smokeSpots = [
      { x: width * 0.3, y: height * 0.4, r: width * 0.55, c: 'rgba(56, 189, 248, 0.12)' },
      { x: width * 0.7, y: height * 0.5, r: width * 0.6, c: 'rgba(236, 72, 153, 0.12)' },
      { x: width * 0.5, y: height * 0.7, r: width * 0.5, c: 'rgba(168, 85, 247, 0.14)' },
    ];
    smokeSpots.forEach((s, idx) => {
      const sx = s.x + Math.sin(time * 0.8 + idx) * 40;
      const sy = s.y + Math.cos(time * 0.6 + idx) * 35;
      const g = ctx.createRadialGradient(sx, sy, 20, sx, sy, s.r);
      g.addColorStop(0, s.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Неоновые лазерные лучи
    const laserColors = [
      { glow: '#22c55e', originX: 0, originY: 0 },
      { glow: '#06b6d4', originX: width, originY: 0 },
      { glow: '#ec4899', originX: width * 0.5, originY: 0 },
      { glow: '#a855f7', originX: 0, originY: height * 0.2 },
      { glow: '#eab308', originX: width, originY: height * 0.2 },
      { glow: '#ef4444', originX: width * 0.5, originY: 0 },
    ];

    ctx.save();
    laserColors.forEach((laser, idx) => {
      const sweep = Math.sin(time * 1.5 + idx * 1.2);
      const targetX = width * (0.15 + (idx % 4) * 0.25) + sweep * (width * 0.35);
      const targetY = height + 50;

      // Широкий светящийся конус
      ctx.save();
      ctx.lineWidth = 14;
      ctx.strokeStyle = laser.glow;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(laser.originX, laser.originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Средний ореол
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = laser.glow;
      ctx.shadowColor = laser.glow;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(laser.originX, laser.originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Яркий белый сердечник луча
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(laser.originX, laser.originY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.restore();
    });

    // Искры и мерцающая пыль в лучах
    for (let i = 0; i < 35; i++) {
      const px = (i * 179.3 + time * 15) % width;
      const py = (i * 241.7 + time * 25) % height;
      const twinkle = Math.sin(time * 5 + i) * 0.5 + 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else {
    // Linear dynamic gradient (with custom color support)
    const angle = time * 0.1;
    const x1 = width / 2 + Math.cos(angle) * (width / 2);
    const y1 = height / 2 + Math.sin(angle) * (height / 2);
    const x2 = width / 2 - Math.cos(angle) * (width / 2);
    const y2 = height / 2 - Math.sin(angle) * (height / 2);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    let colors = preset.colors;
    if (state.bgCustomColor && preset.type === 'gradient') {
      colors = [state.bgCustomColor, ...preset.colors.slice(1)];
    }
    colors.forEach((col, idx) => {
      grad.addColorStop(idx / (colors.length - 1), col);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

interface TextLayoutResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  totalHeight: number;
  maxLineWidth: number;
}

function calculateTextLayout(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number,
  maxHeight: number,
  baseFontSize: number,
  fontFamily: string,
  isUppercase: boolean
): TextLayoutResult {
  const text = isUppercase ? rawText.toUpperCase() : rawText;
  let fontSize = baseFontSize;
  const minFontSize = 24;

  while (fontSize >= minFontSize) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 1.28;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    let isTooWide = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = ctx.measureText(word).width;
      if (wordWidth > maxWidth) {
        isTooWide = true;
        break;
      }

      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    const totalHeight = lines.length * lineHeight;

    if (!isTooWide && totalHeight <= maxHeight) {
      let maxLineWidth = 0;
      lines.forEach((l) => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });

      return {
        lines,
        fontSize,
        lineHeight,
        totalHeight,
        maxLineWidth,
      };
    }

    fontSize = Math.floor(fontSize * 0.9);
  }

  // Fallback if very tight or long unbroken word
  ctx.font = `bold ${minFontSize}px ${fontFamily}`;
  const lineHeight = minFontSize * 1.25;
  const rawWords = text.split(/\s+/);
  const fallbackLines: string[] = [];
  let cur = '';

  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    if (ctx.measureText(w).width > maxWidth) {
      // Chunk the word
      if (cur) {
        fallbackLines.push(cur);
        cur = '';
      }
      let chunk = '';
      for (const ch of w) {
        if (ctx.measureText(chunk + ch).width > maxWidth) {
          fallbackLines.push(chunk);
          chunk = ch;
        } else {
          chunk += ch;
        }
      }
      if (chunk) cur = chunk;
    } else {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && cur) {
        fallbackLines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
  }
  if (cur) fallbackLines.push(cur);

  let maxW = 0;
  fallbackLines.forEach((l) => {
    const w = ctx.measureText(l).width;
    if (w > maxW) maxW = w;
  });

  return {
    lines: fallbackLines.length > 0 ? fallbackLines : [text.slice(0, 30)],
    fontSize: minFontSize,
    lineHeight,
    totalHeight: (fallbackLines.length || 1) * lineHeight,
    maxLineWidth: Math.min(maxWidth, maxW || maxWidth),
  };
}

function drawTextSegment({
  ctx,
  segment,
  state,
  currentTime,
  canvasWidth,
  canvasHeight,
  isLastSegment = false,
  isDraggingText = false,
}: {
  ctx: CanvasRenderingContext2D;
  segment: { text: string; words: string[]; startTime: number; endTime: number; duration: number };
  state: VideoProjectState;
  currentTime: number;
  canvasWidth: number;
  canvasHeight: number;
  isLastSegment?: boolean;
  isDraggingText?: boolean;
}) {
  // Safe margins strictly 25px on all 4 borders
  const safeMarginX = 25;
  const safeMarginY = 25;
  const targetWidthPercent = state.textMaxWidthPercent ?? 85;
  const maxAllowedWidth = Math.max(120, canvasWidth - safeMarginX * 2);
  const maxWidth = Math.max(120, Math.min(maxAllowedWidth, (canvasWidth * targetWidthPercent) / 100));
  const maxHeight = Math.max(100, canvasHeight - safeMarginY * 2);

  // Calculate layout
  const layout = calculateTextLayout(
    ctx,
    segment.text,
    maxWidth,
    maxHeight,
    state.fontSize,
    state.fontFamily,
    state.isUppercase
  );

  const elapsed = Math.max(0, currentTime - segment.startTime);
  const effectiveSpeed = Math.max(0.1, Math.min(3.0, state.speedMultiplier));
  const { speedFactor, wordDuration } = getEffectiveSpeed(effectiveSpeed);

  // Speed-based animation duration calculations:
  let animDuration: number;
  if (state.animationStyle === 'typewriter') {
    const s = Math.max(0.1, Math.min(3.0, effectiveSpeed));
    const t = (s - 0.1) / 2.9;
    const charsPerSec = (1 / 3.0) + t * (43.48 - (1 / 3.0));
    const totalChars = Math.max(1, segment.text.trim().length);
    animDuration = Math.max(0.15, totalChars / charsPerSec);
  } else if (state.animationStyle === 'words') {
    const totalWords = Math.max(1, segment.words.length);
    animDuration = Math.max(0.15, totalWords * wordDuration);
  } else if (state.animationStyle === 'glitch') {
    animDuration = Math.min(1.5, Math.max(0.15, 0.65 / speedFactor));
  } else {
    animDuration = Math.min(1.5, Math.max(0.15, 0.65 / speedFactor));
  }

  // Ensure animDuration does not exceed segment duration
  animDuration = Math.min(animDuration, Math.max(0.15, segment.duration * 0.95));

  const progress = Math.min(1, elapsed / animDuration);

  // Author details (displayed ONLY on the final phrase, word, or sentence of the quote)
  const rawAuthor = state.authorText ? state.authorText.trim() : '';
  const hasAuthor = isLastSegment && rawAuthor.length > 0;
  const authorFontSize = Math.max(28, Math.min(84, Math.round(layout.fontSize * 0.80)));
  const authorGap = Math.max(30, Math.round(layout.fontSize * 0.40 + layout.lineHeight * 0.4));
  const authorHeight = hasAuthor ? authorGap + authorFontSize * 1.25 : 0;
  const totalCombinedHeight = layout.totalHeight + authorHeight;

  // Measure author width if present
  let authorWidth = 0;
  const authorStr = hasAuthor
    ? (rawAuthor.startsWith('—') || rawAuthor.startsWith('-') ? rawAuthor : `— ${rawAuthor}`)
    : '';
  if (hasAuthor) {
    ctx.save();
    ctx.font = `italic 600 ${authorFontSize}px 'Playfair Display', 'Caveat', 'Montserrat', Georgia, serif`;
    authorWidth = ctx.measureText(authorStr).width;
    ctx.restore();
  }

  const blockWidth = Math.min(maxWidth, Math.max(layout.maxLineWidth, authorWidth));

  // Horizontal block placement strictly within [safeMarginX, canvasWidth - safeMarginX]
  const minBlockLeft = safeMarginX;
  const maxBlockLeft = Math.max(safeMarginX, canvasWidth - safeMarginX - blockWidth);

  let blockLeft = safeMarginX;
  if (typeof state.textPositionX === 'number' && Number.isFinite(state.textPositionX)) {
    const normX = Math.max(0, Math.min(100, state.textPositionX)) / 100;
    blockLeft = minBlockLeft + (maxBlockLeft - minBlockLeft) * normX;
  } else if (state.textAlign === 'center') {
    blockLeft = minBlockLeft + (maxBlockLeft - minBlockLeft) * 0.5;
  } else if (state.textAlign === 'right') {
    blockLeft = maxBlockLeft;
  } else {
    blockLeft = minBlockLeft;
  }

  const blockRight = blockLeft + blockWidth;
  const blockCenter = blockLeft + blockWidth / 2;

  // Vertical block placement strictly within [safeMarginY, canvasHeight - safeMarginY]
  const minBlockTop = safeMarginY;
  const maxBlockTop = Math.max(safeMarginY, canvasHeight - safeMarginY - totalCombinedHeight);

  let blockTop = safeMarginY;
  if (typeof state.textPositionY === 'number' && Number.isFinite(state.textPositionY)) {
    const normY = Math.max(0, Math.min(100, state.textPositionY)) / 100;
    blockTop = minBlockTop + (maxBlockTop - minBlockTop) * normY;
  } else if (state.textPosition === 'top') {
    blockTop = minBlockTop;
  } else if (state.textPosition === 'bottom') {
    blockTop = maxBlockTop;
  } else {
    blockTop = minBlockTop + (maxBlockTop - minBlockTop) * 0.5;
  }

  const startY = blockTop + layout.fontSize * 0.88;
  const textCenterY = blockTop + totalCombinedHeight / 2;
  const textCenterX = blockCenter;

  const bounds = {
    x: blockLeft,
    y: blockTop,
    width: blockWidth,
    height: totalCombinedHeight,
  };

  ctx.save();

  // Animation Transformations
  let alpha = 1;
  let offsetY = 0;
  let scale = 1;
  let blockShiftX = 0;
  let blockShiftY = 0;
  let blockRotate = 0;

  switch (state.animationStyle) {
    case 'fade':
      alpha = easeOutCubic(progress);
      break;
    case 'slide':
      alpha = easeOutCubic(progress);
      offsetY = (1 - easeOutCubic(progress)) * 60;
      break;
    case 'zoom':
      alpha = easeOutCubic(progress);
      scale = 0.35 + 0.65 * easeOutBack(progress);
      break;
    case 'glitch': {
      const baseAlpha = easeOutCubic(progress);
      const flickerPulse = Math.sin(currentTime * 75) * Math.cos(currentTime * 43);
      const isStutterDip = progress < 0.8 && flickerPulse < -0.3;
      alpha = isStutterDip ? baseAlpha * 0.35 : baseAlpha;

      if (progress < 1) {
        offsetY = Math.sin(currentTime * 65) * 3 * (1 - progress);
      }
      break;
    }
    case 'bounce': {
      // 🏓 DVD-рикошет: блок текста летит по экрану и отскакивает от границ
      alpha = 1;
      const margin = 40;
      const travelSpanX = Math.max(30, canvasWidth - blockWidth - margin * 2);
      const travelSpanY = Math.max(30, canvasHeight - totalCombinedHeight - margin * 2 - 100);
      const speedX = 220;
      const speedY = 160;
      const cycleX = (currentTime * speedX) % (travelSpanX * 2);
      const cycleY = (currentTime * speedY) % (travelSpanY * 2);
      const bouncePosX = margin + (cycleX > travelSpanX ? travelSpanX * 2 - cycleX : cycleX);
      const bouncePosY = margin + 50 + (cycleY > travelSpanY ? travelSpanY * 2 - cycleY : cycleY);
      blockShiftX = bouncePosX - blockLeft;
      blockShiftY = bouncePosY - blockTop;
      break;
    }
    case 'curves': {
      // 🎢 Полёт по кривым Лиссажу с виражным наклоном
      alpha = 1;
      const ampX = Math.min(canvasWidth * 0.34, (canvasWidth - blockWidth) * 0.45);
      const ampY = Math.min(canvasHeight * 0.24, (canvasHeight - totalCombinedHeight) * 0.4);
      const cX = Math.sin(currentTime * 1.5) * ampX;
      const cY = Math.sin(currentTime * 3.0) * ampY;
      blockShiftX = cX;
      blockShiftY = cY;

      const vx = Math.cos(currentTime * 1.5) * 1.5 * ampX;
      const vy = Math.cos(currentTime * 3.0) * 3.0 * ampY;
      blockRotate = Math.atan2(vy, vx) * 0.08;
      break;
    }
    case 'stomp': {
      // ⚡ Кинетический штамп / Ударное появление
      const stompProg = Math.min(1, progress * 2.2);
      scale = 1 + (1 - easeOutBack(stompProg)) * 2.6;
      alpha = Math.min(1, stompProg * 3);
      if (stompProg > 0.35 && stompProg < 0.7) {
        offsetY = Math.sin(currentTime * 80) * 8 * (1 - (stompProg - 0.35) / 0.35);
      }
      break;
    }
    case 'fall': {
      // ⬇️ Обратный зум: падение огромных букв с кинетическим ударом
      const fallProg = Math.min(1, progress * 1.8);
      scale = 1 + (1 - easeOutBack(fallProg)) * 3.5;
      offsetY = -(1 - easeOutCubic(fallProg)) * (canvasHeight * 0.42);
      alpha = Math.min(1, fallProg * 2.8);
      break;
    }
    case 'blur': {
      // 🔮 Фокус из размытых светящихся боке-пятен в резкий текст
      const blurProg = Math.min(1, progress * 1.6);
      alpha = Math.min(1, blurProg * 2.2);
      scale = 0.94 + 0.06 * easeOutCubic(blurProg);
      break;
    }
    case 'swarm': {
      // 🌌 Рой мерцающих светлячков и искр, конденсирующийся в буквы
      const swarmProg = Math.min(1, progress * 1.5);
      alpha = Math.min(1, swarmProg * 2.0);
      scale = 0.88 + 0.12 * easeOutBack(swarmProg);
      break;
    }
    case 'assemble':
    case 'disperse':
    case 'tumble':
    case 'wave':
      alpha = 1;
      break;
    case 'words':
      break;
    case 'typewriter':
      break;
  }

  // Secondary Effects: Glow Pulse
  if (state.effects.glow) {
    const pulse = Math.sin(currentTime * 6) * 0.25 + 0.85;
    alpha *= pulse;
  }

  // Apply matrix translation & scaling around center of text
  ctx.translate(canvasWidth / 2 + blockShiftX, textCenterY + offsetY + blockShiftY);
  if (blockRotate !== 0) ctx.rotate(blockRotate);
  ctx.scale(scale, scale);
  ctx.translate(-canvasWidth / 2 - blockShiftX, -(textCenterY + offsetY + blockShiftY));

  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Render Background Plate / Plashka if enabled
  if (state.textBgEnabled) {
    const bgOpacity = state.textBgOpacity ?? 0.85;
    const bgPadding = state.textBgPadding ?? 20;
    const bgRadius = state.textBgRadius ?? 18;
    const bgColor = state.textBgColor || '#0070f3';

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha * bgOpacity));
    ctx.fillStyle = bgColor;

    const plateX = blockLeft + blockShiftX - bgPadding;
    const plateY = blockTop + blockShiftY - bgPadding;
    const plateW = blockWidth + bgPadding * 2;
    const plateH = totalCombinedHeight + bgPadding * 2;

    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(plateX, plateY, plateW, plateH, bgRadius);
    } else {
      const r = Math.min(bgRadius, plateW / 2, plateH / 2);
      ctx.moveTo(plateX + r, plateY);
      ctx.arcTo(plateX + plateW, plateY, plateX + plateW, plateY + plateH, r);
      ctx.arcTo(plateX + plateW, plateY + plateH, plateX, plateY + plateH, r);
      ctx.arcTo(plateX, plateY + plateH, plateX, plateY, r);
      ctx.arcTo(plateX, plateY, plateX + plateW, plateY, r);
      ctx.closePath();
    }
    ctx.fill();

    // Subtle drop shadow under plashka badge
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    ctx.restore();
  }

  // Draw Bounding Box & 4 Corner Nodes when user is actively dragging or adjusting text position
  if (isDraggingText) {
    ctx.save();
    const pad = (state.textBgEnabled ? (state.textBgPadding ?? 20) : 12) + 4;
    const bx = blockLeft + blockShiftX - pad;
    const by = blockTop + blockShiftY - pad;
    const bw = blockWidth + pad * 2;
    const bh = totalCombinedHeight + pad * 2;

    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(bx, by, bw, bh);

    // Corner nodes
    const corners = [
      { x: bx, y: by },
      { x: bx + bw, y: by },
      { x: bx, y: by + bh },
      { x: bx + bw, y: by + bh },
    ];

    corners.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    ctx.restore();
  }

  ctx.font = `bold ${layout.fontSize}px ${state.fontFamily}`;
  ctx.textAlign = state.textAlign;
  ctx.textBaseline = 'alphabetic';

  // Apply user text opacity multiplier
  const userTextOpacity = Math.max(0.05, Math.min(1, state.textOpacity ?? 1.0));
  alpha *= userTextOpacity;

  // Apply Shadow effect if enabled
  if (state.effects.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 12;
    ctx.shadowBlur = 24;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Determine what text to draw for typewriter or word-by-word
  let linesToDraw = layout.lines;

  if (state.animationStyle === 'typewriter') {
    const fullCombined = layout.lines.join(' ');
    const charCount = Math.floor(fullCombined.length * progress);
    const visibleCombined = fullCombined.slice(0, charCount);

    const showCursor = Math.sin(currentTime * 12) > 0;
    const withCursor = visibleCombined + (showCursor && progress < 1 ? ' |' : '');

    linesToDraw = [];
    let remaining = withCursor;
    for (let i = 0; i < layout.lines.length; i++) {
      const lineLen = layout.lines[i].length;
      if (remaining.length <= 0) break;
      const lineSlice = remaining.slice(0, lineLen);
      linesToDraw.push(lineSlice);
      remaining = remaining.slice(lineLen).trimStart();
    }
  } else if (state.animationStyle === 'words') {
    const allWords = segment.words;
    const wordCount = Math.max(1, Math.ceil(allWords.length * progress));
    const activeWordsList = allWords.slice(0, wordCount).map((w) =>
      state.isUppercase ? w.toUpperCase() : w
    );

    const joined = activeWordsList.join(' ');
    linesToDraw = [];
    let rem = joined;
    for (let i = 0; i < layout.lines.length; i++) {
      const lineLen = layout.lines[i].length;
      if (rem.length <= 0) break;
      linesToDraw.push(rem.slice(0, lineLen));
      rem = rem.slice(lineLen).trimStart();
    }
  }

  const isPerCharAnimation =
    state.animationStyle === 'assemble' ||
    state.animationStyle === 'disperse' ||
    state.animationStyle === 'tumble' ||
    state.animationStyle === 'wave' ||
    state.animationStyle === 'fall' ||
    state.animationStyle === 'blur' ||
    state.animationStyle === 'swarm';

  const isMultiColorMode =
    state.textColorMode === 'letter-rainbow' ||
    state.textColorMode === 'word-rainbow' ||
    state.textColorMode === 'letter-random' ||
    state.textColorMode === 'word-random' ||
    state.textColorMode === 'gradient';

  let globalCharOffset = 0;
  let globalWordIndex = 0;

  // Draw lines of main text
  linesToDraw.forEach((line, index) => {
    const lineY = startY + index * layout.lineHeight + offsetY + blockShiftY;
    let lineX = blockCenter + blockShiftX;
    if (state.textAlign === 'left') {
      lineX = blockLeft + blockShiftX;
    } else if (state.textAlign === 'right') {
      lineX = blockRight + blockShiftX;
    } else {
      lineX = blockCenter + blockShiftX;
    }

    // Glitch / Electric Jitter calculations
    let glitchJitterX = 0;
    let glitchJitterY = 0;
    let glitchIntensity = 0;

    if (state.animationStyle === 'glitch') {
      const entranceSurge = Math.max(0, 1 - progress) * 1.6;
      const cycle = (currentTime * 0.62) % 1;
      const isPeriodicSurge = cycle < 0.15;
      const periodicSurge = isPeriodicSurge
        ? Math.sin((cycle / 0.15) * Math.PI) * 0.95
        : 0;

      const ambientBuzz = Math.sin(currentTime * 35 + index * 4) > 0.9 ? 0.35 : 0.08;
      glitchIntensity = Math.max(entranceSurge, periodicSurge, ambientBuzz);

      if (glitchIntensity > 0.04) {
        const freq = currentTime * 95 + index * 21;
        glitchJitterX = (Math.sin(freq) * 0.7 + Math.cos(freq * 1.5) * 0.5) * 10 * glitchIntensity;
        glitchJitterY = (Math.sin(freq * 1.3) * 0.4) * 4 * glitchIntensity;
      }
    }

    const drawLineX = lineX + glitchJitterX;
    const drawLineY = lineY + glitchJitterY;
    const textMetrics = ctx.measureText(line);
    const lineWidth = textMetrics.width;

    let lineStartX = drawLineX;
    if (state.textAlign === 'center') lineStartX = drawLineX - lineWidth / 2;
    else if (state.textAlign === 'right') lineStartX = drawLineX - lineWidth;

    // Line fill resolution (Gradient or Solid)
    let lineFillStyle: string | CanvasGradient = state.textColor;
    if (state.textColorMode === 'gradient') {
      const c1 = state.textGradientColors?.[0] || state.textColor || '#f43f5e';
      const c2 = state.textGradientColors?.[1] || state.neonColor || '#38bdf8';
      const angle = state.textGradientAngle ?? 45;
      lineFillStyle = createAngleGradient(
        ctx,
        lineStartX,
        drawLineY - layout.fontSize * 0.85,
        lineWidth,
        layout.fontSize,
        angle,
        c1,
        c2
      );
    }

    // Chromatic RGB Aberration (Помехи)
    if (state.animationStyle === 'glitch' && glitchIntensity > 0.08) {
      const splitDist = Math.max(1.5, glitchIntensity * 5.5);
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 0.42));
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(line, drawLineX - splitDist, drawLineY - splitDist * 0.35);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(line, drawLineX + splitDist, drawLineY + splitDist * 0.35);
      ctx.restore();
    }

    // Neon effect multi-pass
    if (state.effects.neon) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.shadowColor = state.neonColor || '#a855f7';
      ctx.shadowBlur = 35;
      ctx.strokeStyle = state.neonColor || '#a855f7';
      ctx.lineWidth = Math.max(4, state.strokeWidth + 4);
      ctx.strokeText(line, drawLineX, drawLineY);

      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeText(line, drawLineX, drawLineY);
      ctx.restore();
    }

    // Standard Stroke or Smart Shadow on Light Backgrounds
    const isLightPreset = state.bgPresetId === 'clean-white' || state.bgPresetId === 'notebook-grid' || state.bgPresetId === 'old-parchment';
    const isLightTextColor = state.textColor.toLowerCase() === '#ffffff' || state.textColor.toLowerCase() === '#fff' || state.textColor.toLowerCase() === '#fefefe';

    if (state.strokeEnabled && !state.effects.neon && !isPerCharAnimation) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.strokeStyle = state.strokeColor;
      ctx.lineWidth = state.strokeWidth;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(line, drawLineX, drawLineY);
      ctx.restore();
    } else if (isLightPreset && isLightTextColor && !state.effects.neon && !isPerCharAnimation) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, drawLineX, drawLineY);
      ctx.restore();
    }

    // Glow pulse shadow or Electric surge aura
    if (state.effects.glow) {
      ctx.shadowColor = state.textColor;
      ctx.shadowBlur = 25;
    } else if (state.animationStyle === 'glitch' && glitchIntensity > 0.4) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
    }

    // Render characters: either detailed per-character transform loop OR single line pass
    if (isPerCharAnimation || state.textColorMode === 'letter-rainbow' || state.textColorMode === 'word-rainbow') {
      ctx.save();
      let runningCharX = 0;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === ' ') {
          globalWordIndex++;
        }
        const charWidth = ctx.measureText(char).width;
        const targetCharCenterX = lineStartX + runningCharX + charWidth / 2;
        const targetCharY = drawLineY;

        let charOffsetX = 0;
        let charOffsetY = 0;
        let charRot = 0;
        let charScale = 1;
        let charAlpha = 1;

        const charIdx = globalCharOffset + c;

        // Determine Color for this character
        let charFill: string | CanvasGradient = lineFillStyle;
        if (state.textColorMode === 'letter-rainbow') {
          charFill = RAINBOW_LETTER_PALETTE[charIdx % RAINBOW_LETTER_PALETTE.length];
        } else if (state.textColorMode === 'word-rainbow') {
          charFill = RAINBOW_LETTER_PALETTE[globalWordIndex % RAINBOW_LETTER_PALETTE.length];
        } else if (state.textColorMode === 'letter-random') {
          charFill = getChaoticColor(charIdx, state.proceduralSeed || 42);
        } else if (state.textColorMode === 'word-random') {
          charFill = getChaoticColor(globalWordIndex, (state.proceduralSeed || 42) + 7);
        }

        if (state.animationStyle === 'assemble') {
          // 🧩 Магнитная сборка: буквы летят с краев экрана в центр
          const seed = charIdx * 37 + index * 59;
          const startAngle = ((seed % 360) * Math.PI) / 180;
          const startDist = Math.max(canvasWidth, canvasHeight) * (0.6 + (seed % 40) * 0.01);
          const startXOff = Math.cos(startAngle) * startDist;
          const startYOff = Math.sin(startAngle) * startDist;
          const startSpin = (((seed % 80) / 40) - 1) * Math.PI * 3;

          const charDelay = (c / Math.max(1, line.length)) * 0.35;
          const charProg = Math.max(0, Math.min(1, (progress - charDelay) / 0.65));
          const ease = easeOutBack(charProg);
          const easeRot = easeOutCubic(charProg);

          charOffsetX = startXOff * (1 - ease);
          charOffsetY = startYOff * (1 - ease);
          charRot = startSpin * (1 - easeRot);
          charAlpha = Math.min(1, charProg * 3);
        } else if (state.animationStyle === 'disperse') {
          // 💥 Разлёт / Распад букв с медленным кувырканием
          const disperseProg = Math.max(0, (progress - 0.45) / 0.55);
          if (disperseProg > 0) {
            const ease = easeOutCubic(disperseProg);
            const seed = charIdx * 43 + index * 67;
            const angle = ((seed % 360) * Math.PI) / 180;
            const dist = ease * (canvasWidth * 0.75 + (seed % 100));
            charOffsetX = Math.cos(angle) * dist;
            charOffsetY = Math.sin(angle) * dist + ease * 140;
            charRot = ease * (((seed % 12) - 6) * 1.2);
            charAlpha = Math.max(0, 1 - ease * 1.2);
          }
        } else if (state.animationStyle === 'tumble') {
          // 🌪️ Невесомость и кувыркание букв
          const charSeed = charIdx * 0.85;
          charOffsetY = Math.sin(currentTime * 3.2 + charSeed) * (layout.fontSize * 0.18);
          charOffsetX = Math.cos(currentTime * 2.0 + charSeed) * (layout.fontSize * 0.08);
          charRot = Math.sin(currentTime * 2.5 + charSeed) * 0.22;
          charScale = 1 + Math.sin(currentTime * 2.8 + charSeed) * 0.08;
        } else if (state.animationStyle === 'wave') {
          // 🌊 Бегущая волна по буквам
          charOffsetY = Math.sin(currentTime * 6.5 + charIdx * 0.45) * (layout.fontSize * 0.26);
          charRot = Math.cos(currentTime * 6.5 + charIdx * 0.45) * 0.08;
        } else if (state.animationStyle === 'fall') {
          // ⬇️ Обратный зум: падение огромных букв с кинетическим ударом
          const charDelay = (c / Math.max(1, line.length)) * 0.35;
          const charProg = Math.max(0, Math.min(1, (progress - charDelay) / 0.65));
          const fallEase = easeOutBack(charProg);
          charScale = 1 + (1 - fallEase) * 2.8;
          charOffsetY = -(1 - easeOutCubic(charProg)) * (layout.fontSize * 2.2);
          charAlpha = Math.min(1, charProg * 3.0);
        } else if (state.animationStyle === 'blur') {
          // 🔮 Фокус из размытых светящихся боке-пятен в резкий текст
          const charDelay = (c / Math.max(1, line.length)) * 0.3;
          const charProg = Math.max(0, Math.min(1, (progress - charDelay) / 0.7));
          const blurAmt = 1 - easeOutCubic(charProg);
          charScale = 1 + blurAmt * 0.35;
          charAlpha = 0.2 + (1 - blurAmt) * 0.8;
          if (blurAmt > 0.05) {
            ctx.save();
            ctx.shadowColor = (charFill as string) || state.textColor;
            ctx.shadowBlur = blurAmt * 35;
            ctx.fillStyle = (charFill as string) || state.textColor;
            ctx.globalAlpha = blurAmt * 0.45;
            ctx.beginPath();
            ctx.arc(
              targetCharCenterX + charOffsetX,
              targetCharY + charOffsetY - layout.fontSize * 0.35,
              blurAmt * (layout.fontSize * 0.4),
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
          }
        } else if (state.animationStyle === 'swarm') {
          // 🌌 Рой мерцающих пылинок и светлячков, конденсирующийся в буквы
          const charDelay = (c / Math.max(1, line.length)) * 0.35;
          const charProg = Math.max(0, Math.min(1, (progress - charDelay) / 0.65));
          const swarmDist = (1 - easeOutCubic(charProg)) * (layout.fontSize * 2.0);
          charAlpha = Math.min(1, charProg * 2.5);
          if (charProg < 1 && char !== ' ') {
            const numMotes = 8;
            for (let m = 0; m < numMotes; m++) {
              const mAngle = (m * Math.PI * 2) / numMotes + currentTime * 6 + charIdx * 1.5;
              const mDist = swarmDist * (0.4 + (m % 3) * 0.3);
              const mx = targetCharCenterX + Math.cos(mAngle) * mDist;
              const my = targetCharY - layout.fontSize * 0.35 + Math.sin(mAngle) * mDist;
              const mSize = Math.max(2, layout.fontSize * 0.045);
              ctx.save();
              ctx.fillStyle = m % 2 === 0 ? ((charFill as string) || state.textColor) : '#ffffff';
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 8;
              ctx.globalAlpha = (1 - charProg) * 0.85;
              ctx.beginPath();
              ctx.arc(mx, my, mSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }

        ctx.save();
        ctx.translate(targetCharCenterX + charOffsetX, targetCharY + charOffsetY);
        if (charRot !== 0) ctx.rotate(charRot);
        if (charScale !== 1) ctx.scale(charScale, charScale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha * charAlpha));

        // Stroke per char
        if (state.strokeEnabled && !state.effects.neon) {
          ctx.save();
          ctx.strokeStyle = state.strokeColor;
          ctx.lineWidth = state.strokeWidth;
          ctx.lineJoin = 'round';
          ctx.strokeText(char, -charWidth / 2, 0);
          ctx.restore();
        }

        ctx.fillStyle = charFill;
        ctx.fillText(char, -charWidth / 2, 0);
        ctx.restore();

        runningCharX += charWidth;
      }
      ctx.restore();
    } else {
      // Main fast single text fill
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = lineFillStyle;
      ctx.fillText(line, drawLineX, drawLineY);
      ctx.restore();
    }

    globalCharOffset += line.length;

    // Electric charge running across the letters ("как будто по нему пробегает электрический заряд")
    if (state.animationStyle === 'glitch' && (progress < 1 || glitchIntensity > 0.3)) {
      ctx.save();
      const textMetrics = ctx.measureText(line);
      const lineWidth = textMetrics.width;
      if (lineWidth > 10) {
        // Charge traveling across text width
        const chargePhase = ((currentTime * 2.2 + index * 0.35) % 1);
        let chargeStart = drawLineX;
        if (state.textAlign === 'center') chargeStart = drawLineX - lineWidth / 2;
        else if (state.textAlign === 'right') chargeStart = drawLineX - lineWidth;

        const chargeX = chargeStart + lineWidth * chargePhase;
        const chargeY = drawLineY - layout.fontSize * 0.35;

        // Glowing plasma spark
        const chargeRadius = Math.max(18, layout.fontSize * 0.65);
        const electricGrad = ctx.createRadialGradient(
          chargeX,
          chargeY,
          1,
          chargeX,
          chargeY,
          chargeRadius
        );
        electricGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        electricGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.85)');
        electricGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.3)');
        electricGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = electricGrad;
        ctx.beginPath();
        ctx.arc(chargeX, chargeY, chargeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Electric lightning zig-zag arc
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const arcSpan = Math.min(45, lineWidth * 0.25);
        const arcNoise = Math.sin(currentTime * 110 + index * 7);
        ctx.moveTo(chargeX - arcSpan, chargeY + arcNoise * 4);
        ctx.lineTo(chargeX - arcSpan * 0.3, chargeY - arcNoise * 4);
        ctx.lineTo(chargeX + arcSpan * 0.3, chargeY + arcNoise * 3);
        ctx.lineTo(chargeX + arcSpan, chargeY - arcNoise * 4);
        ctx.stroke();

        // Horizontal scanline interference slice
        if (glitchIntensity > 0.55) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          const sliceY = chargeY + (arcNoise * layout.fontSize * 0.3);
          ctx.fillRect(chargeStart, sliceY, lineWidth, 2);
        }
      }
      ctx.restore();
    }

    // Particles assembling letters/words from flying pixels
    if (state.effects.particles && line.length > 0) {
      ctx.save();
      const lineLen = line.length;
      const fullTextLen = Math.max(1, layout.lines.join('').length);
      let charOffset = 0;
      for (let prevIdx = 0; prevIdx < index; prevIdx++) {
        charOffset += layout.lines[prevIdx].length;
      }

      const totalLineWidth = ctx.measureText(line).width;
      let startCharX = drawLineX;
      if (state.textAlign === 'center') startCharX = drawLineX - totalLineWidth / 2;
      else if (state.textAlign === 'right') startCharX = drawLineX - totalLineWidth;

      let runningWidth = 0;
      for (let c = 0; c < lineLen; c++) {
        const char = line[c];
        const charWidth = ctx.measureText(char).width;
        if (char !== ' ') {
          const charCenterX = startCharX + runningWidth + charWidth / 2;
          const charCenterY = drawLineY - layout.fontSize * 0.35;
          const globalCharIdx = charOffset + c;

          const charAppearRatio = globalCharIdx / fullTextLen;
          const assembleProg = Math.max(0, Math.min(1, (progress - charAppearRatio * 0.75) / 0.25));

          if (assembleProg < 1) {
            const scatterDist = (1 - easeOutCubic(assembleProg)) * (layout.fontSize * 1.3);
            const numSparks = 6;
            for (let s = 0; s < numSparks; s++) {
              const sparkSeed = (globalCharIdx * 23 + s * 41);
              const angle = (s * Math.PI * 2 / numSparks) + (1 - assembleProg) * 4.5 + Math.sin(currentTime * 8 + sparkSeed);
              const px = charCenterX + Math.cos(angle) * scatterDist * (0.6 + (s % 3) * 0.3);
              const py = charCenterY + Math.sin(angle) * scatterDist * (0.6 + ((s + 1) % 3) * 0.3);
              const pAlpha = (1 - assembleProg) * (0.45 + Math.sin(currentTime * 12 + s) * 0.35);
              const pSize = Math.max(2.5, layout.fontSize * 0.052);

              ctx.globalAlpha = Math.max(0, Math.min(1, alpha * pAlpha));
              ctx.fillStyle = s % 2 === 0 ? state.textColor : '#38bdf8';
              ctx.shadowColor = s % 2 === 0 ? state.textColor : '#38bdf8';
              ctx.shadowBlur = 6;
              ctx.fillRect(px - pSize / 2, py - pSize / 2, pSize, pSize);
            }
          } else {
            if (globalCharIdx % 3 === 0) {
              const moteTime = currentTime * 2.2 + globalCharIdx * 0.8;
              const mx = charCenterX + Math.sin(moteTime) * (layout.fontSize * 0.22);
              const my = charCenterY + Math.cos(moteTime * 0.7) * (layout.fontSize * 0.25) - 4;
              const mAlpha = 0.25 + 0.35 * Math.sin(moteTime * 1.6);
              const mSize = Math.max(2, layout.fontSize * 0.038);

              ctx.globalAlpha = Math.max(0, Math.min(1, alpha * mAlpha));
              ctx.fillStyle = globalCharIdx % 2 === 0 ? state.textColor : '#38bdf8';
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 5;
              ctx.fillRect(mx - mSize / 2, my - mSize / 2, mSize, mSize);
            }
          }
        }
        runningWidth += charWidth;
      }
      ctx.restore();
    }
  });

  // Render Author under the main quote if present (with full animation, color modes & effects applied!)
  if (hasAuthor && linesToDraw.length > 0) {
    const authorStr =
      rawAuthor.startsWith('—') || rawAuthor.startsWith('-')
        ? rawAuthor
        : `— ${rawAuthor}`;

    const authorY =
      startY +
      (layout.lines.length - 1) * layout.lineHeight +
      authorGap +
      authorFontSize * 0.9 +
      offsetY +
      blockShiftY;

    let authorX = blockCenter + blockShiftX;
    if (state.textAlign === 'left') {
      authorX = blockLeft + blockShiftX;
    } else if (state.textAlign === 'right') {
      authorX = blockRight + blockShiftX;
    } else {
      authorX = blockCenter + blockShiftX;
    }

    if (state.animationStyle === 'glitch') {
      const authorSurge = (currentTime * 0.62) % 1 < 0.15 ? 2 : 0.5;
      authorX += Math.sin(currentTime * 80) * authorSurge;
    }

    // Author animation progress syncs with reveal
    let authorFade = 0;
    if (progress >= 0.70) {
      const revealProgress = Math.min(1, (progress - 0.70) / 0.30);
      authorFade = easeOutCubic(revealProgress);
    }

    ctx.save();
    ctx.font = `italic 600 ${authorFontSize}px 'Playfair Display', 'Caveat', 'Montserrat', Georgia, serif`;
    ctx.textAlign = state.textAlign;
    ctx.textBaseline = 'alphabetic';

    const authorWidth = ctx.measureText(authorStr).width;
    let authorStartX = authorX;
    if (state.textAlign === 'center') authorStartX = authorX - authorWidth / 2;
    else if (state.textAlign === 'right') authorStartX = authorX - authorWidth;

    // Gradient fill resolution for author
    let authorFillStyle: string | CanvasGradient = state.textColor;
    if (state.textColorMode === 'gradient') {
      const c1 = state.textGradientColors?.[0] || state.textColor || '#f43f5e';
      const c2 = state.textGradientColors?.[1] || state.neonColor || '#38bdf8';
      const angle = state.textGradientAngle ?? 45;
      authorFillStyle = createAngleGradient(
        ctx,
        authorStartX,
        authorY - authorFontSize * 0.85,
        authorWidth,
        authorFontSize,
        angle,
        c1,
        c2
      );
    }

    // Neon effect on author
    if (state.effects.neon) {
      ctx.save();
      ctx.shadowColor = state.neonColor || '#a855f7';
      ctx.shadowBlur = 24;
      ctx.strokeStyle = state.neonColor || '#a855f7';
      ctx.lineWidth = Math.max(3, state.strokeWidth * 0.5 + 2);
      ctx.strokeText(authorStr, authorX, authorY);
      ctx.restore();
    }

    // Shadow effect on author
    if (state.effects.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 8;
      ctx.shadowBlur = 16;
    }

    // Glow pulse on author
    if (state.effects.glow) {
      ctx.shadowColor = state.textColor;
      ctx.shadowBlur = 18;
    }

    const isAuthorPerChar =
      isPerCharAnimation ||
      state.textColorMode === 'letter-rainbow' ||
      state.textColorMode === 'word-rainbow' ||
      state.textColorMode === 'letter-random' ||
      state.textColorMode === 'word-random';

    if (isAuthorPerChar) {
      ctx.save();
      let aRunningX = 0;
      let aWordIdx = 0;

      for (let ac = 0; ac < authorStr.length; ac++) {
        const aChar = authorStr[ac];
        if (aChar === ' ') aWordIdx++;
        const aCharWidth = ctx.measureText(aChar).width;
        const targetACenterX = authorStartX + aRunningX + aCharWidth / 2;

        let aCharOffsetX = 0;
        let aCharOffsetY = 0;
        let aCharRot = 0;
        let aCharScale = 1;
        let aCharAlpha = 1;
        const aCharIdx = ac + 100;

        if (state.animationStyle === 'assemble') {
          const aSeed = aCharIdx * 47;
          const aDist = Math.max(canvasWidth, canvasHeight) * 0.4;
          const aEase = easeOutBack(authorFade);
          aCharOffsetX = Math.cos(aSeed) * aDist * (1 - aEase);
          aCharOffsetY = Math.sin(aSeed) * aDist * (1 - aEase);
          aCharAlpha = Math.min(1, authorFade * 2.5);
        } else if (state.animationStyle === 'disperse') {
          const disperseProg = Math.max(0, (progress - 0.5) / 0.5);
          if (disperseProg > 0) {
            const ease = easeOutCubic(disperseProg);
            aCharOffsetX = Math.cos(aCharIdx * 3) * ease * 180;
            aCharOffsetY = Math.sin(aCharIdx * 3) * ease * 180;
            aCharRot = ease * 1.5;
            aCharAlpha = Math.max(0, 1 - ease * 1.2);
          }
        } else if (state.animationStyle === 'tumble') {
          aCharOffsetY = Math.sin(currentTime * 3.0 + aCharIdx * 0.6) * (authorFontSize * 0.16);
          aCharRot = Math.sin(currentTime * 2.2 + aCharIdx * 0.6) * 0.18;
        } else if (state.animationStyle === 'wave') {
          aCharOffsetY = Math.sin(currentTime * 6.0 + aCharIdx * 0.4) * (authorFontSize * 0.2);
        } else if (state.animationStyle === 'fall') {
          const fallEase = easeOutBack(authorFade);
          aCharScale = 1 + (1 - fallEase) * 2.2;
          aCharOffsetY = -(1 - easeOutCubic(authorFade)) * (authorFontSize * 1.8);
          aCharAlpha = Math.min(1, authorFade * 2.8);
        } else if (state.animationStyle === 'blur') {
          const blurAmt = 1 - easeOutCubic(authorFade);
          aCharScale = 1 + blurAmt * 0.3;
          aCharAlpha = 0.2 + (1 - blurAmt) * 0.8;
          if (blurAmt > 0.05) {
            ctx.save();
            ctx.shadowColor = state.textColor;
            ctx.shadowBlur = blurAmt * 25;
            ctx.fillStyle = state.textColor;
            ctx.globalAlpha = blurAmt * 0.4;
            ctx.beginPath();
            ctx.arc(targetACenterX, authorY - authorFontSize * 0.35, blurAmt * (authorFontSize * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (state.animationStyle === 'swarm') {
          aCharAlpha = Math.min(1, authorFade * 2.2);
        }

        let aCharFill: string | CanvasGradient = authorFillStyle;
        if (state.textColorMode === 'letter-rainbow') {
          aCharFill = RAINBOW_LETTER_PALETTE[aCharIdx % RAINBOW_LETTER_PALETTE.length];
        } else if (state.textColorMode === 'word-rainbow') {
          aCharFill = RAINBOW_LETTER_PALETTE[aWordIdx % RAINBOW_LETTER_PALETTE.length];
        } else if (state.textColorMode === 'letter-random') {
          aCharFill = getChaoticColor(aCharIdx, (state.proceduralSeed || 42) + 21);
        } else if (state.textColorMode === 'word-random') {
          aCharFill = getChaoticColor(aWordIdx, (state.proceduralSeed || 42) + 33);
        }

        ctx.save();
        ctx.translate(targetACenterX + aCharOffsetX, authorY + aCharOffsetY);
        if (aCharRot !== 0) ctx.rotate(aCharRot);
        if (aCharScale !== 1) ctx.scale(aCharScale, aCharScale);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha * authorFade * aCharAlpha * 0.95));

        // Author stroke per character
        if (state.strokeEnabled && !state.effects.neon) {
          ctx.save();
          ctx.strokeStyle = state.strokeColor;
          ctx.lineWidth = Math.max(1.5, state.strokeWidth * 0.45);
          ctx.lineJoin = 'round';
          ctx.strokeText(aChar, -aCharWidth / 2, 0);
          ctx.restore();
        }

        ctx.fillStyle = aCharFill;
        ctx.fillText(aChar, -aCharWidth / 2, 0);
        ctx.restore();

        aRunningX += aCharWidth;
      }
      ctx.restore();
    } else {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * authorFade * 0.92));

      // Author stroke if enabled
      if (state.strokeEnabled && !state.effects.neon) {
        ctx.strokeStyle = state.strokeColor;
        ctx.lineWidth = Math.max(1.5, state.strokeWidth * 0.45);
        ctx.lineJoin = 'round';
        ctx.strokeText(authorStr, authorX, authorY);
      }

      ctx.fillStyle = authorFillStyle;
      ctx.fillText(authorStr, authorX, authorY);
    }
    ctx.restore();
  }

  ctx.restore();

  // Draw Particles (Sparkles / Fire / Particles Dust / Sparkler / Fireworks / Smoke) over text
  if (state.effects.sparkle) {
    particleEngine.updateAndDrawSparkles(ctx, bounds, currentTime);
  }
  if (state.effects.fire) {
    particleEngine.updateAndDrawFire(ctx, bounds, currentTime);
  }
  if (state.effects.particles) {
    particleEngine.updateAndDrawDust(ctx, bounds, state.textColor, currentTime);
  }
  if (state.effects.sparkler) {
    particleEngine.updateAndDrawSparklers(ctx, bounds, currentTime);
  }
  if (state.effects.firework) {
    particleEngine.updateAndDrawFireworks(ctx, bounds, currentTime);
  }
  if (state.effects.smoke) {
    particleEngine.updateAndDrawSmoke(ctx, bounds, state.effects.smokeColor, currentTime);
  }

  // Draw 2D Coordinate Ruler (Рейсшина) when dragging text
  if (isDraggingText) {
    ctx.save();

    // 1. Full-width horizontal T-square guide line strictly through textCenterY
    ctx.beginPath();
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(192, 132, 252, 0.8)';
    ctx.shadowBlur = 8;
    ctx.moveTo(0, textCenterY);
    ctx.lineTo(canvasWidth, textCenterY);
    ctx.stroke();

    // Ruler tick marks along horizontal line
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    for (let x = 40; x < canvasWidth; x += 60) {
      const tickH = x % 120 === 0 ? 18 : 10;
      ctx.beginPath();
      ctx.moveTo(x, textCenterY - tickH / 2);
      ctx.lineTo(x, textCenterY + tickH / 2);
      ctx.stroke();
    }

    // 2. Full-height vertical crosshair guide line strictly through textCenterX
    ctx.beginPath();
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.75)';
    ctx.lineWidth = 2;
    ctx.moveTo(textCenterX, 0);
    ctx.lineTo(textCenterX, canvasHeight);
    ctx.stroke();

    // 3. Text bounding box with glowing corners
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.9)';
    ctx.lineWidth = 2;
    const pad = 14;
    const boxX = bounds.x - pad;
    const boxY = bounds.y - pad;
    const boxW = bounds.width + pad * 2;
    const boxH = bounds.height + pad * 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Solid corner brackets
    ctx.setLineDash([]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    const cLen = Math.min(26, boxW * 0.2);
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + cLen);
    ctx.lineTo(boxX, boxY);
    ctx.lineTo(boxX + cLen, boxY);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - cLen, boxY);
    ctx.lineTo(boxX + boxW, boxY);
    ctx.lineTo(boxX + boxW, boxY + cLen);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(boxX, boxY + boxH - cLen);
    ctx.lineTo(boxX, boxY + boxH);
    ctx.lineTo(boxX + cLen, boxY + boxH);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(boxX + boxW - cLen, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH);
    ctx.lineTo(boxX + boxW, boxY + boxH - cLen);
    ctx.stroke();

    // 4. Center reticle / target at (textCenterX, textCenterY)
    ctx.beginPath();
    ctx.arc(textCenterX, textCenterY, 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(textCenterX, textCenterY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    // 5. Floating coordinate HUD badge pill above/below text block
    const posX = Number((state.textPositionX ?? 50).toFixed(1));
    const posY = Number((state.textPositionY ?? 50).toFixed(1));
    const badgeText = `X: ${posX}%  Y: ${posY}%`;
    const badgeFontSize = Math.max(24, Math.round(canvasWidth * 0.026));
    ctx.font = `bold ${badgeFontSize}px 'Montserrat', sans-serif`;
    const textMetric = ctx.measureText(badgeText);
    const badgeW = textMetric.width + 36;
    const badgeH = badgeFontSize + 20;
    const badgeX = textCenterX - badgeW / 2;
    const badgeY = boxY - badgeH - 12 > 10 ? boxY - badgeH - 12 : boxY + boxH + 14;

    // Draw badge background pill
    ctx.fillStyle = 'rgba(15, 12, 25, 0.94)';
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;

    const radius = badgeH / 2;
    ctx.beginPath();
    ctx.moveTo(badgeX + radius, badgeY);
    ctx.lineTo(badgeX + badgeW - radius, badgeY);
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
    ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - radius, badgeY + badgeH);
    ctx.lineTo(badgeX + radius, badgeY + badgeH);
    ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
    ctx.lineTo(badgeX, badgeY + radius);
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw badge text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, textCenterX, badgeY + badgeH / 2);

    ctx.restore();
  }
}
