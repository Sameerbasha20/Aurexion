import React, { useRef } from "react";

interface HeroVideoBackgroundProps {
  videoUrl?: string;
  poster?: string;
  className?: string;
}

export const HeroVideoBackground: React.FC<HeroVideoBackgroundProps> = ({
  videoUrl = "/videos/hero-bg.mp4",
  poster,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className={`hero-video-container absolute inset-0 pointer-events-none overflow-hidden z-[-3] ${className}`}>
      {/* 4K Video Stream */}
      {videoUrl && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-80 transform-gpu"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          poster={poster}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Subtle, balanced dark overlay across the entire video */}
      <div className="absolute inset-0 bg-[#050811]/35 pointer-events-none" />

      {/* Directional gradient so text on the left stays crisp and legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050811]/80 via-[#050811]/30 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroVideoBackground;






