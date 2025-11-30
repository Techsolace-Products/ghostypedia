"use client";

import { useEffect, useState } from "react";

const videos = [
  "/background1.mp4",
  "/background2.mp4",
  "/background3.mp4",
];

export default function VideoBackground() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [nextVideo, setNextVideo] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setNextVideo((currentVideo + 1) % videos.length);

      setTimeout(() => {
        setCurrentVideo((currentVideo + 1) % videos.length);
        setIsTransitioning(false);
      }, 1000);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentVideo]);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Current Video */}
      <video
        key={`current-${currentVideo}`}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <source src={videos[currentVideo]} type="video/mp4" />
      </video>

      {/* Next Video (for smooth transition) */}
      {isTransitioning && (
        <video
          key={`next-${nextVideo}`}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videos[nextVideo]} type="video/mp4" />
        </video>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content Area */}
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">Ghostypedia</h1>
          <p className="text-xl">Explore the paranormal world</p>
        </div>
      </div>
    </main>
  );
}
