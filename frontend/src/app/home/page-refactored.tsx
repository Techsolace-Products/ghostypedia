"use client";

import { useState } from "react";
import GlobalStyles from "@/components/home/GlobalStyles";
import VirtualCursor from "@/components/home/VirtualCursor";
import GamepadToast from "@/components/home/GamepadToast";
import LoginModal from "@/components/home/LoginModal";
import { useGamepad } from "@/hooks/useGamepad";
import { GHOSTS } from "@/data/ghosts";

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isConnected: isControllerActive, cursorPos } = useGamepad(isLoginOpen, () => setIsLoginOpen(false));

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-red-500/30 selection:text-red-200">
      <GlobalStyles />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <VirtualCursor isActive={isControllerActive} position={cursorPos} />
      <GamepadToast isActive={isControllerActive} />

      {/* Your main content here */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">GHOSTYPEDIA</h1>
          <p className="text-xl text-gray-400">Paranormal Database System</p>
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="mt-8 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider transition-colors"
          >
            Agent Login
          </button>
        </div>
      </div>
    </div>
  );
}
