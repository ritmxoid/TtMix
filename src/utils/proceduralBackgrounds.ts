// Procedural Canvas Background Generator Module
// Generates unique dynamic animated background scenes based on mood styles and seed variations

import {
  MatrixDirection,
  MatrixColorTheme,
  FireworksColorTheme,
  FlagsCompositionMode,
  FlagsScaleMode,
  FlagsMotionStyle,
  FlagsEffect,
  FlagsBgStyle,
  CloudsSkyStyle,
  ProceduralMoodStyle,
} from '../types';

export interface ProceduralMoodDefinition {
  id: ProceduralMoodStyle;
  nameKey: string;
  defaultName: string;
  icon: string;
  descriptionKey: string;
  defaultDesc: string;
  accentColors: [string, string, string];
}

export interface ProceduralMoodRenderOptions {
  // Matrix options
  direction?: MatrixDirection;
  colorTheme?: MatrixColorTheme;
  fontSize?: number;
  rawText?: string;
  activeSegmentText?: string;
  isUppercase?: boolean;
  // Fireworks options
  fireworksColorTheme?: FireworksColorTheme;
  fireworksCount?: number;
  fireworksScaleMode?: 'mixed' | 'small' | 'medium' | 'giant';
  // Flags options
  flagsMode?: FlagsCompositionMode;
  flagsCount?: number;
  flagsScaleMode?: FlagsScaleMode;
  flagsPrimaryCountry?: string;
  flagsSecondaryCountry?: string;
  flagsMotion?: FlagsMotionStyle;
  flagsEffect?: FlagsEffect;
  flagsBgStyle?: FlagsBgStyle;
  flagsGrain?: boolean;
  flagsOpacity?: number;
  // Clouds options (legacy compatibility)
  cloudsStyle?: CloudsSkyStyle;
  cloudsSpeed?: number;
  cloudsFeather?: number;
}

export const PROCEDURAL_MOODS: ProceduralMoodDefinition[] = [
  {
    id: 'matrix',
    nameKey: 'moodMatrixName',
    defaultName: 'Матрица',
    icon: '🟢',
    descriptionKey: 'moodMatrixDesc',
    defaultDesc: 'Бегущие биты и символы кода с трансформацией в текст в реальном времени',
    accentColors: ['#000000', '#022c15', '#00ff66'],
  },
  {
    id: 'fireworks',
    nameKey: 'moodFireworksName',
    defaultName: 'Фейерверки',
    icon: '🎆',
    descriptionKey: 'moodFireworksDesc',
    defaultDesc: '35+ видов салютов: хризантемы, ивы, камуро, кольца, кометы и комбо-залпы',
    accentColors: ['#050510', '#3b0764', '#facc15'],
  },
  {
    id: 'flags',
    nameKey: 'moodFlagsName',
    defaultName: 'Флаги',
    icon: '🚩',
    descriptionKey: 'moodFlagsDesc',
    defaultDesc: 'Летающие флаги стран: соло, дуэли и парад от 1 до 30 флагов с развеванием и сиянием',
    accentColors: ['#0f172a', '#1e293b', '#38bdf8'],
  },
  {
    id: 'cosmic',
    nameKey: 'moodCosmicName',
    defaultName: '✨ Космос и Магия',
    icon: '✨',
    descriptionKey: 'moodCosmicDesc',
    defaultDesc: 'Галактические туманности, парящие созвездия и падающие метеоры',
    accentColors: ['#1e1b4b', '#581c87', '#38bdf8'],
  },
  {
    id: 'cyberpunk',
    nameKey: 'moodCyberName',
    defaultName: '⚡ Неон и Киберпанк',
    icon: '⚡',
    descriptionKey: 'moodCyberDesc',
    defaultDesc: 'Неоновая 3D-сетка перспективы, цифровые потоки и свечение',
    accentColors: ['#09090b', '#ec4899', '#06b6d4'],
  },
  {
    id: 'ember',
    nameKey: 'moodEmberName',
    defaultName: '🔥 Огонь и Энергия',
    icon: '🔥',
    descriptionKey: 'moodEmberDesc',
    defaultDesc: 'Поднимающиеся раскаленные искры, угли и плазменные лучи',
    accentColors: ['#450a0a', '#7f1d1d', '#f59e0b'],
  },
  {
    id: 'nature',
    nameKey: 'moodNatureName',
    defaultName: '🌸 Сакура и Аврора',
    icon: '🌸',
    descriptionKey: 'moodNatureDesc',
    defaultDesc: 'Полярное сияние, парящие лепестки сакуры и световые блики',
    accentColors: ['#022c22', '#0f766e', '#f43f5e'],
  },
  {
    id: 'gold',
    nameKey: 'moodGoldName',
    defaultName: '✨ Золото и Люкс',
    icon: '🔱',
    descriptionKey: 'moodGoldDesc',
    defaultDesc: 'Мерцающий золотой боке, бриллиантовая пыль и винтажный шик',
    accentColors: ['#291e08', '#78350f', '#facc15'],
  },
  {
    id: 'fluid',
    nameKey: 'moodFluidName',
    defaultName: '💧 Жидкая Аура',
    icon: '💧',
    descriptionKey: 'moodFluidDesc',
    defaultDesc: 'Плавно переливающиеся градиентные метаболы и жидкий неоновый неолит',
    accentColors: ['#1e1b4b', '#a855f7', '#06b6d4'],
  },
  {
    id: 'equalizer',
    nameKey: 'moodEqualizerName',
    defaultName: '📊 Спектр и Эквалайзеры',
    icon: '📊',
    descriptionKey: 'moodEqualizerDesc',
    defaultDesc: 'Динамичные музыкальные эквалайзеры, кольцевые спектрограммы и звуковые волны',
    accentColors: ['#090a1a', '#701a75', '#06b6d4'],
  },
  {
    id: 'shapes',
    nameKey: 'moodShapesName',
    defaultName: '📐 Динамическая Геометрия',
    icon: '📐',
    descriptionKey: 'moodShapesDesc',
    defaultDesc: 'Разноцветные 3D и 2D фигуры разных размеров, вращающиеся на уникальных фонах',
    accentColors: ['#0f172a', '#a855f7', '#f43f5e'],
  },
  {
    id: 'emojis',
    nameKey: 'moodEmojisName',
    defaultName: '🥳 Эмодзи Вселенная',
    icon: '🥳',
    descriptionKey: 'moodEmojisDesc',
    defaultDesc: 'Разнообразные смайлики от мелкой пыльцы до гигантских объектов в сюрреалистичных мирах',
    accentColors: ['#1e1b4b', '#ec4899', '#facc15'],
  },
];

// Pseudo-random number generator driven by seed
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Renders a procedural animated background on canvas
 */
