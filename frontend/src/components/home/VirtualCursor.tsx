"use client";

interface VirtualCursorProps {
  isActive: boolean;
  position: { x: number; y: number };
}

export default function VirtualCursor({ isActive, position }: VirtualCursorProps) {
  if (!isActive) return null;

  return (
    <div 
      className="fixed pointer-events-none z-[10001] transition-transform duration-75"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full opacity-30 blur-md animate-pulse" />
        <div className="relative w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-[2px] bg-red-500/50" />
          <div className="w-[2px] h-12 bg-red-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
