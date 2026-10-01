export type TextMode = 'word' | 'sentence' | 'paragraph' | 'full';

export type AnimationStyle =
  | 'typewriter'
  | 'words'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'glitch'
  | 'bounce'
  | 'curves'
  | 'assemble'
  | 'disperse'
  | 'tumble'
  | 'wave'
  | 'stomp'
  | 'fall'
  | 'blur'
  | 'swarm';

export type TextColorMode =
  | 'solid'
  | 'gradient'
  | 'letter-rainbow'
  | 'word-rainbow'
  | 'letter-random'
  | 'word-random';

export interface ExtraEffects {
  glow: boolean;
  sparkle: boolean;
  fire: boolean;
  neon: boolean;
  shadow: boolean;
  particles: boolean;
  sparkler?: boolean; // Бенгальский огонь
  firework?: boolean; // Фейерверк
  smoke?: boolean; // Дым
  smokeColor?: string; // Color / palette mode for smoke
}

export type AspectRatio = '9:16' | '16:9' | '1:1';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: string;
  sampleText: string;
  cyrillicSupport: boolean;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'gradient' | 'procedural' | 'animated';
  colors: string[];
  description: string;
}

export interface TextSegment {
  text: string;
  words: string[];
  startTime: number;
  endTime: number;
  duration: number;
}

export type AudioSourceType = 'none' | 'video' | 'file' | 'generator';

export type MusicPresetId =
  | 'neo-classical-piano'
  | 'atmospheric-ambient'
  | 'deep-chillout'
  | 'minimalist-harp-strings'
  | 'lofi-chill'
  | 'synthwave-retro'
  | 'deep-ambient'
  | 'epic-drive'
  | 'phonk-energy'
  | 'acoustic-warmth'
  | 'funny'
  | 'heroic'
  | 'notes'
  | 'lightning';

export interface AudioState {
  enabled: boolean;
  sourceType: AudioSourceType;
  audioUrl: string | null;
  audioFileName: string | null;
  presetId: MusicPresetId;
  seed?: number; // Random seed for truly unique procedural music composition
  volume: number; // 0 to 1 (Music volume)
  musicVolume?: number; // 0 to 1 (Music volume alias)
  loop: boolean;
  audioDuration: number;
  // Dual & Triple-layer audio controls
  videoAudioEnabled?: boolean; // When true, background video audio track is active
  videoVolume?: number; // 0 to 1 (Video original voice/sound volume)
  fileAudioEnabled?: boolean; // When true, user-uploaded audio track is active
  fileVolume?: number; // 0 to 1 (User uploaded audio file / voice volume)
}

export type MatrixDirection =
  | 'top-down'
  | 'bottom-up'
  | 'left-right'
  | 'right-left'
  | 'edges-to-center'
  | 'center-to-edges';

export type MatrixColorTheme =
  | 'classic-green'
  | 'cyber-cyan'
  | 'neon-purple'
  | 'amber-gold'
  | 'red-alert'
  | 'rainbow'
  | 'random-shift';

export type FireworksColorTheme =
  | 'multicolor'
  | 'gold-glitter'
  | 'neon-cyber'
  | 'crimson-ruby'
  | 'cyan-violet'
  | 'emerald-lime';

export type FlagsCompositionMode = 'single' | 'duo' | 'multi';

export type FlagsScaleMode =
  | 'mixed'
  | 'small'
  | 'medium'
  | 'giant'
  | 'mega-screen';

export type FlagsMotionStyle =
  | 'drift'
  | 'vortex'
  | 'burst'
  | 'rain'
  | 'zoom-3d'
  | 'wave-banner';

export type FlagsEffect =
  | 'glow'
  | 'dissolve'
  | 'flicker'
  | 'cloth-wave'
  | 'all-fx'
  | 'morph-transform';

export type FlagsBgStyle =
  | 'dark-space'
  | 'stadium'
  | 'neon-glow'
  | 'cyber-grid'
  | 'flag-blur'
  | 'vertical-cloth'
  | 'flags-morph';

export type CloudsSkyStyle =
  | 'sunset-fiery'
  | 'azure-noon'
  | 'deep-sky'
  | 'golden-hour'
  | 'twilight-purple';

