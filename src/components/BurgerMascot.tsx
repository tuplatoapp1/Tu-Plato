import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface BurgerMascotProps {
  level: number;
  className?: string;
  customImage?: string;
  customVideo?: string;
}

export function BurgerMascot({ level, className = '', customImage, customVideo }: BurgerMascotProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMid = level >= 3 && level < 6;
  const isVip = level >= 6;

  // Determine which video to play based on level
  const defaultVideo = isVip 
    ? '/assets/mascot/level6.webm' 
    : (isMid ? '/assets/mascot/level3.webm' : '/assets/mascot/level1.webm');

  const videoSrc = customVideo || defaultVideo;

  // Ensure video plays correctly on source change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoSrc]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Priority 1: Custom Video */}
      {customVideo ? (
        <video
          ref={videoRef}
          key={customVideo}
          autoPlay
          loop
          muted
          playsInline
          className="relative z-20 w-full h-full object-contain pointer-events-none"
        >
          <source src={customVideo} type="video/webm" />
        </video>
      ) : customImage ? (
        /* Priority 2: Custom Image */
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          src={customImage}
          alt={`Mascota Nivel ${level}`}
          className="relative z-20 w-full h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Priority 3: Default Video with SVG Fallback */
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            key={defaultVideo}
            autoPlay
            loop
            muted
            playsInline
            className="relative z-20 w-full h-full object-contain pointer-events-none"
          >
            <source src={defaultVideo} type="video/webm" />
            <MascotFallback level={level} />
          </video>
        </div>
      )}
    </div>
  );
}

// --- Fallback SVG Implementation (Simplified version of Option 2) ---
function MascotFallback({ level }: { level: number }) {
  const isMid = level >= 3 && level < 6;
  const isVip = level >= 6;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 scale-75">
      <svg width="100%" height="100%" viewBox="0 0 100 120" className="overflow-visible">
        <defs>
          <radialGradient id="fallbackGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff176" />
            <stop offset="100%" stopColor="#ff6d00" />
          </radialGradient>
        </defs>
        <motion.path
          d="M50,110 Q20,110 10,75 Q0,40 25,25 Q40,5 50,25 Q60,5 75,25 Q100,40 90,75 Q80,110 50,110 Z"
          fill="url(#fallbackGrad)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>
      {isVip && <span className="absolute -top-4 text-2xl">👑</span>}
      {isMid && <span className="absolute -right-4 top-1/2 text-2xl">🍳</span>}
    </div>
  );
}
