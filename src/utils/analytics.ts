/**
 * Google Analytics (GA4 gtag.js) Event Tracking Utility
 * 
 * Safe, non-blocking telemetry wrapper for Google Analytics.
 * All calls are wrapped in try/catch and verify window.gtag exists.
 * If gtag is blocked by adblocker or unavailable, app continues with zero impact.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Universal safe event tracking function
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    // Fail silently to never interrupt user interaction or rendering
  }
}

/**
 * 1. Export MP4 Video Tracking
 */
export function trackExportMp4Start(params: {
  durationSec?: number;
  aspectRatio?: string;
  animationStyle?: string;
}): void {
  trackEvent('export_mp4_start', {
    event_category: 'Export',
    event_label: params.animationStyle || 'default',
    duration_sec: params.durationSec ? Math.round(params.durationSec) : undefined,
    aspect_ratio: params.aspectRatio,
    animation_style: params.animationStyle,
  });
}

export function trackExportMp4Success(params: {
  durationSec?: number;
  aspectRatio?: string;
  animationStyle?: string;
  fileExtension?: string;
}): void {
  trackEvent('export_mp4_success', {
    event_category: 'Export',
    event_label: `${params.animationStyle || 'default'} (${params.aspectRatio || '9:16'})`,
    value: params.durationSec ? Math.round(params.durationSec) : 1,
    duration_sec: params.durationSec ? Math.round(params.durationSec) : undefined,
    aspect_ratio: params.aspectRatio,
    animation_style: params.animationStyle,
    file_extension: params.fileExtension || 'mp4',
  });
}

/**
 * 2. Screen & Canvas Recording (WebM Fix)
 */
export function trackRecordWebm(
  action: 'start' | 'complete' | 'download',
  params: { durationSec?: number } = {}
): void {
  trackEvent(`record_webm_${action}`, {
    event_category: 'Recording',
    event_label: `WebM ${action}`,
    duration_sec: params.durationSec ? Math.round(params.durationSec) : undefined,
  });
}

/**
 * 3. Media Upload Tracking (Video, Audio, Image)
 */
export function trackMediaUpload(params: {
  mediaType: 'video' | 'audio' | 'image';
  fileName?: string;
  sizeBytes?: number;
}): void {
  const sizeMb = params.sizeBytes ? +(params.sizeBytes / (1024 * 1024)).toFixed(2) : undefined;
  trackEvent('upload_media', {
    event_category: 'Media',
    event_label: `${params.mediaType}: ${params.fileName || 'file'}`,
    media_type: params.mediaType,
    file_name: params.fileName,
    size_mb: sizeMb,
  });
}

/**
 * 4. Preset Application (shows which presets in catalog are used most frequently)
 */
export function trackApplyPreset(params: {
  presetId: string;
  presetName: string;
  category?: string;
  isBuiltIn: boolean;
}): void {
  trackEvent('apply_preset', {
    event_category: 'Presets',
    event_label: params.presetName,
    preset_id: params.presetId,
    preset_name: params.presetName,
    preset_category: params.category || 'General',
    is_builtin: params.isBuiltIn,
  });
}

/**
 * 5. Custom Presets Saved & Exported / Imported
 */
export function trackSavePreset(params: {
  presetName: string;
  author?: string;
  category?: string;
}): void {
  trackEvent('save_preset', {
    event_category: 'Presets',
    event_label: params.presetName,
    preset_name: params.presetName,
    preset_author: params.author,
    preset_category: params.category || 'Custom',
  });
}

export function trackExportPreset(params: {
  presetName: string;
}): void {
  trackEvent('export_preset', {
    event_category: 'Presets',
    event_label: params.presetName,
    preset_name: params.presetName,
  });
}

export function trackImportPreset(params: {
  presetName?: string;
}): void {
  trackEvent('import_preset', {
    event_category: 'Presets',
    event_label: params.presetName || 'Imported Preset',
    preset_name: params.presetName,
  });
}

/**
 * 6. Background Themes & Procedural / Audio Generation
 */
export function trackSelectBgTheme(params: {
  presetId: string;
  name?: string;
}): void {
  trackEvent('select_bg_theme', {
    event_category: 'Theme',
    event_label: params.name || params.presetId,
    theme_id: params.presetId,
  });
}

export function trackSelectMusicPreset(params: {
  presetId: string;
}): void {
  trackEvent('select_music_preset', {
    event_category: 'Music',
    event_label: params.presetId,
    preset_id: params.presetId,
  });
}
