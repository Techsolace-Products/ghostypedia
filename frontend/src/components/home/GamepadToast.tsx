"use client";

import { Gamepad2 } from "lucide-react";

interface GamepadToastProps {
  isActive: boolean;
}

export default function GamepadToast({ isActive }: GamepadToastProps) {
  return (
    <div className={`fixed top-4 right-4 z-[11000] transition-transform duration-500 ${isActive ? 'translate-x-0' : 'translate-x-64'}`}>
      <div className="bg-white text-black px-4 py-2 flex items-center gap-3 font-mono text-xs font-bold tracking-widest border-2 border-green-500">
        <Gamepad2 size={16} className="text-green-500" />
        <span>CONTROLLER ACTIVE</span>
      </div>
    </div>
  );
}
