import React, { useEffect, useRef, useState } from 'react';

export function formatTimeHHMMSS(seconds: number): string {
  const sec = Math.max(0, seconds || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

interface VideoScrubberPopoverProps {
  currentTime?: number;
  getCurrentTime?: () => number;
  totalDuration: number;
  onSeek: (targetTime: number) => void;
  onClose?: () => void;
}

export const VideoScrubberPopover: React.FC<VideoScrubberPopoverProps> = ({
  currentTime = 0,
  getCurrentTime,
  totalDuration,
  onSeek,
}) => {
  const dur = Math.max(0.1, totalDuration || 1);
  const getTimeVal = () => (getCurrentTime ? getCurrentTime() : currentTime);

  const [displayTime, setDisplayTime] = useState<number>(() => getTimeVal());
  const isDraggingRef = useRef<boolean>(false);

  // Smooth 60fps animation loop for scrubber slider position sync
  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
      if (!isDraggingRef.current) {
        setDisplayTime(getTimeVal());
      }
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [getCurrentTime, currentTime]);

  const progressPercent = Math.min(100, Math.max(0, (displayTime / dur) * 100));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDisplayTime(val);
    onSeek(val);
  };

  return (
    <div
      className="absolute bottom-16 sm:bottom-20 inset-x-0 w-full px-3 sm:px-6 z-40 pointer-events-auto select-none transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Centered Time Badge in middle of screen with maximally transparent background */}
      <div className="flex justify-center items-center mb-1.5">
        <span className="font-mono text-xs sm:text-sm font-bold text-white bg-black/25 backdrop-blur-xs px-3 py-0.5 rounded-full border border-white/15 tracking-wider shadow-sm [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]">
          {formatTimeHHMMSS(displayTime)} &mdash; {formatTimeHHMMSS(totalDuration)}
        </span>
      </div>

      {/* Full-Width Frameless Range Slider directly over video background */}
      <div className="relative flex items-center px-1">
        {/* Semi-transparent fill track */}
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 rounded-l-full pointer-events-none z-10 opacity-90"
          style={{ width: `${progressPercent}%` }}
        />

        <input
          type="range"
          min="0"
          max={dur}
          step="0.02"
          value={displayTime}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp}
          onChange={handleSliderChange}
          onInput={handleSliderChange}
          className="w-full accent-purple-400 bg-white/25 h-2.5 rounded-full cursor-pointer relative z-20 appearance-none focus:outline-none touch-none opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};
