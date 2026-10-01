import { AnimationStyle, TextMode, TextSegment } from '../types';

/**
 * Calculates effective speed curve:
 * - At slider = 0.1: 0.5 seconds per word / unit pace ("0.1 это 0.5 секунды")
 * - At slider = 3.0: 2x faster than previous 3.0 speed (~0.115s vs previous 0.233s)
 */
export function getEffectiveSpeed(speedMultiplier: number): {
  speedFactor: number;
  wordDuration: number;
  unitDuration: number;
} {
  const s = Math.max(0.1, Math.min(3.0, speedMultiplier));
  const t = (s - 0.1) / 2.9;

  // At s = 0.1 (min speed): 3.0 seconds per unit (character, word, sentence, or text block)
  // At s = 3.0 (max speed): 0.115 seconds per unit (unchanged maximum speed)
  const unitDuration = 3.0 - t * (3.0 - 0.115);
  const wordDuration = unitDuration;
  const speedFactor = 0.7 / unitDuration;

  return { speedFactor, wordDuration, unitDuration };
}

function getChunkNaturalDuration(
  text: string,
  words: string[],
  speedMultiplier: number,
  pause: number,
  style?: AnimationStyle
): number {
  const { speedFactor, wordDuration, unitDuration } = getEffectiveSpeed(speedMultiplier);

  if (style === 'typewriter') {
    const totalChars = Math.max(1, text.trim().length);
    const s = Math.max(0.1, Math.min(3.0, speedMultiplier));
    const t = (s - 0.1) / 2.9;
    const charsPerSec = (1 / 3.0) + t * (43.48 - (1 / 3.0));
    const typingDuration = totalChars / charsPerSec;
    const readingPause = Math.max(0.8, pause);
    return typingDuration + readingPause;
  }
  if (style === 'words') {
    const totalWords = Math.max(1, words.length);
    const wordsDuration = totalWords * wordDuration;
    const readingPause = Math.max(0.8, pause);
    return wordsDuration + readingPause;
  }
  // Fade, Slide, Zoom, Glitch, Bounce, Curves, Assemble, Disperse, Tumble, Wave, Stomp, Fall, Blur, Swarm:
  // Entrance transition + unit reading time
  const entrance = Math.min(2.5, 0.65 / speedFactor);
  const reading = Math.max(unitDuration, 0.8 + words.length * wordDuration);
  return entrance + reading;
}

