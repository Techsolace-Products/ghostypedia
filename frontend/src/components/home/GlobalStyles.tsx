"use client";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
      html { scroll-behavior: smooth; }
      body { overflow-x: hidden; width: 100%; background-color: #050505; }
      
      .hide-scroll::-webkit-scrollbar { display: none; }
      .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

      @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
      }

      :focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 4px;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          border-radius: 2px;
      }

      .active-click {
          transform: scale(0.95);
          background-color: rgba(255, 255, 255, 0.2) !important;
      }

      .gamepad-hover {
          outline: 3px solid #ef4444 !important;
          outline-offset: 4px;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.6) !important;
          transform: scale(1.02);
          transition: all 0.15s ease;
      }
    `}</style>
  );
}