export type ProceduralMoodStyle =
  | 'cosmic'
  | 'cyberpunk'
  | 'ember'
  | 'nature'
  | 'gold'
  | 'fluid'
  | 'equalizer'
  | 'shapes'
  | 'emojis'
  | 'matrix'
  | 'fireworks'
  | 'flags'
  | 'clouds';

export interface VideoProjectState {
  // Background
  bgType: 'none' | 'image' | 'video' | 'preset';
  bgMediaUrl: string | null;
  bgMediaType: 'image' | 'video' | null;
  bgPresetId: string;
  bgCustomColor?: string; // Optional custom sheet / gradient color
  proceduralMood?: ProceduralMoodStyle; // AI Procedural generator mood style
  proceduralSeed?: number; // Seed variation for unique generated background
  matrixDirection?: MatrixDirection; // Direction of matrix code rain
  matrixColorTheme?: MatrixColorTheme; // Color scheme of matrix rain
  fireworksColorTheme?: FireworksColorTheme; // Color scheme for fireworks background
  fireworksCount?: number; // 1 to 30 simultaneous fireworks
  fireworksScaleMode?: 'mixed' | 'small' | 'medium' | 'giant'; // Scale mode
  // Flags procedural theme options
  flagsMode?: FlagsCompositionMode; // 'single' (1 country), 'duo' (2 countries), 'multi' (3..30 nations)
  flagsCount?: number; // 1 to 30 simultaneous flags
  flagsScaleMode?: FlagsScaleMode; // 'mixed' | 'small' | 'medium' | 'giant' | 'mega-screen'
  flagsPrimaryCountry?: string; // Primary flag emoji (e.g. 🇷🇺)
  flagsSecondaryCountry?: string; // Secondary flag emoji (e.g. 🇧🇾)
  flagsMotion?: FlagsMotionStyle; // 'drift' | 'vortex' | 'burst' | 'rain' | 'zoom-3d' | 'wave-banner'
  flagsEffect?: FlagsEffect; // 'glow' | 'dissolve' | 'flicker' | 'cloth-wave' | 'all-fx' | 'morph-transform'
  flagsBgStyle?: FlagsBgStyle; // 'dark-space' | 'stadium' | 'neon-glow' | 'cyber-grid' | 'flag-blur' | 'vertical-cloth' | 'flags-morph'
  flagsGrain?: boolean; // Grain & fabric weave texture overlay
  // Clouds theme options (legacy compatibility)
  cloudsStyle?: CloudsSkyStyle;
  cloudsSpeed?: number;
  cloudsFeather?: number;
  bgOverlayOpacity: number; // 0 to 0.9
  mediaOverlayTheme?: string | null; // Theme ID for floating particles/elements overlay on user media (hearts, balloons, snow, etc.)
  mediaColorTint?: string | null; // Color tint overlay for user media

  // Audio / Music
  audio: AudioState;

  // Text
  rawText: string;
  authorText: string;
  textMode: TextMode;
  fontFamily: string;
  fontSize: number; // in pt/px base
  textColor: string;
  textOpacity?: number; // 0.05 to 1.0 (default 1.0)
  textColorMode?: TextColorMode; // 'solid' | 'gradient' | 'letter-rainbow' | 'word-rainbow'
  textGradientColors?: [string, string]; // e.g. ['#f43f5e', '#38bdf8']
  textGradientAngle?: number; // 0, 45, 90, 135, etc.
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  textAlign: 'center' | 'left' | 'right';
  textPosition: 'center' | 'top' | 'bottom';
  textPositionY: number; // 15 to 85 (default 50% - vertical center)
  textPositionX?: number; // 10 to 90 (default 50% - horizontal center)
  isUppercase: boolean;

  // Text Background Plate (Plashka) & Box Width
  textBgEnabled?: boolean;
  textBgColor?: string;
  textBgOpacity?: number;
  textBgPadding?: number;
  textBgRadius?: number;
  textMaxWidthPercent?: number;

  // Animation & Effects
  animationStyle: AnimationStyle;
  effects: ExtraEffects;
  neonColor: string;
  speedMultiplier: number; // 0.1 to 3.0
  pauseBetweenSeconds: number; // 0.2 to 3.0
  syncWithVideo?: boolean; // When true and video background is present, text animates smoothly across video length
  textLoopMode?: 'stretch' | 'loop'; // Whether to stretch text pacing across video or loop text every cycle

  // Canvas & Output
  aspectRatio: AspectRatio;
}