export function splitTextIntoSegments(
  rawText: string,
  mode: TextMode,
  speedMultiplier: number = 1.0,
  pauseBetweenSeconds: number = 0.8,
  targetDuration?: number,
  animationStyle?: AnimationStyle
): { segments: TextSegment[]; totalDuration: number } {
  const clean = rawText.trim();
  if (!clean) {
    const dur = targetDuration && targetDuration > 0 ? targetDuration : 3;
    return {
      segments: [],
      totalDuration: dur,
    };
  }

  const speed = Math.max(0.1, Math.min(3.0, speedMultiplier));
  const pause = Math.max(0.1, pauseBetweenSeconds);
  const baseSegments: TextSegment[] = [];
  let currentTime = 0;

  if (mode === 'word') {
    // Split into individual words
    const words = clean.split(/\s+/).filter(Boolean);
    const { speedFactor, wordDuration } = getEffectiveSpeed(speed);
    const wordPause = pause * 0.3;

    words.forEach((word) => {
      const extraPause = /[.!?]$/.test(word) ? 0.25 / speedFactor : 0;
      const duration = Math.max(0.1, wordDuration + extraPause);
      const startTime = currentTime;
      const endTime = startTime + duration;

      baseSegments.push({
        text: word,
        words: [word],
        startTime,
        endTime,
        duration,
      });

      currentTime = endTime + wordPause;
    });
  } else if (mode === 'sentence') {
    // Split by sentence delimiters (. ! ? \n)
    const rawSentences = clean
      .split(/(?<=[.!?\n])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // If no sentence delimiters were found, split by commas or line breaks if long
    const finalSentences: string[] = [];
    rawSentences.forEach((sentence) => {
      if (sentence.length > 90) {
        const parts = sentence.split(/,\s+/);
        if (parts.length > 1) {
          parts.forEach((p, idx) => {
            finalSentences.push(idx < parts.length - 1 ? `${p},` : p);
          });
        } else {
          finalSentences.push(sentence);
        }
      } else {
        finalSentences.push(sentence);
      }
    });

    finalSentences.forEach((sentence) => {
      const words = sentence.split(/\s+/).filter(Boolean);
      const readTime = getChunkNaturalDuration(sentence, words, speed, pause, animationStyle);
      const startTime = currentTime;
      const endTime = startTime + readTime;

      baseSegments.push({
        text: sentence,
        words,
        startTime,
        endTime,
        duration: readTime,
      });

      currentTime = endTime + pause;
    });
  } else if (mode === 'paragraph') {
    // Split by paragraph delimiters (newlines: \n+)
    const rawParagraphs = clean
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    // If no paragraph breaks were found (single block), treat as 1 segment (full text)
    const finalParagraphs = rawParagraphs.length > 0 ? rawParagraphs : [clean];

    finalParagraphs.forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      const readTime = getChunkNaturalDuration(paragraph, words, speed, pause, animationStyle);
      const startTime = currentTime;
      const endTime = startTime + readTime;

      baseSegments.push({
        text: paragraph,
        words,
        startTime,
        endTime,
        duration: readTime,
      });

      currentTime = endTime + pause;
    });
  } else {
    // Full text mode
    const words = clean.split(/\s+/).filter(Boolean);
    const readTime = getChunkNaturalDuration(clean, words, speed, pause, animationStyle);
    const startTime = 0;
    const endTime = startTime + readTime;

    baseSegments.push({
      text: clean,
      words,
      startTime,
      endTime,
      duration: readTime,
    });

    currentTime = endTime + 0.5;
  }

  const naturalDuration = Math.max(1.0, currentTime);

  // If no targetDuration is specified or targetDuration is virtually equal to natural, return natural
  if (!targetDuration || targetDuration <= 0 || Math.abs(targetDuration - naturalDuration) < 0.1) {
    return { segments: baseSegments, totalDuration: naturalDuration };
  }

  // When targetDuration is specified (e.g. 16s background video):
  // Proportionally distribute all segments across the entire targetDuration so the text pacing
  // smoothly fills the whole video from 0:00 to the end, eliminating premature freezes and rushed typing!
  if (baseSegments.length === 1 || mode === 'full') {
    const seg = baseSegments[0];
    return {
      segments: [
        {
          text: seg.text,
          words: seg.words,
          startTime: 0,
          endTime: targetDuration,
          duration: targetDuration,
        },
      ],
      totalDuration: targetDuration,
    };
  }

  const scaleRatio = targetDuration / naturalDuration;
  const scaledSegments: TextSegment[] = [];
  let cursor = 0;

  for (let i = 0; i < baseSegments.length; i++) {
    const base = baseSegments[i];
    const scaledDuration = Math.max(0.3, base.duration * scaleRatio);
    const startTime = cursor;
    const endTime = i === baseSegments.length - 1 ? targetDuration : startTime + scaledDuration;

    scaledSegments.push({
      text: base.text,
      words: base.words,
      startTime,
      endTime,
      duration: Math.max(0.3, endTime - startTime),
    });

    if (i < baseSegments.length - 1) {
      const nextBase = baseSegments[i + 1];
      const basePause = Math.max(0.1, nextBase.startTime - base.endTime);
      const scaledPause = Math.max(0.1, basePause * scaleRatio);
      cursor = endTime + scaledPause;
    } else {
      cursor = endTime;
    }
  }

  return { segments: scaledSegments, totalDuration: targetDuration };
}