export function drawProceduralMoodBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  moodStyle: ProceduralMoodStyle = 'cosmic',
  seed: number = 42,
  skipSolidBg: boolean = false,
  options?: ProceduralMoodRenderOptions
) {
  const rng = seededRandom(seed);

  switch (moodStyle) {
    case 'matrix':
      drawMatrix(ctx, width, height, time, rng, seed, skipSolidBg, options);
      break;
    case 'fireworks':
      drawFireworks(ctx, width, height, time, rng, seed, skipSolidBg, options);
      break;
    case 'flags':
    case 'clouds':
      drawFlags(ctx, width, height, time, rng, seed, skipSolidBg, options);
      break;
    case 'cosmic':
      drawCosmic(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'cyberpunk':
      drawCyberpunk(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'ember':
      drawEmber(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'nature':
      drawNature(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'gold':
      drawGold(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'fluid':
      drawFluid(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'equalizer':
      drawEqualizer(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'shapes':
      drawShapes(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    case 'emojis':
      drawEmojis(ctx, width, height, time, rng, seed, skipSolidBg);
      break;
    default:
      drawMatrix(ctx, width, height, time, rng, seed, skipSolidBg, options);
  }
}

/* ================= 1. COSMIC & MAGIC ================= */
function drawCosmic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Cosmic palette selection based on seed
  const paletteMode = Math.floor(rng() * 5);
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.05, w * 0.5, h * 0.5, w * 0.85);

  if (paletteMode === 0) {
    // Deep Violet Void
    bg.addColorStop(0, '#2e1065');
    bg.addColorStop(0.45, '#0f0a2a');
    bg.addColorStop(1, '#030210');
  } else if (paletteMode === 1) {
    // Quasar Cyan & Indigo
    bg.addColorStop(0, '#0c4a6e');
    bg.addColorStop(0.5, '#082f49');
    bg.addColorStop(1, '#020617');
  } else if (paletteMode === 2) {
    // Ruby Nebula
    bg.addColorStop(0, '#4c0519');
    bg.addColorStop(0.5, '#1e050f');
    bg.addColorStop(1, '#050205');
  } else if (paletteMode === 3) {
    // Emerald Abyss
    bg.addColorStop(0, '#064e3b');
    bg.addColorStop(0.5, '#022c22');
    bg.addColorStop(1, '#020617');
  } else {
    // Obsidian Deep Space
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(0.5, '#0b0f19');
    bg.addColorStop(1, '#020408');
  }

  if (!skipSolidBg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Swirling Pulsing Nebulae clouds
  const nebulaCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < nebulaCount; i++) {
    const cx = w * (0.15 + rng() * 0.7) + Math.sin(t * 0.35 + i * 2) * 50;
    const cy = h * (0.15 + rng() * 0.7) + Math.cos(t * 0.3 + i * 1.5) * 50;
    const rad = w * (0.28 + rng() * 0.35);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    const baseHue = Math.floor(180 + rng() * 160);
    grad.addColorStop(0, `hsla(${baseHue}, 85%, 60%, 0.22)`);
    grad.addColorStop(0.5, `hsla(${baseHue + 30}, 75%, 45%, 0.09)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Twinkling Starfield
  const starCount = 90 + Math.floor(rng() * 40);
  for (let i = 0; i < starCount; i++) {
    const sx = rng() * w;
    const sy = rng() * h;
    const baseSize = 0.8 + rng() * 2.5;
    const speed = 0.8 + rng() * 3.0;
    const twinkle = 0.25 + 0.75 * Math.sin(t * speed + i * 1.7);
    const size = baseSize * (0.65 + twinkle * 0.55);

    ctx.fillStyle =
      i % 6 === 0 ? '#38bdf8' : i % 8 === 0 ? '#f472b6' : i % 11 === 0 ? '#facc15' : '#ffffff';
    ctx.globalAlpha = Math.max(0.15, twinkle);
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();

    // 4-point cross diffraction flare for prominent stars
    if (baseSize > 2.3 && twinkle > 0.65) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(sx - size * 3.5, sy);
      ctx.lineTo(sx + size * 3.5, sy);
      ctx.moveTo(sx, sy - size * 3.5);
      ctx.lineTo(sx, sy + size * 3.5);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1.0;

  // Shooting Meteors with diverse directions and variable count (1 to 10!)
  const meteorCount = 1 + Math.floor(rng() * 10);
  const tailColors = ['#a855f7', '#38bdf8', '#ec4899', '#facc15', '#34d399', '#ffffff'];

  for (let m = 0; m < meteorCount; m++) {
    const meteorPeriod = 1.8 + rng() * 3.2; // Each meteor has its own period
    const meteorOffset = rng() * meteorPeriod;
    const meteorTime = (t + meteorOffset) % meteorPeriod;

    // Active meteor animation duration
    const mDuration = 0.65 + rng() * 0.45;
    if (meteorTime < mDuration) {
      const mProgress = meteorTime / mDuration;
      const angle = (rng() * Math.PI * 2); // Multi-directional angle!
      const travelDist = Math.min(w, h) * (0.45 + rng() * 0.4);

      // Starting point scattered across canvas edges
      const startX = rng() * w;
      const startY = rng() * h;
      const endX = startX + Math.cos(angle) * travelDist;
      const endY = startY + Math.sin(angle) * travelDist;

      const currX = startX + (endX - startX) * mProgress;
      const currY = startY + (endY - startY) * mProgress;

      const tailLenX = (endX - startX) * 0.3;
      const tailLenY = (endY - startY) * 0.3;

      const tailGrad = ctx.createLinearGradient(
        currX - tailLenX,
        currY - tailLenY,
        currX,
        currY
      );
      tailGrad.addColorStop(0, 'transparent');
      const chosenColor = tailColors[m % tailColors.length];
      tailGrad.addColorStop(0.7, chosenColor);
      tailGrad.addColorStop(1, '#ffffff');

      ctx.save();
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 2.0 + rng() * 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currX - tailLenX, currY - tailLenY);
      ctx.lineTo(currX, currY);
      ctx.stroke();

      // Bright head glow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = chosenColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(currX, currY, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/* ================= 2. CYBERPUNK & NEON ================= */
function drawCyberpunk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Theme parameters driven by seed
  const paletteType = Math.floor(rng() * 5);
  const orientation = Math.floor(rng() * 4); // 0: Floor, 1: Ceiling, 2: Wall Left/Right, 3: Dual Tunnel
  const moveDirection = Math.floor(rng() * 4); // 0: Forward, 1: Backward, 2: Left, 3: Right
  const gridDensity = 8 + Math.floor(rng() * 14); // Grid cell scale
  const curveAmp = rng() > 0.35 ? 12 + rng() * 30 : 0; // Wavy grid deformation
  const lineThickness = 1.0 + rng() * 2.2;

  let bgGrad1 = '#020617';
  let bgGrad2 = '#0f172a';
  let bgGrad3 = '#38023b';
  let gridColor = 'rgba(236, 72, 153, 0.45)';
  let glowColor = '#ec4899';
  let secondaryGrid = 'rgba(6, 182, 212, 0.4)';

  if (paletteType === 1) {
    // Matrix Cyber Emerald
    bgGrad1 = '#022c22';
    bgGrad2 = '#064e3b';
    bgGrad3 = '#020617';
    gridColor = 'rgba(34, 197, 94, 0.5)';
    glowColor = '#22c55e';
    secondaryGrid = 'rgba(163, 230, 53, 0.4)';
  } else if (paletteType === 2) {
    // Electric Ultra Cyan & Blue
    bgGrad1 = '#030712';
    bgGrad2 = '#082f49';
    bgGrad3 = '#0c4a6e';
    gridColor = 'rgba(56, 189, 248, 0.55)';
    glowColor = '#38bdf8';
    secondaryGrid = 'rgba(168, 85, 247, 0.4)';
  } else if (paletteType === 3) {
    // Outrun Gold & Crimson
    bgGrad1 = '#2a0808';
    bgGrad2 = '#450a0a';
    bgGrad3 = '#180828';
    gridColor = 'rgba(249, 115, 22, 0.55)';
    glowColor = '#f97316';
    secondaryGrid = 'rgba(250, 204, 21, 0.45)';
  } else if (paletteType === 4) {
    // Deep Violet Synth
    bgGrad1 = '#180828';
    bgGrad2 = '#2e1065';
    bgGrad3 = '#4c1d95';
    gridColor = 'rgba(168, 85, 247, 0.55)';
    glowColor = '#a855f7';
    secondaryGrid = 'rgba(236, 72, 153, 0.4)';
  }

  // Draw Background if not skipping solid base
  if (!skipSolidBg) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, bgGrad1);
    bg.addColorStop(0.5, bgGrad2);
    bg.addColorStop(1, bgGrad3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Moving Speed Offset
  const rawSpeed = t * (0.6 + rng() * 0.8);
  const animNorm =
    moveDirection === 1
      ? 1 - (rawSpeed % 1)
      : moveDirection === 2
      ? rawSpeed * 1.5
      : rawSpeed % 1;

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineThickness;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8 + rng() * 10;

  if (orientation === 0 || orientation === 3) {
    // Floor Grid
    const horizonY = orientation === 3 ? h * 0.5 : h * 0.52;
    const vpX = w * 0.5;

    for (let i = -gridDensity; i <= gridDensity; i++) {
      const bottomX = vpX + i * (w / (gridDensity * 0.65));
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      for (let step = 0; step <= 10; step++) {
        const norm = step / 10;
        const curY = horizonY + norm * norm * (h - horizonY);
        const curX = vpX + (bottomX - vpX) * norm + Math.sin(norm * 5 + t * 2) * curveAmp;
        if (step === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }

    const horizLines = 10;
    for (let i = 0; i < horizLines; i++) {
      const norm = (i + animNorm) / horizLines;
      const y = horizonY + norm * norm * (h - horizonY);
      ctx.globalAlpha = Math.min(1, norm * 1.6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  if (orientation === 1 || orientation === 3) {
    // Ceiling Grid
    const horizonY = orientation === 3 ? h * 0.5 : h * 0.48;
    const vpX = w * 0.5;
    ctx.strokeStyle = secondaryGrid;

    for (let i = -gridDensity; i <= gridDensity; i++) {
      const topX = vpX + i * (w / (gridDensity * 0.65));
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      for (let step = 0; step <= 10; step++) {
        const norm = step / 10;
        const curY = horizonY - norm * norm * horizonY;
        const curX = vpX + (topX - vpX) * norm + Math.sin(norm * 5 + t * 2) * curveAmp;
        if (step === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }

    const horizLines = 10;
    for (let i = 0; i < horizLines; i++) {
      const norm = (i + animNorm) / horizLines;
      const y = horizonY - norm * norm * horizonY;
      ctx.globalAlpha = Math.min(1, norm * 1.6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  if (orientation === 2) {
    // Side Wall Grid (Left/Right)
    const vpY = h * 0.5;
    const vpX = w * 0.2;
    for (let i = -gridDensity; i <= gridDensity; i++) {
      const edgeY = vpY + i * (h / (gridDensity * 0.6));
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(w, edgeY);
      ctx.stroke();
    }

    for (let i = 0; i < 12; i++) {
      const norm = (i + animNorm) / 12;
      const x = vpX + norm * norm * (w - vpX);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Digital Rain / Byte Particles
  const pCount = 30 + Math.floor(rng() * 25);
  for (let i = 0; i < pCount; i++) {
    const px = (rng() * w + Math.sin(t * 1.2 + i) * 30 + w) % w;
    const py = (rng() * h + t * (50 + rng() * 80) + i * 30) % h;
    const pSize = 1.5 + rng() * 2.8;

    ctx.fillStyle = i % 2 === 0 ? glowColor : '#ffffff';
    ctx.globalAlpha = 0.35 + 0.65 * Math.sin(t * 3.5 + i);
    ctx.fillRect(px, py, pSize, pSize * (2 + rng() * 3));
  }
  ctx.globalAlpha = 1.0;

  // Glowing Cyber Sun / Horizon Core
  const sunCenterY = h * (orientation === 1 ? 0.48 : orientation === 3 ? 0.5 : 0.52);
  const sunGrad = ctx.createRadialGradient(w * 0.5, sunCenterY, 5, w * 0.5, sunCenterY, w * 0.38);
  sunGrad.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
  sunGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.18)');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(w * 0.5, sunCenterY, w * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

/* ================= 3. EMBER & ENERGY ================= */
function drawEmber(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Wide range upper gradient palette: Charcoal, Ruby, Violet Plasma, Steel Dark Blue
  const topBgType = Math.floor(rng() * 5);
  let topColor = '#090302';
  let midColor = '#200505';
  let botColor = '#450a0a';
  let flameColor1 = '#f59e0b';
  let flameColor2 = '#ef4444';

  if (topBgType === 1) {
    // Deep Violet / Purple Plasma
    topColor = '#180828';
    midColor = '#2e1065';
    botColor = '#581c87';
    flameColor1 = '#ec4899';
    flameColor2 = '#f43f5e';
  } else if (topBgType === 2) {
    // Steel Blue & Electric Fire
    topColor = '#050d1a';
    midColor = '#0c4a6e';
    botColor = '#1e1b4b';
    flameColor1 = '#38bdf8';
    flameColor2 = '#f59e0b';
  } else if (topBgType === 3) {
    // Ruby & Crimson Inferno
    topColor = '#1e050f';
    midColor = '#4c0519';
    botColor = '#881337';
    flameColor1 = '#fb7185';
    flameColor2 = '#f97316';
  } else if (topBgType === 4) {
    // Toxic Electric Amber
    topColor = '#0c0a09';
    midColor = '#292524';
    botColor = '#78350f';
    flameColor1 = '#facc15';
    flameColor2 = '#ea580c';
  }

  if (!skipSolidBg) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, topColor);
    bg.addColorStop(0.55, midColor);
    bg.addColorStop(1, botColor);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Bottom explosive flashing flames reaching variable heights!
  const flameHeightBase = h * (0.22 + rng() * 0.28);
  const flameTongues = 8;
  ctx.save();
  for (let k = 0; k < flameTongues; k++) {
    const fx = (k / flameTongues) * w + (w / flameTongues) * 0.5;
    const fHeight = flameHeightBase * (0.7 + 0.6 * Math.sin(t * (3.0 + (k % 4)) + k * 1.5));

    const fGrad = ctx.createRadialGradient(fx, h, 10, fx, h - fHeight * 0.5, fHeight);
    fGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    fGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
    fGrad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
    fGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(fx, h, fHeight, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Swirling Embers with Flow Patterns (Vortex, Jet Streams, Wind Storm, Eruption)
  const flowPattern = Math.floor(rng() * 4);
  const emberCount = 45 + Math.floor(rng() * 75); // Density variance
  const jetCount = 2 + Math.floor(rng() * 3);

  for (let i = 0; i < emberCount; i++) {
    const speed = 55 + rng() * 95;
    const initialX = rng() * w;
    const y = (h - ((t * speed + i * 32) % (h + 60))) + 20;

    let x = initialX;
    if (flowPattern === 0) {
      // Swirling Tornado Vortex
      const vortexCenter = w * 0.5;
      const radius = (initialX - vortexCenter) * 0.8;
      const angle = t * 2.5 + (y / h) * 6;
      x = vortexCenter + Math.cos(angle) * Math.abs(radius);
    } else if (flowPattern === 1) {
      // Multi-Stream Flame Jets
      const targetJetX = ((i % jetCount) + 0.5) * (w / jetCount);
      const sway = Math.sin(t * 3.0 + i) * 35;
      x = targetJetX + (initialX - targetJetX) * 0.3 + sway;
    } else if (flowPattern === 2) {
      // High Turbulence Wind Storm
      const windPush = (1 - y / h) * w * 0.4;
      x = (initialX + windPush + Math.sin(t * 2.5 + i) * 30 + w) % w;
    } else {
      // Erupting Fountain
      const spread = (1 - y / h) * (w * 0.45);
      const dir = i % 2 === 0 ? 1 : -1;
      x = w * 0.5 + dir * spread * (0.3 + rng() * 0.7) + Math.sin(t * 2 + i) * 20;
    }

    const size = 1.2 + rng() * 3.8;
    const alpha = Math.sin((y / h) * Math.PI) * (0.7 + 0.3 * Math.sin(t * 4 + i));
    if (alpha <= 0) continue;

    ctx.save();
    ctx.globalAlpha = Math.max(0.12, alpha);
    ctx.shadowColor = flameColor1;
    ctx.shadowBlur = size * 4;
    ctx.fillStyle =
      i % 4 === 0 ? '#ffffff' : i % 3 === 0 ? '#fef08a' : i % 2 === 0 ? flameColor1 : flameColor2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ================= 4. NATURE & SAKURA & AURORA ================= */
function drawNature(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Soft, non-toxic, atmospheric color palettes
  const natureTheme = Math.floor(rng() * 5);
  let bgGrad1 = '#0f172a';
  let bgGrad2 = '#1e1b4b';
  let bgGrad3 = '#312e81';
  let auroraCol1 = 'rgba(52, 211, 153, 0.22)';
  let auroraCol2 = 'rgba(244, 63, 94, 0.18)';
  let petalCol1 = 'rgba(251, 113, 133, 0.85)';
  let petalCol2 = 'rgba(244, 114, 182, 0.75)';

  if (natureTheme === 1) {
    // Lavender Evening & Rose Dusk
    bgGrad1 = '#180828';
    bgGrad2 = '#2e1065';
    bgGrad3 = '#4c1d95';
    auroraCol1 = 'rgba(168, 85, 247, 0.22)';
    auroraCol2 = 'rgba(251, 113, 133, 0.18)';
    petalCol1 = 'rgba(244, 114, 182, 0.85)';
    petalCol2 = 'rgba(192, 132, 252, 0.75)';
  } else if (natureTheme === 2) {
    // Misty Jade & Forest Dawn
    bgGrad1 = '#022c22';
    bgGrad2 = '#064e3b';
    bgGrad3 = '#0f766e';
    auroraCol1 = 'rgba(45, 212, 191, 0.25)';
    auroraCol2 = 'rgba(56, 189, 248, 0.18)';
    petalCol1 = 'rgba(254, 205, 211, 0.85)';
    petalCol2 = 'rgba(253, 164, 175, 0.75)';
  } else if (natureTheme === 3) {
    // Warm Peach Sunset & Golden Dusk
    bgGrad1 = '#2a0d0a';
    bgGrad2 = '#431407';
    bgGrad3 = '#7c2d12';
    auroraCol1 = 'rgba(251, 146, 60, 0.22)';
    auroraCol2 = 'rgba(244, 63, 94, 0.16)';
    petalCol1 = 'rgba(254, 215, 170, 0.85)';
    petalCol2 = 'rgba(251, 113, 133, 0.75)';
  } else if (natureTheme === 4) {
    // Deep Ocean Night & Emerald Aurora
    bgGrad1 = '#031818';
    bgGrad2 = '#064e3b';
    bgGrad3 = '#0284c7';
    auroraCol1 = 'rgba(52, 211, 153, 0.25)';
    auroraCol2 = 'rgba(6, 182, 212, 0.2)';
    petalCol1 = 'rgba(255, 255, 255, 0.85)';
    petalCol2 = 'rgba(244, 114, 182, 0.7)';
  }

  // Draw smooth background gradient
  if (!skipSolidBg) {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, bgGrad1);
    bg.addColorStop(0.5, bgGrad2);
    bg.addColorStop(1, bgGrad3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Flowing Aurora Waves
  ctx.save();
  const waveCount = 3;
  for (let wave = 0; wave < waveCount; wave++) {
    ctx.beginPath();
    ctx.moveTo(0, h * 0.18 + wave * 65);
    for (let x = 0; x <= w; x += 15) {
      const y =
        h * (0.18 + wave * 0.12) +
        Math.sin(x * 0.003 + t * 0.8 + wave) * 50 +
        Math.cos(x * 0.006 - t * 0.6 + wave) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const aGrad = ctx.createLinearGradient(0, 0, 0, h);
    aGrad.addColorStop(0, wave % 2 === 0 ? auroraCol1 : auroraCol2);
    aGrad.addColorStop(0.5, 'transparent');
    aGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = aGrad;
    ctx.fill();
  }
  ctx.restore();

  // Floating Sakura Petals & Wind Vortex Swirls
  const petalCount = 45 + Math.floor(rng() * 30);
  const windVortexType = Math.floor(rng() * 3); // 0: Gentle Drift, 1: Spiral Swirl, 2: Gusty Crosswind

  for (let i = 0; i < petalCount; i++) {
    const pSpeed = 20 + rng() * 45;
    const initialX = rng() * w;
    const y = ((t * pSpeed + i * 40) % (h + 60)) - 30;

    let x = initialX;
    if (windVortexType === 1) {
      // Spiral Swirl
      const swirlFreq = 1.0 + rng() * 1.5;
      x = initialX + Math.sin(t * swirlFreq + (y / h) * 5 + i) * 65;
    } else if (windVortexType === 2) {
      // Gusty Crosswind
      const gust = Math.sin(t * 0.7 + i * 0.5) * 45 + (y / h) * w * 0.25;
      x = (initialX + gust + w) % w;
    } else {
      // Gentle Breeze
      x = initialX + Math.sin(t * 1.2 + i) * 35;
    }

    const rot = t * (1.2 + rng()) + i;
    const scale = 0.6 + rng() * 0.9;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(scale, scale);

    ctx.fillStyle = i % 2 === 0 ? petalCol1 : petalCol2;
    ctx.shadowColor = petalCol1;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Soft breathing golden fireflies
  const fireflyCount = 20;
  for (let f = 0; f < fireflyCount; f++) {
    const fx = (rng() * w + Math.sin(t * 0.8 + f * 2) * 40 + w) % w;
    const fy = (rng() * h + Math.cos(t * 0.7 + f * 3) * 40 + h) % h;
    const pulse = 0.3 + 0.7 * Math.sin(t * 2.5 + f * 1.5);

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ================= 5. GOLD LUXURY & BOKEH ================= */
function drawGold(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Rich golden dark brown gradient
  if (!skipSolidBg) {
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.1, w * 0.5, h * 0.5, w * 0.8);
    bg.addColorStop(0, '#451a03');
    bg.addColorStop(0.5, '#1e1005');
    bg.addColorStop(1, '#090502');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  // Soft Gold Bokeh Circles
  const bokehCount = 22;
  for (let i = 0; i < bokehCount; i++) {
    const bx = w * (0.1 + rng() * 0.8) + Math.sin(t * 0.4 + i) * 30;
    const by = h * (0.1 + rng() * 0.8) + Math.cos(t * 0.3 + i * 2) * 30;
    const bRad = w * (0.08 + rng() * 0.15);
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + i);

    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, bRad);
    grad.addColorStop(0, `rgba(250, 204, 21, ${0.2 * pulse})`);
    grad.addColorStop(0.6, `rgba(217, 119, 6, ${0.08 * pulse})`);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, bRad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sparkling Gold Diamond Dust
  const dustCount = 50;
  for (let i = 0; i < dustCount; i++) {
    const dx = rng() * w;
    const dy = (h - ((t * (20 + rng() * 30) + i * 30) % h));
    const dSize = 1.0 + rng() * 2.5;
    const twinkle = 0.3 + 0.7 * Math.sin(t * 3 + i * 2);

    ctx.save();
    ctx.globalAlpha = Math.max(0.1, twinkle);
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = dSize * 4;
    ctx.fillStyle = '#fef08a';

    ctx.beginPath();
    ctx.arc(dx, dy, dSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ================= 6. FLUID AURA ================= */
function drawFluid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Rich diverse color palettes for fluid & background
  const fluidTheme = Math.floor(rng() * 5);
  let bgBase = '#0f0728';
  let blobColors = [
    'rgba(168, 85, 247, 0.45)',
    'rgba(6, 182, 212, 0.4)',
    'rgba(236, 72, 153, 0.38)',
    'rgba(99, 102, 241, 0.4)',
    'rgba(250, 204, 21, 0.3)',
  ];

  if (fluidTheme === 1) {
    // Sunset Amber & Magenta
    bgBase = '#1a0614';
    blobColors = [
      'rgba(244, 63, 94, 0.45)',
      'rgba(249, 115, 22, 0.4)',
      'rgba(250, 204, 21, 0.35)',
      'rgba(168, 85, 247, 0.4)',
      'rgba(236, 72, 153, 0.35)',
    ];
  } else if (fluidTheme === 2) {
    // Electric Lime & Oceanic Teal
    bgBase = '#021e1e';
    blobColors = [
      'rgba(34, 197, 94, 0.42)',
      'rgba(6, 182, 212, 0.45)',
      'rgba(56, 189, 248, 0.38)',
      'rgba(163, 230, 53, 0.35)',
      'rgba(14, 165, 233, 0.4)',
    ];
  } else if (fluidTheme === 3) {
    // Royal Indigo & Deep Crimson
    bgBase = '#08051a';
    blobColors = [
      'rgba(99, 102, 241, 0.45)',
      'rgba(225, 29, 72, 0.4)',
      'rgba(168, 85, 247, 0.38)',
      'rgba(59, 130, 246, 0.42)',
      'rgba(244, 63, 94, 0.35)',
    ];
  } else if (fluidTheme === 4) {
    // Toxic Acid Violet & Cyan
    bgBase = '#0a0a14';
    blobColors = [
      'rgba(192, 132, 252, 0.5)',
      'rgba(34, 211, 238, 0.45)',
      'rgba(244, 114, 182, 0.4)',
      'rgba(129, 140, 248, 0.42)',
      'rgba(251, 146, 60, 0.32)',
    ];
  }

  // Fill background
  if (!skipSolidBg) {
    ctx.fillStyle = bgBase;
    ctx.fillRect(0, 0, w, h);
  }

  // Fluid Lava Blobs with extreme size variation (from micro droplets to gigantic sweeping ambient auras)
  const blobCount = 6 + Math.floor(rng() * 4);

  for (let i = 0; i < blobCount; i++) {
    const isGiant = i === 0 || i === 1; // 2 gigantic ambient color zones
    const isMicro = i >= blobCount - 2; // micro droplets

    let baseRadius = w * 0.3;
    if (isGiant) {
      baseRadius = w * (0.65 + rng() * 0.35); // Gigantic up to w * 1.0!
    } else if (isMicro) {
      baseRadius = w * (0.06 + rng() * 0.08); // Micro droplets
    } else {
      baseRadius = w * (0.2 + rng() * 0.25);
    }

    const orbitSpeed = (0.2 + rng() * 0.35) * (i % 2 === 0 ? 1 : -1);
    const cx = w * (0.5 + Math.sin(t * orbitSpeed + i * 1.6) * 0.38);
    const cy = h * (0.5 + Math.cos(t * (orbitSpeed * 0.85) + i * 1.3) * 0.38);
    const radius = baseRadius * (0.85 + 0.25 * Math.sin(t * 0.5 + i));

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    const mainCol = blobColors[i % blobColors.length];
    const secCol = blobColors[(i + 1) % blobColors.length];

    grad.addColorStop(0, mainCol);
    grad.addColorStop(0.65, secCol.replace(/[\d\.]+\)$/, '0.12)'));
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ================= 7. SPECTRUM & EQUALIZERS ================= */
function drawEqualizer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // 28 Distinct Equalizer Layouts and Morphologies (including 8 photo-accurate image visualizers)!
  const layoutType = Math.floor(rng() * 28);
  const colorMode = Math.floor(rng() * 6); // 6 Rich Neon & Spectrum Color Palettes
  const orientationMode = Math.floor(rng() * 4); // 0: Normal / Center, 1: Inverted (Top-down), 2: Mirrored / Alt, 3: Dynamic Tilt / Vertical
  const speedFactor = 0.65 + rng() * 0.95; // 0.65x to 1.6x Speed variation
  const animT = t * speedFactor;
  t = animT; // Scale tempo for all animations

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  let neon1 = '#ec4899';
  let neon2 = '#a855f7';
  let neon3 = '#06b6d4';
  let particleCol = '#ffffff';

  if (colorMode === 0) {
    // Cyber Synthwave
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#3b0764');
    neon1 = '#ec4899';
    neon2 = '#a855f7';
    neon3 = '#06b6d4';
  } else if (colorMode === 1) {
    // Electric Ultra Cyan
    bgGrad.addColorStop(0, '#090514');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#082f49');
    neon1 = '#38bdf8';
    neon2 = '#818cf8';
    neon3 = '#c084fc';
  } else if (colorMode === 2) {
    // Matrix Emerald Bass
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#020617');
    neon1 = '#22c55e';
    neon2 = '#10b981';
    neon3 = '#a3e635';
  } else if (colorMode === 3) {
    // Deep Crimson Fire Bass
    bgGrad.addColorStop(0, '#450a0a');
    bgGrad.addColorStop(0.5, '#18020a');
    bgGrad.addColorStop(1, '#09090b');
    neon1 = '#ef4444';
    neon2 = '#f97316';
    neon3 = '#facc15';
  } else if (colorMode === 4) {
    // Hyper Acid Violet
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#4c1d95');
    bgGrad.addColorStop(1, '#0f172a');
    neon1 = '#facc15';
    neon2 = '#ec4899';
    neon3 = '#3b82f6';
  } else {
    // Neon Sunset Violet-Rose Spectrum (User Palette)
    bgGrad.addColorStop(0, '#050714');
    bgGrad.addColorStop(0.5, '#190a2a');
    bgGrad.addColorStop(1, '#0c1a3d');
    neon1 = '#c084fc';
    neon2 = '#e879f9';
    neon3 = '#38bdf8';
  }
  if (!skipSolidBg) {
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Background central aura glow
    const aura = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.65);
    aura.addColorStop(0, neon2 + '44');
    aura.addColorStop(0.6, neon3 + '22');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, w, h);
  }

  // Dynamic gradient helper
  const createSpectrumGrad = (x1: number, y1: number, x2: number, y2: number) => {
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, neon1);
    grad.addColorStop(0.35, neon2);
    grad.addColorStop(0.7, neon3);
    grad.addColorStop(1, neon1);
    return grad;
  };

  // Dynamic background particles helper
  const drawBackgroundParticles = () => {
    ctx.save();
    for (let i = 0; i < 32; i++) {
      const px = (Math.sin(i * 99 + animT * 0.22) * 0.5 + 0.5) * w;
      const py = (Math.cos(i * 33 + animT * 0.32) * 0.5 + 0.5) * h;
      const pSize = (Math.sin(i + animT) * 0.5 + 0.5) * 1.8 + 0.6;
      ctx.fillStyle = i % 3 === 0 ? neon1 : i % 3 === 1 ? neon3 : particleCol;
      ctx.shadowColor = neon2;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = (Math.sin(i * 12 + animT * 2.2) * 0.5 + 0.5) * 0.75;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  if (layoutType === 0) {
    // 0: Bottom classic spectrum bars (thickness varies from micro to huge)
    const barCount = 18 + Math.floor(rng() * 40);
    const padding = 3 + rng() * 4;
    const barWidth = (w - (barCount + 1) * padding) / barCount;
    const maxH = h * (0.35 + rng() * 0.25);

    for (let i = 0; i < barCount; i++) {
      const x = padding + i * (barWidth + padding);
      const freq = 1.8 + (i % 6) * 0.35 + rng() * 0.4;
      const heightVal =
        (Math.abs(Math.sin(t * freq + i * 0.3)) * 0.7 +
          Math.abs(Math.cos(t * 2.5 + i * 0.2)) * 0.3) *
        maxH;
      const y = h - heightVal - 20;

      ctx.save();
      const bGrad = ctx.createLinearGradient(x, h, x, y);
      bGrad.addColorStop(0, neon1);
      bGrad.addColorStop(0.5, neon2);
      bGrad.addColorStop(1, neon3);
      ctx.fillStyle = bGrad;
      ctx.shadowColor = neon2;
      ctx.shadowBlur = 12;
      ctx.fillRect(x, y, barWidth, heightVal);

      // Peak floating dot
      const peakY = y - 8 - Math.abs(Math.sin(t * 3.5 + i)) * 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, peakY, barWidth, 3.5);
      ctx.restore();
    }
  } else if (layoutType === 1) {
    // 1: Top hanging chandelier spectrum bars
    const barCount = 20 + Math.floor(rng() * 32);
    const padding = 4;
    const barWidth = (w - (barCount + 1) * padding) / barCount;
    const maxH = h * 0.42;

    for (let i = 0; i < barCount; i++) {
      const x = padding + i * (barWidth + padding);
      const heightVal =
        (Math.abs(Math.sin(t * 2.2 + i * 0.35)) * 0.7 +
          Math.abs(Math.cos(t * 1.8 + i * 0.2)) * 0.3) *
        maxH;

      ctx.save();
      const bGrad = ctx.createLinearGradient(x, 0, x, heightVal);
      bGrad.addColorStop(0, neon3);
      bGrad.addColorStop(0.6, neon2);
      bGrad.addColorStop(1, neon1);
      ctx.fillStyle = bGrad;
      ctx.shadowColor = neon3;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, 0, barWidth, heightVal);
      ctx.restore();
    }
  } else if (layoutType === 2) {
    // 2: Radial Ring Equalizer
    const cx = w * 0.5;
    const cy = h * 0.5;
    const baseRadius = Math.min(w, h) * (0.18 + rng() * 0.1);
    const rayCount = 36 + Math.floor(rng() * 36);

    ctx.save();
    ctx.shadowColor = neon3;
    ctx.shadowBlur = 15;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * 0.25;
      const rayLen =
        (Math.abs(Math.sin(t * 3.0 + i * 0.4)) * 0.7 +
          Math.abs(Math.cos(t * 2.0 + i * 0.2)) * 0.3) *
        (baseRadius * 0.95);

      const x1 = cx + Math.cos(angle) * baseRadius;
      const y1 = cy + Math.sin(angle) * baseRadius;
      const x2 = cx + Math.cos(angle) * (baseRadius + rayLen);
      const y2 = cy + Math.sin(angle) * (baseRadius + rayLen);

      const strokeGrad = ctx.createLinearGradient(x1, y1, x2, y2);
      strokeGrad.addColorStop(0, neon3);
      strokeGrad.addColorStop(1, neon1);

      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 3 + rng() * 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  } else if (layoutType === 3) {
    // 3: Mirrored Dual Horizon Waveform
    const barCount = 28 + Math.floor(rng() * 20);
    const barWidth = w / barCount;
    const centerY = h * 0.5;

    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const amp =
        (Math.abs(Math.sin(t * 3.2 + i * 0.25)) * 0.65 +
          Math.abs(Math.sin(t * 1.8 + i * 0.4)) * 0.35) *
        (h * 0.32);

      ctx.save();
      const waveGrad = ctx.createLinearGradient(x, centerY - amp, x, centerY + amp);
      waveGrad.addColorStop(0, neon1);
      waveGrad.addColorStop(0.5, neon2);
      waveGrad.addColorStop(1, neon3);

      ctx.fillStyle = waveGrad;
      ctx.fillRect(x + 2, centerY - amp, barWidth - 4, amp * 2);
      ctx.restore();
    }
  } else if (layoutType === 4) {
    // 4: Stereo Sidebars Equalizers (Left and Right)
    const barCount = 20;
    const barH = (h * 0.7) / barCount;
    const startY = h * 0.15;
    const maxBarW = w * 0.35;

    for (let i = 0; i < barCount; i++) {
      const y = startY + i * barH;
      const curW =
        (Math.abs(Math.sin(t * 2.8 + i * 0.4)) * 0.7 +
          Math.abs(Math.cos(t * 1.6 + i * 0.25)) * 0.3) *
        maxBarW;

      ctx.save();
      ctx.fillStyle = neon1;
      ctx.shadowColor = neon1;
      ctx.shadowBlur = 10;
      // Left bar
      ctx.fillRect(0, y + 2, curW, barH - 4);
      // Right bar
      ctx.fillStyle = neon3;
      ctx.shadowColor = neon3;
      ctx.fillRect(w - curW, y + 2, curW, barH - 4);
      ctx.restore();
    }
  } else if (layoutType === 5) {
    // 5: Multi-layer Neon Liquid Sine Waves
    const waveLayers = 4;
    for (let l = 0; l < waveLayers; l++) {
      ctx.save();
      ctx.beginPath();
      const centerY = h * (0.45 + l * 0.08);
      ctx.moveTo(0, centerY);

      for (let x = 0; x <= w; x += 10) {
        const y =
          centerY +
          Math.sin(x * 0.008 + t * (2 + l * 0.5) + l) * (35 + l * 15) +
          Math.cos(x * 0.015 - t * 1.5) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, centerY - 50, 0, h);
      waveGrad.addColorStop(0, l % 2 === 0 ? neon1 : neon3);
      waveGrad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = waveGrad;
      ctx.fill();

      // Sharp wave border
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = l % 2 === 0 ? neon1 : neon2;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  } else if (layoutType === 6) {
    // 6: Circular Starburst Audio Core (360-degree rays from center)
    const cx = w * 0.5;
    const cy = h * 0.5;
    const rayCount = 64;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayLen =
        Math.min(w, h) *
        (0.15 +
          0.3 *
            (Math.abs(Math.sin(t * 4.0 + i * 0.5)) * 0.7 +
              Math.abs(Math.cos(t * 2.0 + i * 0.2)) * 0.3));

      ctx.save();
      ctx.strokeStyle = i % 2 === 0 ? neon1 : neon3;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      ctx.stroke();
      ctx.restore();
    }
  } else if (layoutType === 7) {
    // 7: Matrix Dots Grid VU-Meter
    const cols = 20;
    const rows = 16;
    const dotW = w / (cols + 2);
    const dotH = (h * 0.55) / rows;
    const startY = h * 0.25;

    for (let c = 0; c < cols; c++) {
      const activeRows = Math.floor(
        (Math.abs(Math.sin(t * 3.0 + c * 0.3)) * 0.7 +
          Math.abs(Math.cos(t * 1.8 + c * 0.5)) * 0.3) *
          rows
      );

      for (let r = 0; r < rows; r++) {
        const rx = (c + 1) * dotW;
        const ry = startY + (rows - 1 - r) * dotH;
        const isActive = r <= activeRows;

        ctx.save();
        ctx.fillStyle = isActive
          ? r > rows * 0.8
            ? neon1
            : r > rows * 0.5
            ? neon2
            : neon3
          : 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(rx + dotW * 0.5, ry + dotH * 0.5, Math.min(dotW, dotH) * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (layoutType === 8) {
    // 8: Diagonal Futuristic Laser Bars
    const barCount = 18;
    const maxLen = Math.min(w, h) * 0.6;
    for (let i = 0; i < barCount; i++) {
      const cx = (i / barCount) * w;
      const cy = h * 0.5;
      const len =
        (Math.abs(Math.sin(t * 3.2 + i * 0.35)) * 0.7 +
          Math.abs(Math.cos(t * 2.0 + i * 0.2)) * 0.3) *
        maxLen;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = i % 2 === 0 ? neon1 : neon3;
      ctx.shadowColor = neon2;
      ctx.shadowBlur = 12;
      ctx.fillRect(-6, -len * 0.5, 12, len);
      ctx.restore();
    }
  } else if (layoutType === 9) {
    // 9: Hexagonal Pulsing Sound Core
    const cx = w * 0.5;
    const cy = h * 0.5;
    const hexSides = 6;
    for (let layer = 1; layer <= 5; layer++) {
      const radius =
        layer * 40 +
        Math.abs(Math.sin(t * 3.5 + layer)) * 30 +
        Math.abs(Math.cos(t * 2 + layer * 2)) * 15;

      ctx.save();
      ctx.strokeStyle = layer % 2 === 0 ? neon1 : neon3;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = neon2;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      for (let s = 0; s < hexSides; s++) {
        const a = (s / hexSides) * Math.PI * 2 + t * 0.2;
        const hx = cx + Math.cos(a) * radius;
        const hy = cy + Math.sin(a) * radius;
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  } else if (layoutType === 10) {
    // 10: Horizontal Floating Audio Bars (Left to Right)
    const barCount = 16;
    const barHeight = (h * 0.6) / barCount;
    const startY = h * 0.2;

    for (let i = 0; i < barCount; i++) {
      const y = startY + i * barHeight;
      const barLen =
        (Math.abs(Math.sin(t * 3.0 + i * 0.4)) * 0.7 +
          Math.abs(Math.cos(t * 1.5 + i * 0.2)) * 0.3) *
        (w * 0.75);

      ctx.save();
      const bGrad = ctx.createLinearGradient(w * 0.1, y, w * 0.1 + barLen, y);
      bGrad.addColorStop(0, neon3);
      bGrad.addColorStop(0.5, neon2);
      bGrad.addColorStop(1, neon1);
      ctx.fillStyle = bGrad;
      ctx.fillRect(w * 0.1, y + 3, barLen, barHeight - 6);
      ctx.restore();
    }
  } else if (layoutType === 11) {
    // 11: Curved Bottom Arch Spectrum (Amphitheater Arch)
    const isTopArch = orientationMode === 1;
    const cx = w * 0.5;
    const cy = isTopArch ? h * 0.05 : h * 0.95;
    const archRadius = Math.min(w, h) * 0.65;
    const rayCount = 38;

    for (let i = 0; i < rayCount; i++) {
      const baseAngle = isTopArch ? 0 : Math.PI;
      const angle = baseAngle + (i / (rayCount - 1)) * Math.PI;
      const rayLen =
        (Math.abs(Math.sin(t * 3.2 + i * 0.3)) * 0.7 +
          Math.abs(Math.cos(t * 2.0 + i * 0.2)) * 0.3) *
        (archRadius * 0.45);

      const x1 = cx + Math.cos(angle) * (archRadius - rayLen);
      const y1 = cy + Math.sin(angle) * (archRadius - rayLen);
      const x2 = cx + Math.cos(angle) * archRadius;
      const y2 = cy + Math.sin(angle) * archRadius;

      ctx.save();
      ctx.strokeStyle = i % 2 === 0 ? neon1 : neon3;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (layoutType === 12) {
    // ==========================================================
    // 12 (NEW 1): Неоновая осциллограмма с заполнением и пылью
    // ==========================================================
    drawBackgroundParticles();
    const centerY = orientationMode === 1 ? h * 0.35 : orientationMode === 2 ? h * 0.65 : h * 0.5;

    ctx.save();
    if (orientationMode === 3) {
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-0.06);
      ctx.translate(-w * 0.5, -h * 0.5);
    }

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (let x = 0; x <= w; x += 5) {
      const freq1 = Math.sin(x * 0.015 + t * 3) * 40;
      const freq2 = Math.cos(x * 0.03 - t * 2) * 20;
      const env = Math.sin((x / w) * Math.PI);
      const y = centerY + (freq1 + freq2) * env;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = neon3;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = neon2;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Дополнительная полупрозрачная волна гармоники
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    for (let x = 0; x <= w; x += 5) {
      const y = centerY + Math.sin(x * 0.02 + t * 4) * 25 * Math.sin((x / w) * Math.PI);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = neon1;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  } else if (layoutType === 13) {
    // ==========================================================
    // 13 (NEW 2): Симметричный вертикальный спектрум (Soundwave)
    // ==========================================================
    drawBackgroundParticles();
    const barCount = 70;
    const isVertical = orientationMode === 3;
    const centerY = h * 0.5;

    ctx.save();
    ctx.shadowBlur = 10;
    if (isVertical) {
      // 90-degree vertical orientation
      const barHeight = h / barCount;
      const centerX = w * 0.5;
      for (let i = 0; i < barCount; i++) {
        const y = i * barHeight;
        const env = Math.sin((i / barCount) * Math.PI);
        const amp = (Math.abs(Math.sin(t * 3 + i * 0.2)) * 0.7 + 0.3) * (w * 0.35) * env;

        const grad = createSpectrumGrad(centerX - amp, y, centerX + amp, y);
        ctx.fillStyle = grad;
        ctx.shadowColor = neon3;
        ctx.fillRect(centerX - amp, y + 1, amp * 2, barHeight - 2);
      }
    } else {
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const env = Math.sin((i / barCount) * Math.PI);
        const amp = (Math.abs(Math.sin(t * 3 + i * 0.2)) * 0.7 + 0.3) * (h * 0.35) * env;

        const grad = createSpectrumGrad(x, centerY - amp, x, centerY + amp);
        ctx.fillStyle = grad;
        ctx.shadowColor = neon3;
        ctx.fillRect(x + 1, centerY - amp, barWidth - 2, amp * 2);
      }
    }
    ctx.restore();
  } else if (layoutType === 14) {
    // ==========================================================
    // 14 (NEW 3): Блочный цифровой эквалайзер с отражением
    // ==========================================================
    const cols = 24;
    const rows = 16;
    const gap = 2.5;
    const blockW = (w - (cols + 1) * gap) / cols;
    const blockH = (h * 0.42) / rows;
    const startY = orientationMode === 1 ? h * 0.75 : orientationMode === 2 ? h * 0.35 : h * 0.5;

    ctx.save();
    for (let c = 0; c < cols; c++) {
      const activeRows = Math.floor(
        (Math.abs(Math.sin(t * 2.5 + c * 0.3)) * 0.7 + 0.3) * rows
      );

      for (let r = 0; r < rows; r++) {
        const x = gap + c * (blockW + gap);
        const y = startY - (r + 1) * (blockH + gap);
        const reflectY = startY + r * (blockH + gap) + gap * 2;

        if (r < activeRows) {
          // Цвета по высоте (neon3 -> neon2 -> neon1)
          ctx.fillStyle = r > rows * 0.7 ? neon1 : r > rows * 0.4 ? neon2 : neon3;

          // Верхние блоки
          ctx.fillRect(x, y, blockW, blockH);

          // Нижнее зеркальное отражение
          ctx.save();
          ctx.globalAlpha = 0.28 - (r / rows) * 0.22;
          ctx.fillRect(x, reflectY, blockW, blockH);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  } else if (layoutType === 15) {
    // ==========================================================
    // 15 (NEW 4): Тонкие полосы с круглой вершиной и отражением
    // ==========================================================
    drawBackgroundParticles();
    const barCount = 40;
    const gap = 4;
    const barW = (w - (barCount + 1) * gap) / barCount;
    const isHanging = orientationMode === 1;
    const startY = isHanging ? h * 0.45 : h * 0.55;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const x = gap + i * (barW + gap);
      const amp = (Math.abs(Math.sin(t * 3.5 + i * 0.25)) * 0.75 + 0.25) * (h * 0.35);

      if (isHanging) {
        // Свисающие сверху вниз со стеклянным отражением
        const grad = createSpectrumGrad(x, startY, x, startY + amp);
        ctx.fillStyle = grad;
        ctx.shadowColor = neon3;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(x, startY, barW, amp, [0, 0, barW / 2, barW / 2]);
        ctx.fill();

        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.roundRect(x, startY - amp * 0.6 - 4, barW, amp * 0.6, [barW / 2, barW / 2, 0, 0]);
        ctx.fill();
        ctx.restore();
      } else {
        const grad = createSpectrumGrad(x, startY, x, startY - amp);
        ctx.fillStyle = grad;
        ctx.shadowColor = neon3;
        ctx.shadowBlur = 8;

        // Основной столбец
        ctx.beginPath();
        ctx.roundRect(x, startY - amp, barW, amp, [barW / 2, barW / 2, 0, 0]);
        ctx.fill();

        // Отражение
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.roundRect(x, startY + 4, barW, amp * 0.6, [0, 0, barW / 2, barW / 2]);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  } else if (layoutType === 16) {
    // ==========================================================
    // 16 (NEW 5): Зеркальный точечный спектр (Dot Matrix Spectrum)
    // ==========================================================
    const cols = 45;
    const dotsPerCol = 14;
    const dotRadius = Math.min(w / cols, h / dotsPerCol) * 0.24;
    const stepX = w / cols;
    const stepY = (h * 0.36) / dotsPerCol;
    const centerY = orientationMode === 1 ? h * 0.4 : orientationMode === 2 ? h * 0.6 : h * 0.5;

    ctx.save();
    for (let c = 0; c < cols; c++) {
      const activeDots = Math.floor(
        (Math.abs(Math.sin(t * 3 + c * 0.2)) * 0.8 + 0.2) * dotsPerCol
      );

      for (let d = 0; d < activeDots; d++) {
        const x = c * stepX + stepX * 0.5;
        const offset = d * stepY;

        // Динамический цвет точек
        const ratio = d / dotsPerCol;
        ctx.fillStyle = ratio > 0.6 ? neon1 : ratio > 0.3 ? neon2 : neon3;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;

        // Точка вверх
        ctx.beginPath();
        ctx.arc(x, centerY - offset, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Точка вниз
        ctx.beginPath();
        ctx.arc(x, centerY + offset, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (layoutType === 17) {
    // ==========================================================
    // 17 (NEW 6): Плотная пиксельная сетка с яркой неоновой линией
    // ==========================================================
    const cols = 60;
    const rows = 20;
    const cellW = w / cols;
    const cellH = (h * 0.42) / rows;
    const isTopBase = orientationMode === 1;
    const baseY = isTopBase ? h * 0.35 : h * 0.65;

    ctx.save();
    // Яркое неоновое основание
    ctx.shadowColor = neon3;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, baseY, w, 2.5);

    for (let c = 0; c < cols; c++) {
      const activeRows = Math.floor(
        (Math.abs(Math.sin(t * 2.8 + c * 0.15)) * 0.8 + 0.2) * rows
      );

      for (let r = 0; r < activeRows; r++) {
        const x = c * cellW;
        const y = isTopBase ? baseY + (r + 1) * cellH : baseY - (r + 1) * cellH;

        ctx.fillStyle = r > rows * 0.6 ? neon1 : r > rows * 0.3 ? neon2 : neon3;
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
      }
    }
    ctx.restore();
  } else if (layoutType === 18) {
    // ==========================================================
    // 18 (NEW 7): Пересекающиеся синусоиды (Аудиоволна)
    // ==========================================================
    const centerY = orientationMode === 1 ? h * 0.4 : orientationMode === 2 ? h * 0.6 : h * 0.5;
    const waveCount = 5;

    ctx.save();
    ctx.shadowBlur = 12;

    for (let wIdx = 0; wIdx < waveCount; wIdx++) {
      ctx.beginPath();
      const phase = t * (2 + wIdx * 0.5);
      const color = wIdx % 3 === 0 ? neon1 : wIdx % 3 === 1 ? neon2 : neon3;

      for (let x = 0; x <= w; x += 4) {
        const env = Math.sin((x / w) * Math.PI);
        const y =
          centerY +
          Math.sin(x * 0.02 + phase + wIdx) * (30 + wIdx * 9) * env;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  } else if (layoutType === 19) {
    // ==========================================================
    // 19 (NEW 8): Изогнутая динамическая аудиолента (Curved Ribbon)
    // ==========================================================
    drawBackgroundParticles();
    const barCount = 80;
    const stepX = w / barCount;
    const centerY = h * 0.5;
    const curveAmp = orientationMode === 1 ? 65 : 45;

    ctx.save();
    ctx.shadowColor = neon3;
    ctx.shadowBlur = 10;

    for (let i = 0; i < barCount; i++) {
      const x = i * stepX;
      // Изгиб центральной линии (синусоида)
      const curveY = centerY + Math.sin(x * 0.008 + t * 1.5) * curveAmp;
      const amp = (Math.abs(Math.sin(t * 3.5 + i * 0.2)) * 0.7 + 0.3) * 38;

      const grad = ctx.createLinearGradient(x, curveY - amp, x, curveY + amp);
      grad.addColorStop(0, neon1);
      grad.addColorStop(0.5, neon2);
      grad.addColorStop(1, neon3);

      ctx.fillStyle = grad;
      ctx.fillRect(x, curveY - amp, stepX * 0.75, amp * 2);
    }
    ctx.restore();
  } else if (layoutType === 20) {
    // ==========================================================
    // 20 (IMAGE 1): Multi-band Rainbow EQ Bars + Flowing String Wave Mesh
    // ==========================================================
    const barCount = 72;
    const gap = 3;
    const barW = (w - (barCount + 1) * gap) / barCount;
    const centerY = h * 0.5;

    // 1. Color clusters for vertical EQ bars (Green -> Blue -> Magenta -> Gold)
    const getBarColor = (indexRatio: number, r: number) => {
      if (indexRatio < 0.25) return '#10b981'; // Emerald Green
      if (indexRatio < 0.50) return '#06b6d4'; // Electric Cyan/Blue
      if (indexRatio < 0.75) return '#ec4899'; // Neon Magenta/Pink
      return '#f59e0b'; // Amber / Gold
    };

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const x = gap + i * (barW + gap);
      const ratio = i / barCount;
      // 4 resonant peaks across the screen
      const bell1 = Math.exp(-Math.pow((ratio - 0.15) * 8, 2));
      const bell2 = Math.exp(-Math.pow((ratio - 0.38) * 8, 2));
      const bell3 = Math.exp(-Math.pow((ratio - 0.62) * 8, 2));
      const bell4 = Math.exp(-Math.pow((ratio - 0.85) * 8, 2));
      const totalBell = bell1 * 0.95 + bell2 * 0.85 + bell3 * 1.0 + bell4 * 0.9;

      const dynamicAmp = (Math.sin(t * 3.5 + i * 0.3) * 0.35 + 0.65) * (h * 0.38) * totalBell;
      const barColor = getBarColor(ratio, i);

      // Sliced glowing vertical bars
      const sliceH = 6;
      const sliceGap = 2;
      const totalSlices = Math.floor(dynamicAmp / (sliceH + sliceGap));

      for (let s = -totalSlices; s <= totalSlices; s++) {
        if (s === 0) continue;
        const sy = centerY + s * (sliceH + sliceGap);
        const intensity = 1 - Math.abs(s) / (totalSlices + 2);
        ctx.fillStyle = barColor;
        ctx.globalAlpha = 0.35 + intensity * 0.65;
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, sy, barW, sliceH);
      }
    }
    ctx.restore();

    // 2. Horizontal flowing wireframe wave lines (10 overlapping harmonic lines)
    ctx.save();
    for (let l = 0; l < 10; l++) {
      ctx.beginPath();
      const linePhase = t * 2.2 + l * 0.4;
      const lineFreq = 0.008 + l * 0.0012;
      for (let x = 0; x <= w; x += 6) {
        const env = Math.sin((x / w) * Math.PI);
        const y = centerY + (Math.sin(x * lineFreq + linePhase) * 60 + Math.cos(x * 0.02 - linePhase * 0.7) * 25) * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.45 + (l % 2) * 0.35;
      ctx.lineWidth = l === 4 ? 2.5 : 1.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();
    }
    ctx.restore();
  } else if (layoutType === 21) {
    // ==========================================================
    // 21 (IMAGE 2): Intertwined Glowing Wireframe Ribbon Bundles + Dark Grid
    // ==========================================================
    // Subtle background perspective grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = Math.max(30, Math.floor(w / 28));
    for (let x = 0; x <= w; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    const centerY = h * 0.5;
    const ribbons = [
      { color: '#00f2fe', freq: 0.009, amp: 85, phaseSpeed: 2.0 },
      { color: '#f72585', freq: 0.011, amp: 95, phaseSpeed: -1.8 },
      { color: '#4ade80', freq: 0.008, amp: 75, phaseSpeed: 2.3 },
      { color: '#ffffff', freq: 0.013, amp: 65, phaseSpeed: -2.1 },
    ];

    ctx.save();
    ribbons.forEach((rib, rIdx) => {
      // Draw bundle of 8 parallel wireframe lines per ribbon
      const lineCount = 8;
      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();
        const offsetPhase = (i - lineCount / 2) * 0.15;
        const lineAmp = rib.amp + (i - lineCount / 2) * 6;
        for (let x = 0; x <= w; x += 5) {
          const env = Math.sin((x / w) * Math.PI);
          const y = centerY + Math.sin(x * rib.freq + t * rib.phaseSpeed + offsetPhase) * lineAmp * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rib.color;
        ctx.globalAlpha = i === Math.floor(lineCount / 2) ? 0.95 : 0.45;
        ctx.lineWidth = i === Math.floor(lineCount / 2) ? 3.0 : 1.2;
        ctx.shadowColor = rib.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
      }
    });
    ctx.restore();
  } else if (layoutType === 22) {
    // ==========================================================
    // 22 (IMAGE 3): Volumetric Dotted Point-Cloud Audio Ribbon
    // ==========================================================
    drawBackgroundParticles();
    const cols = 90;
    const rows = 24;
    const stepX = w / cols;
    const centerY = h * 0.5;

    ctx.save();
    for (let c = 0; c < cols; c++) {
      const x = c * stepX;
      const ratio = c / cols;
      const env = Math.sin(ratio * Math.PI);

      for (let r = 0; r < rows; r++) {
        const rRatio = (r - rows / 2) / (rows / 2);
        const wave1 = Math.sin(x * 0.012 + t * 2.5 + r * 0.2) * 90;
        const wave2 = Math.cos(x * 0.02 - t * 1.8) * 35;
        const y = centerY + (wave1 + wave2) * env + rRatio * (70 * env);

        const dotSize = Math.max(1.2, (1 - Math.abs(rRatio) * 0.5) * 2.6);
        const colProg = (ratio * 0.6 + Math.abs(rRatio) * 0.4);
        ctx.fillStyle = colProg < 0.4 ? '#3b82f6' : colProg < 0.7 ? '#8b5cf6' : '#ec4899';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 6;
        ctx.globalAlpha = 0.35 + (1 - Math.abs(rRatio)) * 0.6;

        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (layoutType === 23) {
    // ==========================================================
    // 23 (IMAGE 4): Luminous Fluid Gradient Soundwave Ribbon + Floor Mirror
    // ==========================================================
    const centerY = h * 0.48;

    ctx.save();
    // Ambient color glow behind ribbon
    const glowCenter = ctx.createRadialGradient(w * 0.5, centerY, 10, w * 0.5, centerY, w * 0.55);
    glowCenter.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
    glowCenter.addColorStop(0.4, 'rgba(6, 182, 212, 0.18)');
    glowCenter.addColorStop(0.7, 'rgba(236, 72, 153, 0.15)');
    glowCenter.addColorStop(1, 'transparent');
    ctx.fillStyle = glowCenter;
    ctx.fillRect(0, 0, w, h);

    const waves = [
      { color1: '#f97316', color2: '#06b6d4', amp: 110, freq: 0.007, speed: 2.2, width: 6 },
      { color1: '#ec4899', color2: '#a855f7', amp: 95, freq: 0.010, speed: -1.9, width: 4.5 },
      { color1: '#38bdf8', color2: '#22c55e', amp: 75, freq: 0.013, speed: 2.6, width: 3.5 },
    ];

    waves.forEach((wv) => {
      // Top main wave
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const env = Math.sin((x / w) * Math.PI);
        const y = centerY - Math.sin(x * wv.freq + t * wv.speed) * wv.amp * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, centerY - wv.amp, w, centerY);
      grad.addColorStop(0, wv.color1);
      grad.addColorStop(1, wv.color2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = wv.width;
      ctx.shadowColor = wv.color1;
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Bottom mirror wave (reflection)
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const env = Math.sin((x / w) * Math.PI);
        const y = centerY + Math.sin(x * wv.freq + t * wv.speed) * (wv.amp * 0.7) * env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grad;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = wv.width * 0.8;
      ctx.shadowColor = wv.color2;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  } else if (layoutType === 24) {
    // ==========================================================
    // 24 (IMAGE 5): 3D Volumetric Rolling Landscape Waveform Mesh
    // ==========================================================
    const ridgeCount = 20;
    const baseY = h * 0.78;

    ctx.save();
    for (let r = 0; r < ridgeCount; r++) {
      const depthRatio = r / ridgeCount;
      const ridgeY = baseY - depthRatio * (h * 0.45);
      const amp = (1 - depthRatio * 0.4) * 55;
      const phase = t * 2.0 - r * 0.35;

      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) {
        const wave =
          Math.sin(x * 0.008 + phase) * amp +
          Math.cos(x * 0.016 - phase * 0.6) * (amp * 0.45);
        ctx.lineTo(x, ridgeY - wave);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      // Ridge depth coloring (Magenta -> Cyan -> Sunset Gold)
      const rGrad = ctx.createLinearGradient(0, ridgeY - amp, w, ridgeY + 20);
      rGrad.addColorStop(0, depthRatio < 0.5 ? '#ec4899' : '#06b6d4');
      rGrad.addColorStop(0.5, depthRatio < 0.5 ? '#a855f7' : '#38bdf8');
      rGrad.addColorStop(1, '#f97316');

      ctx.fillStyle = 'rgba(5, 7, 20, 0.85)';
      ctx.fill();

      ctx.strokeStyle = rGrad;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.restore();
  } else if (layoutType === 25) {
    // ==========================================================
    // 25 (IMAGE 6): Multi-Laser Sine Strands with Glossy Floor Reflection
    // ==========================================================
    const floorY = h * 0.72;

    ctx.save();
    // Glossy reflective floor baseline
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, 'rgba(30, 27, 75, 0.55)');
    floorGrad.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    const lasers = [
      { color: '#38bdf8', amp: 130, freq: 0.009, speed: 2.2 },
      { color: '#c084fc', amp: 100, freq: 0.013, speed: -1.7 },
      { color: '#fb923c', amp: 70, freq: 0.017, speed: 2.6 },
    ];

    lasers.forEach((ls) => {
      // 1. Direct laser beam
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const rawY = floorY - Math.abs(Math.sin(x * ls.freq + t * ls.speed)) * ls.amp;
        if (x === 0) ctx.moveTo(x, rawY);
        else ctx.lineTo(x, rawY);
      }
      ctx.strokeStyle = ls.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = ls.color;
      ctx.shadowBlur = 20;
      ctx.stroke();

      // 2. Glossy floor reflection bounce
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const bounceY = floorY + Math.abs(Math.sin(x * ls.freq + t * ls.speed)) * (ls.amp * 0.35);
        if (x === 0) ctx.moveTo(x, bounceY);
        else ctx.lineTo(x, bounceY);
      }
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });
    ctx.restore();
  } else if (layoutType === 26) {
    // ==========================================================
    // 26 (IMAGE 7): Stacked Parallel Neon Ribbon Frequency Curves + Central Pulse
    // ==========================================================
    const strandCount = 14;
    const centerY = h * 0.5;

    ctx.save();
    for (let s = 0; s < strandCount; s++) {
      const strandRatio = s / strandCount;
      const sColor = strandRatio < 0.35 ? '#ef4444' : strandRatio < 0.7 ? '#06b6d4' : '#8b5cf6';
      const offset = (s - strandCount / 2) * 14;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const normX = x / w;
        // Central peak burst envelope
        const peakEnvelope = Math.exp(-Math.pow((normX - 0.5) * 5, 2));
        const y = centerY + offset + (Math.sin(normX * 18 + t * 3.2) * 80 + Math.sin(normX * 8 - t * 2) * 40) * peakEnvelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = sColor;
      ctx.lineWidth = 2.8;
      ctx.shadowColor = sColor;
      ctx.shadowBlur = 14;
      ctx.stroke();
    }
    ctx.restore();
  } else if (layoutType === 27) {
    // ==========================================================
    // 27 (IMAGE 8): Layered Topographic Neon Sound Wave Iso-Lines
    // ==========================================================
    const layerCount = 28;
    const baseY = h * 0.82;
    const stepY = (h * 0.42) / layerCount;

    ctx.save();
    for (let l = 0; l < layerCount; l++) {
      const lineY = baseY - l * stepY;
      const layerProg = l / layerCount;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const normX = x / w;
        // Mountain harmonic soundwave crests
        const hill1 = Math.exp(-Math.pow((normX - 0.35) * 6, 2)) * 65;
        const hill2 = Math.exp(-Math.pow((normX - 0.75) * 5, 2)) * 80;
        const wave = Math.sin(normX * 10 + t * 2.5 + l * 0.15) * (15 + layerProg * 25);
        const y = lineY - (hill1 + hill2 + wave) * layerProg;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Left-to-Right Cyan to Magenta gradient
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      lineGrad.addColorStop(0, '#00f2fe');
      lineGrad.addColorStop(0.5, '#38bdf8');
      lineGrad.addColorStop(1, '#ec4899');

      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = l === 0 ? 3.0 : 1.8;
      ctx.shadowColor = layerProg > 0.5 ? '#ec4899' : '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // ==========================================================
    // Default Radial Neon Equalizer Core
    // ==========================================================
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = Math.min(w, h) * (0.2 + (orientationMode === 1 ? 0.05 : 0));
    const rayCount = 90;
    const spinSpeed = (orientationMode % 2 === 0 ? 1 : -1) * 0.3;

    ctx.save();
    ctx.shadowColor = neon3;
    ctx.shadowBlur = 14;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * spinSpeed;
      const amp = (Math.abs(Math.sin(t * 4 + i * 0.3)) * 0.7 + 0.3) * 48;

      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius + amp);
      const y2 = cy + Math.sin(angle) * (radius + amp);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, neon1);
      grad.addColorStop(0.5, neon2);
      grad.addColorStop(1, neon3);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/* ================= 8. DYNAMIC GEOMETRY ================= */
function drawShapes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Diverse dynamic background gradient driven by seed
  const bgTheme = Math.floor(rng() * 5);
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  if (bgTheme === 0) {
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e1b4b');
    bgGrad.addColorStop(1, '#31122b');
  } else if (bgTheme === 1) {
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#0f766e');
    bgGrad.addColorStop(1, '#020617');
  } else if (bgTheme === 2) {
    bgGrad.addColorStop(0, '#450a0a');
    bgGrad.addColorStop(0.5, '#581c87');
    bgGrad.addColorStop(1, '#09090b');
  } else if (bgTheme === 3) {
    bgGrad.addColorStop(0, '#180e29');
    bgGrad.addColorStop(0.5, '#0284c7');
    bgGrad.addColorStop(1, '#090a1a');
  } else {
    bgGrad.addColorStop(0, '#1e1005');
    bgGrad.addColorStop(0.5, '#431407');
    bgGrad.addColorStop(1, '#0c0a09');
  }
  if (!skipSolidBg) {
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Generate 35 shapes with extreme size ranges (from micro crystals 10px to gigantic 550px wireframe structures!)
  const shapeCount = 35;
  const colors = ['#f43f5e', '#a855f7', '#38bdf8', '#34d399', '#facc15', '#fb7185', '#c084fc'];

  for (let i = 0; i < shapeCount; i++) {
    const shapeType = Math.floor(rng() * 6); // 0: Circle, 1: Square, 2: Triangle, 3: Ring, 4: Hexagon, 5: Diamond
    const isGiant = i < 4; // 4 gigantic structural shapes crossing the whole screen!
    const isMicro = i > 26; // micro floating particles

    let baseSize = 40;
    if (isGiant) {
      baseSize = 260 + rng() * 260; // 260px to 520px!
    } else if (isMicro) {
      baseSize = 8 + rng() * 18; // 8px to 26px
    } else {
      baseSize = 25 + rng() * 85; // 25px to 110px
    }

    const scalePulse = 0.85 + 0.25 * Math.sin(t * (1 + rng()) + i);
    const size = baseSize * scalePulse;

    const speedX = (rng() - 0.5) * (isGiant ? 15 : 45);
    const speedY = (rng() - 0.5) * (isGiant ? 15 : 45);
    const rotSpeed = (rng() - 0.5) * (isGiant ? 0.6 : 2.0);

    const initialX = rng() * w;
    const initialY = rng() * h;

    const x = (initialX + t * speedX + Math.sin(t * 0.8 + i) * 35 + w * 2) % w;
    const y = (initialY + t * speedY + Math.cos(t * 0.8 + i) * 35 + h * 2) % h;
    const rot = t * rotSpeed + i * 0.6;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    const color = colors[i % colors.length];
    ctx.globalAlpha = isGiant ? 0.12 : isMicro ? 0.4 + 0.4 * Math.sin(t * 3 + i) : 0.7 + 0.3 * Math.sin(t * 2 + i);

    if (isGiant) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
    } else {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
    }

    ctx.beginPath();
    if (shapeType === 0) {
      // Circle
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    } else if (shapeType === 1) {
      // Square
      const half = size * 0.5;
      ctx.rect(-half, -half, size, size);
    } else if (shapeType === 2) {
      // Triangle
      const r = size * 0.6;
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.866, r * 0.5);
      ctx.lineTo(-r * 0.866, r * 0.5);
      ctx.closePath();
    } else if (shapeType === 3) {
      // Ring
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      if (!isGiant) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 4.5;
      }
    } else if (shapeType === 4) {
      // Hexagon
      const r = size * 0.5;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const hx = Math.cos(a) * r;
        const hy = Math.sin(a) * r;
        if (k === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    } else {
      // Diamond
      const r = size * 0.5;
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.65, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.65, 0);
      ctx.closePath();
    }

    if (isGiant || shapeType === 3) {
      ctx.stroke();
    } else {
      ctx.fill();
    }

    ctx.restore();
  }
}

/* ================= 9. EMOJI UNIVERSE ================= */
function drawEmojis(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false
) {
  // Surreal space void / neon dimension background
  const bgTheme = Math.floor(rng() * 5);
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.85);
  if (bgTheme === 0) {
    bgGrad.addColorStop(0, '#2e1065');
    bgGrad.addColorStop(0.5, '#0f0a2a');
    bgGrad.addColorStop(1, '#030210');
  } else if (bgTheme === 1) {
    bgGrad.addColorStop(0, '#500724');
    bgGrad.addColorStop(0.5, '#18020a');
    bgGrad.addColorStop(1, '#09090b');
  } else if (bgTheme === 2) {
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#020617');
  } else if (bgTheme === 3) {
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#030712');
  } else {
    bgGrad.addColorStop(0, '#31122b');
    bgGrad.addColorStop(0.5, '#1e1005');
    bgGrad.addColorStop(1, '#050208');
  }
  if (!skipSolidBg) {
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Comprehensive multi-category rich emoji library (280+ standard emojis)
  const fullEmojiLibrary = [
    // 1. Reactions & Gestures (likes, dislikes, claps, peace, prayer, etc.)
    '👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '🤏',
    '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '✍️', '🙏', '🦾', '💪',
    // 2. Popular Expressions & Faces
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
    '😇', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
    '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
    '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '🥺', '😭', '😱', '😤', '😡',
    '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
    // 3. Hearts, Stars, Fire, 100 & High-Energy Symbols
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
    '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💯', '🔥', '⚡', '💥', '✨',
    '🌟', '⭐️', '💫', '☀️', '🌙', '🪐', '🌈', '🌊', '💨', '💦', '🫧', '💤',
    // 4. Celebrations, Trophies, Luxury & Fun
    '👑', '💎', '💍', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎉', '🎊', '🎈',
    '🎁', '🚀', '🛸', '🎯', '🎲', '🎰', '🎮', '🎳', '🎸', '🎹', '🥁', '🎷',
    '🎺', '🎻', '🎤', '🎧', '🎬', '🎨', '🎭', '🎪', '🪄', '🔮', '🧿', '💡',
    '💵', '💰', '💳', '🪙', '📦', '🔔', '📢', '📣', '🚗', '🏎️', '⛵', '✈️',
    // 5. Animals, Nature & Magic
    '🦄', '🦊', '🐱', '🐶', '🦁', '🐯', '🐼', '🐨', '🐻', '🐵', '🐸', '🐙',
    '🦀', '🦋', '🐝', '🐞', '🐢', '🐬', '🐳', '🦈', '🐊', '🦖', '🦕', '🦅',
    '🦉', '🦩', '🦚', '🦜', '🌸', '🌺', '🌻', '🌹', '🍀', '🌴', '🌲', '🍁', '🍄',
    // 6. Food & Treats
    '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍦', '🍨', '🎂', '🍰', '🧁', '🍫',
    '🍬', '🍭', '🍓', '🍒', '🥑', '🌮', '🍣', '🍙', '☕', '🧃', '🥤', '🍺', '🥂', '🍾'
  ];

  // Guaranteed hero reactions to mix in alongside random choices
  const heroReactions = ['👍', '👎', '❤️', '🔥', '💯', '👑', '🚀', '👏', '🥳', '😎', '💀', '🎉'];

  // Pick 24 distinct emojis for this universe
  const chosenEmojis: string[] = [];
  // Include 4 curated core heroes
  for (let h = 0; h < 4; h++) {
    const hIdx = Math.floor(rng() * heroReactions.length);
    if (!chosenEmojis.includes(heroReactions[hIdx])) {
      chosenEmojis.push(heroReactions[hIdx]);
    }
  }
  // Fill remaining from the comprehensive library
  while (chosenEmojis.length < 24) {
    const idx = Math.floor(rng() * fullEmojiLibrary.length);
    const em = fullEmojiLibrary[idx];
    if (!chosenEmojis.includes(em)) {
      chosenEmojis.push(em);
    }
  }

  // Render 36 emojis ranging from GIANT hero objects (380px) to micro dust (16px)
  const count = 36;
  for (let i = 0; i < count; i++) {
    const emoji = chosenEmojis[i % chosenEmojis.length];
    const isGiant = i < 3; // 3 giant background floating emojis
    const isMicro = i > 28; // micro dust emojis

    let baseFontSize = 48;
    if (isGiant) {
      baseFontSize = 240 + rng() * 160; // 240px to 400px!
    } else if (isMicro) {
      baseFontSize = 14 + rng() * 16; // 14px to 30px
    } else {
      baseFontSize = 42 + rng() * 68; // 42px to 110px
    }

    const scalePulse = 0.9 + 0.2 * Math.sin(t * 1.5 + i);
    const fontSize = baseFontSize * scalePulse;

    const speedY = isGiant ? -12 - rng() * 10 : isMicro ? -45 - rng() * 30 : -25 - rng() * 40;
    const swayAmp = isGiant ? 15 : 30 + rng() * 25;
    const swayFreq = 0.8 + rng() * 1.2;

    const initialX = rng() * w;
    const initialY = rng() * h;

    const y = (initialY + t * speedY + h * 2) % (h + fontSize * 2) - fontSize;
    const x = initialX + Math.sin(t * swayFreq + i * 2) * swayAmp;
    const rot = (Math.sin(t * 0.8 + i) * 0.25) + (isGiant ? 0 : t * 0.3);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.globalAlpha = isGiant ? 0.16 : isMicro ? 0.4 + 0.4 * Math.sin(t * 3 + i) : 0.88 + 0.12 * Math.sin(t * 2 + i);
    if (!isGiant) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowBlur = isMicro ? 4 : 16;
    }

    ctx.font = `${Math.floor(fontSize)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    ctx.restore();
  }
}

/* ================= 10. MATRIX DIGITAL RAIN & CODE DECODE ================= */
function drawMatrix(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false,
  options?: ProceduralMoodRenderOptions
) {
  // Available directions & color themes
  const directions: MatrixDirection[] = [
    'top-down',
    'bottom-up',
    'left-right',
    'right-left',
    'edges-to-center',
    'center-to-edges',
  ];
  const colorThemes: MatrixColorTheme[] = [
    'classic-green',
    'cyber-cyan',
    'neon-purple',
    'amber-gold',
    'red-alert',
    'rainbow',
    'random-shift',
  ];

  // Resolve direction and color theme (either from options or deterministic seed fallback)
  const dirIndex = Math.abs(seed) % directions.length;
  const colIndex = Math.abs(Math.floor(seed * 7)) % colorThemes.length;
  const direction: MatrixDirection = options?.direction || directions[dirIndex];
  const colorTheme: MatrixColorTheme = options?.colorTheme || colorThemes[colIndex];

  // Palette color definitions
  let primaryCol = '#00ff66';
  let leadCol = '#6ee7b7';
  let tailCol = '#059669';
  let fadeCol = '#022c15';
  let glowCol = '#10b981';
  let radialCenter = '#012613';

  if (colorTheme === 'cyber-cyan') {
    primaryCol = '#00f0ff';
    leadCol = '#a5f3fc';
    tailCol = '#0284c7';
    fadeCol = '#082f49';
    glowCol = '#06b6d4';
    radialCenter = '#021b2d';
  } else if (colorTheme === 'neon-purple') {
    primaryCol = '#e879f9';
    leadCol = '#f5d0fe';
    tailCol = '#c026d3';
    fadeCol = '#3b0764';
    glowCol = '#d946ef';
    radialCenter = '#200530';
  } else if (colorTheme === 'amber-gold') {
    primaryCol = '#facc15';
    leadCol = '#fef08a';
    tailCol = '#d97706';
    fadeCol = '#451a03';
    glowCol = '#f59e0b';
    radialCenter = '#261401';
  } else if (colorTheme === 'red-alert') {
    primaryCol = '#f43f5e';
    leadCol = '#fecdd3';
    tailCol = '#e11d48';
    fadeCol = '#450a0a';
    glowCol = '#ef4444';
    radialCenter = '#2a050a';
  }

  // Draw cyber black background with subtle colored central ambient glow
  if (!skipSolidBg) {
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    bgGrad.addColorStop(0, colorTheme === 'rainbow' ? '#09081a' : radialCenter);
    bgGrad.addColorStop(0.55, '#040508');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Base glyph sizing synchronized with user font size
  const userFontSize = options?.fontSize || 80;
  const bitSize = Math.max(13, Math.min(42, Math.round(userFontSize * 0.28)));
  const stepX = Math.round(bitSize * 1.35);
  const stepY = Math.round(bitSize * 1.3);

  // Character sets (bits 0/1, hex, cyber symbols, and active phrase chars for decoding)
  const baseSymbols = ['0', '1', '1', '0', '0', '1', 'λ', '0x', '7', 'F', 'Z', '9', 'X', 'Ø', '∑', '§', 'Δ', 'Ω', '0', '1'];
  
  // Extract uppercase characters from active text for center morph effect
  const samplePhrase = (options?.activeSegmentText || options?.rawText || 'MATRIX CODE').toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');
  const morphChars = samplePhrase.length > 0 ? samplePhrase.split('') : ['M', 'A', 'T', 'R', 'I', 'X'];

  ctx.save();
  ctx.font = `700 ${bitSize}px "Courier New", "Lucida Console", "Rubik Mono One", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Render streams based on selected direction
  if (direction === 'top-down' || direction === 'bottom-up') {
    const colCount = Math.floor(w / stepX) + 1;
    const totalHeight = h + bitSize * 24;

    for (let c = 0; c < colCount; c++) {
      const colX = c * stepX + stepX * 0.5;
      const speed = 140 + ((c * 37 + seed * 13) % 180);
      const streamLen = 14 + ((c * 19 + seed * 7) % 18);
      const colOffset = (c * 173 + seed * 97) % totalHeight;

      let headY = 0;
      if (direction === 'top-down') {
        headY = ((t * speed + colOffset) % totalHeight) - bitSize * 10;
      } else {
        headY = h + bitSize * 10 - ((t * speed + colOffset) % totalHeight);
      }

      // Stream color calculation (for rainbow or random-shift)
      let colPrimary = primaryCol;
      let colLead = leadCol;
      let colGlow = glowCol;

      if (colorTheme === 'rainbow') {
        const hue = (c * 14 + t * 40) % 360;
        colPrimary = `hsl(${hue}, 100%, 60%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 100%, 50%)`;
      } else if (colorTheme === 'random-shift') {
        const hue = ((c * 53 + seed * 23) % 360 + Math.sin(t * 1.5 + c) * 35 + 360) % 360;
        colPrimary = `hsl(${hue}, 95%, 62%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 90%, 55%)`;
      }

      for (let k = 0; k < streamLen; k++) {
        let charY = 0;
        if (direction === 'top-down') {
          charY = headY - k * stepY;
        } else {
          charY = headY + k * stepY;
        }

        if (charY < -bitSize * 2 || charY > h + bitSize * 2) continue;

        // Check if glyph is inside central text decoding zone
        const isCenterZone =
          colX > w * 0.18 &&
          colX < w * 0.82 &&
          charY > h * 0.35 &&
          charY < h * 0.65;

        // Dynamic glyph cycling
        const charSeed = Math.floor(t * 8 + c * 31 + k * 17);
        let char = '';
        if (isCenterZone && ((charSeed + k) % 3 === 0)) {
          // Morph into letters from the text!
          char = morphChars[(charSeed + c + k) % morphChars.length];
        } else {
          char = baseSymbols[(charSeed + k) % baseSymbols.length];
        }

        const isHead = k === 0;
        const isNearHead = k <= 2;
        const fadeRatio = 1 - k / streamLen;
        const alpha = isHead ? 1 : Math.max(0.08, Math.pow(fadeRatio, 1.4) * 0.92);

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isHead) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = Math.min(22, bitSize * 0.85);
        } else if (isNearHead) {
          ctx.fillStyle = colLead;
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = colPrimary;
          if (k % 4 === 0) {
            ctx.shadowColor = colGlow;
            ctx.shadowBlur = 6;
          }
        }

        // Slight font size boost for center letters
        if (isCenterZone && isNearHead) {
          ctx.font = `900 ${Math.round(bitSize * 1.15)}px "Courier New", monospace`;
        }

        ctx.fillText(char, colX, charY);
        ctx.restore();
      }
    }
  } else if (direction === 'left-right' || direction === 'right-left') {
    const rowCount = Math.floor(h / stepY) + 1;
    const totalWidth = w + bitSize * 24;

    for (let r = 0; r < rowCount; r++) {
      const rowY = r * stepY + stepY * 0.5;
      const speed = 160 + ((r * 41 + seed * 19) % 200);
      const streamLen = 14 + ((r * 23 + seed * 11) % 18);
      const rowOffset = (r * 181 + seed * 101) % totalWidth;

      let headX = 0;
      if (direction === 'left-right') {
        headX = ((t * speed + rowOffset) % totalWidth) - bitSize * 10;
      } else {
        headX = w + bitSize * 10 - ((t * speed + rowOffset) % totalWidth);
      }

      let colPrimary = primaryCol;
      let colLead = leadCol;
      let colGlow = glowCol;

      if (colorTheme === 'rainbow') {
        const hue = (r * 16 + t * 45) % 360;
        colPrimary = `hsl(${hue}, 100%, 60%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 100%, 50%)`;
      } else if (colorTheme === 'random-shift') {
        const hue = ((r * 61 + seed * 31) % 360 + Math.sin(t * 1.5 + r) * 35 + 360) % 360;
        colPrimary = `hsl(${hue}, 95%, 62%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 90%, 55%)`;
      }

      for (let k = 0; k < streamLen; k++) {
        let charX = 0;
        if (direction === 'left-right') {
          charX = headX - k * stepX;
        } else {
          charX = headX + k * stepX;
        }

        if (charX < -bitSize * 2 || charX > w + bitSize * 2) continue;

        const isCenterZone =
          charX > w * 0.18 &&
          charX < w * 0.82 &&
          rowY > h * 0.35 &&
          rowY < h * 0.65;

        const charSeed = Math.floor(t * 8 + r * 37 + k * 19);
        let char = '';
        if (isCenterZone && ((charSeed + k) % 3 === 0)) {
          char = morphChars[(charSeed + r + k) % morphChars.length];
        } else {
          char = baseSymbols[(charSeed + k) % baseSymbols.length];
        }

        const isHead = k === 0;
        const isNearHead = k <= 2;
        const fadeRatio = 1 - k / streamLen;
        const alpha = isHead ? 1 : Math.max(0.08, Math.pow(fadeRatio, 1.4) * 0.92);

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isHead) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = Math.min(22, bitSize * 0.85);
        } else if (isNearHead) {
          ctx.fillStyle = colLead;
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = colPrimary;
        }

        ctx.fillText(char, charX, rowY);
        ctx.restore();
      }
    }
  } else if (direction === 'edges-to-center') {
    // Dual converging streams from top and bottom toward center
    const colCount = Math.floor(w / stepX) + 1;
    const halfH = h * 0.5;

    for (let c = 0; c < colCount; c++) {
      const colX = c * stepX + stepX * 0.5;
      const speed = 120 + ((c * 31 + seed * 17) % 150);
      const streamLen = 12 + ((c * 17) % 14);
      const colOffset = (c * 157 + seed * 73) % halfH;

      const topHeadY = (t * speed + colOffset) % (halfH + bitSize * 6);
      const btmHeadY = h - ((t * speed + colOffset) % (halfH + bitSize * 6));

      let colPrimary = primaryCol;
      let colLead = leadCol;
      let colGlow = glowCol;

      if (colorTheme === 'rainbow') {
        const hue = (c * 15 + t * 50) % 360;
        colPrimary = `hsl(${hue}, 100%, 60%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 100%, 50%)`;
      }

      // Render top branch moving down to center
      for (let k = 0; k < streamLen; k++) {
        const charY = topHeadY - k * stepY;
        if (charY < -bitSize || charY > halfH + bitSize) continue;

        const isCenterNear = charY > halfH - stepY * 3;
        const charSeed = Math.floor(t * 8 + c * 29 + k * 13);
        const char = isCenterNear ? morphChars[(charSeed + c) % morphChars.length] : baseSymbols[(charSeed + k) % baseSymbols.length];
        const isHead = k === 0;
        const alpha = isHead ? 1 : Math.max(0.1, (1 - k / streamLen) * 0.9);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isHead ? '#ffffff' : k <= 2 ? colLead : colPrimary;
        if (isHead) {
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 18;
        }
        ctx.fillText(char, colX, charY);
        ctx.restore();
      }

      // Render bottom branch moving up to center
      for (let k = 0; k < streamLen; k++) {
        const charY = btmHeadY + k * stepY;
        if (charY > h + bitSize || charY < halfH - bitSize) continue;

        const isCenterNear = charY < halfH + stepY * 3;
        const charSeed = Math.floor(t * 8 + c * 43 + k * 19);
        const char = isCenterNear ? morphChars[(charSeed + c) % morphChars.length] : baseSymbols[(charSeed + k) % baseSymbols.length];
        const isHead = k === 0;
        const alpha = isHead ? 1 : Math.max(0.1, (1 - k / streamLen) * 0.9);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isHead ? '#ffffff' : k <= 2 ? colLead : colPrimary;
        if (isHead) {
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 18;
        }
        ctx.fillText(char, colX, charY);
        ctx.restore();
      }
    }
  } else if (direction === 'center-to-edges') {
    // Streams bursting/flowing outwards from center to top and bottom borders
    const colCount = Math.floor(w / stepX) + 1;
    const halfH = h * 0.5;

    for (let c = 0; c < colCount; c++) {
      const colX = c * stepX + stepX * 0.5;
      const speed = 135 + ((c * 33 + seed * 23) % 160);
      const streamLen = 13 + ((c * 19) % 15);
      const colOffset = (c * 163 + seed * 79) % halfH;

      const topHeadY = halfH - ((t * speed + colOffset) % (halfH + bitSize * 8));
      const btmHeadY = halfH + ((t * speed + colOffset) % (halfH + bitSize * 8));

      let colPrimary = primaryCol;
      let colLead = leadCol;
      let colGlow = glowCol;

      if (colorTheme === 'rainbow') {
        const hue = (c * 15 + t * 50) % 360;
        colPrimary = `hsl(${hue}, 100%, 60%)`;
        colLead = `hsl(${hue}, 100%, 85%)`;
        colGlow = `hsl(${hue}, 100%, 50%)`;
      }

      // Outward top stream
      for (let k = 0; k < streamLen; k++) {
        const charY = topHeadY + k * stepY;
        if (charY < -bitSize || charY > halfH + bitSize) continue;

        const isCenterOrigin = charY > halfH - stepY * 2;
        const charSeed = Math.floor(t * 8 + c * 31 + k * 17);
        const char = isCenterOrigin ? morphChars[(charSeed + c) % morphChars.length] : baseSymbols[(charSeed + k) % baseSymbols.length];
        const isHead = k === 0;
        const alpha = isHead ? 1 : Math.max(0.1, (1 - k / streamLen) * 0.9);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isHead ? '#ffffff' : k <= 2 ? colLead : colPrimary;
        if (isHead) {
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 18;
        }
        ctx.fillText(char, colX, charY);
        ctx.restore();
      }

      // Outward bottom stream
      for (let k = 0; k < streamLen; k++) {
        const charY = btmHeadY - k * stepY;
        if (charY > h + bitSize || charY < halfH - bitSize) continue;

        const isCenterOrigin = charY < halfH + stepY * 2;
        const charSeed = Math.floor(t * 8 + c * 47 + k * 23);
        const char = isCenterOrigin ? morphChars[(charSeed + c) % morphChars.length] : baseSymbols[(charSeed + k) % baseSymbols.length];
        const isHead = k === 0;
        const alpha = isHead ? 1 : Math.max(0.1, (1 - k / streamLen) * 0.9);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isHead ? '#ffffff' : k <= 2 ? colLead : colPrimary;
        if (isHead) {
          ctx.shadowColor = colGlow;
          ctx.shadowBlur = 18;
        }
        ctx.fillText(char, colX, charY);
        ctx.restore();
      }
    }
  }

  // Draw central matrix decode ring / brackets if text is present
  if (options?.rawText || options?.activeSegmentText) {
    const pulse = Math.sin(t * 4) * 0.15 + 0.85;
    ctx.save();
    ctx.strokeStyle = leadCol;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.18 * pulse;
    ctx.strokeRect(w * 0.08, h * 0.32, w * 0.84, h * 0.36);

    // Decorative corner cyber brackets
    const bSize = 18;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.45 * pulse;
    ctx.strokeStyle = primaryCol;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.32 + bSize);
    ctx.lineTo(w * 0.08, h * 0.32);
    ctx.lineTo(w * 0.08 + bSize, h * 0.32);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(w * 0.92 - bSize, h * 0.32);
    ctx.lineTo(w * 0.92, h * 0.32);
    ctx.lineTo(w * 0.92, h * 0.32 + bSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.68 - bSize);
    ctx.lineTo(w * 0.08, h * 0.68);
    ctx.lineTo(w * 0.08 + bSize, h * 0.68);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w * 0.92 - bSize, h * 0.68);
    ctx.lineTo(w * 0.92, h * 0.68);
    ctx.lineTo(w * 0.92, h * 0.68 - bSize);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/* ================= 11. FIREWORKS PROCEDURAL GENERATOR ================= */
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function drawFireworks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false,
  options?: ProceduralMoodRenderOptions
) {
  const colorThemes: FireworksColorTheme[] = [
    'multicolor',
    'gold-glitter',
    'neon-cyber',
    'crimson-ruby',
    'cyan-violet',
    'emerald-lime',
  ];
  const chosenTheme = options?.fireworksColorTheme || colorThemes[Math.abs(seed) % colorThemes.length];

  // Palette generator
  const getThemePalette = (burstSeed: number): string[] => {
    switch (chosenTheme) {
      case 'gold-glitter':
        return ['#fef08a', '#facc15', '#f59e0b', '#d97706', '#ffffff', '#ffedd5'];
      case 'neon-cyber':
        return ['#ff007f', '#00f0ff', '#a855f7', '#00ff87', '#38bdf8', '#f43f5e'];
      case 'crimson-ruby':
        return ['#ef4444', '#f43f5e', '#fb7185', '#f59e0b', '#dc2626', '#ffe4e6'];
      case 'cyan-violet':
        return ['#06b6d4', '#38bdf8', '#c084fc', '#a855f7', '#e0e7ff', '#ffffff'];
      case 'emerald-lime':
        return ['#10b981', '#84cc16', '#22c55e', '#facc15', '#059669', '#ecfdf5'];
      case 'multicolor':
      default: {
        const sets = [
          ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#ffffff'],
          ['#06b6d4', '#facc15', '#ec4899', '#4ade80', '#ffffff'],
          ['#ff007f', '#00f0ff', '#f59e0b', '#8b5cf6', '#fffbeb'],
          ['#38bdf8', '#ec4899', '#facc15', '#10b981', '#ffffff'],
        ];
        return sets[Math.abs(burstSeed) % sets.length];
      }
    }
  };

  // 1. Dark starry night sky background with soft colored aurora horizon glow
  if (!skipSolidBg) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#020308');
    skyGrad.addColorStop(0.5, '#070a14');
    skyGrad.addColorStop(1, '#0e0b1c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling background stars
    const starCount = 55;
    for (let s = 0; s < starCount; s++) {
      const sx = (s * 179 + seed * 23) % w;
      const sy = (s * 241 + seed * 47) % (h * 0.78);
      const sTwinkle = Math.sin(t * 3.5 + s * 1.7) * 0.45 + 0.55;
      ctx.fillStyle = s % 4 === 0 ? '#fef08a' : '#ffffff';
      ctx.globalAlpha = sTwinkle * 0.65;
      const starSize = s % 5 === 0 ? 2.2 : 1.2;
      ctx.fillRect(sx, sy, starSize, starSize);
    }
  }

  // 2. Full catalog of 38 diverse burst archetypes (including combinations and new varieties)
  const burstArchetypes = [
    // Classic aerial shells
    'peony',
    'chrysanthemum',
    'palm',
    'willow',
    'strobe',
    'brocade',
    'ring',
    'crossette',
    'dahlia',
    'waterfall',
    'double',
    'spiral',
    'rocket',
    'spider',
    'meteor',
    // 23 New varieties & combinations requested by user
    'kamuro',
    'heart',
    'saturn-ring',
    'star-mandala',
    'ghost-shell',
    'salute-flash',
    'horsetail',
    'pearl-fountain',
    'whistle-serpent',
    'supernova',
    'crackling-dragon',
    'time-rain',
    'sunflower',
    'galaxy-whirl',
    'confetti-twirl',
    'laser-corona',
    'nebula-cloud',
    'fire-dragon',
    'aurora-curtain',
    'diamond-dust',
    'double-peony',
    'combo-kamuro-strobe',
    'combo-palm-crossette',
    'combo-ring-heart',
  ];

  // 3. Scale Mode: 'mixed' (tiny to giant), 'small', 'medium', 'giant'
  const scaleMode = options?.fireworksScaleMode || 'mixed';

  // 4. Quantity: 1 to 30 simultaneous fireworks scheduler
  const totalSlots = Math.max(1, Math.min(30, options?.fireworksCount ?? 8));
  const cycleDuration = Math.max(2.5, 3.8 - totalSlots * 0.035);

  for (let slot = 0; slot < totalSlots; slot++) {
    const slotSeed = seed * 13 + slot * 97;
    // Stagger launches across cycleDuration
    const slotStagger = slot * (cycleDuration / totalSlots);
    const jitter = ((slotSeed % 100) / 100) * (cycleDuration / totalSlots) * 0.8;
    const timeOffset = (slotStagger + jitter) % cycleDuration;
    const slotTime = (t + timeOffset) % cycleDuration;
    const cycleIndex = Math.floor((t + timeOffset) / cycleDuration);
    const burstSeed = slotSeed + cycleIndex * 1013;

    // Pick archetype: when totalSlots > 1, cycle diverse complementary types across slots
    const burstType = burstArchetypes[Math.abs(burstSeed + slot * 7) % burstArchetypes.length];
    const palette = getThemePalette(burstSeed);

    // Compute Scale: from micro bursts (0.35x) to giant mega-shells (2.5x)
    let slotScale = 1.0;
    if (scaleMode === 'giant') {
      slotScale = 1.7 + (Math.abs(burstSeed * 19) % 80) * 0.01; // 1.7 to 2.5
    } else if (scaleMode === 'small') {
      slotScale = 0.35 + (Math.abs(burstSeed * 17) % 30) * 0.01; // 0.35 to 0.65
    } else if (scaleMode === 'medium') {
      slotScale = 0.85 + (Math.abs(burstSeed * 23) % 40) * 0.01; // 0.85 to 1.25
    } else {
      // 'mixed' mode: dynamic mix of tiny, medium, and giant fireworks
      const roll = (Math.abs(burstSeed * 37) % 100) / 100;
      if (roll < 0.26) {
        // Giant mega-shell filling the sky
        slotScale = 1.8 + (Math.abs(burstSeed * 13) % 70) * 0.01;
      } else if (roll > 0.66) {
        // Delicate micro-burst / sparkler cluster
        slotScale = 0.35 + (Math.abs(burstSeed * 29) % 30) * 0.01;
      } else {
        // Classic medium shell
        slotScale = 0.9 + (Math.abs(burstSeed * 31) % 45) * 0.01;
      }
    }

    // Coordinates & launch trajectories
    const margin = 0.12;
    const startX = w * (margin + (Math.abs(burstSeed * 17 + slot * 31) % 76) * 0.01);
    const targetX = startX + Math.sin(burstSeed * 0.7) * (w * 0.14);
    const burstY = h * (0.14 + (Math.abs(burstSeed * 31 + slot * 19) % 44) * 0.01);
    const launchDuration = Math.min(0.85, cycleDuration * 0.32);

    // Phase A: Ascending Rocket with sparks & smoke
    if (slotTime < launchDuration) {
      const launchProg = slotTime / launchDuration;
      const easeLaunch = easeOutCubic(launchProg);
      const currentX = startX + (targetX - startX) * easeLaunch;
      const currentY = h - (h - burstY) * easeLaunch;

      ctx.save();
      // Bright rocket warhead
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = palette[0];
      ctx.shadowBlur = 18 * slotScale;
      ctx.beginPath();
      ctx.arc(currentX, currentY, Math.max(2, 3.5 * slotScale), 0, Math.PI * 2);
      ctx.fill();

      // Sparkling smoke rocket tail
      const tailSparks = Math.round(14 * Math.min(1.5, Math.max(0.7, slotScale)));
      for (let ts = 0; ts < tailSparks; ts++) {
        const tailProg = ts / tailSparks;
        const tx = currentX - (targetX - startX) * 0.035 * ts + Math.sin(t * 30 + ts) * 2;
        const ty = currentY + ts * (8 * slotScale) + Math.sin(ts) * 2;
        const tAlpha = (1 - tailProg) * 0.85;
        ctx.fillStyle = ts % 2 === 0 ? palette[ts % palette.length] : '#facc15';
        ctx.globalAlpha = tAlpha;
        ctx.beginPath();
        ctx.arc(tx, ty, Math.max(1, 2.8 * (1 - tailProg) * slotScale), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    // Phase B: Firework Explosion Burst
    else {
      const burstTime = slotTime - launchDuration;
      const burstDuration = cycleDuration - launchDuration;
      const burstProg = Math.min(1, burstTime / burstDuration);
      const easeExp = easeOutCubic(burstProg);
      const fadeOut = Math.max(0, Math.pow(1 - burstProg, 1.25));

      // Atmospheric flash when burst just occurred
      if (burstProg < 0.22) {
        const flashAlpha = (1 - burstProg / 0.22) * (0.22 * Math.min(1.5, slotScale));
        const flashRadius = Math.max(w, h) * (0.55 * slotScale);
        const flashGrad = ctx.createRadialGradient(targetX, burstY, 10, targetX, burstY, flashRadius);
        flashGrad.addColorStop(0, palette[0]);
        flashGrad.addColorStop(0.6, hexToRgba(palette[1] || palette[0], 0.2));
        flashGrad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = flashAlpha;
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      ctx.save();
      ctx.translate(targetX, burstY);

      // Archetype-specific particle counts
      let starCount = 50;
      if (burstType === 'palm') starCount = 20;
      else if (burstType === 'waterfall' || burstType === 'horsetail') starCount = 65;
      else if (burstType === 'kamuro' || burstType === 'brocade') starCount = 78;
      else if (burstType === 'willow') starCount = 72;
      else if (burstType === 'heart') starCount = 54;
      else if (burstType === 'saturn-ring') starCount = 68;
      else if (burstType === 'star-mandala') starCount = 60;
      else if (burstType === 'diamond-dust') starCount = 85;
      else if (burstType === 'supernova') starCount = 80;
      else if (burstType === 'salute-flash') starCount = 42;
      else if (burstType === 'combo-kamuro-strobe') starCount = 80;
      else if (burstType === 'combo-palm-crossette') starCount = 58;
      else if (burstType === 'combo-ring-heart') starCount = 74;

      // Scale star count slightly based on scale mode
      starCount = Math.round(starCount * Math.min(1.4, Math.max(0.65, slotScale)));

      // Render explosion archetypes
      for (let i = 0; i < starCount; i++) {
        const starSeed = burstSeed + i * 37;
        const baseAngle = (i * Math.PI * 2) / starCount;
        let starAngle = baseAngle;
        let starSpeed = (160 + (starSeed % 140)) * slotScale;
        let starGravity = 85 * burstProg * burstProg;
        let starColor = palette[i % palette.length];
        let px = 0;
        let py = 0;

        // Specialized trajectory and geometry mathematics per archetype
        if (burstType === 'heart' || (burstType === 'combo-ring-heart' && i < 40)) {
          // Romantic Heart parametric contour
          const tA = (i * Math.PI * 2) / (burstType === 'combo-ring-heart' ? 40 : starCount);
          const hx = 16 * Math.pow(Math.sin(tA), 3);
          const hy = -(13 * Math.cos(tA) - 5 * Math.cos(2 * tA) - 2 * Math.cos(3 * tA) - Math.cos(4 * tA));
          const hDist = easeExp * 8.5 * slotScale;
          px = hx * hDist;
          py = hy * hDist + starGravity * 0.7;
          starColor = i % 2 === 0 ? '#f43f5e' : '#fbcfe8';
        } else if (burstType === 'saturn-ring') {
          // Planetary sphere core + 3D tilted planetary ring
          if (i < starCount * 0.4) {
            // Core sphere
            const dist = easeExp * (starSpeed * 0.6);
            px = Math.cos(starAngle) * dist;
            py = Math.sin(starAngle) * dist + starGravity;
            starColor = '#fef08a';
          } else {
            // Tilted planar ring
            const ringAngle = ((i - starCount * 0.4) * Math.PI * 2) / (starCount * 0.6);
            const ringDist = easeExp * 230 * slotScale;
            const tilt = 0.35; // perspective flattening
            const rotTilt = -0.4; // 25 degree tilt in sky
            const rx = Math.cos(ringAngle) * ringDist;
            const ry = Math.sin(ringAngle) * ringDist * tilt;
            px = rx * Math.cos(rotTilt) - ry * Math.sin(rotTilt);
            py = rx * Math.sin(rotTilt) + ry * Math.cos(rotTilt) + starGravity * 0.5;
            starColor = palette[1];
          }
        } else if (burstType === 'star-mandala') {
          // Sacred 12-arm geometric mandala with tiered harmonic ripples
          const arm = i % 12;
          const tier = Math.floor(i / 12) + 1;
          const mAngle = (arm * Math.PI * 2) / 12;
          const mDist = easeExp * (100 + tier * 55) * slotScale;
          px = Math.cos(mAngle) * mDist;
          py = Math.sin(mAngle) * mDist + starGravity * 0.4;
          starColor = tier % 2 === 0 ? palette[0] : '#ffffff';
        } else if (burstType === 'ghost-shell') {
          // Color-shifting mid explosion: begins electric cyan then shifts to ruby crimson/gold
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          if (burstProg < 0.4) {
            starColor = '#00f0ff';
          } else {
            starColor = i % 2 === 0 ? '#facc15' : '#f43f5e';
          }
        } else if (burstType === 'kamuro' || (burstType === 'combo-kamuro-strobe' && i < 50)) {
          // Japanese dense weeping golden crown falling all the way down
          starGravity = 280 * burstProg * burstProg;
          starSpeed = (190 + (i % 5) * 35) * slotScale;
          starColor = i % 3 === 0 ? '#ffffff' : '#fef08a';
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
        } else if (burstType === 'horsetail') {
          // Arching weeping horsetail cascade
          starGravity = 240 * burstProg * burstProg;
          starSpeed = (110 + (i % 7) * 30) * slotScale;
          const archAngle = -Math.PI * 0.5 + (Math.sin(i) * 0.9);
          const dist = easeExp * starSpeed;
          px = Math.cos(archAngle) * dist + (i % 2 === 0 ? 1 : -1) * (dist * 0.4);
          py = Math.sin(archAngle) * dist + starGravity;
          starColor = '#facc15';
        } else if (burstType === 'pearl-fountain') {
          // Rising pearl geyser arc
          starGravity = 220 * burstProg * burstProg;
          const fountainAngle = -Math.PI * 0.5 + (Math.sin(i * 1.5) * 0.7);
          const dist = easeExp * (200 + (starSeed % 120)) * slotScale;
          px = Math.cos(fountainAngle) * dist;
          py = Math.sin(fountainAngle) * dist + starGravity;
          starColor = '#ffffff';
        } else if (burstType === 'whistle-serpent') {
          // Corkscrewing serpentine spiral
          const swirl = Math.sin(burstProg * 16 + i) * 0.7;
          starAngle += swirl;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = palette[i % palette.length];
        } else if (burstType === 'supernova') {
          // Giant multi-layered cosmic explosion with radiating spikes and corona
          const isSpike = i % 8 === 0;
          starSpeed = (isSpike ? 340 : 190 + (starSeed % 80)) * slotScale;
          starGravity = 50 * burstProg * burstProg;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = isSpike ? '#ffffff' : palette[i % palette.length];
        } else if (burstType === 'crackling-dragon') {
          // Branching zigzag lightning sparks with crackles
          const zigzag = Math.sin(i * 5 + burstProg * 20) * 18 * slotScale;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist + zigzag;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = burstProg > 0.45 && i % 2 === 0 ? '#fef08a' : palette[i % palette.length];
        } else if (burstType === 'time-rain') {
          // Delayed ignition: silent expansion followed by bright popping rain
          const dist = easeExp * (140 * slotScale);
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity * 1.4;
          if (burstProg > 0.5) {
            const crackleJitter = (Math.sin(burstProg * 40 + i) * 8);
            px += crackleJitter;
            py += crackleJitter;
            starColor = '#ffffff';
          }
        } else if (burstType === 'sunflower') {
          // Golden center disc + crimson outer ray petals
          const isCore = i < starCount * 0.4;
          const dist = easeExp * (isCore ? 90 : 210) * slotScale;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity * 0.8;
          starColor = isCore ? '#facc15' : '#ef4444';
        } else if (burstType === 'galaxy-whirl') {
          // Counter-rotating twin spiral arms
          const armRot = (i % 2 === 0 ? 1 : -1) * burstProg * 5;
          const dist = easeExp * (starSpeed * 1.1);
          px = Math.cos(starAngle + armRot) * dist;
          py = Math.sin(starAngle + armRot) * dist + starGravity * 0.6;
        } else if (burstType === 'confetti-twirl') {
          // Fluttering tumbling multicolored flakes drifting down
          starGravity = 120 * burstProg * burstProg;
          const rock = Math.sin(t * 8 + i) * 14 * slotScale;
          const dist = easeExp * (110 * slotScale);
          px = Math.cos(starAngle) * dist + rock;
          py = Math.sin(starAngle) * dist + starGravity;
        } else if (burstType === 'laser-corona') {
          // Straight razor-sharp high velocity photon beams
          starSpeed = 380 * slotScale;
          starGravity = 15 * burstProg;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = '#00f0ff';
        } else if (burstType === 'diamond-dust') {
          // Microcrystalline suspended twinkling dust
          starGravity = 30 * burstProg * burstProg;
          starSpeed = (90 + (starSeed % 110)) * slotScale;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = '#ffffff';
        } else if (burstType === 'double-peony') {
          // Dual concentric spheres with contrasting hues
          const isInner = i < starCount * 0.4;
          const dist = easeExp * (isInner ? 120 : 230) * slotScale;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = isInner ? '#ef4444' : '#38bdf8';
        } else if (burstType === 'combo-palm-crossette') {
          // Palm trunk + popping crossette secondary stars
          starGravity = 140 * burstProg * burstProg;
          starSpeed = (200 + (i % 3) * 45) * slotScale;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = '#facc15';
        } else if (burstType === 'palm') {
          // Thick drooping palm fronds
          starGravity = 135 * burstProg * burstProg;
          starSpeed = (220 + (i % 3) * 40) * slotScale;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
        } else if (burstType === 'willow' || burstType === 'waterfall') {
          // Long descending glitter trails
          starGravity = 210 * burstProg * burstProg;
          starSpeed = (120 + (i % 5) * 35) * slotScale;
          starColor = '#fef08a';
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
        } else if (burstType === 'ring' || (burstType === 'combo-ring-heart' && i >= 40)) {
          // Crisp flat circular ring
          starSpeed = 210 * slotScale;
          starGravity = 45 * burstProg * burstProg;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
          starColor = '#38bdf8';
        } else if (burstType === 'spiral') {
          starAngle += burstProg * 4.5;
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
        } else {
          // Standard Peony, Chrysanthemum, Dahlia, etc.
          const dist = easeExp * starSpeed;
          px = Math.cos(starAngle) * dist;
          py = Math.sin(starAngle) * dist + starGravity;
        }

        // Strobe flickering effect
        let starAlpha = fadeOut;
        if (burstType === 'strobe' || (burstType === 'combo-kamuro-strobe' && i >= 50)) {
          const strobe = Math.sin(t * 50 + i * 2) > 0.15 ? 1 : 0.1;
          starAlpha *= strobe;
        }

        ctx.save();
        ctx.fillStyle = i % 4 === 0 ? '#ffffff' : starColor;
        ctx.shadowColor = starColor;
        ctx.shadowBlur = (burstType === 'brocade' || burstType === 'kamuro' ? 18 : 10) * slotScale;
        ctx.globalAlpha = Math.max(0, Math.min(1, starAlpha));

        const baseStarSize = burstType === 'dahlia' ? 4.8 : burstType === 'diamond-dust' ? 2.0 : 3.2;
        const starSize = Math.max(1.2, baseStarSize * slotScale * (1 - burstProg * 0.45));

        // Draw star particle
        if (burstType === 'confetti-twirl') {
          // Confetti tumbling quad
          ctx.translate(px, py);
          ctx.rotate(t * 4 + i);
          ctx.fillRect(-starSize, -starSize, starSize * 2, starSize * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, starSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw glittering trails for trail-heavy archetypes
        const hasTrails =
          burstType === 'chrysanthemum' ||
          burstType === 'brocade' ||
          burstType === 'kamuro' ||
          burstType === 'willow' ||
          burstType === 'horsetail' ||
          burstType === 'meteor' ||
          burstType === 'combo-kamuro-strobe';

        if (hasTrails) {
          ctx.strokeStyle = starColor;
          ctx.lineWidth = Math.max(1, starSize * 0.8);
          ctx.globalAlpha = Math.max(0, Math.min(1, starAlpha * 0.7));
          ctx.beginPath();
          ctx.moveTo(px * 0.86, py * 0.86);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Secondary popping crossette / crackle sparks
        const isCrossette = burstType === 'crossette' || burstType === 'combo-palm-crossette';
        if (isCrossette && burstProg > 0.45) {
          const subProg = (burstProg - 0.45) / 0.55;
          for (let sp = 0; sp < 3; sp++) {
            const spAngle = sp * ((Math.PI * 2) / 3) + i;
            const spDist = subProg * (38 * slotScale);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = Math.max(0, (1 - subProg) * 0.85);
            ctx.fillRect(px + Math.cos(spAngle) * spDist, py + Math.sin(spAngle) * spDist, 2, 2);
          }
        }

        ctx.restore();
      }

      ctx.restore();
    }
  }
}

/* ================= 12. WORLD FLAGS PROCEDURAL GENERATOR ================= */
export interface WorldFlagItem {
  code: string;
  name: string;
  flag: string;
}

export const WORLD_FLAG_EMOJIS: WorldFlagItem[] = [
  { code: 'ru', name: 'Россия', flag: '🇷🇺' },
  { code: 'by', name: 'Беларусь', flag: '🇧🇾' },
  { code: 'kz', name: 'Казахстан', flag: '🇰🇿' },
  { code: 'uz', name: 'Узбекистан', flag: '🇺🇿' },
  { code: 'am', name: 'Армения', flag: '🇦🇲' },
  { code: 'az', name: 'Азербайджан', flag: '🇦🇿' },
  { code: 'ge', name: 'Грузия', flag: '🇬🇪' },
  { code: 'kg', name: 'Кыргызстан', flag: '🇰🇬' },
  { code: 'tj', name: 'Таджикистан', flag: '🇹🇯' },
  { code: 'md', name: 'Молдова', flag: '🇲🇩' },
  { code: 'ua', name: 'Украина', flag: '🇺🇦' },
  { code: 'rs', name: 'Сербия', flag: '🇷🇸' },
  { code: 'us', name: 'США', flag: '🇺🇸' },
  { code: 'cn', name: 'Китай', flag: '🇨🇳' },
  { code: 'de', name: 'Германия', flag: '🇩🇪' },
  { code: 'fr', name: 'Франция', flag: '🇫🇷' },
  { code: 'gb', name: 'Великобритания', flag: '🇬🇧' },
  { code: 'it', name: 'Италия', flag: '🇮🇹' },
  { code: 'es', name: 'Испания', flag: '🇪🇸' },
  { code: 'jp', name: 'Япония', flag: '🇯🇵' },
  { code: 'kr', name: 'Южная Корея', flag: '🇰🇷' },
  { code: 'br', name: 'Бразилия', flag: '🇧🇷' },
  { code: 'ar', name: 'Аргентина', flag: '🇦🇷' },
  { code: 'ca', name: 'Канада', flag: '🇨🇦' },
  { code: 'au', name: 'Австралия', flag: '🇦🇺' },
  { code: 'in', name: 'Индия', flag: '🇮🇳' },
  { code: 'tr', name: 'Турция', flag: '🇹🇷' },
  { code: 'sa', name: 'Саудовская Аравия', flag: '🇸🇦' },
  { code: 'ae', name: 'ОАЭ', flag: '🇦🇪' },
  { code: 'eg', name: 'Египет', flag: '🇪🇬' },
  { code: 'gr', name: 'Греция', flag: '🇬🇷' },
  { code: 'mx', name: 'Мексика', flag: '🇲🇽' },
  { code: 'ch', name: 'Швейцария', flag: '🇨🇭' },
  { code: 'se', name: 'Швеция', flag: '🇸🇪' },
  { code: 'no', name: 'Норвегия', flag: '🇳🇴' },
  { code: 'fi', name: 'Финляндия', flag: '🇫🇮' },
  { code: 'nl', name: 'Нидерланды', flag: '🇳🇱' },
  { code: 'pl', name: 'Польша', flag: '🇵🇱' },
  { code: 'pt', name: 'Португалия', flag: '🇵🇹' },
  { code: 'za', name: 'ЮАР', flag: '🇿🇦' },
  { code: 'id', name: 'Индонезия', flag: '🇮🇩' },
  { code: 'th', name: 'Таиланд', flag: '🇹🇭' },
  { code: 'vn', name: 'Вьетнам', flag: '🇻🇳' },
  { code: 'il', name: 'Израиль', flag: '🇮🇱' },
  { code: 'ie', name: 'Ирландия', flag: '🇮🇪' },
  { code: 'is', name: 'Исландия', flag: '🇮🇸' },
  { code: 'at', name: 'Австрия', flag: '🇦🇹' },
  { code: 'be', name: 'Бельгия', flag: '🇧🇪' },
  { code: 'cz', name: 'Чехия', flag: '🇨🇿' },
  { code: 'hu', name: 'Венгрия', flag: '🇭🇺' },
  { code: 'dk', name: 'Дания', flag: '🇩🇰' },
  { code: 'nz', name: 'Новая Зеландия', flag: '🇳🇿' },
  { code: 'mc', name: 'Монако', flag: '🇲🇨' },
  { code: 'cu', name: 'Куба', flag: '🇨🇺' },
  { code: 'un', name: 'ООН', flag: '🇺🇳' },
  { code: 'eu', name: 'Евросоюз', flag: '🇪🇺' },
  { code: 'pirate', name: 'Пиратский', flag: '🏴‍☠️' },
  { code: 'checkered', name: 'Финиш', flag: '🏁' },
  { code: 'rainbow', name: 'Радужный', flag: '🏳️‍🌈' },
  { code: 'redflag', name: 'Вымпел', flag: '🚩' },
];

function drawFlags(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  rng: () => number,
  seed: number,
  skipSolidBg: boolean = false,
  options?: ProceduralMoodRenderOptions
) {
  // 1. Resolve Composition Mode ('single' | 'duo' | 'multi')
  const mode: FlagsCompositionMode =
    options?.flagsMode ||
    (seed % 3 === 0 ? 'single' : seed % 3 === 1 ? 'duo' : 'multi');

  // Count: from 1 to 30 simultaneous flags!
  const totalFlags = Math.max(1, Math.min(30, options?.flagsCount ?? (mode === 'single' ? 12 : 16)));

  // Resolve Primary and Secondary Countries (seed-driven variety if none explicitly specified)
  const defaultIdx1 = Math.abs(seed * 17) % WORLD_FLAG_EMOJIS.length;
  const defaultIdx2 = Math.abs(seed * 31 + 7) % WORLD_FLAG_EMOJIS.length;
  const primaryFlag = options?.flagsPrimaryCountry || WORLD_FLAG_EMOJIS[defaultIdx1].flag;
  const secondaryFlag = options?.flagsSecondaryCountry || WORLD_FLAG_EMOJIS[defaultIdx2].flag;

  // Scale mode: 'mixed' | 'small' | 'medium' | 'giant' | 'mega-screen'
  const scaleMode = options?.flagsScaleMode || 'mixed';

  // Motion style: 'drift' | 'vortex' | 'burst' | 'rain' | 'zoom-3d' | 'wave-banner'
  const motionStyles: FlagsMotionStyle[] = ['drift', 'vortex', 'burst', 'rain', 'zoom-3d', 'wave-banner'];
  const motion: FlagsMotionStyle = options?.flagsMotion || motionStyles[Math.abs(seed) % motionStyles.length];

  // Effect: 'glow' | 'dissolve' | 'flicker' | 'cloth-wave' | 'all-fx' | 'morph-transform'
  const effect: FlagsEffect = options?.flagsEffect || 'all-fx';

  // Background style: 'dark-space' | 'stadium' | 'neon-glow' | 'cyber-grid' | 'flag-blur' | 'vertical-cloth' | 'flags-morph'
  const bgStyles: FlagsBgStyle[] = [
    'dark-space',
    'stadium',
    'neon-glow',
    'cyber-grid',
    'flag-blur',
    'vertical-cloth',
    'flags-morph',
  ];
  const bgStyle: FlagsBgStyle = options?.flagsBgStyle || bgStyles[Math.abs(seed * 7) % bgStyles.length];

  // Draw background if not skipped
  if (!skipSolidBg) {
    if (bgStyle === 'vertical-cloth') {
      // Atmospheric hanging flag banner with realistic waving cloth folds & film grain
      // Automatically adopts vertical banner orientation for vertical canvas (9:16) and horizontal for landscape/1:1
      const isVerticalCanvas = h > w;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#060912');
      bgGrad.addColorStop(0.5, '#0b1120');
      bgGrad.addColorStop(1, '#030509');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Hanging flag banner in center covering screen with realistic silk cloth sway
      ctx.save();
      const bannerSize = Math.max(w, h) * (isVerticalCanvas ? 0.95 : 1.15);
      const baseRot = isVerticalCanvas ? Math.PI / 2 : 0;
      const waveRot = baseRot + Math.sin(t * 0.9) * 0.035; // Vertical for portrait, horizontal for landscape/1:1 + gentle wave sway
      const waveX = w * 0.5 + Math.sin(t * 1.1) * (w * 0.02);
      const waveY = h * 0.5 + Math.cos(t * 0.8) * (h * 0.015);

      ctx.translate(waveX, waveY);
      ctx.rotate(waveRot);
      // User or random opacity multiplier for banner
      const bannerAlphaSetting = typeof options?.flagsOpacity === 'number' ? options.flagsOpacity : 0.30;
      ctx.globalAlpha = Math.max(0.08, Math.min(1.0, bannerAlphaSetting));

      // Draw high-performance hardware scaled flag
      const RASTER_VERT_BASE = 140;
      const vertScale = bannerSize / RASTER_VERT_BASE;
      ctx.font = `${RASTER_VERT_BASE}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.scale(vertScale, vertScale);
      ctx.fillText(primaryFlag, 0, 0);
      ctx.restore();

      // Dark edge vignette to guarantee maximum text contrast
      const vignette = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.3,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.72
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.42)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === 'flags-morph') {
      // Dynamic world flag morphing & dissolve transitions replacing the background
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
      bgGrad.addColorStop(0, '#0a0e1c');
      bgGrad.addColorStop(0.6, '#040711');
      bgGrad.addColorStop(1, '#010206');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Morphing cycle between countries
      const CYCLE_PERIOD = 4.0; // 4 seconds per cycle
      const MORPH_WINDOW = 1.4; // 1.4 seconds smooth cross-fade / wipe / zoom transition
      const cycleIdx = Math.floor(t / CYCLE_PERIOD);
      const timeInCycle = t % CYCLE_PERIOD;
      const isTransitioning = timeInCycle < MORPH_WINDOW;
      const p = isTransitioning ? timeInCycle / MORPH_WINDOW : 0;
      const easeP = easeOutCubic(p);

      const flagIdx1 = Math.abs(seed * 7 + cycleIdx) % WORLD_FLAG_EMOJIS.length;
      const flagIdx2 = Math.abs(seed * 7 + cycleIdx + 1) % WORLD_FLAG_EMOJIS.length;
      const curFlag = WORLD_FLAG_EMOJIS[flagIdx1].flag;
      const nextFlag = WORLD_FLAG_EMOJIS[flagIdx2].flag;
      const transitionType = cycleIdx % 3; // 0 = dissolve, 1 = curtain wipe, 2 = zoom morph

      const emblemSize = Math.max(w, h) * 0.72;
      const RASTER_MORPH_BASE = 140;
      const emblemScale = emblemSize / RASTER_MORPH_BASE;

      ctx.save();
      ctx.font = `${RASTER_MORPH_BASE}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const morphAlphaMultiplier = typeof options?.flagsOpacity === 'number' ? (options.flagsOpacity / 0.5) : 1.0;

      if (!isTransitioning) {
        // Steady state: display current flag watermark with gentle pulse
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(emblemScale, emblemScale);
        ctx.globalAlpha = Math.min(1.0, (0.22 + 0.04 * Math.sin(t * 1.5)) * morphAlphaMultiplier);
        ctx.fillText(curFlag, 0, 0);
        ctx.restore();
      } else if (transitionType === 0) {
        // Transition 1: Dissolve & Cross-fade blend
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(emblemScale, emblemScale);
        ctx.globalAlpha = Math.min(1.0, (1 - easeP) * 0.24 * morphAlphaMultiplier);
        ctx.fillText(curFlag, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.scale(emblemScale, emblemScale);
        ctx.globalAlpha = Math.min(1.0, easeP * 0.24 * morphAlphaMultiplier);
        ctx.fillText(nextFlag, 0, 0);
        ctx.restore();
      } else if (transitionType === 1) {
        // Transition 2: Curtain Slide / Wipe
        const slideOffset = easeP * w * 0.85;
        ctx.save();
        ctx.translate(w * 0.5 - slideOffset, h * 0.5);
        ctx.scale(emblemScale, emblemScale);
        ctx.globalAlpha = Math.min(1.0, (1 - easeP) * 0.22 * morphAlphaMultiplier);
        ctx.fillText(curFlag, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(w * 0.5 + (w * 0.85 - slideOffset), h * 0.5);
        ctx.scale(emblemScale, emblemScale);
        ctx.globalAlpha = Math.min(1.0, easeP * 0.22 * morphAlphaMultiplier);
        ctx.fillText(nextFlag, 0, 0);
        ctx.restore();
      } else {
        // Transition 3: Zoom Morph (Depth emergence)
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        const outScale = emblemScale * (1 + easeP * 0.45);
        ctx.scale(outScale, outScale);
        ctx.globalAlpha = Math.min(1.0, (1 - easeP) * 0.22 * morphAlphaMultiplier);
        ctx.fillText(curFlag, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        const inScale = emblemScale * (0.6 + easeP * 0.4);
        ctx.scale(inScale, inScale);
        ctx.globalAlpha = Math.min(1.0, easeP * 0.22 * morphAlphaMultiplier);
        ctx.fillText(nextFlag, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    } else if (bgStyle === 'stadium') {
      // Stadium lights & upward searchlights
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.6, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Upward searchlight beams
      for (let s = 0; s < 3; s++) {
        const spotX = w * (0.2 + s * 0.3) + Math.sin(t * 0.8 + s * 2) * (w * 0.12);
        const sGrad = ctx.createRadialGradient(spotX, h, 20, spotX, h * 0.3, Math.max(w, h) * 0.6);
        sGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        sGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
        sGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sGrad;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (bgStyle === 'neon-glow') {
      // Cyber neon radial glow
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(0.55, '#0f0a20');
      bgGrad.addColorStop(1, '#020108');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === 'cyber-grid') {
      // Dark cyber perspective grid
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      const gridH = h * 0.6;
      for (let gy = gridH; gy < h; gy += 25) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      for (let gx = 0; gx < w; gx += 45) {
        ctx.beginPath();
        ctx.moveTo(gx, gridH);
        ctx.lineTo(gx + (gx - w / 2) * 1.5, h);
        ctx.stroke();
      }
    } else if (bgStyle === 'flag-blur') {
      // Ambient giant background flag watermark (optimized without heavy software Gaussian blur)
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.65, '#04060a');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Huge national emblem watermark in center
      ctx.save();
      ctx.globalAlpha = 0.09;
      const watermarkSize = Math.max(w, h) * 0.65;
      const RASTER_WATERMARK_BASE = 140;
      const wScale = watermarkSize / RASTER_WATERMARK_BASE;
      ctx.font = `${RASTER_WATERMARK_BASE}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(w * 0.5, h * 0.5);
      ctx.scale(wScale, wScale);
      ctx.fillText(primaryFlag, 0, 0);
      ctx.restore();
    } else {
      // 'dark-space': deep cosmic void with twinkling stars
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#080d1a');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling stars
      for (let s = 0; s < 45; s++) {
        const sx = (s * 183 + seed * 19) % w;
        const sy = (s * 251 + seed * 37) % h;
        const starAlpha = Math.sin(t * 3 + s) * 0.4 + 0.6;
        ctx.fillStyle = s % 3 === 0 ? '#38bdf8' : '#ffffff';
        ctx.globalAlpha = starAlpha * 0.55;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }
  }

  // Procedural subtle film grain and fabric weave
  if (options?.flagsGrain || bgStyle === 'vertical-cloth') {
    ctx.save();
    const grainStep = 6;
    const timeJitter = Math.floor(t * 15);
    for (let gy = 0; gy < h; gy += grainStep) {
      const rowSeed = (gy * 91 + timeJitter * 17) % 1000;
      for (let gx = 0; gx < w; gx += grainStep * 2) {
        const hash = Math.sin(gx * 12.9898 + gy * 78.233 + rowSeed) * 43758.5453;
        const val = hash - Math.floor(hash);
        if (val > 0.84) {
          ctx.fillStyle = val > 0.93 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)';
          ctx.fillRect(gx, gy, grainStep, grainStep);
        }
      }
    }
    ctx.restore();
  }

  // 2. Build flags array for the current scene
  const activeFlags: string[] = [];
  if (mode === 'single') {
    for (let i = 0; i < totalFlags; i++) {
      activeFlags.push(primaryFlag);
    }
  } else if (mode === 'duo') {
    for (let i = 0; i < totalFlags; i++) {
      activeFlags.push(i % 2 === 0 ? primaryFlag : secondaryFlag);
    }
  } else {
    // Multi mix: pick distinct or rich world flags
    for (let i = 0; i < totalFlags; i++) {
      const idx = Math.abs(seed * 7 + i * 13) % WORLD_FLAG_EMOJIS.length;
      activeFlags.push(WORLD_FLAG_EMOJIS[idx].flag);
    }
  }

  // 3. Render Flags with 60fps GPU Hardware Scaling & Density Protection
  // Intelligently cap active foreground count for giant / mega / vertical banner modes
  let effectiveTotal = totalFlags;
  if (bgStyle === 'vertical-cloth') {
    // If vertical banner backdrop is active, cap flying flags to delicate accent particles
    effectiveTotal = Math.min(totalFlags, 4);
  } else if (scaleMode === 'mega-screen') {
    // Prevent giant flags from stacking 30 deep and choking canvas fill-rate
    effectiveTotal = Math.min(totalFlags, 2);
  } else if (scaleMode === 'giant') {
    effectiveTotal = Math.min(totalFlags, 6);
  }

  // Stable, cached raster base glyph font size (never mutated frame-to-frame to prevent GPU texture re-allocations!)
  const RASTER_BASE_FONT = 120;
  ctx.font = `${RASTER_BASE_FONT}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < effectiveTotal; i++) {
    let flag = activeFlags[i];
    const flagSeed = seed * 43 + i * 89;

    // Morph transition effect for individual flags
    if (effect === 'morph-transform') {
      const morphStep = Math.floor(t * 0.35 + i * 0.35);
      const mIdx = Math.abs(seed * 11 + i * 19 + morphStep) % WORLD_FLAG_EMOJIS.length;
      flag = WORLD_FLAG_EMOJIS[mIdx].flag;
    }

    // Scale calculation
    let baseSize = 120;
    let isMegaHero = false;

    if (scaleMode === 'mega-screen') {
      baseSize = Math.max(w, h) * (0.65 + ((flagSeed % 40) / 100)); // 650px - 1100px!
      isMegaHero = true;
    } else if (scaleMode === 'giant') {
      baseSize = 240 + (flagSeed % 180); // 240px to 420px
    } else if (scaleMode === 'small') {
      baseSize = 38 + (flagSeed % 42); // 38px to 80px
    } else if (scaleMode === 'medium') {
      baseSize = 95 + (flagSeed % 75); // 95px to 170px
    } else {
      // 'mixed': dynamic hierarchy
      if (i === 0 && effectiveTotal > 2) {
        baseSize = Math.max(w, h) * 0.82;
        isMegaHero = true;
      } else if (i < 3) {
        baseSize = 180 + (flagSeed % 110);
      } else if (i > effectiveTotal - 5) {
        baseSize = 42 + (flagSeed % 35);
      } else {
        baseSize = 85 + (flagSeed % 70);
      }
    }

    // Size pulse
    const sizePulse = 0.94 + 0.12 * Math.sin(t * 1.8 + i);
    const targetSize = baseSize * sizePulse;

    // Motion position computation
    let x = 0;
    let y = 0;
    let rot = 0;
    let extraScale = 1;
    let motionAlpha = 1;

    const initX = ((i * (w / effectiveTotal) + (flagSeed % 160)) % (w * 0.88)) + w * 0.06;
    const initY = ((i * (h / effectiveTotal) + (flagSeed % 180)) % (h * 0.85)) + h * 0.08;

    if (motion === 'vortex') {
      // Cyclone swirl around center (smooth hypnotic orbit)
      const swirlProg = t * 0.65 + (i * Math.PI * 2) / effectiveTotal;
      const swirlDist = isMegaHero ? w * 0.14 : (w * 0.32) * (0.8 + 0.2 * Math.sin(t * 0.4 + i));
      x = w / 2 + Math.cos(swirlProg) * swirlDist;
      y = h / 2 + Math.sin(swirlProg) * (swirlDist * 0.65);
      rot = swirlProg * 0.25;
    } else if (motion === 'burst') {
      // Radial burst expanding from center with smooth birth & fade-out envelope (no popping!)
      const burstProg = ((t * 0.35) + (i / effectiveTotal)) % 1;
      const easeB = easeOutCubic(burstProg);
      const bAngle = (i * Math.PI * 2) / effectiveTotal + (seed % 10) * 0.1 + t * 0.05;
      const bDist = easeB * (Math.max(w, h) * (isMegaHero ? 0.22 : 0.58));
      x = w / 2 + Math.cos(bAngle) * bDist;
      y = h / 2 + Math.sin(bAngle) * bDist;
      rot = Math.sin(t * 1.8 + i) * 0.2;
      motionAlpha = Math.sin(burstProg * Math.PI);
    } else if (motion === 'rain') {
      // Falling from sky downwards with positive continuous modulo wrapping
      const fallSpeed = isMegaHero ? 35 : 75 + (i % 6) * 28;
      const spanY = h + targetSize * 2;
      const rawY = initY + t * fallSpeed;
      y = (((rawY % spanY) + spanY) % spanY) - targetSize;
      x = initX + Math.sin(t * 1.8 + i) * 28;
      rot = Math.sin(t * 1.5 + i) * 0.25;
    } else if (motion === 'zoom-3d') {
      // Emergence from 3D depth with smooth alpha envelope
      const zoomCycle = ((t * 0.38) + (i / effectiveTotal)) % 1;
      extraScale = 0.25 + Math.pow(zoomCycle, 2.0) * 1.8;
      x = w / 2 + (initX - w / 2) * (zoomCycle * 1.3);
      y = h / 2 + (initY - h / 2) * (zoomCycle * 1.3);
      rot = (zoomCycle - 0.5) * 0.35;
      motionAlpha = Math.sin(zoomCycle * Math.PI);
    } else if (motion === 'wave-banner') {
      // Ceremonial stadium drift with graceful wave
      x = initX + Math.sin(t * 1.0 + i) * 22;
      y = initY + Math.cos(t * 0.8 + i) * 16;
      rot = Math.sin(t * 2.0 + i) * 0.12;
    } else {
      // 'drift': natural floating drift with positive continuous modulo wrapping
      const speedY = isMegaHero ? -15 : -35 - (i % 4) * 18;
      const swayAmp = isMegaHero ? 18 : 30 + (flagSeed % 20);
      const swayFreq = 0.8 + (flagSeed % 8) * 0.1;
      const spanY = h + targetSize * 2;
      const rawY = initY + t * speedY;
      y = (((rawY % spanY) + spanY) % spanY) - targetSize;
      x = initX + Math.sin(t * swayFreq + i * 1.8) * swayAmp;
      rot = Math.sin(t * 0.9 + i) * 0.2;
    }

    // Cloth Wave / Wind Ripple Effect (smooth fluttering oscillation without heavy CPU matrix shear)
    const hasClothWave = effect === 'cloth-wave' || effect === 'all-fx';
    if (hasClothWave) {
      rot += Math.sin(t * 3.5 + i * 1.4) * 0.08;
      y += Math.cos(t * 3.2 + i * 1.2) * (targetSize * 0.05);
    }

    // Opacity calculation
    const flagOpacitySetting = typeof options?.flagsOpacity === 'number' ? options.flagsOpacity : 1.0;
    let finalAlpha = (isMegaHero ? 0.18 : 0.88) * flagOpacitySetting;
    if (effect === 'dissolve' || effect === 'all-fx' || effect === 'morph-transform') {
      const dissolveWave = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.4);
      finalAlpha *= dissolveWave;
    }
    finalAlpha *= motionAlpha;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Hardware GPU texture scale: ultra smooth, zero CPU font re-rasterization
    const glyphScale = (targetSize / RASTER_BASE_FONT) * extraScale;
    ctx.scale(glyphScale, glyphScale);

    // Glow Effect (only for smaller flags to ensure 60fps)
    if ((effect === 'glow' || effect === 'all-fx') && !isMegaHero && targetSize <= 120) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowBlur = 6;
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, finalAlpha));

    // Render Flag emoji using cached glyph
    ctx.fillText(flag, 0, 0);

    // Flicker Sparkles at the flag corners
    if ((effect === 'flicker' || effect === 'all-fx') && !isMegaHero) {
      const sparkleShimmer = Math.sin(t * 24 + i * 7);
      if (sparkleShimmer > 0.4) {
        ctx.fillStyle = '#ffffff';
        const sparkOffset = RASTER_BASE_FONT * 0.36;
        ctx.fillRect(-sparkOffset, -sparkOffset * 0.6, 3, 3);
        ctx.fillRect(sparkOffset, sparkOffset * 0.6, 3, 3);
      }
    }

    ctx.restore();
  }
}
